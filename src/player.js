import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export function generateAutoName(){

  const names = [
    "QuizKing",
    "BrainMaster",
    "Player",
    "QuizHero",
    "SmartGamer",
    "FastPlayer"
  ];

  const randomName =
    names[Math.floor(Math.random() * names.length)] +
    Math.floor(1000 + Math.random() * 9000);

  return randomName;
}

export async function createPlayer(name){

  const playerId =
    crypto.randomUUID();

  await setDoc(
    doc(db, "players", playerId),
    {
      name,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  );

  localStorage.setItem(
    "playerId",
    playerId
  );

  return {
    playerId,
    name
  };
}

export async function loadPlayer(){

  const playerId =
    localStorage.getItem("playerId");

  if(!playerId) return null;

  const snap = await getDoc(
    doc(db, "players", playerId)
  );

  if(!snap.exists()) return null;

  return {
    playerId,
    ...snap.data()
  };
}

export async function renamePlayer(newName){

  const playerId =
    localStorage.getItem("playerId");

  if(!playerId) return;

  await setDoc(
    doc(db, "players", playerId),
    {
      name: newName,
      updatedAt: Date.now()
    },
    { merge:true }
  );

  return newName;
}