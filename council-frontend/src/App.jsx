import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = "https://councail.onrender.com";

const CHARACTERS = {
  surfer:    { id:"surfer",    name:"Maui",     title:"The Surfer",    emoji:"🏄", color:"#38bdf8", avatarBg:"#0c1f2e", description:"Risk & instinct. Reads situations like waves.", lens:"risk & instinct",       tagline:"The wave is forming. Will you paddle?" },
  inspector: { id:"inspector", name:"Lamia",    title:"The Inspector", emoji:"🔍", color:"#e879f9", avatarBg:"#1e0a2e", description:"Evidence & detail. Finds what others miss.",   lens:"evidence & detail",      tagline:"The truth is in what no one examined." },
  artist:    { id:"artist",    name:"Severn",   title:"The Artist",    emoji:"🎨", color:"#fb923c", avatarBg:"#2e1200", description:"Creativity & freedom. Challenges the premise.", lens:"creativity & freedom",   tagline:"The question itself may be the trap." },
  monk:      { id:"monk",      name:"Hoyt",     title:"The Monk",      emoji:"🧘", color:"#4ade80", avatarBg:"#021a0e", description:"Long-term & meaning. The 10-year lens.",        lens:"long-term meaning",      tagline:"In ten years, which choice will you mourn?" },
  general:   { id:"general",   name:"Morpurgo", title:"The General",   emoji:"⚔️", color:"#facc15", avatarBg:"#1a1400", description:"Strategy & consequences. No wishful thinking.", lens:"strategy & consequences",tagline:"Plans fail. Contingencies don't." },
};
const DAN = { id:"dan", name:"Dan", title:"The Judge", emoji:"🧑‍⚖️", color:"#c9a84c", avatarBg:"#0a0800",
  tagline:"I have presided over ten thousand decisions. Bring me yours." };

const hex2rgba = (hex, alpha) => {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Typewriter hook ───────────────────────────────────────────
const useTypewriter = (text, speed=18, enabled=true) => {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);
  useEffect(() => {
    if(!enabled){ setDisplayed(text); setDone(true); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if(i >= text.length){ clearInterval(tick); setDone(true); }
    }, speed);
    return () => clearInterval(tick);
  }, [text, speed, enabled]);
  return { displayed, done };
};

