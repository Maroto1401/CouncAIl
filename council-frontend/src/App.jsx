import { useState, useRef, useEffect } from "react";

const API_URL = "https://councail.onrender.com";

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

// Parse **bold** markers in text
const ParsedText = ({ text, fontSize="15px", color="#d1d5db" }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ fontSize, color, lineHeight:"1.75", fontFamily:"'Lora','Georgia',serif" }}>
      {parts.map((p,i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} style={{ color:"#f9fafb", fontWeight:700 }}>{p.slice(2,-2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
};

// SVG Avatars
const Avatar = ({ char, size=56, active=false, pulse=false }) => {
  const c = char.color;
  const bg = char.avatarBg || "#0a0a18";
  const glowStyle = active
    ? { boxShadow:`0 0 0 2px ${c}, 0 0 18px ${hex2rgba(c,0.35)}` }
    : { boxShadow:`0 0 0 1px ${hex2rgba(c,0.25)}` };

  const icons = {
    surfer:    <path d="M10 36 Q20 12 30 22 Q40 32 50 14" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
    inspector: <><circle cx="26" cy="26" r="11" stroke={c} strokeWidth="2" fill="none"/><line x1="34" y1="34" x2="46" y2="46" stroke={c} strokeWidth="2.5" strokeLinecap="round"/></>,
    artist:    <><path d="M14 40 Q18 18 32 16 Q46 14 46 28 Q46 42 32 44 Q22 45 14 40Z" stroke={c} strokeWidth="2" fill="none"/><circle cx="32" cy="28" r="4" fill={c} opacity="0.7"/></>,
    monk:      <><circle cx="32" cy="20" r="9" stroke={c} strokeWidth="2" fill="none"/><path d="M16 46 Q32 32 48 46" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><line x1="32" y1="29" x2="32" y2="38" stroke={c} strokeWidth="1.5"/></>,
    general:   <><path d="M18 18 L32 10 L46 18 L46 38 L32 46 L18 38Z" stroke={c} strokeWidth="2" fill="none"/><line x1="32" y1="18" x2="32" y2="38" stroke={c} strokeWidth="1.5"/><line x1="22" y1="28" x2="42" y2="28" stroke={c} strokeWidth="1.5"/></>,
    dan:       <><path d="M18 14 L46 14 L46 38 L32 46 L18 38Z" stroke={c} strokeWidth="2" fill="none"/><path d="M24 28 L30 34 L40 22" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  };

  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", background:bg,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      transition:"all 0.3s ease", ...glowStyle,
      animation: pulse ? "ringPulse 1.8s ease-in-out infinite" : "none",
    }}>
      <svg width={size*0.86} height={size*0.86} viewBox="0 0 56 56">
        {icons[char.id] || <text x="28" y="34" textAnchor="middle" fontSize="24" fill={c}>{char.emoji}</text>}
      </svg>
    </div>
  );
};

// Council seats bar at top of debate
const CouncilSeats = ({ characters, activeSpeaker }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(10px,3vw,24px)", padding:"12px 0 10px", flexWrap:"wrap" }}>
    {[DAN, ...characters].map(c => {
      const isActive = activeSpeaker === c.id;
      return (
        <div key={c.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px",
          opacity: activeSpeaker && !isActive ? 0.35 : 1, transition:"all 0.3s",
          transform: isActive ? "scale(1.1)" : "scale(1)" }}>
          <Avatar char={c} size={isActive ? 46 : 36} active={isActive} pulse={isActive} />
          <span style={{ fontSize:"9px", color: isActive ? c.color : "#4a5568",
            fontWeight:800, letterSpacing:"0.07em", textTransform:"uppercase", transition:"color 0.3s" }}>
            {c.name}
          </span>
        </div>
      );
    })}
  </div>
);

// Agent turn — slides in from left or right
const AgentTurn = ({ turn, slideDir="left", respondingToDan=false }) => {
  const [vis, setVis] = useState(false);
  const [exp, setExp] = useState(false);
  const isLeft = slideDir === "left";
  const long = turn.text.length > 280;
  const displayText = exp || !long ? turn.text : turn.text.slice(0, 280) + "…";

  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      alignItems: isLeft ? "flex-start" : "flex-end",
      marginBottom:"16px",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateX(0)" : `translateX(${isLeft ? "-48px" : "48px"})`,
      transition:"all 0.42s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {respondingToDan && (
        <div style={{ fontSize:"10px", color:"#c9a84c", marginBottom:"4px",
          [isLeft?"marginLeft":"marginRight"]:"54px", opacity:0.7 }}>
          ↳ responding to Dan
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px",
        flexDirection: isLeft ? "row" : "row-reverse", maxWidth:"90%" }}>
        <div style={{ flexShrink:0 }}>
          <Avatar char={turn} size={44} active />
        </div>
        <div style={{
          background:`linear-gradient(135deg,${hex2rgba(turn.color,0.09)},${hex2rgba(turn.color,0.04)})`,
          border:`1px solid ${hex2rgba(turn.color,0.28)}`,
          borderRadius: isLeft ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
          padding:"14px 18px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
            <span style={{ color:turn.color, fontWeight:800, fontSize:"13px", letterSpacing:"0.07em", textTransform:"uppercase" }}>{turn.name}</span>
            <span style={{ color:hex2rgba(turn.color,0.5), fontSize:"11px", fontStyle:"italic" }}>{turn.title}</span>
            {turn.position_updated && (
              <span style={{ fontSize:"10px", background:hex2rgba(turn.color,0.15), color:turn.color,
                borderRadius:"4px", padding:"2px 7px", fontWeight:700, border:`1px solid ${hex2rgba(turn.color,0.3)}` }}>
                ↻ stance shifted
              </span>
            )}
            {long && (
              <button onClick={() => setExp(!exp)}
                style={{ marginLeft:"auto", fontSize:"10px", color:"#4a5568", background:"transparent", border:"none", cursor:"pointer" }}>
                {exp ? "collapse ↑" : "expand ↓"}
              </button>
            )}
          </div>
          <ParsedText text={displayText} fontSize="15px" color="#d1d5db" />
        </div>
      </div>
    </div>
  );
};

