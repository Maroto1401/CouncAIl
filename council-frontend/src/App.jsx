import { useState, useRef, useEffect } from "react";

const API_URL = "https://councail.onrender.com";

const PERSONALITIES = {
  analyst:     { name: "Analyst",          emoji: "🔍", color: "#38bdf8", description: "Logical, evidence-based, challenges assumptions" },
  advocate:    { name: "Advocate",         emoji: "💡", color: "#4ade80", description: "Optimistic, finds opportunities and creative angles" },
  skeptic:     { name: "Skeptic",          emoji: "🧐", color: "#fb923c", description: "Pragmatic, identifies risks and blind spots" },
  philosopher: { name: "Philosopher",      emoji: "🧠", color: "#c084fc", description: "Explores meaning, ethics and long-term consequences" },
  pragmatist:  { name: "Pragmatist",       emoji: "🔧", color: "#facc15", description: "Action-oriented, focuses on what can be done now" },
  devil:       { name: "Devil's Advocate", emoji: "😈", color: "#f87171", description: "Argues the opposite, stress-tests every idea" },
  economist:   { name: "Economist",        emoji: "📊", color: "#34d399", description: "Incentives, trade-offs and resource thinking" },
  psychologist:{ name: "Psychologist",     emoji: "🪞", color: "#f0abfc", description: "Human behavior, emotions and mental models" },
};

