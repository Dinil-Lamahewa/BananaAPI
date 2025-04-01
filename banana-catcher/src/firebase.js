import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGVFzkgxa6YMQtffpUNbH4e9IxItaeLhg",
  authDomain: "banana-game-d92a1.firebaseapp.com",
  projectId: "banana-game-d92a1",
  storageBucket: "banana-game-d92a1.firebasestorage.app",
  messagingSenderId: "79928126177",
  appId: "1:79928126177:web:0d594091bad81e049565a0",
  measurementId: "G-XM0J7H5HET",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserSessionPersistence);

export { auth, db };