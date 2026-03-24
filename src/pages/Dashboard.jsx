import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaChartLine } from "react-icons/fa";
import DailyEarningsGraph from "./DailyEarningsGraph";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const [currentTime, setCurrentTime] = useState(new Date());
  const [reportData, setReportData] = useState({
    dailyEarnings: 0,
    totalIncome: 0,
    dailyHistory: []
  });

  const fetchData = useCallback(async () => {
    try {
      const historyRes = await fetch("http://localhost:5000/api/earnings");
      if (!historyRes.ok) throw new Error("Failed to fetch data");
      const historyJson = await historyRes.json();
      const todayStr = new Date().toISOString().split('T')[0]; 

      const todayIncome = historyJson
        .filter(item => {
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          return itemDate === todayStr && item.type === "Income";
        })
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      const overallGross = historyJson
        .filter(item => item.type === "Income")
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      setReportData({
        dailyEarnings: todayIncome, 
        totalIncome: overallGross,
        dailyHistory: historyJson 
      });
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn !== "true" || !user) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, [isLoggedIn, navigate, user, fetchData]);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const activeMint = "#57bc90"; 
  const lightGreenBg = "#eefdf5"; // Slightly brighter light green
  const softShadow = "0 2px 10px rgba(0, 0, 0, 0.04)";

  return (
    <div style={{ 
      width: "100%", 
      padding: "15px 25px", 
      background: "transparent", 
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "15px",
        gap: "15px"
      }}>
        {/* TITLE CARD - LIGHT GREEN BACKGROUND */}
        <div style={{ 
          backgroundColor: lightGreenBg, 
          padding: "15px 25px", // Increased padding for better breathing room
          borderRadius: "14px",
          boxShadow: softShadow,
          border: `1px solid #d3f9e8`,
          flex: "1",
          minWidth: "300px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaChartLine style={{ color: activeMint, fontSize: "20px" }} />
            <h2 style={{ 
              margin: 0, 
              fontSize: "20px", // Increased from 16px
              fontWeight: "900", 
              color: "#1e293b",
              letterSpacing: "-0.5px"
            }}>
              Operational Insights
            </h2>
          </div>
          <p style={{ 
            margin: "4px 0 0 0", 
            fontSize: "13px", // Increased from 11px
            color: "#475569", // Darkened slightly for better readability on light green
            fontWeight: "500",
            lineHeight: "1.4"
          }}>
            Monitor your daily performance and overall financial health. Use the data below to track trends and optimize operations.
          </p>
        </div>

        {/* STATUS BAR (DATE & TIME) */}
        <div style={{ 
          display: "flex", alignItems: "center", gap: "10px", 
          backgroundColor: "#fff", padding: "12px 20px",
          borderRadius: "12px", boxShadow: softShadow, border: "1px solid #f1f5f9", 
          color: "#64748b", fontWeight: "600", fontSize: "12px",
          whiteSpace: "nowrap"
        }}>
          <FaCalendarAlt style={{ color: activeMint }} /> 
          {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
          <span style={{ color: "#cbd5e1" }}>|</span>
          <span style={{ color: "#1e293b", fontWeight: "bold" }}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "15px 20px", borderRadius: "14px", 
          boxShadow: softShadow, borderLeft: `4px solid ${activeMint}` 
        }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>DAILY EARNINGS</div>
          <div style={{ fontSize: "26px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.dailyEarnings.toLocaleString()}</div>
        </div>

        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "15px 20px", borderRadius: "14px", 
          boxShadow: softShadow, borderLeft: `4px solid #3b82f6` 
        }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>TOTAL INCOME</div>
          <div style={{ fontSize: "26px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.totalIncome.toLocaleString()}</div>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div style={{ 
        backgroundColor: "#fff", padding: "20px", borderRadius: "16px", 
        boxShadow: softShadow, border: "1px solid #f1f5f9" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ color: "#1e293b", fontWeight: "800", fontSize: "15px", margin: 0 }}>Daily Revenue Trend</h3>
          <span style={{ fontSize: "9px", padding: "3px 8px", backgroundColor: "#f1f5f9", borderRadius: "10px", color: "#64748b", fontWeight: "700" }}>LIVE SYNC</span>
        </div>
        
        <div style={{ width: "100%", height: "260px" }}> 
           <DailyEarningsGraph data={reportData.dailyHistory || []} mintColor={activeMint} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;