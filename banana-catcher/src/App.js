import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSwitchToLogin = () => setShowLogin(true);
  const handleSwitchToRegister = () => setShowLogin(false);

  if (user) {
    return (
      <div className="login-container">
        <h1>Welcome, {user.email}!</h1>
        <button onClick={() => auth.signOut()}>Log Out</button>
      </div>
    );
  }

  return showLogin ? (
    <LoginForm onSwitchToRegister={handleSwitchToRegister} />
  ) : (
    <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
  );
}

export default App;