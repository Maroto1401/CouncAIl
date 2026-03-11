from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from agents import CHARACTERS, DAN, MODERATOR_PROMPT
import httpx
import json
import os

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def add_cors(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.options("/{rest_of_path:path}")
async def preflight(rest_of_path: str):
    return JSONResponse(content={}, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    })

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"


# ── Models ────────────────────────────────────────────────────

class CharacterConfig(BaseModel):
    id: str
    name: str
    title: str
    emoji: str
    color: str
    prompt: str

class ContextRequest(BaseModel):
    question: str
    characters: List[CharacterConfig]

class DebateRoundRequest(BaseModel):
    question: str
    characters: List[CharacterConfig]
    round: int  # 1 or 2
    context: Dict[str, str] = {}   # user answers to Dan's context questions
    checkin_answer: Optional[str] = None  # user answer after round 1
    history: List[Dict] = []

class CheckinRequest(BaseModel):
    question: str
    characters: List[CharacterConfig]
    history: List[Dict]
    context: Dict[str, str] = {}
    round: int = 1

class VerdictRequest(BaseModel):
    question: str
    history: List[Dict]
    context: Dict[str, str] = {}
    checkin_answer: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────

def sanitize(text: str) -> str:
    if len(text) > 1500:
        raise HTTPException(status_code=400, detail="Input too long")
    banned = ["ignore previous", "ignore all", "system prompt", "jailbreak", "you are now"]
    for phrase in banned:
        if phrase.lower() in text.lower():
            raise HTTPException(status_code=400, detail="Invalid input")
    return text.strip()

async def call_groq(messages: list, max_tokens: int = 350) -> str:
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": MODEL, "messages": messages, "max_tokens": max_tokens, "temperature": 0.85, "stream": False}
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(GROQ_URL, headers=headers, json=payload)
        data = response.json()
        if "choices" not in data:
            raise HTTPException(status_code=500, detail=f"Groq error: {data}")
        return data["choices"][0]["message"]["content"].strip()

def parse_json_response(raw: str) -> dict:
    cleaned = raw.strip()
    if "```" in cleaned:
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except:
        # Try to find JSON object in the string
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return json.loads(cleaned[start:end])
            except:
                pass
        return {}

def build_transcript(history: List[Dict]) -> str:
    lines = []
    for turn in history:
        if turn.get("type") == "agent":
            lines.append(f"{turn['emoji']} {turn['name']} ({turn['title']}): {turn['text']}")
        elif turn.get("type") == "user_context":
            lines.append(f"[User context: {turn['text']}]")
    return "\n\n".join(lines)

def build_user_context_summary(context: Dict[str, str], checkin_answer: Optional[str]) -> str:
    parts = []
    if context:
        for q, a in context.items():
            parts.append(f"Q: {q} → A: {a}")
    if checkin_answer:
        parts.append(f"Mid-debate clarification: {checkin_answer}")
    return "\n".join(parts) if parts else ""


# ── Routes ────────────────────────────────────────────────────

@app.get("/characters")
async def get_characters():
    return {
        cid: {
            "id": c["id"],
            "name": c["name"],
            "title": c["title"],
            "emoji": c["emoji"],
            "color": c["color"],
            "description": c["description"],
            "lens": c["lens"],
        }
        for cid, c in CHARACTERS.items()
    }

@app.get("/dan")
async def get_dan():
    return {k: v for k, v in DAN.items() if k != "prompt"}


@app.post("/debate/context")
@limiter.limit("30/minute")
async def get_context_questions(request: Request, req: ContextRequest):
    """Dan asks the user 1-2 context questions before the debate starts."""
    req.question = sanitize(req.question)
    character_names = ", ".join([f"{c.emoji} {c.name} the {c.title}" for c in req.characters])

    messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": (
            f"A user has brought this question to the council: \"{req.question}\"\n\n"
            f"The debaters are: {character_names}\n\n"
            f"PHASE 0: Ask the user 1-2 short context questions to understand their personal situation before the debate. "
            f"Respond ONLY with valid JSON in this format: {{\"phase\": \"context\", \"questions\": [\"q1\", \"q2\"]}}"
        )}
    ]
    raw = await call_groq(messages, max_tokens=200)
    result = parse_json_response(raw)
    return {"questions": result.get("questions", ["What's your current situation regarding this question?"])}


