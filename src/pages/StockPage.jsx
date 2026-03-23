import React, { useState, useEffect, useCallback } from "react";

function StockPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  // MODAL STATE
  const [modal, setModal] = useState({ show: false, message: "", type: "alert", onConfirm: null });

  const showDialog = (message, type = "alert", onConfirm = null) => {
    setModal({ show: true, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { "userid": user?.id }
      });
      if (!res.ok) {
        console.error("Failed to fetch products:", res.status);
        setProducts([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const addProduct = async () => {
    if (!name || !price || !stock) {
      showDialog("Please complete all required fields");
      return;
    }
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "userid": user?.id },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        showDialog(`Error: ${errorData.error}`);
        return;
      }

      setName("");
      setPrice("");
      setStock("");
      setImage(null);
      setPreview("");
      fetchProducts();
      showDialog("Product added successfully!");
    } catch (error) {
      console.error("Add product error:", error);
    }
  };

  const updateProduct = async (id, field, value) => {
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "userid": user?.id
        },
        body: JSON.stringify({ [field]: value }),
      });
      fetchProducts();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

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
      <h2 style={headerStyle}>Product Inventory</h2>

      {(role === "admin" || user?.section === "Inventory") && (
        <div style={formContainerStyle}>
          <h3 style={formHeaderStyle}>Add Product</h3>
          <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
          <input type="file" accept="image/*" onChange={handleImage} />
          {preview && (
            <div style={previewContainerStyle}>
              <p>Preview</p>
              <img src={preview} alt="preview" style={imagePreviewStyle} />
            </div>
          )}
          <button onClick={addProduct} style={addButtonStyle}>Add Product</button>
        </div>
      )}

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderStyle}>
              <th style={tableCellStyle}>Image</th>
              <th style={tableCellStyle}>Product</th>
              <th style={tableCellStyle}>Price</th>
              <th style={tableCellStyle}>Stock</th>
              {role === "admin" && <th style={tableCellStyle}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td style={tableCellStyle}>
                  {p.image && <img src={`http://localhost:5000${p.image}`} alt={p.name} style={productImageStyle} />}
                </td>
                <td style={tableCellStyle}>{p.name}</td>
                <td style={tableCellStyle}>
                  {role === "admin" ? (
                    <input type="number" value={p.price} onChange={(e) => updateProduct(p._id, "price", e.target.value)} style={priceInputStyle} />
                  ) : `₱${p.price}`}
                </td>
                <td style={tableCellStyle}>
                  {role === "admin" ? (
                    <input type="number" value={p.stock} onChange={(e) => updateProduct(p._id, "stock", e.target.value)} style={stockInputStyle} />
                  ) : p.stock}
                </td>
                {role === "admin" && (
                  <td style={tableCellStyle}>
                    <button onClick={() => deleteProduct(p._id)} style={deleteButtonStyle}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DIALOG MODAL UI */}
      {modal.show && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <p style={{ marginBottom: "20px", fontSize: "16px" }}>{modal.message}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              {modal.type === "confirm" ? (
                <>
                  <button onClick={() => { modal.onConfirm(); closeModal(); }} style={confirmBtnStyle}>Confirm</button>
                  <button onClick={closeModal} style={cancelBtnStyle}>Cancel</button>
                </>
              ) : (
                <button onClick={closeModal} style={confirmBtnStyle}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const containerStyle = { background: "#fff", padding: "30px", borderRadius: "10px", maxWidth: "1200px", margin: "0 auto" };
const headerStyle = { textAlign: "center", marginBottom: "30px" };
const formContainerStyle = { maxWidth: "550px", margin: "0 auto 40px auto", padding: "25px", border: "1px solid #ddd", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "15px", backgroundColor: "#f9fafb" };
const formHeaderStyle = { textAlign: "center" };
const inputStyle = { padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" };
const addButtonStyle = { padding: "12px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const tableContainerStyle = { overflowX: "auto" };
const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "700px" };
const tableHeaderStyle = { background: "#f3f4f6" };
const tableCellStyle = { padding: "12px", borderBottom: "1px solid #ddd", textAlign: "center" };
const productImageStyle = { width: "60px", height: "60px", objectFit: "cover", borderRadius: "5px" };
const priceInputStyle = { width: "90px", textAlign: "center" };
const stockInputStyle = { width: "70px", textAlign: "center" };
const deleteButtonStyle = { padding: "6px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
const previewContainerStyle = { textAlign: "center" };
const imagePreviewStyle = { width: "150px", height: "150px", objectFit: "cover", borderRadius: "6px" };

// MODAL STYLES
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle = { background: "#fff", padding: "25px", borderRadius: "10px", minWidth: "300px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const confirmBtnStyle = { padding: "8px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
const cancelBtnStyle = { padding: "8px 20px", background: "#6b7280", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };

export default StockPage;