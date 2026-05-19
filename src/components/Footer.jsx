import React from "react";

export default function Footer({
  lastUpdate,
  handleInvite,
  handleShare
}) {

  return (
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
    transform: "translateX(-50%)",
     bottom: "10px"
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
  <div
  style={{
    fontSize:"12px",
    opacity:0.8
  }}
>
  Update: {lastUpdate}
</div>

  {/* INVITE */}
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
   right: "10%",
   bottom: "10px",
  display: "flex",
  gap: "12px"
}}>
  <span onClick={handleShare} style={{cursor:"pointer"}}>
    Share
  </span>
</div>

</div>
 );
}