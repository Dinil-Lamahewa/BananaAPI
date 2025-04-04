import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail,fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebase";
import "../App.css";


function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Reset link sent to registered email!");
      setTimeout(() => setShowForgotPassword(false), 3000);
    } catch (err) {
      setResetMessage(
        err.code === "auth/user-not-found" 
          ? "Email not registered in our system" 
          : "Error sending reset link"
      );
    }
    setLoading(false);
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
      <div className="login-box">
        <div className="logo">Banana Catcher</div>

        {!showForgotPassword ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-btn">
              Log In
            </button>
            {error && <p className="error">{error}</p>}
            <p style={{ color: "#ffffff", textAlign: "center", marginTop: "10px" }}>
              New to Banana Catcher?{" "}
              <span
                style={{ color: "#e6b800", cursor: "pointer" }}
                onClick={onSwitchToRegister}
              >
                Sign Up
              </span>
            </p>
            <p style={{ color: "#ffffff", textAlign: "center" }}>
              <span
                style={{ color: "#e6b800", cursor: "pointer" }}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="login-btn">
              Send Reset Link
            </button>
            {resetMessage && (
              <p
                className="text-center"
                style={{
                  color: resetMessage.includes("sent") ? "#e6b800" : "#ff4444", 
                }}
              >
                {resetMessage}
              </p>
            )}
            <p style={{ color: "#ffffff", textAlign: "center", marginTop: "10px" }}>
              <span
                style={{ color: "#e6b800", cursor: "pointer" }}
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginForm;