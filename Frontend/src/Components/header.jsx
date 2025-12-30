import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx"; 

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext); 

  const navLinks = [
    { to: "/app/dashboard", text: "Dashboard" },
    { to: "/app/schedule", text: "Schedule" },
    { to: "/app/reports", text: "Reports" },
    { to: "/app/profile", text: "Profile" },
    { to: "/app/chatbot", text: "ChatBot" },
  ];

  const getLinkClasses = (path) => {
    const base = "nav-link px-3 transition-all duration-300";
    const current = location.pathname;

    const isActive =
      path === "/"
        ? current === "/"
        : current.startsWith(path);

    return isActive
      ? `${base} text-primary fw-semibold border-bottom border-4 border-primary`
      : `${base} text-secondary hover:text-primary`;
  };


  const HEADER_HEIGHT_PX = "70px";

  const handleMenuClick = async (item) => {
    setIsProfileOpen(false);
    if (item.name === "Logout") {
      await logout(); 
      navigate("/"); 
    } else {
      navigate(item.path);
    }
  };
  const menuOptions = user
    ? [{ name: "Logout", path: "/logout" }]
    : [{ name: "Login", path: "/signin" }];

  return (
    <header
      className="navbar navbar-expand-md shadow-sm"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT_PX,
        zIndex: 1030,
        margin: 0,
      }}
    >
      <div className="container-fluid h-100 px-4">
        <Link to="/" className="navbar-brand fw-bold fs-4 text-success">
          MediSaarthi
        </Link>

        {/* Navigation Links */}
        <nav   className="navbar-nav d-none d-md-flex align-items-center justify-content-center flex-grow-1"
            style={{ height: "100%" }}
          >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={getLinkClasses(link.to)}
              style={{ height: "100%", display: "flex", alignItems: "center" }}
            >
              {link.text}
            </Link>
          ))}
        </nav>

        {/* Profile Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-label="Toggle profile menu"
          >
            <i className="bi bi-person-fill fs-5"></i>
          </button>

          {isProfileOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg py-1 border border-light"
              style={{ width: "12rem", zIndex: 1000 }}
            >
              {menuOptions.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleMenuClick(item)}
                  className="dropdown-item"
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
