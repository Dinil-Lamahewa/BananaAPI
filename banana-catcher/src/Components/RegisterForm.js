import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../App.css";

function RegisterForm({ onSwitchToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New loading state

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  const formatBirthday = (date) => {
    if (!date) return "BirthDay-mm/dd/yyyy";
    const [year, month, day] = date.split("-");
    return `BirthDay-${month}/${day}/${year}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading

    if (!emailRegex.test(email)) {
      setError("Please enter a valid Gmail address.");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be 8+ characters with uppercase, lowercase, numbers, and symbols (e.g., !@#$%^&*)."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const createdAt = new Date().toISOString();

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        birthday,
        email,
        createdAt,
      });

      setFirstName("");
      setLastName("");
      setBirthday("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Registration failed. Email might already be in use.");
    } finally {
      setLoading(false); // Stop loading
    }
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
        <form onSubmit={handleRegister}>
          <input
            type="text"
            className="input-field"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            className="input-field"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="date"
            className="input-field"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
          />
          <p className="date-hint">{formatBirthday(birthday)}</p>
          <input
            type="email"
            className="input-field"
            placeholder="Email (Gmail only)"
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
          <input
            type="password"
            className="input-field"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            Sign Up
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p style={{ color: "#ffffff", textAlign: "center", marginTop: "10px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#e6b800", cursor: "pointer" }}
            onClick={onSwitchToLogin}
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;