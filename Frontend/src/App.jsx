import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/dashboard";
import Schedule from "./pages/Schedule";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import HorizontalLayout from "./Components/HorizontalLayout";
import ChatBot from "./pages/ChatBot.jsx";
import AiReport from "./pages/AiReport.jsx";



const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/signin"
          element={!user ? <Register /> : <Navigate to="/app/dashboard" />}
        />

        <Route
          path="/signup"
          element={!user ? <Register /> : <Navigate to="/app/dashboard" />}
        />

        <Route
          path="/app"
          element={user ? <HorizontalLayout /> : <Navigate to="/" replace />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="ai-report" element={<AiReport />} /> 
          <Route path="chatbot" element={<ChatBot />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="text-center p-10">
              <h2 className="text-3xl font-bold text-red-500">
                404 - Page Not Found
              </h2>
              <p className="text-gray-600 mt-2">
                Please check the URL and try again.
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
