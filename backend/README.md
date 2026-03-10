# ⚖️ The Council — AI Multi-Agent Debate System

Three AI perspectives (Analyst, Advocate, Skeptic) debate your question silently,
then surface a clean bullet summary + recommendation. Asks clarifying questions only when needed.

---

## Stack
- **Backend**: Python + FastAPI + Groq API (free tier)
- **Frontend**: React (Vite)
- **Cost**: €0 on free tiers, ~€5-10/month at scale

---

## 1. Get your free Groq API key
→ https://console.groq.com
Sign up, go to API Keys, create one. It's free.

---

## 2. Backend setup

```bash
cd council-backend
pip install -r requirements.txt

# Set your API key
export GROQ_API_KEY=your_key_here

# Run
uvicorn main:app --reload --port 8000
```

Test it: http://localhost:8000/health → should return `{"status":"ok"}`

---

## 3. Frontend setup

```bash
cd council-frontend
npm install
npm run dev
```

Opens at: http://localhost:5173

---

## 4. Deploy for free

### Backend → Render.com (free tier)
1. Push `council-backend/` to a GitHub repo
2. Create new Web Service on render.com
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env variable: `GROQ_API_KEY=your_key`

### Frontend → Vercel (free)
1. Push `council-frontend/` to GitHub
2. Import on vercel.com
3. Change `API_URL` in `App.jsx` to your Render backend URL
4. Deploy

Total cost: €0 until serious traffic.

---

## Groq Free Tier Limits
- 30 requests/minute
- 6,000 requests/day
- More than enough for an MVP

---

## Customize the agents
Edit `AGENTS` in `main.py` to change personalities:
```python
AGENTS = {
    "scientist": { "name": "Scientist", "emoji": "🔬", "prompt": "You are a rigorous scientist..." },
    "philosopher": { "name": "Philosopher", "emoji": "🧠", "prompt": "You are a deep thinker..." },
    "pragmatist": { "name": "Pragmatist", "emoji": "🔧", "prompt": "You are extremely practical..." },
}
```

---

## Architecture
```
User question
     ↓
[3 agents respond in parallel → react to each other]  ← hidden from user
     ↓
Orchestrator decides:
  → needs more info? → ask user 1-2 questions → re-run
  → has enough?     → bullet summary + recommendation
     ↓
Clean UI output
```
