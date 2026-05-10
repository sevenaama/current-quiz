import {
  collection,
  addDoc,
  query,
  getDocs,
  doc,
  setDoc,
  where
} from "firebase/firestore";

import { db } from "./firebase";

export async function saveScore({

  playerName,
  correctAnswers,
  timeUsed,
  total,
  category

}){

  const playerId =
    localStorage.getItem("playerId");

  if(!playerId) return;
  const scoreRef = doc(

  db,

  "scores",

  `${category}_${playerId}`

);

  await setDoc(

  scoreRef,

  {

    playerId,

    playerName,

    correctAnswers,

    timeUsed,

    total,

    category,

    createdAt: Date.now()

  }

);
}

export async function loadTopScores(category){

  const q = query(

    collection(db,"scores"),

    where("category","==",category)

  );

  const snap = await getDocs(q);

  const data = snap.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));

  data.sort((a,b)=>{

    if(

      b.correctAnswers !==
      a.correctAnswers

    ){

      return (

        b.correctAnswers -
        a.correctAnswers

      );
    }

    return (

      a.timeUsed -
      b.timeUsed

    );

  });

  return data;

}
export async function updatePlayerScores(newName){

  const playerId =
    localStorage.getItem("playerId");

  const q = query(

    collection(db,"scores"),

    where("playerId","==",playerId)

  );

  const snap = await getDocs(q);

  snap.forEach(async d => {

    await setDoc(

      doc(db,"scores",d.id),

      {

        ...d.data(),

        playerName: newName

      }

    );

  });

}