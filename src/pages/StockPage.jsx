import React, { useState, useEffect, useCallback } from "react";

function StockPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role; // Admin or Employee
  
  // Products State
  const [products, setProducts] = useState([]);
  
  // Add Product States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", price: "", stock: "" });

  // Modal State
  const [modal, setModal] = useState({ show: false, message: "", type: "alert", onConfirm: null });

  const showDialog = (message, type = "alert", onConfirm = null) => {
    setModal({ show: true, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
  };

  // FETCH PRODUCTS
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { "userid": user?.id }
      });
      if (!res.ok) return setProducts([]);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]);
    }
  }, [user?.id]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // IMAGE HANDLING
  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ADD PRODUCT
  const addProduct = async () => {
    if (!name || !price || !stock) {
      showDialog("Please complete all required fields");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "userid": user?.id },
        body: formData,
      });
      if (!res.ok) return showDialog("Error adding product");
      
      setName(""); setPrice(""); setStock(""); setImage(null); setPreview("");
      fetchProducts();
      showDialog("Product added successfully!");
    } catch (error) { console.error(error); }
  };

  // EDIT & SAVE LOGIC
  const handleEditClick = (p) => {
    setEditingId(p._id);
    setEditData({ name: p.name, price: p.price, stock: p.stock });
  };

  const handleSave = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "userid": user?.id
        },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setEditingId(null);
        fetchProducts();
        showDialog("Product updated successfully!");
      } else {
        showDialog("Failed to update product.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    showDialog("Are you sure you want to delete this product?", "confirm", async () => {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, {
          method: "DELETE",
          headers: { "userid": user?.id }
        });
        fetchProducts();
      } catch (error) {
        console.error("Delete error:", error);
      }
    });
  };

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <div>
          <h2 style={titleStyle}>Product Inventory</h2>
          <p style={subtitleStyle}>Monitor and manage farm stock levels efficiently.</p>
        </div>
        <div style={statsBadgeStyle}>Total: {products.length} Items</div>
      </div>

      {/* FORM SECTION (Visible to Admin or Inventory Section Employees) */}
      <div style={formCardStyle}>
        <div style={cardHeaderStyle}>Register New Item</div>
        <div style={formGridStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Product Name</label>
            <input type="text" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Price (₱)</label>
            <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Stock</label>
            <input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Photo</label>
            <input type="file" accept="image/*" onChange={handleImage} style={fileInputStyle} />
          </div>
        </div>
        {preview && <div style={previewWrapperStyle}><img src={preview} alt="preview" style={imagePreviewStyle} /></div>}
        <button onClick={addProduct} style={addButtonStyle}>Add Product</button>
      </div>

      {/* TABLE SECTION */}
      <div style={tableCardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={thStyle}>Image</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>In Stock</th>
              <th style={{...thStyle, textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={trStyle}>
                <td style={tdStyle}>
                  {p.image ? (
                    <img src={`http://localhost:5000${p.image}`} alt={p.name} style={productImageStyle} />
                  ) : (
                    <div style={noImageStyle}>No Image</div>
                  )}
                </td>
                <td style={tdStyle}>
                  {editingId === p._id ? (
                    <input style={inlineInputStyle} value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                  ) : (
                    <span style={{fontWeight: '600', color: '#1e293b'}}>{p.name}</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {editingId === p._id ? (
                    <input type="number" style={inlineInputStyle} value={editData.price} onChange={(e) => setEditData({...editData, price: e.target.value})} />
                  ) : `₱${p.price}`}
                </td>
                <td style={tdStyle}>
                  {editingId === p._id ? (
                    <input type="number" style={inlineInputStyle} value={editData.stock} onChange={(e) => setEditData({...editData, stock: e.target.value})} />
                  ) : (
                    <span style={getStockBadgeStyle(p.stock)}>{p.stock} units</span>
                  )}
                </td>
                <td style={{...tdStyle, textAlign: 'center'}}>
                  <div style={actionsContainerStyle}>
                    {editingId === p._id ? (
                      <>
                        <button onClick={() => handleSave(p._id)} style={saveButtonStyle}>Save</button>
                        <button onClick={() => setEditingId(null)} style={cancelButtonStyle}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(p)} style={editButtonStyle}>Edit</button>
                        <button onClick={() => deleteProduct(p._id)} style={deleteButtonStyle}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DIALOG MODAL */}
      {modal.show && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <p style={{ marginBottom: "25px", fontSize: "1.1rem", color: "#1e293b", fontWeight: "500" }}>{modal.message}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button onClick={() => { if(modal.onConfirm) modal.onConfirm(); closeModal(); }} style={confirmBtnStyle}>Confirm</button>
              {modal.type === "confirm" && <button onClick={closeModal} style={cancelBtnStyle}>Cancel</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS-IN-JS STYLES ---
const containerStyle = { width: "100%", padding: "20px" };
const headerSectionStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const titleStyle = { fontSize: "1.8rem", fontWeight: "800", color: "#1e293b", margin: 0 };
const subtitleStyle = { color: "#64748b", margin: "5px 0 0 0" };
const statsBadgeStyle = { background: "#fff", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", color: "#2d8a64", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" };

const formCardStyle = { background: "#fff", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "30px" };
const cardHeaderStyle = { fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", color: "#1e293b" };
const formGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" };
const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontSize: "0.85rem", fontWeight: "600", color: "#64748b" };
const inputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem" };
const fileInputStyle = { fontSize: "0.85rem", color: "#64748b" };
const addButtonStyle = { marginTop: "20px", padding: "12px 25px", background: "#10b981", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" };

const tableCardStyle = { background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRowStyle = { backgroundColor: "#f8fafc" };
const thStyle = { padding: "15px 20px", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #f1f5f9" };
const tdStyle = { padding: "15px 20px", borderBottom: "1px solid #f1f5f9" };
const trStyle = { transition: "0.2s" };

const productImageStyle = { width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" };
const noImageStyle = { width: "50px", height: "50px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#94a3b8" };

const getStockBadgeStyle = (stock) => ({
  padding: "5px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700",
  backgroundColor: stock < 10 ? "#fee2e2" : "#dcfce7", color: stock < 10 ? "#ef4444" : "#15803d"
});

const actionsContainerStyle = { display: "flex", justifyContent: "center", gap: "5px" };
const editButtonStyle = { background: "#f1f5f9", color: "#475569", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const deleteButtonStyle = { background: "#fee2e2", color: "#ef4444", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const saveButtonStyle = { background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const cancelButtonStyle = { background: "#64748b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const inlineInputStyle = { padding: "5px", borderRadius: "5px", border: "1px solid #10b981", width: "100%" };

const previewWrapperStyle = { marginTop: "15px" };
const imagePreviewStyle = { width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover" };

const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle = { background: "#fff", padding: "30px", borderRadius: "15px", textAlign: "center", minWidth: "300px" };
const confirmBtnStyle = { padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" };
const cancelBtnStyle = { padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" };

export default StockPage;