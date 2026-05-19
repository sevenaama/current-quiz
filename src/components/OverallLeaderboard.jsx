import React from "react";

export default function OverallLeaderboard({
  showOverall,
  setShowOverall,
  searchPlayer,
  setSearchPlayer,
  showSearch,
  setShowSearch,
  selectedPlayer,
  setSelectedPlayer,
  overallLeaders
}) {

  if(!showOverall) return null;

  return (
  <div
onClick={()=>{
setShowOverall(false);
setSearchPlayer("");
setShowSearch(false);
setSelectedPlayer(null);
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
        background:"#0f172a",
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
          background:"#0f172a",
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
         setSelectedPlayer(null);
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
    <React.Fragment key={p.playerId}>
    
    <div

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

 background:"rgba(255,255,255,0.06)",
color:"white",
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
             left:"50%",
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
      </React.Fragment>
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

  );
}