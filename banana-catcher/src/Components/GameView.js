import React, { useState, useEffect } from "react";
import bucketImage from "../assets/img/buscket.png"; // Import the bucket image
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "animate.css"; // Import Animate.css for animations
import "../App.css"; // Keep custom styles

function GameView({ difficulty, userData, onGameOver }) {
  const [health, setHealth] = useState(3); // 3 lives
  const [timeLeft, setTimeLeft] = useState(
    difficulty === "Easy" ? 30 : difficulty === "Medium" ? 20 : 15
  ); // Initial time in seconds
  const [score, setScore] = useState(0); // Player score
  const [formulaImage, setFormulaImage] = useState("");
  const [solution, setSolution] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [bucketPosition, setBucketPosition] = useState(50); // Bucket position (% within container)
  const [showCorrectPopup, setShowCorrectPopup] = useState(false); // Correct popup
  const [showWrongPopup, setShowWrongPopup] = useState(false); // Wrong popup
  const [showMissPopup, setShowMissPopup] = useState(false); // Miss popup
  const [showGameOverPopup, setShowGameOverPopup] = useState(false); // Game Over popup
  const [isPaused, setIsPaused] = useState(false); // Pause state (unused but kept for reference)

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
      ].sort(() => Math.random() - 0.5); // Shuffle
      setNumbers(
        randomNumbers.map((num, idx) => ({
          value: num,
          id: idx,
          top: 20, // Start near top of 3D container
          left: 10 + idx * 20, // Fixed positions: 10%, 30%, 50%, 70% within container
          caught: false, // Track if processed
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
    if (isPaused) return; // Skip if paused (unused logic)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setHealth((prevHealth) => {
            const newHealth = Math.max(0, prevHealth - 1); // Reduce 1 life
            if (newHealth > 0) {
              setShowMissPopup(true); // Show miss popup
              setTimeout(() => setShowMissPopup(false), 2000); // Hide after 2s
              resetRound(); // Reset time and fetch new formula
            } else {
              setShowGameOverPopup(true); // Show Game Over popup
              setTimeout(() => {
                setShowGameOverPopup(false);
                onGameOver(); // End game after 2s
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
  }, [timeLeft, onGameOver, isPaused]);

  // Animate falling numbers
  useEffect(() => {
    if (isPaused) return; // Skip if paused (unused logic)
    const totalTime = difficulty === "Easy" ? 30 : difficulty === "Medium" ? 20 : 15;
    const speed = 100 / (totalTime * 20); // Fall 100% over totalTime within container
    const fallInterval = setInterval(() => {
      setNumbers((prev) =>
        prev.map((num) => ({
          ...num,
          top: num.top + speed,
        }))
      );
    }, 50);
    return () => clearInterval(fallInterval);
  }, [difficulty, isPaused]);

  // Move bucket with mouse (relative to container)
  useEffect(() => {
    const handleMove = (e) => {
      if (isPaused) return; // Skip if paused (unused logic)
      const container = document.querySelector(".numbers-container");
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left; // Mouse position relative to container
        const newPos = (mouseX / containerWidth) * 100;
        setBucketPosition(Math.max(0, Math.min(80, newPos))); // Limit to 0-80% within container
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isPaused]);

  // Check collision or miss
  useEffect(() => {
    if (isPaused) return; // Skip if paused (unused logic)
    setNumbers((prevNumbers) => {
      let newHealth = health;
      const updatedNumbers = prevNumbers.map((num) => {
        if (num.caught) return num; // Skip processed numbers

        // Check catch within container
        if (num.top > 80 && num.top < 90) {
          if (num.left > bucketPosition - 10 && num.left < bucketPosition + 10) {
            if (num.value === solution) {
              setScore((prev) => prev + 10); // Add 10 points
              setShowCorrectPopup(true); // Show correct popup
              setTimeout(() => setShowCorrectPopup(false), 2000); // Hide after 2s
              resetRound(); // Correct catch: reset time and fetch new formula
            } else {
              newHealth = Math.max(0, newHealth - 1); // Wrong catch: lose life
              setShowWrongPopup(true); // Show wrong popup
              setTimeout(() => setShowWrongPopup(false), 2000); // Hide after 2s
              resetRound(); // Reset time and fetch new formula
            }
            return { ...num, caught: true };
          }
        }
        // Check miss within container
        else if (num.top > 100) {
          newHealth = Math.max(0, newHealth - 1); // Missed: lose life
          setShowMissPopup(true); // Show miss popup
          setTimeout(() => setShowMissPopup(false), 2000); // Hide after 2s
          resetRound(); // Reset time and fetch new formula
          return { ...num, caught: true };
        }
        return num;
      });

      if (newHealth !== health) {
        setHealth(newHealth);
        if (newHealth <= 0) {
          setShowGameOverPopup(true); // Show Game Over popup
          setTimeout(() => {
            setShowGameOverPopup(false);
            onGameOver(); // End game after 2s
          }, 2000);
        }
      }

      return updatedNumbers.filter((num) => !num.caught);
    });
  }, [numbers, bucketPosition, solution, health, onGameOver, isPaused]);

  // Handle Quit
  const handleQuit = () => {
    onGameOver(); // Return to main menu
  };

  return (
    <div className="game-container container-fluid p-0">
      {/* Score (left side) */}
      <div className="score position-absolute top-0 start-0 p-2 text-warning">
        Score: {score}
      </div>

      {/* Health (top-right) */}
      <div className="health position-absolute top-0 end-0 p-2 text-danger">
        {Array(health).fill("❤️").join(" ")}
      </div>

      {/* Timer (top-center) */}
      <div className="timer position-absolute top-0 start-50 translate-middle-x p-2 text-warning">
        {timeLeft}s
      </div>

      {/* Formula Image (left-center, larger size) */}
      <div className="formula position-absolute top-50 start-0 translate-middle-y p-2">
        <img
          src={formulaImage}
          alt="Math Formula"
          className="img-fluid"
          style={{ maxWidth: "70%", maxHeight: "500px" }} // Increased size
        />
      </div>

      {/* 3D Container for Falling Numbers and Bucket (right-center) */}
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
        {/* Bucket inside container */}
        <div
          className="bucket position-absolute bottom-0"
          style={{ left: `${bucketPosition}%` }}
        >
          <img src={bucketImage} alt="Bucket" style={{ width: "50px", height: "50px" }} />
        </div>
      </div>

      {/* Control Buttons (bottom-center) */}
      <div className="controls position-absolute bottom-0 start-50 translate-middle-x mb-3">
        <button className="btn btn-danger" onClick={handleQuit}>
          Quit
        </button>
      </div>

      {/* Correct Answer Popup */}
      {showCorrectPopup && (
        <div className="correct-popup position-absolute top-50 start-50 translate-middle bg-success text-white rounded p-3 animate__animated animate__fadeIn">
          Correct!
        </div>
      )}

      {/* Wrong Answer Popup */}
      {showWrongPopup && (
        <div className="wrong-popup position-absolute top-50 start-50 translate-middle bg-danger text-white rounded p-3 animate__animated animate__fadeIn">
          Wrong!
        </div>
      )}

      {/* Miss Popup */}
      {showMissPopup && (
        <div className="miss-popup position-absolute top-50 start-50 translate-middle bg-warning text-dark rounded p-3 animate__animated animate__fadeIn">
          Missed!
        </div>
      )}

      {/* Game Over Popup */}
      {showGameOverPopup && (
        <div className="game-over-popup position-absolute top-50 start-50 translate-middle bg-dark text-white rounded p-3 animate__animated animate__fadeIn">
          Game Over!
        </div>
      )}
    </div>
  );
}

export default GameView;