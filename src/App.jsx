import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";
import HomeScreen from "./screens/HomeScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PlayingScreen from "./screens/PlayingScreen";
import ResultScreen from "./screens/ResultScreen";
import SplashScreen from "./components/SplashScreen";
import AppModal from "./components/AppModal";
import NameModal from "./components/NameModal";
import { correctSound, wrongSound, warningSound, winSound,loseSound } from "./sounds/sound";
import introFile from "./assets/intro.mp3";
import { db } from "./firebase";
import { generateAutoName, createPlayer, loadPlayer, renamePlayer } from "./player";
import { saveScore,loadTopScores } from "./leaderboard";
import { doc, setDoc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";

const EditorModal = lazy(() =>
  import("./components/EditorModal")
);

const OverallLeaderboard = lazy(() =>
  import("./components/OverallLeaderboard")
);
const introSound = new Audio(introFile);
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

async function loadSingleCategory(category){

  try {

    const snap = await getDoc(
      doc(db, "quiz", category)
    );

    if(snap.exists()){

      return (
        snap.data().questions || []
      );

    }

    return [];

  } catch(e){

    console.log(
      "single load error",
      e
    );

    return [];

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
  const [showSplash,setShowSplash] = useState(true);
  const [showSharePopup,setShowSharePopup] = useState(false);
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

  const params =
    new URLSearchParams(
      window.location.search
    );

  const category =
    params.get("category");

  if(
    category &&
    defaultGroups.includes(category)
  ){

    start(category);

  }

},[]);

  useEffect(()=>{

setupPlayer();

},[]);
useEffect(()=>{

  async function loadUpdate(){

    try {

      const snap = await getDoc(
        doc(db, "quiz", "Today")
      );

      if(
        snap.exists() &&
        snap.data().updatedAt
      ){

        setLastUpdate(
          snap.data().updatedAt
        );

      }

    } catch(e){

      console.log(
        "update load error",
        e
      );

    }

  }

  loadUpdate();

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
async function shareCategoryResult(){

  const shareUrl =
`${window.location.origin}?category=${encodeURIComponent(week)}`;

  try{

    await navigator.share({

      title:
        `${week} Quiz Challenge`,

      text:
`🔥 I scored ${score}/${questions.length}
in ${week} Quiz!

🏆 Rank #${finalRank}
⏱ ${totalTimeUsed}s

Can you beat me? 😎`,

      url: shareUrl

    });

  } catch(e){

    navigator.clipboard.writeText(
      shareUrl
    );

    alert("Link copied!");

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

 const [data, setData] = useState({});

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
    
  async function start(w){
    const loadedQuestions =
    await loadSingleCategory(w);

  setData(prev => ({
    ...prev,
    [w]: loadedQuestions
  }));
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
  warningSound.pause();
  warningSound.currentTime = 0;

  if(index + 1 < questions.length){

    setIndex(i => i + 1);

    setTime(20);

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
useEffect(()=>{

  if(Number(time) === 5){

    warningSound.pause();

    warningSound.currentTime = 0;

    setTimeout(()=>{

      warningSound.muted = false;

      warningSound.volume = 0.5;

      warningSound.play()
      .catch(()=>{});

    },100);

  }

},[time]);

useEffect(() => {

  if(screen === "result"){
    setShowSharePopup(true);

setTimeout(()=>{

  setShowSharePopup(false);

},12000);

    if(score >= questions.length * 0.7){

      winSound.currentTime = 0;
      winSound.play();

    } else {

      loseSound.currentTime = 0;
      loseSound.play();

    }

  }

}, [screen]);


function answer(opt){

  if(selected!==null)
    return;
  setSelected(opt);

  setAttempted(a=>a+1);

  if(opt===questions[index].a){

    correctSound.currentTime = 0;

    correctSound.play();

    setScore(s=>s+1);

  } else {

    wrongSound.currentTime = 0;

    wrongSound.play();

  }

  setTotalTimeUsed(
    t => t + (20 - time)
  );

  setTimeout(()=>{

    setSelected(null);

    next();

  },700);

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
if(showSplash){

  return(

    <SplashScreen

      onStart={()=>{

        introSound.currentTime = 0;

        introSound.play();

        setTimeout(()=>{

          setShowSplash(false);

        },1200);

      }}

    />

  );

}

  return (
   <div
  style={{
    minHeight: "100dvh",
    width:"100%",
    maxWidth:"100vw",
    overflowX:"hidden",
    display: "flex",
    flexDirection: "column",
    background: "#1e3a8a",
    color: "white",
    paddingBottom: "0px"
  }}
>
<Header
  playerAvatar={playerAvatar}
  playerName={playerName}
  setIsRenameMode={setIsRenameMode}
  setNameInput={setNameInput}
  setShowNameModal={setShowNameModal}
  users={users}
  loadOverallLeaderboard={loadOverallLeaderboard}
  setShowOverall={setShowOverall}
  showMenu={showMenu}
  setShowMenu={setShowMenu}
  menuRef={menuRef}
  setModal={setModal}
  setScreen={setScreen}
/>     

 <HomeScreen
  screen={screen}
  openCategory={openCategory}
  setOpenCategory={setOpenCategory}
  monthGroups={monthGroups}
  eventGroups={eventGroups}
  otherGroups={otherGroups}
  mainGroups={mainGroups}
  handleSelect={handleSelect}
  start={start}
/>

<PlayingScreen
  screen={screen}
  week={week}
  index={index}
  questions={questions}
  time={time}
  selected={selected}
  answer={answer}
  setScreen={setScreen}
  next={next}
/>

  <ResultScreen
  screen={screen}
  week={week}
  finalRank={finalRank}
  score={score}
  questions={questions}
  totalTimeUsed={totalTimeUsed}
  attempted={attempted}
  topScores={topScores}
  playerName={playerName}
  start={start}
  setScreen={setScreen}
  defaultGroups={defaultGroups}
  showSharePopup={showSharePopup}
  shareCategoryResult={shareCategoryResult}
/>

<Suspense fallback={null}>

  <OverallLeaderboard
    showOverall={showOverall}
    setShowOverall={setShowOverall}
    searchPlayer={searchPlayer}
    setSearchPlayer={setSearchPlayer}
    showSearch={showSearch}
    setShowSearch={setShowSearch}
    selectedPlayer={selectedPlayer}
    setSelectedPlayer={setSelectedPlayer}
    overallLeaders={overallLeaders}
  />

</Suspense>

  <Suspense fallback={null}>

  <EditorModal
    editorOpen={editorOpen}
    setEditorOpen={setEditorOpen}
    week={week}
    setWeek={setWeek}
    defaultGroups={defaultGroups}
    questions={questions}
    updateQ={updateQ}
    deleteQuestion={deleteQuestion}
    addQuestion={addQuestion}
    saveSingleCategory={saveSingleCategory}
    data={data}
    setData={setData}
    moveQuestions={moveQuestions}
    savedMsg={savedMsg}
    setSavedMsg={setSavedMsg}
    setScreen={setScreen}
  />

</Suspense>

 <AppModal
  modal={modal}
  setModal={setModal}
  enteredPassword={enteredPassword}
  setEnteredPassword={setEnteredPassword}
  setEditorOpen={setEditorOpen}
/>

<NameModal
  showNameModal={showNameModal}
  isRenameMode={isRenameMode}
  nameTimer={nameTimer}
  nameInput={nameInput}
  setNameInput={setNameInput}
  renamePlayer={renamePlayer}
  updatePlayerScores={updatePlayerScores}
  createPlayer={createPlayer}
  setPlayerName={setPlayerName}
  setIsRenameMode={setIsRenameMode}
  setShowNameModal={setShowNameModal}
/>

<Footer
  lastUpdate={lastUpdate}
  handleInvite={handleInvite}
  handleShare={handleShare}
/>
<Analytics />
<SpeedInsights />
</div>
  );
}
