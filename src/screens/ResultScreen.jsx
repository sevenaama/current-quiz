import React from "react";
import SharePopup from "../components/SharePopup";

export default function ResultScreen({
  screen,
  week,
  finalRank,
  score,
  questions,
  totalTimeUsed,
  attempted,
  topScores,
  playerName,
  start,
  setScreen,
  defaultGroups,
  showSharePopup,
  shareCategoryResult
}) {

  if(screen !== "result")
    return null;

  return (
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
    animation:"resultFade 0.5s ease"
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

  display:"inline-block",
  animation:"popCard 1.2s ease-in-out infinite",
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
    marginTop:"2px",
    color:"#facc15",
    fontWeight:"bold",
    fontSize:"10px",
    whiteSpace:"nowrap"
  }}>
    🏆 #{finalRank}
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
  fontSize:"10px",
  opacity:0.85,
  whiteSpace:"nowrap"
}}>
  ⏱ {totalTimeUsed}s
</div>

</div>

    {/* 🧠 Performance Message */}
    <div style={{
      fontSize: "clamp(15px, 4vw, 18px)",
      marginBottom: "12px"
    }}>
      {score === questions.length
        ? "Perfect 🎯"
        : score > questions.length * 0.7
        ? "Average 🔥"
        : score > questions.length * 0.4
        ? "Under average 👍"
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

  width:"75%",
  maxWidth:"330px",

  overflow:"hidden",

  boxSizing:"border-box",

  marginTop:"10px",

  background:"rgba(255,255,255,0.08)",

  borderRadius:"14px",

  padding:"6px",

  backdropFilter:"blur(10px)",
  animation:"popCard 0.45s ease"
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
    width:"100%",
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
          fontSize:"10px",
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
        fontSize:"10px",
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
  margin: "28px auto 0 auto", // 👈 तल सारियो
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "14px",
  flexWrap:"wrap"
}}>

  {/* 🔙 Back */}
  <button
    onClick={()=>setScreen("home")}
    style={{
      width: "58px",
      height: "58px",
      borderRadius: "50%",
      border: "none",
      background: "#facc15",
      color: "black",
      fontSize: "12px",
      fontWeight:"bold",
      boxShadow: "0 3px 10px rgba(0,0,0,0.28)",
      transition: "all 0.15s ease"
    }}
  >
    Back
  </button>

  {/* 🔁 Play */}
  <button
    onClick={()=>start(week)}
    style={{
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      border: "none",
      background: "white",
      color: "black",
      fontSize: "13px",
      fontWeight: "700",
      boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
      transition: "all 0.15s ease",
      animation: "startPulse 1.8s infinite",
    }}
  >
    Play Again
  </button>

  {/* ⏭ Next */}
  <button
    onClick={()=>{
      const idx = defaultGroups.indexOf(week);
      const nextGroup = defaultGroups[(idx+1) % defaultGroups.length];
      start(nextGroup);
    }}
    style={{
      width: "58px",
      height: "58px",
      borderRadius: "50%",
      border: "none",
      background: "#22c55e",
      color: "white",
      fontSize: "12px",
      fontWeight:"bold",
      boxShadow: "0 3px 10px rgba(0,0,0,0.28)",
      transition: "all 0.15s ease"
    }}
  >
    NEXT
  </button>
<SharePopup

  show={showSharePopup}

  onShare={shareCategoryResult}

/>
</div>
        </div>
       );
}