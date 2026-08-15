import React from "react";

export default function PlayingScreen({
  screen,
  week,
  index,
  questions,
  time,
  selected,
  answer,
  setScreen,
  next,
  levels = [],
  selectedLevel,
  startLevel
}) {

  if(screen !== "playing")
    return null;

  return (
  <div style={{
    flex: 1,
    padding:"15px",
    paddingBottom:"80px",
    display:"flex",
    flexDirection:"column",
    alignItems:"stretch",
    justifyContent:"flex-start",
    animation:"resultFade 0.35s ease",
  }}>

{/* 🔝 Top bar */}
<div style={{
  display:"flex",
  alignItems:"center",
  justifyContent:"space-between",
  width:"100%",
  maxWidth:"400px",
  margin:"0 auto 10px auto",
  position:"relative"
}}>

  {/* 📂 Category */}
  <div style={{
    fontSize:"14px",
    fontWeight:"bold",
    opacity:0.9
  }}>
    📂 {week}
  </div>

  {/* 🔢 Center: Question count */}
  <div style={{
    position:"absolute",
    left:"50%",
    transform:"translateX(-50%)",
    fontSize:"13px"
  }}>
    Q {index+1} / {questions.length}
  </div>

  {/* ⏱ Right: Timer */}
  <div style={{
    fontWeight:"bold",
    fontSize:"18px"
  }}>
    {time}s
  </div>

</div>


    {/* ❓ Question */}
   <div style={{
  width:"92%",
  maxWidth:"600px",
  margin:"0 auto 18px auto",
  padding:"16px 18px",
  boxSizing:"border-box",
  textAlign:"center",
  fontSize:"clamp(19px, 5vw, 24px)",
  lineHeight:"1.5",
  fontWeight:"600",
  letterSpacing:"0.1px",
  borderRadius:"12px",
  background:"rgba(255,255,255,0.08)",
  color:"inherit",
  animation:"popCard 0.35s ease",
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
  width:"92%",
  maxWidth:"600px",
  minHeight:"52px",
  margin:"6px auto",
  padding:"13px 16px",
  boxSizing:"border-box",
  fontSize:"clamp(15px, 4vw, 18px)",
  lineHeight:"1.45",
  fontWeight:"500",
  borderRadius:"11px",
  textAlign:"center",
  background:bg,
  color:color,
  border:"none",
  transition:"all 0.15s ease",
}}
        >
          {o}
        </button>
      );
    })}


{/* Bottom Controls */}
<div style={{
  width:"100%",
  display:"flex",
  justifyContent:"center",
  marginTop:"10px",
  cursor:"pointer"
}}>
  <div style={{
    display:"flex",
    gap:"20px",
    background:"rgba(0,0,0,0.3)",
    padding:"10px 18px",
    borderRadius:"8px",
    cursor:"pointer"
  }}>
    <button onClick={()=>setScreen("home")}>Back</button>
    <button onClick={next}>Skip</button>
  </div>
</div>


{/* 🎯 LEVEL SELECTOR */}
<div style={{
  width:"100%",
  display:"flex",
  flexDirection:"column",
  alignItems:"center",
  marginTop:"8px"
}}>

  {/* LEVEL TITLE */}
  <div style={{
    fontSize:"11px",
    fontWeight:"bold",
    opacity:0.75,
    marginBottom:"5px"
  }}>
    LEVEL
  </div>


  {/* 🔵 LEVEL ROUND CELLS */}
  <div style={{
    display:"flex",
    flexWrap:"wrap",
    justifyContent:"center",
    gap:"6px",
    width:"100%",
    maxWidth:"300px"
  }}>

    {levels.map(level => (
      <button
        key={level.level}
        onClick={() => startLevel(level)}
        style={{
          width:"30px",
          height:"30px",
          padding:0,
          borderRadius:"50%",
          border:"none",

          background:
            selectedLevel === level.level
              ? "#0ef754"
              : "rgba(0,0,0,0.35)",

          color:"#fff",
          fontSize:"11px",
          fontWeight:"bold",
          cursor:"pointer",

          display:"flex",
          alignItems:"center",
          justifyContent:"center",

          boxShadow:
            selectedLevel === level.level
              ? "0 0 0 2px rgba(37,99,235,0.35)"
              : "none"
        }}
      >
        {level.level}
      </button>
    ))}

  </div>

</div>


</div>
 );
}