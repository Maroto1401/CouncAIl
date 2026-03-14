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
    prompt: str = ""

class ContextRequest(BaseModel):
    question: str
    characters: List[CharacterConfig]

class OpeningRequest(BaseModel):
    """Dan's dramatic opening statement before round 1."""
    question: str
    characters: List[CharacterConfig]
    context: Dict[str, str] = {}

class SingleTurnRequest(BaseModel):
    """Request a single character's turn."""
    question: str
    character_id: str
    characters: List[CharacterConfig]
    round: int
    context: Dict[str, str] = {}
    checkin_answer: Optional[str] = None
    history: List[Dict] = []

class SingleSentenceRequest(BaseModel):
    """A character's one-sentence pitch to be chosen."""
    question: str
    character_id: str
    characters: List[CharacterConfig]
    round: int
    context: Dict[str, str] = {}
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
        cid: {"id": c["id"], "name": c["name"], "title": c["title"],
              "emoji": c["emoji"], "color": c["color"], "description": c["description"], "lens": c["lens"]}
        for cid, c in CHARACTERS.items()
    }

@app.get("/dan")
async def get_dan():
    return {k: v for k, v in DAN.items() if k != "prompt"}


@app.post("/debate/context")
@limiter.limit("30/minute")
async def get_context_questions(request: Request, req: ContextRequest):
    req.question = sanitize(req.question)
    character_names = ", ".join([f"{c.emoji} {c.name} the {c.title}" for c in req.characters])
    messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": (
            f"A user has brought this question to the council: \"{req.question}\"\n\n"
            f"The debaters are: {character_names}\n\n"
            f"PHASE 0: Ask 1-2 factual questions that gather information the council CANNOT infer from the question itself.\n\n"
            f"The question already tells you what the user wants or is considering. "
            f"Do NOT ask them to restate or elaborate on their question — ask for the FACTS that would change the council's advice.\n\n"
            f"Think: what concrete details would make this situation very different to advise on? "
            f"For example: how long has this been going on, have they tried anything before, what are the actual numbers, "
            f"is there a deadline, who else is involved, what have they already decided vs what is still open?\n\n"
            f"Each question must take 5 seconds to answer. No analysis required from the user.\n\n"
            f"IMPORTANT: Detect the language of the user's question and write your questions in that same language.\n"
            f"Respond ONLY with valid JSON: {{\"phase\": \"context\", \"questions\": [\"q1\", \"q2\"]}}"
        )}
    ]
    raw = await call_groq(messages, max_tokens=200)
    result = parse_json_response(raw)
    return {"questions": result.get("questions", ["What's your current situation regarding this question?"])}


@app.post("/debate/opening")
@limiter.limit("20/minute")
async def debate_opening(request: Request, req: OpeningRequest):
    """Dan delivers a dramatic opening before round 1 begins."""
    req.question = sanitize(req.question)
    character_names = ", ".join([f"{c.emoji} {c.name} ({c.title})" for c in req.characters])
    user_context = build_user_context_summary(req.context, None)

    messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": (
            f"Topic: \"{req.question}\"\n"
            f"{'User context: ' + user_context if user_context else ''}\n"
            f"Council assembled: {character_names}\n\n"
            f"OPENING: Deliver a short, dramatic opening statement (2-3 sentences) that frames the stakes of this question for this user. "
            f"Name the council members. Set the tension. Make it feel like something important is about to happen. "
            f"Do NOT give a verdict or advice yet — just frame the debate. "
            f"Detect the language of the question and respond in that language. "
            f"Respond with plain text only, no JSON."
        )}
    ]
    raw = await call_groq(messages, max_tokens=180)
    return {"opening": raw}


@app.post("/debate/single_sentence")
@limiter.limit("30/minute")
async def single_sentence_pitch(request: Request, req: SingleSentenceRequest):
    """A character delivers one sentence expressing their core position for this round.
    User sees these from all characters and picks who speaks first/next."""
    req.question = sanitize(req.question)
    char_data = CHARACTERS.get(req.character_id)
    if not char_data:
        raise HTTPException(status_code=404, detail="Character not found")

    user_context = build_user_context_summary(req.context, None)
    prior_transcript = build_transcript(req.history)

    is_personal = any(w in req.question.lower() for w in ["i ", "my ", "me ", "should i", "am i", "do i", "can i", "will i", "i'm", "i've", "i am", "i have", "i feel", "i want", "i need"])
    instruction = (
        f"The question before the council: \"{req.question}\"\n"
        f"{'User context: ' + user_context if user_context else ''}\n"
        f"{'Debate so far:\n' + prior_transcript if prior_transcript else ''}\n\n"
        f"You are about to speak in Round {req.round}. "
        f"Express the sharpest, most specific insight you will bring through your lens ({char_data['lens']}). "
        f"{'Hint at the concrete action or decision you will recommend.' if is_personal else 'Hint at the direct verdict or answer you will deliver — make them want to hear your full take.'} "
        f"ONE sentence only. No preamble. No citations. Speak in your character voice."
    )

    messages = [
        {"role": "system", "content": char_data["prompt"]},
        {"role": "user", "content": instruction}
    ]
    raw = await call_groq(messages, max_tokens=80)
    # Trim to first sentence
    sentence = raw.split(".")[0].strip() + "."
    return {"character_id": req.character_id, "pitch": sentence}


