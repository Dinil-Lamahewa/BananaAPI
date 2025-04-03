import { createContext, useRef, useState, useEffect } from "react";

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [mute, setMute] = useState(false); // Mute state

  useEffect(() => {
    audioRef.current = new Audio(require("../assets/aud/BM.mp3"));
    audioRef.current.loop = true;
    audioRef.current.volume = 0.30;

    const handleFirstInteraction = () => {
      if (!mute) {
        audioRef.current.play().catch((e) => console.log("Autoplay prevented:", e));
      }
      document.removeEventListener("click", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);

    return () => {
      audioRef.current.pause();
      document.removeEventListener("click", handleFirstInteraction);
    };
  }, [mute]);

  const toggleMute = () => {
    setMute((prevMute) => {
      if (!prevMute) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e) => console.log("Autoplay prevented:", e));
      }
      return !prevMute;
    });
  };

  return (
    <AudioContext.Provider value={{ audioRef, mute, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
};