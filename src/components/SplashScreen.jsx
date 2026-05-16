import React from "react";

export default function SplashScreen({

  onStart

}){

  return(

    <div

      onClick={onStart}

      style={{

        width:"100%",

        height:"100vh",

        background:
        "linear-gradient(135deg,#1e3a8a,#7c3aed)",

        display:"flex",

        flexDirection:"column",

        alignItems:"center",

        justifyContent:"center",

        color:"white",

        cursor:"pointer",

        userSelect:"none"
      }}
    >

      {/* LOGO */}
      <div
        style={{

          fontSize:"82px",

          animation:
          "logoPop 0.8s ease"
        }}
      >
        📚
      </div>

      {/* TITLE */}
      <div
        style={{

          fontSize:"34px",

          fontWeight:"900",

          marginTop:"10px",

          animation:
          "titleFade 1.2s ease"
        }}
      >
        Current Quiz
      </div>

      {/* BUTTON */}
      <div
        style={{

          marginTop:"32px",

          padding:"14px 34px",

          borderRadius:"999px",

          background:
          "linear-gradient(90deg,#2563eb,#06b6d4)",

          fontSize:"18px",

          fontWeight:"800",

          letterSpacing:"1px",

          boxShadow:
          "0 0 22px rgba(37,99,235,0.7)",

          animation:
          "startPulse 1.4s infinite",

          border:
          "2px solid rgba(255,255,255,0.25)"
        }}
      >
        ▶ TAP TO START
      </div>

    </div>

  );

}