@app.post("/debate/single_turn")
@limiter.limit("20/minute")
async def single_turn(request: Request, req: SingleTurnRequest):
    """A single character speaks their full turn, seeing the full debate history."""
    req.question = sanitize(req.question)
    char_data = CHARACTERS.get(req.character_id)
    if not char_data:
        raise HTTPException(status_code=404, detail="Character not found")

    user_context = build_user_context_summary(req.context, req.checkin_answer)
    prior_transcript = build_transcript(req.history)

    # Build instruction based on what's already been said this round
    round_turns = [h for h in req.history if h.get("round") == req.round and h.get("type") == "agent"]
    speakers_this_round = [t["name"] for t in round_turns]

    if not round_turns:
        is_personal = any(w in req.question.lower() for w in ["i ", "my ", "me ", "should i", "am i", "do i", "can i", "will i", "i'm", "i've", "i am", "i have", "i feel", "i want", "i need", "i think", "i'm"])
        action_instruction = (
            "End with one concrete next step THIS user can take — specific, not vague." if is_personal
            else "End with your direct conclusion on the question — a clear verdict, not a list of considerations. The user wants your judgment, not homework."
        )
        instruction = (
            f"ROUND {req.round} — You are speaking first.\n"
            f"The question: \"{req.question}\"\n"
            f"{'FACTS we know about this user: ' + user_context if user_context else ''}\n\n"
            f"State your position through your lens ({char_data['lens']}). Use real knowledge to back it. "
            f"Do NOT tell the user to go research, observe, or gather data — you have the knowledge, give the answer. "
            f"{action_instruction} "
            f"**Bold your single most important claim** using **double asterisks**. "
            f"3-5 sentences. Speak in your character's voice."
        )
    else:
        others_said = "\n\n".join([f"{t['emoji']} {t['name']}: {t['text']}" for t in round_turns])
        is_personal = any(w in req.question.lower() for w in ["i ", "my ", "me ", "should i", "am i", "do i", "can i", "will i", "i'm", "i've", "i am", "i have", "i feel", "i want", "i need", "i think", "i'm"])
        action_instruction = (
            "End with one concrete next step THIS user can take — specific, not vague." if is_personal
            else "End with your direct verdict on this question — who is right, what is true, what the answer actually is. Own it."
        )
        instruction = (
            f"ROUND {req.round} — Others have already spoken. React to what was just said.\n"
            f"The question: \"{req.question}\"\n"
            f"{'FACTS we know about this user: ' + user_context if user_context else ''}\n\n"
            f"What has been said this round:\n{others_said}\n\n"
            f"Full debate history:\n{prior_transcript}\n\n"
            f"Your FIRST sentence MUST directly react to {speakers_this_round[-1]} — name them, engage their specific point. "
            f"Do NOT tell the user to go research or observe anything — give your judgment directly. "
            f"Add your angle through your lens ({char_data['lens']}). "
            f"{action_instruction} "
            f"**Bold your single most important claim** using **double asterisks**. "
            f"3-5 sentences. Speak in your character's voice."
        )

    messages = [
        {"role": "system", "content": char_data["prompt"]},
        {"role": "user", "content": instruction}
    ]
    raw = await call_groq(messages, max_tokens=320)

    change_signals = ["changed my mind", "i now agree", "i concede", "you've convinced me", "i was wrong", "i update my", "fair point, i"]
    position_updated = any(s in raw.lower() for s in change_signals)

    turn = {
        "type": "agent",
        "id": char_data["id"],
        "name": char_data["name"],
        "title": char_data["title"],
        "emoji": char_data["emoji"],
        "color": char_data["color"],
        "text": raw,
        "position_updated": position_updated,
        "round": req.round,
    }
    return {"turn": turn}


