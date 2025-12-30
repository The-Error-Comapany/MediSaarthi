import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  const navLinks = [
    { to: "/app/dashboard", text: "Dashboard" },
    { to: "/app/schedule", text: "Schedule" },
    { to: "/app/reports", text: "Reports" },
    { to: "/app/profile", text: "Profile" },
  ];

  return (
    <footer
      className="d-md-none fixed-bottom bg-white shadow-lg p-3 border-top border-light d-flex justify-content-around text-center small"
      style={{ zIndex: 1030 }}
    >
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`text-decoration-none ${
            location.pathname === link.to ? "text-primary fw-bold" : "text-muted"
          }`}
          style={{ minWidth: "60px" }}
        >
          {link.text}
        </Link>
      ))}
    </footer>
  );
}
