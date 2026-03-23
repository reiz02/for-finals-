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
    dailyEarnings: 0, // Kabuuang Income ngayong araw
    totalIncome: 0,   // Overall Gross Income (Lahat ng Income entries)
    dailyHistory: []
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // FETCH DATA AND CALCULATE
  const fetchData = useCallback(async () => {
    try {
      const historyRes = await fetch("http://localhost:5000/api/earnings");
      if (!historyRes.ok) throw new Error("Failed to fetch data");
      const historyJson = await historyRes.json();
      
      // Kunin ang petsa ngayon sa format na YYYY-MM-DD para sa accurate filtering
      const todayStr = new Date().toISOString().split('T')[0]; 

      // 1. DAILY EARNINGS (Lahat ng "Income" entries na ang petsa ay NGAYON)
      const todayIncome = historyJson
        .filter(item => {
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          return itemDate === todayStr && item.type === "Income";
        })
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      // 2. TOTAL GROSS / INCOME (Lahat ng "Income" entries sa buong record)
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

  // Real-time Clock logic
  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const activeMint = "#57bc90"; 
  const softShadow = "0 4px 20px rgba(0, 0, 0, 0.05)";

  return (
    <div style={{ width: "100%", padding: "25px", backgroundColor: "#fdfdfd", minHeight: "100vh" }}>
      
      {/* 1. STATUS BAR */}
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

      {/* 2. ANALYTICS CARDS */}
      <div style={{ display: "flex", gap: "25px", marginBottom: "30px" }}>
        
        {/* Daily Earnings Card */}
        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "30px", borderRadius: "20px", 
          boxShadow: softShadow, borderBottom: `4px solid ${activeMint}`,
          background: "linear-gradient(to bottom right, #ffffff, #f9fffb)"
        }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", marginBottom: "10px" }}>DAILY EARNINGS</div>
          <div style={{ fontSize: "42px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.dailyEarnings.toLocaleString()}</div>
        </div>

        {/* Total Gross / Total Income Card */}
        <div style={{ 
          flex: 1, backgroundColor: "#fff", padding: "30px", borderRadius: "20px", 
          boxShadow: softShadow, borderBottom: `4px solid #3b82f6`,
          background: "linear-gradient(to bottom right, #ffffff, #f8faff)"
        }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", marginBottom: "10px" }}>TOTAL GROSS / INCOME</div>
          <div style={{ fontSize: "42px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.totalIncome.toLocaleString()}</div>
        </div>
      </div>

      {/* 3. CHART CONTAINER */}
      <div style={{ 
        backgroundColor: "#fff", padding: "35px", borderRadius: "24px", 
        boxShadow: softShadow, border: "1px solid #f1f5f9" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 style={{ color: "#1e293b", fontWeight: "800", fontSize: "20px", margin: 0 }}>Earnings Analytics</h3>
          <span style={{ fontSize: "12px", padding: "5px 12px", backgroundColor: "#f1f5f9", borderRadius: "20px", color: "#64748b" }}>Real-time Sync</span>
        </div>
        
        <div style={{ width: "100%", height: "350px", display: "flex", alignItems: "center", justifyContent: "center" }}>
           {/* Sinisiguradong may data bago i-render ang chart */}
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
              <button style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", backgroundColor: "#ef4444", color: "white", cursor: "pointer", fontWeight: "600" }}>Delete Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;