@app.post("/debate/checkin")
@limiter.limit("20/minute")
async def debate_checkin(request: Request, req: CheckinRequest):
    req.question = sanitize(req.question)
    transcript = build_transcript(req.history)
    user_context = build_user_context_summary(req.context, None)
    character_names = ", ".join([c.name for c in req.characters])

    messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": (
            f"Topic: \"{req.question}\"\n"
            f"{'What the user told us before the debate: ' + user_context if user_context else ''}\n"
            f"Council members: {character_names}\n\n"
            f"FULL debate transcript so far (read carefully before forming your summary and question):\n{transcript}\n\n"
            f"PHASE 1 — After Round {req.round} (max 3 rounds total).\n"
            f"Your summary must reference what debaters actually argued this round — specific points, not themes. "
            f"{'IMPORTANT: Round 3 — set needs_more_round to false, no question.' if req.round >= 3 else 'Only request another round if a genuinely new tension exists that would change the verdict.'} "
            f"If you ask the user a follow-up, it must be instant to answer (factual or feeling) and specific to their situation — not analytical. "
            f"You may optionally direct a sharp question TO a specific council member if it would expose a gap in their argument — use council_question. "
            f"If going to verdict: omit the question field entirely. "
            f"Respond ONLY with valid JSON: {{\"phase\": \"checkin\", \"summary\": [\"b1\",\"b2\"], "
            f"\"question\": \"instant-answer question for user, only if needs_more_round true\", "
            f"\"council_question\": {{\"to\": \"MemberName\", \"question\": \"sharp question\"}} or null, "
            f"\"needs_more_round\": true/false}}"
        )}
    ]
    raw = await call_groq(messages, max_tokens=400)
    result = parse_json_response(raw)

    needs_more = result.get("needs_more_round", False)
    if req.round >= 3:
        needs_more = False

    return {
        "summary": result.get("summary", []),
        "question": result.get("question") if needs_more else None,
        "council_question": result.get("council_question"),
        "needs_more_round": needs_more,
    }


@app.post("/debate/council_response")
@limiter.limit("20/minute")
async def council_response(request: Request, req: SingleTurnRequest):
    """A council member responds to a direct question from Dan."""
    req.question = sanitize(req.question)
    char_data = CHARACTERS.get(req.character_id)
    if not char_data:
        raise HTTPException(status_code=404, detail="Character not found")

    user_context = build_user_context_summary(req.context, req.checkin_answer)
    prior_transcript = build_transcript(req.history)
    dan_question = req.checkin_answer  # reusing field to pass Dan's question

    instruction = (
        f"Dan, the judge, has put a direct question to you: \"{dan_question}\"\n\n"
        f"The debate topic: \"{req.question}\"\n"
        f"{'User context: ' + user_context if user_context else ''}\n\n"
        f"Debate so far:\n{prior_transcript}\n\n"
        f"Respond directly to Dan's question through your lens ({char_data['lens']}). "
        f"Include one concrete, actionable suggestion for the user. "
        f"Do NOT cite studies or name sources. "
        f"**Bold your single most important claim**. "
        f"2-4 sentences. Stay in character."
    )
    messages = [
        {"role": "system", "content": char_data["prompt"]},
        {"role": "user", "content": instruction}
    ]
    raw = await call_groq(messages, max_tokens=200)

    return {
        "turn": {
            "type": "agent",
            "id": char_data["id"],
            "name": char_data["name"],
            "title": char_data["title"],
            "emoji": char_data["emoji"],
            "color": char_data["color"],
            "text": raw,
            "position_updated": False,
            "round": req.round,
            "responding_to_dan": True,
        }
    }


@app.post("/debate/verdict")
@limiter.limit("20/minute")
async def debate_verdict(request: Request, req: VerdictRequest):
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
            f"Reference debaters by name. Connect recommendation to what the user shared. "
            f"Respond ONLY with valid JSON: {{\"phase\": \"verdict\", \"insights\": [\"i1\",\"i2\"], "
            f"\"for\": [\"f1\",\"f2\"], \"against\": [\"a1\",\"a2\"], \"recommendation\": \"...\"}}"
        )}
    ]
    raw = await call_groq(messages, max_tokens=700)
    result = parse_json_response(raw)

    return {
        "insights": result.get("insights", []),
        "for_points": result.get("for", []),
        "against_points": result.get("against", []),
        "consensus": result.get("consensus", ""),
        "dissent": result.get("dissent", ""),
        "recommendation": result.get("recommendation", ""),
    }


@app.get("/health")
async def health():
    return {"status": "ok"}