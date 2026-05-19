import React from "react";

export default function Header({
  playerAvatar,
  playerName,
  setIsRenameMode,
  setNameInput,
  setShowNameModal,
  users,
  loadOverallLeaderboard,
  setShowOverall,
  showMenu,
  setShowMenu,
  menuRef,
  setModal,
  handleInvite,
  setScreen
}) {

  return (<div style={{
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
  );
}