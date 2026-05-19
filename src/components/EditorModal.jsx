export default function EditorModal({
  editorOpen,
  setEditorOpen,
  week,
  setWeek,
  defaultGroups,
  questions,
  updateQ,
  deleteQuestion,
  addQuestion,
  saveSingleCategory,
  data,
  setData,
  moveQuestions,
  savedMsg,
  setSavedMsg,
  setScreen
}) {

  if(!editorOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.7)",
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
  
      <div
        style={{
          background: "white",
          color: "black",
          width: "95%",
          maxWidth: "500px",
          maxHeight: "90vh",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column"
        }}
      >
  
        {/* HEADER */}
        <div style={{padding:"10px", borderBottom:"1px solid #ddd", display:"flex", justifyContent:"space-between"}}>
          <div>
            <b>Edit:</b>
            <select value={week} onChange={(e)=>setWeek(e.target.value)}>
              {defaultGroups.map(g=> (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <button onClick={()=>setEditorOpen(false)}>Close</button>
        </div>
  
        {/* BODY */}
        <div style={{padding:"10px", overflowY:"auto"}}>
          {questions.map((q,i)=>(
            <div key={i} style={{border:"1px solid #ddd", padding:"10px", margin:"8px 0"}}>
              <input
    placeholder="Question"
    value={q.q?.en || ""}
  
    onChange={e=>
      updateQ(
        i,
        "q",
        e.target.value
      )
    }
  
    onKeyDown={(e)=>{
  
      const inputs =
        Array.from(
          document.querySelectorAll(
            "input"
          )
        );
  
      const index =
        inputs.indexOf(e.target);
  
      if(e.key === "ArrowDown"){
  
        e.preventDefault();
  
        inputs[index + 1]?.focus();
      }
  
      if(e.key === "ArrowUp"){
  
        e.preventDefault();
  
        inputs[index - 1]?.focus();
      }
  
    }}
  
    style={{
      width:"100%",
      marginBottom:"5px"
    }}
  />
  
              {q.options.map((o,oi)=>(
               <input
    key={oi}
    placeholder={`Option ${oi+1}`}
    value={o || ""}
  
    onChange={e=>
      updateQ(
        i,
        "opt",
        e.target.value,
        oi
      )
    }
  
    onKeyDown={(e)=>{
  
      const inputs =
        Array.from(
          document.querySelectorAll(
            "input"
          )
        );
  
      const index =
        inputs.indexOf(e.target);
  
      if(e.key === "ArrowDown"){
  
        e.preventDefault();
  
        inputs[index + 1]?.focus();
      }
  
      if(e.key === "ArrowUp"){
  
        e.preventDefault();
  
        inputs[index - 1]?.focus();
      }
  
    }}
  
    style={{
      width:"100%",
      marginBottom:"5px"
    }}
  />
              ))}
  
              <input
    placeholder="Correct answer"
    value={q.a || ""}
  
    onChange={e=>
      updateQ(
        i,
        "a",
        e.target.value
      )
    }
  
    onKeyDown={(e)=>{
  
      const inputs =
        Array.from(
          document.querySelectorAll(
            "input"
          )
        );
  
      const index =
        inputs.indexOf(e.target);
  
      if(e.key === "ArrowDown"){
  
        e.preventDefault();
  
        inputs[index + 1]?.focus();
      }
  
      if(e.key === "ArrowUp"){
  
        e.preventDefault();
  
        inputs[index - 1]?.focus();
      }
       if(e.key === "Enter"){
  
      e.preventDefault();
  
      document
        .getElementById(
          "submitBtn"
        )
        ?.click();
  
    }
  
    }}
  
    style={{
      width:"100%",
      marginBottom:"5px"
    }}
  />
  <select
    id={`copy-${i}`}
    style={{
      marginRight:"6px"
    }}
  >
  
    {defaultGroups.map(g=>(
  
      <option
        key={g}
        value={g}
      >
        {g}
      </option>
  
    ))}
  
  </select>
  
  <button
    onClick={()=>{
  
      const targetGroup =
        document.getElementById(
          `copy-${i}`
        ).value;
  
      // same group avoid
      if(targetGroup === week){
  
        alert(
          "Same group selected"
        );
  
        return;
      }
  
      // duplicate avoid
      const alreadyExists =
  
        (data[targetGroup] || [])
        .some(
  
          item =>
  
            item.q.en ===
            q.q.en
  
        );
  
      if(alreadyExists){
  
        alert(
          "Question already exists"
        );
  
        return;
      }
  
      const copiedQuestion =
  
        JSON.parse(
          JSON.stringify(q)
        );
  
      setData(prev=>({
  
        ...prev,
  
        [targetGroup]: [
  
          ...(prev[targetGroup] || []),
  
          copiedQuestion
  
        ]
  
      }));
      saveSingleCategory(
    targetGroup,
    [
      ...(data[targetGroup] || []),
      copiedQuestion
    ]
  );
  
      alert(
        `Copied to ${targetGroup}`
      );
  
    }}
  >
    Copy
  </button>
  
              <button onClick={()=>deleteQuestion(i)}>Delete</button>
            </div>
          ))}
        </div>
  
        {/* FOOTER */}
  <div style={{padding:"10px", borderTop:"1px solid #ddd"}}>
  
    <button onClick={addQuestion}>+ Add</button>
  <button
    id="submitBtn"
    onKeyDown={(e)=>{
  
      if(e.key === "Enter"){
  
        e.preventDefault();
  
        e.target.click();
  
      }
  
    }}
     onClick={async ()=>{
  
    const list = data[week];
  
    for(const q of list){
  
      // question empty
      if(!q.q?.en?.trim()){
  
        alert("Question empty");
        return;
      }
  
      // option empty
      if(
        q.options.some(
          op => !op.trim()
        )
      ){
  
        alert(
          "All 4 options required"
        );
  
        return;
      }
  
      // answer empty
      if(!q.a?.trim()){
  
        alert(
          "Correct answer required"
        );
  
        return;
      }
  
      // answer must match option
      if(
        !q.options.some(
    op =>
      op.trim() === q.a.trim()
  )
      ){
  
        alert(
          "Correct answer must match one option"
        );
  
        return;
      }
  
    }
  
    await saveSingleCategory(
      week,
      data[week]
    );
  
    setSavedMsg(true);
  
    setTimeout(
      ()=>setSavedMsg(false),
      2000
    );
  
  }}>
    Submit
  </button>
  
    <button onClick={()=>{
      setEditorOpen(false);
      setScreen("home");
    }}>
      Back
    </button>
  
    {savedMsg && <div>✔ Saved</div>}
  
    <div style={{marginTop:"15px"}}>
  
      <button
        onClick={()=>
          moveQuestions(
            "Today",
            "This Week"
          )
        }
      >
        Today → This Week
      </button>
  
      <button
        onClick={()=>
          moveQuestions(
            "This Week",
            "Previous Week"
          )
        }
      >
        This Week → Previous Week
      </button>
  
      <button
        onClick={()=>
          moveQuestions(
            "Previous Week",
            "This Month"
          )
        }
      >
        Previous Week → This Month
      </button>
  
    </div>
  
  </div>
  
  </div>
  </div>
    );
}
  