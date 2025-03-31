import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import MenuForm from "./Components/MenuForm";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such user document!");
          return;
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSwitchToLogin = () => setShowLogin(true);
  const handleSwitchToRegister = () => setShowLogin(false);

  if (user) {
    return <MenuForm user={user} userData={userData} />;
  }

  return showLogin ? (
    <LoginForm onSwitchToRegister={handleSwitchToRegister} />
  ) : (
    <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
  );
}

export default App;