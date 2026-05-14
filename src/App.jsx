import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { db } from "./firebase";
import { generateAutoName, createPlayer, loadPlayer, renamePlayer } from "./player";
import { saveScore,loadTopScores } from "./leaderboard";
import { doc, setDoc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";

export default function QuizApp() {
  async function updatePlayerScores(newName){

  try {

    const currentPlayerId =
      localStorage.getItem("playerId");

    const snap = await getDocs(
      collection(db,"scores")
    );

    for (const d of snap.docs){

      const data = d.data();

      if(
        data.playerId === currentPlayerId
      ){

        await updateDoc(
          doc(db,"scores",d.id),
          {
            playerName:newName
          }
        );

      }

    }

  } catch(e){

    console.log(
      "update error",
      e
    );

  }

}
 async function saveSingleCategory(category, questions) {

  try {

    await setDoc(
      doc(db, "quiz", category),
      {
        questions: questions,
        updatedAt:
      new Date().toLocaleDateString()
      }
    );

  } catch (e) {

    console.log("Firebase save error", e);

  }

}
 async function loadQuizData() {

  try {

    const querySnapshot = await getDocs(
      collection(db, "quiz")
    );

    const loadedData = {};

    querySnapshot.forEach((docSnap) => {

  if(docSnap.data().updatedAt){

    setLastUpdate(
      docSnap.data().updatedAt
    );

  }

  loadedData[docSnap.id] =
    docSnap.data().questions || [];

});

    return loadedData;

  } catch (e) {

    console.log("Firebase load error", e);

    return null;
  }
}
async function autoMoveBySchedule(allData){

  const now = new Date();

  const hour = now.getHours();

  const day = now.getDay(); // Saturday = 6

  const todayKey =
    now.toDateString();

  const updated = { ...allData };

  // 🔥 schedule document
  const scheduleRef =
    doc(db, "system", "schedule");

  const scheduleSnap =
    await getDoc(scheduleRef);

  const schedule =
    scheduleSnap.exists()
      ? scheduleSnap.data()
      : {};

  /* 🔵 Today -> This Week
     Every day after 8 PM */
  if(
    hour >= 20 &&
    schedule.todayMoved !== todayKey
  ){

    const todayQs =
      updated["Today"] || [];

    const weekQs =
      updated["This Week"] || [];

    if(todayQs.length > 0){

      updated["This Week"] = [
        ...weekQs,
        ...todayQs
      ];

      updated["Today"] = [];

      await saveSingleCategory(
        "Today",
        []
      );

      await saveSingleCategory(
        "This Week",
        updated["This Week"]
      );
    }

    schedule.todayMoved = todayKey;

    await setDoc(
      scheduleRef,
      schedule,
      { merge:true }
    );
  }

  /* 🟣 This Week -> Previous Week
     Every Saturday after 7 PM */
  if(
    day === 6 &&
    hour >= 19 &&
    schedule.weekMoved !== todayKey
  ){

    const weekQs =
      updated["This Week"] || [];

    const prevQs =
      updated["Previous Week"] || [];

    if(weekQs.length > 0){

      updated["Previous Week"] = [
        ...prevQs,
        ...weekQs
      ];

      updated["This Week"] = [];

      await saveSingleCategory(
        "This Week",
        []
      );

      await saveSingleCategory(
        "Previous Week",
        updated["Previous Week"]
      );
    }

    schedule.weekMoved = todayKey;

    await setDoc(
      scheduleRef,
      schedule,
      { merge:true }
    );
  }

  /* 🟢 Previous Week -> This Month
     Every Saturday after 6 PM */
  if(
    day === 6 &&
    hour >= 18 &&
    schedule.monthMoved !== todayKey
  ){

    const prevQs =
      updated["Previous Week"] || [];

    const monthQs =
      updated["This Month"] || [];

    if(prevQs.length > 0){

      updated["This Month"] = [
        ...monthQs,
        ...prevQs
      ];

      updated["Previous Week"] = [];

      await saveSingleCategory(
        "Previous Week",
        []
      );

      await saveSingleCategory(
        "This Month",
        updated["This Month"]
      );
    }

    schedule.monthMoved = todayKey;

    await setDoc(
      scheduleRef,
      schedule,
      { merge:true }
    );
  }

  return updated;
}
/* mannual move one group to another group */
async function moveQuestions(
  fromGroup,
  toGroup
){

  const fromQs =
    data[fromGroup] || [];

  if(fromQs.length === 0){

    alert("No questions");
    return;
  }

  const toQs =
    data[toGroup] || [];

  // duplicate avoid
  const uniqueToQs =
    toQs.filter(
      q =>
        !fromQs.some(
          f =>
            f.q.en === q.q.en
        )
    );

  const updatedTo = [
    ...uniqueToQs,
    ...fromQs
  ];

  await saveSingleCategory(
    toGroup,
    updatedTo
  );

  await saveSingleCategory(
    fromGroup,
    []
  );

  setData(prev => ({
    ...prev,
    [toGroup]: updatedTo,
    [fromGroup]: []
  }));

  alert(
    `${fromGroup} → ${toGroup} moved`
  );
}

async function archiveMonth(targetGroup){

  const monthQs = data["This Month"] || [];

  if(monthQs.length === 0){
    alert("No questions");
    return;
  }

  const targetQs = data[targetGroup] || [];
  const updatedTarget = [...targetQs,...monthQs];

  await saveSingleCategory(
    targetGroup,
    updatedTarget
  );

  await saveSingleCategory(
    "This Month",
    []
  );

  setData(prev => ({
    ...prev,
    [targetGroup]: updatedTarget,
    "This Month": []
  }));

  alert("Moved!");
}
async function loadOverallLeaderboard(){

  try{

    const snap = await getDocs(
      collection(db,"scores")
    );

    const bestScores = {};

    snap.forEach(docSnap=>{

      const d = docSnap.data();

      const playerId = d.playerId;

      const category = d.category;

      const score =
        d.score ||
        d.correctAnswers ||
        0;

      if(!playerId || !category)
        return;

      if(!bestScores[playerId]){

        bestScores[playerId] = {
          playerName:
          d.playerName || "Player",
          playerId,
          categories:{},
          totalScore:0
        };

      }

      const currentBest =

        bestScores[playerId]
          .categories[category] || 0;

      if(score > currentBest){

        bestScores[playerId]
          .categories[category] = score;

      }

    });

    const finalLeaders =

      Object.values(bestScores)

        .map(player=>({

          ...player,

          totalScore:

            Object.values(
              player.categories
            ).reduce(
              (a,b)=>a+b,
              0
            )

        }))

        .sort(
          (a,b)=>
            b.totalScore -
            a.totalScore
        );

    setOverallLeaders(
      finalLeaders
    );

  } catch(e){

    console.log(
      "overall leaderboard error",
      e
    );

  }

}
  const [screen, setScreen] = useState("home");
  const [lastUpdate, setLastUpdate] = useState("-");
  const [openCategory, setOpenCategory] = useState(null);
  const [week, setWeek] = useState("वैशाख");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [time, setTime] = useState(15);
  const [selected, setSelected] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [modal, setModal] = useState(null);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerAvatar, setPlayerAvatar] = useState("👨‍💻");
  const [nameInput, setNameInput] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameTimer, setNameTimer] = useState(30);
  const [isRenameMode, setIsRenameMode] = useState(false);
  const [topScores, setTopScores] = useState([]);
  const menuRef = useRef(null);
  const [users, setUsers] = useState(0);
  const [showOverall,setShowOverall] = useState(false);
  const [searchPlayer,setSearchPlayer] = useState("");
  const [showSearch,setShowSearch] = useState(false);
  const [overallLeaders,setOverallLeaders] = useState([]);
  const [selectedPlayer,setSelectedPlayer] = useState(null);
  const mainGroups = ["Today","This Week","Previous Week","This Month"];

