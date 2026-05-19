import React from "react";

export default function NameModal({
  showNameModal,
  isRenameMode,
  nameTimer,
  nameInput,
  setNameInput,
  renamePlayer,
  updatePlayerScores,
  createPlayer,
  setPlayerName,
  setIsRenameMode,
  setShowNameModal
}) {

  if(!showNameModal)
    return null;

  return (

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
    maxLength={12}
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
  nameInput.trim().slice(0,12)
);
        updatePlayerScores(
  nameInput.trim().slice(0,12)
);
        setPlayerName(
  nameInput.trim().slice(0,12)
);

        setIsRenameMode(false);

        setShowNameModal(false);

        return;
      }

      // create new player
      await createPlayer(
  nameInput.trim().slice(0,12)
);

      setPlayerName(
        nameInput.trim().slice(0,12)
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

 );
}