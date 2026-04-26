// TotalEarningsCard.js
import React, { useEffect, useState } from "react";

function TotalEarningsCard() {
  const [total, setTotal] = useState(0);

  const fetchTotal = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/earnings"); // Gamitin ang main earnings API
      const data = await res.json();

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Sum Net Totals (Income - Expense) for current month
      const monthNet = data
        .filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        })
        .reduce((sum, item) => {
          const amt = Number(item.amount) || 0;
          return item.type === "Expense" ? sum - amt : sum + amt;
        }, 0);

      setTotal(monthNet);
    } catch (err) {
      console.error("Total earnings fetch error:", err);
    }
  };
  useEffect(() => {
    fetchTotal();
  }, []);

  return (
    <div style={{ flex: 1, background: "#1cc88a", color: "#fff", padding: "25px", borderRadius: "10px" }}>
      <div style={{ fontSize: "12px", fontWeight: "bold" }}>MONTHLY NET EARNINGS</div>
      <div style={{ fontSize: "28px", fontWeight: "bold" }}>
        ₱{total.toLocaleString()}
      </div>
    </div>
  );
}

export default TotalEarningsCard;