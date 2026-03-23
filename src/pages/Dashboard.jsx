import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
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

      // 1. DAILY NET EARNINGS (Income records today)
      const todayIncome = historyJson
        .filter(item => {
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          return itemDate === todayStr && item.type === "Income";
        })
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      // 2. TOTAL GROSS INCOME (All Income records)
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

  const activeMint = "#57bc90"; // Emerald Green
  const softShadow = "0 4px 20px rgba(0, 0, 0, 0.05)";

  return (
    <div style={{ 
      width: "100%", 
      padding: "20px", 
      background: "transparent", 
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      {/* STATUS BAR */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        marginBottom: "20px", backgroundColor: "#fff", padding: "12px 20px",
        borderRadius: "12px", boxShadow: softShadow, border: "1px solid #f1f5f9", width: "fit-content"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>
          <FaCalendarAlt style={{ color: activeMint }} /> 
          {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
          <span style={{ color: "#cbd5e1" }}>|</span>
          <span style={{ color: "#1e293b", fontWeight: "bold" }}>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
        
        {/* Daily Net Earnings Card */}
        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "20px", 
          boxShadow: softShadow, borderBottom: `5px solid ${activeMint}` 
        }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", marginBottom: "8px" }}>DAILY EARNINGS</div>
          <div style={{ fontSize: "38px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.dailyEarnings.toLocaleString()}</div>
        </div>

        {/* Total Gross Income Card */}
        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "20px", 
          boxShadow: softShadow, borderBottom: `5px solid #3b82f6` 
        }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", marginBottom: "8px" }}>TOTAL / GROSS INCOME</div>
          <div style={{ fontSize: "38px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.totalIncome.toLocaleString()}</div>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div style={{ 
        backgroundColor: "#fff", padding: "30px", borderRadius: "24px", 
        boxShadow: softShadow, border: "1px solid #f1f5f9" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ color: "#1e293b", fontWeight: "800", fontSize: "18px", margin: 0 }}>Daily Performance</h3>
          <span style={{ fontSize: "10px", padding: "5px 12px", backgroundColor: "#f1f5f9", borderRadius: "20px", color: "#64748b", fontWeight: "700" }}>LIVE SYNC</span>
        </div>
        
        <div style={{ width: "100%" }}>
           <DailyEarningsGraph data={reportData.dailyHistory || []} mintColor={activeMint} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;