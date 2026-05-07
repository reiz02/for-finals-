import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaChartLine } from "react-icons/fa";
import DailyEarningsGraph from "./DailyEarningsGraph";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [currentTime, setCurrentTime] = useState(new Date());
  const [reportData, setReportData] = useState({
    dailyEarnings: 0,
    totalIncome: 0,
    dailyHistory: []
  });
  // bestSellers: array to support multiple entries; bestIndex controls which one is shown
  const [bestSellers, setBestSellers] = useState([]);
  const [bestIndex, setBestIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      console.log('[Dashboard] fetchData called');

      const historyRes = await fetch("http://localhost:5000/api/earnings");
      if (!historyRes.ok) throw new Error("Failed to fetch data");

      const historyJson = await historyRes.json();
      const todayStr = new Date().toISOString().split('T')[0];

      const todayNet = historyJson
        .filter(item => {
          const dateVal = item.date || item.createdAt;
          if (!dateVal) return false;

          const itemDate = new Date(dateVal).toISOString().split('T')[0];
          return itemDate === todayStr;
        })
        .reduce((sum, item) => {
          const amt = Number(item.amount) || 0;
          return item.type === "Expense" ? sum - amt : sum + amt;
        }, 0);

      const overallNet = historyJson.reduce((sum, item) => {
        const amt = Number(item.amount) || 0;
        return item.type === "Expense" ? sum - amt : sum + amt;
      }, 0);

      setReportData({
        dailyEarnings: todayNet,
        totalIncome: overallNet, 
        dailyHistory: historyJson
      });

      console.log('[Dashboard] todayNet, overallNet', todayNet, overallNet);

    } catch (err) {
      console.error("Data fetch error:", err);
    }
  }, []);

  // Fetch the currently marked best-seller products (may return multiple)
  const fetchBestSeller = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/best-sellers");
      if (res.ok) {
        const json = await res.json();
        setBestSellers(Array.isArray(json) ? json : (json ? [json] : []));
      } else {
        setBestSellers([]);
      }
    } catch (err) {
      console.error('Failed to fetch best sellers:', err);
      setBestSellers([]);
      // don't forcibly reset bestIndex here; keep current selection if possible
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn !== "true" || !user) {
      navigate("/login");
    } else {
      fetchData();
      fetchBestSeller();
    }
  }, [isLoggedIn, navigate, user, fetchData, fetchBestSeller]);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  // Listen for product updates (best-seller changes or deletes) from StockPage
  useEffect(() => {
    const onProductsUpdated = () => fetchBestSeller();
    const onEarningsUpdated = () => {
      fetchData();
      fetchBestSeller();
    };
    const onStorage = (e) => {
      if (e.key === 'products:updated') fetchBestSeller();
      if (e.key === 'earnings:updated') {
        fetchData();
        fetchBestSeller();
      }
    };
    window.addEventListener('products:updated', onProductsUpdated);
    window.addEventListener('earnings:updated', onEarningsUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('products:updated', onProductsUpdated);
      window.removeEventListener('earnings:updated', onEarningsUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchBestSeller, fetchData]);

  // No auto-advance: user navigates best-sellers via dots. Keep bestIndex state only.

  // Compute slide percentages for the carousel (safe for 0-length)
  const slideCount = (bestSellers && bestSellers.length) || 0;
  const slidePct = slideCount > 0 ? (100 / slideCount) : 100;

  // Keep bestIndex in-range when bestSellers changes
  useEffect(() => {
    if (!bestSellers || bestSellers.length === 0) {
      if (bestIndex !== 0) setBestIndex(0);
      return;
    }
    if (bestIndex >= bestSellers.length) {
      setBestIndex(0);
    }
  }, [bestSellers, bestIndex]);

  // Track current year and update selected year when the year changes
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1]; // Current and previous year

  // Add this effect to update the selected year when the year changes
  useEffect(() => {
    const yearChangeInterval = setInterval(() => {
      const newYear = new Date().getFullYear();
      if (newYear !== selectedYear) {
        setSelectedYear(newYear);  // Update the selected year automatically
      }
    }, 1000 * 60 * 60);  // Check every hour (you can make this more frequent if needed)

    return () => clearInterval(yearChangeInterval); // Cleanup interval on unmount
  }, [selectedYear]);

  // (no timers to clean up)

  const activeMint = "#57bc90"; 
  const lightGreenBg = "#eefdf5"; 
  const softShadow = "0 2px 10px rgba(0, 0, 0, 0.04)";

  return (
    <div style={{ width: "100%", padding: "15px 25px", background: "transparent", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", gap: "15px" }}>
        {/* TITLE CARD */}
        <div style={{ backgroundColor: lightGreenBg, padding: "15px 25px", borderRadius: "14px", boxShadow: softShadow, border: `1px solid #d3f9e8`, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaChartLine style={{ color: activeMint, fontSize: "20px" }} />
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e293b", letterSpacing: "-0.5px" }}>
              Operational Insights
            </h2>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#475569", fontWeight: "500", lineHeight: "1.4" }}>
            Monitor your daily performance and overall financial health. Use the data below to track trends and optimize operations.
          </p>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "15px", flexWrap: 'wrap' }}>
        {/* Daily Earnings */}
        <div style={{ flex: 1, minWidth: 220, backgroundColor: "#fff", padding: "15px 20px", borderRadius: "14px", boxShadow: softShadow, borderLeft: `4px solid ${activeMint}` }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>DAILY EARNINGS</div>
          <div style={{ fontSize: "26px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.dailyEarnings.toLocaleString()}</div>
        </div>

        {/* Total Income */}
        <div style={{ flex: 1, minWidth: 220, backgroundColor: "#fff", padding: "15px 20px", borderRadius: "14px", boxShadow: softShadow, borderLeft: `4px solid #3b82f6` }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>TOTAL INCOME</div>
          <div style={{ fontSize: "26px", fontWeight: "900", color: "#1e293b" }}>₱{reportData.totalIncome.toLocaleString()}</div>
        </div>

        {/* Best Seller Product (admin-marked) */}
        <div style={{ flex: 1, minWidth: 220, backgroundColor: "#fff", padding: "12px", borderRadius: "14px", boxShadow: softShadow, borderLeft: `4px solid #f59e0b` }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "6px" }}>BEST SELLER</div>
            {reportData.totalIncome <= 0 ? (
              <div style={{ color: '#64748b', fontSize: 13 }}>No sales data available</div>
            ) : bestSellers && bestSellers.length > 0 ? (
              <div style={{ width: '100%', overflow: 'hidden' }}>
                {/* visible window */}
                <div style={{ height: 78, position: 'relative', overflow: 'hidden' }}>
                  {/* sliding track */}
                  <div
                    style={{
                      display: 'flex',
                      width: `${slideCount * 100}%`,
                      transition: 'transform 500ms ease',
                      transform: `translateX(-${bestIndex * (100 / slideCount)}%)`,
                      willChange: 'transform'
                    }}
                    data-slide-count={slideCount}
                  >
                    {bestSellers.map((b, i) => (
                      <div
                        key={b._id || i}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/stock?view=${b._id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/stock?view=${b._id}`); }}
                        style={{ flex: `0 0 ${slidePct}%`, display: 'flex', gap: 12, alignItems: 'center', height: 78, padding: '6px 0', boxSizing: 'border-box', minWidth: 0, cursor: 'pointer' }}
                      >
                        <img src={b.image ? `http://localhost:5000${b.image}` : '/api/placeholder/80/80'} alt={b.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 900, color: '#1e293b' }}>{b.name}</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', background: '#fffbeb', padding: '4px 8px', borderRadius: 8 }}>BEST SELLER</div>
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>₱{b.price}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Stock: {b.stock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* pagination dots when multiple */}
                {bestSellers.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                    {bestSellers.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setBestIndex(i)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setBestIndex(i); }}
                        style={{ width: 8, height: 8, borderRadius: 8, background: i === bestIndex ? '#f59e0b' : '#e6eaf0', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: 13 }}>No best seller selected</div>
            )}
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", boxShadow: softShadow, border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ color: "#1e293b", fontWeight: "800", fontSize: "15px", margin: 0 }}>Daily Revenue Trend</h3>
          
          {/* Year Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                padding: "5px 10px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span style={{ fontSize: "9px", padding: "3px 8px", backgroundColor: "#f1f5f9", borderRadius: "10px", color: "#64748b", fontWeight: "700" }}>
              LIVE SYNC
            </span>
          </div>
        </div>

        <div style={{ width: "100%", height: "260px" }}>
          <DailyEarningsGraph 
            data={reportData.dailyHistory || []} 
            mintColor={activeMint}
            selectedYear={selectedYear}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;