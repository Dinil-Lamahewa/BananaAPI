import React from "react";
import { auth } from "../firebase";
import "../App.css";

function MenuForm({ user, userData }) {
  const handleQuit = () => {
    auth.signOut(); // Logs the user out and returns to login screen
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">Banana Catcher</div>
        <h2 style={{ color: "#ffffff", textAlign: "center" }}>
          Welcome,Banana Catcher!
        </h2>
        <button className="login-btn">Play</button>
        <button className="login-btn">Leaderboard</button>
        <button className="login-btn" onClick={handleQuit}>
          Quit
        </button>
      </div>
    </div>
  );
}

export default MenuForm;