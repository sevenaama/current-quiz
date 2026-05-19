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
  next
}) {

  if(screen !== "playing")
    return null;

  return (
  <div style={{
    flex: 1,
    padding: "15px",
    paddingBottom: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    animation:"resultFade 0.35s ease",
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
    margin: "0 auto",
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
            width: "90%",
            maxWidth: "400px",
            margin: "5px auto",
            padding: "clamp(12px, 4vw, 18px)",
            fontSize: "clamp(14px, 4vw, 18px)",
            borderRadius: "8px",
            textAlign: "center",
            background: bg,
            color: color,
            border: "none",
            transition:"all 0.15s ease",
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
  marginTop: "10px",
   cursor:"pointer"
}}>
  <div style={{
    display: "flex",
    gap: "20px",
    background: "rgba(0,0,0,0.3)",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor:"pointer"
  }}>
    <button onClick={()=>setScreen("home")}>Back</button>
    <button onClick={next}>Skip</button>
  </div>
</div>

</div>
 );
}