const monthGroups = ["वैशाख","जेठ","असार","साउन","भाद्र","अशोज","कार्तिक","मंसिर","पौष","माघ","फागुन","चैत","अघिल्लो वर्ष"];

const otherGroups = ["१६ औ योजना","जनगणना","दिर्घकालीन सोच","संविधान","प्रदेश","स्थानीय तह","दिगो विकास लक्ष्य","राष्ट्रिय गौरवका आयोजना","खरिद ऐन","आर्थिक कार्यविधि"];

const eventGroups = ["पुरस्कार","निधन","सम्मेलन","खेलकुद","दुर्घटना","दिवश","साहित्य","प्रतिवेदन","नियुक्ति","सम्झौता/समझदारी","सार्वजनिक संस्थान","मलेप प्रतिवेदन","आर्थिक सर्वेक्षण","मौद्रिक नीति","अन्तराष्ट्रिय घटना"];


  useEffect(()=>{
    if (typeof window !== "undefined" && window.FBInstant) {
      window.FBInstant.initializeAsync()
        .then(()=> window.FBInstant.startGameAsync())
        .catch(()=>{});
    }
  },[]);
  useEffect(()=>{

setupPlayer();

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

  const text = `🔥 Come play this Current quiz!\nCan you challenge my score? 😎\n▶ Tap the preview above to play!`;

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

  const defaultGroups = ["Today","This Week","This Month","Previous Week","वैशाख","जेठ","असार","साउन","भाद्र","अशोज","कार्तिक","मंसिर","पौष","माघ","फागुन","चैत","अघिल्लो वर्ष","१६ औ योजना","जनगणना","दिर्घकालीन सोच","संविधान","प्रदेश","स्थानीय तह","दिगो विकास लक्ष्य","राष्ट्रिय गौरवका आयोजना","खरिद ऐन","आर्थिक कार्यविधि","पुरस्कार","निधन","सम्मेलन","खेलकुद","दुर्घटना","दिवश","साहित्य","प्रतिवेदन","नियुक्ति","सम्झौता/समझदारी","सार्वजनिक संस्थान","मलेप प्रतिवेदन","आर्थिक सर्वेक्षण","मौद्रिक नीति","अन्तराष्ट्रिय घटना"];

  const emptyQ = { q:{en:""}, options:["","","",""], a:"" };

  const sampleQuestions = [
    { q:{en:"नेपालको राजधानी कहाँ हो?"}, options:["काठमाडौं","दिल्ली","टोकियो","लन्डन"], a:"काठमाडौं" },
    { q:{en:"2+2 कति हुन्छ?"}, options:["3","4","5","6"], a:"4" },
    { q:{en:"सूर्य कुन दिशाबाट उदाउँछ?"}, options:["पूर्व","पश्चिम","उत्तर","दक्षिण"], a:"पूर्व" }
  ];

 const [data, setData] = useState(() => {
  const init = {};

  defaultGroups.forEach(g => {
    init[g] = sampleQuestions.map(q => ({
      q: { en: q.q.en },
      options: [...q.options],
      a: q.a
    }));
  });

  return init;
});
const questions = data[week] || [];
const currentPlayerId =
 localStorage.getItem("playerId");

const playerRank =
  topScores.findIndex(

    p => p.playerId === currentPlayerId

  ) + 1;

const finalRank =

  playerRank > 0

    ? playerRank

    : "--";

useEffect(() => {

  loadQuizData().then(async (res) => {

    if(res && typeof res === "object"){

      const updatedData =
        await autoMoveBySchedule(res);

      setData(updatedData);

    }

  });

}, []);

  function start(w){
    setWeek(w);
    setIndex(0);
    setScore(0);
    setAttempted(0);
    setSelected(null);
    setTime(15);
    setTotalTimeUsed(0);
    setScreen("playing");
  }
async function setupPlayer(){

  // already exists
  const existingPlayer =
    await loadPlayer();

  if(existingPlayer){

    setPlayerName(
      existingPlayer.name
    );

    return;
  }

  // Facebook name
  if(
    typeof window !== "undefined" &&
    window.FBInstant &&
    window.FBInstant.player
  ){

    const fbName =
      window.FBInstant.player.getName();

    if(fbName){

      await createPlayer(fbName);

      setPlayerName(fbName);

      return;
    }
  }

  // no FB name
  setShowNameModal(true);

  // auto create after 30 sec
  setTimeout(async ()=>{

const autoPlayer =
  generateAutoName();

await createPlayer(
  autoPlayer.name
);

setPlayerName(
  autoPlayer.name
);

setPlayerAvatar(
  autoPlayer.avatar
);

    setShowNameModal(false);

  },30000);
}
function handleSelect(group){
  start(group);
  setOpenCategory(null);
}
  function next(){

  if(index + 1 < questions.length){

    setIndex(i => i + 1);

    setTime(15);

  } else {

    saveScore({

      playerName,

      correctAnswers: score,

      timeUsed: totalTimeUsed,

      total: questions.length,

      category: week

    });

    setScreen("result");

  }

}

  function answer(opt){
    if(selected!==null) return;
    setSelected(opt);
    setAttempted(a=>a+1);
    if(opt===questions[index].a) setScore(s=>s+1);
    setTotalTimeUsed( t => t + (15 - time)
);
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
  if(screen !== "result")
    return;
  loadTopScores(week)
    .then(setTopScores);
},[screen, week]);

useEffect(()=>{ async function loadUsers(){ const snap = await getDocs( collection(db,"players") );
setUsers( snap.size * 50 ); } loadUsers(); },[]);

useEffect(()=>{

  if(!showNameModal)
    return;

  if(nameTimer <= 0)
    return;

  const t = setTimeout(()=>{

    setNameTimer(v=>v-1);

  },1000);

  return ()=>clearTimeout(t);

},[showNameModal, nameTimer]);
  
  useEffect(()=>{
  if(editorOpen){
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}, 
[editorOpen]);

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

{/* 👤 Left: Player */}
<div style={{
  position: "absolute",
  left: "10px",
  fontSize: "14px",
  lineHeight:"1.4",
  maxWidth:"120px"
}}>

  <div
    onClick={()=>{
      setIsRenameMode(true);
      setNameInput(playerName);
      setShowNameModal(true);
    }}

    style={{
      cursor:"pointer",
      display:"inline-block",
      overflow:"hidden",
      textOverflow:"ellipsis",
      whiteSpace:"nowrap"
    }}
  >
    {playerAvatar} {playerName || "Player"}
  </div>
<div

  onClick={async ()=>{

    await loadOverallLeaderboard();

    setShowOverall(true);

  }}
  style={{
    fontSize:"12px",
    opacity:0.8,
    marginTop:"2px",
    cursor:"pointer"
  }}>
    👥 {

      users >= 1000

        ? (users / 1000).toFixed(1) + "K"

        : users
    }
  </div>

</div>

  {/* 📚 Center: Smart Animated Title */}
<div
  onClick={()=>setScreen("home")}
  style={{
    fontSize: "clamp(22px, 6vw, 34px)",
    fontWeight: "900",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer",

    padding: "8px 16px",
    borderRadius: "14px",

    background:
      "linear-gradient(90deg,#2563eb,#7c3aed)",

    color: "white",

    boxShadow:
      "0 0 18px rgba(124,58,237,0.6)",

    transition: "0.3s ease",

    transform: "scale(1)",

    animation:
      "pulseTitle 2s infinite"
  }}

  onMouseEnter={(e)=>{
    e.currentTarget.style.transform =
      "scale(1.08)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.transform =
      "scale(1)";
  }}
>

  <span style={{
    fontSize:"1.2em"
  }}>
    📚
  </span>

  <span>
    Current Quiz
  </span>

</div>

 {/* ☰ Right: Menu */}
<div
  onMouseDown={(e)=>{
  e.stopPropagation();
  setShowMenu(prev => !prev);
  }}
  style={{
    position: "absolute",
    right: "10px",

    width: "42px",
    height: "42px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "24px",
    fontWeight: "bold",

    cursor: "pointer",

    borderRadius: "12px",

    background: showMenu
      ? "#2563eb"
      : "rgba(255,255,255,0.15)",

    color: "white",

    boxShadow:
      "0 2px 8px rgba(0,0,0,0.25)",

    transition: "all 0.2s ease",

    backdropFilter: "blur(6px)"
  }}

>
  {showMenu ? "✕" : "☰"}
</div>
  {/* MENU */}
       {showMenu && (
  <div
    ref={menuRef}
    style={{
      position: "absolute",
      top: "70px",
      right: "10px",
      background: "white",
      color: "black",
      padding: "8px",
      fontSize: "12px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      zIndex: 9999,

      maxHeight: "70vh",
      overflowY: "auto"
    }}
  >
    <div onClick={()=>{setModal("password"); setShowMenu(false);}}style={{
    padding:"12px",
    cursor:"pointer",
    borderBottom:"1px solid #ddd"
  }}>
  Edit Questions
</div>
  <div onClick={()=>{setModal("feedback"); setShowMenu(false);}}style={{
    padding:"12px",
    cursor:"pointer",
    borderBottom:"1px solid #ddd"
  }}>
  Feedback
</div>
   <div onClick={()=>{setModal("contact"); setShowMenu(false);}}style={{
    padding:"12px",
    cursor:"pointer",
    borderBottom:"1px solid #ddd"
  }}>Contact</div>
<div onClick={()=>{setModal("rules"); setShowMenu(false);}}style={{
    padding:"12px",
    cursor:"pointer",
    borderBottom:"1px solid #ddd"
  }}>Rules</div>
    <div onClick={()=>{
       navigator.clipboard.writeText(
    window.location.href
  );
      setShowMenu(false);
    }}style={{
    padding:"12px",
    cursor:"pointer",
    borderBottom:"1px solid #ddd"
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
    width:"115px",
    maxHeight:"70vh",
    overflowY:"auto",
    display:"flex",
    flexDirection:"column",
    gap:"6px",
    padding:"5px",
    background:"#1e40af",
    borderRadius:"8px",
     cursor:"pointer",
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
      width:"115px",
      maxHeight:"70vh",
      overflowY:"auto",
      display:"flex",
      flexDirection:"column",
      gap:"6px",
      padding:"5px",
      background:"#1e40af",
      borderRadius:"8px",
       cursor:"pointer",
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
    width:"125px",
    maxHeight:"70vh",
    overflowY:"auto",
    display:"flex",
    flexDirection:"column",
    gap:"6px",
    padding:"5px",
    background:"#1e40af",
    borderRadius:"8px",
     cursor:"pointer",
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
    {/* ❓ screen playing */}
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

{/* 🔝 Top bar (group | question center | timer right) */}
<div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: "400px",
  margin: "0 auto 10px auto",
  position: "relative"
}}>

  {/* 📂 Left: Current Group */}
  <div style={{
    fontSize: "14px",
    fontWeight: "bold",
    opacity: 0.9
  }}>
    📂 {week}
  </div>

  {/* 🔢 Center: Question count */}
  <div style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "13px"
  }}>
    Q {index+1} / {questions.length}
  </div>

  {/* ⏱ Right: Timer */}
  <div style={{
    fontWeight: "bold",
    fontSize: "18px"
  }}>
    {time}s
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
    <button onClick={()=>setScreen("home")}>Back</button>
    <button onClick={next}>Skip</button>
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
    justifyContent: "flex-start",
    textAlign: "center",
    width: "100%",
    padding: "clamp(16px, 4vw, 24px)",
    paddingTop: "20px",
    paddingBottom: "80px",
    overflowX:"hidden",
    position:"relative",
  }}>
    
   {/* 🏆 Top left Card */}