// ── Parse **bold** ────────────────────────────────────────────
const ParsedText = ({ text, fontSize="15px", color="#c8b99a", serif=true }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ fontSize, color, lineHeight:"1.8", fontFamily: serif?"'Palatino Linotype','Palatino','Book Antiqua',serif":"inherit" }}>
      {parts.map((p,i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} style={{ color:"#f5e6c8", fontWeight:700 }}>{p.slice(2,-2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
};

// ── SVG Avatars ───────────────────────────────────────────────
const Avatar = ({ char, size=56, active=false, glow=false }) => {
  const c = char.color;
  const bg = char.avatarBg || "#0a0a18";
  const shadow = glow
    ? `0 0 0 1px ${hex2rgba(c,0.6)}, 0 0 30px ${hex2rgba(c,0.4)}, 0 0 60px ${hex2rgba(c,0.15)}`
    : active
      ? `0 0 0 1px ${hex2rgba(c,0.5)}, 0 0 14px ${hex2rgba(c,0.25)}`
      : `0 0 0 1px ${hex2rgba(c,0.15)}`;
  const icons = {
    surfer:    <path d="M10 36 Q20 12 30 22 Q40 32 50 14" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
    inspector: <><circle cx="26" cy="26" r="11" stroke={c} strokeWidth="2" fill="none"/><line x1="34" y1="34" x2="46" y2="46" stroke={c} strokeWidth="2.5" strokeLinecap="round"/></>,
    artist:    <><path d="M14 40 Q18 18 32 16 Q46 14 46 28 Q46 42 32 44 Q22 45 14 40Z" stroke={c} strokeWidth="2" fill="none"/><circle cx="32" cy="28" r="4" fill={c} opacity="0.6"/></>,
    monk:      <><circle cx="32" cy="20" r="9" stroke={c} strokeWidth="2" fill="none"/><path d="M16 46 Q32 32 48 46" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><line x1="32" y1="29" x2="32" y2="38" stroke={c} strokeWidth="1.5"/></>,
    general:   <><path d="M18 18 L32 10 L46 18 L46 38 L32 46 L18 38Z" stroke={c} strokeWidth="2" fill="none"/><line x1="32" y1="18" x2="32" y2="38" stroke={c} strokeWidth="1.5"/><line x1="22" y1="28" x2="42" y2="28" stroke={c} strokeWidth="1.5"/></>,
    dan:       <><path d="M18 14 L46 14 L46 38 L32 46 L18 38Z" stroke={c} strokeWidth="2" fill="none"/><path d="M24 28 L30 34 L40 22" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  };
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`radial-gradient(circle at 35% 35%, ${hex2rgba(c,0.12)}, ${bg})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"box-shadow 0.4s ease", boxShadow:shadow }}>
      <svg width={size*.86} height={size*.86} viewBox="0 0 56 56">
        {icons[char.id] || <text x="28" y="34" textAnchor="middle" fontSize="24" fill={c}>{char.emoji}</text>}
      </svg>
    </div>
  );
};

// ── Council seats bar ─────────────────────────────────────────
const CouncilSeats = ({ characters, activeSpeaker }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(10px,2.5vw,22px)", padding:"10px 0 8px", flexWrap:"wrap" }}>
    {[DAN, ...characters].map(c => {
      const isActive = activeSpeaker === c.id;
      return (
        <div key={c.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px",
          opacity:activeSpeaker && !isActive ? 0.3 : 1,
          transform:isActive ? "scale(1.12)" : "scale(1)",
          transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <Avatar char={c} size={isActive?44:34} active={isActive} glow={isActive} />
          <span style={{ fontSize:"8px", color:isActive?c.color:"#4a4535", fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", transition:"color 0.3s" }}>{c.name}</span>
        </div>
      );
    })}
  </div>
);

// ── Dan Typewriter block ──────────────────────────────────────
const DanTypewriter = ({ text, onDone }) => {
  const { displayed, done } = useTypewriter(text, 16, true);
  useEffect(() => { if(done && onDone) onDone(); }, [done]);
  return <ParsedText text={displayed} fontSize="14px" color="#b8a882" serif={false} />;
};

// ── Dan block ─────────────────────────────────────────────────
const DanBlock = ({ summary, question, councilQuestion, needsMoreRound, onAnswer, answered, userAnswer, revealed, onReveal }) => {
  const [ans, setAns] = useState("");
  const [vis, setVis] = useState(false);
  const showQ = needsMoreRound && question && !answered;
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  if(!revealed) return (
    <div style={{ opacity:vis?1:0, transition:"opacity 0.4s", margin:"20px 0", display:"flex", justifyContent:"center" }}>
      <button onClick={onReveal} style={{
        display:"flex", alignItems:"center", gap:"9px",
        background:"transparent", border:"1px solid rgba(201,168,76,0.2)",
        borderRadius:"24px", padding:"8px 20px", cursor:"pointer",
        color:"rgba(201,168,76,0.55)", fontSize:"12px", fontWeight:600,
        letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif",
        transition:"all 0.2s",
      }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.5)"; e.currentTarget.style.color="#c9a84c"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.2)"; e.currentTarget.style.color="rgba(201,168,76,0.55)"; }}
      >
        <Avatar char={DAN} size={18} /> Dan speaks
      </button>
    </div>
  );

  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(10px)", transition:"all 0.4s ease", margin:"24px 0" }}>
      {/* Dan label */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.25))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={30} active />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", whiteSpace:"nowrap" }}>Dan — The Judge</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.25))" }}/>
      </div>

      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.95),rgba(8,6,0,0.98))", border:"1px solid rgba(201,168,76,0.14)", borderRadius:"12px", padding:"16px 20px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3),transparent)" }}/>

        {summary?.length > 0 && (
          <ul style={{ margin:`0 0 ${showQ||councilQuestion?14:0}px`, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"6px" }}>
            {summary.map((b,i) => (
              <li key={i} style={{ display:"flex", gap:"8px", alignItems:"baseline" }}>
                <span style={{ color:"rgba(201,168,76,0.4)", flexShrink:0, fontSize:"8px" }}>◆</span>
                <ParsedText text={b} fontSize="13px" color="#8a7a5a" serif={false} />
              </li>
            ))}
          </ul>
        )}

        {councilQuestion && !answered && (
          <div style={{ background:"rgba(201,168,76,0.04)", borderRadius:"8px", padding:"10px 14px", marginBottom:"12px", border:"1px solid rgba(201,168,76,0.1)" }}>
            <span style={{ fontSize:"10px", color:"rgba(201,168,76,0.45)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Dan asks {councilQuestion.to} →</span>
            <p style={{ color:"#b8a882", fontSize:"13px", lineHeight:"1.55", margin:"5px 0 0", fontFamily:"'Palatino Linotype',serif" }}>{councilQuestion.question}</p>
          </div>
        )}

        {showQ && (
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.08)", paddingTop:"14px" }}>
            <p style={{ color:"#d4c4a0", fontSize:"14px", marginBottom:"12px", lineHeight:"1.55", fontFamily:"'Palatino Linotype',serif" }}>{question}</p>
            <div style={{ display:"flex", gap:"8px" }}>
              <input value={ans} onChange={e=>setAns(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&ans.trim()){onAnswer(ans);setAns("");}}}
                placeholder="Speak…"
                style={{ flex:1,minWidth:0,background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"6px",color:"#d4c4a0",fontSize:"14px",padding:"9px 12px",outline:"none",fontFamily:"'Palatino Linotype',serif" }}
                onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.15)"}
              />
              <button onClick={()=>{if(ans.trim()){onAnswer(ans);setAns("");}}}
                style={{ background:"rgba(201,168,76,0.15)",color:"#c9a84c",border:"1px solid rgba(201,168,76,0.3)",borderRadius:"6px",padding:"9px 16px",fontWeight:700,cursor:"pointer",fontSize:"13px" }}>→</button>
            </div>
          </div>
        )}
        {answered&&question&&(
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.06)", paddingTop:"9px" }}>
            <p style={{ color:"#3a3020",fontSize:"11px" }}>✓ {question}</p>
            <p style={{ color:"#4a4030",fontSize:"12px",marginTop:"3px",fontStyle:"italic" }}>↩ {userAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Opening block with typewriter ────────────────────────────
const OpeningBlock = ({ text }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity:vis?1:0, transition:"opacity 0.6s", margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.25))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={30} active />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", whiteSpace:"nowrap" }}>Dan — The Judge</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.25))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.95),rgba(8,6,0,0.98))", border:"1px solid rgba(201,168,76,0.18)", borderRadius:"12px", padding:"18px 22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)" }}/>
        <DanTypewriter text={text} />
      </div>
    </div>
  );
};

// ── Context block ─────────────────────────────────────────────
const ContextBlock = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [vis, setVis] = useState(false);
  const allAnswered = questions.every((_,i) => answers[i]?.trim());
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(10px)", transition:"all 0.4s", margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.25))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={30} active />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", whiteSpace:"nowrap" }}>Dan — The Judge</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.25))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.95),rgba(8,6,0,0.98))", border:"1px solid rgba(201,168,76,0.18)", borderRadius:"12px", padding:"18px 22px", position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)" }}/>
        <p style={{ color:"#6a5c3a", fontSize:"12px", marginBottom:"18px", fontStyle:"italic", fontFamily:"'Palatino Linotype',serif" }}>Before the council convenes, I must understand your situation.</p>
        {questions.map((q,i) => (
          <div key={i} style={{ marginBottom:"16px" }}>
            <p style={{ color:"#d4c4a0", fontSize:"14px", marginBottom:"9px", lineHeight:"1.5", fontFamily:"'Palatino Linotype',serif" }}>{q}</p>
            <input value={answers[i]||""} onChange={e=>setAnswers(p=>({...p,[i]:e.target.value}))}
              onKeyDown={e=>{if(e.key==="Enter"&&allAnswered)onSubmit(questions.map((_,j)=>answers[j]||""));}}
              placeholder="Speak your truth…"
              style={{ width:"100%",background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"6px",color:"#d4c4a0",fontSize:"14px",padding:"10px 13px",outline:"none",fontFamily:"'Palatino Linotype',serif",boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.15)"}
            />
          </div>
        ))}
        <button onClick={()=>allAnswered&&onSubmit(questions.map((_,i)=>answers[i]||""))} disabled={!allAnswered}
          style={{ background:allAnswered?"rgba(201,168,76,0.12)":"transparent", color:allAnswered?"#c9a84c":"#3a3020", border:`1px solid ${allAnswered?"rgba(201,168,76,0.3)":"rgba(201,168,76,0.06)"}`, borderRadius:"6px", padding:"10px 22px", fontWeight:700, cursor:allAnswered?"pointer":"not-allowed", fontSize:"13px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>
          Convene the Council →
        </button>
      </div>
    </div>
  );
};

// ── Round header ──────────────────────────────────────────────
const RoundHeader = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"28px 0 20px" }}>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.12))" }}/>
    <span style={{ fontSize:"9px", color:"rgba(201,168,76,0.35)", fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", padding:"4px 14px", border:"1px solid rgba(201,168,76,0.08)", borderRadius:"20px", fontFamily:"'Palatino Linotype',serif" }}>{label}</span>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.12))" }}/>
  </div>
);

// ── Agent turn — slides from side ────────────────────────────
const AgentTurn = ({ turn, slideDir="left", respondingToDan=false }) => {
  const [vis, setVis] = useState(false);
  const [exp, setExp] = useState(false);
  const isLeft = slideDir === "left";
  const long = turn.text.length > 300;
  const displayText = exp||!long ? turn.text : turn.text.slice(0,300)+"…";
  useEffect(() => { const t = setTimeout(() => setVis(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:isLeft?"flex-start":"flex-end", marginBottom:"18px",
      opacity:vis?1:0, transform:vis?"translateX(0)":`translateX(${isLeft?"-44px":"44px"})`,
      transition:"all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
      {respondingToDan && (
        <div style={{ fontSize:"9px", color:"rgba(201,168,76,0.35)", marginBottom:"4px", [isLeft?"marginLeft":"marginRight"]:"52px", letterSpacing:"0.08em", textTransform:"uppercase" }}>responding to Dan</div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", flexDirection:isLeft?"row":"row-reverse", maxWidth:"92%" }}>
        <Avatar char={turn} size={42} active />
        <div style={{
          background:`linear-gradient(150deg,${hex2rgba(turn.color,0.07)},${hex2rgba(turn.color,0.03)})`,
          border:`1px solid ${hex2rgba(turn.color,0.2)}`,
          borderRadius:isLeft?"3px 14px 14px 14px":"14px 3px 14px 14px",
          padding:"14px 18px", position:"relative",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
            <span style={{ color:turn.color, fontWeight:800, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>{turn.name}</span>
            <span style={{ color:hex2rgba(turn.color,0.4), fontSize:"10px", fontStyle:"italic" }}>{turn.title}</span>
            {turn.position_updated && <span style={{ fontSize:"9px", background:hex2rgba(turn.color,0.12), color:turn.color, borderRadius:"4px", padding:"2px 6px", fontWeight:700 }}>↻ shifted</span>}
            {long && <button onClick={()=>setExp(!exp)} style={{ marginLeft:"auto", fontSize:"10px", color:"#4a4030", background:"transparent", border:"none", cursor:"pointer" }}>{exp?"↑":"↓"}</button>}
          </div>
          <ParsedText text={displayText} fontSize="15px" color="#c8b99a" />
        </div>
      </div>
    </div>
  );
};

// ── Speaker picker ────────────────────────────────────────────
const SpeakerPicker = ({ pitches, onChoose, loading }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(10px)", transition:"all 0.35s ease", margin:"18px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.12))" }}/>
        <span style={{ fontSize:"9px", color:"rgba(201,168,76,0.35)", fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>Who shall speak?</span>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.12))" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
        {pitches.map((p, i) => (
          <button key={p.character_id} onClick={() => !loading && onChoose(p.character_id)}
            disabled={loading}
            style={{ display:"flex", alignItems:"center", gap:"12px",
              background:"rgba(201,168,76,0.02)", border:`1px solid ${hex2rgba(p.char.color,0.18)}`,
              borderRadius:"10px", padding:"12px 15px", cursor:loading?"not-allowed":"pointer",
              textAlign:"left", transition:"all 0.18s", opacity:loading?0.5:1,
              animation:`fadeSlideIn 0.3s ease ${i*0.06}s both`,
            }}
            onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.background=hex2rgba(p.char.color,0.07); e.currentTarget.style.borderColor=hex2rgba(p.char.color,0.45); }}}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(201,168,76,0.02)"; e.currentTarget.style.borderColor=hex2rgba(p.char.color,0.18); }}
          >
            <Avatar char={p.char} size={34} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"10px", color:p.char.color, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"4px", fontFamily:"'Palatino Linotype',serif" }}>{p.char.name}</div>
              <ParsedText text={p.pitch} fontSize="13px" color="#7a6a4a" serif={false} />
            </div>
            <span style={{ color:"rgba(201,168,76,0.25)", fontSize:"14px" }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Debate closed banner ──────────────────────────────────────
const DebateClosedBanner = ({ onReveal, revealed }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 200); return () => clearTimeout(t); }, []);
  if(revealed) return null;
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"scale(1)":"scale(0.97)", transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)", margin:"30px 0", textAlign:"center" }}>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.97),rgba(5,4,0,0.99))", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"16px", padding:"30px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)" }}/>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3),transparent)" }}/>
        <div style={{ fontSize:"32px", marginBottom:"14px", opacity:0.8 }}>⚖️</div>
        <p style={{ color:"rgba(201,168,76,0.6)", fontWeight:700, fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"8px", fontFamily:"'Palatino Linotype',serif" }}>The council has spoken</p>
        <p style={{ color:"#4a3e28", fontSize:"13px", lineHeight:"1.6", marginBottom:"22px", fontFamily:"'Palatino Linotype',serif", fontStyle:"italic" }}>Dan is ready to deliver his judgment.</p>
        <button onClick={onReveal} style={{ background:"rgba(201,168,76,0.1)", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.35)", borderRadius:"8px", padding:"11px 28px", fontSize:"13px", fontWeight:700, cursor:"pointer", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(201,168,76,0.18)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(201,168,76,0.1)"; }}
        >Hear the verdict</button>
      </div>
    </div>
  );
};

// ── Verdict ───────────────────────────────────────────────────
const VerdictBlock = ({ verdict }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(16px)", transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)", margin:"8px 0 28px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={36} active glow />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>Dan's Judgment</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.3))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.98),rgba(5,4,0,0.99))", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"16px", padding:"22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)" }}/>

        {verdict.insights?.length>0 && (
          <div style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"9px",color:"rgba(201,168,76,0.35)",fontWeight:800,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:"12px",fontFamily:"'Palatino Linotype',serif" }}>What was established</div>
            {verdict.insights.map((b,i) => (
              <div key={i} style={{ display:"flex",gap:"10px",marginBottom:"10px",alignItems:"baseline" }}>
                <span style={{ color:"rgba(201,168,76,0.3)",flexShrink:0,fontSize:"8px" }}>◆</span>
                <ParsedText text={b} fontSize="13px" color="#8a7a5a" serif={false}/>
              </div>
            ))}
          </div>
        )}

        {(verdict.for_points?.length>0||verdict.against_points?.length>0) && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px",marginBottom:"20px" }}>
            {verdict.for_points?.length>0 && (
              <div style={{ background:"rgba(74,222,128,0.04)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:"10px",padding:"14px 16px" }}>
                <div style={{ fontSize:"9px",color:"rgba(74,222,128,0.6)",fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"10px",fontFamily:"'Palatino Linotype',serif" }}>For</div>
                {verdict.for_points.map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:"8px",marginBottom:"9px",alignItems:"baseline" }}>
                    <span style={{ color:"rgba(74,222,128,0.5)",flexShrink:0,fontSize:"12px" }}>+</span>
                    <ParsedText text={p} fontSize="13px" color="#8a9a88" serif={false}/>
                  </div>
                ))}
              </div>
            )}
            {verdict.against_points?.length>0 && (
              <div style={{ background:"rgba(251,146,60,0.04)",border:"1px solid rgba(251,146,60,0.15)",borderRadius:"10px",padding:"14px 16px" }}>
                <div style={{ fontSize:"9px",color:"rgba(251,146,60,0.6)",fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"10px",fontFamily:"'Palatino Linotype',serif" }}>Against</div>
                {verdict.against_points.map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:"8px",marginBottom:"9px",alignItems:"baseline" }}>
                    <span style={{ color:"rgba(251,146,60,0.5)",flexShrink:0,fontSize:"12px" }}>−</span>
                    <ParsedText text={p} fontSize="13px" color="#9a8878" serif={false}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {verdict.recommendation && (
          <div style={{ background:"rgba(0,0,0,0.4)",borderRadius:"10px",padding:"18px 20px",border:"1px solid rgba(201,168,76,0.2)",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3),transparent)" }}/>
            <div style={{ fontSize:"9px",color:"rgba(201,168,76,0.45)",fontWeight:800,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:"12px",fontFamily:"'Palatino Linotype',serif" }}>🎯 The Judgment</div>
            <ParsedText text={verdict.recommendation} fontSize="16px" color="#e8d8b0" />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Loading ───────────────────────────────────────────────────
const LoadingPulse = ({ label, speaker }) => (
  <div style={{ display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",opacity:0.6 }}>
    {speaker && <Avatar char={speaker} size={26} active/>}
    <div style={{ display:"flex",gap:"4px" }}>
      {[0,1,2].map(i=>(
        <div key={i} style={{ width:"5px",height:"5px",borderRadius:"50%",background:speaker?speaker.color:"#c9a84c",animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s` }}/>
      ))}
    </div>
    {label && <span style={{ color:"#3a3020",fontSize:"12px",fontStyle:"italic",fontFamily:"'Palatino Linotype',serif" }}>{label}</span>}
  </div>
);

// ── Question bubble ───────────────────────────────────────────
const QuestionBubble = ({ text }) => (
  <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:"22px" }}>
    <div style={{ background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"14px 14px 3px 14px",padding:"13px 18px",maxWidth:"80%" }}>
      <ParsedText text={text} fontSize="16px" color="#d4c4a0"/>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// SETUP SCREEN — Mythological oracle opening
// ══════════════════════════════════════════════════════════════
const SetupScreen = ({ onStart }) => {
  const [stage, setStage] = useState("intro");   // intro | assembling | ready
  const [selected, setSelected] = useState([]);
  const [introStep, setIntroStep] = useState(0); // 0=fade in title, 1=show tagline, 2=show enter
  const [charReveal, setCharReveal] = useState(-1); // which char index revealed so far
  const introTexts = [
    "There are decisions that define you.",
    "Not every advisor will tell you the truth.",
    "The Council will."
  ];

  // Intro sequence
  useEffect(() => {
    if(stage !== "intro") return;
    const timers = [
      setTimeout(() => setIntroStep(1), 900),
      setTimeout(() => setIntroStep(2), 2200),
      setTimeout(() => setIntroStep(3), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  // Character card reveal sequence
  useEffect(() => {
    if(stage !== "assembling") return;
    const chars = Object.values(CHARACTERS);
    let i = 0;
    const tick = () => {
      if(i <= chars.length) { setCharReveal(i); i++; setTimeout(tick, 160); }
      else setTimeout(() => setStage("ready"), 300);
    };
    setTimeout(tick, 200);
  }, [stage]);

  const toggle = id => {
    if(selected.includes(id)) setSelected(p => p.filter(s=>s!==id));
    else if(selected.length < 4) setSelected(p => [...p, id]);
  };
  const canStart = selected.length >= 2;
  const chars = Object.values(CHARACTERS);

  // ── Intro screen ──
  if(stage === "intro") return (
    <div style={{ minHeight:"100vh", background:"#020200", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"0", cursor:"default", position:"relative", overflow:"hidden" }}>
      {/* Ambient glow */}
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"600px", background:"radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ textAlign:"center", padding:"0 24px", maxWidth:"500px" }}>
        {/* Seal */}
        <div style={{ fontSize:"52px", marginBottom:"28px", opacity:introStep>=1?0.7:0, transition:"opacity 1.2s ease", filter:"sepia(0.3)" }}>⚖️</div>

        {/* Title */}
        <h1 style={{
          fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif",
          fontSize:"clamp(42px,8vw,72px)", fontWeight:400, letterSpacing:"0.18em",
          color:"#c9a84c", marginBottom:"6px",
          opacity:introStep>=1?1:0, transform:introStep>=1?"translateY(0)":"translateY(20px)",
          transition:"all 1.4s cubic-bezier(0.16,1,0.3,1)",
          textShadow:"0 0 40px rgba(201,168,76,0.2)",
        }}>THE COUNCIL</h1>

        <div style={{ width:"60px", height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)", margin:"16px auto 20px",
          opacity:introStep>=1?1:0, transition:"opacity 1.4s ease 0.3s" }}/>

        {/* Tagline */}
        <p style={{ fontFamily:"'Palatino Linotype',serif", fontSize:"clamp(13px,2vw,16px)", color:"rgba(201,168,76,0.4)", letterSpacing:"0.12em", lineHeight:"1.8", fontStyle:"italic",
          opacity:introStep>=2?1:0, transform:introStep>=2?"translateY(0)":"translateY(10px)",
          transition:"all 1s ease 0.2s", marginBottom:"40px" }}>
          {DAN.tagline}
        </p>

        {/* Enter button */}
        <button onClick={() => setStage("assembling")} style={{
          opacity:introStep>=3?1:0, transform:introStep>=3?"translateY(0)":"translateY(10px)",
          transition:"all 0.8s ease",
          background:"transparent", color:"rgba(201,168,76,0.6)", border:"1px solid rgba(201,168,76,0.25)",
          borderRadius:"4px", padding:"12px 36px", fontSize:"11px", fontWeight:700,
          letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer",
          fontFamily:"'Palatino Linotype',serif",
        }}
          onMouseEnter={e=>{ e.currentTarget.style.color="#c9a84c"; e.currentTarget.style.borderColor="rgba(201,168,76,0.5)"; e.currentTarget.style.background="rgba(201,168,76,0.05)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.color="rgba(201,168,76,0.6)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.25)"; e.currentTarget.style.background="transparent"; }}
        >
          Enter the Chamber
        </button>
      </div>
    </div>
  );

  // ── Assembling / ready screen ──
  return (
    <div style={{ minHeight:"100vh", background:"#020200", color:"#c8b99a", fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif", position:"relative", overflow:"hidden" }}>
      {/* Background texture */}
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%)", pointerEvents:"none" }}/>

      <div style={{ maxWidth:"800px", margin:"0 auto", padding:"clamp(24px,6vw,60px) clamp(16px,4vw,24px)" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"clamp(28px,5vw,48px)", opacity:stage==="ready"?1:0.7, transition:"opacity 0.8s" }}>
          <div style={{ fontSize:"24px", marginBottom:"10px", opacity:0.5 }}>⚖️</div>
          <h1 style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:400, letterSpacing:"0.2em", color:"#c9a84c", marginBottom:"6px", textTransform:"uppercase" }}>The Council</h1>
          <div style={{ width:"40px", height:"1px", background:"rgba(201,168,76,0.3)", margin:"10px auto 14px" }}/>
          <p style={{ color:"rgba(201,168,76,0.3)", fontSize:"12px", letterSpacing:"0.1em", fontStyle:"italic" }}>Assemble your council. You control who speaks.</p>
        </div>

        {/* Dan card */}
        <div style={{ background:"linear-gradient(135deg,rgba(13,10,2,0.9),rgba(8,6,0,0.95))", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"14px", padding:"18px 20px", marginBottom:"28px", display:"flex", alignItems:"center", gap:"16px",
          opacity:stage==="ready"?1:charReveal>=0?1:0, transition:"opacity 0.6s" }}>
          <Avatar char={DAN} size={54} active glow />
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"5px" }}>
              <span style={{ fontWeight:700, color:"#c9a84c", fontSize:"17px" }}>Dan</span>
              <span style={{ fontSize:"9px", background:"rgba(201,168,76,0.1)", color:"rgba(201,168,76,0.6)", borderRadius:"4px", padding:"2px 8px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>always present</span>
            </div>
            <p style={{ fontSize:"12px", color:"rgba(201,168,76,0.35)", fontStyle:"italic", lineHeight:"1.5", margin:0 }}>{DAN.tagline}</p>
          </div>
        </div>

        {/* Council label */}
        <div style={{ fontSize:"9px", fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(201,168,76,0.25)", marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
          <span>Council Members</span>
          <span style={{ color:selected.length>=2?"rgba(74,222,128,0.6)":"rgba(201,168,76,0.2)" }}>({selected.length} / 4)</span>
        </div>

        {/* Character cards — animate in one by one */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))", gap:"10px", marginBottom:"32px" }}>
          {chars.map((c, idx) => {
            const sel = selected.includes(c.id);
            const revealed = charReveal > idx || stage === "ready";
            return (
              <div key={c.id} onClick={() => revealed && toggle(c.id)}
                style={{
                  background:sel?hex2rgba(c.color,0.07):"rgba(201,168,76,0.02)",
                  border:`1px solid ${sel?hex2rgba(c.color,0.5):hex2rgba(c.color,0.12)}`,
                  borderRadius:"14px", padding:"18px", cursor:revealed?"pointer":"default",
                  transition:"all 0.25s",
                  opacity:revealed?1:0, transform:revealed?"translateY(0)":"translateY(16px)",
                  position:"relative",
                }}>
                {sel && <div style={{ position:"absolute", top:"12px", right:"14px", color:c.color, fontSize:"12px" }}>✓</div>}
                <Avatar char={c} size={46} active={sel} glow={sel} />
                <div style={{ marginTop:"12px", fontWeight:700, fontSize:"16px", color:sel?c.color:"#c8b99a", marginBottom:"3px" }}>{c.name}</div>
                <div style={{ fontSize:"11px", color:hex2rgba(c.color,0.5), marginBottom:"8px", fontStyle:"italic" }}>{c.title}</div>
                <p style={{ fontSize:"11px", color:"rgba(201,168,76,0.25)", lineHeight:"1.5", marginBottom:"10px", fontStyle:"italic" }}>"{c.tagline}"</p>
                <div style={{ fontSize:"9px", background:hex2rgba(c.color,0.08), color:hex2rgba(c.color,0.6), borderRadius:"4px", padding:"3px 8px", display:"inline-block", fontWeight:700, letterSpacing:"0.08em", border:`1px solid ${hex2rgba(c.color,0.15)}`, textTransform:"uppercase" }}>{c.lens}</div>
              </div>
            );
          })}
        </div>

        <button onClick={() => canStart && onStart(selected.map(id=>CHARACTERS[id]))} disabled={!canStart} style={{
          width:"100%", padding:"16px",
          background:canStart?"rgba(201,168,76,0.1)":"transparent",
          color:canStart?"#c9a84c":"rgba(201,168,76,0.2)",
          border:`1px solid ${canStart?"rgba(201,168,76,0.35)":"rgba(201,168,76,0.06)"}`,
          borderRadius:"10px", fontSize:"13px", fontWeight:700,
          cursor:canStart?"pointer":"not-allowed", letterSpacing:"0.14em", textTransform:"uppercase",
          transition:"all 0.2s",
        }}
          onMouseEnter={e=>{ if(canStart){ e.currentTarget.style.background="rgba(201,168,76,0.18)"; }}}
          onMouseLeave={e=>{ if(canStart){ e.currentTarget.style.background="rgba(201,168,76,0.1)"; }}}
        >
          {canStart ? "Enter the Chamber →" : "Select at least 2 council members"}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// DEBATE SCREEN
// ══════════════════════════════════════════════════════════════
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
  const [currentRound, setCurrentRound] = useState(1);
  const [remainingPickers, setRemainingPickers] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [entered, setEntered] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { setTimeout(() => setEntered(true), 50); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [feed, loading, pitches]);

  const post = async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    if(!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
  };

  const charConfigs = characters.map(c => ({ id:c.id, name:c.name, title:c.title, emoji:c.emoji, color:c.color, prompt:"" }));

  const handleQuestion = async () => {
    if(!question.trim()) return;
    setPhase("loading");
    setFeed([{ type:"question_bubble", text:question }]);
    setLoading(true); setLoadingLabel("Dan prepares his questions…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/context", { question, characters:charConfigs });
      if(data.questions && data.questions.length > 0) {
        setFeed(p => [...p, { type:"context_block", questions:data.questions }]);
        setPhase("context");
      } else {
        // General question — skip context, go straight to opening
        setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
        await startDebateFromContext({}, []);
      }
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  const startDebateFromContext = async (ctxMap, ctxHistory) => {
    setContext(ctxMap);
    setHistory(ctxHistory);
    setLoading(true); setLoadingLabel("Dan opens the session…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/opening", { question, characters:charConfigs, context:ctxMap });
      setFeed(p => [...p, { type:"opening", text:data.opening }]);
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
    setCurrentRound(1);
    await startRoundPicking(1, ctxMap, ctxHistory);
  };

  const handleContextSubmit = async (answers) => {
    const ctxMap = {};
    const qs = feed.find(f => f.type==="context_block")?.questions || [];
    qs.forEach((q,i) => { ctxMap[q] = answers[i]; });
    setFeed(p => p.map(f => f.type==="context_block" ? {...f, answered:true} : f));
    const ctxHistory = [{ type:"user_context", text:Object.entries(ctxMap).map(([q,a])=>`${q} → ${a}`).join(" | ") }];
    await startDebateFromContext(ctxMap, ctxHistory);
  };

  const startRoundPicking = async (roundNum, ctx=context, hist=history) => {
    setFeed(p => [...p, { type:"round_header", label:`Round ${roundNum}` }]);
    setPhase("picking");
    setLoading(true); setLoadingLabel("The council prepares their arguments…"); setLoadingSpeaker(null); setActiveSpeaker(null);

    const fetchedPitches = [];
    for(const c of characters) {
      try {
        const data = await post("/debate/single_sentence", { question, character_id:c.id, characters:charConfigs, round:roundNum, context:ctx, history:hist });
        fetchedPitches.push({ character_id:c.id, pitch:data.pitch, char:c });
      } catch(e) { console.error(e); }
    }
    setPitches(fetchedPitches);
    setRemainingPickers(characters.map(c => c.id));
    setLoading(false);
    setFeed(p => [...p, { type:"picker", roundNum, pitches:fetchedPitches }]);
  };

  const handlePickSpeaker = async (characterId) => {
    setFeed(p => p.map(f => f.type==="picker" ? {...f, chosen:characterId} : f));
    const char = characters.find(c => c.id===characterId);
    setActiveSpeaker(characterId);
    setLoading(true); setLoadingLabel(`${char.name} speaks…`); setLoadingSpeaker(char);

    try {
      const data = await post("/debate/single_turn", { question, character_id:characterId, characters:charConfigs, round:currentRound, context, checkin_answer:checkinAnswer, history });
      const turn = data.turn;
      const newHistory = [...history, turn];
      setHistory(newHistory);
      const roundTurns = newHistory.filter(h => h.round===currentRound && h.type==="agent");
      const idx = roundTurns.length - 1;
      setFeed(p => [...p, { type:"agent", ...turn, slideDir:idx%2===0?"left":"right" }]);

      const newRemaining = remainingPickers.filter(id => id!==characterId);
      setRemainingPickers(newRemaining);

      if(newRemaining.length > 0) {
        const newPitches = pitches.filter(p => newRemaining.includes(p.character_id));
        setFeed(p => [...p, { type:"picker", roundNum:currentRound, pitches:newPitches }]);
        setPhase("picking");
      } else {
        setActiveSpeaker("dan");
        setLoadingLabel("Dan deliberates…"); setLoadingSpeaker(DAN);
        await runCheckin(currentRound, newHistory);
      }
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  const runCheckin = async (roundNum, hist=history) => {
    try {
      const data = await post("/debate/checkin", { question, characters:charConfigs, history:hist, context, round:roundNum });
      if(roundNum >= 3){ data.needs_more_round=false; data.question=null; }

      let councilResponseTurn = null;
      if(data.council_question?.to) {
        const targetChar = characters.find(c => c.name===data.council_question.to);
        if(targetChar) {
          setActiveSpeaker(targetChar.id); setLoadingLabel(`${targetChar.name} responds to Dan…`); setLoadingSpeaker(targetChar);
          try {
            const resp = await post("/debate/council_response", { question, character_id:targetChar.id, characters:charConfigs, round:roundNum, context, checkin_answer:data.council_question.question, history:hist });
            councilResponseTurn = resp.turn;
            hist = [...hist, councilResponseTurn];
            setHistory(hist);
          } catch(e) { console.error(e); }
          setActiveSpeaker(null); setLoadingSpeaker(null);
        }
      }

      setFeed(p => [
        ...p,
        { type:"dan_checkin", summary:data.summary, question:data.question, councilQuestion:data.council_question, answered:false, needsMoreRound:data.needs_more_round, roundNum, revealed:false },
        ...(councilResponseTurn ? [{ type:"agent", ...councilResponseTurn, slideDir:"right", respondingToDan:true }] : []),
      ]);

      if(!data.needs_more_round) await runVerdict(hist);
      else setPhase("checkin");
    } catch(e) { console.error(e); }
  };

  const handleCheckinAnswer = async (answer, roundNum) => {
    setCheckinAnswer(answer);
    setFeed(p => p.map(f => f.type==="dan_checkin"&&!f.answered ? {...f,answered:true,userAnswer:answer} : f));
    const nextRound = (roundNum||1)+1;
    setCurrentRound(nextRound);
    await startRoundPicking(nextRound);
  };

  const runVerdict = async (hist=history) => {
    setActiveSpeaker("dan"); setLoadingLabel("Dan writes his judgment…"); setLoadingSpeaker(DAN);
    try {
      const data = await post("/debate/verdict", { question, history:hist, context, checkin_answer:checkinAnswer });
      setFeed(p => [...p, { type:"verdict", data }]);
      setPhase("done");
    } catch(e) { console.error(e); }
    setActiveSpeaker(null); setLoadingSpeaker(null);
  };

  const handleFollowUp = async () => {
    if(!followUpQ.trim()) return;
    const q = followUpQ.trim();
    setFollowUpQ(""); setQuestion(q);
    setHistory([]); setContext({}); setCheckinAnswer(null);
    setVerdictRevealed(false); setCurrentRound(1); setPitches([]); setRemainingPickers([]);
    setPhase("loading");
    setFeed([{ type:"question_bubble", text:q }]);
    setLoading(true); setLoadingLabel("Dan prepares…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/context", { question:q, characters:charConfigs });
      if(data.questions && data.questions.length > 0) {
        setFeed(p => [...p, { type:"context_block", questions:data.questions }]);
        setPhase("context");
      } else {
        setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
        await startDebateFromContext({}, []);
      }
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  return (
    <div style={{ height:"100vh", width:"100%", background:"#020200", color:"#c8b99a", fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif",
      display:"flex", flexDirection:"column", overflow:"hidden",
      opacity:entered?1:0, transform:entered?"translateY(0)":"translateY(20px)", transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>

      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(201,168,76,0.08)", padding:"8px clamp(12px,4vw,20px)", flexShrink:0, background:"rgba(2,2,0,0.97)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"rgba(201,168,76,0.3)", fontSize:"16px", cursor:"pointer", padding:"4px 8px 4px 0", flexShrink:0 }}>←</button>
          <CouncilSeats characters={characters} activeSpeaker={activeSpeaker} />
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px clamp(12px,4vw,24px)", background:"#020200" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", width:"100%" }}>

          {phase === "question" && (
            <div style={{ textAlign:"center", padding:"clamp(40px,10vw,90px) 0 24px" }}>
              <div style={{ fontSize:"40px", marginBottom:"16px", opacity:0.4 }}>⚖️</div>
              <p style={{ color:"rgba(201,168,76,0.25)", fontSize:"15px", fontStyle:"italic", letterSpacing:"0.05em" }}>The council awaits your question.</p>
            </div>
          )}

          {feed.map((item, i) => {
            if(item.type==="question_bubble") return <QuestionBubble key={i} text={item.text}/>;
            if(item.type==="context_block") return <ContextBlock key={i} questions={item.questions} onSubmit={handleContextSubmit}/>;
            if(item.type==="opening") return <OpeningBlock key={i} text={item.text}/>;
            if(item.type==="round_header") return <RoundHeader key={i} label={item.label}/>;
            if(item.type==="agent") return <AgentTurn key={i} turn={item} slideDir={item.slideDir||"left"} respondingToDan={item.respondingToDan}/>;
            if(item.type==="picker") {
              const isLatest = feed.filter(f=>f.type==="picker").at(-1)===item;
              if(!isLatest||phase!=="picking") return null;
              return <SpeakerPicker key={i} pitches={item.pitches} onChoose={handlePickSpeaker} loading={loading}/>;
            }
            if(item.type==="dan_checkin") return (
              <DanBlock key={i} summary={item.summary} question={item.question} councilQuestion={item.councilQuestion}
                needsMoreRound={item.needsMoreRound} answered={item.answered} userAnswer={item.userAnswer}
                revealed={item.revealed}
                onReveal={()=>setFeed(p=>p.map((f,j)=>j===i?{...f,revealed:true}:f))}
                onAnswer={ans=>handleCheckinAnswer(ans,item.roundNum)}
              />
            );
            if(item.type==="verdict") return (
              <div key={i}>
                <DebateClosedBanner revealed={verdictRevealed} onReveal={()=>setVerdictRevealed(true)}/>
                {verdictRevealed && <VerdictBlock verdict={item.data}/>}
              </div>
            );
            return null;
          })}

          {loading && <LoadingPulse label={loadingLabel} speaker={loadingSpeaker}/>}

          {phase==="done" && !loading && verdictRevealed && (
            <div style={{ marginTop:"28px", borderTop:"1px solid rgba(201,168,76,0.06)", paddingTop:"22px" }}>
              <p style={{ color:"rgba(201,168,76,0.2)", fontSize:"12px", marginBottom:"12px", fontStyle:"italic", letterSpacing:"0.06em" }}>Pose another question to the council, or take your leave.</p>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                <input value={followUpQ} onChange={e=>setFollowUpQ(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")handleFollowUp();}}
                  placeholder="Another question…"
                  style={{ flex:"1 1 200px", minWidth:0, background:"rgba(201,168,76,0.03)", border:"1px solid rgba(201,168,76,0.12)", borderRadius:"6px", color:"#d4c4a0", fontSize:"14px", padding:"10px 14px", outline:"none", fontFamily:"'Palatino Linotype',serif" }}
                  onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.35)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.12)"}
                />
                <button onClick={handleFollowUp} style={{ background:"rgba(201,168,76,0.08)", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"6px", padding:"10px 18px", fontWeight:700, cursor:"pointer", fontSize:"13px" }}>→</button>
                <button onClick={onClose} style={{ background:"transparent", color:"rgba(201,168,76,0.25)", border:"1px solid rgba(201,168,76,0.08)", borderRadius:"6px", padding:"10px 14px", fontSize:"12px", cursor:"pointer", letterSpacing:"0.06em" }}>Leave</button>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Question input */}
      {phase==="question" && (
        <div style={{ borderTop:"1px solid rgba(201,168,76,0.06)", padding:"14px clamp(12px,4vw,20px)", background:"rgba(2,2,0,0.97)", flexShrink:0 }}>
          <div style={{ maxWidth:"700px", margin:"0 auto", display:"flex", gap:"10px" }}>
            <input value={question} onChange={e=>setQuestion(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")handleQuestion();}}
              placeholder="What is your question for the council?"
              style={{ flex:1, minWidth:0, background:"rgba(201,168,76,0.03)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:"8px", color:"#d4c4a0", fontSize:"16px", padding:"13px 16px", outline:"none", fontFamily:"'Palatino Linotype',serif" }}
              onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.15)"}
              autoFocus
            />
            <button onClick={handleQuestion} disabled={!question.trim()} style={{
              background:question.trim()?"rgba(201,168,76,0.1)":"transparent",
              color:question.trim()?"#c9a84c":"rgba(201,168,76,0.2)",
              border:`1px solid ${question.trim()?"rgba(201,168,76,0.35)":"rgba(201,168,76,0.06)"}`,
              borderRadius:"8px", width:"48px", fontSize:"18px",
              cursor:question.trim()?"pointer":"not-allowed", flexShrink:0,
            }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("setup");
  const [characters, setCharacters] = useState([]);

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#020200" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;background:#020200;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.15);border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:.8;transform:scale(1)}}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      `}</style>
      {screen==="debate"
        ? <DebateScreen characters={characters} onClose={()=>{setScreen("setup");setCharacters([]);}}/>
        : <SetupScreen onStart={chars=>{setCharacters(chars);setScreen("debate");}}/>
      }
    </div>
  );
}