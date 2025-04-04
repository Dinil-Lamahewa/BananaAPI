import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../App.css";

function Leaderboard({ onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [loading, setLoading] = useState(true);
  const [joke, setJoke] = useState(null); // State for storing the joke

  const fetchJoke = async () => {
    try {
      const response = await fetch("https://official-joke-api.appspot.com/random_joke");
      const data = await response.json();
      setJoke(data); // Save the random joke in state
    } catch (error) {
      console.error("Error fetching joke:", error);
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const scoresRef = collection(db, "scores");
        const usersSnapshot = await getDocs(scoresRef);

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

        scoresData.sort((a, b) => b.highScore - a.highScore);
        const rankedData = scoresData.map((entry, index) => ({
          rank: index + 1,
          playerName: entry.playerName,
          highScore: entry.highScore,
        }));

        setLeaderboard(rankedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJoke();
    fetchLeaderboard();
    const jokeInterval = setInterval(() => {
      fetchJoke();
    }, 7000);
  
    // Cleanup interval on component unmount
    return () => clearInterval(jokeInterval);
  }, [selectedDifficulty]);

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

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
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
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
        {joke && (
          <div className="joke-section mt-4" style={{ backgroundColor: "#333333", padding: "20px", borderRadius: "10px" }}>
            <center><h3 style={{ color:"white" }}><u>Fun Fact</u></h3></center>
            <blockquote className="blockquote text-center" style={{ color: "white" }}>
              <p className="mb-0">{joke.setup}</p>
              <br />
              <footer className="blockquote-footer" style={{ color: "white" }}>{joke.punchline}</footer>
            </blockquote>
          </div>
        )}
        <button className="login-btn" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;