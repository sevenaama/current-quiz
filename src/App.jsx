import React, { useEffect, useState, useRef } from "react";

export default function QuizApp() {

  const [screen, setScreen] = useState("home");
  const [openCategory, setOpenCategory] = useState(null);
  const [week, setWeek] = useState("jan");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [time, setTime] = useState(15);
  const [selected, setSelected] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const menuRef = useRef(null);
  const mainGroups = ["today","thisweek","previousweek","thismonth"];

const monthGroups = ["jan","feb","mar","apr","may","jun","july","aug","sep","oct","nov","dec"];

const otherGroups = ["plan16","economic","census","constitution"];

const eventGroups = ["awards","deaths","conferences","sports","life","days","accidents"];

  const [lastUpdate, setLastUpdate] = useState(()=> typeof window !== "undefined" ? (localStorage.getItem("lastUpdate") || "-") : "-");

  useEffect(()=>{
    if (typeof window !== "undefined" && window.FBInstant) {
      window.FBInstant.initializeAsync()
        .then(()=> window.FBInstant.startGameAsync())
        .catch(()=>{});
    }
  },[]);

  async function handleShare(){
    try{
      if (typeof window !== "undefined" && window.FBInstant && window.FBInstant.shareAsync) {
        await window.FBInstant.shareAsync({
          intent: "SHARE",
          text: "Play this quiz game!",
          image: "",
          data: { score }
        });
      } else {
        if (typeof window !== "undefined") {
          navigator.clipboard.writeText(window.location.href);
          alert("Link Copied!");
        }
      }
    }catch(e){
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        alert("Link Copied!");
      }
    }
  }

  async function handleInvite(){
    try{
      if (typeof window !== "undefined" && window.FBInstant && window.FBInstant.context) {
        await window.FBInstant.context.chooseAsync();
      } else {
        if (typeof window !== "undefined") {
          const url = window.location.href;
          window.open(`https://m.me/?link=${encodeURIComponent(url)}`, '_blank');
        }
      }
    }catch(e){
      if (typeof window !== "undefined") {
        const url = window.location.href;
        window.open(`https://m.me/?link=${encodeURIComponent(url)}`, '_blank');
      }
    }
  }

  const defaultGroups = ["today","thisweek","thismonth","plan16","jan","feb","mar","economic","apr","may","jun","census","july","aug","sep","constitution","oct","nov","dec","other"];

  const emptyQ = { q:{en:""}, options:["","","",""], a:"" };

  const sampleQuestions = [
    { q:{en:"नेपालको राजधानी के हो?"}, options:["काठमाडौं","दिल्ली","टोकियो","लन्डन"], a:"काठमाडौं" },
    { q:{en:"2+2 कति हुन्छ?"}, options:["3","4","5","6"], a:"4" },
    { q:{en:"सूर्य कुन दिशाबाट उदाउँछ?"}, options:["पूर्व","पश्चिम","उत्तर","दक्षिण"], a:"पूर्व" }
  ];

  const [data, setData] = useState(()=>{
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quizData");
      if(saved) return JSON.parse(saved);
    }

    const init = {};
    defaultGroups.forEach(g=>{
      init[g] = sampleQuestions.map(q => ({
        q: { en: q.q.en },
        options: [...q.options],
        a: q.a
      }));
    });

    return init;
  });

  useEffect(()=>{
    if (typeof window !== "undefined") {
      localStorage.setItem("quizData", JSON.stringify(data));
      const today = new Date().toLocaleDateString();
      localStorage.setItem("lastUpdate", today);
      setLastUpdate(today);
    }
  },[data]);

  const questions = data[week] || [];

  function start(w){
    setWeek(w);
    setIndex(0);
    setScore(0);
    setAttempted(0);
    setTime(15);
    setScreen("playing");
  }
function handleSelect(group){
  start(group);
  setOpenCategory(null);
}
  function next(){
    if(index+1<questions.length){
      setIndex(i=>i+1);
      setTime(15);
    } else {
      setScreen("result");
    }
  }

  function answer(opt){
    if(selected!==null) return;
    setSelected(opt);
    setAttempted(a=>a+1);
    if(opt===questions[index].a) setScore(s=>s+1);
    setTimeout(()=>{ setSelected(null); next(); },500);
  }

  function addQuestion(){
    setData(prev=> ({...prev, [week]: [...(prev[week]||[]), JSON.parse(JSON.stringify(emptyQ))]}));
  }

  function deleteQuestion(i){
    setData(prev=> ({...prev, [week]: prev[week].filter((_,idx)=>idx!==i)}));
  }

  function updateQ(i, field, value, optIndex){
    setData(prev=>{
      const list = [...(prev[week]||[])];
      if(field==="q") list[i].q.en = value;
      if(field==="opt") list[i].options[optIndex] = value;
      if(field==="a") list[i].a = value;
      return {...prev, [week]: list};
    });
  }

