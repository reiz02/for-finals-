import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";

const DailyEarningsGraph = ({ data, mintColor }) => {
  
  const processData = (rawData) => {
    const dailyMap = {};
    const sortedData = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedData.forEach(item => {
      if (item.type === "Income") {
        const dateLabel = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyMap[dateLabel] = (dailyMap[dateLabel] || 0) + Number(item.amount);
      }
    });

    return Object.keys(dailyMap).map(date => ({
      name: date,
      earnings: dailyMap[date]
    })).slice(-7); 
  };

  const chartData = processData(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 20, left: -10, bottom: 25 }} 
        barSize={45} 
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          interval={0}
          /* GINAWANG BLACK ANG FILL AT DINAGDAGAN ANG FONT WEIGHT */
          tick={{ fontSize: 12, fill: "#000000", fontWeight: 700 }} 
          dy={10} 
        />
        
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          /* GINAWANG BLACK PARA MAS VISIBLE ANG MGA PRESYO */
          tick={{ fontSize: 11, fill: "#000000", fontWeight: 600 }} 
          tickFormatter={(value) => `₱${value}`}
        />
        
        <Tooltip 
          cursor={{ fill: "rgba(87, 188, 144, 0.1)" }}
          contentStyle={{ 
            borderRadius: "12px", 
            border: "1px solid #e2e8f0", 
            boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
            fontSize: "13px",
            color: "#000000",
            fontWeight: "bold"
          }} 
          formatter={(value) => [`₱${value.toLocaleString()}`, "Earnings"]}
        />

        <Bar 
          dataKey="earnings" 
          fill={mintColor} 
          radius={[6, 6, 0, 0]} 
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyEarningsGraph;