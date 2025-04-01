import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, desc } from "firebase/firestore";
import { db } from "../firebase";
import "../App.css";

function Leaderboard({ onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const scoresQuery = query(collection(db, "scores"), orderBy("highScore", "desc"));
        const scoresSnapshot = await getDocs(scoresQuery);
        const scoresData = scoresSnapshot.docs.map((doc, index) => ({
          rank: index + 1,
          playerName: doc.data().playerName,
          highScore: doc.data().highScore,
        }));
        setLeaderboard(scoresData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: "600px" }}>
        <div className="logo">Leaderboard</div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player Name</th>
                <th scope="col">Highest Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <td>{entry.rank}</td>
                  <td>{entry.playerName}</td>
                  <td>{entry.highScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="login-btn" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;