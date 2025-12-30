import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
const Signup = () => {
  const [step, setStep] = useState("FORM"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setStep("OTP");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      await fetchUser();         
      navigate("/app/dashboard"); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await fetch("http://localhost:8000/api/v1/users/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      alert("OTP resent to your email");
    } catch {
      alert("Failed to resend OTP");
    }
  };

  useEffect(() => {
    if (step !== "FORM") return;
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleSignup,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-signup-btn"),
      {
        theme: "outline",
        size: "large",
        width: 320,
      }
    );
  }, [step]);

  const handleGoogleSignup = async (response) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google signup failed");
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form signup-form">
      {step === "FORM" && (
        <>
          <form onSubmit={handleRegister}>
            <h2>Sign up</h2>

            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Sign up"}
            </button>
          </form>

          <div style={{ margin: "20px 0", textAlign: "center" }}>OR</div>

          {/*Google Button */}
          <div id="google-signup-btn"></div>
        </>
      )}

      {step === "OTP" && (
        <form onSubmit={verifyOtp}>
          <h2>Verify OTP</h2>
          <p>OTP sent to <b>{email}</b></p>

          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button type="button" onClick={resendOtp} className="link-btn">
            Resend OTP
          </button>
        </form>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Signup;
