import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";

const DailyEarningsGraph = ({ data, mintColor }) => {
  
  // I-aggregate ang data per day (Show last 7 entries for cleaner daily view)
  const processData = (rawData) => {
    const dailyMap = {};
    
    rawData.forEach(item => {
      if (item.type === "Income") {
        const dateLabel = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyMap[dateLabel] = (dailyMap[dateLabel] || 0) + Number(item.amount);
      }
    });

    return Object.keys(dailyMap).map(date => ({
      name: date,
      earnings: dailyMap[date]
    })).slice(-7); // Huling 7 araw lang para hindi siksikan ang bar
  };

  const chartData = processData(data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        barSize={40} // Mas makapal na bar dahil iisa na lang siya
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} 
        />
        
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: "#94a3b8" }} 
          tickFormatter={(value) => `₱${value}`}
        />
        
        <Tooltip 
          cursor={{ fill: "rgba(87, 188, 144, 0.05)" }}
          contentStyle={{ 
            borderRadius: "12px", 
            border: "none", 
            boxShadow: "0 10px 15px rgba(0,0,0,0.05)",
            fontSize: "12px"
          }} 
          formatter={(value) => [`₱${value.toLocaleString()}`, "Net Earnings"]}
        />

        <Bar 
          dataKey="earnings" 
          fill={mintColor} 
          radius={[10, 10, 0, 0]} // Rounded corners sa taas
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyEarningsGraph;