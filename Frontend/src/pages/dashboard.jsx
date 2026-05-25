import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "./dashboard.css";
import { AuthContext } from "../context/AuthContext.jsx";
import ChatBotIcon from "./ChatBotIcon.jsx";

const getWeekStart = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T");
};
const getWeekDays = (dateStr) => {
  const current = new Date(dateStr);
  const sunday = new Date(current);
  const day = current.getDay();
  sunday.setDate(current.getDate() - day);
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [doses, setDoses] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [stats, setStats] = useState({ adherence: 0, taken: 0, missed: 0 });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState({});

  const [aiSummary, setAiSummary] = useState(null);

const normalizeDate = (date) =>
  new Date(date).toLocaleDateString("en-CA");

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const weekStart = getWeekStart(selectedDate);

      const res = await api.get(`/doselog/stats?start=${weekStart}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(res.data.data || { adherence: 0, taken: 0, missed: 0 });
    } catch (err) {
      console.error("Error refreshing stats:", err);
    }
  };

  const fetchAiSummary = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    const res = await api.get("/prediction/summary", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setAiSummary(res.data);
  } catch (err) {
    console.error("AI summary error:", err);
  }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const weekStart = getWeekStart(selectedDate)
        const [medRes, logRes, statRes] = await Promise.all([
          api.get("/medications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/doselog", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/doselog/stats?start=${weekStart}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),

        ]);

        setDoses(medRes.data.data || []);
        setDoseLogs(logRes.data.data || []);
        setStats(statRes.data.data || { adherence: 0, taken: 0, missed: 0 });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Filter doses for selected date
  const filteredDoses = doses.filter((dose) => {
    const start = new Date(dose.startDate);
    const end = dose.endDate ? new Date(dose.endDate) : null;
    const selected = new Date(selectedDate);
    const inRange = end ? selected >= start && selected <= end : selected >= start;

    if (!inRange) return false;
    if (dose.frequency === "daily") return true;
    if (dose.frequency === "weekly") {
      const diffDays = Math.floor((selected - start) / (1000 * 60 * 60 * 24));
      return diffDays % 7 === 0;
    }
    return false;
  });

 

useEffect(() => {
  if (!loading) {
    fetchAiSummary();
    fetchStats();
  }
}, [loading, selectedDate, doseLogs]);

  // Get dose status
  const getDoseStatus = (medId, time) => {
    const log = doseLogs.find(
      (l) =>
        String(l.medicationId) === String(medId) &&
        normalizeDate(l.date) === selectedDate &&
        l.time === time
    );
    return log ? log.status : null;
  };

  // Log dose
  const handleDoseLog = async (medicationId, time, newStatus) => {
    const key = `${medicationId}-${time}`;
    setLogging((prev) => ({ ...prev, [key]: true }));

    try {
      const token = localStorage.getItem("accessToken");

      const existingLog = doseLogs.find(
        (l) =>
          String(l.medicationId) === String(medicationId) &&
          normalizeDate(l.date) === selectedDate &&
          l.time === time
      );

      if (existingLog) {
        await api.patch(
          `/doselog/${existingLog._id}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDoseLogs((prev) =>
          prev.map((l) =>
            l._id === existingLog._id ? { ...l, status: newStatus } : l
          )
        );
      } else {
        const res = await api.post(
          "/doselog",
          { medicationId, date: selectedDate, time, status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDoseLogs((prev) => [...prev, res.data.data]);
      }

      await fetchStats();
      await fetchAiSummary();
    } catch (err) {
      console.error("Error logging dose:", err);
    } finally {
      setLogging((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getButtonClass = (currentStatus, buttonType) => {
    if (currentStatus === buttonType) {
      return buttonType === "taken" ? "bg-success" : "bg-danger";
    }
    return "bg-secondary";
  };

  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="container py-4" id="dashboardContent">
      {/* 🌟 Premium Integrated Welcome Header */}
      <div className="welcome-banner p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
          <div className="welcome-left">
            <span className="welcome-tag">HEALTH INSIGHTS</span>
            <h1 className="welcome-title mt-1">Hi, {user?.name || "User"}</h1>
            <p className="welcome-desc mt-1">
              Your adherence score is at <strong className="glow-text">{stats.adherence}%</strong> this week.
            </p>
          </div>
          
          <div className="welcome-right d-flex align-items-center gap-3">
            <div className="adherence-ring-box">
              <svg className="adherence-ring" viewBox="0 0 80 80">
                <circle className="ring-track" cx="40" cy="40" r="34" />
                <circle
                  className="ring-progress"
                  cx="40"
                  cy="40"
                  r="34"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - (stats.adherence || 0) / 100)}`}
                />
                <text x="50%" y="55%" className="ring-percentage" textAnchor="middle">
                  {stats.adherence}%
                </text>
              </svg>
            </div>
            <div className="stats-mini-summary d-none d-sm-block">
              <div className="mini-item">
                <span className="mini-label">Doses Taken</span>
                <span className="mini-val taken">{stats.taken}</span>
              </div>
              <div className="mini-item mt-1">
                <span className="mini-label">Doses Missed</span>
                <span className="mini-val missed">{stats.missed}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seamless Navigation Button inside Greeting */}
        <div className="banner-footer-action mt-3 pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
          <span className="action-text text-muted">Weekly Summary Status</span>
          <button className="btn-detailed-report" onClick={() => navigate("/app/reports")}>
            <i className="bi bi-bar-chart-fill me-2"></i> View Detailed Report
          </button>
        </div>
      </div>

      {/* 🔮 AI Prediction Banner */}
      {aiSummary && (
        <div
          className={`ai-summary-card ${aiSummary.overallRisk} mb-4`}
          onClick={() => navigate("/app/ai-report")}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="ai-icon">⚡</span>
              <div>
                <strong>AI Adherence Prediction</strong>
                <div className="ai-msg text-muted mt-0.5">{aiSummary.message}</div>
              </div>
            </div>
            <i className="bi bi-chevron-right text-primary"></i>
          </div>
        </div>
      )}

      {/* Row containing left column (Weekly Timeline Calendar) and right column (Doses Timeline) for Laptop & Tablet grids */}
      {/* 📅 Full-Width Premium Week Calendar Strip & Date Picker Row */}
      <div className="calendar-strip-section p-4 mb-4 glass-panel">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <h5 className="section-subtitle mb-0">
            <i className="bi bi-calendar-week me-2 text-primary"></i> Timeline Calendar
          </h5>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <input
              type="date"
              className="form-control form-control-sm elegant-datepicker me-2"
              style={{ width: "160px" }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button className="btn-add-med-pill" onClick={() => navigate("/app/schedule")}>
              <i className="bi bi-plus-lg me-1"></i> Add Medication
            </button>
          </div>
        </div>

        {/* The 7-Day Interactive Row */}
        <div className="week-strip d-flex justify-content-between gap-2 overflow-auto py-2">
          {weekDays.map((day) => {
            const dStr = day.toISOString().split("T")[0];
            const isSelected = dStr === selectedDate;
            const isToday = day.toDateString() === new Date().toDateString();
            const dayNum = day.getDate();
            const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
            
            return (
              <button
                key={dStr}
                className={`week-day-btn flex-grow-1 ${isSelected ? "active" : ""} ${isToday ? "today" : ""}`}
                style={{ minWidth: "55px", maxWidth: "100px" }}
                onClick={() => setSelectedDate(dStr)}
              >
                <span className="week-day-name">{dayName}</span>
                <span className="week-day-number">{dayNum}</span>
                {isToday && <span className="today-dot"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 💊 Full-Width Premium Grid of Doses */}
      <div className="doses-section glass-panel p-4 mb-4">
        <h5 className="section-subtitle mb-4">
          <i className="bi bi-activity me-2 text-success"></i> Doses for {selectedDate}
        </h5>

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted justify-content-center py-5">
            <span className="spinner-border spinner-border-sm" role="status"></span>
            <span>Loading schedule...</span>
          </div>
        ) : filteredDoses.length === 0 ? (
          <div className="text-center text-muted py-5 empty-timeline">
            <i className="bi bi-shield-check fs-1 text-opacity-30 text-success d-block mb-3"></i>
            <span>No medicines scheduled for this date.</span>
          </div>
        ) : (
          <>
            {/* 🖥️ LAPTOP & TABLET VIEW: Premium Card Grid */}
            <div className="d-none d-md-grid doses-grid">
              {filteredDoses.flatMap((dose) =>
                dose.times.map((time) => {
                  const doseStatus = getDoseStatus(dose._id, time);
                  const key = `${dose._id}-${time}`;
                  const isTaken = doseStatus === "taken";
                  const isMissed = doseStatus === "missed";
                  const displayStatus = doseStatus ? doseStatus.toUpperCase() : "PENDING";
                  
                  return (
                    <div key={key} className={`dose-card ${doseStatus || "pending"}`}>
                      <div className="dose-card-header">
                        <span className="dose-time-badge">
                          <i className="bi bi-clock me-1"></i> {time}
                        </span>
                        <span className={`dose-status-label ${doseStatus || "pending"}`}>
                          {displayStatus}
                        </span>
                      </div>

                      <div className="dose-card-body">
                        <div className="dose-med-icon-box">
                          <i className="bi bi-capsule"></i>
                        </div>
                        <div className="dose-med-info">
                          <h4 className="dose-med-title">{dose.name}</h4>
                          <span className="dose-qty-tag">{dose.dosage}</span>
                        </div>
                      </div>
                      
                      <div className="dose-card-actions">
                        <button
                          className={`dose-action-btn check-btn ${isTaken ? "active" : ""}`}
                          disabled={logging[key]}
                          onClick={() => handleDoseLog(dose._id, time, "taken")}
                          title="Mark as Taken"
                        >
                          <i className="bi bi-check-circle-fill me-2"></i>
                          <span>Taken</span>
                        </button>
                        <button
                          className={`dose-action-btn cross-btn ${isMissed ? "active" : ""}`}
                          disabled={logging[key]}
                          onClick={() => handleDoseLog(dose._id, time, "missed")}
                          title="Mark as Missed"
                        >
                          <i className="bi bi-x-circle-fill me-2"></i>
                          <span>Missed</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 📱 MOBILE VIEW: Connected Vertical Timeline (ONLY for screens < 768px) */}
            <div className="d-block d-md-none timeline-track-wrapper">
              <div className="timeline-vertical-line"></div>
              
              {filteredDoses.flatMap((dose) =>
                dose.times.map((time) => {
                  const doseStatus = getDoseStatus(dose._id, time);
                  const key = `${dose._id}-${time}`;
                  const isTaken = doseStatus === "taken";
                  const isMissed = doseStatus === "missed";
                  
                  return (
                    <div key={key} className={`timeline-node-row ${doseStatus || "pending"}`}>
                      {/* Glowing status circle node */}
                      <div className="timeline-node-point">
                        <div className="timeline-node-glow"></div>
                        <div className="timeline-node-dot"></div>
                      </div>

                      {/* Timeline Card details */}
                      <div className="timeline-node-card d-flex justify-content-between align-items-center">
                        <div className="node-info">
                          <div className="node-med-title">{dose.name}</div>
                          <div className="node-med-details text-muted mt-1">
                            <span className="qty-tag me-2">{dose.dosage}</span>
                            <span className="time-tag"><i className="bi bi-clock me-1"></i> {time}</span>
                          </div>
                        </div>
                        
                        {/* Responsive Mini Actions */}
                        <div className="node-actions-strip d-flex gap-2">
                          <button
                            className={`node-badge-btn check-btn ${isTaken ? "active" : ""}`}
                            disabled={logging[key]}
                            onClick={() => handleDoseLog(dose._id, time, "taken")}
                            title="Mark as Taken"
                          >
                            <i className="bi bi-check-lg"></i>
                            <span className="ms-1">Taken</span>
                          </button>
                          <button
                            className={`node-badge-btn cross-btn ${isMissed ? "active" : ""}`}
                            disabled={logging[key]}
                            onClick={() => handleDoseLog(dose._id, time, "missed")}
                            title="Mark as Missed"
                          >
                            <i className="bi bi-x-lg"></i>
                            <span className="ms-1">Missed</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <ChatBotIcon />
    </div>
  );
};

export default Dashboard;
