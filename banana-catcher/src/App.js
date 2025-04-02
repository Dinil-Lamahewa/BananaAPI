import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import MenuForm from "./Components/MenuForm";
import GameView from "./Components/GameView";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [difficulty, setDifficulty] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUser(null);
        setUserData(null);
        setDifficulty(null);
      }
      setLoading(false); // Done loading auth state
    });
    return () => unsubscribe();
  }, []);

  const handleSwitchToLogin = () => setShowLogin(true);
  const handleSwitchToRegister = () => setShowLogin(false);
  const handleGameOver = () => setDifficulty(null);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user && userData) {
    if (difficulty) {
      return (
        <GameView
          difficulty={difficulty}
          userData={userData}
          onGameOver={handleGameOver}
        />
      );
    }
    return (
      <MenuForm
        user={user}
        userData={userData}
        onDifficultySelect={setDifficulty}
      />
    );
  }

  return showLogin ? (
    <LoginForm onSwitchToRegister={handleSwitchToRegister} />
  ) : (
    <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
  );
}

export default App;