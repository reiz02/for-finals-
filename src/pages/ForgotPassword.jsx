import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");  // Added confirmPassword state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "error" });
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
  };

  // Function to validate password
  const isValidPassword = (password) => {
    const minLength = 8; // Minimum length for the password
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/; // Special character regex

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }

    if (!specialCharacterRegex.test(password)) {
      return "Password must contain at least one special character.";
    }

    return null; // Valid password
  };

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

  const resendResetCode = async () => {
    if (resendDisabled) return;
    setResendDisabled(true);
    setResendTimer(30);

    const countdown = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(countdown);
          setResendDisabled(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialog({ show: true, message: "New code has been sent to your email!", type: "success" });
      } else {
        setDialog({ show: true, message: data.error || "Failed to resend code.", type: "error" });
      }
    } catch (err) {
      setDialog({ show: true, message: "Failed to connect to server.", type: "error" });
    }
  };

  const handleReset = async (e) => {
  e.preventDefault();

  // Validate if passwords match
  if (newPassword !== confirmPassword) {
    setDialog({ show: true, message: "Passwords do not match.", type: "error" });
    return; // Stop form submission
  }

  // Validate if password is strong (minimum length and special character)
  const passwordError = isValidPassword(newPassword);
  if (passwordError) {
    setDialog({ show: true, message: passwordError, type: "error" });
    return; // Stop form submission if validation fails
  }

  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        code,
        newPassword,  // Correct field here
        confirmPassword,  // Correct field here
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setDialog({ show: true, message: "Password updated successfully!", type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setDialog({ show: true, message: data.error, type: "error" });
    }
  } catch (err) {
    setDialog({ show: true, message: "Error resetting password.", type: "error" });
  }
  setLoading(false);
};

  return (
    <div className="forgot-password-page">
      <div className="register-container">

        <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>

        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", textAlign: "center" }}>
              Enter your registered email to receive a reset code.
            </p>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={resendResetCode}
              disabled={resendDisabled}
              style={{ padding: "8px 12px" }}
            >
              {resendDisabled ? `Resend (${resendTimer}s)` : "Resend Code"}
            </button>
          </div>
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
    </div>
  );
}

export default ForgotPassword;