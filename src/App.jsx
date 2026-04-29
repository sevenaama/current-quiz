import React, { useEffect, useState, useRef } from "react";

export default function QuizApp() {

  const [screen, setScreen] = useState("home");
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
      if(menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    }
    document.addEventListener("click", handleClickOutside);
    return ()=>document.removeEventListener("click", handleClickOutside);
  },[]);

  useEffect(()=>{
    if(screen!=="playing") return;
    if(time===0) return next();
    const t=setTimeout(()=>setTime(t=>t-1),1000);
    return ()=>clearTimeout(t);
  },[time,screen]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{background:'#1e3a8a', color:'white'}}>

      <div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "12px",
  background: "#1e40af",
  color: "white"
}}>
  <div style={{
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "center"
  }}>
    Current Quiz
  </div>
</div>
        <div onClick={(e)=>{e.stopPropagation(); setShowMenu(!showMenu);}} className="cursor-pointer">☰</div>
      </div>

      {/* MENU */}
      {showMenu && (
        <div ref={menuRef} className="absolute top-12 right-3 bg-white text-black p-2 text-xs">
          <div onClick={()=>{setEditorOpen(true); setShowMenu(false);}}>Edit Questions</div>
          <div onClick={()=>{alert("Saved"); setShowMenu(false);}}>Save</div>
          <div onClick={()=>{prompt("Feedback"); setShowMenu(false);}}>Feedback</div>
          <div onClick={()=>{alert("Contact"); setShowMenu(false);}}>Contact</div>
          <div onClick={()=>{alert("Rules"); setShowMenu(false);}}>Rules</div>
          <div onClick={()=>{
            if (typeof window !== "undefined") {
              navigator.clipboard.writeText(window.location.href);
            }
            setShowMenu(false);
          }}>Copy Link</div>
        </div>
      )}

      {/* MAIN DASHBOARD GRID */}
      {screen==="home" && (
        <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "5px",
    padding: "5px",
    width: "100%"
  }}>
          {defaultGroups.map((m,i)=>{
            const colors = [
              "bg-red-500","bg-blue-500","bg-green-500","bg-yellow-500",
              "bg-purple-500","bg-pink-500","bg-indigo-500","bg-teal-500"
            ];
            const color = colors[i % colors.length];

            return (
              <div
                key={m}
                onClick={()=>start(m)}
                className={`${color} text-white p-2 text-center text-[9px] leading-tight rounded-md shadow-sm active:scale-95 transition`}>
                {m}
              </div>
            );
          })}
        </div>
      )}

      {screen==="playing" && (
        <div className="flex-1 p-3">
          <div className="flex justify-between items-center">
            <button onClick={()=>setScreen("home")}>Back</button>

            <div className="text-center">
              <div>{time}s</div>
              <div className="text-xs">Q {index+1} / {questions.length}</div>
            </div>

            <button onClick={next}>Skip</button>
          </div>

          <div className="text-center">{questions[index]?.q.en}</div>

          {questions[index]?.options.map((o,i)=>{
            let bg = "bg-white text-black";
            if(selected!==null){
              if(o===questions[index].a) bg = "bg-green-500 text-white";
              else if(o===selected) bg = "bg-red-500 text-white";
            }
            return (
              <button key={i} onClick={()=>answer(o)} className={`${bg} block w-full m-1`}>
                {o}
              </button>
            );
          })}
        </div>
      )}

      {screen==="result" && (
        <div className="flex-1 text-center flex flex-col items-center justify-center gap-2">
          <div>Total: {questions.length}</div>
          <div>Attempted: {attempted}</div>
          <div>Right: {score}</div>
          <div>Wrong: {attempted-score}</div>

          <div className="flex gap-2 mt-2">
            <button onClick={()=>start(week)} className="bg-white text-black px-3 py-1">Play Again</button>

            <button onClick={()=>setScreen("home")} className="bg-yellow-400 text-black px-3 py-1">Back</button>

            <button onClick={()=>{
              const idx = defaultGroups.indexOf(week);
              const nextGroup = defaultGroups[(idx+1) % defaultGroups.length];
              start(nextGroup);
            }} className="bg-green-500 text-white px-3 py-1">Next Group</button>
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

      <div className="flex justify-around bg-black p-2 text-xs">
        <div>Update: {lastUpdate}</div>
        <div onClick={handleShare}>Share</div>
        <div onClick={handleInvite}>Invite</div>
      </div>

    </div>
  );
}
