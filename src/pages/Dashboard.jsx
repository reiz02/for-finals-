import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaSignOutAlt, FaBox, FaUsers,
  FaChartLine, FaTrash, FaCalendarAlt, FaExclamationTriangle
} from "react-icons/fa";

import StockPage from "./StockPage";
import EmployeePage from "./EmployeePage";
import EmployeeEarnings from "./EmployeeEarnings";
import DailyEarnings from "./DailyEarnings";
import TotalEarningsCard from "./TotalEarningsCard";
import ReportsPage from "./ReportsPage";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = user?.role;
  const section = user?.section;

  const [page, setPage] = useState("dashboard");
  const [interval, setIntervalTime] = useState(new Date());
  const [earnings, setEarnings] = useState("");

  const [reportData, setReportData] = useState({
    dailyEarnings: 0,
    dailyHistory: []
  });
  const [submissions, setSubmissions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]); 
  const [showDateValidationDialog, setShowDateValidationDialog] = useState(false);

  // Fetch report and earnings data
  const fetchData = useCallback(async () => {
    try {
      const historyRes = await fetch("http://localhost:5000/api/earnings");
      const historyJson = await historyRes.json();

      const todayStr = new Date().toLocaleDateString("en-US");

      // Calculate Today's Net Earnings (Income - Expense)
      const todayNet = historyJson
        .filter(item => new Date(item.date).toLocaleDateString("en-US") === todayStr)
        .reduce((sum, item) => {
          return item.type === "Expense" ? sum - item.amount : sum + item.amount;
        }, 0);

      setReportData({
        dailyEarnings: todayNet, 
        dailyHistory: historyJson 
      });

      setSubmissions(historyJson);
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  }, []);

  // Initial login check and data fetch
  useEffect(() => {
    if (isLoggedIn !== "true" || !user) navigate("/");
    else fetchData();
  }, [isLoggedIn, navigate, user, fetchData]);

  // Timer
  useEffect(() => {
    const clock = setInterval(() => {
      setIntervalTime(new Date());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  if (!user || isLoggedIn !== "true") return null;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Submit daily earnings
  const submitEarnings = async () => {
    if (!earnings || isNaN(Number(earnings))) {
      setShowValidationDialog(true);
      return;
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formattedToday = today.toISOString().split("T")[0];
    const formattedYesterday = yesterday.toISOString().split("T")[0];

    if (reportDate !== formattedToday && reportDate !== formattedYesterday) {
      setShowDateValidationDialog(true); 
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          employeeEmail: user.email, 
          amount: Number(earnings),
          date: reportDate
        })
      });

      if (response.ok) {
        setEarnings("");
        await fetchData();
        setPage("reports");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const openDeleteDialog = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/earnings/${selectedId}`, { method: "DELETE" });
      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedId(null);
        await fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const startEdit = (id) => {
    setSubmissions(submissions.map(s =>
      s._id === id ? { ...s, isEditing: true, editAmount: s.amount } : s
    ));
  };

  const cancelEdit = (id) => {
    setSubmissions(submissions.map(s =>
      s._id === id ? { ...s, isEditing: false } : s
    ));
  };

  const saveEdit = async (id, editAmount) => {
    try {
      const response = await fetch(`http://localhost:5000/api/earnings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(editAmount) })
      });
      if (response.ok) {
        setSubmissions(submissions.map(s =>
          s._id === id ? { ...s, amount: Number(editAmount), isEditing: false } : s
        ));
        await fetchData();
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", fontFamily: "sans-serif" }}>
      
      {/* Sidebar - Fix: Width reduced and flex-shrink added */}
      <aside style={{ 
        width: "220px", 
        backgroundColor: "#1f2933", 
        color: "#fff", 
        padding: "30px 20px", 
        display: "flex", 
        flexDirection: "column",
        flexShrink: 0 
      }}>
        <h2 style={{ marginBottom: "30px", fontSize: "16px" }}>Farm Ops</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          <div onClick={() => setPage("dashboard")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: page === "dashboard"? "#4e73df" : "#fff" }}>
            <FaUser /> Dashboard
          </div>
          {role === "admin" && (
            <div onClick={() => setPage("employees")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: page === "employees"? "#4e73df" : "#fff" }}>
              <FaUsers /> Employees
            </div>
          )}
          {(section === "Inventory" || role === "admin") && (
            <div onClick={() => setPage("stock")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: page === "stock"? "#4e73df" : "#fff" }}>
              <FaBox /> Inventory
            </div>
          )}
          <div 
            onClick={() => setPage("reports")} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              cursor: "pointer", 
              color: page === "reports" ? "#4e73df" : "#fff" 
            }}
          >
            <FaChartLine /> Reports
          </div>
          <div onClick={handleLogout} style={{ cursor: "pointer", marginTop: "auto", color: "#ff6b6b", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaSignOutAlt /> Logout
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, backgroundColor: "#f4f6f8", overflowY: "auto", position: "relative" }}>
        
        {/* Header - Fix: Reduced horizontal padding */}
        <header style={{ padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderBottom: "1px solid #e3e6f0" }}>
          <div style={{ fontSize: "16px", color: "#333", fontWeight: "bold" }}>
            Welcome back, {user.firstName || "User"} 
            <span style={{ fontSize: "12px", color: "#888", marginLeft: "10px", textTransform: "uppercase" }}>
              ({role})
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#666", fontSize: "14px" }}>
            <FaCalendarAlt /> {interval.toLocaleDateString()} - {interval.toLocaleTimeString()}
          </div>
        </header>

        {/* Dashboard cards and charts */}
        {page === "dashboard" && (
          <div style={{ padding: "20px" }}>
            
            {/* Top Cards - Fix: Flex Wrap for responsiveness */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
              <div style={{ flex: "1 1 250px", background: "#4e73df", color: "#fff", padding: "25px", borderRadius: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: "bold" }}>DAILY EARNINGS</div>
                <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                  ₱{reportData.dailyEarnings.toLocaleString()}
                </div>
              </div>
              
              {/* Ensure TotalEarningsCard also supports flex sizing */}
              <div style={{ flex: "1 1 250px" }}>
                <TotalEarningsCard />
              </div>
            </div>
            
            {/* Chart Area - Fix: overflow hidden and flex sizing */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div
                style={{
                  flex: 1,
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "10px",
                  minWidth: "0", // CRITICAL for chart resizing
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  overflow: "hidden"
                }}
              >
                <DailyEarnings data={reportData.dailyHistory || []} />
              </div>
            </div>

          </div>
        )}

        {/* Conditional Page Rendering */}
        {page === "employees" && role === "admin" && <EmployeePage />}
        {page === "stock" && (section === "Inventory" || role === "admin") && <StockPage />}
        {page === "reports" && <ReportsPage />}

        {/* Modals */}
        {showDeleteModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
              <FaExclamationTriangle style={{ fontSize: "40px", color: "#f6c23e", marginBottom: "15px" }} />
              <h3>Confirm Deletion</h3>
              <p style={{ color: "#666" }}>This will remove the record. This action cannot be undone.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ padding: "10px 20px", borderRadius: "5px", border: "1px solid #ddd", cursor: "pointer" }}>Cancel</button>
                <button onClick={confirmDelete} style={{ padding: "10px 20px", borderRadius: "5px", border: "none", background: "#ff6b6b", color: "white", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {showValidationDialog && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
              <FaExclamationTriangle style={{ fontSize: "40px", color: "#f6c23e", marginBottom: "15px" }} />
              <h3>Validation Error</h3>
              <p style={{ color: "#666" }}>Please enter a value for daily income.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                <button onClick={() => setShowValidationDialog(false)} style={{ padding: "10px 20px", borderRadius: "5px", border: "1px solid #ddd", cursor: "pointer" }}>OK</button>
              </div>
            </div>
          </div>
        )}

        {showDateValidationDialog && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
              <FaExclamationTriangle style={{ fontSize: "40px", color: "#f6c23e", marginBottom: "15px" }} />
              <h3>Date Validation Error</h3>
              <p style={{ color: "#666" }}>You can only submit a report for today or yesterday.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                <button onClick={() => setShowDateValidationDialog(false)} style={{ padding: "10px 20px", borderRadius: "5px", border: "1px solid #ddd", cursor: "pointer" }}>OK</button>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}

export default Dashboard;