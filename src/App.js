import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBoxes, 
  FaSignOutAlt, 
  FaUserShield, 
  FaUserCircle, 
  FaChartLine, 
  FaHistory, 
  FaUsersCog 
} from "react-icons/fa";

// === Pages Imports ===
import Login from "./pages/login"; 
import Register from "./pages/register"; 
import Dashboard from "./pages/Dashboard";
import StockPage from "./pages/StockPage";
import AdminRegister from "./pages/AdminRegister";
import DailyEarnings from "./pages/DailyEarnings";
import ForgotPassword from "./pages/ForgotPassword";
import ReportsPage from "./pages/ReportsPage";
import EmployeePage from "./pages/EmployeePage";

import "./App.css";
import farmerBg from "./assets/gh2.png"; 

// ===========================
// 1. PROTECTED ROUTE LOGIC
// ===========================
const ProtectedRoute = ({ children, allowedRoles, requiredSection = null }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  
  if (!user || isLoggedIn !== "true") return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase();
  const userSection = user.section?.toLowerCase();
  const roles = allowedRoles.map(r => r.toLowerCase());

  const hasRole = roles.includes(userRole);
  const hasSection = !requiredSection || 
                     userRole === "admin" || 
                     userSection === requiredSection.toLowerCase();

  if (!hasRole || !hasSection) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ===========================
// 2. LAYOUT WRAPPER (SIDEBAR & HEADER)
// ===========================
const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const isAuthPage = ["/login", "/", "/register", "/register-admin", "/forgot-password"].includes(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (isAuthPage || !user) return <>{children}</>;

  const userRole = user.role?.toLowerCase();
  const userSection = user.section?.toLowerCase();

  return (
    <div className="system-container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Farm<span>Ops</span></h1>
        </div>
        
        <nav className="nav-links">
          {/* Dashboard: Admin Only */}
          {userRole === "admin" && (
            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
              <FaChartLine /> Dashboard
            </Link>
          )}

          {/* Employees: Admin Only */}
          {userRole === "admin" && (
            <Link to="/employees" className={location.pathname === "/employees" ? "active" : ""}>
              <FaUsersCog /> Employees
            </Link>
          )}

          {/* Inventory: Admin OR Inventory Staff */}
          {(userRole === "admin" || userSection === "inventory") && (
            <Link to="/stock" className={location.pathname === "/stock" ? "active" : ""}>
              <FaBoxes /> Inventory
            </Link>
          )}

          {/* Reports: Admin OR Finance Staff */}
          {(userRole === "admin" || userSection === "finance") && (
            <Link to="/reports" className={location.pathname === "/reports" ? "active" : ""}>
              <FaHistory /> Reports
            </Link>
          )}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="main-content">
        <header className="header">
          <div className="user-profile-header">
            {/* User Icon Based on Role */}
            <div className="header-avatar-box">
              {userRole === "admin" ? 
                <FaUserShield className="header-icon admin-theme" /> : 
                <FaUserCircle className="header-icon employee-theme" />
              }
            </div>

            {/* Information Section: Name, Role, Email */}
            <div className="header-user-details">
              <h2 className="header-full-name">
                {user.firstName} {user.lastName}
              </h2>
              <div className="header-meta-info">
                <span className={`header-role-tag ${userRole}`}>
                  {user.role?.toUpperCase()} • {user.section || "Management"}
                </span>
                <span className="header-email-text">{user.email}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="page-data">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===========================
// 3. MAIN APP COMPONENT
// ===========================
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Persistent Background Elements */}
        <div className="main-bg-image" style={{ backgroundImage: `url(${farmerBg})` }}></div>
        <div className="bg-overlay"></div>

        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-admin" element={<AdminRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* --- PROTECTED ROUTES --- */}
            
            {/* Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Employee Management */}
            <Route path="/employees" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EmployeePage />
              </ProtectedRoute>
            } />

            {/* Inventory / Stock */}
            <Route path="/stock" element={
              <ProtectedRoute allowedRoles={["admin", "employee"]} requiredSection="Inventory">
                <StockPage />
              </ProtectedRoute>
            } />
            
            {/* Finance / Reports */}
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={["admin", "employee"]} requiredSection="Finance">
                <ReportsPage />
              </ProtectedRoute>
            } />

            {/* Earnings Analytics */}
            <Route path="/daily-earnings" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DailyEarnings />
              </ProtectedRoute>
            } />
            
            {/* Redirect any unknown route to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

export default App;