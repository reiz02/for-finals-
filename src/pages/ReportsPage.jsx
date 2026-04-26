import React, { useEffect, useState, useCallback } from "react";
import { 
  FaTrash, FaPlus, FaHistory, FaCheckCircle, 
  FaSearch, FaFilePdf, FaEdit, FaTimes, FaFileInvoiceDollar 
} from "react-icons/fa";
import jsPDF from "jspdf"; 
import autoTable from "jspdf-autotable";

const ReportsPage = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Income");
  const [unit, setUnit] = useState("unit");
  // fixed category list (shared with inventory)
  const categories = ["Lettuce", "Pechay", "Tomato", "Eggplant", "Okra"];

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) return "Quarter 1 (Jan - Mar)";
    if (month >= 3 && month <= 5) return "Quarter 2 (Apr - Jun)";
    if (month >= 6 && month <= 8) return "Quarter 3 (Jul - Sep)";
    return "Quarter 4 (Oct - Dec)";
  };

  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());
  const [totals, setTotals] = useState({ gross: 0, expenses: 0, net: 0 });

  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  // Generic dialog for validations and confirmations
  const [dialog, setDialog] = useState({ show: false, message: "", type: "info", onConfirm: null, onCancel: null });

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", description: "", type: "Income", amount: "" });

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [quantity, setQuantity] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user.firstName || user.name || "User";

  const [availableYears, setAvailableYears] = useState([]);

  const fetchSubmissions = useCallback(async () => {
    console.log("FETCH STARTED");
    try {
      const res = await fetch("http://localhost:5000/api/earnings");
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      console.log("SERVER DATA:", data);

      setSubmissions(data);

      const quarterMap = {
        "Quarter 1 (Jan - Mar)": [0, 1, 2],
        "Quarter 2 (Apr - Jun)": [3, 4, 5],
        "Quarter 3 (Jul - Sep)": [6, 7, 8],
        "Quarter 4 (Oct - Dec)": [9, 10, 11],
      };

      const allowedMonths = quarterMap[selectedQuarter] || [];

      const filtered = data.filter(item => {
        const itemDate = new Date(item.date);
        if (isNaN(itemDate.getTime())) return false;

        return (
          itemDate.getFullYear().toString() === selectedYear &&
          allowedMonths.includes(itemDate.getMonth())
        );
      });

      setFilteredSubmissions(filtered);

      const gross = filtered
        .filter(i => i.type?.toLowerCase() === "income")
        .reduce((s, i) => s + Number(i.amount || 0), 0);

      const expenses = filtered
        .filter(i => i.type?.toLowerCase() === "expense")
        .reduce((s, i) => s + Number(i.amount || 0), 0);

      const netCalc = gross - expenses;

      setTotals({
        gross,
        expenses,
        net: Math.max(0, netCalc)
      });

    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [selectedYear, selectedQuarter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // ensure default description/category when switching to Income
  useEffect(() => {
    if (type === 'Income' && !description && categories.length) {
      setDescription(categories[0]);
    }
    // only run when `type` changes or when description is empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

useEffect(() => {
  const current = new Date().getFullYear();
  const startYear = 2000; // 🔥 change this if you want earlier (e.g., 2015)

  const years = [];
  for (let y = current; y >= startYear; y--) {
    years.push(y.toString());
  }

  setAvailableYears(years);

  if (!years.includes(selectedYear)) {
    setSelectedYear(years[0]);
  }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const calculateTotals = (data) => {
    const gross = data
      .filter(i => (i.type || "").toLowerCase().trim() === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenses = data
      .filter(i => (i.type || "").toLowerCase().trim() === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const netCalc = gross - expenses;

    setTotals({
      gross,
      expenses,
      net: Math.max(0, netCalc)
    });
  };

  const applyFilter = (data, year, quarter) => {
    const quarterMap = {
      "Quarter 1 (Jan - Mar)": [0, 1, 2],
      "Quarter 2 (Apr - Jun)": [3, 4, 5],
      "Quarter 3 (Jul - Sep)": [6, 7, 8],
      "Quarter 4 (Oct - Dec)": [9, 10, 11],
    };

    const allowedMonths = quarterMap[quarter];

    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      if (isNaN(itemDate.getTime())) return false;

      return (
        itemDate.getFullYear().toString() === year &&
        allowedMonths.includes(itemDate.getMonth())
      );
    });

    setFilteredSubmissions(filtered);
    calculateTotals(filtered);
  };

  const handleGenerateReport = () => {
    applyFilter(submissions, selectedYear, selectedQuarter);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Farm Ops Financial Report", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${selectedQuarter} ${selectedYear}`, 14, 28);

    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);

    doc.setFontSize(10);
    doc.text(`Generated by: ${user.email || displayName}`, 14, 42);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 48);

    const tableRows = filteredSubmissions.map(item => [
      new Date(item.date).toLocaleDateString(),
      `${item.category || item.description}${item.unit ? ` (${item.unit})` : ''}`,
      item.type,
     item.type?.toLowerCase().trim() === "income"
  ? (item.quantity ?? 0)
  : "-",
      `P${Number(item.amount || 0).toLocaleString()}`,
      item.role || "N/A"
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Date', 'Description', 'Type', 'Quantity', 'Amount', 'Role']],
      body: tableRows,
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Summary", 18, finalY + 8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gross Income: P${totals.gross.toLocaleString()}`, 18, finalY + 18);
    doc.text(`Total Expenses: P${totals.expenses.toLocaleString()}`, 18, finalY + 26);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 138, 100);
    doc.text(`Net Income: P${totals.net.toLocaleString()}`, 18, finalY + 34);

    doc.save(`FarmOps_Report_${selectedQuarter.replace(/ /g, "_")}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount) {
      setDialog({ show: true, message: "Please enter an amount.", type: "alert", onConfirm: () => setDialog(d => ({ ...d, show: false })) });
      return;
    }
    if (!selectedDate) {
      setDialog({ show: true, message: "Please select a date.", type: "alert", onConfirm: () => setDialog(d => ({ ...d, show: false })) });
      return;
    }

    const isIncome = type.trim().toLowerCase() === "income";
    const qty = isIncome ? Number(quantity) : 0;

    // ❗ prevent accidental 0 submissions
    if (isIncome && (!quantity || Number(quantity) <= 0)) {
      setDialog({ show: true, message: "Please enter a valid quantity for Income.", type: "alert", onConfirm: () => setDialog(d => ({ ...d, show: false })) });
      return;
    }

    try {
      const payload = {
        // Treat `amount` input as price-per-unit for Income entries; store total = price * qty
        amount: isIncome ? Number(amount) * qty : Number(amount),
        date: selectedDate,
        // For Income entries we treat description as the selected category
        description: type.trim().toLowerCase() === 'income' ? (description || '') : description,
        type: type.trim(),
        quantity: isIncome ? qty : 0,
        category: isIncome ? description : "",
        unit: isIncome ? unit : "unit",
        encodedBy: displayName,
        role: user.role
      };

      console.log("SENDING PAYLOAD:", payload);

      const response = await fetch("http://localhost:5000/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setAmount("");
        setDescription("");
        setSelectedDate(today);
        setQuantity("");

        await fetchSubmissions();
        setShowSuccessDialog(true);
        setTimeout(() => setShowSuccessDialog(false), 3000);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const deleteRecord = async (id) => {
    // show confirm dialog; perform deletion in onConfirm
    setDialog({
      show: true,
      message: "Are you sure you want to delete this record?",
      type: "confirm",
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/earnings/${id}`, { method: "DELETE" });
          if (res.ok) {
            await fetchSubmissions();
            try {
              localStorage.setItem('earnings:updated', Date.now().toString());
              window.dispatchEvent(new Event('earnings:updated'));
            } catch (e) {}
          } else {
            console.error('Delete failed', res.statusText);
          }
        } catch (err) {
          console.error("Delete error:", err);
        } finally {
          setDialog(d => ({ ...d, show: false }));
        }
      },
      onCancel: () => setDialog(d => ({ ...d, show: false }))
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item._id);

    // Prefer explicit category; if missing but description matches our known categories, use that
    const initialCategory = item.category || (categories.includes(item.description) ? item.description : "");

    setEditForm({
      date: new Date(item.date).toISOString().split("T")[0],
      description: item.description,
      category: initialCategory,
      unit: item.unit || "unit",
      type: item.type,
      // If this is an Income entry with a quantity, show the per-unit amount in the edit form
      amount: item.type?.toLowerCase() === 'income' && item.quantity ? Number(item.amount || 0) / Number(item.quantity || 1) : item.amount,
      quantity: item.type?.toLowerCase() === "income"
        ? Number(item.quantity || 0)
        : ""
    });
  };

  const handleUpdate = async () => {
    try {
      const isIncome = editForm.type?.toLowerCase() === "income";

      const payload = {
        ...editForm,
        // For updates, treat editForm.amount as price-per-unit for Income entries
        amount: isIncome ? Number(editForm.amount) * Number(editForm.quantity || 0) : Number(editForm.amount),
        quantity: isIncome ? Number(editForm.quantity || 0) : 0,
        category: isIncome ? (editForm.category || editForm.description) : "",
        unit: isIncome ? (editForm.unit || "unit") : "unit",
        encodedBy: displayName,
        role: user.role
      };

      console.log("UPDATE PAYLOAD:", payload);

      const response = await fetch(
        `http://localhost:5000/api/earnings/${editingItem}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        await fetchSubmissions();
        setEditingItem(null);
      }
    } catch (err) {
      console.error("Update error:", err);
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
    summaryBox: (borderColor) => ({ background: "#fff", padding: "20px", borderRadius: "12px", borderLeft: `6px solid ${borderColor}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", flex: "1 1 200px" }),
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", width: "100%", marginBottom: "10px", backgroundColor: "#fff" },
    primaryBtn: (bgColor) => ({ background: bgColor, color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }),
    tableContainer: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "800px" },
    th: { background: "#f8fafc", padding: "12px", borderBottom: "2px solid #edf2f7", color: "#64748b", fontSize: "0.8rem", textAlign: "left", textTransform: "uppercase" },
    td: { padding: "12px", borderBottom: "1px solid #f1f5f9", fontSize: "0.9rem", color: "#334155" },
    badge: (type) => ({ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", backgroundColor: type === "Income" ? "#dcfce7" : "#fee2e2", color: type === "Income" ? "#15803d" : "#ef4444" }),
    modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }
  };

  return (
    <div style={styles.container}>
      {showSuccessDialog && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#2d8a64", color: "white", padding: "15px 25px", borderRadius: "8px", zIndex: 2000 }}>
          <FaCheckCircle /> Saved Successfully!
        </div>
      )}

      {/* Financial Records Header */}
      <div style={styles.headerCard}>
        <div style={styles.headerIcon}>
          <FaFileInvoiceDollar />
        </div>
        <div>
          <h2 style={styles.headerTitle}>Financial Records</h2>
          <p style={styles.headerSubtitle}>
            Track and manage farm revenue, operational expenses, and generated fiscal reports.
          </p>
        </div>
      </div>

      {/* Generic dialog for validation/confirmation */}
      {dialog.show && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.card, width: 360, textAlign: 'center' }}>
            <p style={{ fontWeight: 800, marginBottom: 16 }}>{dialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {dialog.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); }}
                    style={styles.primaryBtn('#5dbb91')}
                  >Confirm</button>
                  <button
                    onClick={() => { if (dialog.onCancel) dialog.onCancel(); else setDialog(d => ({ ...d, show: false })); }}
                    style={styles.primaryBtn('#64748b')}
                  >Cancel</button>
                </>
              ) : (
                <button
                  onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); setDialog(d => ({ ...d, show: false })); }}
                  style={styles.primaryBtn('#5dbb91')}
                >OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.card, width: "400px"}}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3>Edit Record</h3>
              <FaTimes style={{ cursor: "pointer" }} onClick={() => setEditingItem(null)} />
            </div>
            <input style={styles.input} type="date" max={today} value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} />
            {editForm.type === 'Income' ? (
              <>
                <select style={styles.input} value={editForm.category || ""} onChange={(e) => setEditForm({...editForm, category: e.target.value, description: e.target.value})}>
                  {categories.length ? categories.map(c => <option key={c} value={c}>{c}</option>) : <option value="">No categories</option>}
                </select>
                <select style={styles.input} value={editForm.unit || 'unit'} onChange={(e) => setEditForm({...editForm, unit: e.target.value})}>
                  <option value="unit">Per unit</option>
                  <option value="cup">Per cup</option>
                  <option value="kilo">Per kilo</option>
                </select>
              </>
            ) : (
              <input style={styles.input} type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
            )}
            <select style={styles.input} value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})}><option value="Income">Income</option><option value="Expense">Expense</option></select>
            {editForm.type === "Income" && (
              <input style={styles.input} type="number" value={editForm.quantity || ""} placeholder="Quantity" onChange={(e) => setEditForm({...editForm, quantity: e.target.value})} />
            )}
            <input style={styles.input} type="number" value={editForm.amount} placeholder="Amount" onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
            <div style={{display: "flex", gap: "10px"}}>
              <button onClick={handleUpdate} style={styles.primaryBtn("#4e73df")}>Update</button>
              <button onClick={() => setEditingItem(null)} style={styles.primaryBtn("#64748b")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section - */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={styles.summaryBox("#57bc90")}><h4>Total / Gross Income</h4><p style={{fontSize: "1.5rem", fontWeight: "bold"}}>P{totals.gross.toLocaleString()}</p></div>
        <div style={styles.summaryBox("#ff6b6b")}><h4>Expenses</h4><p style={{fontSize: "1.5rem", fontWeight: "bold"}}>P{totals.expenses.toLocaleString()}</p></div>
        <div style={styles.summaryBox("#4e73df")}><h4>Net Income</h4><p style={{fontSize: "1.5rem", fontWeight: "bold"}}>P{totals.net.toLocaleString()}</p></div>
      </div>

      {/* Filtering Section - */}
      <div style={styles.card}>
        <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
          <select
  style={{...styles.input, width: "150px"}}
  value={selectedYear}
  onChange={(e) => setSelectedYear(e.target.value)}
>
  {availableYears.map(year => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
</select>
          <select style={{...styles.input, width: "220px"}} value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
            <option value="Quarter 1 (Jan - Mar)">Quarter 1 (Jan - Mar)</option>
            <option value="Quarter 2 (Apr - Jun)">Quarter 2 (Apr - Jun)</option>
            <option value="Quarter 3 (Jul - Sep)">Quarter 3 (Jul - Sep)</option>
            <option value="Quarter 4 (Oct - Dec)">Quarter 4 (Oct - Dec)</option>
          </select>
          <button style={styles.primaryBtn("#4e73df")} onClick={handleGenerateReport}><FaSearch /> Filter</button>
          <button style={styles.primaryBtn("#57bc90")} onClick={exportToPDF}><FaFilePdf /> PDF</button>
        </div>
      </div>

      {/* Add Record Form - */}
      <div style={styles.card}>
        <h3 style={{marginBottom: "15px"}}><FaPlus /> Add Daily Report</h3>
        <form onSubmit={handleSubmit} style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px"}}>
          <select
  style={styles.input}
  value={type}
  onChange={(e) => {
    setType(e.target.value);

    // reset quantity when switching type
    if (e.target.value === "Expense") {
      setQuantity("");
    }
  }}
>
  <option value="Income">Income</option>
  <option value="Expense">Expense</option>
</select>
          {/* ✅ NEW: Show only when Income */}
          {type === "Income" && (
            <input 
            style={styles.input} 
            type="number" 
            placeholder="Quantity" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} />
            )}
          <input style={styles.input} type="date" max={today} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          {type === "Income" ? (
            <select style={styles.input} value={description} onChange={(e) => setDescription(e.target.value)}>
              {categories.length ? categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              )) : <option value="">No categories</option>}
            </select>
          ) : (
            <input style={styles.input} type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          )}

          {type === "Income" && (
            <select style={styles.input} value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="unit">Per unit</option>
              <option value="cup">Per cup</option>
              <option value="kilo">Per kilo</option>
            </select>
          )}
          <input style={styles.input} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button type="submit" style={{...styles.primaryBtn("#57bc90"), width: "100%"}}>Submit</button>
        </form>
      </div>

      {/* History Table - */}
      <div style={styles.card}>
        <h3 style={{marginBottom: "15px"}}><FaHistory /> History</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
                <tr>
                 <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Quantity</th> {/* moved here */}
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Added By</th>
                  <th style={styles.th}>Action</th>
                </tr>
            </thead>
            <tbody>
  {filteredSubmissions.map((item) => (
    <tr key={item._id}>
      <td style={styles.td}>
        {new Date(item.date).toLocaleDateString()}
      </td>

  <td style={styles.td}>{`${item.category || item.description}${item.unit ? ` (${item.unit})` : ''}`}</td>

      <td style={styles.td}>
        <span style={styles.badge(item.type)}>{item.type}</span>
      </td>

      {/* ✅ Quantity */}
      <td style={styles.td}>
  {item.type?.toLowerCase().trim() === "income"
  ? (item.quantity !== undefined && item.quantity !== null && item.quantity !== ""
      ? Number(item.quantity)
      : 0)
  : "-"}

</td>

      {/* ✅ Amount */}
      <td style={styles.td}>
        P{Number(item.amount).toLocaleString()}
      </td>

      {/* ✅ Added By */}
      <td style={styles.td}>
        {item.role} - {item.encodedBy}
      </td>

      {/* ✅ Actions */}
      <td style={styles.td}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <FaEdit
            style={{ color: "#4e73df", cursor: "pointer", fontSize: "1.1rem" }}
            onClick={() => openEditModal(item)}
          />
          <FaTrash
            style={{ color: "#ef4444", cursor: "pointer", fontSize: "1.1rem" }}
            onClick={() => deleteRecord(item._id)}
          />
        </div>
      </td>
    </tr>
  ))}

</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;