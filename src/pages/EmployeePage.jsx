import React, { useState, useEffect } from "react";
import "./EmployeePage.css";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState({ show: false, employeeId: null });

  // Fetch all employees from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      if (!res.ok) {
        console.error("Server error:", res.status);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Approve employee
  const approveEmployee = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/approve/${id}`, {
        method: "PUT",
      });
      if (!res.ok) return console.error("Approve failed");
      fetchEmployees();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) return console.error("Delete failed");
      fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="employee-page">
      <h1>Employee Management</h1>

      <div className="employee-card">
        {loading ? (
          <p className="status-text">Loading employees...</p>
        ) : employees.length === 0 ? (
          <p className="status-text">No employees found.</p>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Section</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.section}</td>
                  <td>
                    <span className={`status-badge ${emp.status}`}>{emp.status}</span>
                  </td>
                  <td className="actions-cell">
                    {emp.status === "pending" && (
                      <button className="approve-btn" onClick={() => approveEmployee(emp._id)}>
                        Approve
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => setDialog({ show: true, employeeId: emp._id })}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this employee?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  deleteEmployee(dialog.employeeId);
                  setDialog({ show: false, employeeId: null });
                }}
                style={{ flex: 1, backgroundColor: "#e74c3c", color: "#fff", border: "none", padding: "8px", borderRadius: "6px" }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDialog({ show: false, employeeId: null })}
                style={{ flex: 1, backgroundColor: "#7f8c8d", color: "#fff", border: "none", padding: "8px", borderRadius: "6px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePage;