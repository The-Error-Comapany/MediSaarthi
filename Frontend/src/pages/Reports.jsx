import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import "./report.css";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);



const getSunday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const dateKey = (d) =>
  new Date(d).toLocaleDateString("en-CA");

const getMonthDays = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: last }, (_, i) =>
    dateKey(new Date(y, m, i + 1))
  );
};


const formatDayDetails = (day) => {
  if (!day || (day.taken.length === 0 && day.missed.length === 0)) {
    return "No medicines on this day.";
  }

  let text = "";

  if (day.taken.length) {
    text += "TAKEN:\n";
    day.taken.forEach(m => {
      text += `• ${m.name} at ${m.time}\n`;
    });
    text += "\n";
  }

  if (day.missed.length) {
    text += "MISSED:\n";
    day.missed.forEach(m => {
      text += `• ${m.name} at ${m.time}\n`;
    });
  }

  return text;
};


const Reports = () => {
  const [tab, setTab] = useState("weekly");
  const [weekStart, setWeekStart] = useState(getSunday(new Date()));
  const [monthDate, setMonthDate] = useState(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    fetchData();
  
  }, [tab, weekStart, monthDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = "";

      if (tab === "weekly") {
        url = `/reports/weekly?start=${weekStart.toISOString()}`;
      }
      if (tab === "monthly") {
        url = `/reports/monthly?month=${monthDate.toISOString()}`;
      }
      if (tab === "history") {
        url = `/reports/history`;
      }

      const res = await api.get(url);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <h1 className="title">Adherence Reports</h1>

      <div className="tabs">
        <button onClick={() => setTab("weekly")} className={tab==="weekly"?"active":""}>Weekly</button>
        <button onClick={() => setTab("monthly")} className={tab==="monthly"?"active":""}>Monthly</button>
        <button onClick={() => setTab("history")} className={tab==="history"?"active":""}>History</button>
      </div>

      {tab === "weekly" && (
        <div className="nav">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))}>◀ Prev Week</button>
          <span>
            {weekStart.toLocaleDateString("en-IN")} –{" "}
            {addDays(weekStart, 6).toLocaleDateString("en-IN")}
          </span>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Next Week ▶</button>
        </div>
      )}

      {tab === "monthly" && (
        <div className="nav">
          <button onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()-1, 1))}>◀ Prev Month</button>
          <span>{monthDate.toLocaleString("en-IN",{month:"long",year:"numeric"})}</span>
          <button onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1))}>Next Month ▶</button>
        </div>
      )}

      {loading && <p className="center">Loading…</p>}

      {!loading && data && (
        <div className="charts">
          {tab === "weekly" && <Weekly data={data} weekStart={weekStart} setPopup={setPopup} />}
          {tab === "monthly" && <Monthly data={data} monthDate={monthDate} setPopup={setPopup} />}
          {tab === "history" && <History data={data} />}
        </div>
      )}

      {popup && (
        <div className="popup">
          <div className="popup-card">
            <h3>{popup.title}</h3>
            <pre>{popup.body}</pre>
            <button onClick={() => setPopup(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
const Weekly = ({ data, weekStart, setPopup }) => {
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i)
  );

  const daily = {};
  days.forEach(d => {
    const k = dateKey(d);
    daily[k] = data.daily?.[k] || { taken: [], missed: [] };
  });

  const totalTaken = Object.values(daily).reduce((s,d)=>s+d.taken.length,0);
  const totalMissed = Object.values(daily).reduce((s,d)=>s+d.missed.length,0);

  if (totalTaken + totalMissed === 0) {
    return <div className="empty">You did not have medicines this week</div>;
  }

  return (
    <>
      <div className="card">
        <h3>Weekly Adherence</h3>
        <Pie
          data={{
            labels:["Taken","Missed"],
            datasets:[{
              data:[totalTaken,totalMissed],
              backgroundColor:["#16a34a","#dc2626"],
              hoverBackgroundColor:["#15803d","#b91c1c"]
            }]
          }}
        />
        <p className="percent">
          Adherence: {Math.round((totalTaken/(totalTaken+totalMissed))*100)}%
        </p>
      </div>

      <div className="card">
        <h3>Daily Medication Activity</h3>
        <Line
          data={{
            labels: days.map(d =>
              d.toLocaleDateString("en-IN", { weekday:"short", day:"2-digit" })
            ),
            datasets:[
              {
                label:"Taken",
                data:days.map(d=>daily[dateKey(d)].taken.length),
                borderColor:"#16a34a",
                backgroundColor:"#16a34a",
                tension:0.4
              },
              {
                label:"Missed",
                data:days.map(d=>daily[dateKey(d)].missed.length),
                borderColor:"#dc2626",
                backgroundColor:"#dc2626",
                tension:0.4
              }
            ]
          }}
          options={{
            onClick:(_,els)=>{
              if(!els.length) return;
              const d = days[els[0].index];
              setPopup({
                title: d.toDateString(),
                body: formatDayDetails(daily[dateKey(d)])
              });
            }
          }}
        />
      </div>
    </>
  );
};
const Monthly = ({ data, monthDate, setPopup }) => {
  const days = getMonthDays(monthDate);

  if (!data.daily || Object.keys(data.daily).length === 0) {
    return <div className="empty">You did not have medicines in this month</div>;
  }

  return (
    <div className="card">
      <h3>Monthly Performance</h3>
      <Bar
        data={{
          labels: days,
          datasets: [
            {
              label: "Taken",
              data: days.map(d => data.daily[d]?.taken.length || 0),

              backgroundColor: "green",

              borderRadius: 6
            }
          ]
        }}
        options={{
          onClick: (_, els) => {
            if (!els.length) return;
            const d = days[els[0].index];
            setPopup({
              title: `Details for ${d}`,
              body: formatDayDetails(data.daily[d])
            });
          }
        }}
      />
    </div>
  );
};

const History = ({ data }) => {
  if (!data || !data.monthlyAdherence || !data.yearlyAdherence) {
    return <div className="empty">No history data available</div>;
  }

  return (
    <>
      <div className="card">
        <h3>Monthly Adherence Trend</h3>
        <Line
          data={{
            labels: Object.keys(data.monthlyAdherence),
            datasets: [
              {
                label: "Adherence %",
                data: Object.values(data.monthlyAdherence),
                borderColor: "#0ea5e9",
                backgroundColor: "#0ea5e9",
                tension: 0.4,
              },
            ],
          }}
        />
      </div>

      <div className="card">
        <h3>Yearly Adherence Trend</h3>
        <Line
          data={{
            labels: Object.keys(data.yearlyAdherence),
            datasets: [
              {
                label: "Adherence %",
                data: Object.values(data.yearlyAdherence),
                borderColor: "#9333ea",
                backgroundColor: "#9333ea",
                tension: 0.4,
              },
            ],
          }}
        />
      </div>
    </>
  );
};



export default Reports;