@app.post("/debate/round")
@limiter.limit("20/minute")
async def debate_round(request: Request, req: DebateRoundRequest):
    """Run one debate round. Each character responds sequentially, seeing previous responses."""
    req.question = sanitize(req.question)

    user_context = build_user_context_summary(req.context, req.checkin_answer)
    prior_transcript = build_transcript(req.history)

    turns = []
    running_transcript = prior_transcript

    for char in req.characters:
        # Find the full prompt from CHARACTERS
        char_data = CHARACTERS.get(char.id)
        if not char_data:
            continue

        if req.round == 1:
            instruction = (
                f"ROUND 1 — Opening position.\n"
                f"The question is: \"{req.question}\"\n"
                f"{'User context: ' + user_context if user_context else ''}\n\n"
                f"State your opening position through YOUR lens ({char_data['lens']}). "
                f"Ground it in something concrete — a real pattern, example, known risk, or insight. "
                f"Make it specific to this user's situation if context was provided. "
                f"3-5 sentences. Speak in your character's voice."
            )
        else:
            instruction = (
                f"ROUND 2 — Direct engagement.\n"
                f"The question is: \"{req.question}\"\n"
                f"{'User context: ' + user_context if user_context else ''}\n\n"
                f"What has been said so far:\n{running_transcript}\n\n"
                f"You MUST directly respond to at least one specific point made by another debater — name them. "
                f"Either challenge their reasoning, build on it, or reframe it through YOUR lens ({char_data['lens']}). "
                f"If your view has shifted, say so. If you still disagree, defend it with a concrete reason. "
                f"3-5 sentences. Speak in your character's voice."
            )

        messages = [
            {"role": "system", "content": char_data["prompt"]},
            {"role": "user", "content": instruction}
        ]

        text = await call_groq(messages, max_tokens=300)

        change_signals = ["changed my mind", "i now agree", "i concede", "you've convinced me", "i was wrong", "i update my", "fair point, i"]
        position_updated = any(s in text.lower() for s in change_signals)

        turn = {
            "type": "agent",
            "id": char.id,
            "name": char.name,
            "title": char.title,
            "emoji": char.emoji,
            "color": char.color,
            "text": text,
            "position_updated": position_updated,
            "round": req.round,
        }
        turns.append(turn)
        # Add to running transcript so next character sees it
        running_transcript += f"\n\n{char.emoji} {char.name} ({char.title}): {text}"

    return {"turns": turns, "round": req.round}


@app.post("/debate/checkin")
@limiter.limit("20/minute")
async def debate_checkin(request: Request, req: CheckinRequest):
    """Dan summarizes Round 1 and asks one follow-up question."""
    req.question = sanitize(req.question)
    transcript = build_transcript(req.history)
    user_context = build_user_context_summary(req.context, None)

    messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": (
            f"Topic: \"{req.question}\"\n"
            f"{'User context: ' + user_context if user_context else ''}\n\n"
            f"Round 1 transcript:\n{transcript}\n\n"
            f"PHASE 1: Summarize the key tensions in 2-3 bullets (name debaters specifically). "
            f"Then ask ONE follow-up question about the user's values, fears, or situation — not technical expertise. "
            f"Respond ONLY with valid JSON: {{\"phase\": \"checkin\", \"summary\": [\"b1\", \"b2\"], \"question\": \"one question\"}}"
        )}
    ]
    raw = await call_groq(messages, max_tokens=350)
    result = parse_json_response(raw)

    needs_more = result.get("needs_more_round", False)
    # Force no more rounds after round 3
    if req.round >= 3:
        needs_more = False
    return {
        "summary": result.get("summary", []),
        "question": result.get("question") if needs_more else None,
        "needs_more_round": needs_more,
    }


@app.post("/debate/verdict")
@limiter.limit("20/minute")
async def debate_verdict(request: Request, req: VerdictRequest):
    """Dan delivers the final verdict."""
    req.question = sanitize(req.question)
    transcript = build_transcript(req.history)
    user_context = build_user_context_summary(req.context, req.checkin_answer)

    messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": (
            f"Topic: \"{req.question}\"\n"
            f"{'User context: ' + user_context if user_context else ''}\n\n"
            f"Full debate transcript:\n{transcript}\n\n"
            f"PHASE 2: Deliver the final verdict for THIS specific user. "
            f"Reference the debaters by name. Connect the recommendation to what the user shared. "
            f"Respond ONLY with valid JSON: {{\"phase\": \"verdict\", \"insights\": [\"i1\",\"i2\",\"i3\"], "
            f"\"consensus\": \"...\", \"dissent\": \"...\", \"recommendation\": \"...\"}}"
        )}
    ]
    raw = await call_groq(messages, max_tokens=600)
    result = parse_json_response(raw)

    return {
        "insights": result.get("insights", []),
        "consensus": result.get("consensus", ""),
        "dissent": result.get("dissent", ""),
        "recommendation": result.get("recommendation", ""),
    }


@app.get("/health")
async def health():
    return {"status": "ok"}