<div style={{
  position:"absolute",
  top:"8px",
  left:"8px",

  background:"rgba(255,255,255,0.10)",

  backdropFilter:"blur(8px)",

  padding:"6px 8px",

  borderRadius:"10px",

  border:"1px solid rgba(255,255,255,0.12)",

  boxShadow:"0 2px 8px rgba(0,0,0,0.2)",

  textAlign:"left",

  display:"inline-block"
}}>

  <div style={{
    fontSize:"10px",
    opacity:0.8,
    marginBottom:"2px",
    whiteSpace:"nowrap"
  }}>
    📂 {week}
  </div>

  <div style={{
    fontWeight:"bold",
    fontSize:"12px",
    whiteSpace:"nowrap"
  }}>
    ⭐ {score}/{questions.length}
  </div>

  <div style={{
    marginTop:"2px",
    color:"#facc15",
    fontWeight:"bold",
    fontSize:"10px",
    whiteSpace:"nowrap"
  }}>
    🏆 #{finalRank}
  </div>

</div>

    {/* 📊 Progress Bar */}
    <div style={{
      width: "100%",
      maxWidth: "280px",
      height: "10px",
      background: "#334155",
      borderRadius: "10px",
      overflow: "hidden",
      marginBottom: "12px"
    }}>
      <div style={{
        width: `${(score / questions.length) * 100}%`,
        height: "100%",
        background: "#22c55e",
        transition: "width 0.6s ease"
      }} />
    </div>

    {/* 🧠 Performance Message */}
    <div style={{
      fontSize: "clamp(15px, 4vw, 18px)",
      marginBottom: "12px"
    }}>
      {score === questions.length
        ? "Perfect 🎯"
        : score > questions.length * 0.7
        ? "Great Job 🔥"
        : score > questions.length * 0.4
        ? "Good 👍"
        : "Try Again 😅"}
    </div>

    {/* 📋 Stats Grid */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "6px",
      width: "100%",
      maxWidth: "240px",
      fontSize: "13px",
      marginBottom: "16px"
    }}>

      <div style={{
        background:"#c210b3",
        padding:"6px",
        borderRadius:"6px"
      }}>
        <div style={{opacity:0.7}}>Total</div>
        <div style={{fontWeight:"bold"}}>
          {questions.length}
        </div>
      </div>

      <div style={{
        background:"#0b2bdd",
        padding:"6px",
        borderRadius:"6px"
      }}>
        <div style={{opacity:0.7}}>Attempted</div>
        <div style={{fontWeight:"bold"}}>
          {attempted}
        </div>
      </div>

      <div style={{
        background:"#11ee62",
        padding:"6px",
        borderRadius:"6px"
      }}>
        <div style={{opacity:0.8}}>Right</div>
        <div style={{fontWeight:"bold"}}>
          {score}
        </div>
      </div>

      <div style={{
        background:"#dc2626",
        padding:"6px",
        borderRadius:"6px"
      }}>
        <div style={{opacity:0.8}}>Wrong</div>
        <div style={{fontWeight:"bold"}}>
          {attempted - score}
        </div>
      </div>

    </div>

{/* 🏆 Leaderboard */}
<div style={{

  width:"85%",
  maxWidth:"330px",

  overflow:"hidden",

  boxSizing:"border-box",

  marginTop:"10px",

  background:"rgba(255,255,255,0.08)",

  borderRadius:"14px",

  padding:"6px",

  backdropFilter:"blur(10px)"
}}>

  {/* Title */}
  <div style={{

    fontSize:"17px",

    fontWeight:"bold",

    marginBottom:"10px",

    textAlign:"center"
  }}>
    🏆 Top Players
  </div>

  {/* Scroll Area */}
  <div style={{

    height:"165px",
    overflowY:"auto",
    overflowX:"hidden",
    width:"95%",
    display:"flex",
    flexDirection:"column",
    gap:"4px",
    paddingRight:"2px",
    scrollbarWidth:"thin",
  }}>

    {topScores.slice(0,10).map((p,i)=>(

      <div
        key={p.id}

        style={{

          display:"grid",
          gridTemplateColumns:"38px 1fr 52px 52px",
          alignItems:"center",
          minHeight:"36px",
          gap:"4px",
          width:"100%",
          boxSizing:"border-box",
          overflow:"hidden",
          background:
            i===0
              ? "rgba(250,204,21,0.18)"
            : i===1
              ? "rgba(226,232,240,0.14)"
            : i===2
              ? "rgba(251,146,60,0.14)"
            : p.playerName === playerName
              ? "rgba(34,197,94,0.18)"
              : "rgba(255,255,255,0.06)",

          boxShadow:
            i===0
              ? "0 0 10px rgba(250,204,21,0.25)"
              : "none",
          padding:"6px",
          borderRadius:"10px",
          fontSize:"10px"
        }}
      >

        {/* Rank */}
        <div style={{
          fontWeight:"bold",
          fontSize:"12px"
        }}>
          {i===0 ? "🥇" :
           i===1 ? "🥈" :
           i===2 ? "🥉" :
           `#${i+1}`}
        </div>

        {/* Name */}
        <div style={{

          overflow:"hidden",

          textOverflow:"ellipsis",

          whiteSpace:"nowrap"
        }}>
          {p.playerName}
        </div>

        {/* Score */}
        <div style={{
          background:"#2563eb",
          padding:"3px 6px",
          borderRadius:"999px",
          fontSize:"12px",
          fontWeight:"bold",
          textAlign:"center"
        }}> ⭐{p.score}
        </div>

        {/* Time */}
        <div style={{
          fontSize:"10px",
          opacity:0.8,
          textAlign:"right"
        }}>
          ⏱ {p.timeUsed || 0}s
        </div>

      </div>
    ))}

  </div>

  {/* Sticky Current Player */}
  {!topScores
    .slice(0,10)
    .some(p => p.playerName === playerName) && (

    <div style={{

      display:"grid",
      gridTemplateColumns:"38px 1fr 52px 52px",
      alignItems:"center",
      gap:"4px",
      marginTop:"8px",
      width:"100%",
      boxSizing:"border-box",
      background:"rgba(34,197,94,0.18)",
      padding:"3px 6px",
      borderRadius:"10px",
      fontSize:"10px"
    }}>

      {/* Rank */}
      <div style={{
        fontWeight:"bold"
      }}>
        #{finalRank}
      </div>

      {/* Name */}
      <div style={{
        overflow:"hidden",
        textOverflow:"ellipsis",
        whiteSpace:"nowrap"
      }}>
        You
      </div>

      {/* Score */}
      <div style={{
        background:"#16a34a",
        padding:"3px 6px",
        borderRadius:"999px",
        fontSize:"12px",
        fontWeight:"bold",
        textAlign:"center"
      }}> ⭐{score}
      </div>

      {/* Time */}
      <div style={{
        fontSize:"11px",
        opacity:0.8,
        textAlign:"right"
      }}>
        ⏱ {totalTimeUsed}s
      </div>

    </div>
  )}

