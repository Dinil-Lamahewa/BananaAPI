import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./Components/LoginForm";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

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

  if (user) {
    return (
      <div className="login-container">
        <h1>Welcome, {user.email}!</h1>
        <button onClick={() => auth.signOut()}>Log Out</button>
      </div>
    );
  }

  return <LoginForm />;
}

export default App;