useEffect(()=>{
  function handleClickOutside(e){

    // menu
    if(menuRef.current && !menuRef.current.contains(e.target)){
      setShowMenu(false);
    }

    // 🔥 dropdown fix (safe way)
    const isDropdown = e.target.closest && e.target.closest(".dropdown");
    const isButton = e.target.closest && e.target.closest(".dropdown-btn");

    if(!isDropdown && !isButton){
      setOpenCategory(null);
    }

  }

  document.addEventListener("mousedown", handleClickOutside);

  return ()=>document.removeEventListener("mousedown", handleClickOutside);
},[]);

  useEffect(()=>{
    if(screen!=="playing") return;
    if(time===0) return next();
    const t=setTimeout(()=>setTime(t=>t-1),1000);
    return ()=>clearTimeout(t);
  },[time,screen]);

  return (
   <div
  style={{
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    background: "#1e3a8a",
    color: "white",
    position: "relative",
    paddingBottom: "0px"
  }}
>
     
     <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px",
  background: "#1e40af",
  color: "white",
  position: "sticky",
  top: 0,
  zIndex: 1000
}}>

  {/* Left: Users */}
  <div style={{
    position: "absolute",
    left: "10px",
    fontSize: "14px"
  }}>
    Users: 0
  </div>

  {/* Center: Title */}
  <div style={{
    fontSize: "clamp(18px, 5vw, 26px)",
    fontWeight: "bold",
    textAlign: "center"
  }}>
    Current Quiz
  </div>

  {/* Right: Menu */}
  <div
    onClick={(e)=>{e.stopPropagation(); setShowMenu(!showMenu);}}
    style={{
      position: "absolute",
      right: "10px",
      fontSize: "22px",
      cursor: "pointer"
    }}
  >
    ☰
  </div>
  {/* MENU */}
       {showMenu && (
  <div
    ref={menuRef}
    style={{
      position: "absolute",
      top: "50px",
      right: "10px",
      background: "white",
      color: "black",
      padding: "8px",
      fontSize: "12px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      zIndex: 9999
    }}
  >
    <div onClick={()=>{setEditorOpen(true); setShowMenu(false);}}>Edit Questions</div>
    <div onClick={()=>{alert("Saved"); setShowMenu(false);}}>Save</div>
    <div onClick={()=>{prompt("Feedback"); setShowMenu(false);}}>Feedback</div>
    <div onClick={()=>{alert("Contact"); setShowMenu(false);}}>Contact</div>
    <div onClick={()=>{alert("Rules"); setShowMenu(false);}}>Rules</div>
    <div onClick={()=>{
      navigator.clipboard.writeText(window.location.href);
      setShowMenu(false);
    }}>Copy Link</div>
  </div>
)}
</div>

  {/* MAIN DASHBOARD GRID */}
{screen==="home" && (
  <div style={{ padding: "10px",
               paddingBottom: "56px",
    position: "relative" ,
         display: "flex",
flexDirection: "column",
    flex: 1,
               minHeight: 0
  }}>

    {/* 🔝 BUTTONS */}
    <div style={{
      display:"flex",
      gap:"8px",
      marginBottom:"10px",
    flexShrink:0
    }}>
      {/* MONTH */}
      <div 
        className="dropdown-btn"
       onClick={(e)=>{
    e.stopPropagation();setOpenCategory(openCategory==="month" ? null : "month")}
        style={{
          background:"#7c3aed",
          padding:"8px 12px",
          borderRadius:"6px",
          cursor:"pointer"
        }}
      >
        Month {openCategory==="month" ? "▲" : "▼"}
      </div>

      {/* EVENT */}
      <div
         className="dropdown-btn"
        onClick={(e)=>{
    e.stopPropagation();setOpenCategory(openCategory==="event" ? null : "event")}
        style={{
          background:"#dc2626",
          padding:"8px 12px",
          borderRadius:"6px",
          cursor:"pointer"
        }}
      >
        Event {openCategory==="event" ? "▲" : "▼"}
      </div>

      {/* OTHER */}
      <div
         className="dropdown-btn"
       onClick={(e)=>{
    e.stopPropagation();setOpenCategory(openCategory==="other" ? null : "other")}
        style={{
          background:"#16a34a",
          padding:"8px 12px",
          borderRadius:"6px",
          cursor:"pointer"
        }}
      >
        Other {openCategory==="other" ? "▲" : "▼"}
      </div>
    </div>

    {/* 🟣 MONTH */}
    {openCategory==="month" && (
      <div
         className="dropdown"
        style={{
    position:"absolute",
    top:"50px",
    left:"0",
    width:"200px",
    maxHeight:"70vh",
    overflowY:"auto",
    display:"flex",
    flexDirection:"column",
    gap:"6px",
    padding:"5px",
    background:"rgba(0,0,0,0.9)",
    borderRadius:"8px",
    zIndex:999
      }}>
        {monthGroups.map(m=>(
          <div key={m} onClick={()=>handleSelect(m)}
            style={{background:"#a78bfa",padding:"10px",borderRadius:"6px"}}>
            {m}
          </div>
        ))}
      </div>
    )}

  {/* 🔴 EVENT */}
{openCategory==="event" && (
  <div
     className="dropdown"
    style={{
      position:"absolute",
      top:"50px",
      left:"0",
      width:"200px",
      maxHeight:"70vh",
      overflowY:"auto",
      display:"flex",
      flexDirection:"column",
      gap:"6px",
      padding:"5px",
      background:"rgba(0,0,0,0.9)",
      borderRadius:"8px",
      zIndex:999
    }}
  >
    {eventGroups.map(m=>(
      <div key={m} onClick={()=>handleSelect(m)}
        style={{background:"#f87171",padding:"10px",borderRadius:"6px"}}>
        {m}
      </div>
    ))}
  </div>
)}

    {/* 🟢 OTHER */}
    {openCategory==="other" && (
     <div 
         className="dropdown"
       style={{
    position:"absolute",
    top:"50px",
    left:"0",
    width:"200px",
    maxHeight:"70vh",
    overflowY:"auto",
    display:"flex",
    flexDirection:"column",
    gap:"6px",
    padding:"5px",
    background:"rgba(0,0,0,0.9)",
    borderRadius:"8px",
    zIndex:999
      }}>
        {otherGroups.map(m=>(
          <div key={m} onClick={()=>handleSelect(m)}
            style={{background:"#4ade80",padding:"10px",borderRadius:"6px"}}>
            {m}
          </div>
        ))}
      </div>
    )}

    {/* 🟦 MAIN BUTTONS (FIXED POSITION) */}
  <div style={{
  display:"grid",
  gridTemplateRows:"repeat(4, 1fr)",
  gap:"10px",
   height:"calc(100dvh - 180px)
    }}>
      {mainGroups.map(m=>(
        <div key={m}
          onClick={()=>start(m)}
         style={{
  background:"#2563eb",
  textAlign:"center",
  borderRadius:"14px",
  fontWeight:"bold",
  cursor:"pointer",
  boxShadow:"0 4px 10px rgba(0,0,0,0.3)",
  width:"100%",
  height:"100%",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  fontSize:"clamp(18px, 5vw, 22px)",
  maxWidth:"none"
         }}>
          {m}
        </div>
      ))}
    </div>

  </div>
)}
     
 {screen==="playing" && (
  <div style={{
    flex: 1,
    padding: "15px",
    paddingBottom: "120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start"
  }}>

    {/* 🔝 Top bar (timer only) */}
    <div style={{
      display: "flex",
      justifyContent: "center",
      width: "100%",
      maxWidth: "400px",
      marginBottom: "10px"
    }}>
      <div style={{ textAlign: "center" }}>
        <div>{time}s</div>
        <div style={{ fontSize: "12px" }}>
          Q {index+1} / {questions.length}
        </div>
      </div>
    </div>

    {/* ❓ Question */}
    <div style={{
      textAlign: "center",
      fontSize: "clamp(18px, 5vw, 24px)",
      marginBottom: "15px",
      maxWidth: "90%"
    }}>
      {questions[index]?.q.en}
    </div>

    {/* 🔘 Options */}
    {questions[index]?.options.map((o,i)=>{
      let bg = "#ffffff";
      let color = "#000";

      if(selected!==null){
        if(o===questions[index].a){
          bg = "#22c55e";
          color = "white";
        }
        else if(o===selected){
          bg = "#ef4444";
          color = "white";
        }
      }

      return (
        <button
          key={i}
          onClick={()=>answer(o)}
          style={{
            width: "90%",
            maxWidth: "400px",
            margin: "5px auto",
            padding: "clamp(12px, 4vw, 18px)",
            fontSize: "clamp(14px, 4vw, 18px)",
            borderRadius: "8px",
            textAlign: "center",
            background: bg,
            color: color,
            border: "none"
          }}
        >
          {o}
        </button>
      );
    })}
    {/* Bottom Controls */}
<div style={{
  width: "100%",
  maxWidth: "500px",
  display: "flex",
  justifyContent: "flex-start",
  padding: "10px 20px",
  marginTop: "auto"
}}>
  <button onClick={()=>setScreen("home")}>
    Back
  </button>

  <button onClick={next}>
    Skip
  </button>
</div>

  </div>
)}
      {screen==="result" && (
        <div style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "100%",
          padding: "clamp(16px, 4vw, 24px)",
  fontSize: "clamp(18px, 5vw, 24px)" 
  }}>
          <div>Total: {questions.length}</div>
          <div>Attempted: {attempted}</div>
          <div>Right: {score}</div>
          <div>Wrong: {attempted-score}</div>

          <div className="flex gap-2 mt-2">
            <button onClick={()=>start(week)} className="bg-white text-black px-5 py-3 text-base rounded">Play Again</button>

            <button onClick={()=>setScreen("home")} className="bg-yellow-400 text-black px-5 py-3 text-base rounded">Back</button>

            <button onClick={()=>{
              const idx = defaultGroups.indexOf(week);
              const nextGroup = defaultGroups[(idx+1) % defaultGroups.length];
              start(nextGroup);
            }} className="bg-green-500 text-white px-5 py-3 text-base rounded">Next Group</button>
          </div>
        </div>
      )}

      {editorOpen && (
        <div className="absolute inset-0 bg-black/70 p-3 overflow-auto">
          <div className="bg-white text-black p-3 rounded">
            <div className="flex justify-between">
              <div>
                <b>Edit:</b>
                <select value={week} onChange={(e)=>setWeek(e.target.value)} className="ml-2 border">
                  {defaultGroups.map(g=> (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <button onClick={()=>setEditorOpen(false)}>Close</button>
            </div>

            {questions.map((q,i)=>(
              <div key={i} className="border p-2 my-2">
                <input placeholder="Question" value={q.q.en} onChange={e=>updateQ(i,"q",e.target.value)} className="w-full border mb-1" />
                {q.options.map((o,oi)=>(
                  <input key={oi} placeholder={`Option ${oi+1}`} value={o} onChange={e=>updateQ(i,"opt",e.target.value,oi)} className="w-full border mb-1" />
                ))}
                <input placeholder="Correct answer" value={q.a} onChange={e=>updateQ(i,"a",e.target.value)} className="w-full border mb-1" />
                <button onClick={()=>deleteQuestion(i)}>Delete</button>
              </div>
            ))}

            <div className="flex gap-2 mt-2 items-center">
              <button onClick={addQuestion} className="bg-blue-500 text-white p-2">+ Add Question</button>

              <button onClick={()=>{
                if (typeof window !== "undefined") {
                  localStorage.setItem("quizData", JSON.stringify(data));
                }
                setSavedMsg(true);
                setTimeout(()=>setSavedMsg(false),2000);
              }} className="bg-green-600 text-white p-2">Submit</button>

              <button onClick={()=>{
                setEditorOpen(false);
                setScreen("home");
              }} className="bg-yellow-500 text-black p-2">Back</button>

              {savedMsg && (
                <div className="text-green-600 text-sm ml-2">✔ Saved</div>
              )}
            </div>
          </div>
        </div>
      )}
  
<div style={{
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  background: "rgba(0,0,0,0.5)",
backdropFilter: "blur(10px)",
WebkitBackdropFilter: "blur(10px)",
borderTop: "1px solid rgba(255,255,255,0.2)",
  padding: "10px 12px",
  fontSize: "clamp(12px,3.5vw,16px)",
  zIndex: 9999
}}>

  {/* CENTER VIDEO */}
  <div style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)"
  }}>
    <span
      onClick={()=>{
        const url = prompt("Enter video link (YouTube/Reels)");
        if(url) window.open(url, "_blank");
      }}
      style={{cursor:"pointer"}}
    >
      🎥 Video
    </span>
  </div>

  {/* LEFT UPDATE */}
  <div>
    Update: {lastUpdate}
  </div>

  {/* INVITE (mid-right) */}
<div style={{
  position: "absolute",
  right: "25%",
  transform: "translateX(50%)" ,
   bottom: "10px",
    display: "flex",
    gap: "12px"
}}>
  <span onClick={handleInvite} style={{cursor:"pointer"}}>
    Invite
  </span>
</div>

{/* SHARE (right edge) */}
<div style={{
  position: "absolute",
  right: "12%",
   bottom: "10px",
    display: "flex",
    gap: "12px"
}}>
  <span onClick={handleShare} style={{cursor:"pointer"}}>
    Share
  </span>
</div>

</div>
</div>
  );
}
