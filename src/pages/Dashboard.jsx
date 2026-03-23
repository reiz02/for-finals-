import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import DailyEarnings from "./DailyEarnings";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const [currentTime, setCurrentTime] = useState(new Date());
  const [reportData, setReportData] = useState({
    dailyEarnings: 0,
    totalGrossIncome: 0,
    dailyHistory: []
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // FETCH DATA FROM SERVER
  const fetchData = useCallback(async () => {
    try {
      const historyRes = await fetch("http://localhost:5000/api/earnings");
      const historyJson = await historyRes.json();
      const todayStr = new Date().toLocaleDateString("en-US");

      // Daily Net Earnings (Income minus Expense)
      const todayNet = historyJson
        .filter(item => new Date(item.date).toLocaleDateString("en-US") === todayStr)
        .reduce((sum, item) => {
          return item.type === "Expense" ? sum - item.amount : sum + item.amount;
        }, 0);

      // Total Gross (All Incomes only)
      const totalGross = historyJson
        .filter(item => item.type !== "Expense")
        .reduce((sum, item) => sum + item.amount, 0);

      setReportData({
        dailyEarnings: todayNet, 
        totalGrossIncome: totalGross,
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

  // Real-time Clock
  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const activeMint = "#57bc90"; 
  const softShadow = "0 4px 20px rgba(0, 0, 0, 0.05)";

  return (
    <div style={{ width: "100%", padding: "25px", backgroundColor: "#fdfdfd", minHeight: "100vh" }}>
      
      {/* 1. MINIMALIST PAGE STATUS BAR (Inalis ang duplicate profile) */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        marginBottom: "30px", backgroundColor: "#fff", padding: "12px 25px",
        borderRadius: "12px", boxShadow: softShadow, border: "1px solid #f0f4f8"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "500", fontSize: "14px" }}>
          <FaCalendarAlt style={{ color: activeMint }} /> 
          {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
          <span style={{ color: "#cbd5e1", margin: "0 8px" }}>|</span>
          <span style={{ color: "#1e293b", fontWeight: "bold" }}>{currentTime.toLocaleTimeString()}</span>
        </div>
        
        <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>
          System Node: <span style={{ color: activeMint }}>Active</span>
        </div>
      </div>

      {/* 2. ANALYTICS CARDS (Emerald Theme) */}
      <div style={{ display: "flex", gap: "25px", marginBottom: "30px" }}>
        {/* Daily Net Card */}
        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "30px", borderRadius: "20px", 
          boxShadow: softShadow, borderBottom: `4px solid ${activeMint}`,
          background: "linear-gradient(to bottom right, #ffffff, #f9fffb)"
        }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", marginBottom: "10px" }}>DAILY NET EARNINGS</div>
          <div style={{ fontSize: "42px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.dailyEarnings.toLocaleString()}</div>
        </div>

        {/* Total Gross Card */}
        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "30px", borderRadius: "20px", 
          boxShadow: softShadow, borderBottom: `4px solid #3b82f6`,
          background: "linear-gradient(to bottom right, #ffffff, #f8faff)"
        }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", marginBottom: "10px" }}>TOTAL GROSS INCOME</div>
          <div style={{ fontSize: "42px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.totalGrossIncome.toLocaleString()}</div>
        </div>
      </div>

      {/* 3. CHART CONTAINER (Interactive Analytics) */}
      <div style={{ 
        backgroundColor: "#fff", padding: "35px", borderRadius: "24px", 
        boxShadow: softShadow, border: "1px solid #f1f5f9" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 style={{ color: "#1e293b", fontWeight: "800", fontSize: "20px", margin: 0 }}>Earnings Analytics</h3>
          <span style={{ fontSize: "12px", padding: "5px 12px", backgroundColor: "#f1f5f9", borderRadius: "20px", color: "#64748b" }}>Real-time Sync</span>
        </div>
        
        <div style={{ width: "100%", height: "350px", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <DailyEarnings data={reportData.dailyHistory || []} />
        </div>
      </div>

      {/* 4. DELETE MODAL */}
      {showDeleteModal && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
          backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", 
          justifyContent: "center", alignItems: "center", zIndex: 9999, 
          backdropFilter: "blur(8px)" 
        }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "24px", width: "400px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <FaExclamationTriangle style={{ fontSize: "50px", color: "#ef4444", marginBottom: "20px" }} />
            <h3 style={{ fontSize: "22px", fontWeight: "900", color: "#1e293b", marginBottom: "10px" }}>Confirm Deletion</h3>
            <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "30px", lineHeight: "1.5" }}>
              Are you sure you want to remove this record? This action will permanently affect your financial history.
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
              <button onClick={() => {/* confirmDelete logic here */}} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", backgroundColor: "#ef4444", color: "white", cursor: "pointer", fontWeight: "600" }}>Delete Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;