export default function SharePopup({

  show,
  onShare

}){

  if(!show) return null;

  return(

    <div
      onClick={onShare}

      style={{

        position:"fixed",

        bottom:"110px",

        left:"50%",

        transform:"translateX(-50%)",

        background:
          "linear-gradient(90deg,#7c3aed,#2563eb)",

        color:"white",

        padding:"14px 22px",

        borderRadius:"999px",

        fontWeight:"bold",

        fontSize:"15px",

        zIndex:999999,

        boxShadow:
          "0 8px 25px rgba(0,0,0,0.35)",

        cursor:"pointer",

        animation: "sharePopup 0.45s ease, shareBlink 1s infinite",
        display:"flex",

        alignItems:"center",

        gap:"8px",

        backdropFilter:"blur(10px)"
      }}
    >

      🔥 Share Your Score

    </div>

  );

}