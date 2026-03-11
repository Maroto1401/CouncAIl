import { useState, useRef, useEffect } from "react";

const API_URL = "https://councail.onrender.com";

// ── Personalities (mirrors backend, for setup screen) ───────
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

const MODERATOR_CONFIG = {
  id: "moderator",
  name: "Moderator",
  emoji: "⚖️",
  color: "#7c6af7",
  is_moderator: true,
  prompt: "",
};

// ── Utils ────────────────────────────────────────────────────
const hex2rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Setup Screen ─────────────────────────────────────────────
const SetupScreen = ({ onStart }) => {
  const [selected, setSelected] = useState([]);
  const [moderatorId, setModeratorId] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customEmoji, setCustomEmoji] = useState("🤖");
  const [customDesc, setCustomDesc] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const toggleSelect = (id) => {
    if (moderatorId === id) return;
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(s => s !== id));
    } else if (selected.length < 5) {
      setSelected(prev => [...prev, id]);
    }
  };

  const setModerator = (id) => {
    setModeratorId(id);
    setSelected(prev => prev.filter(s => s !== id));
  };

  const canStart = selected.length >= 2 && moderatorId;

  const handleStart = () => {
    if (!canStart) return;
    const agents = selected.map(id => {
      const p = PERSONALITIES[id];
      return { id, name: p.name, emoji: p.emoji, color: p.color, prompt: "", is_moderator: false };
    });
    const mod = moderatorId === "custom_mod"
      ? { id: "custom_mod", name: customName || "Moderator", emoji: customEmoji, color: "#7c6af7", prompt: "", is_moderator: true }
      : { ...MODERATOR_CONFIG, ...PERSONALITIES[moderatorId] ? { name: PERSONALITIES[moderatorId].name, emoji: PERSONALITIES[moderatorId].emoji, color: PERSONALITIES[moderatorId].color } : {} };
    onStart(agents, mod);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060610", color: "#e2e8f0", fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html,body,#root { height: 100%; background: #060610; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2d2d4a; border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px", width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚖️</div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "10px", background: "linear-gradient(135deg, #e2e8f0, #7c6af7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Assemble Your Council
          </h1>
          <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6" }}>
            Pick 2–5 debaters and assign a moderator. Then ask your question.
          </p>
        </div>

        {/* Step 1: Debaters */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569" }}>
              1 — Choose Debaters <span style={{ color: selected.length >= 2 ? "#4ade80" : "#475569" }}>({selected.length}/5)</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {Object.entries(PERSONALITIES).map(([id, p]) => {
              const isMod = moderatorId === id;
              const isSelected = selected.includes(id);
              return (
                <div
                  key={id}
                  onClick={() => !isMod && toggleSelect(id)}
                  style={{
                    background: isSelected ? hex2rgba(p.color, 0.12) : "#0f0f1a",
                    border: `1px solid ${isSelected ? p.color : isMod ? "#7c6af7" : "#1e1e3a"}`,
                    borderRadius: "12px",
                    padding: "14px",
                    cursor: isMod ? "not-allowed" : "pointer",
                    opacity: isMod ? 0.4 : 1,
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  {isSelected && (
                    <div style={{ position: "absolute", top: "8px", right: "10px", color: p.color, fontSize: "12px", fontWeight: 700 }}>✓</div>
                  )}
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{p.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: isSelected ? p.color : "#e2e8f0", marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>{p.description}</div>
                  {!isMod && (
                    <button
                      onClick={e => { e.stopPropagation(); setModerator(id); }}
                      style={{ marginTop: "10px", fontSize: "11px", color: "#7c6af7", background: "transparent", border: "1px solid #2d2d4a", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}
                    >
                      Set as moderator
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Moderator */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: "16px" }}>
            2 — Moderator {moderatorId ? <span style={{ color: "#4ade80" }}>✓</span> : <span style={{ color: "#f87171" }}>required</span>}
          </h2>
          {moderatorId ? (
            <div style={{ background: "#13132a", border: "1px solid #7c6af7", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "22px" }}>{PERSONALITIES[moderatorId]?.emoji || "⚖️"}</span>
              <div>
                <div style={{ fontWeight: 700, color: "#c4b5fd", fontSize: "14px" }}>{PERSONALITIES[moderatorId]?.name || "Custom"} — acting as Moderator</div>
                <div style={{ fontSize: "12px", color: "#475569" }}>Will summarize, ask clarifying questions, and deliver the verdict</div>
              </div>
              <button onClick={() => setModeratorId(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
          ) : (
            <div style={{ background: "#0f0f1a", border: "1px dashed #2d2d4a", borderRadius: "12px", padding: "14px 16px", color: "#334155", fontSize: "14px" }}>
              Click "Set as moderator" on any personality above
            </div>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%",
            background: canStart ? "linear-gradient(135deg, #7c6af7, #38bdf8)" : "#1a1a2e",
            color: canStart ? "white" : "#334155",
            border: "none",
            borderRadius: "14px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: canStart ? "pointer" : "not-allowed",
            transition: "opacity 0.2s",
            letterSpacing: "0.02em",
          }}
        >
          {canStart ? "Start the Debate →" : `Select at least 2 debaters and a moderator`}
        </button>
      </div>
    </div>
  );
};

// ── Debate Screen ────────────────────────────────────────────
const AgentTurn = ({ turn }) => {
  const [expanded, setExpanded] = useState(false);
  const preview = turn.text.length > 180 ? turn.text.slice(0, 180) + "…" : turn.text;

  return (
    <div style={{
      background: hex2rgba(turn.color, 0.08),
      border: `1px solid ${hex2rgba(turn.color, 0.25)}`,
      borderRadius: "12px",
      padding: "14px 16px",
      marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "17px" }}>{turn.emoji}</span>
        <span style={{ color: turn.color, fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{turn.name}</span>
        {turn.position_updated && (
          <span style={{ marginLeft: "4px", fontSize: "10px", background: hex2rgba(turn.color, 0.2), color: turn.color, borderRadius: "4px", padding: "2px 6px", fontWeight: 600 }}>
            position updated
          </span>
        )}
        {turn.text.length > 180 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ marginLeft: "auto", fontSize: "11px", color: "#475569", background: "transparent", border: "none", cursor: "pointer" }}
          >
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

const ModeratorBlock = ({ mod, onAnswer }) => {
  const [answer, setAnswer] = useState("");

  return (
    <div style={{
      background: "#0d0d20",
      border: "1px solid #3d3a6a",
      borderRadius: "14px",
      padding: "18px 20px",
      marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "17px" }}>{mod.emoji}</span>
        <span style={{ color: "#7c6af7", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {mod.name} — Moderator
        </span>
      </div>

      {mod.summary && mod.summary.length > 0 && (
        <ul style={{ margin: "0 0 14px 0", padding: 0, listStyle: "none" }}>
          {mod.summary.map((b, i) => (
            <li key={i} style={{ display: "flex", gap: "8px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.6", marginBottom: "6px" }}>
              <span style={{ color: "#7c6af7", flexShrink: 0 }}>◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {mod.question && !mod.answered && (
        <div style={{ borderTop: "1px solid #2d2d4a", paddingTop: "14px" }}>
          <p style={{ color: "#e2e8f0", fontSize: "14px", marginBottom: "10px", lineHeight: "1.5" }}>
            🤔 {mod.question}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && answer.trim()) { onAnswer(answer); setAnswer(""); } }}
              placeholder="Your answer..."
              style={{
                flex: 1, background: "#1a1a2e", border: "1px solid #2d2d4a",
                borderRadius: "8px", color: "#e2e8f0", fontSize: "14px",
                padding: "9px 12px", outline: "none", fontFamily: "inherit",
              }}
              onFocus={e => e.target.style.borderColor = "#7c6af7"}
              onBlur={e => e.target.style.borderColor = "#2d2d4a"}
            />
            <button
              onClick={() => { if (answer.trim()) { onAnswer(answer); setAnswer(""); } }}
              style={{
                background: "#7c6af7", color: "white", border: "none",
                borderRadius: "8px", padding: "9px 16px", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {mod.answered && mod.question && (
        <div style={{ borderTop: "1px solid #2d2d4a", paddingTop: "10px" }}>
          <p style={{ color: "#334155", fontSize: "13px", fontStyle: "italic" }}>✓ {mod.question}</p>
          <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>↩ {mod.userAnswer}</p>
        </div>
      )}
    </div>
  );
};

const VerdictBlock = ({ verdict, moderator }) => (
  <div style={{
    background: "#0a0a18",
    border: "1px solid #4c4880",
    borderRadius: "16px",
    padding: "22px 24px",
    marginBottom: "8px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
      <span style={{ fontSize: "17px" }}>{moderator.emoji}</span>
      <span style={{ color: "#7c6af7", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Final Verdict
      </span>
    </div>

    {verdict.insights && (
      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", color: "#475569", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Key Insights</div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {verdict.insights.map((b, i) => (
            <li key={i} style={{ display: "flex", gap: "10px", color: "#e2e8f0", fontSize: "14px", lineHeight: "1.65", marginBottom: "8px" }}>
              <span style={{ color: "#7c6af7", flexShrink: 0, marginTop: "3px", fontSize: "10px" }}>◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {(verdict.consensus || verdict.dissent) && (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
        {verdict.consensus && (
          <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "10px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Agreed</div>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>{verdict.consensus}</p>
          </div>
        )}
        {verdict.dissent && (
          <div style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: "10px", padding: "12px 14px" }}>
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
    <span style={{ color: "#334155", fontSize: "13px" }}>{label || "Thinking..."}</span>
  </div>
);

const DebateScreen = ({ agents, moderator, onClose }) => {
  const [phase, setPhase] = useState("question"); // question | round1 | clarify1 | round2 | verdict | done
  const [question, setQuestion] = useState("");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [history, setHistory] = useState([]);
  const [clarifications, setClarifications] = useState([]);
  const [pendingMod, setPendingMod] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [followUpQ, setFollowUpQ] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [feed, loading]);

  const runRound = async (roundNum, userClarification = null) => {
    setLoading(true);
    setLoadingLabel(roundNum === 1 ? "Council is forming opening positions..." : "Council is debating...");

    try {
      const res = await fetch(`${API_URL}/debate/round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          agents,
          moderator,
          round: roundNum,
          history,
          user_clarification: userClarification,
        }),
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
        if (roundNum === 1) {
          await runRound(2);
        } else {
          await runVerdict();
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleModAnswer = async (answer) => {
    const mod = pendingMod;
    setClarifications(prev => [...prev, answer]);

    setFeed(prev => prev.map(item =>
      item.type === "moderator" && item.question === mod.question
        ? { ...item, answered: true, userAnswer: answer }
        : item
    ));

    setPendingMod(null);
    if (mod.roundNum === 1) {
      await runRound(2, answer);
    } else {
      await runVerdict();
    }
  };

  const runVerdict = async () => {
    setLoading(true);
    setLoadingLabel("Moderator is preparing the verdict...");
    try {
      const res = await fetch(`${API_URL}/debate/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, moderator, history, user_clarifications: clarifications }),
      });
      const data = await res.json();
      setVerdict(data);
      setFeed(prev => [...prev, { type: "verdict", data }]);
      setPhase("done");
    } catch (err) {
      console.error(err);
    }
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
    setVerdict(null);
    await runRound(1);
  };

  return (
    <div style={{ height: "100vh", background: "#060610", color: "#e2e8f0", fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #12122a", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#334155", fontSize: "18px", cursor: "pointer", marginRight: "4px" }}>←</button>
        <div style={{ fontSize: "18px" }}>⚖️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>The Council</div>
          <div style={{ color: "#334155", fontSize: "12px" }}>
            {agents.map(a => `${a.emoji} ${a.name}`).join(" · ")} · {moderator.emoji} {moderator.name} (mod)
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          {phase === "question" && (
            <div style={{ textAlign: "center", padding: "60px 0 32px" }}>
              <p style={{ color: "#334155", fontSize: "15px", marginBottom: "28px" }}>Your council is ready. What do you want to debate?</p>
            </div>
          )}

          {feed.map((item, i) => {
            if (item.type === "question_bubble") return (
              <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <div style={{ background: "#1e1e3a", border: "1px solid #2d2d4a", borderRadius: "14px 14px 2px 14px", padding: "12px 16px", maxWidth: "75%", fontSize: "15px", lineHeight: "1.55" }}>
                  {item.text}
                </div>
              </div>
            );
            if (item.type === "round_header") return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0 14px" }}>
                <div style={{ flex: 1, height: "1px", background: "#12122a" }} />
                <span style={{ fontSize: "11px", color: "#334155", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.label}</span>
                <div style={{ flex: 1, height: "1px", background: "#12122a" }} />
              </div>
            );
            if (item.type === "agent") return <AgentTurn key={i} turn={item} />;
            if (item.type === "moderator") return (
              <ModeratorBlock
                key={i}
                mod={item}
                onAnswer={handleModAnswer}
              />
            );
            if (item.type === "verdict") return (
              <VerdictBlock key={i} verdict={item.data} moderator={moderator} />
            );
            return null;
          })}

          {loading && <LoadingPulse label={loadingLabel} />}

          {/* Follow-up or close after verdict */}
          {phase === "done" && !loading && (
            <div style={{ marginTop: "24px", borderTop: "1px solid #12122a", paddingTop: "24px" }}>
              <p style={{ color: "#475569", fontSize: "13px", marginBottom: "14px" }}>Ask a follow-up to the same council, or close this debate.</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  value={followUpQ}
                  onChange={e => setFollowUpQ(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleFollowUp(); }}
                  placeholder="Ask a follow-up question..."
                  style={{ flex: 1, background: "#0f0f1a", border: "1px solid #2d2d4a", borderRadius: "10px", color: "#e2e8f0", fontSize: "14px", padding: "11px 14px", outline: "none", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#7c6af7"}
                  onBlur={e => e.target.style.borderColor = "#2d2d4a"}
                />
                <button onClick={handleFollowUp} style={{ background: "#7c6af7", color: "white", border: "none", borderRadius: "10px", padding: "11px 16px", fontWeight: 600, cursor: "pointer" }}>→</button>
                <button onClick={onClose} style={{ background: "#1a1a2e", color: "#94a3b8", border: "1px solid #2d2d4a", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", cursor: "pointer" }}>
                  Close debate
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Question input (only at start) */}
      {phase === "question" && (
        <div style={{ borderTop: "1px solid #12122a", padding: "16px 20px", background: "#060610", flexShrink: 0 }}>
          <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", gap: "10px" }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleStartDebate(); }}
              placeholder="What do you want to debate?"
              style={{ flex: 1, background: "#0f0f1a", border: "1px solid #2d2d4a", borderRadius: "12px", color: "#e2e8f0", fontSize: "15px", padding: "13px 16px", outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "#7c6af7"}
              onBlur={e => e.target.style.borderColor = "#2d2d4a"}
              autoFocus
            />
            <button
              onClick={handleStartDebate}
              disabled={!question.trim()}
              style={{ background: question.trim() ? "#7c6af7" : "#1a1a2e", color: question.trim() ? "white" : "#334155", border: "none", borderRadius: "12px", width: "48px", fontSize: "20px", cursor: question.trim() ? "pointer" : "not-allowed" }}
            >↑</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── App Root ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("setup"); // setup | debate
  const [council, setCouncil] = useState({ agents: [], moderator: null });

  const handleStart = (agents, moderator) => {
    setCouncil({ agents, moderator });
    setScreen("debate");
  };

  const handleClose = () => {
    setScreen("setup");
    setCouncil({ agents: [], moderator: null });
  };

  if (screen === "debate") {
    return <DebateScreen agents={council.agents} moderator={council.moderator} onClose={handleClose} />;
  }
  return <SetupScreen onStart={handleStart} />;
}