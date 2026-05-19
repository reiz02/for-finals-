import React, { useState, useEffect } from "react";
import "./EmployeePage.css";
import { FaUsers, FaUserCheck } from "react-icons/fa";
import ConfirmationModal from "../components/ConfirmationModal";

function EmployeePage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState({
    show: false,
    employeeId: null,
    employeeName: null,
    action: null,
    isLoading: false,
  });

  const [successMessage, setSuccessMessage] = useState({
    show: false,
    message: "",
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
        { method: "PUT", headers: { userid: user?.id } }
      );

      if (res.ok) {
        fetchEmployees(false);
        setSuccessMessage({ show: true, message: "Employee approved successfully." });
        setTimeout(() => setSuccessMessage({ show: false, message: "" }), 3000);
      }
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
                                employeeName: `${emp.firstName} ${emp.lastName}`,
                                action:
                                  emp.status === "deactivated"
                                    ? "reactivate"
                                    : "deactivate",
                                isLoading: false,
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

      {/* ✅ CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={dialog.show}
        title="Confirm Account Status Change"
        message={
          dialog.action === "deactivate"
            ? "Are you sure you want to deactivate this employee? They will no longer have access to the system."
            : "Are you sure you want to reactivate this employee? They will regain access to the system."
        }
        employeeName={dialog.employeeName}
        actionType={dialog.action}
        isLoading={dialog.isLoading}
        onConfirm={async () => {
          setDialog({ ...dialog, isLoading: true });
          try {
            const endpoint =
              dialog.action === "deactivate"
                ? `http://localhost:5000/api/employees/deactivate/${dialog.employeeId}`
                : `http://localhost:5000/api/employees/reactivate/${dialog.employeeId}`;

            const res = await fetch(endpoint, { method: "PUT", headers: { userid: user?.id } });

            if (res.ok) {
              fetchEmployees(false);
              setDialog({
                show: false,
                employeeId: null,
                employeeName: null,
                action: null,
                isLoading: false,
              });
              
              // Show success message for reactivation
              if (dialog.action === "reactivate") {
                setSuccessMessage({
                  show: true,
                  message: "Employee Account Reactivated Successfully",
                });
                setTimeout(() => setSuccessMessage({ show: false, message: "" }), 3000);
              }
            }
          } catch (err) {
            console.error(err);
            setDialog({ ...dialog, isLoading: false });
          }
        }}
        onCancel={() =>
          setDialog({
            show: false,
            employeeId: null,
            employeeName: null,
            action: null,
            isLoading: false,
          })
        }
      />

      {/* ✅ SUCCESS MESSAGE MODAL */}
      {successMessage.show && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div style={{ background: "#dcfce7", padding: "30px", borderRadius: "20px", textAlign: "center", width: "320px", border: "2px solid #16a34a" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
              <span style={{ fontSize: "24px" }}>✓</span>
              <p style={{ fontWeight: "700", margin: 0, color: "#15803d", fontSize: "1.1rem" }}>{successMessage.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePage;