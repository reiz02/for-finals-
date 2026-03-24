import React, { useState, useEffect } from "react";
import "./EmployeePage.css";
import { FaUsers, FaUserCheck } from "react-icons/fa"; // Nagdagdag ako ng icons para mas maganda

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ show: false, employeeId: null });

  const fetchEmployees = async (isInitialLoad = false) => {
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
    fetchEmployees(true);
    const interval = setInterval(() => fetchEmployees(false), 5000);
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
      
      {/* BAGONG TITLE CARD SECTION (Lettuce Green) */}
      <div className="title-card-container">
        <div className="header-title-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaUserCheck style={{ color: "#2b8a3e", fontSize: "24px" }} />
            <h1>Employee Management</h1>
          </div>
          <p>
            Welcome to the Employee Management portal. Here you can monitor staff profiles, 
            approve new registration requests, and manage the official list of active employees.
          </p>
        </div>
      </div>

      {/* TABLE CARD SECTION */}
      <div className="employee-card">
        <div className="card-accent-header">
          <FaUsers /> <span>Registered Employees</span>
        </div>

        {loading ? (
          <p className="status-text" style={{ padding: "20px", textAlign: "center" }}>Loading employees...</p>
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
                  <tr><td colSpan="5" className="status-text" style={{ textAlign: "center", padding: "20px" }}>No employees found.</td></tr>
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

      {/* DELETE CONFIRMATION DIALOG */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ background: "#fff", padding: "25px", borderRadius: "15px", textAlign: "center" }}>
            <h3 style={{ color: "#d62828" }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="dialog-btn-container" style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button
                className="delete-btn"
                onClick={() => {
                  deleteEmployee(dialog.employeeId);
                  setDialog({ show: false, employeeId: null });
                }}
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setDialog({ show: false, employeeId: null })}
                style={{ background: "#f1f5f9", color: "#64748b" }}
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