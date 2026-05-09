import { addDoc, collection, query, orderBy, limit, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function saveScore({

  playerName,
  score,
  total,
  category

}){

  const playerId =
    localStorage.getItem("playerId");

  if(!playerId) return;

  const scoreRef = doc(

    db,

    "leaderboards",

    category,

    "scores",

    playerId
  );

  const oldSnap =
    await getDoc(scoreRef);

  // already exists
  if(oldSnap.exists()){

    const oldData =
      oldSnap.data();

    // lower score ignore
    if(oldData.score >= score)
      return;
  }

  // save/update best score
  await setDoc(

    scoreRef,

    {
      playerId,
      playerName,
      score,
      total,
      category,

      updatedAt: Date.now()
    }
  );
}
export async function loadTopScores(category){

  const q = query(

    collection(
      db,
      "leaderboards",
      category,
      "scores"
    ),

    orderBy("score","desc"),

    limit(10)
  );

  const snap =
    await getDocs(q);

  return snap.docs.map(doc=>({
    id: doc.id,
    ...doc.data()
  }));
}