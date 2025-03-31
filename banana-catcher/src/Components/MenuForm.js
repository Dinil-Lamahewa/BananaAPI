import React, { useState } from "react";
import { auth } from "../firebase";
import "../App.css";

function MenuForm({ user, userData }) {
  const [showModal, setShowModal] = useState(false);

  const handleQuit = () => {
    auth.signOut(); // Logs the user out
  };

  const handlePlay = () => {
    setShowModal(true); // Show the modal when Play is clicked
  };

  const handleDifficultySelect = (difficulty) => {
    setShowModal(false); // Close the modal
    console.log(`Selected difficulty: ${difficulty}`); // Placeholder for game logic
    // Add your game start logic here based on difficulty
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">Banana Catcher</div>
        <h2 style={{ color: "#ffffff", textAlign: "center" }}>
          Welcome, Banana Catcher!
        </h2>
        <button className="login-btn" onClick={handlePlay}>
          Play
        </button>
        <button className="login-btn">Leaderboard</button>
        <button className="login-btn" onClick={handleQuit}>
          Quit
        </button>
      </div>

      {/* Modal for difficulty selection */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "#ffffff", textAlign: "center" }}>
              Select Difficulty
            </h3>
            <button
              className="login-btn"
              onClick={() => handleDifficultySelect("Easy")}
            >
              Easy
            </button>
            <button
              className="login-btn"
              onClick={() => handleDifficultySelect("Medium")}
            >
              Medium
            </button>
            <button
              className="login-btn"
              onClick={() => handleDifficultySelect("Hard")}
            >
              Hard
            </button>
            <button
              className="login-btn"
              style={{ backgroundColor: "#ff4d4d" }}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuForm;