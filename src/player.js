import {
  doc,
  setDoc,
  getDoc,
  runTransaction
} from "firebase/firestore";

import { db } from "./firebase";


/* =========================
   GENERATE AUTO NAME
========================= */

export function generateAutoName() {

  const avatars = [
    "🙋‍♂️","🙋‍♀️","💁‍♂️","💁‍♀️","🙆‍♂️","🙆‍♀️",
    "🙎‍♂️","🙎‍♀️","👨‍💻","👩‍💻","👨‍🎓","👩‍🎓",
    "💃","🤵","👰","🦸‍♂️","🦸‍♀️","🧑‍🚀","👩‍🚀",
    "👨‍🍳","👩‍🍳","👨‍🎤","👩‍🎤","👨‍🎨","👩‍🎨",
    "🏃‍♂️","🏃‍♀️","🚴‍♂️","🚴‍♀️","🏄‍♂️","🏄‍♀️"
  ];

  const names = [
    "Sujan","Aayush","Pratik","Nabin","Suman","Roshan",
    "Bikash","Aarav","Kabir","Sagar","Kiran","Dipesh",
    "Anish","Rohit","Aman","Santosh","Ramesh","Bibek",
    "Sisir","Sudip","Asmita","Riya","Sabina","Anisha",
    "Sita","Puja","Sneha","Nisha","Samiksha","Alisha",
    "Shristi","Karuna","Mina","Aakriti","Barsha","Nirmala",
    "Jenisha","Prerana","Sujata","Roshani","Aarohi","Ishan",
    "Niraj","Utsav","Yubraj","Saroj","Bipin","Rabin",
    "Tek","Gokul"
  ];

  const name =
    names[
      Math.floor(
        Math.random() * names.length
      )
    ] +
    Math.floor(
      1000 + Math.random() * 9000
    );

  const avatar =
    avatars[
      Math.floor(
        Math.random() * avatars.length
      )
    ];

  return {
    name,
    avatar
  };
}


/* =========================
   CREATE PLAYER
========================= */

export function createPlayer(
  name,
  avatar = "👨‍💻"
) {

  const playerId =
    crypto.randomUUID();

  const now = Date.now();

  const player = {
    playerId,
    name,
    avatar
  };


  /*
    1. LOCAL STORAGE
    ----------------
    Firebase भन्दा पहिले
    तुरुन्त save
  */

  localStorage.setItem(
    "playerId",
    playerId
  );

  localStorage.setItem(
    "playerName",
    name
  );

  localStorage.setItem(
    "playerAvatar",
    avatar
  );


  /*
    2. PLAYER FIREBASE SAVE
    -----------------------
    await छैन।

    त्यसैले Firebase slow भए पनि
    UI रोकिँदैन।
  */

  setDoc(
    doc(
      db,
      "players",
      playerId
    ),
    {
      name,
      avatar,
      createdAt: now,
      updatedAt: now
    }
  ).catch(error => {

    console.error(
      "Player save failed:",
      error
    );

  });


  /*
    3. PLAYER COUNT
    ----------------
    नयाँ player बनेपछि
    system/stats मा +1
  */

  runTransaction(
    db,
    async transaction => {

      const statsRef =
        doc(
          db,
          "system",
          "stats"
        );

      const statsSnap =
        await transaction.get(
          statsRef
        );

      if (statsSnap.exists()) {

        const currentCount =
          statsSnap.data()
            .playerCount || 0;

        transaction.update(
          statsRef,
          {
            playerCount:
              currentCount + 1
          }
        );

      } else {

        transaction.set(
          statsRef,
          {
            playerCount: 1
          }
        );

      }

    }
  ).catch(error => {

    console.error(
      "Player count update failed:",
      error
    );

  });


  /*
    4. तुरुन्त return
  */

  return player;
}


/* =========================
   LOAD PLAYER
========================= */

export async function loadPlayer() {

  const playerId =
    localStorage.getItem(
      "playerId"
    );


  if (!playerId) {
    return null;
  }


  /*
    पहिले localStorage
  */

  const cachedName =
    localStorage.getItem(
      "playerName"
    );

  const cachedAvatar =
    localStorage.getItem(
      "playerAvatar"
    );


  /*
    Cached data छ भने
    Firebase नपर्खने
  */

  if (cachedName) {

    return {
      playerId,
      name: cachedName,
      avatar:
        cachedAvatar || "👨‍💻"
    };

  }


  /*
    Cache छैन भने मात्र
    Firebase बाट load
  */

  try {

    const snap =
      await getDoc(
        doc(
          db,
          "players",
          playerId
        )
      );


    if (!snap.exists()) {

      localStorage.removeItem(
        "playerId"
      );

      return null;
    }


    const data =
      snap.data();


    localStorage.setItem(
      "playerName",
      data.name || "Player"
    );

    localStorage.setItem(
      "playerAvatar",
      data.avatar || "👨‍💻"
    );


    return {
      playerId,
      ...data
    };


  } catch (error) {

    console.error(
      "Player load error:",
      error
    );

    return null;
  }
}


/* =========================
   RENAME PLAYER
========================= */

export function renamePlayer(
  newName
) {

  const playerId =
    localStorage.getItem(
      "playerId"
    );


  if (!playerId) {
    return;
  }


  /*
    पहिले localStorage
  */

  localStorage.setItem(
    "playerName",
    newName
  );


  /*
    त्यसपछि Firebase
    background मा
  */

  setDoc(
    doc(
      db,
      "players",
      playerId
    ),
    {
      name: newName,
      updatedAt: Date.now()
    },
    {
      merge: true
    }
  ).catch(error => {

    console.error(
      "Rename failed:",
      error
    );

  });


  return newName;
}