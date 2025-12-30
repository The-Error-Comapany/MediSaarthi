import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Signin = () => {
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const [mode, setMode] = useState("SIGNIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const switchMode = (nextMode) => {
    setError("");
    setMode(nextMode);
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await fetchUser();
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await fetch("http://localhost:8000/api/v1/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      switchMode("FORGOT_OTP");
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/users/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      if (!res.ok) throw new Error("Invalid or expired OTP");

      alert("Password reset successful. Please sign in.");
      setOtp("");
      setNewPassword("");
      switchMode("SIGNIN");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "SIGNIN") return;
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-btn"),
      {
        theme: "outline",
        size: "large",
        width: 320,
      }
    );
  }, [mode]);

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      await fetchUser();
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-form signin-form auth-transition">
      {/* -------- SIGN IN -------- */}
      {mode === "SIGNIN" && (
        <form onSubmit={handleSignin}>
          <h2>Sign in</h2>

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
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            className="link-btn"
            onClick={() => switchMode("FORGOT_EMAIL")}
          >
            Forgot password?
          </button>

          <div style={{ margin: "20px 0", textAlign: "center" }}>OR</div>
          <div id="google-signin-btn"></div>
        </form>
      )}

      {/* -------- FORGOT EMAIL -------- */}
      {mode === "FORGOT_EMAIL" && (
        <form onSubmit={sendOtp}>
          <h2>Forgot Password</h2>

          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <button
            type="button"
            className="link-btn"
            onClick={() => switchMode("SIGNIN")}
          >
            Back to sign in
          </button>
        </form>
      )}

      {/* -------- RESET PASSWORD -------- */}
      {mode === "FORGOT_OTP" && (
        <form onSubmit={resetPassword}>
          <h2>Reset Password</h2>

          <input
            placeholder="Enter OTP"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="New password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <button
            type="button"
            className="link-btn"
            onClick={() => switchMode("FORGOT_EMAIL")}
          >
            Resend OTP
          </button>
        </form>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Signin;