</div>

 {/* 🔘 Buttons */}
        <div style={{
  width: "100%",
  maxWidth: "360px",
  margin: "12px auto 0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
  gap: "6px"
}}>

  {/* 🔙 Back */}
  <button
    onClick={()=>setScreen("home")}
    style={{
      width: "100%",
      padding: "6px 4px)",
      fontSize: "12px",
      borderRadius: "8px",
      background: "#facc15",
      color: "black",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      transition: "all 0.15s ease"
    }}
  >
    ⬅ Back
  </button>

  {/* 🔁 Play */}
  <button
    onClick={()=>start(week)}
    style={{
      width: "100%",
      padding: "6px 4px)",
      fontSize: "12px",
      borderRadius: "8px",
      background: "white",
      color: "black",
      fontWeight: "600",
      boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
      transition: "all 0.15s ease"
    }}
  >
    🔁 Play
  </button>

  {/* ⏭ Next */}
  <button
    onClick={()=>{
      const idx = defaultGroups.indexOf(week);
      const nextGroup = defaultGroups[(idx+1) % defaultGroups.length];
      start(nextGroup);
    }}
    style={{
      width: "100%",
      padding: "6px 4px)",
      fontSize: "12px",
      borderRadius: "8px",
      background: "#22c55e",
      color: "white",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      transition: "all 0.15s ease"
    }}
  >
    ➡ Next
  </button>

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

  onChange={e=>
    updateQ(
      i,
      "q",
      e.target.value
    )
  }

  onKeyDown={(e)=>{

    const inputs =
      Array.from(
        document.querySelectorAll(
          "input"
        )
      );

    const index =
      inputs.indexOf(e.target);

    if(e.key === "ArrowDown"){

      e.preventDefault();

      inputs[index + 1]?.focus();
    }

    if(e.key === "ArrowUp"){

      e.preventDefault();

      inputs[index - 1]?.focus();
    }

  }}

  style={{
    width:"100%",
    marginBottom:"5px"
  }}
