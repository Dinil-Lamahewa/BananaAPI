import React, { useState, useEffect } from "react";
import "../App.css";

function GameView({ difficulty, userData, onGameOver }) {
  const [health, setHealth] = useState(3); // 3 lives
  const [timeLeft, setTimeLeft] = useState(
    difficulty === "Easy" ? 30 : difficulty === "Medium" ? 20 : 10
  ); // Time in seconds
  const [formulaImage, setFormulaImage] = useState("");
  const [solution, setSolution] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [bucketPosition, setBucketPosition] = useState(50); // Bucket position (% from left)

  // Fetch formula from API
  const fetchFormula = async () => {
    try {
      const response = await fetch("https://marcconrad.com/uob/banana/api.php");
      const data = await response.json();
      setFormulaImage(data.question);
      setSolution(data.solution);

      // Generate 4 numbers in a fixed horizontal line
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
          top: 20, // Start below formula (20% from top)
          left: 10 + idx * 20, // Fixed positions: 10%, 30%, 50%, 70%
        }))
      );
    } catch (error) {
      console.error("Error fetching formula:", error);
    }
  };

  // Initial fetch and timer
  useEffect(() => {
    fetchFormula();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onGameOver]);

  // Animate falling numbers
  useEffect(() => {
    const totalTime = difficulty === "Easy" ? 60 : difficulty === "Medium" ? 45 : 30;
    const speed = 80 / (totalTime * 20); // Adjust speed to cover 80% height in totalTime
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

  // Move bucket with mouse
  useEffect(() => {
    const handleMove = (e) => {
      const windowWidth = window.innerWidth;
      const newPos = (e.clientX / windowWidth) * 100;
      setBucketPosition(Math.max(0, Math.min(80, newPos))); // Keep within 0-80%
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Check collision or miss
  useEffect(() => {
    numbers.forEach((num) => {
      if (num.top > 80 && num.top < 90) { // Near bucket height
        if (
          num.left > bucketPosition - 10 &&
          num.left < bucketPosition + 10
        ) {
          if (num.value === solution) {
            fetchFormula(); // Correct catch, refresh formula
          } else {
            setHealth((prev) => {
              const newHealth = prev - 1;
              if (newHealth <= 0) {
                alert("Game Over! All lives lost.");
                onGameOver();
              }
              fetchFormula(); // Wrong catch, refresh formula
              return newHealth;
            });
          }
        }
      } else if (num.top > 100) { // Missed the bucket
        setHealth((prev) => {
          const newHealth = prev - 1;
          if (newHealth <= 0) {
            alert("Game Over! All lives lost.");
            onGameOver();
          }
          fetchFormula(); // Missed, refresh formula
          return newHealth;
        });
        setNumbers((prev) => prev.filter((n) => n.id !== num.id)); // Remove missed number
      }
    });
  }, [numbers, bucketPosition, solution, onGameOver]);

  return (
    <div className="game-container">
      {/* Health (top-right) */}
      <div className="health">
        {Array(health).fill("❤️").join(" ")}
      </div>

      {/* Timer (top-center) */}
      <div className="timer">{timeLeft}s</div>

      {/* Formula Image */}
      <div className="formula">
        <img src={formulaImage} alt="Math Formula" />
      </div>

      {/* Falling Numbers */}
      {numbers.map((num) => (
        <div
          key={num.id}
          className="falling-number"
          style={{ top: `${num.top}%`, left: `${num.left}%` }}
        >
          {num.value}
        </div>
      ))}

      {/* Bucket */}
      <div className="bucket" style={{ left: `${bucketPosition}%` }}>
        🪣 {/* Replace with your PNG */}
      </div>
    </div>
  );
}

export default GameView;