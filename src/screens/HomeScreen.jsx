import React from "react";

export default function HomeScreen({
  screen,
  openCategory,
  setOpenCategory,
  monthGroups,
  eventGroups,
  otherGroups,
  mainGroups,
  handleSelect,
  start
}) {

  if(screen !== "home")
    return null;

  return (
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
          background:"#4338ca",
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
          background:"#9f1239",
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
          background:"#047857",
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
    background:"#4338ca",
    borderRadius:"8px",
     cursor:"pointer",
    zIndex:999
      }}>
        {monthGroups.map(m=>(
          <div key={m} onClick={()=>handleSelect(m)}
            style={{background:"#4f46e5",padding:"10px",borderRadius:"6px"}}>
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
            style={{background:"#be123c",padding:"10px",borderRadius:"6px"}}>
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
            style={{background:"#059669",padding:"10px",borderRadius:"6px"}}>
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
            background:"linear-gradient(135deg, #7c3aed, #2563eb)",
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
         {m === "Today" ? (
  <>
    Today{" "}
    <span className="today-star">⭐</span>
  </>
) : (
  m
)}
        </div>
      ))}
    </div>
  </div>
  );
}