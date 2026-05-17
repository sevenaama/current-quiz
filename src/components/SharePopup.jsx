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

        bottom:"95px",

        left:"50%",

        transform:"translateX(-50%)",

        background:"#7c3aed",

        color:"white",

        padding:"14px 20px",

        borderRadius:"16px",

        fontWeight:"bold",

        fontSize:"15px",

        zIndex:999999,

        boxShadow:
          "0 6px 20px rgba(0,0,0,0.35)",

        cursor:"pointer"

      }}
    >

      📸 Share Your Score

    </div>

  );

}