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
  const [modal, setModal] = useState(null);
  const [enteredPassword, setEnteredPassword] = useState("");
  const menuRef = useRef(null);
  const users = "5K";
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
    if (navigator.share) {
      await navigator.share({
        title: "Quiz Game",
        text: "Play this quiz game!",
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link Copied!");
    }
  } catch (e) {
    navigator.clipboard.writeText(window.location.href);
    alert("Link Copied!");
  }
}

 async function handleInvite(){
  const inviteLink = window.location.href;

  const text = `🔥 Come play this quiz!\nCan you beat my score? 😎\n${inviteLink}`;

  try {
    if (navigator.share) {
      // 📱 Mobile (best experience)
      await navigator.share({
        title: "Quiz Challenge",
        text: text,
        url: inviteLink
      });
    } else {
      // 💻 Desktop fallback options
      const choice = prompt(
        "Send via:\n1 = WhatsApp\n2 = Messenger\n3 = Copy Link"
      );

      if (choice === "1") {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      } 
      else if (choice === "2") {
        window.open(`https://m.me/?link=${encodeURIComponent(inviteLink)}`, "_blank");
      } 
      else {
        navigator.clipboard.writeText(inviteLink);
        alert("Link copied!");
      }
    }
  } catch (e) {
    console.log("Share cancelled or failed");
  }
}

  const defaultGroups = ["today","thisweek","thismonth","plan16","jan","feb","mar","economic","apr","may","jun","census","july","aug","sep","constitution","oct","nov","dec","other","awards","deaths","conferences","sports","life","days","accidents"];

  const emptyQ = { q:{en:""}, options:["","","",""], a:"" };

  const sampleQuestions = [
    { q:{en:"नेपालको राजधानी कहाँ हो?"}, options:["काठमाडौं","दिल्ली","टोकियो","लन्डन"], a:"काठमाडौं" },
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
    setTimeout(()=>{ setSelected(null); next(); },700);
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
  
  useEffect(()=>{
  if(editorOpen){
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}, [editorOpen]);

  return (
   <div
  style={{
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    background: "#1e3a8a",
    color: "white",
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

   {/* 👥 Left: Users */}
 <div style={{
  position: "absolute",
  left: "10px",
  fontSize: "14px"
}}>
  👥 Users: {users}
</div>

  {/* 📚 Center: Title (CLICKABLE) */}
  <div
    onClick={()=>setScreen("home")}
    style={{
      fontSize: "clamp(18px, 5vw, 26px)",
      fontWeight: "bold",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      cursor: "pointer"
    }}
  >
    <span>📚</span>
    <span>Current Quiz</span>
  </div>

  {/* ☰ Right: Menu */}
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
    <div onClick={()=>{setModal("password"); setShowMenu(false);}}>
  Edit Questions
</div>
    <div onClick={()=>{alert("Saved"); setShowMenu(false);}}>Save</div>
  <div onClick={()=>{setModal("feedback"); setShowMenu(false);}}>Feedback</div>
   <div onClick={()=>{setModal("contact"); setShowMenu(false);}}>Contact</div>
<div onClick={()=>{setModal("rules"); setShowMenu(false);}}>Rules</div>
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
    e.stopPropagation();setOpenCategory(openCategory==="month" ? null : "month");}}
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
    e.stopPropagation();setOpenCategory(openCategory==="event" ? null : "event");}}
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
    e.stopPropagation();setOpenCategory(openCategory==="other" ? null : "other");}}
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
  flex: 1
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
    paddingBottom: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start"
  }}>

    {/* 🔝 Top bar (timer only) */}
    <div style={{
      display: "flex",
      justifyContent: "center",
      width: "100%",
      maxWidth: "400px",
      margin: "0 auto 10px auto"
    }}>
      <div style={{ textAlign: "center" }}>
       <div style={{
    fontWeight: "bold",
    fontSize: "18px"
  }}>
    {time}s
  </div>
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
      maxWidth: "90%",
    margin: "0 auto"
    }}>
      {questions[index]?.q?.en}
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
  display: "flex",
  justifyContent: "center",
  marginTop: "10px"
}}>
  <div style={{
    display: "flex",
    gap: "20px",
    background: "rgba(0,0,0,0.3)",
    padding: "10px 18px",
    borderRadius: "8px"
  }}>
    <button onClick={()=>setScreen("home")}
  style={{
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
      Back
    </button>
    <button onClick={next}
  style={{
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
      Skip
    </button>
  </div>
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
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      zIndex: 2147483647,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >

    <div
      style={{
        background: "white",
        color: "black",
        width: "95%",
        maxWidth: "500px",
        maxHeight: "90vh",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* HEADER */}
      <div style={{padding:"10px", borderBottom:"1px solid #ddd", display:"flex", justifyContent:"space-between"}}>
        <div>
          <b>Edit:</b>
          <select value={week} onChange={(e)=>setWeek(e.target.value)}>
            {defaultGroups.map(g=> (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <button onClick={()=>setEditorOpen(false)}>Close</button>
      </div>

      {/* BODY */}
      <div style={{padding:"10px", overflowY:"auto"}}>
        {questions.map((q,i)=>(
          <div key={i} style={{border:"1px solid #ddd", padding:"10px", margin:"8px 0"}}>
            <input
              placeholder="Question"
              value={q.q?.en || ""}
              onChange={e=>updateQ(i,"q",e.target.value)}
              style={{width:"100%", marginBottom:"5px"}}
            />

            {q.options.map((o,oi)=>(
              <input
                key={oi}
                placeholder={`Option ${oi+1}`}
                value={o || ""}
                onChange={e=>updateQ(i,"opt",e.target.value,oi)}
                style={{width:"100%", marginBottom:"5px"}}
              />
            ))}

            <input
              placeholder="Correct answer"
              value={q.a || ""}
              onChange={e=>updateQ(i,"a",e.target.value)}
              style={{width:"100%", marginBottom:"5px"}}
            />

            <button onClick={()=>deleteQuestion(i)}>Delete</button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{padding:"10px", borderTop:"1px solid #ddd"}}>
        <button onClick={addQuestion}>+ Add</button>
        <button onClick={()=>{
          localStorage.setItem("quizData", JSON.stringify(data));
          setSavedMsg(true);
          setTimeout(()=>setSavedMsg(false),2000);
        }}>Submit</button>
        <button onClick={()=>{
          setEditorOpen(false);
          setScreen("home");
        }}>Back</button>

        {savedMsg && <div>✔ Saved</div>}
      </div>

    </div>
  </div>
)}
     {modal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      zIndex: 2147483648,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <div style={{
      background: "white",
      color: "black",
      padding: "20px",
      borderRadius: "10px",
      width: "90%",
      maxWidth: "400px"
    }}>
      
      <div style={{display:"flex", justifyContent:"space-between"}}>
        <b>{modal}</b>
        <button onClick={()=>setModal(null)}>Close</button>
      </div>

      {modal==="contact" && <div>📞 Contact info यहाँ राख</div>}
      {modal==="rules" && <div>📜 Rules यहाँ राख</div>}
      {modal==="feedback" && <div>✍️ Feedback लेख्ने ठाउँ</div>}
      {modal==="password" && (
  <div>
    <input
      type="password"
      placeholder="Enter password"
      value={enteredPassword}
      onChange={(e)=>setEnteredPassword(e.target.value)}
      style={{
  width:"100%",
  maxWidth:"300px",
  padding:"10px",
  marginTop:"10px",
  marginLeft:"auto",
  marginRight:"auto",
  display:"block"
}}
    />

    <button
      onClick={()=>{
        if(enteredPassword==="6420"){
          setModal(null);
          setEditorOpen(true);
          setEnteredPassword("");
        } else {
          alert("Wrong password");
        }
      }}
      style={{marginTop:"10px"}}
    >
      Unlock
    </button>
  </div>
)}

    </div>
  </div>
)}

     //footer (bottom bar)//
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
  zIndex: 1000
}}>

  {/* CENTER VIDEO */}
  <div style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)"
  }}>
    <span
  onClick={()=>{
    window.open(
      "https://www.youtube.com/@niza.education",
      "_blank",
      "noopener,noreferrer"
    );
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
