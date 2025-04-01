import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import "../App.css";

function MenuForm({ user, userData, onDifficultySelect }) {
  const [showModal, setShowModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const scoresRef = collection(db, "scores");
      const q = query(scoresRef, orderBy("score", "desc"));
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data(),
      }));
      setLeaderboard(scores);
    };
    fetchLeaderboard();
  }, []);

  const handleQuit = () => {
    auth.signOut();
  };

  const handlePlay = () => {
    setShowModal(true);
  };

  const handleDifficultySelect = (difficulty) => {
    setShowModal(false);
    onDifficultySelect(difficulty);
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
        <button className="login-btn" disabled>
          Leaderboard
        </button>
        <button className="login-btn" onClick={handleQuit}>
          Quit
        </button>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-container">
        <h3 className="leaderboard-title">Leaderboard</h3>
        <ul className="leaderboard-list">
          {leaderboard.map((entry) => (
            <li key={entry.id} className="leaderboard-item">
              <span>{entry.rank}. {entry.name}</span>
              <span>{entry.score}</span>
            </li>
          ))}
        </ul>
      </div>

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