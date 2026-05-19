import React, { useEffect, useState, useCallback } from "react";
import { FaClipboardList, FaSearch, FaUndo } from "react-icons/fa";
import ConfirmationModal from "../components/ConfirmationModal";

const AuditLogPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("All");
  const [undoConfirmation, setUndoConfirmation] = useState({ show: false, isLoading: false, log: null });
  const [operationMessage, setOperationMessage] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filterLogs = useCallback(() => {
    let filtered = auditLogs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        const userName = (log.userId?.name || `${log.userId?.firstName || ""} ${log.userId?.lastName || ""}`).trim();
        const userRole = (log.userId?.role || log.userRole || log.userId?.position || "").toString().toLowerCase();
        return (
          userName.toLowerCase().includes(term) ||
          userRole.includes(term) ||
          log.userId?.email?.toLowerCase().includes(term) ||
          log.action?.toLowerCase().includes(term) ||
          log.entity?.toLowerCase().includes(term)
        );
      });
    }

    if (selectedAction !== "All") {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, selectedAction]);

  useEffect(() => {
    filterLogs();
  }, [filterLogs]);

  const fetchAuditLogs = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};
      const userId = user.id || user._id || "";

      const response = await fetch("http://localhost:5000/api/audit-logs", {
        headers: {
          userid: userId
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || "Failed to load audit logs.");
        setAuditLogs([]);
      } else {
        const data = await response.json();
        setAuditLogs(Array.isArray(data) ? data : []);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setErrorMessage("Unable to reach audit logs service.");
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatChanges = (log) => {
    const { previousValues, newValues } = log;
    const hasPreviousValues = previousValues && Object.keys(previousValues).length > 0;
    const hasNewValues = newValues && Object.keys(newValues).length > 0;

    if (!hasPreviousValues && !hasNewValues) return "No changes";

    if (!hasPreviousValues && hasNewValues) {
      // New stock/product creation
      if (newValues.name || newValues.category || newValues.stock || newValues.price) {
        return `Added Stock: ${newValues.name || newValues.category || "Unnamed"} | Category: ${newValues.category || "N/A"} | Qty: ${newValues.stock ?? "N/A"} | Price: P${newValues.price ?? "N/A"}`;
      }

      // New report submissions
      if (newValues.type || newValues.item || newValues.amount || newValues.quantity) {
        const { type, item, amount, quantity } = newValues;
        return `New Report: ${type || "N/A"} | ${item || "N/A"} | Qty: ${quantity ?? "N/A"} | P${amount ?? "N/A"}`;
      }

      // Generic new object format
      return Object.entries(newValues)
        .map(([key, value]) => `${key}: ${value ?? "N/A"}`)
        .join(" | ");
    }

    if (hasPreviousValues && hasNewValues) {
      const changes = [];
      Object.keys(newValues).forEach(key => {
        if (previousValues[key] !== newValues[key]) {
          changes.push(`${key}: ${previousValues[key] ?? "N/A"} → ${newValues[key]}`);
        }
      });
      return changes.length > 0 ? changes.join(" | ") : "No changes";
    }

    if (hasPreviousValues && !hasNewValues) {
      const changes = [];
      Object.keys(previousValues).forEach(key => {
        changes.push(`${key}: ${previousValues[key]}`);
      });
      return changes.length > 0 ? changes.join(", ") : "No changes";
    }

    return "No changes";
  };

  const formatUserLabel = (log) => {
    const names = [log.userId?.firstName, log.userId?.lastName].filter(Boolean);
    const userName = log.userId?.name || names.join(" ") || log.userId?.email || "Unknown";
    const userRole = (log.userId?.role || log.userRole || log.userId?.position || "").toString().trim();
    return { userName, userRole };
  };

  const openUndoConfirmation = (log) => {
    setUndoConfirmation({ show: true, isLoading: false, log });
  };

  const confirmUndo = async () => {
    if (!undoConfirmation.log) return;
    setUndoConfirmation(prev => ({ ...prev, isLoading: true }));

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};
      const userId = user.id || user._id || "";

      const response = await fetch(`http://localhost:5000/api/audit-logs/${undoConfirmation.log._id}/undo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userid": userId
        }
      });

      if (response.ok) {
        await fetchAuditLogs();
        setUndoConfirmation({ show: false, isLoading: false, log: null });
        setOperationMessage({ show: true, message: "Action undone successfully!", type: "success" });
        setTimeout(() => setOperationMessage({ show: false, message: "", type: "success" }), 3000);
      } else {
        const body = await response.json().catch(() => ({}));
        setUndoConfirmation(prev => ({ ...prev, isLoading: false }));
        setOperationMessage({ show: true, message: body.error || "Unable to undo action.", type: "error" });
        setTimeout(() => setOperationMessage({ show: false, message: "", type: "error" }), 3000);
      }
    } catch (err) {
      console.error("Undo error:", err);
      setUndoConfirmation(prev => ({ ...prev, isLoading: false }));
      setOperationMessage({ show: true, message: "Error undoing action.", type: "error" });
      setTimeout(() => setOperationMessage({ show: false, message: "", type: "error" }), 3000);
    }
  };

  const styles = {
    container: { padding: "20px", fontFamily: "'Inter', sans-serif", backgroundColor: "transparent", minHeight: "100vh" },
    headerCard: {
      background: "#fff",
      padding: "20px 25px",
      borderRadius: "15px",
      marginBottom: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      border: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      gap: "20px"
    },
    headerIcon: {
      background: "#eefaf5",
      color: "#27ae60",
      padding: "15px",
      borderRadius: "12px",
      fontSize: "1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    headerTitle: { fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-1px" },
    headerSubtitle: { fontSize: "0.9rem", color: "#64748b", margin: "4px 0 0 0" },
    card: { background: "#fff", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", marginBottom: "20px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", width: "100%", marginBottom: "10px", backgroundColor: "#fff" },
    select: { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#fff", marginRight: "10px" },
    tableContainer: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "1000px" },
    th: { background: "#f8fafc", padding: "12px", borderBottom: "2px solid #edf2f7", color: "#64748b", fontSize: "0.8rem", textAlign: "left", textTransform: "uppercase" },
    td: { padding: "12px", borderBottom: "1px solid #f1f5f9", fontSize: "0.9rem", color: "#334155", whiteSpace: "normal" },
    loading: { textAlign: "center", padding: "40px", color: "#64748b" },
    noData: { textAlign: "center", padding: "40px", color: "#64748b", fontSize: "1.1rem" },
    undoButton: { background: "#edf7ef", color: "#2d8a64", border: "1px solid #c7e6d4", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center" }
  };

  const uniqueActions = ["All", ...new Set(auditLogs.map(log => log.action))];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.headerIcon}>
          <FaClipboardList />
        </div>
        <div>
          <h2 style={styles.headerTitle}>Audit Logs</h2>
          <p style={styles.headerSubtitle}>
            Track and monitor all system activities and changes across the platform.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.card}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
            <FaSearch style={{ color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search by user, action, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />
          </div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            style={styles.select}
          >
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div style={styles.card}>
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>Loading audit logs...</div>
          ) : errorMessage ? (
            <div style={{ ...styles.noData, color: "#b91c1c" }}>{errorMessage}</div>
          ) : filteredLogs.length === 0 ? (
            <div style={styles.noData}>No audit logs found matching your criteria.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Entity</th>
                  <th style={styles.th}>Actions</th>
                  <th style={styles.th}>Changes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const { userName, userRole } = formatUserLabel(log);
                  const roleColor = userRole.toLowerCase() === "admin" ? "#15803d" : "#64748b";
                  return (
                    <tr key={log._id}>
                      <td style={styles.td}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        {userName || log.userId?.email || "Unknown"}
                        {userRole ? (
                          <span style={{ color: roleColor, marginLeft: "6px" }}>
                            ({userRole})
                          </span>
                        ) : null}
                      </td>
                      <td style={styles.td}>
                        {log.action}
                      </td>
                      <td style={styles.td}>
                        {log.entity}
                      </td>
                      <td style={styles.td}>
                        {['DELETE_REPORT', 'EDIT_REPORT'].includes(log.action) ? (
                          <button
                            onClick={() => openUndoConfirmation(log)}
                            style={styles.undoButton}
                          >
                            <FaUndo style={{ marginRight: 6 }} />Undo
                          </button>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>N/A</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {formatChanges(log)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={undoConfirmation.show}
        title="Undo Action"
        message="Are you sure you want to undo this action?"
        actionType="update"
        onConfirm={confirmUndo}
        onCancel={() => setUndoConfirmation({ show: false, isLoading: false, log: null })}
        isLoading={undoConfirmation.isLoading}
      />

      {operationMessage.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: operationMessage.type === 'success' ? '#2d8a64' : '#d62828',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          zIndex: 2000,
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.18)',
          minWidth: '240px',
          textAlign: 'center'
        }}>
          {operationMessage.message}
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;