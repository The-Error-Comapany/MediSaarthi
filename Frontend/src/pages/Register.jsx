import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Signin from "./Signin";
import Signup from "./Signup";
import "./Register.css";

const Register = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsSignup(location.pathname === "/signup");
  }, [location.pathname]);

  const handleSignupClick = () => {
    setIsSignup(true);
    navigate("/signup");
  };

  const handleSigninClick = () => {
    setIsSignup(false);
    navigate("/signin");
  };

  return (
    <div className="register-page">
      <div className={`auth-container ${isSignup ? "change" : ""}`}>
        {/* FORM SIDE */}
        <div className="forms-container">
          <Signin />
          <Signup />
        </div>

        {/* INTRO SIDE */}
        <div className="intros-container">
          <div className="intro-control signin-intro">
            <div className="intro-control__inner">
              <h2>Welcome back!</h2>
              <p>Please login to continue.</p>
              <button onClick={handleSignupClick}>No account yet? Signup.</button>
            </div>
          </div>

          <div className="intro-control signup-intro">
            <div className="intro-control__inner">
              <h2>Come join us!</h2>
              <p>Create an account to get started.</p>
              <button onClick={handleSigninClick}>Already have an account? Signin.</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
