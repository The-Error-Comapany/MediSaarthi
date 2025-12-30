import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="home-hero">
        <h1 className="home-title"> Welcome to MediSaarthi</h1>
        <p className="home-subtitle">
          Your smart companion for managing medicines, health reminders, and wellness insights.
        </p>

        <div className="home-buttons">
          <button className="home-btn primary" onClick={() => navigate("/signin")}>
            Login
          </button>
          <button className="home-btn secondary" onClick={() => navigate("/signup")}>
            Signup
          </button>
        </div>
      </header>

      {/* About Section */}
      <section className="home-about">
        <h2>Why Choose MediSaarthi?</h2>
        <p>
          Just as Krishna guided Arjun in the Mahabharat, Medisaarthi becomes your charioteer in the battlefield of health, reminding you of every medicine and steering you toward well-being.
        </p>

        <div className="features">
          <div className="feature-card">
            <i className="bi bi-bell"></i>
            <h3>Smart Reminders</h3>
            <p>Never miss a dose — get timely notifications for every medicine.</p>
          </div>

          <div className="feature-card">
            <i className="bi bi-journal-medical"></i>
            <h3>Prescription Tracker</h3>
            <p>Keep all your medication records securely organized and accessible.</p>
          </div>

          <div className="feature-card">
            <i className="bi bi-bar-chart-line"></i>
            <h3>Health Insights</h3>
            <p>Track your progress and stay informed with smart health analytics.</p>
          </div>

          <div className="feature-card">
            <i className="bi bi-journal-medical"></i>
            <h3>All at your Phone</h3>
            <p>All updates at google calendar.</p>
          </div>
          <div className="feature-card">
            <i className="bi bi-journal-medical"></i>
            <h3>Your Saarthi</h3>
            <p>Your personalised AI assistant who will remind you of your daily medicines.</p>
          </div>
          <div className="feature-card">
            <i className="bi bi-journal-medical"></i>
            <h3>Early prediction</h3>
            <p>AI powered predictions that will help you being out of danger.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} MediSaarthi. All rights reserved!</p>
      </footer>
    </div>
  );
};

export default Home;
