import { useState, useRef, useEffect } from "react";

const API_URL = "https://councail.onrender.com";

// ── Character definitions (mirrors backend) ───────────────────
const CHARACTERS = {
  surfer:    { id:"surfer",    name:"Maui",     title:"The Surfer",    emoji:"🏄", color:"#38bdf8", avatarBg:"#0c1f2e", description:"Risk & instinct. Reads situations like waves.", lens:"risk & instinct" },
  inspector: { id:"inspector", name:"Lamia",    title:"The Inspector", emoji:"🔍", color:"#f0abfc", avatarBg:"#1e0a2e", description:"Evidence & detail. Finds what others miss.", lens:"evidence & detail" },
  artist:    { id:"artist",    name:"Severn",   title:"The Artist",    emoji:"🎨", color:"#fb923c", avatarBg:"#2e1200", description:"Creativity & freedom. Challenges the premise.", lens:"creativity & freedom" },
  monk:      { id:"monk",      name:"Hoyt",     title:"The Monk",      emoji:"🧘", color:"#4ade80", avatarBg:"#021a0e", description:"Long-term & meaning. The 10-year lens.", lens:"long-term meaning" },
  general:   { id:"general",   name:"Morpurgo", title:"The General",   emoji:"⚔️", color:"#facc15", avatarBg:"#1a1400", description:"Strategy & consequences. No wishful thinking.", lens:"strategy & consequences" },
};
const DAN = { id:"dan", name:"Dan", title:"The Judge", emoji:"🧑‍⚖️", color:"#c9a84c", avatarBg:"#0a0800" };

const hex2rgba = (hex, alpha) => {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── SVG Avatars ───────────────────────────────────────────────
const Avatar = ({ char, size=56, active=false }) => {
  const c = char.color;
  const bg = char.avatarBg || "#0a0a18";
  const glowStyle = active ? { boxShadow:`0 0 0 2px ${c}, 0 0 20px ${hex2rgba(c,0.4)}` } : { boxShadow:`0 0 0 1px ${hex2rgba(c,0.3)}` };

  const icons = {
    surfer:    <path d="M10 32 Q20 10 30 20 Q40 30 50 15" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
    inspector: <><circle cx="28" cy="26" r="10" stroke={c} strokeWidth="2" fill="none"/><line x1="35" y1="33" x2="46" y2="44" stroke={c} strokeWidth="2.5" strokeLinecap="round"/></>,
    artist:    <><path d="M16 40 Q20 20 32 18 Q44 16 44 28 Q44 40 32 42 Q24 43 16 40Z" stroke={c} strokeWidth="2" fill="none"/><circle cx="32" cy="28" r="3" fill={c}/></>,
    monk:      <><circle cx="32" cy="22" r="8" stroke={c} strokeWidth="2" fill="none"/><path d="M18 44 Q32 34 46 44" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/></>,
    general:   <><path d="M20 20 L32 12 L44 20 L44 36 L32 44 L20 36Z" stroke={c} strokeWidth="2" fill="none"/><line x1="32" y1="20" x2="32" y2="36" stroke={c} strokeWidth="1.5"/><line x1="24" y1="28" x2="40" y2="28" stroke={c} strokeWidth="1.5"/></>,
    dan:       <><path d="M20 16 L44 16 L44 36 L32 44 L20 36Z" stroke={c} strokeWidth="2" fill="none"/><path d="M26 26 L30 30 L38 22" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  };

  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"box-shadow 0.3s", ...glowStyle }}>
      <svg width={size*0.88} height={size*0.88} viewBox="0 0 56 56">
        {icons[char.id] || <text x="28" y="34" textAnchor="middle" fontSize="24" fill={c}>{char.emoji}</text>}
      </svg>
    </div>
  );
};

