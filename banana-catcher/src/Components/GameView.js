import React, { useState, useEffect } from "react";
import bucketImage from "../assets/img/buscket.png";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { db } from "../firebase"; // Import Firestore db
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "../App.css";

function GameView({ difficulty, userData, onGameOver }) {
  const [health, setHealth] = useState(3);
  const [timeLeft, setTimeLeft] = useState(
    difficulty === "Easy" ? 30 : difficulty === "Medium" ? 20 : 15
  );
  const [score, setScore] = useState(0);
  const [formulaImage, setFormulaImage] = useState("");
  const [solution, setSolution] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [bucketPosition, setBucketPosition] = useState(50);
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);
  const [showMissPopup, setShowMissPopup] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);

  // Fetch formula from API
  const fetchFormula = async () => {
    try {
      const response = await fetch("https://marcconrad.com/uob/banana/api.php");
      const data = await response.json();
      setFormulaImage(data.question);
      setSolution(data.solution);

      const randomNumbers = [
        data.solution,
        Math.floor(Math.random() * 20),
        Math.floor(Math.random() * 20),
        Math.floor(Math.random() * 20),
      ].sort(() => Math.random() - 0.5);
      setNumbers(
        randomNumbers.map((num, idx) => ({
          value: num,
          id: idx,
          top: 20,
          left: 10 + idx * 20,
          caught: false,
        }))
      );
    } catch (error) {
      console.error("Error fetching formula:", error);
    }
  };

  // Reset timer and fetch formula
  const resetRound = () => {
    setTimeLeft(difficulty === "Easy" ? 30 : difficulty === "Medium" ? 20 : 15);
    fetchFormula();
  };

  // Initial fetch
  useEffect(() => {
    fetchFormula();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setHealth((prevHealth) => {
            const newHealth = Math.max(0, prevHealth - 1);
            if (newHealth > 0) {
              setShowMissPopup(true);
              setTimeout(() => setShowMissPopup(false), 2000);
              resetRound();
            } else {
              setShowGameOverPopup(true);
              setTimeout(() => {
                setShowGameOverPopup(false);
                handleGameEnd(); // Save score and end game
              }, 2000);
            }
            return newHealth;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onGameOver]);

  // Animate falling numbers
  useEffect(() => {
    const totalTime = difficulty === "Easy" ? 30 : difficulty === "Medium" ? 20 : 15;
    const speed = 100 / (totalTime * 20);
    const fallInterval = setInterval(() => {
      setNumbers((prev) =>
        prev.map((num) => ({
          ...num,
          top: num.top + speed,
        }))
      );
    }, 50);
    return () => clearInterval(fallInterval);
  }, [difficulty]);

  // Move bucket with mouse (relative to container)
  useEffect(() => {
    const handleMove = (e) => {
      const container = document.querySelector(".numbers-container");
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;
        const newPos = (mouseX / containerWidth) * 100;
        setBucketPosition(Math.max(0, Math.min(80, newPos)));
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Check collision or miss
  useEffect(() => {
    setNumbers((prevNumbers) => {
      let newHealth = health;
      const updatedNumbers = prevNumbers.map((num) => {
        if (num.caught) return num;

        if (num.top > 80 && num.top < 90) {
          if (num.left > bucketPosition - 10 && num.left < bucketPosition + 10) {
            if (num.value === solution) {
              setScore((prev) => prev + 10);
              setShowCorrectPopup(true);
              setTimeout(() => setShowCorrectPopup(false), 2000);
              resetRound();
            } else {
              newHealth = Math.max(0, newHealth - 1);
              setShowWrongPopup(true);
              setTimeout(() => setShowWrongPopup(false), 2000);
              resetRound();
            }
            return { ...num, caught: true };
          }
        } else if (num.top > 100) {
          newHealth = Math.max(0, newHealth - 1);
          setShowMissPopup(true);
          setTimeout(() => setShowMissPopup(false), 2000);
          resetRound();
          return { ...num, caught: true };
        }
        return num;
      });

      if (newHealth !== health) {
        setHealth(newHealth);
        if (newHealth <= 0) {
          setShowGameOverPopup(true);
          setTimeout(() => {
            setShowGameOverPopup(false);
            handleGameEnd(); // Save score and end game
          }, 2000);
        }
      }

      return updatedNumbers.filter((num) => !num.caught);
    });
  }, [numbers, bucketPosition, solution, health, onGameOver]);

  // Save highest score and end game
  const handleGameEnd = async () => {
    const userId = userData.email; // Use email as unique identifier
    const scoreRef = doc(db, "scores", userId);
    const scoreDoc = await getDoc(scoreRef);
    const currentHighScore = scoreDoc.exists() ? scoreDoc.data().highScore : 0;

    if (score > currentHighScore) {
      await setDoc(scoreRef, {
        highScore: score,
        playerName: `${userData.firstName} ${userData.lastName}`,
      });
    }
    onGameOver(); // Return to menu
  };

  // Handle Quit
  const handleQuit = () => {
    handleGameEnd(); // Save score before quitting
  };

  return (
    <div className="game-container container-fluid p-0">
      <div className="score position-absolute top-0 start-0 p-2 text-warning">
        Score: {score}
      </div>
      <div className="health position-absolute top-0 end-0 p-2 text-danger">
        {Array(health).fill("❤️").join(" ")}
      </div>
      <div className="timer position-absolute top-0 start-50 translate-middle-x p-2 text-warning">
        {timeLeft}s
      </div>
      <div className="formula position-absolute top-50 start-0 translate-middle-y p-2">
        <img
          src={formulaImage}
          alt="Math Formula"
          className="img-fluid"
          style={{ maxWidth: "70%", maxHeight: "500px" }}
        />
      </div>
      <div className="numbers-container position-absolute top-50 end-0 translate-middle-y w-50 h-75 bg-dark p-3 three-d-container">
        {numbers.map((num) => (
          <div
            key={num.id}
            className="falling-number position-absolute bg-warning text-dark rounded p-2"
            style={{ top: `${num.top}%`, left: `${num.left}%` }}
          >
            {num.value}
          </div>
        ))}
        <div
          className="bucket position-absolute bottom-0"
          style={{ left: `${bucketPosition}%` }}
        >
          <img src={bucketImage} alt="Bucket" style={{ width: "50px", height: "50px" }} />
        </div>
      </div>
      <div className="controls position-absolute bottom-0 start-50 translate-middle-x mb-3">
        <button className="btn btn-danger" onClick={handleQuit}>
          Quit
        </button>
      </div>
      {showCorrectPopup && (
        <div className="correct-popup position-absolute top-50 start-50 translate-middle bg-success text-white rounded p-3 animate__animated animate__fadeIn">
          Correct!
        </div>
      )}
      {showWrongPopup && (
        <div className="wrong-popup position-absolute top-50 start-50 translate-middle bg-danger text-white rounded p-3 animate__animated animate__fadeIn">
          Wrong!
        </div>
      )}
      {showMissPopup && (
        <div className="miss-popup position-absolute top-50 start-50 translate-middle bg-warning text-dark rounded p-3 animate__animated animate__fadeIn">
          Missed!
        </div>
      )}
      {showGameOverPopup && (
        <div className="game-over-popup position-absolute top-50 start-50 translate-middle bg-dark text-white rounded p-3 animate__animated animate__fadeIn">
          Game Over!
        </div>
      )}
    </div>
  );
}

export default GameView;