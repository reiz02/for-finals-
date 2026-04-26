import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Image as ImageIcon, Package, AlertTriangle, Star, Eye } from "lucide-react";

function StockPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Safely parse `user` from localStorage and memoize so it's stable across renders
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      console.warn('Could not parse stored user:', e);
      return null;
    }
  }, []);
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(""); // For image preview
  const prevPreviewRef = useRef(null);

  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
  const [modal, setModal] = useState({ show: false, message: "", type: "alert", onConfirm: null });
  const [viewProduct, setViewProduct] = useState(null); // product currently viewed in modal

  const isMounted = useRef(true);

  const fetchProducts = useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { "userid": user?.id },
        signal,
      });
      const data = await res.json();
      if (!isMounted.current) return; // avoid setting state after unmount
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      if (error.name === 'AbortError') return; // fetch was aborted
      console.error("Fetch error:", error);
      if (isMounted.current) setProducts([]);
    }
    return () => controller.abort();
  }, [user?.id]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Track mounted state to avoid React state updates on unmounted components
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Revoke object URLs for previews to avoid memory leaks
  useEffect(() => {
    if (prevPreviewRef.current && prevPreviewRef.current !== preview) {
      try { URL.revokeObjectURL(prevPreviewRef.current); } catch (e) {}
    }
    prevPreviewRef.current = preview;
    return () => {
      if (prevPreviewRef.current) {
        try { URL.revokeObjectURL(prevPreviewRef.current); } catch (e) {}
      }
    };
  }, [preview]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreview(url); // Show the preview
    }
  };

  const addProduct = async () => {
    // require category/price/stock
    if ((!category && !name) || !price || !stock) {
      setModal({ show: true, message: "Please complete all fields" });
      return;
    }

    const normalizedKey = (category || name).trim().toLowerCase();
    const existingProduct = products.find((p) => {
      const existingName = String(p.name || p.category || "").trim().toLowerCase();
      return existingName === normalizedKey;
    });

    const existingStock = Number(existingProduct?.stock || 0);
    const newStock = existingProduct
      ? existingStock + Number(stock || 0)
      : Number(stock || 0);

    const formData = new FormData();
    formData.append("name", category || name);
    formData.append("category", category || name);
    formData.append("price", price);
    formData.append("stock", String(newStock));
    formData.append("createdAt", new Date().toISOString()); // ✅ ADDED TIMESTAMP
    if (image) formData.append("image", image);  // Add image if present

    try {
      const endpoint = existingProduct
        ? `http://localhost:5000/api/products/${existingProduct._id}`
        : "http://localhost:5000/api/products";
      const method = existingProduct ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "userid": user?.id },
        body: formData,
      });

      if (res.ok) {
        setName(""); setPrice(""); setStock(""); setImage(null); setPreview("");
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async (id) => {
    if ((!category && !name) || !price || !stock) {
      setModal({ show: true, message: "Please complete all fields" });
      return;
    }

    const formData = new FormData();
    formData.append("name", category || name);
    formData.append("category", category || name);
    formData.append("price", price);
    formData.append("stock", stock);
    if (image) formData.append("image", image); // Include new image if selected

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: { "userid": user?.id },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setEditingProduct(null); // Reset the editing state
        setName(""); setPrice(""); setStock(""); setImage(null); setPreview(""); // Clear the form
        fetchProducts(); // Refresh the product list
        setModal({ show: true, message: "Product updated successfully!" });
      } else {
        setModal({ show: true, message: data.error || "Failed to update product", type: "error" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setModal({ show: true, message: "Error updating product", type: "error" });
    }
  };

 

  // Centralized delete helper used by modal confirm and other callers
  const performDelete = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'userid': user?.id }
    });

    if (res.ok) {
      // ✅ If the deleted product is currently being edited → clear form
      if (editingProduct?._id === id) {
        setEditingProduct(null);
        setName("");
        setPrice("");
        setStock("");
        setImage(null);
        setPreview("");
      }

      // ✅ If the deleted product is open in view modal → close it
      if (viewProduct?._id === id) {
        setViewProduct(null);
      }

      await fetchProducts();

      try {
        localStorage.setItem('products:updated', Date.now().toString());
        window.dispatchEvent(new Event('products:updated'));
      } catch (e) {}
    } else {
      const data = await res.json().catch(() => ({}));
      console.error('Failed to delete product', data.error || data);
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
};

  

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category || product.name);
    setPrice(product.price);
    setStock(product.stock);
    setPreview(product.image ? `http://localhost:5000${product.image}` : "");
  };

  const openViewModal = (product) => {
    setViewProduct(product);
  };

  const closeViewModal = () => setViewProduct(null);

  // If URL contains ?view=<id>, open that product in the modal after products load
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const viewId = params.get('view');
      if (viewId && products && products.length) {
        const found = products.find(p => String(p._id) === String(viewId));
        if (found) {
          setViewProduct(found);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [location.search, products]);

  // When modal is closed, remove the query param so it doesn't reopen on refresh
  useEffect(() => {
    if (!viewProduct) {
      try {
        const params = new URLSearchParams(location.search);
        if (params.has('view')) {
          params.delete('view');
          const base = location.pathname || '/stock';
          const search = params.toString();
          navigate(search ? `${base}?${search}` : base, { replace: true });
        }
      } catch (e) {}
    }
    // include location.search and navigate in deps to satisfy lint and ensure
    // effect runs when URL changes or navigation function identity changes
  }, [viewProduct, location.search, navigate, location.pathname]);

  return (
    <div style={pageWrapper}>
      <div style={headerCard}>
        <div>
          <h2 style={titleText}>Product Inventory</h2>
          <p style={subtitleText}>Monitor and manage farm stock levels efficiently.</p>
        </div>
        <div style={countBadge}>Total Items: {products.length}</div>
      </div>

    <div style={mainLayout}>
      <div style={formSection}>
        <div style={formHeader}>
          <Plus size={18} /> <span>{editingProduct ? "Edit Product" : "New Product"}</span>
        </div>
        <div style={formBody}>
          <div style={inputGroup}>
            <label style={labelStyle}>CATEGORY</label>
            <select value={category || name} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              <option value="">Select category</option>
              <option value="Lettuce">Lettuce</option>
              <option value="Pechay">Pechay</option>
              <option value="Tomato">Tomato</option>
              <option value="Eggplant">Eggplant</option>
              <option value="Okra">Okra</option>
            </select>
          </div>

          <div style={rowInput}>
            <div style={inputGroup}>
              <label style={labelStyle}>PRICE (₱)</label>
              <input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>STOCK</label>
              <input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
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

          <button onClick={editingProduct ? () => updateProduct(editingProduct._id) : addProduct} style={addBtn}>
            {editingProduct ? "Update Product" : "Add to Inventory"}
          </button>
        </div>
      </div>

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
                  
                  {/* Top action buttons removed — actions are available in the view modal */}

                  <div style={imgContainer}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src={p.image ? `http://localhost:5000${p.image}` : "/api/placeholder/150/150"}
                        alt={p.name}
                        style={cardImg}
                      />
                      {/* Overlay view icon */}
                      <button onClick={() => openViewModal(p)} title="View product" style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(255,255,255,0.9)', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                        <Eye size={16} color="#0f172a" />
                      </button>
                    </div>
                  </div>

                  <div style={cardBody}>
                    {p.bestSeller && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <Star size={14} color="#f59e0b" />
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#b45309' }}>BEST SELLER</span>
                      </div>
                    )}
                    <h4 style={pName}>{p.name}</h4>

                    {/* ✅ TIMESTAMP DISPLAY */}
                    <p style={{ fontSize: "10px", color: "#94a3b8", margin: "0" }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                    </p>

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

     {modal.show && (
        <div style={{ ...modalOverlay, zIndex: 1200 }}>
          <div style={modalBox}>
            <p style={{fontWeight:'700', marginBottom:'20px'}}>{modal.message}</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
              <button onClick={() => { if(modal.onConfirm) modal.onConfirm(); setModal({show:false}); }} style={confirmBtn}>Confirm</button>
              {modal.type === "confirm" && <button onClick={()=>setModal({show:false})} style={cancelBtn}>Cancel</button>}
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
    
        {viewProduct && (
        <div style={{ ...modalOverlay, zIndex: 1100 }} onClick={closeViewModal}>
          <div style={{ ...modalBox, width: 520, background: '#fff' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ width: 160 }}>
                <img src={viewProduct.image ? `http://localhost:5000${viewProduct.image}` : '/api/placeholder/250/250'} alt={viewProduct.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12 }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{viewProduct.name}</h3>
                <p style={{ margin: '6px 0', color: '#64748b' }}>₱{viewProduct.price}</p>
                <p style={{ margin: '6px 0', color: '#94a3b8', fontSize: 13 }}>Stock: {viewProduct.stock}</p>
                <p style={{ marginTop: 8, fontSize: 13, color: '#334155' }}>{viewProduct.section || ''}</p>

                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => { handleEditClick(viewProduct); closeViewModal(); }} style={{ ...confirmBtn, padding: '8px 12px' }}>Edit</button>
                  {/* Best-seller is calculated automatically from Reports; manual button removed */}
                  <button onClick={() => { setModal({ show: true, message: 'Are you sure you want to delete this product?', type: 'confirm', onConfirm: async () => { await performDelete(viewProduct._id); setModal({ show: false }); closeViewModal(); } }); }} style={{ ...cancelBtn }}>Delete</button>
                  <button onClick={closeViewModal} style={{ ...cancelBtn }}>Close</button>
                </div>
              </div>
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
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px", minWidth: 0, width: "100%" };
const labelStyle = { fontSize: "10px", fontWeight: "900", color: "#94a3b8", letterSpacing: "0.5px" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", outline: "none", boxSizing: "border-box" };
const rowInput = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", minWidth: 0, width: "100%" };
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
  overflowY: "auto",
  overflowX: "hidden"
};
const cardGrid = { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "15px", width: "100%" };

// Product Cards
const productCard = { background: "#fff", borderRadius: "18px", padding: "12px", border: "1px solid #f1f5f9", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", minWidth: 0 };
const lowStockTag = { position: "absolute", top: "10px", left: "10px", background: "#ef4444", color: "#fff", fontSize: "8px", fontWeight: "900", padding: "3px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "3px", zIndex: 5 };




const imgContainer = { width: "100%", height: "110px", borderRadius: "12px", background: "#f8fafc", marginBottom: "10px", overflow: "hidden" };
const cardImg = { width: "100%", height: "100%", objectFit: "contain" };

const cardBody = { display: "flex", flexDirection: "column", gap: "8px" };
const pName = { fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: 0 };
const pMeta = { display: "flex", justifyContent: "space-between" };
const metaCol = { display: "flex", flexDirection: "column" };
const metaLabel = { fontSize: "8px", fontWeight: "800", color: "#94a3b8" };
const metaVal = { fontSize: "13px", fontWeight: "900", color: "#0f172a" };

// Modals
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };
const modalBox = { background: "#ff000025", padding: "30px", borderRadius: "20px", textAlign: "center", width: "320px" };
const confirmBtn = { background: "#5dbb91", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };
const cancelBtn = { background: "#f1f5f9", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };

export default StockPage;