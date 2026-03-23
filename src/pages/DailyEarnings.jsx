// DailyEarnings.js
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function DailyEarnings({ data = [] }) {
  // Aggregate data by date considering Income vs Expense
  const aggregated = data.reduce((acc, item) => {
    const d = new Date(item.date || item.createdAt);
    const dateKey = d.toLocaleDateString("en-US");

    if (!acc[dateKey]) acc[dateKey] = 0;

    // LOGIC: Kung Income, add. Kung Expense, subtract.
    const val = Number(item.amount || item.total || 0);
    if (item.type === "Expense") {
      acc[dateKey] -= val;
    } else {
      acc[dateKey] += val;
    }
    
    return acc;
  }, {});

  const formattedData = Object.entries(aggregated)
    .map(([dateStr, amount]) => {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount, // Ito na ang Net Earnings para sa araw na iyon
        timestamp: d.getTime()
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        <Line type="monotone" dataKey="amount" stroke="#4e73df" strokeWidth={3} dot={{ r: 5 }} name="Net Earnings" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DailyEarnings;