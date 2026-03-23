import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "error" });

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ show: false, message: "", type: "error" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setDialog({ show: true, message: "Please fill all required fields.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 1. I-save ang user info sa localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        setDialog({ show: true, message: "Login successful!", type: "success" });

        // 2. DYNAMIC ROLE & SECTION NAVIGATION
        setTimeout(() => {
          const userRole = data.user.role?.toLowerCase();
          const userSection = data.user.section?.toLowerCase();

          if (userRole === "admin") {
            navigate("/dashboard");
          } else if (userRole === "employee") {
            // Check section for Employee
            if (userSection === "finance") {
              navigate("/reports");
            } else if (userSection === "inventory") {
              navigate("/stock");
            } else {
              // Fallback kung approved pero walang section
              navigate("/login");
              setDialog({ show: true, message: "Section not assigned. Contact Admin.", type: "error" });
            }
          } else {
            navigate("/login");
          }
        }, 1200);

      } else {
        setDialog({ show: true, message: data.error || "Login failed", type: "error" });
      }
    } catch (err) {
      setDialog({ show: true, message: "Server connection error. Is the backend running?", type: "error" });
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        
        {/* Header Section */}
        <div className="login-header">
          <h1 className="brand-logo">Farm<span>Ops</span></h1>
          <h2>Login</h2>
          <p className="subtitle">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Group */}
          <div className="input-group" style={{ animationDelay: "0.1s" }}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password Group */}
          <div className="input-group" style={{ animationDelay: "0.2s" }}>
            <label htmlFor="password">Password</label>
            <div className="password-field-container">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="footer-links" style={{ textAlign: "right", marginTop: "0", animationDelay: "0.3s" }}>
            <Link 
              to="/forgot-password" 
              style={{ color: "#438a5e", textDecoration: "none", fontSize: "12px", fontWeight: "600" }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading} 
            style={{ animationDelay: "0.4s" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Footer */}
        <p className="footer-text" style={{ animationDelay: "0.5s" }}>
          Don't have an account? 
          <Link to="/register" className="register-link"> Register here</Link>
        </p>

        {/* Dialog Modal for Success/Error */}
        {dialog.show && (
          <div className="dialog-overlay">
            <div className="dialog-box">
              <h3 style={{ color: dialog.type === "error" ? "#ef4444" : "#438a5e", marginBottom: "10px" }}>
                {dialog.type === "error" ? "Error" : "Success"}
              </h3>
              <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "20px" }}>{dialog.message}</p>
              <button 
                onClick={closeDialog} 
                className="login-btn" 
                style={{ marginTop: "0", opacity: 1, transform: "none", animation: "none" }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;