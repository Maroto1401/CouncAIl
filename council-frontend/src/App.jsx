import { useState, useRef, useEffect } from "react";

const API_URL = "https://councail.onrender.com";

const AgentCard = ({ agent, visible }) => {
  const color = agent.color || "#94a3b8";
  const bg = `${color}12`;
  const border = `${color}30`;

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: "12px",
      padding: "16px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.4s ease",
      marginBottom: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "18px" }}>{agent.emoji}</span>
        <span style={{ color, fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {agent.name}
        </span>
      </div>
      <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
        {agent.response}
      </p>
      {agent.followup && (
        <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${border}`, fontStyle: "italic" }}>
          ↩ {agent.followup}
        </p>
      )}
    </div>
  );
};

const BulletSummary = ({ bullets, recommendation, visible }) => (
  <div style={{
    background: "#0d0d1f",
    border: "1px solid #2d2d4a",
    borderRadius: "14px",
    padding: "22px 24px",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: "all 0.5s ease 0.2s",
    marginTop: "6px",
  }}>
    <div style={{ color: "#7c6af7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
      ⚖️ Council Verdict
    </div>
    <ul style={{ margin: "0 0 18px 0", padding: 0, listStyle: "none" }}>
      {bullets.map((b, i) => (
        <li key={i} style={{ display: "flex", gap: "10px", color: "#e2e8f0", fontSize: "14px", lineHeight: "1.65", marginBottom: "10px" }}>
          <span style={{ color: "#7c6af7", flexShrink: 0, marginTop: "3px", fontSize: "10px" }}>◆</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
    {recommendation && (
      <>
        <div style={{ color: "#7c6af7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
          🎯 Recommendation
        </div>
        <div style={{ background: "#13132a", borderRadius: "10px", padding: "14px 16px", borderLeft: "3px solid #7c6af7" }}>
          <p style={{ color: "#c4b5fd", fontSize: "14px", lineHeight: "1.65", margin: 0 }}>
            {recommendation}
          </p>
        </div>
      </>
    )}
  </div>
);

const ClarificationBlock = ({ questions, onAnswer, visible }) => {
  const [answers, setAnswers] = useState({});

  return (
    <div style={{
      background: "#0f0f1a",
      border: "1px solid #2d2d4a",
      borderRadius: "14px",
      padding: "20px 24px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.5s ease",
      marginTop: "6px",
    }}>
      <div style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
        🤔 A couple of questions before the verdict
      </div>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: "16px" }}>
          <p style={{ color: "#e2e8f0", fontSize: "14px", marginBottom: "8px", lineHeight: "1.5" }}>{q}</p>
          <textarea
            rows={2}
            placeholder="Your answer..."
            value={answers[i] || ""}
            onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
            style={{
              width: "100%",
              background: "#1a1a2e",
              border: "1px solid #2d2d4a",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "14px",
              padding: "10px 12px",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#7c6af7"}
            onBlur={e => e.target.style.borderColor = "#2d2d4a"}
          />
        </div>
      ))}
      <button
        onClick={() => onAnswer(answers)}
        style={{
          background: "#7c6af7",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}
        onMouseEnter={e => e.target.style.background = "#6d5ce6"}
        onMouseLeave={e => e.target.style.background = "#7c6af7"}
      >
        Submit →
      </button>
    </div>
  );
};

const UserBubble = ({ text }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
    <div style={{
      background: "#1e1e3a",
      border: "1px solid #2d2d4a",
      borderRadius: "14px 14px 2px 14px",
      padding: "12px 16px",
      maxWidth: "75%",
      color: "#e2e8f0",
      fontSize: "15px",
      lineHeight: "1.55",
    }}>
      {text}
    </div>
  </div>
);

const LoadingPulse = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0 16px" }}>
    <div style={{ display: "flex", gap: "5px" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#7c6af7",
          animation: "pulse 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
    <span style={{ color: "#475569", fontSize: "13px" }}>The council is deliberating...</span>
  </div>
);

export default function App() {
  const [question, setQuestion] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, loading]);

  // Keep server warm
  useEffect(() => {
    const keepAlive = setInterval(() => {
      fetch(`${API_URL}/health`).catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(keepAlive);
  }, []);

  const addVisible = (id) => {
    setTimeout(() => setVisibleItems(prev => new Set([...prev, id])), 50);
  };

  const submitQuestion = async (q, clarifications = {}, parentId = null) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, clarifications }),
      });
      const data = await res.json();
      const id = Date.now();

      const newSession = { id, question: q, agents: data.agents, orchestration: data.orchestration, answered: false, parentId };

      if (parentId) {
        setSessions(prev => prev.map(s => s.id === parentId ? { ...s, child: newSession, answered: true } : s));
      } else {
        setSessions(prev => [...prev, newSession]);
      }

      setTimeout(() => {
        Object.keys(data.agents).forEach((k, i) => {
          setTimeout(() => addVisible(`${id}-agent-${k}`), i * 120);
        });
        setTimeout(() => addVisible(`${id}-result`), 500);
      }, 100);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");
    submitQuestion(q);
  };

  const handleClarification = (sessionId, questions, answers) => {
    const clarifications = {};
    questions.forEach((q, i) => { clarifications[q] = answers[i] || ""; });
    const session = sessions.find(s => s.id === sessionId);
    submitQuestion(session.question, clarifications, sessionId);
  };

  const renderSession = (session) => {
    const { id, question: q, agents, orchestration, answered } = session;
    return (
      <div key={id}>
        <UserBubble text={q} />
        <div style={{ marginBottom: "8px" }}>
          <div style={{ color: "#334155", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Council deliberation
          </div>
          {Object.entries(agents).map(([agentId, agent]) => (
            <AgentCard key={agentId} agent={agent} visible={visibleItems.has(`${id}-agent-${agentId}`)} />
          ))}
        </div>

        {visibleItems.has(`${id}-result`) && (
          orchestration.needs_clarification && !answered ? (
            <ClarificationBlock
              questions={orchestration.questions}
              visible={true}
              onAnswer={(answers) => handleClarification(id, orchestration.questions, answers)}
            />
          ) : (
            !session.child && (
              <BulletSummary
                bullets={orchestration.summary_bullets || []}
                recommendation={orchestration.recommendation}
                visible={true}
              />
            )
          )
        )}

        {session.child && renderSession(session.child)}
        <div style={{ marginBottom: "32px" }} />
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      height: "100%",
      background: "#060610",
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: #060610; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a15; }
        ::-webkit-scrollbar-thumb { background: #2d2d4a; border-radius: 2px; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #12122a",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "#060610",
        flexShrink: 0,
      }}>
        <div style={{
          width: "32px", height: "32px",
          background: "linear-gradient(135deg, #7c6af7, #38bdf8)",
          borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", flexShrink: 0,
        }}>⚖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "15px" }}>The Council</div>
          <div style={{ color: "#334155", fontSize: "12px" }}>🔍 Analyst · 💡 Advocate · 🧐 Skeptic</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          {sessions.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "80px 0 40px" }}>
              <div style={{ fontSize: "52px", marginBottom: "20px" }}>⚖️</div>
              <h1 style={{
                fontSize: "30px", fontWeight: 700, marginBottom: "12px",
                background: "linear-gradient(135deg, #e2e8f0, #7c6af7)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                Ask the Council
              </h1>
              <p style={{ color: "#334155", fontSize: "15px", lineHeight: "1.65", maxWidth: "380px", margin: "0 auto" }}>
                Three AI minds — analytical, optimistic, skeptical — debate your question and deliver a clear, balanced verdict.
              </p>
            </div>
          )}

          {sessions.map(renderSession)}
          {loading && <LoadingPulse />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed input bar */}
      <div style={{
        borderTop: "1px solid #12122a",
        padding: "16px 24px",
        background: "#060610",
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", gap: "10px" }}>
          <textarea
            rows={1}
            value={question}
            onChange={e => {
              setQuestion(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
            placeholder="Ask your question or dilemma..."
            style={{
              flex: 1,
              background: "#0f0f1a",
              border: "1px solid #2d2d4a",
              borderRadius: "12px",
              color: "#e2e8f0",
              fontSize: "15px",
              padding: "13px 16px",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: "1.5",
              minHeight: "48px",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#7c6af7"}
            onBlur={e => e.target.style.borderColor = "#2d2d4a"}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            style={{
              background: loading || !question.trim() ? "#1a1a2e" : "#7c6af7",
              color: loading || !question.trim() ? "#475569" : "white",
              border: "none",
              borderRadius: "12px",
              width: "48px",
              fontSize: "20px",
              cursor: loading || !question.trim() ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>
        <p style={{ textAlign: "center", color: "#1e293b", fontSize: "11px", marginTop: "8px" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}