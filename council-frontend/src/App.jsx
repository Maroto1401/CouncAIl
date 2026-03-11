import { useState, useRef, useEffect } from "react";

const API_URL = "https://councail.onrender.com";

const CHARACTERS = {
  surfer:    { id:"surfer",    name:"Maui",      title:"The Surfer",    emoji:"🏄", color:"#38bdf8", description:"Risk & instinct. Reads situations like waves — when to paddle, when to pull back.", lens:"risk & instinct" },
  inspector: { id:"inspector", name:"Lamia",  title:"The Inspector", emoji:"🔍", color:"#f0abfc", description:"Evidence & detail. Never accepts the first explanation. Finds what others miss.", lens:"evidence & detail" },
  artist:    { id:"artist",    name:"Severn",     title:"The Artist",    emoji:"🎨", color:"#fb923c", description:"Creativity & freedom. Allergic to conformity. Challenges what the question assumes.", lens:"creativity & freedom" },
  monk:      { id:"monk",      name:"Hoyt",      title:"The Monk",      emoji:"🧘", color:"#4ade80", description:"Long-term & meaning. Reframes everything toward what truly matters over time.", lens:"long-term meaning" },
  general:   { id:"general",   name:"Morpurgo",    title:"The General",   emoji:"⚔️", color:"#facc15", description:"Strategy & consequences. Blunt. Has seen plans fail under pressure.", lens:"strategy & consequences" },
};

const DAN = { id:"dan", name:"Dan", title:"The Judge", emoji:"🧑‍⚖️", color:"#7c6af7" };

