import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./register.css";

function Register() {
  // --- FORM STATES ---
  const [firstName, setFname] = useState("");
  const [middleName, setMname] = useState("");
  const [lastName, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  const [section, setSection] = useState("");

  // --- UI STATES ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodePopup, setShowCodePopup] = useState(false);
  
  // --- DIALOG STATE ---
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
    type: "info" 
  });

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
  };

  // --- STEP 1: REQUEST VERIFICATION CODE ---
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!firstName || !lastName || !email || !password || !confirmPassword || !section) {
    setDialog({
      show: true,
      title: "Error",
      message: "Please fill out all required fields.",
      type: "error"
    });
    return;
  }

  if (password !== confirmPassword) {
    setDialog({
      show: true,
      title: "Error",
      message: "Passwords do not match!",
      type: "error"
    });
    return;
  }

  // Special character validation
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharRegex.test(password)) {
    setDialog({
      show: true,
      title: "Error",
      message: "Password must contain at least one special character.",
      type: "error"
    });
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });

    const data = await response.json();

    if (response.ok) {
      setShowCodePopup(true);
      setDialog({
        show: true,
        title: "Verification Sent",
        message: "A verification code has been sent to your email.",
        type: "success"
      });
    } else {
      setDialog({
        show: true,
        title: "Error",
        message: data.error || "Failed to send verification code.",
        type: "error"
      });
    }
  } catch (err) {
    setDialog({
      show: true,
      title: "Server Error",
      message: "Could not connect to the server.",
      type: "error"
    });
  } finally {
    setLoading(false);
  }
};

  // --- RESEND OTP LOGIC ---
  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      if (response.ok) {
        setDialog({
          show: true,
          title: "Success",
          message: "A new code has been sent successfully.",
          type: "success"
        });
      }
    } catch (err) {
      setDialog({ show: true, title: "Error", message: "Failed to resend code.", type: "error" });
    } finally {
      setResendLoading(false);
    }
  };

  // --- STEP 2: VERIFY CODE AND COMPLETE REGISTRATION ---
  const verifyAndRegister = async () => {
    if (!verificationCode) {
      setDialog({ show: true, title: "Error", message: "Please enter the code.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          section,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setDialog({
          show: true,
          title: "Success",
          message: "Account created! Please wait for admin approval.",
          type: "success"
        });
        setShowCodePopup(false);
        setTimeout(() => { navigate("/"); }, 3000);
      } else {
        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Incorrect verification code.",
          type: "error"
        });
      }
    } catch (err) {
      setDialog({ show: true, title: "Error", message: "Problem saving account.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Ginawang 'login-container' ang class para makuha ang sakto mong design sa Login page */}
      <div className="login-container register-container">
        
        {/* Header Section */}
        <div className="login-header">
          <h1 className="brand-logo">Farm<span>Ops</span></h1>
          <h2>Employee Registration</h2>
          <p className="subtitle">All new employees must wait for approval</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Row - Compact para sa First at Last Name */}
          <div className="input-row">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFname(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLname(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Middle Name (Optional)</label>
            <input
              type="text"
              placeholder="Optional"
              value={middleName}
              onChange={(e) => setMname(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Assigned Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            >
              <option value="" disabled hidden>Select Section</option>
              <option value="Inventory">Inventory Section</option>
              <option value="Finance">Finance Section</option>
            </select>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-field-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPass(e.target.value)}
                required
              />
              <button 
                type="button"
                className="eye-icon-trigger"
                onClick={() => setShowPassword(!showPassword)}
              >
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="password-field-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
              <button 
                type="button"
                className="eye-icon-trigger"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
      
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/" className="register-link">Login here</Link>
        </p>

        {/* Dialogs remain functional but will follow the new CSS */}
        {dialog.show && (
          <div className="dialog-overlay">
            <div className="dialog-box">
              <h3 className={dialog.type}>{dialog.title}</h3>
              <p>{dialog.message}</p>
              <button onClick={closeDialog} className="login-btn">OK</button>
            </div>
          </div>
        )}

        {showCodePopup && (
          <div className="dialog-overlay">
            <div className="dialog-box verification-popup">
              <h3>Email Verification</h3>
              <p>Enter the 6-digit code sent to your email.</p>
              
              <input
                type="text"
                placeholder="######"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="otp-input-field"
              />

              <div className="popup-actions">
                <button onClick={verifyAndRegister} className="login-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Register"}
                </button>
                <button onClick={handleResendCode} disabled={resendLoading} className="resend-btn">
                  {resendLoading ? "Resending..." : "Resend Code"}
                </button>
                <button onClick={() => setShowCodePopup(false)} className="cancel-link-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;