// ── Council Seats Bar ─────────────────────────────────────────
const CouncilSeats = ({ characters, activeSpeaker }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(8px,2vw,20px)", padding:"16px 0 12px", borderBottom:"1px solid rgba(201,168,76,0.15)", flexWrap:"wrap" }}>
    {[DAN, ...characters].map(c => (
      <div key={c.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", opacity: activeSpeaker && activeSpeaker !== c.id ? 0.4 : 1, transition:"opacity 0.3s" }}>
        <Avatar char={c} size={activeSpeaker===c.id ? 48 : 38} active={activeSpeaker===c.id} />
        <span style={{ fontSize:"9px", color: activeSpeaker===c.id ? c.color : "#4a5568", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", transition:"color 0.3s" }}>{c.name}</span>
      </div>
    ))}
  </div>
);

// ── Agent Turn (slides in from side) ─────────────────────────
const AgentTurn = ({ turn, index }) => {
  const [visible, setVisible] = useState(false);
  const [exp, setExp] = useState(false);
  const isLeft = index % 2 === 0;
  const long = turn.text.length > 240;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      alignItems: isLeft ? "flex-start" : "flex-end",
      marginBottom:"14px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : `translateX(${isLeft ? "-40px" : "40px"})`,
      transition:"all 0.45s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", flexDirection: isLeft ? "row" : "row-reverse", maxWidth:"88%" }}>
        <Avatar char={turn} size={42} active />
        <div style={{
          background:`linear-gradient(135deg, ${hex2rgba(turn.color,0.08)}, ${hex2rgba(turn.color,0.04)})`,
          border:`1px solid ${hex2rgba(turn.color,0.25)}`,
          borderRadius: isLeft ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
          padding:"13px 16px",
          position:"relative",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"8px", flexWrap:"wrap" }}>
            <span style={{ color:turn.color, fontWeight:800, fontSize:"12px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{turn.name}</span>
            <span style={{ color:hex2rgba(turn.color,0.5), fontSize:"10px", fontStyle:"italic" }}>{turn.title}</span>
            {turn.position_updated && (
              <span style={{ fontSize:"9px", background:hex2rgba(turn.color,0.15), color:turn.color, borderRadius:"4px", padding:"2px 6px", fontWeight:700, border:`1px solid ${hex2rgba(turn.color,0.3)}` }}>
                ↻ stance updated
              </span>
            )}
            {long && (
              <button onClick={()=>setExp(!exp)} style={{ marginLeft:"auto", fontSize:"10px", color:"#4a5568", background:"transparent", border:"none", cursor:"pointer" }}>
                {exp?"collapse ↑":"expand ↓"}
              </button>
            )}
          </div>
          <p style={{ color:"#d1d5db", fontSize:"14px", lineHeight:"1.7", margin:0, fontFamily:"'Georgia','Times New Roman',serif" }}>
            {exp||!long ? turn.text : turn.text.slice(0,240)+"…"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Dan Block ─────────────────────────────────────────────────
const DanBlock = ({ summary, question, needsMoreRound, onAnswer, answered, userAnswer }) => {
  const [ans, setAns] = useState("");
  const [visible, setVisible] = useState(false);
  const showQ = needsMoreRound && question && !answered;

  useEffect(() => { const t=setTimeout(()=>setVisible(true),100); return ()=>clearTimeout(t); }, []);

  return (
    <div style={{
      opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(16px)",
      transition:"all 0.5s ease", margin:"20px 0",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px", justifyContent:"center" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right, transparent, rgba(201,168,76,0.3))" }}/>
        <Avatar char={DAN} size={36} active />
        <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase" }}>Dan — The Judge</span>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left, transparent, rgba(201,168,76,0.3))" }}/>
      </div>

      <div style={{ background:"linear-gradient(135deg,#0d0a02,#0a0800)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"14px", padding:"16px 20px" }}>
        {summary?.length>0 && (
          <ul style={{ margin:`0 0 ${showQ||answered?14:0}px`, padding:0, listStyle:"none" }}>
            {summary.map((b,i)=>(
              <li key={i} style={{ display:"flex", gap:"9px", color:"#9ca3af", fontSize:"13px", lineHeight:"1.65", marginBottom:"8px" }}>
                <span style={{ color:"#c9a84c", flexShrink:0, marginTop:"2px" }}>◆</span><span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {showQ && (
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.15)", paddingTop:"14px" }}>
            <p style={{ color:"#e5e7eb", fontSize:"14px", marginBottom:"12px", lineHeight:"1.55" }}>🤔 {question}</p>
            <div style={{ display:"flex", gap:"8px" }}>
              <input value={ans} onChange={e=>setAns(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&ans.trim()){onAnswer(ans);setAns("");}}}
                placeholder="Your answer..."
                style={{ flex:1,minWidth:0,background:"#13100a",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"8px",color:"#e5e7eb",fontSize:"14px",padding:"10px 13px",outline:"none",fontFamily:"inherit" }}
                onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
              />
              <button onClick={()=>{if(ans.trim()){onAnswer(ans);setAns("");}}}
                style={{ background:"#c9a84c",color:"#0a0800",border:"none",borderRadius:"8px",padding:"10px 18px",fontWeight:800,cursor:"pointer",fontSize:"14px" }}>→</button>
            </div>
          </div>
        )}
        {answered&&question&&(
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.1)", paddingTop:"10px" }}>
            <p style={{ color:"#4a5568",fontSize:"12px",fontStyle:"italic" }}>✓ {question}</p>
            <p style={{ color:"#6b7280",fontSize:"13px",marginTop:"4px" }}>↩ {userAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Context Block ─────────────────────────────────────────────
const ContextBlock = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const allAnswered = questions.every((_,i)=>answers[i]?.trim());

  return (
    <div style={{ margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px", justifyContent:"center" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right, transparent, rgba(201,168,76,0.3))" }}/>
        <Avatar char={DAN} size={36} active />
        <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase" }}>Dan — The Judge</span>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left, transparent, rgba(201,168,76,0.3))" }}/>
      </div>
      <div style={{ background:"linear-gradient(135deg,#0d0a02,#0a0800)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"14px", padding:"18px 20px" }}>
        <p style={{ color:"#9ca3af", fontSize:"13px", marginBottom:"18px", lineHeight:"1.55", fontStyle:"italic" }}>
          Before the council convenes, I need to understand your situation.
        </p>
        {questions.map((q,i)=>(
          <div key={i} style={{ marginBottom:"16px" }}>
            <p style={{ color:"#e5e7eb", fontSize:"14px", marginBottom:"9px", lineHeight:"1.5" }}>{q}</p>
            <input value={answers[i]||""} onChange={e=>setAnswers(p=>({...p,[i]:e.target.value}))}
              onKeyDown={e=>{if(e.key==="Enter"&&allAnswered)onSubmit(questions.map((_,j)=>answers[j]||""));}}
              placeholder="Your answer..."
              style={{ width:"100%",background:"#13100a",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"8px",color:"#e5e7eb",fontSize:"14px",padding:"10px 13px",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
            />
          </div>
        ))}
        <button onClick={()=>allAnswered&&onSubmit(questions.map((_,i)=>answers[i]||""))} disabled={!allAnswered}
          style={{ background:allAnswered?"#c9a84c":"#1a1400",color:allAnswered?"#0a0800":"#4a5568",border:"none",borderRadius:"8px",padding:"11px 22px",fontWeight:800,cursor:allAnswered?"pointer":"not-allowed",fontSize:"14px",letterSpacing:"0.02em" }}>
          Convene the Council →
        </button>
      </div>
    </div>
  );
};

// ── Round Header ──────────────────────────────────────────────
const RoundHeader = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"24px 0 18px" }}>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.2))" }}/>
    <span style={{ fontSize:"10px", color:"rgba(201,168,76,0.6)", fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", padding:"4px 12px", border:"1px solid rgba(201,168,76,0.15)", borderRadius:"20px" }}>{label}</span>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.2))" }}/>
  </div>
);

// ── Debate Closed Banner ──────────────────────────────────────
const DebateClosedBanner = ({ onReveal, revealed }) => {
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVisible(true),200); return ()=>clearTimeout(t); },[]);
  if(revealed) return null;
  return (
    <div style={{ opacity:visible?1:0, transform:visible?"scale(1)":"scale(0.96)", transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)", margin:"28px 0" }}>
      <div style={{ background:"linear-gradient(135deg,#0d0a02,#0a0800)", border:"1px solid rgba(201,168,76,0.35)", borderRadius:"18px", padding:"28px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(to right,transparent,#c9a84c,transparent)" }}/>
        <div style={{ fontSize:"36px", marginBottom:"12px" }}>⚖️</div>
        <p style={{ color:"#c9a84c", fontWeight:800, fontSize:"13px", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:"8px" }}>The council has deliberated</p>
        <p style={{ color:"#6b7280", fontSize:"13px", lineHeight:"1.6", marginBottom:"22px", maxWidth:"360px", margin:"0 auto 22px" }}>
          Dan has reviewed all arguments and is ready to deliver the verdict.
        </p>
        <button onClick={onReveal} style={{
          background:"linear-gradient(135deg,#c9a84c,#a07830)",
          color:"#0a0800", border:"none", borderRadius:"10px",
          padding:"12px 28px", fontSize:"14px", fontWeight:800,
          cursor:"pointer", letterSpacing:"0.04em",
          boxShadow:"0 4px 20px rgba(201,168,76,0.3)",
        }}>
          Deliver the Verdict →
        </button>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(to right,transparent,#c9a84c,transparent)" }}/>
      </div>
    </div>
  );
};

// ── Verdict Block ─────────────────────────────────────────────
const VerdictBlock = ({ verdict }) => {
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVisible(true),100); return ()=>clearTimeout(t); },[]);

  return (
    <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)", margin:"8px 0 24px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px", justifyContent:"center" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4))" }}/>
        <Avatar char={DAN} size={40} active />
        <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"12px", letterSpacing:"0.12em", textTransform:"uppercase" }}>Dan's Verdict</span>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.4))" }}/>
      </div>

      <div style={{ background:"linear-gradient(160deg,#0d0a02,#080610)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"18px", padding:"22px", overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,#c9a84c,transparent)" }}/>

        {/* Insights */}
        {verdict.insights?.length>0&&(
          <div style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"10px",color:"rgba(201,168,76,0.6)",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"12px" }}>What the debate established</div>
            {verdict.insights.map((b,i)=>(
              <div key={i} style={{ display:"flex",gap:"10px",color:"#9ca3af",fontSize:"13px",lineHeight:"1.65",marginBottom:"10px" }}>
                <span style={{ color:"#c9a84c",flexShrink:0,marginTop:"3px",fontSize:"10px" }}>◆</span><span>{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* For / Against */}
        {(verdict.for_points?.length>0||verdict.against_points?.length>0)&&(
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px",marginBottom:"20px" }}>
            {verdict.for_points?.length>0&&(
              <div style={{ background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"12px",padding:"14px 16px" }}>
                <div style={{ fontSize:"10px",color:"#4ade80",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px" }}>✓ For</div>
                {verdict.for_points.map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:"8px",color:"#9ca3af",fontSize:"13px",lineHeight:"1.55",marginBottom:"8px" }}>
                    <span style={{ color:"#4ade80",flexShrink:0,fontWeight:700 }}>+</span><span>{p}</span>
                  </div>
                ))}
              </div>
            )}
            {verdict.against_points?.length>0&&(
              <div style={{ background:"rgba(251,146,60,0.05)",border:"1px solid rgba(251,146,60,0.2)",borderRadius:"12px",padding:"14px 16px" }}>
                <div style={{ fontSize:"10px",color:"#fb923c",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px" }}>✗ Against</div>
                {verdict.against_points.map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:"8px",color:"#9ca3af",fontSize:"13px",lineHeight:"1.55",marginBottom:"8px" }}>
                    <span style={{ color:"#fb923c",flexShrink:0,fontWeight:700 }}>−</span><span>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        {verdict.recommendation&&(
          <div style={{ background:"#0a0800",borderRadius:"14px",padding:"18px 20px",border:"1px solid rgba(201,168,76,0.3)",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)" }}/>
            <div style={{ fontSize:"10px",color:"#c9a84c",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"12px" }}>🎯 Dan's Recommendation</div>
            <p style={{ color:"#f3f4f6",fontSize:"15px",lineHeight:"1.8",margin:0,fontFamily:"'Georgia','Times New Roman',serif",fontWeight:400 }}>{verdict.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Loading ───────────────────────────────────────────────────
const LoadingPulse = ({ label, speaker }) => (
  <div style={{ display:"flex",alignItems:"center",gap:"12px",padding:"14px 0" }}>
    {speaker&&<Avatar char={speaker} size={32} active />}
    <div style={{ display:"flex",gap:"5px" }}>
      {[0,1,2].map(i=>(
        <div key={i} style={{ width:"6px",height:"6px",borderRadius:"50%",background:speaker?speaker.color:"#c9a84c",animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s` }}/>
      ))}
    </div>
    <span style={{ color:"#4a5568",fontSize:"13px" }}>{label}</span>
  </div>
);

// ── Question Bubble ───────────────────────────────────────────
const QuestionBubble = ({ text }) => (
  <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:"24px" }}>
    <div style={{ background:"#1a1a2e",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"14px 14px 2px 14px",padding:"13px 16px",maxWidth:"78%",fontSize:"15px",lineHeight:"1.6",color:"#e5e7eb",fontFamily:"'Georgia','Times New Roman',serif" }}>
      {text}
    </div>
  </div>
);

// ── Setup Screen ──────────────────────────────────────────────
const SetupScreen = ({ onStart }) => {
  const [selected, setSelected] = useState([]);
  const toggle = id => {
    if(selected.includes(id)) setSelected(p=>p.filter(s=>s!==id));
    else if(selected.length<4) setSelected(p=>[...p,id]);
  };
  const canStart = selected.length>=2;

  return (
    <div style={{ minHeight:"100vh",width:"100%",background:"#05060f",color:"#e5e7eb",fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth:"720px",margin:"0 auto",padding:"clamp(24px,5vw,56px) clamp(16px,4vw,24px)" }}>

        <div style={{ textAlign:"center",marginBottom:"clamp(28px,5vw,48px)" }}>
          <div style={{ fontSize:"clamp(44px,8vw,60px)",marginBottom:"16px" }}>⚖️</div>
          <h1 style={{ fontSize:"clamp(22px,5vw,32px)",fontWeight:800,marginBottom:"10px",background:"linear-gradient(135deg,#f3f4f6,#c9a84c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Georgia',serif" }}>
            The Council
          </h1>
          <p style={{ color:"#6b7280",fontSize:"clamp(13px,2vw,15px)",lineHeight:"1.65",maxWidth:"440px",margin:"0 auto" }}>
            Assemble 2–4 council members. Dan presides over every session as judge.
          </p>
        </div>

        {/* Dan */}
        <div style={{ background:"linear-gradient(135deg,#0d0a02,#0a0800)",border:"1px solid rgba(201,168,76,0.35)",borderRadius:"16px",padding:"16px 20px",marginBottom:"28px",display:"flex",alignItems:"center",gap:"14px" }}>
          <Avatar char={DAN} size={52} active />
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px" }}>
              <span style={{ fontWeight:800,color:"#c9a84c",fontSize:"15px",fontFamily:"'Georgia',serif" }}>Dan</span>
              <span style={{ fontSize:"10px",background:"rgba(201,168,76,0.15)",color:"#c9a84c",borderRadius:"4px",padding:"2px 8px",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase" }}>always present</span>
            </div>
            <div style={{ fontSize:"13px",color:"#6b7280" }}>Wise, neutral, seen everything. Gathers context before the debate. Steers. Delivers the verdict.</div>
          </div>
        </div>

        <h2 style={{ fontSize:"11px",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(201,168,76,0.5)",marginBottom:"14px" }}>
          Council Members &nbsp;<span style={{ color:selected.length>=2?"#4ade80":"rgba(201,168,76,0.3)" }}>({selected.length} / 4)</span>
        </h2>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))",gap:"10px",marginBottom:"32px" }}>
          {Object.values(CHARACTERS).map(c=>{
            const sel=selected.includes(c.id);
            return (
              <div key={c.id} onClick={()=>toggle(c.id)} style={{
                background:sel?hex2rgba(c.color,0.08):"#0a0a14",
                border:`1px solid ${sel?c.color:"rgba(255,255,255,0.05)"}`,
                borderRadius:"14px",padding:"16px",cursor:"pointer",
                transition:"all 0.2s",position:"relative",
              }}>
                {sel&&<div style={{ position:"absolute",top:"10px",right:"12px",color:c.color,fontSize:"13px",fontWeight:800 }}>✓</div>}
                <Avatar char={c} size={44} active={sel} />
                <div style={{ marginTop:"10px",fontWeight:800,fontSize:"14px",color:sel?c.color:"#e5e7eb",marginBottom:"3px",fontFamily:"'Georgia',serif" }}>{c.name}</div>
                <div style={{ fontSize:"11px",color:hex2rgba(c.color,0.7),marginBottom:"7px",fontStyle:"italic" }}>{c.title}</div>
                <div style={{ fontSize:"11px",color:"#6b7280",lineHeight:"1.45",marginBottom:"10px" }}>{c.description}</div>
                <div style={{ fontSize:"10px",background:hex2rgba(c.color,0.1),color:c.color,borderRadius:"4px",padding:"3px 8px",display:"inline-block",fontWeight:700,border:`1px solid ${hex2rgba(c.color,0.2)}` }}>
                  {c.lens}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={()=>canStart&&onStart(selected.map(id=>CHARACTERS[id]))} disabled={!canStart} style={{
          width:"100%",padding:"16px",
          background:canStart?"linear-gradient(135deg,#c9a84c,#a07830)":"#0a0a14",
          color:canStart?"#0a0800":"#374151",
          border:`1px solid ${canStart?"transparent":"rgba(255,255,255,0.05)"}`,
          borderRadius:"14px",fontSize:"clamp(14px,2vw,16px)",fontWeight:800,
          cursor:canStart?"pointer":"not-allowed",fontFamily:"'Georgia',serif",
          letterSpacing:"0.03em",boxShadow:canStart?"0 4px 20px rgba(201,168,76,0.25)":"none",
          transition:"all 0.2s",
        }}>
          {canStart?"Convene the Council →":"Select at least 2 council members"}
        </button>
      </div>
    </div>
  );
};

// ── Debate Screen ─────────────────────────────────────────────
const DebateScreen = ({ characters, onClose }) => {
  const [phase, setPhase] = useState("question");
  const [question, setQuestion] = useState("");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [loadingSpeaker, setLoadingSpeaker] = useState(null);
  const [history, setHistory] = useState([]);
  const [context, setContext] = useState({});
  const [checkinAnswer, setCheckinAnswer] = useState(null);
  const [followUpQ, setFollowUpQ] = useState("");
  const [verdictRevealed, setVerdictRevealed] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[feed,loading]);

  const post = async (path,body) => {
    const res = await fetch(`${API_URL}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    return res.json();
  };

  const charConfigs = characters.map(c=>({id:c.id,name:c.name,title:c.title,emoji:c.emoji,color:c.color,prompt:""}));

  const handleQuestion = async () => {
    if(!question.trim()) return;
    setPhase("loading");
    setFeed([{type:"question_bubble",text:question}]);
    setLoading(true); setLoadingLabel("Dan is preparing his questions…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/context",{question,characters:charConfigs});
      setFeed(p=>[...p,{type:"context_block",questions:data.questions}]);
      setPhase("context");
    } catch(e){console.error(e);}
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  const handleContextSubmit = async (answers) => {
    const ctxMap={};
    const qs=feed.find(f=>f.type==="context_block")?.questions||[];
    qs.forEach((q,i)=>{ctxMap[q]=answers[i];});
    setContext(ctxMap);
    setFeed(p=>p.map(f=>f.type==="context_block"?{...f,answered:true,answers}:f));
    setHistory(p=>[...p,{type:"user_context",text:Object.entries(ctxMap).map(([q,a])=>`${q} → ${a}`).join(" | ")}]);
    await runRound(1,ctxMap,null,[]);
  };

  const runRound = async (roundNum,ctx=context,checkinAns=checkinAnswer,currentHistory=history) => {
    setLoading(true);
    setFeed(p=>[...p,{type:"round_header",label:`Round ${roundNum}`}]);

    // Show each character speaking sequentially
    const turns=[];
    for(let i=0;i<characters.length;i++){
      const c=characters[i];
      setLoadingLabel(`${c.name} is speaking…`); setLoadingSpeaker(c); setActiveSpeaker(c.id);
      try {
        const data = await post("/debate/round",{
          question, characters:charConfigs, round:roundNum,
          context:ctx, checkin_answer:checkinAns,
          history:[...currentHistory,...turns],
          single_character: c.id, // new: request one character at a time
        });
        const turn = data.turns[0];
        if(turn){
          turns.push(turn);
          setFeed(p=>[...p,{type:"agent",...turn,feedIndex:p.length}]);
          setHistory(p=>[...p,turn]);
        }
      } catch(e){console.error(e);}
    }

    setActiveSpeaker("dan");
    setLoadingLabel("Dan is reviewing…"); setLoadingSpeaker(DAN);
    await runCheckin(ctx,[...currentHistory,...turns],roundNum);
    setActiveSpeaker(null); setLoading(false); setLoadingSpeaker(null);
  };

  const runCheckin = async (ctx,allHistory,roundNum) => {
    try {
      const data = await post("/debate/checkin",{question,characters:charConfigs,history:allHistory,context:ctx,round:roundNum});
      if(roundNum>=3){data.needs_more_round=false;data.question=null;}
      setFeed(p=>[...p,{type:"dan_checkin",summary:data.summary,question:data.question,answered:false,needsMoreRound:data.needs_more_round,roundNum}]);
      if(!data.needs_more_round){
        await runVerdict(ctx,checkinAnswer,allHistory);
      } else {
        setPhase("checkin");
      }
    } catch(e){console.error(e);}
  };

  const handleCheckinAnswer = async (answer,roundNum) => {
    setCheckinAnswer(answer);
    setFeed(p=>p.map(f=>f.type==="dan_checkin"&&!f.answered?{...f,answered:true,userAnswer:answer}:f));
    const nextRound=(roundNum||1)+1;
    await runRound(nextRound,context,answer,history);
  };

  const runVerdict = async (ctx,checkinAns,finalHistory=history) => {
    setActiveSpeaker("dan"); setLoadingLabel("Dan is writing the verdict…"); setLoadingSpeaker(DAN);
    try {
      const data = await post("/debate/verdict",{question,history:finalHistory,context:ctx,checkin_answer:checkinAns});
      setFeed(p=>[...p,{type:"verdict",data}]);
      setPhase("done");
    } catch(e){console.error(e);}
    setActiveSpeaker(null); setLoadingSpeaker(null);
  };

  const handleFollowUp = async () => {
    if(!followUpQ.trim()) return;
    const q=followUpQ.trim();
    setFollowUpQ(""); setQuestion(q);
    setHistory([]); setContext({}); setCheckinAnswer(null); setVerdictRevealed(false);
    setPhase("loading");
    setFeed([{type:"question_bubble",text:q}]);
    setLoading(true); setLoadingLabel("Dan is preparing questions…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data=await post("/debate/context",{question:q,characters:charConfigs});
      setFeed(p=>[...p,{type:"context_block",questions:data.questions}]);
      setPhase("context");
    } catch(e){console.error(e);}
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  let agentFeedIndex = 0;

  return (
    <div style={{ height:"100vh",width:"100%",background:"#05060f",color:"#e5e7eb",fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden" }}>

      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(201,168,76,0.12)",padding:"10px clamp(14px,4vw,20px)",display:"flex",alignItems:"center",gap:"10px",flexShrink:0,background:"#05060f" }}>
        <button onClick={onClose} style={{ background:"transparent",border:"none",color:"#4a5568",fontSize:"18px",cursor:"pointer",padding:"4px 8px 4px 0" }}>←</button>
        <CouncilSeats characters={characters} activeSpeaker={activeSpeaker} />
      </div>

      {/* Feed */}
      <div style={{ flex:1,overflowY:"auto",padding:"20px clamp(14px,4vw,24px)",background:"#05060f" }}>
        <div style={{ maxWidth:"700px",margin:"0 auto",width:"100%" }}>

          {phase==="question"&&(
            <div style={{ textAlign:"center",padding:"clamp(32px,8vw,80px) 0 24px" }}>
              <div style={{ fontSize:"48px",marginBottom:"16px" }}>⚖️</div>
              <p style={{ color:"#374151",fontSize:"15px",fontFamily:"'Georgia',serif" }}>The council is assembled. Present your question.</p>
            </div>
          )}

          {feed.map((item,i)=>{
            if(item.type==="question_bubble") return <QuestionBubble key={i} text={item.text}/>;
            if(item.type==="context_block") return <ContextBlock key={i} questions={item.questions} onSubmit={handleContextSubmit}/>;
            if(item.type==="round_header") return <RoundHeader key={i} label={item.label}/>;
            if(item.type==="agent"){
              const idx=agentFeedIndex++;
              return <AgentTurn key={i} turn={item} index={idx}/>;
            }
            if(item.type==="dan_checkin") return (
              <DanBlock key={i} summary={item.summary} question={item.question}
                needsMoreRound={item.needsMoreRound} answered={item.answered} userAnswer={item.userAnswer}
                onAnswer={ans=>handleCheckinAnswer(ans,item.roundNum)}/>
            );
            if(item.type==="verdict") return (
              <div key={i}>
                <DebateClosedBanner revealed={verdictRevealed} onReveal={()=>setVerdictRevealed(true)}/>
                {verdictRevealed&&<VerdictBlock verdict={item.data}/>}
              </div>
            );
            return null;
          })}

          {loading&&<LoadingPulse label={loadingLabel} speaker={loadingSpeaker}/>}

          {phase==="done"&&!loading&&verdictRevealed&&(
            <div style={{ marginTop:"24px",borderTop:"1px solid rgba(201,168,76,0.1)",paddingTop:"22px" }}>
              <p style={{ color:"#4a5568",fontSize:"13px",marginBottom:"12px" }}>Ask a follow-up to the same council, or close this session.</p>
              <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                <input value={followUpQ} onChange={e=>setFollowUpQ(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")handleFollowUp();}}
                  placeholder="Ask a follow-up…"
                  style={{ flex:"1 1 200px",minWidth:0,background:"#0a0a14",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"10px",color:"#e5e7eb",fontSize:"14px",padding:"11px 14px",outline:"none",fontFamily:"inherit" }}
                  onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
                />
                <button onClick={handleFollowUp} style={{ background:"#c9a84c",color:"#0a0800",border:"none",borderRadius:"10px",padding:"11px 18px",fontWeight:800,cursor:"pointer" }}>→</button>
                <button onClick={onClose} style={{ background:"#0a0a14",color:"#6b7280",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"10px",padding:"11px 14px",fontSize:"13px",cursor:"pointer" }}>
                  Close session
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Question input */}
      {phase==="question"&&(
        <div style={{ borderTop:"1px solid rgba(201,168,76,0.1)",padding:"14px clamp(14px,4vw,20px)",background:"#05060f",flexShrink:0 }}>
          <div style={{ maxWidth:"700px",margin:"0 auto",display:"flex",gap:"10px" }}>
            <input value={question} onChange={e=>setQuestion(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")handleQuestion();}}
              placeholder="Present your question to the council…"
              style={{ flex:1,minWidth:0,background:"#0a0a14",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"12px",color:"#e5e7eb",fontSize:"15px",padding:"13px 16px",outline:"none",fontFamily:"'Georgia',serif" }}
              onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
              autoFocus
            />
            <button onClick={handleQuestion} disabled={!question.trim()} style={{
              background:question.trim()?"linear-gradient(135deg,#c9a84c,#a07830)":"#0a0a14",
              color:question.trim()?"#0a0800":"#374151",
              border:"none",borderRadius:"12px",width:"48px",fontSize:"20px",
              cursor:question.trim()?"pointer":"not-allowed",flexShrink:0,
            }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("setup");
  const [characters, setCharacters] = useState([]);

  return (
    <div style={{ width:"100%",minHeight:"100vh",background:"#05060f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=Lora:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;background:#05060f;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.2);border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
      `}</style>
      {screen==="debate"
        ? <DebateScreen characters={characters} onClose={()=>{setScreen("setup");setCharacters([]);}}/>
        : <SetupScreen onStart={chars=>{setCharacters(chars);setScreen("debate");}}/>
      }
    </div>
  );
}