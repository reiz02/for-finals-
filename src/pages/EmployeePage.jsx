import React, { useState, useEffect } from "react";
import "./EmployeePage.css";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ show: false, employeeId: null });

  // Fetch employees logic
  const fetchEmployees = async (isInitialLoad = false) => {
    // STEADY FIX: I-set lang ang loading kung ito ang unang beses na mag-load
    if (isInitialLoad) setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(true); // Initial load lang ang may loading text
    const interval = setInterval(() => fetchEmployees(false), 5000); // Silent refresh
    return () => clearInterval(interval);
  }, []);

  const approveEmployee = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/approve/${id}`, { method: "PUT" });
      if (res.ok) fetchEmployees(false);
    } catch (err) { console.error(err); }
  };

  const deleteEmployee = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) fetchEmployees(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="employee-page">
      <div className="employee-header">
        <h1>Employee Management</h1>
      </div>

      <div className="employee-card">
        {/* VISIBLE THEME: Added Card Accent Header */}
        <div className="card-accent-header">
          <span>👥 Registered Employees</span>
        </div>

        {loading ? (
          <p className="status-text">Loading employees...</p>
        ) : (
          <div className="table-container">
            <table className="employee-table">
              <thead>
                <tr>
                  <th className="col-name">Name</th>
                  <th className="col-email">Email Address</th>
                  <th className="col-section">Section</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan="5" className="status-text">No employees found.</td></tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td className="col-name">{emp.firstName} {emp.lastName}</td>
                      <td className="col-email">{emp.email}</td>
                      <td className="col-section">
                        <span className="section-badge">{emp.section}</span>
                      </td>
                      <td className="col-status">
                        <span className={`status-badge ${emp.status}`}>{emp.status}</span>
                      </td>
                      <td className="actions-cell col-actions">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="dialog-btn-container">
              <button
                className="confirm-btn"
                onClick={() => {
                  deleteEmployee(dialog.employeeId);
                  setDialog({ show: false, employeeId: null });
                }}
              >
                Yes, Delete
              </button>
              <button className="cancel-btn" onClick={() => setDialog({ show: false, employeeId: null })}>
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