// Speaker picker — shows one-sentence pitches, user clicks to choose
const SpeakerPicker = ({ pitches, onChoose, loading }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(12px)", transition:"all 0.4s ease", margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.2))" }}/>
        <span style={{ fontSize:"10px", color:"rgba(201,168,76,0.6)", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase" }}>
          Choose who speaks next
        </span>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.2))" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {pitches.map((p, i) => {
          const char = { ...p.char, id: p.char.id };
          return (
            <button key={p.character_id} onClick={() => !loading && onChoose(p.character_id)}
              disabled={loading}
              style={{
                display:"flex", alignItems:"flex-start", gap:"12px",
                background:"#08080f", border:`1px solid ${hex2rgba(p.char.color, 0.25)}`,
                borderRadius:"12px", padding:"13px 15px", cursor:loading?"not-allowed":"pointer",
                textAlign:"left", transition:"all 0.18s",
                opacity: loading ? 0.5 : 1,
                animation: `fadeSlideIn 0.3s ease ${i*0.07}s both`,
              }}
              onMouseEnter={e => { if(!loading){ e.currentTarget.style.background=hex2rgba(p.char.color,0.08); e.currentTarget.style.borderColor=p.char.color; }}}
              onMouseLeave={e => { e.currentTarget.style.background="#08080f"; e.currentTarget.style.borderColor=hex2rgba(p.char.color,0.25); }}
            >
              <Avatar char={p.char} size={36} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"11px", color:p.char.color, fontWeight:800, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"5px" }}>
                  {p.char.name} · {p.char.title}
                </div>
                <ParsedText text={p.pitch} fontSize="14px" color="#9ca3af" />
              </div>
              <span style={{ color:"rgba(201,168,76,0.4)", fontSize:"16px", alignSelf:"center" }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Dan block
const DanBlock = ({ summary, question, councilQuestion, needsMoreRound, onAnswer, onSkip, answered, userAnswer }) => {
  const [ans, setAns] = useState("");
  const [vis, setVis] = useState(false);
  const showQ = needsMoreRound && question && !answered;
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(14px)", transition:"all 0.45s ease", margin:"22px 0" }}>
      {/* Dan label centered */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={34} active />
          <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
            Dan — The Judge
          </span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.3))" }}/>
      </div>

      <div style={{ background:"linear-gradient(135deg,#0d0a02,#080610)", border:"1px solid rgba(201,168,76,0.18)", borderRadius:"14px", padding:"16px 20px" }}>
        {summary?.length > 0 && (
          <ul style={{ margin:`0 0 ${showQ||councilQuestion||answered?14:0}px`, padding:0, listStyle:"none" }}>
            {summary.map((b,i) => (
              <li key={i} style={{ display:"flex", gap:"9px", marginBottom:"9px" }}>
                <span style={{ color:"#c9a84c", flexShrink:0, marginTop:"3px", fontSize:"10px" }}>◆</span>
                <ParsedText text={b} fontSize="13px" color="#9ca3af" />
              </li>
            ))}
          </ul>
        )}
        {councilQuestion && !answered && (
          <div style={{ background:"rgba(201,168,76,0.06)", borderRadius:"10px", padding:"12px 14px", marginBottom:"12px", border:"1px solid rgba(201,168,76,0.15)" }}>
            <span style={{ fontSize:"11px", color:"rgba(201,168,76,0.6)", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Dan asks {councilQuestion.to} →
            </span>
            <p style={{ color:"#e5e7eb", fontSize:"14px", lineHeight:"1.55", margin:"6px 0 0" }}>{councilQuestion.question}</p>
          </div>
        )}
        {showQ && (
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.12)", paddingTop:"14px" }}>
            <p style={{ color:"#e5e7eb", fontSize:"15px", marginBottom:"12px", lineHeight:"1.55" }}>🤔 {question}</p>
            <div style={{ display:"flex", gap:"8px" }}>
              <input value={ans} onChange={e=>setAns(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&ans.trim()){onAnswer(ans);setAns("");}}}
                placeholder="Your answer…"
                style={{ flex:1,minWidth:0,background:"#13100a",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"8px",color:"#e5e7eb",fontSize:"14px",padding:"10px 13px",outline:"none",fontFamily:"inherit" }}
                onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
              />
              <button onClick={()=>{if(ans.trim()){onAnswer(ans);setAns("");}}}
                style={{ background:"#c9a84c",color:"#0a0800",border:"none",borderRadius:"8px",padding:"10px 18px",fontWeight:800,cursor:"pointer",fontSize:"14px" }}>→</button>
            </div>
          </div>
        )}
        {answered && question && (
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.1)", paddingTop:"10px" }}>
            <p style={{ color:"#374151",fontSize:"12px",fontStyle:"italic" }}>✓ {question}</p>
            <p style={{ color:"#4b5563",fontSize:"13px",marginTop:"4px" }}>↩ {userAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Context questions block
const ContextBlock = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const allAnswered = questions.every((_,i) => answers[i]?.trim());

  return (
    <div style={{ margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={34} active />
          <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
            Dan — The Judge
          </span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.3))" }}/>
      </div>
      <div style={{ background:"linear-gradient(135deg,#0d0a02,#080610)", border:"1px solid rgba(201,168,76,0.18)", borderRadius:"14px", padding:"18px 20px" }}>
        <p style={{ color:"#6b7280",fontSize:"13px",marginBottom:"18px",lineHeight:"1.55",fontStyle:"italic" }}>Before the council convenes, I need to understand your situation.</p>
        {questions.map((q,i) => (
          <div key={i} style={{ marginBottom:"16px" }}>
            <p style={{ color:"#e5e7eb",fontSize:"15px",marginBottom:"9px",lineHeight:"1.5" }}>{q}</p>
            <input value={answers[i]||""} onChange={e=>setAnswers(p=>({...p,[i]:e.target.value}))}
              onKeyDown={e=>{if(e.key==="Enter"&&allAnswered)onSubmit(questions.map((_,j)=>answers[j]||""));}}
              placeholder="Your answer…"
              style={{ width:"100%",background:"#13100a",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"8px",color:"#e5e7eb",fontSize:"15px",padding:"11px 14px",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
            />
          </div>
        ))}
        <button onClick={()=>allAnswered&&onSubmit(questions.map((_,i)=>answers[i]||""))} disabled={!allAnswered}
          style={{ background:allAnswered?"#c9a84c":"#111",color:allAnswered?"#0a0800":"#374151",border:"none",borderRadius:"8px",padding:"11px 22px",fontWeight:800,cursor:allAnswered?"pointer":"not-allowed",fontSize:"14px",letterSpacing:"0.02em" }}>
          Convene the Council →
        </button>
      </div>
    </div>
  );
};

// Dan's dramatic opening
const OpeningBlock = ({ text }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 120); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(16px)", transition:"all 0.5s ease", margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={34} active />
          <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Dan — The Judge</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.3))" }}/>
      </div>
      <div style={{ background:"linear-gradient(135deg,#0d0a02,#080610)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"14px", padding:"18px 22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,#c9a84c,transparent)" }}/>
        <ParsedText text={text} fontSize="15px" color="#d1d5db" />
      </div>
    </div>
  );
};

// Round header
const RoundHeader = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"26px 0 18px" }}>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.18))" }}/>
    <span style={{ fontSize:"10px", color:"rgba(201,168,76,0.55)", fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", padding:"4px 14px", border:"1px solid rgba(201,168,76,0.12)", borderRadius:"20px" }}>{label}</span>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.18))" }}/>
  </div>
);

