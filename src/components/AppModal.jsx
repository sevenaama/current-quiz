export default function AppModal({
  modal,
  setModal,
  enteredPassword,
  setEnteredPassword,
  setEditorOpen
}) {

  if (!modal) return null;

  return (
 <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      zIndex: 2147483648,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <div style={{
      background: "white",
      color: "black",
      padding: "20px",
      borderRadius: "10px",
      width: "90%",
      maxWidth: "400px"
    }}>
      
      <div style={{display:"flex", justifyContent:"space-between"}}>
        <b>{modal}</b>
        <button onClick={()=>setModal(null)}>Close</button>
      </div>

      {modal==="contact" && (
  <div style={{
    marginTop:"12px",
    lineHeight:"1.8",
    fontSize:"15px",

    maxHeight:"60vh",
  overflowY:"auto",
  paddingRight:"6px"
  }}>

    <div>
      📧 <b>Email:</b><br/>

      <a
        href="mailto:currentquiz@gmail.com"
        style={{
          color:"#2563eb"
        }}
      >
        currentquiz@gmail.com
      </a>

    </div>

    <br/>

    <div>
      💬 <b>Facebook:</b><br/>

      <a
        href="https://www.facebook.com/noticesbank"
        target="_blank"
        rel="noreferrer"
        style={{
          color:"#2563eb"
        }}
      >
        Current Quiz Nepal
      </a>

    </div>

    <br/>

    <div>
      📞 <b>Phone:</b><br/>

      <a
        href="tel:+9779768997522"
        style={{
          color:"#2563eb"
        }}
      >
        +977 9768997522
      </a>

    </div>

    <br/>

   <div>
  📱 <b>Support:</b><br/>

  <a
    href="https://wa.me/9779768997522"
    target="_blank"
    rel="noreferrer"
    style={{
      color:"#2563eb"
    }}
  >
    Chat on WhatsApp
  </a>

</div>
</div>
)}
      {modal==="rules" && (
  <div
    style={{
      marginTop:"14px",
  lineHeight:"1.9",
  fontSize:"15px",
  color:"#111827",

  maxHeight:"60vh",
  overflowY:"auto",
  paddingRight:"6px"
    }}
  >

    📖 Current Quiz contains important
    current questions for all public
    service groups and levels.

    <br/><br/>

    📚 <b>Today:</b><br/>
    New questions are added daily after 8 PM
    and stay for 24 hours.

    <br/><br/>

    📅 <b>This Week:</b><br/>
    Weekly questions remain until
    Saturday 7 PM.

    <br/><br/>

    🗓 <b>This Month:</b><br/>
    Weekly questions move here every
    Saturday after 6 PM.

    <br/><br/>

    🏆 <b>Weekly Challenge:</b><br/>
    Winners may receive prizes.
    Available only in the This Week group.

    <br/><br/>

    📢 More updates and rules will be
shared on

<a
  href="https://www.facebook.com/noticesbank"
  target="_blank"
  rel="noreferrer"
  style={{
    color:"#2563eb",
    fontWeight:"bold",
    textDecoration:"none"
  }}
>
  Facebook
</a>

every Saturday.

    <br/><br/>

    🎯 Play fairly and enjoy learning!

  </div>
)}
      {modal==="feedback" && (
  <div
    style={{
      marginTop:"14px",
      lineHeight:"2",
      fontSize:"15px",

      maxHeight:"60vh",
      overflowY:"auto",
      paddingRight:"6px"
    }}
  >

    💬 Send your feedback, suggestions,
    or report problems using the options below.

    <br/><br/>

    📱 <b>WhatsApp:</b><br/>

    <a
      href="https://wa.me/9779768997522"
      target="_blank"
      rel="noreferrer"
      style={{
        color:"#2563eb",
        fontWeight:"bold",
        textDecoration:"none"
      }}
    >
      Send on WhatsApp
    </a>

    <br/><br/>

    💬 <b>Messenger:</b><br/>

    <a
      href="https://m.me/noticesbank"
      target="_blank"
      rel="noreferrer"
      style={{
        color:"#2563eb",
        fontWeight:"bold",
        textDecoration:"none"
      }}
    >
      Send on Messenger
    </a>

    <br/><br/>

    📧 <b>Email:</b><br/>

    <a
      href="mailto:currentquiz@gmail.com"
      style={{
        color:"#2563eb",
        fontWeight:"bold",
        textDecoration:"none"
      }}
    >
      currentquiz@gmail.com
    </a>

    <br/><br/>

    ❤️ Thank you for supporting
    Current Quiz!

  </div>
)}
      {modal==="password" && (
  <div>
    <input
      type="password"
      placeholder="Enter password"
      value={enteredPassword}
      onChange={(e)=>setEnteredPassword(e.target.value)}
      style={{
  width:"100%",
  maxWidth:"300px",
  padding:"10px",
  marginTop:"10px",
  marginLeft:"auto",
  marginRight:"auto",
  display:"block"
}}
    />

    <button
      onClick={()=>{
        if(enteredPassword==="6420"){
          setModal(null);
          setEditorOpen(true);
          setEnteredPassword("");
        } else {
          alert("Wrong password");
        }
      }}
      style={{marginTop:"10px"}}
    >
      Unlock
    </button>
  </div>
)}

    </div>
  </div>
    );
}
