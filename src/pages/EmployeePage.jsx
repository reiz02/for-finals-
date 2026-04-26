import React, { useState, useEffect } from "react";
import "./EmployeePage.css";
import { FaUsers, FaUserCheck } from "react-icons/fa";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState({
    show: false,
    employeeId: null,
    action: null,
  });

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
      const res = await fetch(
        `http://localhost:5000/api/employees/approve/${id}`,
        { method: "PUT" }
      );
      if (res.ok) fetchEmployees(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="employee-page">

      {/* HEADER */}
      <div className="title-card-container">
        <div className="header-title-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaUserCheck style={{ color: "#2b8a3e", fontSize: "24px" }} />
            <h1>Employee Management</h1>
          </div>
          <p>
            Welcome to the Employee Management portal. Here you can monitor
            staff profiles, approve registrations, and manage employees.
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="employee-card">
        <div className="card-accent-header">
          <FaUsers /> <span>Registered Employees</span>
        </div>

        {loading ? (
          <p style={{ padding: "20px", textAlign: "center" }}>
            Loading employees...
          </p>
        ) : (
          <div className="table-container">
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
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        {emp.firstName} {emp.lastName}
                      </td>

                      <td>{emp.email}</td>

                      <td>
                        <span className="section-badge">
                          {emp.section}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge ${emp.status}`}>
                          {emp.status === "deactivated"
                            ? "DEACTIVATED"
                            : emp.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ display: "flex", gap: "8px" }}>
                        {emp.status === "pending" && (
                          <button
                            className="approve-btn"
                            onClick={() => approveEmployee(emp._id)}
                          >
                            Approve
                          </button>
                        )}

                        {emp.status !== "pending" && (
                          <button
                            style={{
                              background:
                                emp.status === "deactivated"
                                  ? "#16a34a"
                                  : "#f59e0b",
                              color: "#fff",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setDialog({
                                show: true,
                                employeeId: emp._id,
                                action:
                                  emp.status === "deactivated"
                                    ? "reactivate"
                                    : "deactivate",
                              })
                            }
                          >
                            {emp.status === "deactivated"
                              ? "Reactivate"
                              : "Deactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ CONFIRMATION DIALOG (ADDED ONLY) */}
      {/* ✅ CONFIRMATION DIALOG */}
{dialog.show && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        textAlign: "center",
        width: "350px",
      }}
    >
      <h3>Confirmation</h3>

      <p style={{ marginTop: "10px" }}>
        Are you really want to{" "}
        <b>{dialog.action}</b> this account?
      </p>

      {/* ✅ CENTER BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <button
          style={{
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
            minWidth: "90px",
          }}
          onClick={async () => {
            try {
              const res = await fetch(
                `http://localhost:5000/api/employees/deactivate/${dialog.employeeId}`,
                { method: "PUT" }
              );

              if (res.ok) {
                fetchEmployees(false);
              }
            } catch (err) {
              console.error(err);
            } finally {
              setDialog({ show: false, employeeId: null, action: null });
            }
          }}
        >
          Yes
        </button>

        <button
          style={{
            background: "#e5e7eb",
            color: "#111",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
            minWidth: "90px",
          }}
          onClick={() =>
            setDialog({ show: false, employeeId: null, action: null })
          }
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