/>

            {q.options.map((o,oi)=>(
             <input
  key={oi}
  placeholder={`Option ${oi+1}`}
  value={o || ""}

  onChange={e=>
    updateQ(
      i,
      "opt",
      e.target.value,
      oi
    )
  }

  onKeyDown={(e)=>{

    const inputs =
      Array.from(
        document.querySelectorAll(
          "input"
        )
      );

    const index =
      inputs.indexOf(e.target);

    if(e.key === "ArrowDown"){

      e.preventDefault();

      inputs[index + 1]?.focus();
    }

    if(e.key === "ArrowUp"){

      e.preventDefault();

      inputs[index - 1]?.focus();
    }

  }}

  style={{
    width:"100%",
    marginBottom:"5px"
  }}
/>
            ))}

            <input
  placeholder="Correct answer"
  value={q.a || ""}

  onChange={e=>
    updateQ(
      i,
      "a",
      e.target.value
    )
  }

  onKeyDown={(e)=>{

    const inputs =
      Array.from(
        document.querySelectorAll(
          "input"
        )
      );

    const index =
      inputs.indexOf(e.target);

    if(e.key === "ArrowDown"){

      e.preventDefault();

      inputs[index + 1]?.focus();
    }

    if(e.key === "ArrowUp"){

      e.preventDefault();

      inputs[index - 1]?.focus();
    }
     if(e.key === "Enter"){

    e.preventDefault();

    document
      .getElementById(
        "submitBtn"
      )
      ?.click();

  }

  }}

  style={{
    width:"100%",
    marginBottom:"5px"
  }}
/>
<select
  id={`copy-${i}`}
  style={{
    marginRight:"6px"
  }}
>

  {defaultGroups.map(g=>(

    <option
      key={g}
      value={g}
    >
      {g}
    </option>

  ))}

</select>

<button
  onClick={()=>{

    const targetGroup =
      document.getElementById(
        `copy-${i}`
      ).value;

    // same group avoid
    if(targetGroup === week){

      alert(
        "Same group selected"
      );

      return;
    }

    // duplicate avoid
    const alreadyExists =

      (data[targetGroup] || [])
      .some(

        item =>

          item.q.en ===
          q.q.en

      );

    if(alreadyExists){

      alert(
        "Question already exists"
      );

      return;
    }

    const copiedQuestion =

      JSON.parse(
        JSON.stringify(q)
      );

    setData(prev=>({

      ...prev,

      [targetGroup]: [

        ...(prev[targetGroup] || []),

        copiedQuestion

      ]

    }));
    saveSingleCategory(
  targetGroup,
  [
    ...(data[targetGroup] || []),
    copiedQuestion
  ]
);

    alert(
      `Copied to ${targetGroup}`
    );

  }}
>
  Copy
</button>

            <button onClick={()=>deleteQuestion(i)}>Delete</button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
<div style={{padding:"10px", borderTop:"1px solid #ddd"}}>

  <button onClick={addQuestion}>+ Add</button>
<button
  id="submitBtn"
  onKeyDown={(e)=>{

    if(e.key === "Enter"){

      e.preventDefault();

      e.target.click();

    }

  }}
   onClick={async ()=>{

  const list = data[week];

  for(const q of list){

    // question empty
    if(!q.q?.en?.trim()){

      alert("Question empty");
      return;
    }

    // option empty
    if(
      q.options.some(
        op => !op.trim()
      )
    ){

      alert(
        "All 4 options required"
      );

      return;
    }

    // answer empty
    if(!q.a?.trim()){

      alert(
        "Correct answer required"
      );

      return;
    }

    // answer must match option
    if(
      !q.options.some(
  op =>
    op.trim() === q.a.trim()
)
    ){

      alert(
        "Correct answer must match one option"
      );

      return;
    }

  }

  await saveSingleCategory(
    week,
    data[week]
  );

  setSavedMsg(true);

  setTimeout(
    ()=>setSavedMsg(false),
    2000
  );

}}>
  Submit
</button>

  <button onClick={()=>{
    setEditorOpen(false);
    setScreen("home");
  }}>
    Back
  </button>

  {savedMsg && <div>✔ Saved</div>}

  <div style={{marginTop:"15px"}}>

    <button
      onClick={()=>
        moveQuestions(
          "Today",
          "This Week"
        )
      }
    >
      Today → This Week
    </button>

    <button
      onClick={()=>
        moveQuestions(
          "This Week",
          "Previous Week"
        )
      }
    >
      This Week → Previous Week
    </button>

    <button
      onClick={()=>
        moveQuestions(
          "Previous Week",
          "This Month"
        )
      }
    >
      Previous Week → This Month
    </button>

  </div>

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

      {modal==="contact" && (
  <div style={{
    marginTop:"12px",
    lineHeight:"1.8",
    fontSize:"15px",

    maxHeight:"60vh",
  overflowY:"auto",
  paddingRight:"6px"
  }}>

    <div>
      📧 <b>Email:</b><br/>

      <a
        href="mailto:currentquiz@gmail.com"
        style={{
          color:"#2563eb"
        }}
      >
        currentquiz@gmail.com
      </a>

    </div>

    <br/>

    <div>
      💬 <b>Facebook:</b><br/>

      <a
        href="https://www.facebook.com/noticesbank"
        target="_blank"
        rel="noreferrer"
        style={{
          color:"#2563eb"
        }}
      >
        Current Quiz Nepal
      </a>

    </div>

    <br/>

    <div>
      📞 <b>Phone:</b><br/>

      <a
        href="tel:+9779768997522"
        style={{
          color:"#2563eb"
        }}
      >
        +977 9768997522
      </a>

    </div>

    <br/>

   <div>
  📱 <b>Support:</b><br/>

  <a
    href="https://wa.me/9779768997522"
    target="_blank"
    rel="noreferrer"
    style={{
      color:"#2563eb"
    }}
  >
    Chat on WhatsApp
  </a>

</div>
</div>
)}
      {modal==="rules" && (
  <div
    style={{
      marginTop:"14px",
  lineHeight:"1.9",
  fontSize:"15px",
  color:"#111827",

  maxHeight:"60vh",
  overflowY:"auto",
  paddingRight:"6px"
    }}
  >

    📖 Current Quiz contains important
    current questions for all public
    service groups and levels.

    <br/><br/>

    📚 <b>Today:</b><br/>
    New questions are added daily after 8 PM
    and stay for 24 hours.

    <br/><br/>

    📅 <b>This Week:</b><br/>
    Weekly questions remain until
    Saturday 7 PM.

    <br/><br/>

    🗓 <b>This Month:</b><br/>
    Weekly questions move here every
    Saturday after 6 PM.

    <br/><br/>

    🏆 <b>Weekly Challenge:</b><br/>
    Winners may receive prizes.
    Available only in the This Week group.

    <br/><br/>

    📢 More updates and rules will be
shared on

<a
  href="https://www.facebook.com/noticesbank"
  target="_blank"
  rel="noreferrer"
  style={{
    color:"#2563eb",
    fontWeight:"bold",
    textDecoration:"none"
  }}
>
  Facebook
</a>

every Saturday.

    <br/><br/>

    🎯 Play fairly and enjoy learning!

  </div>
)}
      {modal==="feedback" && (
  <div
    style={{
      marginTop:"14px",
      lineHeight:"2",
      fontSize:"15px",

      maxHeight:"60vh",
      overflowY:"auto",
      paddingRight:"6px"
    }}
  >

    💬 Send your feedback, suggestions,
    or report problems using the options below.

    <br/><br/>

    📱 <b>WhatsApp:</b><br/>

    <a
      href="https://wa.me/9779768997522"
      target="_blank"
      rel="noreferrer"
      style={{
        color:"#2563eb",
        fontWeight:"bold",
        textDecoration:"none"
      }}
    >
      Send on WhatsApp
    </a>

    <br/><br/>

    💬 <b>Messenger:</b><br/>

    <a
      href="https://m.me/noticesbank"
      target="_blank"
      rel="noreferrer"
      style={{
        color:"#2563eb",
        fontWeight:"bold",
        textDecoration:"none"
      }}
    >
      Send on Messenger
    </a>

    <br/><br/>

    📧 <b>Email:</b><br/>

    <a
      href="mailto:currentquiz@gmail.com"
      style={{
        color:"#2563eb",
        fontWeight:"bold",
        textDecoration:"none"
      }}
    >
      currentquiz@gmail.com
    </a>

    <br/><br/>

    ❤️ Thank you for supporting
    Current Quiz!

  </div>
)}
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

