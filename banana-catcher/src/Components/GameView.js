import React, { useState, useEffect, useContext } from "react";
import { AudioContext } from "./AudioContext";
import bucketImage from "../assets/img/catch.png";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import correctSound from '../assets/aud/CR.mp3'; // Adjust the path if needed
import GameOverSound from '../assets/aud/GameOver.mp3'; // Adjust the path if needed
import WrongSound from '../assets/aud/Wrong.mp3'; // Adjust the path if needed
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
  const [bucketPosition, setBucketPosition] = useState(50); // Horizontal position (%)
  const [bucketTop, setBucketTop] = useState(80); // Vertical position (%), starts near bottom
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);
  const [showMissPopup, setShowMissPopup] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const { audioRef, mute } = useContext(AudioContext);

  useEffect(() => {
    if (audioRef.current && !mute) {
      audioRef.current.play().catch((e) => console.log("Autoplay prevented:", e));
      audioRef.current.volume = 0.15;
    } else if (audioRef.current && mute) {
      audioRef.current.pause();
    }
  }, [audioRef, mute]);

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
    } finally {
      setLoading(false);
    }
  };

  const resetRound = () => {
    setTimeLeft(difficulty === "Easy" ? 30 : difficulty === "Medium" ? 20 : 15);
    fetchFormula();
  };

  useEffect(() => {
    fetchFormula();
  }, []);

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
                handleGameEnd();
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

  // Move bucket with mouse (2D movement)
  useEffect(() => {
    const handleMove = (e) => {
      const container = document.querySelector(".numbers-container");
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        const newLeft = (mouseX / containerWidth) * 100;
        const newTop = (mouseY / containerHeight) * 100;

        // Keep bucket within bounds (0-80% left, 0-90% top)
        setBucketPosition(Math.max(0, Math.min(80, newLeft)));
        setBucketTop(Math.max(0, Math.min(90, newTop)));
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Check collision anywhere in the container
  useEffect(() => {
    setNumbers((prevNumbers) => {
      let newHealth = health;
      const updatedNumbers = prevNumbers.map((num) => {
        if (num.caught) return num;

        // Collision detection: Check if bucket overlaps with number
        const bucketWidth = 50; // Bucket size in pixels (approximate %)
        const bucketHeight = 50;
        const numberWidth = 40; // Approx size of falling-number (adjust if needed)
        const numberHeight = 40;

        const bucketLeft = bucketPosition;
        const bucketRight = bucketLeft + (bucketWidth / window.innerWidth) * 100;
        const bucketTopPos = bucketTop;
        const bucketBottom = bucketTopPos + (bucketHeight / window.innerHeight) * 100;

        const numLeft = num.left;
        const numRight = numLeft + (numberWidth / window.innerWidth) * 100;
        const numTop = num.top;
        const numBottom = numTop + (numberHeight / window.innerHeight) * 100;

        const isColliding =
          bucketLeft < numRight &&
          bucketRight > numLeft &&
          bucketTopPos < numBottom &&
          bucketBottom > numTop;

        if (isColliding) {
          if (num.value === solution) {
            setScore((prev) => prev + 10);
            const audio = new Audio(correctSound);
            audio.play();
            audio.volume = 1;
            setShowCorrectPopup(true);
            setTimeout(() => setShowCorrectPopup(false), 2000);
            resetRound();
          } else {
            newHealth = Math.max(0, newHealth - 1);
            const audio = new Audio(WrongSound);
            audio.play();
            audio.volume = 1;
            setShowWrongPopup(true);
            setTimeout(() => setShowWrongPopup(false), 2000);
            resetRound();
          }
          return { ...num, caught: true };

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
          const audio = new Audio(GameOverSound);
          audio.volume = 1;
            audio.play();
          setTimeout(() => {
            setShowGameOverPopup(false);
            handleGameEnd();
          }, 2000);
        }
      }

      return updatedNumbers.filter((num) => !num.caught);
    });
  }, [numbers, bucketPosition, bucketTop, solution, health, onGameOver]);

  const handleGameEnd = async () => {
    const userId = userData.email;
    const scoreRef = doc(db, "scores", userId, "difficulties", difficulty.toLowerCase());
    const scoreDoc = await getDoc(scoreRef);
    const currentHighScore = scoreDoc.exists() ? scoreDoc.data().highScore : 0;

    if (score > currentHighScore) {
      await setDoc(scoreRef, {
        highScore: score,
        playerName: `${userData.firstName} ${userData.lastName}`,
        difficulty: difficulty,
      });
    }
    onGameOver();
  };

  const handleQuit = () => {
    handleGameEnd();
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

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
          style={{ maxWidth: "100%", maxHeight: "800px" }}
        />
      </div>
      <div className="numbers-container position-absolute top-50 end-0 translate-middle-y w-50 h-75 bg-dark p-3 three-d-container">
        {numbers.map((num) => (
          <div
            key={num.id}
            className="falling-number position-absolute text-white d-flex flex-column justify-content-end align-items-center"
            style={{
              top: `${num.top}%`,
              left: `${num.left}%`,
              width: "150px", // Adjust width to fit the banana image
              height: "140px", // Adjust height to fit the banana image
              backgroundImage: `url(${require('../assets/img/banana.png')})`, // Correct path to the banana image
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              fontSize: "25px", // Adjust font size for better visibility
              fontWeight: "bold", // Make the number bold
              textShadow: "1px 1px 2px black", // Add shadow for better contrast
              color: "black", // Ensure the number is visible
            }}
          >
            <span style={{ marginBottom: "28px", color: "black" }}>{num.value}</span>
          </div>
        ))}
        <div
          className="bucket position-absolute"
          style={{ left: `${bucketPosition}%`, top: `${bucketTop}%` }}
        >
          <img src={bucketImage} alt="Bucket" style={{ width: "190px", height: "180px" }} />
        </div>
      </div>
      <div className="controls position-absolute bottom-0 start-50 translate-middle-x mb-3">
        <button className="btn btn-danger" onClick={handleQuit}>
          Quit
        </button>
      </div>
      {showCorrectPopup && (
        <div className="correct-popup position-absolute top-50 start-50 translate-middle bg-success rounded p-3 animate__animated animate__fadeIn">
          <img
            src={require('../assets/img/CR.png')} // Correct path to the correct.png image
            alt="Correct"
            style={{ width: "150px", height: "140px" }} // Adjust size as needed
          />
        </div>
      )}
      {showWrongPopup && (
        <div className="wrong-popup position-absolute top-50 start-50 translate-middle bg-danger text-white rounded p-3 animate__animated animate__fadeIn">
          <img
            src={require('../assets/img/Wrong.png')} // Correct path to the correct.png image
            alt="Wrong"
            style={{ width: "150px", height: "140px" }} // Adjust size as needed
          />
        </div>
      )}
      {showMissPopup && (
        <div className="miss-popup position-absolute top-50 start-50 translate-middle bg-warning text-dark rounded p-3 animate__animated animate__fadeIn">
          Missed!
        </div>
      )}
      {showGameOverPopup && (
        <div className="game-over-popup position-absolute top-50 start-50 translate-middle bg-dark text-white rounded p-3 animate__animated animate__fadeIn">
          <img
            src={require('../assets/img/Gameover.png')} // Correct path to the correct.png image
            alt="GameOver"
            style={{ width: "150px", height: "140px" }} // Adjust size as needed
          />
        </div>
      )}
    </div>
  );
}

export default GameView;