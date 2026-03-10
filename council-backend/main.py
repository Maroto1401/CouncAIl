from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import httpx
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama3-70b-8192"

AGENTS = {
    "analyst": {
        "name": "Analyst",
        "emoji": "🔍",
        "prompt": "You are a sharp analytical thinker. You break down problems logically, look for evidence, and challenge assumptions. Be concise and direct. " +
        "Your goal is to discuss topics with other personalities to get the most of them. As discussion, you should be able to reasoning what is really a good idea or what should be improved, following your personality and character"
    },
    "advocate": {
        "name": "Advocate",
        "emoji": "💡",
        "prompt": "You are an optimistic creative thinker. You look for opportunities, upsides, and innovative angles. Be concise and inspiring." +
                "Your goal is to discuss topics with other personalities to get the most of them. As discussion, you should be able to reasoning what is really a good idea or what should be improved, following your personality and character"

    },
    "skeptic": {
        "name": "Skeptic",
        "emoji": "⚠️",
        "prompt": "You are a pragmatic skeptic. You identify risks, blind spots, and what could go wrong. Be concise and honest." +
        "Your goal is to discuss topics with other personalities to get the most of them. As discussion, you should be able to reasoning what is really a good idea or what should be improved, following your personality and character"
    },
}

ORCHESTRATOR_PROMPT = """You are the orchestrator of an AI council. Your job is to:
1. Receive a user question and the council's debate notes
2. Decide: does the council need more info from the user to give a truly useful answer?
3. If YES: output a JSON with {{"needs_clarification": true, "questions": ["question1", "question2"]}} — max 2 short questions
4. If NO: output a JSON with {{"needs_clarification": false, "summary_bullets": ["bullet1", "bullet2", "bullet3"], "recommendation": "clear final recommendation in 2-3 sentences"}}

Rules:
- Only ask for clarification if it would SIGNIFICANTLY change the answer
- Max 1 round of clarification questions, but sometimes 2 is possible if the topic is complex
- Bullets should capture key tensions or insights from the debate without being too generic. The recommendation should be specific and actionable.
- Be direct. No fluff. Respond ONLY with valid JSON."""


class Message(BaseModel):
    role: str
    content: str

class ConversationRequest(BaseModel):
    question: str
    history: Optional[List[dict]] = []
    clarifications: Optional[dict] = {}

async def call_groq(messages: list, stream: bool = False) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 400,
        "temperature": 0.7,
        "stream": False
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(GROQ_URL, headers=headers, json=payload)
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def run_debate(question: str, clarifications: dict) -> dict:
    context = f"User question: {question}"
    if clarifications:
        context += f"\n\nAdditional context from user: {json.dumps(clarifications)}"

    agent_responses = {}
    for agent_id, agent in AGENTS.items():
        messages = [
            {"role": "system", "content": agent["prompt"]},
            {"role": "user", "content": f"{context}\n\nGive your perspective in 2-4 sentences. Be specific."}
        ]
        response = await call_groq(messages)
        agent_responses[agent_id] = {
            "name": agent["name"],
            "emoji": agent["emoji"],
            "response": response
        }

    # Round 2: agents react to each other
    debate_transcript = "\n\n".join([
        f"{a['emoji']} {a['name']}: {a['response']}"
        for a in agent_responses.values()
    ])

    for agent_id, agent in AGENTS.items():
        messages = [
            {"role": "system", "content": agent["prompt"]},
            {"role": "user", "content": f"{context}\n\nHere's what your council said:\n{debate_transcript}\n\nReact briefly (1-2 sentences): do you agree, disagree, or want to add something important?"}
        ]
        followup = await call_groq(messages)
        agent_responses[agent_id]["followup"] = followup

    return agent_responses, debate_transcript


async def orchestrate(question: str, debate_transcript: str, clarifications: dict, already_clarified: bool) -> dict:
    context = f"User question: {question}"
    if clarifications:
        context += f"\nClarifications provided: {json.dumps(clarifications)}"
    if already_clarified:
        context += "\n[NOTE: User has already answered clarification questions. Do NOT ask more. Provide the final answer.]"

    messages = [
        {"role": "system", "content": ORCHESTRATOR_PROMPT},
        {"role": "user", "content": f"{context}\n\nDebate transcript:\n{debate_transcript}"}
    ]
    response = await call_groq(messages)

    # Clean and parse JSON
    cleaned = response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except:
        # Fallback
        return {
            "needs_clarification": False,
            "summary_bullets": ["The council has weighed in on your question."],
            "recommendation": cleaned[:300]
        }


@app.post("/ask")
async def ask(req: ConversationRequest):
    already_clarified = bool(req.clarifications)
    agent_responses, debate_transcript = await run_debate(req.question, req.clarifications)
    orchestration = await orchestrate(req.question, debate_transcript, req.clarifications, already_clarified)

    return {
        "agents": agent_responses,
        "orchestration": orchestration
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