const hex2rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Setup ─────────────────────────────────────────────────────────────────────
const SetupScreen = ({ onStart }) => {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    if (selected.includes(id)) setSelected(p => p.filter(s => s !== id));
    else if (selected.length < 4) setSelected(p => [...p, id]);
  };

  const canStart = selected.length >= 2;

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:"#060610", color:"#e2e8f0", fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth:"700px", margin:"0 auto", padding:"clamp(24px,5vw,56px) clamp(16px,4vw,24px)" }}>

        <div style={{ textAlign:"center", marginBottom:"clamp(28px,5vw,48px)" }}>
          <div style={{ fontSize:"clamp(40px,8vw,56px)", marginBottom:"14px" }}>⚖️</div>
          <h1 style={{ fontSize:"clamp(22px,5vw,30px)", fontWeight:700, marginBottom:"10px", background:"linear-gradient(135deg,#e2e8f0,#7c6af7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Assemble Your Council
          </h1>
          <p style={{ color:"#475569", fontSize:"clamp(13px,2vw,15px)", lineHeight:"1.6", maxWidth:"420px", margin:"0 auto" }}>
            Pick 2–4 debaters. Dan will moderate every debate — asking the right questions and delivering the verdict.
          </p>
        </div>

        {/* Dan — always present */}
        <div style={{ background:"#13132a", border:"1px solid #7c6af7", borderRadius:"14px", padding:"16px 18px", marginBottom:"28px", display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{ fontSize:"28px" }}>🧑‍⚖️</span>
          <div>
            <div style={{ fontWeight:700, color:"#c4b5fd", fontSize:"15px" }}>Dan — The Judge <span style={{ fontSize:"11px", background:"#2d2d4a", borderRadius:"4px", padding:"2px 7px", marginLeft:"6px", color:"#7c6af7", verticalAlign:"middle" }}>always present</span></div>
            <div style={{ fontSize:"13px", color:"#475569", marginTop:"3px" }}>Wise, neutral, seen everything. Gathers context, steers the debate, delivers the verdict.</div>
          </div>
        </div>

        {/* Characters */}
        <h2 style={{ fontSize:"12px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#475569", marginBottom:"14px" }}>
          Choose Debaters &nbsp;<span style={{ color: selected.length >= 2 ? "#4ade80" : "#475569" }}>({selected.length} / 4)</span>
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,190px),1fr))", gap:"10px", marginBottom:"32px" }}>
          {Object.values(CHARACTERS).map(c => {
            const sel = selected.includes(c.id);
            return (
              <div key={c.id} onClick={() => toggle(c.id)} style={{
                background: sel ? hex2rgba(c.color,0.1) : "#0f0f1a",
                border: `1px solid ${sel ? c.color : "#1e1e3a"}`,
                borderRadius:"12px", padding:"16px", cursor:"pointer",
                transition:"all 0.15s", position:"relative",
              }}>
                {sel && <div style={{ position:"absolute", top:"10px", right:"12px", color:c.color, fontSize:"12px", fontWeight:700 }}>✓</div>}
                <div style={{ fontSize:"26px", marginBottom:"8px" }}>{c.emoji}</div>
                <div style={{ fontWeight:700, fontSize:"14px", color: sel ? c.color : "#e2e8f0", marginBottom:"2px" }}>{c.name}</div>
                <div style={{ fontSize:"12px", color:"#7c6af7", marginBottom:"6px", fontStyle:"italic" }}>{c.title}</div>
                <div style={{ fontSize:"11px", color:"#475569", lineHeight:"1.45" }}>{c.description}</div>
                <div style={{ marginTop:"10px", fontSize:"10px", background: hex2rgba(c.color,0.1), color:c.color, borderRadius:"4px", padding:"3px 7px", display:"inline-block", fontWeight:600 }}>
                  {c.lens}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => canStart && onStart(selected.map(id => CHARACTERS[id]))} disabled={!canStart} style={{
          width:"100%", padding:"15px",
          background: canStart ? "linear-gradient(135deg,#7c6af7,#38bdf8)" : "#1a1a2e",
          color: canStart ? "white" : "#334155",
          border:"none", borderRadius:"14px", fontSize:"clamp(14px,2vw,16px)", fontWeight:700,
          cursor: canStart ? "pointer" : "not-allowed", transition:"opacity 0.2s",
        }}>
          {canStart ? "Convene the Council →" : "Select at least 2 debaters"}
        </button>
      </div>
    </div>
  );
};

// ── Feed components ───────────────────────────────────────────────────────────
const AgentTurn = ({ turn }) => {
  const [exp, setExp] = useState(false);
  const long = turn.text.length > 220;
  return (
    <div style={{ background:hex2rgba(turn.color,0.07), border:`1px solid ${hex2rgba(turn.color,0.22)}`, borderRadius:"12px", padding:"13px 15px", marginBottom:"8px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"8px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"16px" }}>{turn.emoji}</span>
        <span style={{ color:turn.color, fontWeight:700, fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{turn.name}</span>
        <span style={{ fontSize:"10px", color:"#334155", fontStyle:"italic" }}>{turn.title}</span>
        {turn.position_updated && <span style={{ fontSize:"10px", background:hex2rgba(turn.color,0.18), color:turn.color, borderRadius:"4px", padding:"2px 6px", fontWeight:600 }}>position updated</span>}
        {long && <button onClick={() => setExp(!exp)} style={{ marginLeft:"auto", fontSize:"11px", color:"#475569", background:"transparent", border:"none", cursor:"pointer" }}>{exp ? "collapse ↑" : "expand ↓"}</button>}
      </div>
      <p style={{ color:"#cbd5e1", fontSize:"14px", lineHeight:"1.65", margin:0 }}>
        {exp || !long ? turn.text : turn.text.slice(0,220)+"…"}
      </p>
    </div>
  );
};

const DanBlock = ({ summary, question, needsMoreRound, onAnswer, answered, userAnswer }) => {
  const [ans, setAns] = useState("");
  const showQuestion = needsMoreRound && question && !answered;
  return (
    <div style={{ background:"#0d0d20", border:"1px solid #3d3a6a", borderRadius:"14px", padding:"16px 18px", marginBottom:"8px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"12px" }}>
        <span>🧑‍⚖️</span>
        <span style={{ color:"#7c6af7", fontWeight:700, fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Dan — The Judge</span>
      </div>
      {summary?.length > 0 && (
        <ul style={{ margin: showQuestion || (answered && question) ? "0 0 12px" : "0", padding:0, listStyle:"none" }}>
          {summary.map((b,i) => (
            <li key={i} style={{ display:"flex", gap:"8px", color:"#94a3b8", fontSize:"13px", lineHeight:"1.6", marginBottom:"6px" }}>
              <span style={{ color:"#7c6af7", flexShrink:0 }}>◆</span><span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {showQuestion && (
        <div style={{ borderTop:"1px solid #2d2d4a", paddingTop:"13px" }}>
          <p style={{ color:"#e2e8f0", fontSize:"14px", marginBottom:"10px", lineHeight:"1.5" }}>🤔 {question}</p>
          <div style={{ display:"flex", gap:"8px" }}>
            <input value={ans} onChange={e=>setAns(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&ans.trim()){ onAnswer(ans); setAns(""); }}}
              placeholder="Your answer..." style={{ flex:1, minWidth:0, background:"#1a1a2e", border:"1px solid #2d2d4a", borderRadius:"8px", color:"#e2e8f0", fontSize:"14px", padding:"9px 12px", outline:"none", fontFamily:"inherit" }}
              onFocus={e=>e.target.style.borderColor="#7c6af7"} onBlur={e=>e.target.style.borderColor="#2d2d4a"}
            />
            <button onClick={()=>{ if(ans.trim()){ onAnswer(ans); setAns(""); }}} style={{ background:"#7c6af7", color:"white", border:"none", borderRadius:"8px", padding:"9px 16px", fontWeight:600, cursor:"pointer" }}>→</button>
          </div>
        </div>
      )}
      {answered && question && (
        <div style={{ borderTop:"1px solid #2d2d4a", paddingTop:"10px" }}>
          <p style={{ color:"#334155", fontSize:"12px", fontStyle:"italic" }}>✓ {question}</p>
          <p style={{ color:"#475569", fontSize:"13px", marginTop:"4px" }}>↩ {userAnswer}</p>
        </div>
      )}
    </div>
  );
};

const ContextBlock = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const allAnswered = questions.every((_,i) => answers[i]?.trim());
  return (
    <div style={{ background:"#0d0d20", border:"1px solid #3d3a6a", borderRadius:"14px", padding:"16px 18px", marginBottom:"8px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px" }}>
        <span>🧑‍⚖️</span>
        <span style={{ color:"#7c6af7", fontWeight:700, fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Dan — The Judge</span>
      </div>
      <p style={{ color:"#94a3b8", fontSize:"13px", marginBottom:"14px", lineHeight:"1.5" }}>
        Before the debate begins, help me understand your situation.
      </p>
      {questions.map((q,i) => (
        <div key={i} style={{ marginBottom:"14px" }}>
          <p style={{ color:"#e2e8f0", fontSize:"14px", marginBottom:"8px", lineHeight:"1.5" }}>{q}</p>
          <input value={answers[i]||""} onChange={e=>setAnswers(p=>({...p,[i]:e.target.value}))}
            onKeyDown={e=>{ if(e.key==="Enter"&&allAnswered) onSubmit(questions.map((_,j)=>answers[j]||"")); }}
            placeholder="Your answer..." style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2d2d4a", borderRadius:"8px", color:"#e2e8f0", fontSize:"14px", padding:"9px 12px", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor="#7c6af7"} onBlur={e=>e.target.style.borderColor="#2d2d4a"}
          />
        </div>
      ))}
      <button onClick={()=>allAnswered&&onSubmit(questions.map((_,i)=>answers[i]||""))} disabled={!allAnswered} style={{
        background:allAnswered?"#7c6af7":"#1a1a2e", color:allAnswered?"white":"#334155",
        border:"none", borderRadius:"8px", padding:"10px 20px", fontWeight:600, cursor:allAnswered?"pointer":"not-allowed", fontSize:"14px"
      }}>Start the debate →</button>
    </div>
  );
};

const VerdictBlock = ({ verdict }) => (
  <div style={{ background:"#0a0a18", border:"1px solid #4c4880", borderRadius:"16px", padding:"20px 22px", marginBottom:"8px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"18px" }}>
      <span>🧑‍⚖️</span>
      <span style={{ color:"#7c6af7", fontWeight:700, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase" }}>Dan's Verdict</span>
    </div>
    {verdict.insights?.length > 0 && (
      <div style={{ marginBottom:"16px" }}>
        <div style={{ fontSize:"11px", color:"#475569", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"10px" }}>Key Insights</div>
        <ul style={{ margin:0, padding:0, listStyle:"none" }}>
          {verdict.insights.map((b,i) => (
            <li key={i} style={{ display:"flex", gap:"9px", color:"#e2e8f0", fontSize:"14px", lineHeight:"1.65", marginBottom:"8px" }}>
              <span style={{ color:"#7c6af7", flexShrink:0, marginTop:"3px", fontSize:"10px" }}>◆</span><span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
    {(verdict.consensus||verdict.dissent) && (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"10px", marginBottom:"16px" }}>
        {verdict.consensus && (
          <div style={{ background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.18)", borderRadius:"10px", padding:"12px 14px" }}>
            <div style={{ fontSize:"11px", color:"#4ade80", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"6px" }}>Agreed</div>
            <p style={{ color:"#94a3b8", fontSize:"13px", lineHeight:"1.5", margin:0 }}>{verdict.consensus}</p>
          </div>
        )}
        {verdict.dissent && (
          <div style={{ background:"rgba(251,146,60,0.06)", border:"1px solid rgba(251,146,60,0.18)", borderRadius:"10px", padding:"12px 14px" }}>
            <div style={{ fontSize:"11px", color:"#fb923c", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"6px" }}>Contested</div>
            <p style={{ color:"#94a3b8", fontSize:"13px", lineHeight:"1.5", margin:0 }}>{verdict.dissent}</p>
          </div>
        )}
      </div>
    )}
    {verdict.recommendation && (
      <div style={{ background:"#13132a", borderRadius:"10px", padding:"14px 16px", borderLeft:"3px solid #7c6af7" }}>
        <div style={{ fontSize:"11px", color:"#7c6af7", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px" }}>🎯 Recommendation</div>
        <p style={{ color:"#c4b5fd", fontSize:"14px", lineHeight:"1.65", margin:0 }}>{verdict.recommendation}</p>
      </div>
    )}
  </div>
);

const RoundHeader = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px", margin:"18px 0 12px" }}>
    <div style={{ flex:1, height:"1px", background:"#12122a" }} />
    <span style={{ fontSize:"11px", color:"#334155", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</span>
    <div style={{ flex:1, height:"1px", background:"#12122a" }} />
  </div>
);

const LoadingPulse = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 0" }}>
    <div style={{ display:"flex", gap:"5px" }}>
      {[0,1,2].map(i=><div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#7c6af7", animation:"pulse 1.2s ease-in-out infinite", animationDelay:`${i*0.2}s` }}/>)}
    </div>
    <span style={{ color:"#334155", fontSize:"13px" }}>{label}</span>
  </div>
);

// ── Debate Screen ─────────────────────────────────────────────────────────────
const DebateScreen = ({ characters, onClose }) => {
  const [phase, setPhase] = useState("question"); // question→context→round1→checkin→round2→verdict→done
  const [question, setQuestion] = useState("");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [history, setHistory] = useState([]);
  const [context, setContext] = useState({});       // {question: answer}
  const [checkinAnswer, setCheckinAnswer] = useState(null);
  const [followUpQ, setFollowUpQ] = useState("");
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[feed,loading]);

  const post = async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    return res.json();
  };

  const charConfigs = characters.map(c=>({ id:c.id, name:c.name, title:c.title, emoji:c.emoji, color:c.color, prompt:"" }));

  // Step 1: user submits question → Dan asks context questions
  const handleQuestion = async () => {
    if(!question.trim()) return;
    setPhase("loading");
    setFeed([{ type:"question_bubble", text:question }]);
    setLoading(true); setLoadingLabel("Dan is preparing his questions…");
    try {
      const data = await post("/debate/context", { question, characters: charConfigs });
      setFeed(p=>[...p, { type:"context_block", questions: data.questions }]);
      setPhase("context");
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  // Step 2: user answers context questions → Round 1
  const handleContextSubmit = async (answers) => {
    const ctxMap = {};
    const contextQuestions = feed.find(f=>f.type==="context_block")?.questions || [];
    contextQuestions.forEach((q,i) => { ctxMap[q] = answers[i]; });
    setContext(ctxMap);

    // Mark context block as answered
    setFeed(p=>p.map(f=>f.type==="context_block" ? {...f, answered:true, answers} : f));

    // Show context answers in feed
    const ctxText = Object.entries(ctxMap).map(([q,a])=>`${q} → ${a}`).join(" | ");
    setHistory(p=>[...p, { type:"user_context", text: ctxText }]);

    await runRound(1, ctxMap, null);
  };

  // Run a debate round
  const runRound = async (roundNum, ctx=context, checkinAns=checkinAnswer, currentHistory=history) => {
    setLoading(true); setLoadingLabel(roundNum===1 ? "Council forming opening positions…" : `Round ${roundNum} — council engaging…`);
    setFeed(p=>[...p, { type:"round_header", label:`Round ${roundNum}` }]);
    try {
      const data = await post("/debate/round", {
        question, characters: charConfigs, round: roundNum,
        context: ctx, checkin_answer: checkinAns, history: currentHistory
      });
      const newTurns = data.turns;
      const updatedHistory = [...currentHistory, ...newTurns];
      setHistory(updatedHistory);
      setFeed(p=>[...p, ...newTurns.map(t=>({ type:"agent", ...t }))]);

      // After every round, Dan checks in (max 3 rounds enforced in backend)
      await runCheckin(ctx, newTurns, roundNum);
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  // Dan's mid-debate check-in
  const runCheckin = async (ctx, newTurns, roundNum) => {
    setLoading(true); setLoadingLabel("Dan is reviewing the debate…");
    try {
      const allHistory = [...history, ...newTurns];
      const data = await post("/debate/checkin", { question, characters: charConfigs, history: allHistory, context: ctx, round: roundNum });
      // Hard enforce: no more rounds after 3
      if (roundNum >= 3) { data.needs_more_round = false; data.question = null; }
      setFeed(p=>[...p, { type:"dan_checkin", summary: data.summary, question: data.question, answered:false, needsMoreRound: data.needs_more_round, roundNum }]);
      if (data.needs_more_round && data.question) {
        setPhase("checkin");
      } else if (data.needs_more_round && !data.question) {
        // Dan wants another round but has no question — go straight
        await runRound(roundNum + 1, ctx, null, allHistory);
      } else {
        // Ready for verdict
        await runVerdict(ctx, null, allHistory);
      }
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  // User answers Dan's mid-debate question
  const handleCheckinAnswer = async (answer, roundNum) => {
    setCheckinAnswer(answer);
    setFeed(p=>p.map(f=>f.type==="dan_checkin"&&!f.answered ? {...f, answered:true, userAnswer:answer} : f));
    const nextRound = (roundNum || 1) + 1;
    await runRound(nextRound, context, answer);
  };

  // Final verdict
  const runVerdict = async (ctx, checkinAns, finalHistory=history) => {
    setLoading(true); setLoadingLabel("Dan is preparing the verdict…");
    try {
      const data = await post("/debate/verdict", { question, history: finalHistory, context: ctx, checkin_answer: checkinAns });
      setFeed(p=>[...p, { type:"verdict", data }]);
      setPhase("done");
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  // Follow-up question — fresh debate, same council
  const handleFollowUp = async () => {
    if(!followUpQ.trim()) return;
    const q = followUpQ.trim();
    setFollowUpQ(""); setQuestion(q);
    setHistory([]); setContext({}); setCheckinAnswer(null);
    setPhase("loading");
    setFeed([{ type:"question_bubble", text:q }]);
    setLoading(true); setLoadingLabel("Dan is preparing his questions…");
    try {
      const data = await post("/debate/context", { question:q, characters: charConfigs });
      setFeed(p=>[...p, { type:"context_block", questions: data.questions }]);
      setPhase("context");
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ height:"100vh", width:"100%", background:"#060610", color:"#e2e8f0", fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ borderBottom:"1px solid #12122a", padding:"12px clamp(14px,4vw,20px)", display:"flex", alignItems:"center", gap:"10px", flexShrink:0, background:"#060610" }}>
        <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#334155", fontSize:"18px", cursor:"pointer", padding:"4px 8px 4px 0" }}>←</button>
        <span style={{ fontSize:"18px" }}>⚖️</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:"14px" }}>The Council</div>
          <div style={{ color:"#334155", fontSize:"11px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            🧑‍⚖️ Dan · {characters.map(c=>`${c.emoji} ${c.name}`).join(" · ")}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px clamp(14px,4vw,20px)", background:"#060610" }}>
        <div style={{ maxWidth:"680px", margin:"0 auto", width:"100%" }}>

          {phase==="question" && (
            <div style={{ textAlign:"center", padding:"clamp(32px,8vw,72px) 0 24px" }}>
              <p style={{ color:"#334155", fontSize:"15px" }}>Your council is assembled. What do you want to debate?</p>
            </div>
          )}

          {feed.map((item,i) => {
            if(item.type==="question_bubble") return (
              <div key={i} style={{ display:"flex", justifyContent:"flex-end", marginBottom:"20px" }}>
                <div style={{ background:"#1e1e3a", border:"1px solid #2d2d4a", borderRadius:"14px 14px 2px 14px", padding:"12px 15px", maxWidth:"78%", fontSize:"15px", lineHeight:"1.55", wordBreak:"break-word" }}>{item.text}</div>
              </div>
            );
            if(item.type==="context_block") return (
              <ContextBlock key={i} questions={item.questions} onSubmit={handleContextSubmit} />
            );
            if(item.type==="round_header") return <RoundHeader key={i} label={item.label} />;
            if(item.type==="agent") return <AgentTurn key={i} turn={item} />;
            if(item.type==="dan_checkin") return (
              <DanBlock key={i} summary={item.summary} question={item.question}
                needsMoreRound={item.needsMoreRound}
                answered={item.answered} userAnswer={item.userAnswer}
                onAnswer={(ans) => handleCheckinAnswer(ans, item.roundNum)} />
            );
            if(item.type==="verdict") return <VerdictBlock key={i} verdict={item.data} />;
            return null;
          })}

          {loading && <LoadingPulse label={loadingLabel} />}

          {phase==="done" && !loading && (
            <div style={{ marginTop:"24px", borderTop:"1px solid #12122a", paddingTop:"22px" }}>
              <p style={{ color:"#475569", fontSize:"13px", marginBottom:"12px" }}>Ask a follow-up to the same council, or close this debate.</p>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                <input value={followUpQ} onChange={e=>setFollowUpQ(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") handleFollowUp(); }}
                  placeholder="Ask a follow-up…"
                  style={{ flex:"1 1 200px", minWidth:0, background:"#0f0f1a", border:"1px solid #2d2d4a", borderRadius:"10px", color:"#e2e8f0", fontSize:"14px", padding:"11px 14px", outline:"none", fontFamily:"inherit" }}
                  onFocus={e=>e.target.style.borderColor="#7c6af7"} onBlur={e=>e.target.style.borderColor="#2d2d4a"}
                />
                <button onClick={handleFollowUp} style={{ background:"#7c6af7", color:"white", border:"none", borderRadius:"10px", padding:"11px 16px", fontWeight:600, cursor:"pointer" }}>→</button>
                <button onClick={onClose} style={{ background:"#1a1a2e", color:"#94a3b8", border:"1px solid #2d2d4a", borderRadius:"10px", padding:"11px 14px", fontSize:"13px", cursor:"pointer" }}>Close debate</button>
              </div>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Question input */}
      {phase==="question" && (
        <div style={{ borderTop:"1px solid #12122a", padding:"14px clamp(14px,4vw,20px)", background:"#060610", flexShrink:0 }}>
          <div style={{ maxWidth:"680px", margin:"0 auto", display:"flex", gap:"10px" }}>
            <input value={question} onChange={e=>setQuestion(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter") handleQuestion(); }}
              placeholder="What do you want to debate?"
              style={{ flex:1, minWidth:0, background:"#0f0f1a", border:"1px solid #2d2d4a", borderRadius:"12px", color:"#e2e8f0", fontSize:"15px", padding:"13px 15px", outline:"none", fontFamily:"inherit" }}
              onFocus={e=>e.target.style.borderColor="#7c6af7"} onBlur={e=>e.target.style.borderColor="#2d2d4a"}
              autoFocus
            />
            <button onClick={handleQuestion} disabled={!question.trim()} style={{ background:question.trim()?"#7c6af7":"#1a1a2e", color:question.trim()?"white":"#334155", border:"none", borderRadius:"12px", width:"46px", fontSize:"20px", cursor:question.trim()?"pointer":"not-allowed", flexShrink:0 }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("setup");
  const [characters, setCharacters] = useState([]);

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#060610" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;background:#060610;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#2d2d4a;border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
      `}</style>
      {screen==="debate"
        ? <DebateScreen characters={characters} onClose={()=>{ setScreen("setup"); setCharacters([]); }} />
        : <SetupScreen onStart={chars=>{ setCharacters(chars); setScreen("debate"); }} />
      }
    </div>
  );
}