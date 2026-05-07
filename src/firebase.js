import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzZZ8dbNGj9vYsQDIPytL_kOHHalIsGsA",
  authDomain: "currentquiz7.firebaseapp.com",
  projectId: "currentquiz7",
  messagingSenderId: "6540146391",
  appId: "1:6540146391:web:4855a36246cb8480e6e292",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);