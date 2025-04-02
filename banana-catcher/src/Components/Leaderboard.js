import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore"; // Added doc, getDoc
import { db } from "../firebase";
import "../App.css";

function Leaderboard({ onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch all users' scores
        const scoresRef = collection(db, "scores");
        const usersSnapshot = await getDocs(scoresRef);

        // Collect scores for the selected difficulty from each user's subcollection
        const scoresData = [];
        for (const userDoc of usersSnapshot.docs) {
          const difficultyRef = doc(db, `scores/${userDoc.id}/difficulties`, selectedDifficulty);
          const difficultyDoc = await getDoc(difficultyRef);
          if (difficultyDoc.exists()) {
            scoresData.push({
              playerName: difficultyDoc.data().playerName,
              highScore: difficultyDoc.data().highScore,
            });
          }
        }

        // Sort by highScore descending and assign ranks
        scoresData.sort((a, b) => b.highScore - a.highScore);
        const rankedData = scoresData.map((entry, index) => ({
          rank: index + 1,
          playerName: entry.playerName,
          highScore: entry.highScore,
        }));

        setLeaderboard(rankedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]); // Reset on error
      }
    };
    fetchLeaderboard();
  }, [selectedDifficulty]);

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: "600px" }}>
        <div className="logo">Leaderboard</div>
        <div className="mb-3">
          <label htmlFor="difficultySelect" style={{ color: "#ffffff", marginRight: "10px" }}>
            Filter by Difficulty:
          </label>
          <select
            id="difficultySelect"
            value={selectedDifficulty}
            onChange={handleDifficultyChange}
            className="form-select d-inline-block"
            style={{ width: "auto", backgroundColor: "#333333", color: "#ffffff" }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
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
              {leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <tr key={entry.rank}>
                    <td>{entry.rank}</td>
                    <td>{entry.playerName}</td>
                    <td>{entry.highScore}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No scores available for {selectedDifficulty} difficulty
                  </td>
                </tr>
              )}
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