{/* overall leaderboard */}
{showOverall && (
  <div
onClick={()=>{
setShowOverall(false);
setSearchPlayer("");
setShowSearch(false);
}}
    style={{
      position:"fixed",
      top:0,
      left:0,
      width:"100%",
      height:"100%",
      background:"rgba(0,0,0,0.55)",
      zIndex:999999,
      display:"flex",
      alignItems:"flex-end",
      justifyContent:"flex-start"
    }}
  >

    <div
     onClick={(e) => e.stopPropagation()}
      style={{
        background:"rgba(15,23,42,0.96)",
        color:"white",
        backdropFilter:"blur(16px)",
        border:"1px solid rgba(255,255,255,0.08)",
        boxShadow:"0 10px 35px rgba(0,0,0,0.45)",
        width:"65%",
        maxWidth:"430px",
        height:"75%",
        overflowY:"auto",
        borderTopLeftRadius:"20px",
        borderTopRightRadius:"20px",
        padding:"15px",
        marginBottom:"65px",
      }}
    >

      {/* HEADER */}
      <div
        style={{
          position:"sticky",
          top:0,
          zIndex:10,
          background:"rgba(15,23,42,0.96)",
          backdropFilter:"blur(10px)",
          borderBottom:"1px solid rgba(255,255,255,0.08)",
          paddingBottom:"10px",
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          marginBottom:"15px"
        }}
      >

        <h3
          style={{
            margin:0,
            fontSize:"20px"
          }}
        >
          🏆 Overall
        </h3>
<div
  style={{
    display:"flex",
    alignItems:"center",
    gap:"6px"
  }}
>
  <input
    placeholder="🔍"
    maxLength={12}
    value={searchPlayer}
    onChange={(e)=> setSearchPlayer(e.target.value)}
    onFocus={()=> setShowSearch(true)}
    onBlur={()=>{
      if(!searchPlayer){
        setShowSearch(false);
      }
    }}

    style={{
      background:"rgba(255,255,255,0.08)",
      color:"white",
      border:"1px solid rgba(255,255,255,0.08)",
      width:"70px",
     opacity: showSearch ? 1 : 0.7,
      padding:"2px 4px",
      fontSize:"11px",
      borderRadius:"8px",
      outline:"none",
      transition:"0.25s"
    }}
  />
</div>
        <button
         onClick={() => {
         setShowOverall(false);
         setSearchPlayer("");
         setShowSearch(false);
        }}
          style={{
              background:"rgba(255,255,255,0.08)",
              color:"white",
              border:"none",
              width:"28px",
              height:"28px",
              fontSize:"12px",
              borderRadius:"8px",
              cursor:"pointer",
               padding:0
          }}
        >
          ❌
        </button>

      </div>

{/* TOP 20 */}
      {overallLeaders

  .filter(p=>
    p.playerName
      ?.toLowerCase()
      .includes(
        searchPlayer
          .toLowerCase()
      )
  )
  .slice(0,20)
  .map((p,i)=>(
  <>
    
    <div
      key={p.playerId}

  onClick={() => {

  if(selectedPlayer?.playerId === p.playerId){

    setSelectedPlayer(null);

  } else {

    setSelectedPlayer(p);

  }

}}
  style={{
  display:"grid",
  gridTemplateColumns:"35px 1fr fit-content(70px)",
  gap:"6px",
  alignItems:"center",
  padding:"7px 10px",
  marginBottom:"8px",
  borderRadius:"12px",

  position:"relative",
  zIndex:20,
  cursor:"pointer",

  background:
    i===0
      ? "linear-gradient(135deg,#f59e0b,#facc15)"
    : i===1
      ? "linear-gradient(135deg,#94a3b8,#e2e8f0)"
    : i===2
      ? "linear-gradient(135deg,#fb923c,#fdba74)"
    : "rgba(255,255,255,0.06)",

  color:
    i < 3
      ? "#111827"
      : "white"
}}
        >

          {/* RANK */}
          <div
            style={{
            fontWeight:"bold",
            fontSize:"12px"
            }}
          >
            #{i+1}
          </div>

          {/* NAME */}
          <div

  style={{
    overflow:"hidden",
    textOverflow:"ellipsis",
    whiteSpace:"nowrap",
    fontSize:"12px",
    fontWeight:"600",
    minWidth:0
  }}
>
  {p.playerName}
</div>

    {/* SCORE */}
         <div
            style={{
              textAlign:"right",
              fontWeight:"bold",
              fontSize:"12px",
              whiteSpace:"nowrap",
            }}
          >
            ⭐ {p.totalScore}
          </div>
          </div>
        {selectedPlayer?.playerId === p.playerId && (

          <div
           onClick={() => setSelectedPlayer(null)}
           style={{
             position:"sticky",
             top:"35%",
             left:"50vw",
             transform:"translate(-50%,-50%)",
             width:"55%",
             zIndex:9999,
             background:"#0f172a",
             border:"2px solid #60a5fa",
             borderRadius:"12px",
             padding:"10px",
             maxHeight:"180px",
             overflowY:"auto",
             boxShadow:"0 10px 25px rgba(0,0,0,0.35)"
        }}
          >
<div
  style={{
    fontWeight:"bold",
    fontSize:"13px",
    marginBottom:"8px",
    textAlign:"center",
    color:"#93c5fd"
  }}
>
  👤 {selectedPlayer.playerName}
</div>
            {Object.entries( selectedPlayer.categories
            ).map(([cat,score]) => (

              <div
                key={cat}
                style={{
                  display:"flex",
                  justifyContent:"space-between",
                  padding:"4px 0",
                  fontSize:"12px"
                }}
              >
                <span>{cat}</span>

                <span>⭐ {score}</span>

              </div>

            ))}

          </div>

        )}
      </>
      ))}

      {/* CURRENT PLAYER */}
      {(() => {

        const currentPlayerId =
          localStorage.getItem(
            "playerId"
          );

        const myRank =
          overallLeaders.findIndex(
            p =>
              p.playerId ===
              currentPlayerId
          );

        if(
          myRank < 0 ||
          myRank < 10
        ) return null;

        const me =
          overallLeaders[myRank];

        return (

          <div
            style={{
              marginTop:"18px"
            }}
          >

            <div
              style={{
                fontSize:"12px",
                opacity:0.75,
                marginBottom:"8px"
              }}
            >
              Your Rank
            </div>

            <div
              style={{
                display:"grid",
                gridTemplateColumns:"35px 1fr fit-content(70px)",
                gap:"8px",
                alignItems:"center",
                padding:"7px 10px",
                borderRadius:"12px",
                background:"rgba(34,197,94,0.18)",
                border:"1px solid rgba(34,197,94,0.35)"
              }}
            >

              <div
                style={{
                  fontWeight:"bold"
                }}
              >
                #{myRank + 1}
              </div>

              <div
                style={{
                  overflow:"hidden",
                  textOverflow:"ellipsis",
                  whiteSpace:"nowrap",
                  fontWeight:"600"
                }}
              >
                You
              </div>

              <div
                style={{
                  textAlign:"right",
                  fontWeight:"bold"
                }}
              >
                ⭐ {me.totalScore}
              </div>

            </div>

          </div>

        );

      })()}

    </div>

  </div>

)}

{showNameModal && (

  <div
    style={{
      position:"fixed",
      top:0,
      left:0,
      width:"100%",
      height:"100%",
      background:"rgba(0,0,0,0.7)",
      zIndex:999999,
      display:"flex",
      alignItems:"center",
      justifyContent:"center"
    }}
  >

<div
  style={{
    background:"white",
    color:"black",
    padding:"20px",
    borderRadius:"12px",
    width:"90%",
    maxWidth:"320px",
    textAlign:"center"
  }}
>

  <h3>
    {isRenameMode ? "Edit Your Name" : "Enter Your Name"}
  </h3>

 {!isRenameMode && ( 
  <div style={{ 
    fontSize:"13px",
    opacity:0.7,
    marginBottom:"10px"
  }}
    > Auto name in {nameTimer} seconds... 
    </div> 
  )}

  <input
    value={nameInput}
    onChange={(e)=>
      setNameInput(e.target.value)
    }
    placeholder="Your nickname"
    style={{
      width:"100%", boxSizing:"border-box", padding:"10px", marginBottom:"12px"
    }}
  />
<div style={{

  display:"flex",

  gap:"10px",

  justifyContent:"center",

  marginTop:"10px"
}}>

  <button
    onClick={async ()=>{

      if(!nameInput.trim()) return;

      // rename existing player
      if(isRenameMode){

        await renamePlayer(
          nameInput
        );
        updatePlayerScores(nameInput); 

        setPlayerName(
          nameInput
        );

        setIsRenameMode(false);

        setShowNameModal(false);

        return;
      }

      // create new player
      await createPlayer(
        nameInput
      );

      setPlayerName(
        nameInput
      );

      setShowNameModal(false);
    }}

    style={{
      background:"#2563eb",
      color:"white",
      border:"none",
      padding:"10px 16px",
      borderRadius:"8px",
      cursor:"pointer"
    }}
  >
    Continue
  </button>

  <button
    onClick={()=>{

      setShowNameModal(false);

      setIsRenameMode(false);
    }}

    style={{
      background:"transparent",
      border:"1px solid #999",
      color:"black",
      padding:"10px 16px",
      borderRadius:"8px",
      cursor:"pointer"
    }}
  >
    Cancel
  </button>

</div>

</div>

  </div>

)}
   {/* footer (bottom bar) */}
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
