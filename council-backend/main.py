from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from agents import PERSONALITIES, MODERATOR_PROMPT
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


# ── Models ──────────────────────────────────────────────────

class AgentConfig(BaseModel):
    id: str
    name: str
    emoji: str
    color: str
    prompt: str
    is_moderator: bool = False

class DebateRequest(BaseModel):
    question: str
    agents: List[AgentConfig]
    moderator: AgentConfig
    round: int = 1  # 1 or 2
    history: Optional[List[Dict]] = []  # previous turns
    user_clarification: Optional[str] = None

class VerdictRequest(BaseModel):
    question: str
    moderator: AgentConfig
    history: List[Dict]
    user_clarifications: Optional[List[str]] = []

class PersonalitiesResponse(BaseModel):
    personalities: dict


# ── Helpers ─────────────────────────────────────────────────

def sanitize(text: str) -> str:
    if len(text) > 1500:
        raise HTTPException(status_code=400, detail="Input too long")
    banned = ["ignore previous", "ignore all", "system prompt", "jailbreak", "you are now"]
    for phrase in banned:
        if phrase.lower() in text.lower():
            raise HTTPException(status_code=400, detail="Invalid input")
    return text.strip()

async def call_groq(messages: list, max_tokens: int = 300) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.8,
        "stream": False
    }
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(GROQ_URL, headers=headers, json=payload)
        data = response.json()
        if "choices" not in data:
            raise HTTPException(status_code=500, detail=f"Groq error: {data}")
        return data["choices"][0]["message"]["content"].strip()

def build_history_context(history: List[Dict]) -> str:
    if not history:
        return ""
    lines = []
    for turn in history:
        lines.append(f"{turn['emoji']} {turn['name']}: {turn['text']}")
    return "\n\n".join(lines)


# ── Routes ───────────────────────────────────────────────────

@app.get("/personalities")
async def get_personalities():
    return {
        pid: {
            "name": p["name"],
            "emoji": p["emoji"],
            "color": p["color"],
            "description": p["description"],
        }
        for pid, p in PERSONALITIES.items()
    }


@app.post("/debate/round")
@limiter.limit("30/minute")
async def debate_round(request: Request, req: DebateRequest):
    """Run one debate round: each agent responds, then moderator summarizes and asks user a question."""
    req.question = sanitize(req.question)
    history_text = build_history_context(req.history)

    context = f"Debate topic: {req.question}"
    if req.user_clarification:
        context += f"\n\nUser clarification: {req.user_clarification}"

    debaters = [a for a in req.agents if not a.is_moderator]
    turns = []

    for agent in debaters:
        other_names = [a.name for a in debaters if a.id != agent.id]
        
        if req.round == 1:
            instruction = (
                f"This is Round 1. State your opening position on the topic. "
                f"Be direct and specific. 2-4 sentences."
            )
        else:
            instruction = (
                f"This is Round 2. You have read the other positions. "
                f"Directly engage with {', '.join(other_names)}'s arguments — agree where fair, challenge where you disagree. "
                f"If your position has shifted, say so naturally. "
                f"2-4 sentences. No repetition of your Round 1 points."
            )

        messages = [
            {"role": "system", "content": agent.prompt},
            {"role": "user", "content": f"{context}\n\n{f'Previous discussion:{chr(10)}{history_text}' if history_text else ''}\n\n{instruction}"}
        ]
        
        text = await call_groq(messages, max_tokens=250)
        
        # Detect position change signal
        change_signals = ["changed my mind", "i now agree", "i was wrong", "i concede", "you've convinced me", "fair point", "i update"]
        position_updated = any(s in text.lower() for s in change_signals)

        turns.append({
            "id": agent.id,
            "name": agent.name,
            "emoji": agent.emoji,
            "color": agent.color,
            "text": text,
            "position_updated": position_updated,
            "round": req.round,
            "type": "agent"
        })

    # Moderator summarizes and asks user a question
    all_turns_text = build_history_context(req.history + turns)
    
    if req.round == 1:
        mod_instruction = (
            f"Round 1 is complete. Do these two things:\n"
            f"1. In 2-3 bullets, highlight the KEY tensions and agreements so far. Be specific — reference debaters by name.\n"
            f"2. Ask the user ONE sharp clarifying question that would meaningfully change the debate.\n\n"
            f"Format your response as JSON: {{\"summary\": [\"bullet1\", \"bullet2\"], \"question\": \"your question\"}}\n"
            f"Respond ONLY with valid JSON."
        )
    else:
        mod_instruction = (
            f"Round 2 is complete. The debate is ready for a verdict.\n"
            f"In 2-3 bullets, highlight what shifted and what remained contested. Reference debaters by name.\n\n"
            f"Format: {{\"summary\": [\"bullet1\", \"bullet2\"], \"question\": null}}\n"
            f"Respond ONLY with valid JSON."
        )

    mod_messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": f"{context}\n\nFull debate so far:\n{all_turns_text}\n\n{mod_instruction}"}
    ]
    
    mod_raw = await call_groq(mod_messages, max_tokens=400)
    
    # Parse moderator JSON
    cleaned = mod_raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()
    
    try:
        mod_result = json.loads(cleaned)
    except:
        mod_result = {"summary": ["The debate is progressing."], "question": None}

    moderator_turn = {
        "id": req.moderator.id,
        "name": req.moderator.name,
        "emoji": req.moderator.emoji,
        "color": req.moderator.color,
        "summary": mod_result.get("summary", []),
        "question": mod_result.get("question"),
        "type": "moderator",
        "round": req.round,
    }

    return {
        "turns": turns,
        "moderator": moderator_turn,
        "round": req.round,
    }


@app.post("/debate/verdict")
@limiter.limit("20/minute")
async def debate_verdict(request: Request, req: VerdictRequest):
    """Generate the final verdict after all rounds."""
    req.question = sanitize(req.question)
    history_text = build_history_context(req.history)
    
    clarifications_text = ""
    if req.user_clarifications:
        clarifications_text = f"\n\nUser clarifications provided: {'; '.join(req.user_clarifications)}"

    verdict_instruction = (
        f"The debate is over. Deliver the final verdict.\n"
        f"Format as JSON:\n"
        f"{{\n"
        f"  \"insights\": [\"bullet1\", \"bullet2\", \"bullet3\"],\n"
        f"  \"recommendation\": \"direct actionable recommendation in 2-3 sentences\",\n"
        f"  \"consensus\": \"what the council agreed on\",\n"
        f"  \"dissent\": \"what remained contested\"\n"
        f"}}\n"
        f"Be specific. Reference the debaters. Respond ONLY with valid JSON."
    )

    messages = [
        {"role": "system", "content": MODERATOR_PROMPT},
        {"role": "user", "content": f"Topic: {req.question}{clarifications_text}\n\nFull debate:\n{history_text}\n\n{verdict_instruction}"}
    ]
    
    raw = await call_groq(messages, max_tokens=600)
    
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()
    
    try:
        result = json.loads(cleaned)
    except:
        result = {
            "insights": ["The council has reached its verdict."],
            "recommendation": cleaned[:300],
            "consensus": "",
            "dissent": ""
        }

    return {
        "type": "verdict",
        "moderator": {
            "name": req.moderator.name,
            "emoji": req.moderator.emoji,
            "color": req.moderator.color,
        },
        **result
    }


@app.get("/health")
async def health():
    return {"status": "ok"}