const hex2rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Setup Screen ──────────────────────────────────────────────────────────────
const SetupScreen = ({ onStart }) => {
  const [selected, setSelected] = useState([]);
  const [moderatorId, setModeratorId] = useState(null);

  const toggleSelect = (id) => {
    if (moderatorId === id) return;
    if (selected.includes(id)) setSelected(prev => prev.filter(s => s !== id));
    else if (selected.length < 5) setSelected(prev => [...prev, id]);
  };

  const setModerator = (e, id) => {
    e.stopPropagation();
    setModeratorId(prev => prev === id ? null : id);
    setSelected(prev => prev.filter(s => s !== id));
  };

  const canStart = selected.length >= 2 && moderatorId;

  const handleStart = () => {
    if (!canStart) return;
    const agents = selected.map(id => {
      const p = PERSONALITIES[id];
      return { id, name: p.name, emoji: p.emoji, color: p.color, prompt: "", is_moderator: false };
    });
    const mp = PERSONALITIES[moderatorId];
    const mod = { id: moderatorId, name: mp.name, emoji: mp.emoji, color: mp.color, prompt: "", is_moderator: true };
    onStart(agents, mod);
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#060610", color: "#e2e8f0", fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "clamp(24px,5vw,56px) clamp(16px,4vw,24px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(32px,5vw,52px)" }}>
          <div style={{ fontSize: "clamp(40px,8vw,56px)", marginBottom: "16px" }}>⚖️</div>
          <h1 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: 700, marginBottom: "10px", background: "linear-gradient(135deg, #e2e8f0, #7c6af7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Assemble Your Council
          </h1>
          <p style={{ color: "#475569", fontSize: "clamp(13px,2vw,15px)", lineHeight: "1.6" }}>
            Pick 2–5 debaters and assign a moderator. Then ask your question.
          </p>
        </div>

        {/* Step 1 */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: "14px" }}>
            1 — Debaters &nbsp;
            <span style={{ color: selected.length >= 2 ? "#4ade80" : "#475569" }}>({selected.length} / 5)</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%,180px),1fr))", gap: "10px" }}>
            {Object.entries(PERSONALITIES).map(([id, p]) => {
              const isMod = moderatorId === id;
              const isSel = selected.includes(id);
              return (
                <div
                  key={id}
                  onClick={() => !isMod && toggleSelect(id)}
                  style={{
                    background: isSel ? hex2rgba(p.color, 0.1) : "#0f0f1a",
                    border: `1px solid ${isSel ? p.color : isMod ? "#7c6af7" : "#1e1e3a"}`,
                    borderRadius: "12px", padding: "14px",
                    cursor: isMod ? "default" : "pointer",
                    opacity: isMod ? 0.4 : 1,
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {isSel && <div style={{ position: "absolute", top: "10px", right: "12px", color: p.color, fontSize: "12px", fontWeight: 700 }}>✓</div>}
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{p.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: isSel ? p.color : "#e2e8f0", marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.4", marginBottom: "10px" }}>{p.description}</div>
                  {!isMod && (
                    <button
                      onClick={e => setModerator(e, id)}
                      style={{ fontSize: "11px", color: "#7c6af7", background: "transparent", border: "1px solid #2d2d4a", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", width: "100%" }}
                    >
                      Set as moderator
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: "14px" }}>
            2 — Moderator &nbsp;
            {moderatorId ? <span style={{ color: "#4ade80" }}>✓ set</span> : <span style={{ color: "#f87171" }}>required</span>}
          </h2>
          {moderatorId ? (
            <div style={{ background: "#13132a", border: "1px solid #7c6af7", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "22px" }}>{PERSONALITIES[moderatorId].emoji}</span>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <div style={{ fontWeight: 700, color: "#c4b5fd", fontSize: "14px" }}>{PERSONALITIES[moderatorId].name} — Moderator</div>
                <div style={{ fontSize: "12px", color: "#475569" }}>Summarizes, asks user questions, delivers the verdict</div>
              </div>
              <button onClick={() => setModeratorId(null)} style={{ background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
            </div>
          ) : (
            <div style={{ background: "#0f0f1a", border: "1px dashed #2d2d4a", borderRadius: "12px", padding: "14px 16px", color: "#334155", fontSize: "14px" }}>
              Click "Set as moderator" on any card above
            </div>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%", padding: "15px",
            background: canStart ? "linear-gradient(135deg, #7c6af7, #38bdf8)" : "#1a1a2e",
            color: canStart ? "white" : "#334155",
            border: "none", borderRadius: "14px",
            fontSize: "clamp(14px,2vw,16px)", fontWeight: 700,
            cursor: canStart ? "pointer" : "not-allowed",
            transition: "opacity 0.2s",
          }}
        >
          {canStart ? "Start the Debate →" : "Select at least 2 debaters + a moderator"}
        </button>
      </div>
    </div>
  );
};

// ── Agent turn ────────────────────────────────────────────────────────────────
const AgentTurn = ({ turn }) => {
  const [expanded, setExpanded] = useState(false);
  const long = turn.text.length > 200;
  const preview = long ? turn.text.slice(0, 200) + "…" : turn.text;

  return (
    <div style={{
      background: hex2rgba(turn.color, 0.07),
      border: `1px solid ${hex2rgba(turn.color, 0.22)}`,
      borderRadius: "12px", padding: "13px 15px", marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "16px" }}>{turn.emoji}</span>
        <span style={{ color: turn.color, fontWeight: 700, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{turn.name}</span>
        {turn.position_updated && (
          <span style={{ fontSize: "10px", background: hex2rgba(turn.color, 0.18), color: turn.color, borderRadius: "4px", padding: "2px 6px", fontWeight: 600 }}>
            position updated
          </span>
        )}
        {long && (
          <button onClick={() => setExpanded(!expanded)} style={{ marginLeft: "auto", fontSize: "11px", color: "#475569", background: "transparent", border: "none", cursor: "pointer" }}>
            {expanded ? "collapse ↑" : "expand ↓"}
          </button>
        )}
      </div>
      <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.65", margin: 0 }}>
        {expanded ? turn.text : preview}
      </p>
    </div>
  );
};

// ── Moderator block ───────────────────────────────────────────────────────────
const ModeratorBlock = ({ mod, onAnswer }) => {
  const [answer, setAnswer] = useState("");

  return (
    <div style={{ background: "#0d0d20", border: "1px solid #3d3a6a", borderRadius: "14px", padding: "16px 18px", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
        <span style={{ fontSize: "16px" }}>{mod.emoji}</span>
        <span style={{ color: "#7c6af7", fontWeight: 700, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {mod.name} — Moderator
        </span>
      </div>

      {mod.summary?.length > 0 && (
        <ul style={{ margin: "0 0 12px 0", padding: 0, listStyle: "none" }}>
          {mod.summary.map((b, i) => (
            <li key={i} style={{ display: "flex", gap: "8px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.6", marginBottom: "6px" }}>
              <span style={{ color: "#7c6af7", flexShrink: 0 }}>◆</span><span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {mod.question && !mod.answered && (
        <div style={{ borderTop: "1px solid #2d2d4a", paddingTop: "13px" }}>
          <p style={{ color: "#e2e8f0", fontSize: "14px", marginBottom: "10px", lineHeight: "1.5" }}>🤔 {mod.question}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && answer.trim()) { onAnswer(answer); setAnswer(""); } }}
              placeholder="Your answer..."
              style={{ flex: 1, minWidth: 0, background: "#1a1a2e", border: "1px solid #2d2d4a", borderRadius: "8px", color: "#e2e8f0", fontSize: "14px", padding: "9px 12px", outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "#7c6af7"}
              onBlur={e => e.target.style.borderColor = "#2d2d4a"}
            />
            <button
              onClick={() => { if (answer.trim()) { onAnswer(answer); setAnswer(""); } }}
              style={{ background: "#7c6af7", color: "white", border: "none", borderRadius: "8px", padding: "9px 16px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
            >→</button>
          </div>
        </div>
      )}

      {mod.answered && mod.question && (
        <div style={{ borderTop: "1px solid #2d2d4a", paddingTop: "10px" }}>
          <p style={{ color: "#334155", fontSize: "12px", fontStyle: "italic" }}>✓ {mod.question}</p>
          <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>↩ {mod.userAnswer}</p>
        </div>
      )}
    </div>
  );
};

// ── Verdict ───────────────────────────────────────────────────────────────────
const VerdictBlock = ({ verdict, moderator }) => (
  <div style={{ background: "#0a0a18", border: "1px solid #4c4880", borderRadius: "16px", padding: "20px 22px", marginBottom: "8px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "18px" }}>
      <span style={{ fontSize: "16px" }}>{moderator.emoji}</span>
      <span style={{ color: "#7c6af7", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Final Verdict</span>
    </div>

    {verdict.insights?.length > 0 && (
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: "#475569", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Key Insights</div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {verdict.insights.map((b, i) => (
            <li key={i} style={{ display: "flex", gap: "9px", color: "#e2e8f0", fontSize: "14px", lineHeight: "1.65", marginBottom: "8px" }}>
              <span style={{ color: "#7c6af7", flexShrink: 0, marginTop: "3px", fontSize: "10px" }}>◆</span><span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {(verdict.consensus || verdict.dissent) && (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "10px", marginBottom: "16px" }}>
        {verdict.consensus && (
          <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: "10px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Agreed</div>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>{verdict.consensus}</p>
          </div>
        )}
        {verdict.dissent && (
          <div style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.18)", borderRadius: "10px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", color: "#fb923c", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Contested</div>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>{verdict.dissent}</p>
          </div>
        )}
      </div>
    )}

    {verdict.recommendation && (
      <div style={{ background: "#13132a", borderRadius: "10px", padding: "14px 16px", borderLeft: "3px solid #7c6af7" }}>
        <div style={{ fontSize: "11px", color: "#7c6af7", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>🎯 Recommendation</div>
        <p style={{ color: "#c4b5fd", fontSize: "14px", lineHeight: "1.65", margin: 0 }}>{verdict.recommendation}</p>
      </div>
    )}
  </div>
);

const LoadingPulse = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 0" }}>
    <div style={{ display: "flex", gap: "5px" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c6af7", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i*0.2}s` }} />
      ))}
    </div>
    <span style={{ color: "#334155", fontSize: "13px" }}>{label}</span>
  </div>
);

// ── Debate Screen ─────────────────────────────────────────────────────────────
const DebateScreen = ({ agents, moderator, onClose }) => {
  const [phase, setPhase] = useState("question");
  const [question, setQuestion] = useState("");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [history, setHistory] = useState([]);
  const [clarifications, setClarifications] = useState([]);
  const [pendingMod, setPendingMod] = useState(null);
  const [followUpQ, setFollowUpQ] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [feed, loading]);

  const runRound = async (roundNum, userClarification = null, currentQuestion = question) => {
    setLoading(true);
    setLoadingLabel(roundNum === 1 ? "Council forming opening positions…" : "Council debating…");
    try {
      const res = await fetch(`${API_URL}/debate/round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion, agents, moderator, round: roundNum, history, user_clarification: userClarification }),
      });
      const data = await res.json();
      const newTurns = data.turns;
      const mod = data.moderator;

      setHistory(prev => [...prev, ...newTurns, { ...mod, text: (mod.summary || []).join(" | ") }]);
      setFeed(prev => [
        ...prev,
        { type: "round_header", label: `Round ${roundNum}` },
        ...newTurns.map(t => ({ type: "agent", ...t })),
        { type: "moderator", ...mod, answered: false },
      ]);

      if (mod.question) {
        setPendingMod({ ...mod, roundNum });
        setPhase(roundNum === 1 ? "clarify1" : "clarify2");
      } else {
        if (roundNum === 1) await runRound(2, null, currentQuestion);
        else await runVerdict(currentQuestion);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleModAnswer = async (answer) => {
    const mod = pendingMod;
    setClarifications(prev => [...prev, answer]);
    setFeed(prev => prev.map(item =>
      item.type === "moderator" && item.question === mod.question
        ? { ...item, answered: true, userAnswer: answer } : item
    ));
    setPendingMod(null);
    if (mod.roundNum === 1) await runRound(2, answer);
    else await runVerdict(question, [...clarifications, answer]);
  };

  const runVerdict = async (q = question, clars = clarifications) => {
    setLoading(true);
    setLoadingLabel("Moderator preparing the verdict…");
    try {
      const res = await fetch(`${API_URL}/debate/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, moderator, history, user_clarifications: clars }),
      });
      const data = await res.json();
      setFeed(prev => [...prev, { type: "verdict", data }]);
      setPhase("done");
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStartDebate = async () => {
    if (!question.trim()) return;
    setPhase("round1");
    setFeed([{ type: "question_bubble", text: question }]);
    await runRound(1);
  };

  const handleFollowUp = async () => {
    if (!followUpQ.trim()) return;
    const q = followUpQ.trim();
    setFollowUpQ("");
    setQuestion(q);
    setPhase("round1");
    setFeed([{ type: "question_bubble", text: q }]);
    setHistory([]);
    setClarifications([]);
    await runRound(1, null, q);
  };

  return (
    <div style={{ height: "100vh", width: "100%", background: "#060610", color: "#e2e8f0", fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #12122a", padding: "12px clamp(14px,4vw,20px)", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, background: "#060610" }}>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#334155", fontSize: "18px", cursor: "pointer", padding: "4px 8px 4px 0" }}>←</button>
        <div style={{ fontSize: "18px" }}>⚖️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>The Council</div>
          <div style={{ color: "#334155", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {agents.map(a => `${a.emoji} ${a.name}`).join(" · ")} · {moderator.emoji} {moderator.name} (mod)
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px clamp(14px,4vw,20px)", background: "#060610" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", width: "100%" }}>

          {phase === "question" && (
            <div style={{ textAlign: "center", padding: "clamp(32px,8vw,72px) 0 24px" }}>
              <p style={{ color: "#334155", fontSize: "15px" }}>Your council is ready. What do you want to debate?</p>
            </div>
          )}

          {feed.map((item, i) => {
            if (item.type === "question_bubble") return (
              <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <div style={{ background: "#1e1e3a", border: "1px solid #2d2d4a", borderRadius: "14px 14px 2px 14px", padding: "12px 15px", maxWidth: "78%", fontSize: "15px", lineHeight: "1.55", wordBreak: "break-word" }}>
                  {item.text}
                </div>
              </div>
            );
            if (item.type === "round_header") return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", margin: "18px 0 12px" }}>
                <div style={{ flex: 1, height: "1px", background: "#12122a" }} />
                <span style={{ fontSize: "11px", color: "#334155", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.label}</span>
                <div style={{ flex: 1, height: "1px", background: "#12122a" }} />
              </div>
            );
            if (item.type === "agent") return <AgentTurn key={i} turn={item} />;
            if (item.type === "moderator") return <ModeratorBlock key={i} mod={item} onAnswer={handleModAnswer} />;
            if (item.type === "verdict") return <VerdictBlock key={i} verdict={item.data} moderator={moderator} />;
            return null;
          })}

          {loading && <LoadingPulse label={loadingLabel} />}

          {phase === "done" && !loading && (
            <div style={{ marginTop: "24px", borderTop: "1px solid #12122a", paddingTop: "22px" }}>
              <p style={{ color: "#475569", fontSize: "13px", marginBottom: "12px" }}>Ask a follow-up to the same council, or close this debate.</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  value={followUpQ}
                  onChange={e => setFollowUpQ(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleFollowUp(); }}
                  placeholder="Ask a follow-up…"
                  style={{ flex: "1 1 200px", minWidth: 0, background: "#0f0f1a", border: "1px solid #2d2d4a", borderRadius: "10px", color: "#e2e8f0", fontSize: "14px", padding: "11px 14px", outline: "none", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#7c6af7"}
                  onBlur={e => e.target.style.borderColor = "#2d2d4a"}
                />
                <button onClick={handleFollowUp} style={{ background: "#7c6af7", color: "white", border: "none", borderRadius: "10px", padding: "11px 16px", fontWeight: 600, cursor: "pointer" }}>→</button>
                <button onClick={onClose} style={{ background: "#1a1a2e", color: "#94a3b8", border: "1px solid #2d2d4a", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", cursor: "pointer" }}>
                  Close debate
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Question input bar */}
      {phase === "question" && (
        <div style={{ borderTop: "1px solid #12122a", padding: "14px clamp(14px,4vw,20px)", background: "#060610", flexShrink: 0 }}>
          <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", gap: "10px" }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleStartDebate(); }}
              placeholder="What do you want to debate?"
              style={{ flex: 1, minWidth: 0, background: "#0f0f1a", border: "1px solid #2d2d4a", borderRadius: "12px", color: "#e2e8f0", fontSize: "15px", padding: "13px 15px", outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "#7c6af7"}
              onBlur={e => e.target.style.borderColor = "#2d2d4a"}
              autoFocus
            />
            <button
              onClick={handleStartDebate}
              disabled={!question.trim()}
              style={{ background: question.trim() ? "#7c6af7" : "#1a1a2e", color: question.trim() ? "white" : "#334155", border: "none", borderRadius: "12px", width: "46px", fontSize: "20px", cursor: question.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}
            >↑</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("setup");
  const [council, setCouncil] = useState({ agents: [], moderator: null });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#060610" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; background: #060610; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2d2d4a; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>

      {screen === "debate"
        ? <DebateScreen agents={council.agents} moderator={council.moderator} onClose={() => { setScreen("setup"); setCouncil({ agents: [], moderator: null }); }} />
        : <SetupScreen onStart={(agents, mod) => { setCouncil({ agents, moderator: mod }); setScreen("debate"); }} />
      }
    </div>
  );
}