import React, { useState, useEffect, useCallback } from "react";

const EmployeeEarnings = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [amount, setAmount] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]); // default today
  const [submissions, setSubmissions] = useState([]);

  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const fetchSubmissions = useCallback(async () => {
    if (!user.email) return;
    try {
      const res = await fetch("http://localhost:5000/api/earnings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const userSubmissions = data.filter(item => item.employeeEmail === user.email);
      setSubmissions(userSubmissions);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  }, [user.email]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Check if the selected date is today or yesterday
  const validateDate = () => {
    const selected = new Date(reportDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Reset time for comparison
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (selected.getTime() === today.getTime() || selected.getTime() === yesterday.getTime()) {
      return true;
    }
    setValidationMessage("You can only submit a report for today or yesterday.");
    setShowValidationDialog(true);
    return false;
  };

  const handleValidationCheck = () => {
    if (!amount || isNaN(Number(amount))) {
      setValidationMessage("Please enter a valid earnings amount.");
      setShowValidationDialog(true);
      return false;
    }
    if (!validateDate()) return false;
    setShowConfirmDialog(true);
    return true;
  };

  const submit = async () => {
    setShowConfirmDialog(false);
    try {
      const response = await fetch("http://localhost:5000/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  employeeEmail: user.email,
  amount: Number(amount),
  date: reportDate,

  // NEW
  description: "Employee submission",
  type: "Income",
  encodedBy: user.email,
  role: user.role,

  timestamp: new Date().toISOString()
})
      });

      if (response.ok) {
        setAmount("");
        await fetchSubmissions();
        setShowSuccessDialog(true);
      } else {
        setValidationMessage("Failed to submit earnings.");
        setShowValidationDialog(true);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setValidationMessage("Error connecting to server.");
      setShowValidationDialog(true);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Submit Earnings</h2>
      <p style={{ color: "#666" }}>Welcome, {user.firstName || user.email}</p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Enter earnings"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginRight: "10px" }}
        />
        <input
          type="date"
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]} // cannot pick future
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginRight: "10px" }}
        />
        <button 
          onClick={handleValidationCheck} 
          style={{ 
            padding: "8px 20px", 
            backgroundColor: "#2563eb", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Submit
        </button>
      </div>

      {/* Validation Dialog */}
      {showValidationDialog && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "25px", borderRadius: "12px",
            width: "400px", maxWidth: "90%", textAlign: "center",
            boxShadow: "0 12px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginBottom: "15px", color: "#f6c23e" }}>Validation Error</h3>
            <p style={{ color: "#333", fontSize: "14px", marginBottom: "25px" }}>
              {validationMessage}
            </p>
            <button
              onClick={() => setShowValidationDialog(false)}
              style={{
                padding: "10px 25px", backgroundColor: "#2563eb",
                color: "white", border: "none", borderRadius: "6px",
                cursor: "pointer", fontWeight: "bold"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "25px", borderRadius: "12px",
            width: "400px", maxWidth: "90%", textAlign: "center",
            boxShadow: "0 12px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginBottom: "15px", color: "#2563eb" }}>Confirm Submission</h3>
            <p style={{ 
              color: "#d93025",
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "25px"
            }}>
              Are you sure you want to submit this report for {new Date(reportDate).toLocaleDateString()}?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  padding: "10px 20px", borderRadius: "6px", border: "1px solid #9e9494ff",
                  background: "white", color: "black", cursor: "pointer", fontWeight: "bold"
                }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                style={{
                  padding: "10px 20px", borderRadius: "6px", border: "none",
                  backgroundColor: "#2563eb", color: "white", cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "25px", borderRadius: "12px",
            width: "400px", maxWidth: "90%", textAlign: "center",
            boxShadow: "0 12px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginBottom: "15px", color: "#2563eb" }}>Success</h3>
            <p style={{ color: "#333", fontSize: "14px", marginBottom: "25px" }}>
              Earnings submitted successfully for {new Date(reportDate).toLocaleDateString()}!
            </p>
            <button
              onClick={() => setShowSuccessDialog(false)}
              style={{
                padding: "10px 25px", backgroundColor: "#2563eb",
                color: "white", border: "none", borderRadius: "6px",
                cursor: "pointer", fontWeight: "bold"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h3>Your Submissions</h3>
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Date</th>
                <th style={{ padding: "10px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "10px" }}>
                    {new Date(item.timestamp || item.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px" }}>₱{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeEarnings;