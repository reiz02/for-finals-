import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit3, Image as ImageIcon, Package, AlertTriangle } from "lucide-react";

function StockPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  
  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [modal, setModal] = useState({ show: false, message: "", type: "alert", onConfirm: null });

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { "userid": user?.id }
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]);
    }
  }, [user?.id]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addProduct = async () => {
    if (!name || !price || !stock) {
        setModal({show: true, message: "Please complete all fields"});
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
      if (res.ok) {
        setName(""); setPrice(""); setStock(""); setImage(null); setPreview("");
        fetchProducts();
      }
    } catch (error) { console.error(error); }
  };

  const deleteProduct = (id) => {
    setModal({
      show: true,
      message: "Are you sure you want to delete this?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:5000/api/products/${id}`, {
            method: "DELETE",
            headers: { "userid": user?.id }
          });
          fetchProducts();
        } catch (error) { console.error(error); }
      }
    });
  };

  return (
    <div style={pageWrapper}>
      {/* 1. HEADER SECTION - NAKA-WHITE CARD PARA KITA */}
      <div style={headerCard}>
        <div>
          <h2 style={titleText}>Product Inventory</h2>
          <p style={subtitleText}>Monitor and manage farm stock levels efficiently.</p>
        </div>
        <div style={countBadge}>Total Items: {products.length}</div>
      </div>

      <div style={mainLayout}>
        {/* 2. LEFT SIDE: FORM PANEL */}
        <div style={formSection}>
          <div style={formHeader}>
            <Plus size={18} /> <span>New Product</span>
          </div>
          <div style={formBody}>
            <div style={inputGroup}>
              <label style={labelStyle}>PRODUCT NAME</label>
              <input type="text" placeholder="e.g. Lettuce" value={name} onChange={(e)=>setName(e.target.value)} style={inputStyle} />
            </div>
            
            <div style={rowInput}>
              <div style={inputGroup}>
                <label style={labelStyle}>PRICE (₱)</label>
                <input type="number" placeholder="0" value={price} onChange={(e)=>setPrice(e.target.value)} style={inputStyle} />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>STOCK</label>
                <input type="number" placeholder="0" value={stock} onChange={(e)=>setStock(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>IMAGE</label>
              <label style={uploadBox}>
                <input type="file" hidden onChange={handleImage} accept="image/*" />
                {preview ? (
                  <img src={preview} alt="prev" style={previewImg} />
                ) : (
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px'}}>
                    <ImageIcon size={20} color="#94a3b8" />
                    <span style={{fontSize:'10px', color:'#94a3b8'}}>Upload</span>
                  </div>
                )}
              </label>
            </div>

            <button onClick={addProduct} style={addBtn}>Add to Inventory</button>
          </div>
        </div>

        {/* 3. RIGHT SIDE: CATALOG WITH WHITE BACKGROUND SECTION */}
        <div style={catalogContainer}>
          <div style={catalogHeaderCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} color="#27ae60" />
              <h3 style={sectionTitle}>Current Inventory</h3>
            </div>
          </div>

          <div style={catalogBody}>
            <div style={cardGrid}>
              {products.map((p) => (
                <div key={p._id} style={productCard}>
                  {p.stock <= 5 && (
                    <div style={lowStockTag}>
                      <AlertTriangle size={10} /> LOW
                    </div>
                  )}
                  
                  <div style={cardActions}>
                    <button style={iconBtn}><Edit3 size={12} /></button>
                    <button onClick={() => deleteProduct(p._id)} style={deleteIconBtn}><Trash2 size={12} /></button>
                  </div>

                  <div style={imgContainer}>
                    <img 
                      src={p.image ? `http://localhost:5000${p.image}` : "/api/placeholder/150/150"} 
                      alt={p.name} 
                      style={cardImg} 
                    />
                  </div>

                  <div style={cardBody}>
                    <h4 style={pName}>{p.name}</h4>
                    <div style={pMeta}>
                      <div style={metaCol}>
                        <span style={metaLabel}>PRICE</span>
                        <span style={metaVal}>₱{p.price}</span>
                      </div>
                      <div style={{ ...metaCol, textAlign: 'right' }}>
                        <span style={metaLabel}>STOCK</span>
                        <span style={{ ...metaVal, color: p.stock <= 5 ? '#ef4444' : '#0f172a' }}>
                          {p.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {modal.show && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <p style={{fontWeight:'700', marginBottom:'20px'}}>{modal.message}</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
              <button onClick={() => { if(modal.onConfirm) modal.onConfirm(); setModal({show:false}); }} style={confirmBtn}>Confirm</button>
              {modal.type === "confirm" && <button onClick={()=>setModal({show:false})} style={cancelBtn}>Cancel</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS-IN-JS (OPTIMIZED WITH WHITE CARDS) ---
const pageWrapper = { padding: "20px 30px", height: "100%", display: "flex", flexDirection: "column" };

const headerCard = { 
  background: "#fff", 
  padding: "15px 25px", 
  borderRadius: "20px", 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  marginBottom: "20px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
  border: "1px solid #f1f5f9"
};

const titleText = { fontSize: "1.6rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-1px" };
const subtitleText = { color: "#64748b", fontSize: "0.9rem", margin: "4px 0 0 0" };
const countBadge = { background: "#eefaf5", color: "#27ae60", padding: "6px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" };

const mainLayout = { display: "flex", gap: "20px", flex: 1, overflow: "hidden" };

// Form Section
const formSection = { width: "280px", background: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", height: "fit-content", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" };
const formHeader = { background: "#5dbb91", color: "#fff", padding: "15px 20px", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", fontWeight: "800", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" };
const formBody = { padding: "20px", display: "flex", flexDirection: "column", gap: "15px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "10px", fontWeight: "900", color: "#94a3b8", letterSpacing: "0.5px" };
const inputStyle = { padding: "10px", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", outline: "none" };
const rowInput = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" };
const uploadBox = { height: "90px", border: "2px dashed #e2e8f0", borderRadius: "12px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" };
const previewImg = { width: "100%", height: "100%", objectFit: "cover" };
const addBtn = { background: "#5dbb91", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", marginTop: "5px" };

// Catalog Section
const catalogContainer = { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" };
const catalogHeaderCard = { 
  background: "#fff", 
  padding: "12px 20px", 
  borderRadius: "15px 15px 0 0", 
  border: "1px solid #f1f5f9", 
  borderBottom: "none",
  boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
};
const sectionTitle = { fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: 0 };

const catalogBody = { 
  flex: 1, 
  background: "rgba(255, 255, 255, 0.5)", 
  padding: "20px", 
  borderRadius: "0 0 15px 15px", 
  border: "1px solid #f1f5f9", 
  overflowY: "auto" 
};
const cardGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" };

// Product Cards
const productCard = { background: "#fff", borderRadius: "18px", padding: "12px", border: "1px solid #f1f5f9", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" };
const lowStockTag = { position: "absolute", top: "10px", left: "10px", background: "#ef4444", color: "#fff", fontSize: "8px", fontWeight: "900", padding: "3px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "3px", zIndex: 5 };
const cardActions = { position: "absolute", top: "10px", right: "10px", display: "flex", gap: "5px", zIndex: 5 };
const iconBtn = { background: "#fff", border: "1px solid #f1f5f9", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#27ae60" };
const deleteIconBtn = { ...iconBtn, color: "#ef4444" };

const imgContainer = { width: "100%", height: "110px", borderRadius: "12px", background: "#f8fafc", marginBottom: "10px", overflow: "hidden" };
const cardImg = { width: "100%", height: "100%", objectFit: "contain" };

const cardBody = { display: "flex", flexDirection: "column", gap: "8px" };
const pName = { fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: 0 };
const pMeta = { display: "flex", justifyContent: "space-between" };
const metaCol = { display: "flex", flexDirection: "column" };
const metaLabel = { fontSize: "8px", fontWeight: "800", color: "#94a3b8" };
const metaVal = { fontSize: "13px", fontWeight: "900", color: "#0f172a" };

// Modals
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalBox = { background: "#fff", padding: "30px", borderRadius: "20px", textAlign: "center", width: "320px" };
const confirmBtn = { background: "#5dbb91", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };
const cancelBtn = { background: "#f1f5f9", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };

export default StockPage;