// Debate closed banner
const DebateClosedBanner = ({ onReveal, revealed }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 200); return () => clearTimeout(t); }, []);
  if(revealed) return null;
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"scale(1)":"scale(0.96)", transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)", margin:"28px 0" }}>
      <div style={{ background:"linear-gradient(135deg,#0d0a02,#0a0800)", border:"1px solid rgba(201,168,76,0.35)", borderRadius:"18px", padding:"30px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,#c9a84c,transparent)" }}/>
        <div style={{ fontSize:"38px", marginBottom:"12px" }}>⚖️</div>
        <p style={{ color:"#c9a84c", fontWeight:800, fontSize:"13px", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:"8px" }}>The council has deliberated</p>
        <p style={{ color:"#6b7280", fontSize:"14px", lineHeight:"1.6", marginBottom:"24px", maxWidth:"340px", margin:"0 auto 24px" }}>
          Dan has reviewed all arguments and is ready to deliver the verdict.
        </p>
        <button onClick={onReveal} style={{ background:"linear-gradient(135deg,#c9a84c,#a07830)", color:"#0a0800", border:"none", borderRadius:"10px", padding:"13px 30px", fontSize:"14px", fontWeight:800, cursor:"pointer", letterSpacing:"0.04em", boxShadow:"0 4px 20px rgba(201,168,76,0.3)" }}>
          Deliver the Verdict →
        </button>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,#c9a84c,transparent)" }}/>
      </div>
    </div>
  );
};

// Verdict block
const VerdictBlock = ({ verdict }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(20px)", transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)", margin:"8px 0 24px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={38} active />
          <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"12px", letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Dan's Verdict</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.4))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,#0d0a02,#080610)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"18px", padding:"22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,#c9a84c,transparent)" }}/>
        {verdict.insights?.length > 0 && (
          <div style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"10px",color:"rgba(201,168,76,0.55)",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"12px" }}>What the debate established</div>
            {verdict.insights.map((b,i) => (
              <div key={i} style={{ display:"flex",gap:"10px",marginBottom:"10px" }}>
                <span style={{ color:"#c9a84c",flexShrink:0,marginTop:"4px",fontSize:"10px" }}>◆</span>
                <ParsedText text={b} fontSize="14px" color="#9ca3af" />
              </div>
            ))}
          </div>
        )}
        {(verdict.for_points?.length > 0 || verdict.against_points?.length > 0) && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px",marginBottom:"20px" }}>
            {verdict.for_points?.length > 0 && (
              <div style={{ background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"12px",padding:"14px 16px" }}>
                <div style={{ fontSize:"10px",color:"#4ade80",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px" }}>✓ For</div>
                {verdict.for_points.map((p,i) => (
                  <div key={i} style={{ display:"flex",gap:"8px",marginBottom:"9px" }}>
                    <span style={{ color:"#4ade80",flexShrink:0,fontWeight:700 }}>+</span>
                    <ParsedText text={p} fontSize="13px" color="#9ca3af" />
                  </div>
                ))}
              </div>
            )}
            {verdict.against_points?.length > 0 && (
              <div style={{ background:"rgba(251,146,60,0.05)",border:"1px solid rgba(251,146,60,0.2)",borderRadius:"12px",padding:"14px 16px" }}>
                <div style={{ fontSize:"10px",color:"#fb923c",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px" }}>✗ Against</div>
                {verdict.against_points.map((p,i) => (
                  <div key={i} style={{ display:"flex",gap:"8px",marginBottom:"9px" }}>
                    <span style={{ color:"#fb923c",flexShrink:0,fontWeight:700 }}>−</span>
                    <ParsedText text={p} fontSize="13px" color="#9ca3af" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {verdict.recommendation && (
          <div style={{ background:"#0a0800",borderRadius:"14px",padding:"18px 20px",border:"1px solid rgba(201,168,76,0.28)",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)" }}/>
            <div style={{ fontSize:"10px",color:"#c9a84c",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"12px" }}>🎯 Dan's Recommendation</div>
            <ParsedText text={verdict.recommendation} fontSize="16px" color="#f3f4f6" />
          </div>
        )}
      </div>
    </div>
  );
};

// Loading dots
const LoadingPulse = ({ label, speaker }) => (
  <div style={{ display:"flex",alignItems:"center",gap:"12px",padding:"12px 0",opacity:0.8 }}>
    {speaker && <Avatar char={speaker} size={30} active />}
    <div style={{ display:"flex",gap:"5px" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:"6px",height:"6px",borderRadius:"50%",background:speaker?speaker.color:"#c9a84c",
          animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s` }}/>
      ))}
    </div>
    {label && <span style={{ color:"#4a5568",fontSize:"13px" }}>{label}</span>}
  </div>
);

// Question bubble
const QuestionBubble = ({ text }) => (
  <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:"22px" }}>
    <div style={{ background:"#0f0f1e",border:"1px solid rgba(201,168,76,0.18)",borderRadius:"16px 16px 3px 16px",padding:"14px 18px",maxWidth:"80%" }}>
      <ParsedText text={text} fontSize="16px" color="#e5e7eb" />
    </div>
  </div>
);

// ── Setup Screen ──────────────────────────────────────────────
const SetupScreen = ({ onStart }) => {
  const [selected, setSelected] = useState([]);
  const toggle = id => {
    if(selected.includes(id)) setSelected(p => p.filter(s => s !== id));
    else if(selected.length < 4) setSelected(p => [...p, id]);
  };
  const canStart = selected.length >= 2;

  return (
    <div style={{ minHeight:"100vh",background:"#05060f",color:"#e5e7eb",fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth:"740px",margin:"0 auto",padding:"clamp(24px,6vw,60px) clamp(16px,4vw,24px)" }}>
        <div style={{ textAlign:"center",marginBottom:"clamp(28px,6vw,52px)" }}>
          <div style={{ fontSize:"clamp(48px,8vw,64px)",marginBottom:"16px" }}>⚖️</div>
          <h1 style={{ fontSize:"clamp(24px,5vw,34px)",fontWeight:800,marginBottom:"10px",background:"linear-gradient(135deg,#f3f4f6,#c9a84c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Lora','Georgia',serif" }}>
            The Council
          </h1>
          <p style={{ color:"#6b7280",fontSize:"clamp(13px,2vw,15px)",lineHeight:"1.65",maxWidth:"440px",margin:"0 auto" }}>
            Assemble 2–4 members. You control who speaks each turn. Dan presides and delivers the final verdict.
          </p>
        </div>

        {/* Dan card */}
        <div style={{ background:"linear-gradient(135deg,#0d0a02,#0a0800)",border:"1px solid rgba(201,168,76,0.35)",borderRadius:"16px",padding:"16px 20px",marginBottom:"28px",display:"flex",alignItems:"center",gap:"14px" }}>
          <Avatar char={DAN} size={52} active />
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px" }}>
              <span style={{ fontWeight:800,color:"#c9a84c",fontSize:"16px",fontFamily:"'Lora','Georgia',serif" }}>Dan</span>
              <span style={{ fontSize:"10px",background:"rgba(201,168,76,0.15)",color:"#c9a84c",borderRadius:"4px",padding:"2px 8px",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase" }}>always present</span>
            </div>
            <div style={{ fontSize:"13px",color:"#6b7280",lineHeight:"1.5" }}>Opens the debate. Asks questions of the council and of you. Delivers the final verdict.</div>
          </div>
        </div>

        <h2 style={{ fontSize:"11px",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(201,168,76,0.45)",marginBottom:"14px" }}>
          Council Members &nbsp;<span style={{ color:selected.length>=2?"#4ade80":"rgba(201,168,76,0.3)" }}>({selected.length} / 4)</span>
        </h2>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,195px),1fr))",gap:"10px",marginBottom:"32px" }}>
          {Object.values(CHARACTERS).map(c => {
            const sel = selected.includes(c.id);
            return (
              <div key={c.id} onClick={() => toggle(c.id)} style={{
                background:sel?hex2rgba(c.color,0.08):"#09090f",
                border:`1px solid ${sel?c.color:"rgba(255,255,255,0.05)"}`,
                borderRadius:"14px",padding:"16px",cursor:"pointer",transition:"all 0.18s",position:"relative",
              }}>
                {sel && <div style={{ position:"absolute",top:"10px",right:"12px",color:c.color,fontSize:"14px",fontWeight:800 }}>✓</div>}
                <Avatar char={c} size={46} active={sel} />
                <div style={{ marginTop:"10px",fontWeight:800,fontSize:"15px",color:sel?c.color:"#e5e7eb",marginBottom:"3px",fontFamily:"'Lora','Georgia',serif" }}>{c.name}</div>
                <div style={{ fontSize:"11px",color:hex2rgba(c.color,0.65),marginBottom:"8px",fontStyle:"italic" }}>{c.title}</div>
                <div style={{ fontSize:"12px",color:"#6b7280",lineHeight:"1.45",marginBottom:"10px" }}>{c.description}</div>
                <div style={{ fontSize:"10px",background:hex2rgba(c.color,0.1),color:c.color,borderRadius:"4px",padding:"3px 8px",display:"inline-block",fontWeight:700,border:`1px solid ${hex2rgba(c.color,0.2)}` }}>{c.lens}</div>
              </div>
            );
          })}
        </div>

        <button onClick={() => canStart && onStart(selected.map(id => CHARACTERS[id]))} disabled={!canStart} style={{
          width:"100%",padding:"16px",
          background:canStart?"linear-gradient(135deg,#c9a84c,#a07830)":"#09090f",
          color:canStart?"#0a0800":"#374151",
          border:`1px solid ${canStart?"transparent":"rgba(255,255,255,0.04)"}`,
          borderRadius:"14px",fontSize:"clamp(14px,2vw,16px)",fontWeight:800,
          cursor:canStart?"pointer":"not-allowed",fontFamily:"'Lora','Georgia',serif",
          letterSpacing:"0.03em",boxShadow:canStart?"0 4px 22px rgba(201,168,76,0.25)":"none",transition:"all 0.2s",
        }}>
          {canStart ? "Convene the Council →" : "Select at least 2 council members"}
        </button>
      </div>
    </div>
  );
};

// ── Debate Screen ─────────────────────────────────────────────
const DebateScreen = ({ characters, onClose }) => {
  const [phase, setPhase] = useState("question");        // question|context|opening|picking|speaking|checkin|done
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
  // Picks state: which chars still need to speak this round
  const [remainingPickers, setRemainingPickers] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [pendingCheckin, setPendingCheckin] = useState(null); // {roundNum, history}
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [feed, loading, pitches]);

  const post = async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    if(!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
  };

  const charConfigs = characters.map(c => ({ id:c.id, name:c.name, title:c.title, emoji:c.emoji, color:c.color, prompt:"" }));

  // ── Start flow ──
  const handleQuestion = async () => {
    if(!question.trim()) return;
    setPhase("loading");
    setFeed([{ type:"question_bubble", text:question }]);
    setLoading(true); setLoadingLabel("Dan is preparing…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/context", { question, characters:charConfigs });
      setFeed(p => [...p, { type:"context_block", questions:data.questions }]);
      setPhase("context");
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  const handleContextSubmit = async (answers) => {
    const ctxMap = {};
    const qs = feed.find(f => f.type === "context_block")?.questions || [];
    qs.forEach((q, i) => { ctxMap[q] = answers[i]; });
    setContext(ctxMap);
    setFeed(p => p.map(f => f.type === "context_block" ? { ...f, answered:true } : f));
    const ctxHistory = [{ type:"user_context", text:Object.entries(ctxMap).map(([q,a])=>`${q} → ${a}`).join(" | ") }];
    setHistory(ctxHistory);

    // Dan's dramatic opening
    setLoading(true); setLoadingLabel("Dan is opening the session…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/opening", { question, characters:charConfigs, context:ctxMap });
      setFeed(p => [...p, { type:"opening", text:data.opening }]);
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);

    // Start round 1 picking
    setCurrentRound(1);
    await startRoundPicking(1, ctxMap, ctxHistory);
  };

  // ── Round picking: fetch all pitches, show picker ──
  const startRoundPicking = async (roundNum, ctx = context, hist = history) => {
    setFeed(p => [...p, { type:"round_header", label:`Round ${roundNum}` }]);
    setPhase("picking");

    // Fetch one-sentence pitches from all remaining characters
    setLoading(true); setLoadingLabel("Council members are preparing their arguments…"); setLoadingSpeaker(null); setActiveSpeaker(null);
    const fetchedPitches = [];
    for(const c of characters) {
      try {
        const data = await post("/debate/single_sentence", {
          question, character_id:c.id, characters:charConfigs,
          round:roundNum, context:ctx, history:hist,
        });
        fetchedPitches.push({ character_id:c.id, pitch:data.pitch, char:c });
      } catch(e) { console.error(e); }
    }
    setPitches(fetchedPitches);
    setRemainingPickers(characters.map(c => c.id));
    setLoading(false);
    setFeed(p => [...p, { type:"picker", roundNum, pitches:fetchedPitches }]);
  };

  // ── User picks a character to speak ──
  const handlePickSpeaker = async (characterId) => {
    // Remove picker from feed, mark as answering
    setFeed(p => p.map(f => f.type === "picker" ? { ...f, chosen:characterId } : f));

    const char = characters.find(c => c.id === characterId);
    setActiveSpeaker(characterId);
    setLoading(true); setLoadingLabel(`${char.name} is speaking…`); setLoadingSpeaker(char);

    try {
      const data = await post("/debate/single_turn", {
        question, character_id:characterId, characters:charConfigs,
        round:currentRound, context, checkin_answer:checkinAnswer, history,
      });
      const turn = data.turn;
      const newHistory = [...history, turn];
      setHistory(newHistory);

      // Direction: alternate left/right by insertion order
      const roundTurns = newHistory.filter(h => h.round === currentRound && h.type === "agent");
      const idx = roundTurns.length - 1;
      setFeed(p => [...p, { type:"agent", ...turn, slideDir: idx % 2 === 0 ? "left" : "right" }]);

      // Remove from remaining
      const newRemaining = remainingPickers.filter(id => id !== characterId);
      setRemainingPickers(newRemaining);

      if(newRemaining.length > 0) {
        // Show picker again for remaining characters
        const newPitches = pitches.filter(p => newRemaining.includes(p.character_id));
        setFeed(p => [...p, { type:"picker", roundNum:currentRound, pitches:newPitches }]);
        setPhase("picking");
      } else {
        // Round complete — Dan checks in
        setActiveSpeaker("dan");
        setLoadingLabel("Dan is reviewing the round…"); setLoadingSpeaker(DAN);
        await runCheckin(currentRound, newHistory);
      }
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  // ── Dan check-in ──
  const runCheckin = async (roundNum, hist = history) => {
    try {
      const data = await post("/debate/checkin", {
        question, characters:charConfigs, history:hist, context, round:roundNum,
      });
      if(roundNum >= 3) { data.needs_more_round = false; data.question = null; }

      // If Dan has a question for a council member, fetch their response
      let councilResponseTurn = null;
      if(data.council_question && data.council_question.to) {
        const targetChar = characters.find(c => c.name === data.council_question.to);
        if(targetChar) {
          setActiveSpeaker(targetChar.id);
          setLoadingLabel(`${targetChar.name} is responding to Dan…`); setLoadingSpeaker(targetChar);
          try {
            const resp = await post("/debate/council_response", {
              question, character_id:targetChar.id, characters:charConfigs,
              round:roundNum, context, checkin_answer:data.council_question.question, history:hist,
            });
            councilResponseTurn = resp.turn;
            const newHist = [...hist, councilResponseTurn];
            setHistory(newHist);
            hist = newHist;
          } catch(e) { console.error(e); }
          setActiveSpeaker(null); setLoadingSpeaker(null);
        }
      }

      setFeed(p => [
        ...p,
        { type:"dan_checkin", summary:data.summary, question:data.question,
          councilQuestion:data.council_question, answered:false,
          needsMoreRound:data.needs_more_round, roundNum },
        ...(councilResponseTurn ? [{ type:"agent", ...councilResponseTurn, slideDir:"right", respondingToDan:true }] : []),
      ]);

      if(!data.needs_more_round) {
        await runVerdict(hist);
      } else {
        setPhase("checkin");
        setPendingCheckin({ roundNum, history:hist });
      }
    } catch(e) { console.error(e); }
  };

  const handleCheckinAnswer = async (answer, roundNum) => {
    setCheckinAnswer(answer);
    setFeed(p => p.map(f => f.type === "dan_checkin" && !f.answered ? { ...f, answered:true, userAnswer:answer } : f));
    const nextRound = (roundNum || 1) + 1;
    setCurrentRound(nextRound);
    await startRoundPicking(nextRound);
  };

  const runVerdict = async (hist = history) => {
    setActiveSpeaker("dan"); setLoadingLabel("Dan is writing the verdict…"); setLoadingSpeaker(DAN);
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
    setLoading(true); setLoadingLabel("Dan is preparing…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/context", { question:q, characters:charConfigs });
      setFeed(p => [...p, { type:"context_block", questions:data.questions }]);
      setPhase("context");
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  return (
    <div style={{ height:"100vh",width:"100%",background:"#05060f",color:"#e5e7eb",fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden" }}>
      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(201,168,76,0.1)",padding:"8px clamp(12px,4vw,20px)",flexShrink:0,background:"#05060f" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
          <button onClick={onClose} style={{ background:"transparent",border:"none",color:"#4a5568",fontSize:"18px",cursor:"pointer",padding:"4px 8px 4px 0",flexShrink:0 }}>←</button>
          <CouncilSeats characters={characters} activeSpeaker={activeSpeaker} />
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex:1,overflowY:"auto",padding:"20px clamp(12px,4vw,24px)",background:"#05060f" }}>
        <div style={{ maxWidth:"720px",margin:"0 auto",width:"100%" }}>

          {phase === "question" && (
            <div style={{ textAlign:"center",padding:"clamp(40px,10vw,90px) 0 24px" }}>
              <div style={{ fontSize:"52px",marginBottom:"16px" }}>⚖️</div>
              <p style={{ color:"#374151",fontSize:"16px",fontFamily:"'Lora','Georgia',serif" }}>The council is assembled. Present your question.</p>
            </div>
          )}

          {feed.map((item, i) => {
            if(item.type === "question_bubble") return <QuestionBubble key={i} text={item.text}/>;
            if(item.type === "context_block") return <ContextBlock key={i} questions={item.questions} onSubmit={handleContextSubmit}/>;
            if(item.type === "opening") return <OpeningBlock key={i} text={item.text}/>;
            if(item.type === "round_header") return <RoundHeader key={i} label={item.label}/>;
            if(item.type === "agent") return (
              <AgentTurn key={i} turn={item} slideDir={item.slideDir || "left"} respondingToDan={item.respondingToDan} />
            );
            if(item.type === "picker") {
              const isLatest = feed.filter(f => f.type === "picker").at(-1) === item;
              if(!isLatest || phase !== "picking") return null;
              return (
                <SpeakerPicker key={i} pitches={item.pitches} onChoose={handlePickSpeaker} loading={loading} />
              );
            }
            if(item.type === "dan_checkin") return (
              <DanBlock key={i}
                summary={item.summary} question={item.question}
                councilQuestion={item.councilQuestion}
                needsMoreRound={item.needsMoreRound}
                answered={item.answered} userAnswer={item.userAnswer}
                onAnswer={ans => handleCheckinAnswer(ans, item.roundNum)}
              />
            );
            if(item.type === "verdict") return (
              <div key={i}>
                <DebateClosedBanner revealed={verdictRevealed} onReveal={() => setVerdictRevealed(true)}/>
                {verdictRevealed && <VerdictBlock verdict={item.data}/>}
              </div>
            );
            return null;
          })}

          {loading && <LoadingPulse label={loadingLabel} speaker={loadingSpeaker}/>}

          {phase === "done" && !loading && verdictRevealed && (
            <div style={{ marginTop:"24px",borderTop:"1px solid rgba(201,168,76,0.08)",paddingTop:"22px" }}>
              <p style={{ color:"#4a5568",fontSize:"13px",marginBottom:"12px" }}>Ask a follow-up to the same council, or close this session.</p>
              <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                <input value={followUpQ} onChange={e=>setFollowUpQ(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")handleFollowUp();}}
                  placeholder="Ask a follow-up…"
                  style={{ flex:"1 1 200px",minWidth:0,background:"#0a0a14",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"10px",color:"#e5e7eb",fontSize:"14px",padding:"11px 14px",outline:"none",fontFamily:"inherit" }}
                  onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
                />
                <button onClick={handleFollowUp} style={{ background:"#c9a84c",color:"#0a0800",border:"none",borderRadius:"10px",padding:"11px 18px",fontWeight:800,cursor:"pointer" }}>→</button>
                <button onClick={onClose} style={{ background:"#09090f",color:"#6b7280",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"10px",padding:"11px 14px",fontSize:"13px",cursor:"pointer" }}>Close session</button>
              </div>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Question input */}
      {phase === "question" && (
        <div style={{ borderTop:"1px solid rgba(201,168,76,0.08)",padding:"14px clamp(12px,4vw,20px)",background:"#05060f",flexShrink:0 }}>
          <div style={{ maxWidth:"720px",margin:"0 auto",display:"flex",gap:"10px" }}>
            <input value={question} onChange={e=>setQuestion(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")handleQuestion();}}
              placeholder="Present your question to the council…"
              style={{ flex:1,minWidth:0,background:"#09090f",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"12px",color:"#e5e7eb",fontSize:"16px",padding:"14px 16px",outline:"none",fontFamily:"'Lora','Georgia',serif" }}
              onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.2)"}
              autoFocus
            />
            <button onClick={handleQuestion} disabled={!question.trim()} style={{
              background:question.trim()?"linear-gradient(135deg,#c9a84c,#a07830)":"#09090f",
              color:question.trim()?"#0a0800":"#374151",
              border:"none",borderRadius:"12px",width:"50px",fontSize:"22px",
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
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;background:#05060f;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.2);border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes ringPulse{0%,100%{box-shadow:0 0 0 2px var(--c,#c9a84c),0 0 12px rgba(201,168,76,0.2)}50%{box-shadow:0 0 0 3px var(--c,#c9a84c),0 0 24px rgba(201,168,76,0.4)}}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>
      {screen === "debate"
        ? <DebateScreen characters={characters} onClose={() => { setScreen("setup"); setCharacters([]); }}/>
        : <SetupScreen onStart={chars => { setCharacters(chars); setScreen("debate"); }}/>
      }
    </div>
  );
}