import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = Email Input, 2 = Code & New Pass Input
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "error" });

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
  };

  // STEP 1: Send Request to Backend
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialog({ show: true, message: "Reset code sent to your email!", type: "success" });
        setStep(2);
      } else {
        setDialog({ show: true, message: data.error, type: "error" });
      }
    } catch (err) {
      setDialog({ show: true, message: "Failed to connect to server.", type: "error" });
    }
    setLoading(false);
  };

  // STEP 2: Verify Code and Update Password
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          code, 
          newPassword 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialog({ show: true, message: "Password updated successfully!", type: "success" });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setDialog({ show: true, message: data.error, type: "error" });
      }
    } catch (err) {
      setDialog({ show: true, message: "Error resetting password.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
      
      {step === 1 ? (
        <form onSubmit={handleSendCode}>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", textAlign: "center" }}>
            Enter your registered email to receive a reset code.
          </p>
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="example@gmail.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <label>Verification Code</label>
          <input 
            type="text" 
            placeholder="6-digit code"
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            required 
          />
          <label>New Password</label>
          <input 
            type="password" 
            placeholder="Enter new password"
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <Link to="/login" style={{ textDecoration: "none", fontSize: "14px", color: "#2563eb" }}>
          Back to Login
        </Link>
      </div>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className={`dialog-box ${dialog.type}`}>
            <h3>{dialog.type === "error" ? "Error" : "Success"}</h3>
            <p>{dialog.message}</p>
            <button onClick={closeDialog}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;