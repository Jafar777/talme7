import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAaY3s9dLs7ECpG0fKS10GhHj1FE-J19lA",
  authDomain: "taboo-game-52b5d.firebaseapp.com",
  projectId: "taboo-game-52b5d",
  storageBucket: "taboo-game-52b5d.firebasestorage.app",
  messagingSenderId: "556555804924",
  appId: "1:556555804924:web:a25b0d8c506e83199db779"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);