import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import "./aiReport.css"
const AiReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get("/prediction/full-report", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error("AI report error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="container py-4">
        <p className="ai-loading">Analyzing adherence patterns…</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="ai-report-title">AI Prediction Report</h2>

      {report.length === 0 ? (
        <p className="text-muted">No prediction data available.</p>
      ) : (
        report.map((item, i) => (
          <div key={i} className="ai-report-card">
            {/* Header */}
            <div className="ai-report-header">
              <h5>
                {item.medication} ({item.dosage})
              </h5>

              <span
                className={`risk-pill ${item.riskLevel.toLowerCase()}`}
              >
                {item.riskLevel}
              </span>
            </div>

            {/* Time */}
            <p className="text-muted mb-2">
              Scheduled Time: <strong>{item.time}</strong>
            </p>

            {/* Risk */}
            <p className="ai-risk">
              Risk Score: <strong>{item.riskScore}%</strong>
            </p>

            {/* Reasons */}
            <ul className="ai-reasons">
              {item.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default AiReport;
