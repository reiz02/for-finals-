import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ShieldCheck, Info } from "lucide-react";
import "./adminRegister.css";

function AdminRegister() {
  // ==========================================
  // 1. STATES
  // ==========================================
  const [isAdminExists, setIsAdminExists] = useState(false);
  const [checking, setChecking] = useState(true);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Specific Error States
  const [errors, setErrors] = useState({});

  // UI & Security States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [dialog, setDialog] = useState({ show: false, title: "", message: "" });

  const navigate = useNavigate();

  // ==========================================
  // 2. HELPER FUNCTIONS
  // ==========================================
  
  const handleNameChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
    setter(capitalized);
    
    // Clear specific error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleDialogClose = () => {
    setDialog({ ...dialog, show: false });
    if (dialog.title === "Success") {
      navigate("/");
    }
  };

  // ==========================================
  // 3. SIDE EFFECTS
  // ==========================================
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/check-admin?t=${Date.now()}`);
        const data = await response.json();
        setIsAdminExists(data.exists);
      } catch (err) {
        console.error("Connection failed to server.");
      } finally {
        setChecking(false);
      }
    };
    checkSystemStatus();
  }, []);

  // ==========================================
  // 4. STEP 1: SPECIFIC VALIDATION
  // ==========================================
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation Rules
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Field-specific checks
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email format (e.g., name@example.com).";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Must have 8+ chars, 1 uppercase, and 1 number.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match. Please try again.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (response.ok) {
        setShowCodePopup(true);
        setDialog({ show: true, title: "Verification", message: "A 6-digit code has been sent to your email." });
      } else {
        const data = await response.json();
        setDialog({ show: true, title: "Error", message: data.error || "Failed to send verification code." });
      }
    } catch (err) {
      setDialog({ show: true, title: "Error", message: "Server connection failed. Check your network." });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 5. STEP 2: VERIFY
  // ==========================================
  const verifyAndRegisterAdmin = async () => {
    if (verificationCode.length < 6) {
      setDialog({ show: true, title: "Incomplete Code", message: "Please enter the full 6-digit verification code." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          code: verificationCode
        }),
      });

      if (response.ok) {
        setDialog({ show: true, title: "Success", message: "Administrator registered successfully!" });
        setShowCodePopup(false);
      } else {
        const data = await response.json();
        setDialog({ show: true, title: "Error", message: data.error || "The code you entered is incorrect." });
      }
    } catch (err) {
      setDialog({ show: true, title: "Error", message: "An error occurred during account creation." });
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  if (isAdminExists) {
    return (
      <div className="admin-setup-container">
        <div className="admin-card">
          <Lock size={60} color="#ef4444" style={{ marginBottom: "20px" }} />
          <h2>Registration Locked</h2>
          <p>An Administrator account already exists for this system.</p>
          <button onClick={() => navigate("/")} className="admin-btn">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-setup-container">
      <div className="admin-card">
        <ShieldCheck size={40} color="#1d3a2a" style={{ marginBottom: "10px" }} />
        <h2>Admin Registration</h2>
        <p>Set up your System Administrator account</p>

        <div className="validation-info">
          <Info size={18} color="#1d3a2a" />
          <span>Inputs are case-formatted. Security requires a strong password to protect farm data.</span>
        </div>

        <form onSubmit={handleAdminSubmit} noValidate>
          {/* First Name */}
          <div className="input-group">
            <input 
              type="text" 
              placeholder="First Name" 
              className={errors.firstName ? "error-input" : ""}
              value={firstName} 
              onChange={handleNameChange(setFirstName, "firstName")} 
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          {/* Middle Name */}
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Middle Name (Optional)" 
              value={middleName} 
              onChange={handleNameChange(setMiddleName, "middleName")} 
            />
          </div>

          {/* Last Name */}
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Last Name" 
              className={errors.lastName ? "error-input" : ""}
              value={lastName} 
              onChange={handleNameChange(setLastName, "lastName")} 
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>

          {/* Email */}
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Admin Email" 
              className={errors.email ? "error-input" : ""}
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
              }} 
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="input-group">
            <div className={`password-wrapper ${errors.password ? "error-input-wrapper" : ""}`}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create Password" 
                className={errors.password ? "error-input-field" : ""}
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                }} 
              />
              <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <div className={`password-wrapper ${errors.confirmPassword ? "error-input-wrapper" : ""}`}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                className={errors.confirmPassword ? "error-input-field" : ""}
                value={confirmPassword} 
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                }} 
              />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="eye-icon">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? "Processing..." : "Register Administrator"}
          </button>
        </form>
      </div>

      {/* Dialogs */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <button className="admin-btn" onClick={handleDialogClose}>OK</button>
          </div>
        </div>
      )}

      {/* OTP Popup */}
      {showCodePopup && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Verify Identity</h3>
            <p>Please enter the 6-digit code sent to: <br/><strong>{email}</strong></p>
            <input 
              type="text" 
              maxLength={6} 
              className="code-input" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
            />
            <div className="popup-buttons">
              <button onClick={verifyAndRegisterAdmin} className="admin-btn">Verify</button>
              <button onClick={() => setShowCodePopup(false)} className="admin-btn cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRegister;