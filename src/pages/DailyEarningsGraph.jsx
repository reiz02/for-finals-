import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Defs,
  LinearGradient,
  Stop
} from "recharts";

const DailyEarningsGraph = ({ data, mintColor, lightMintColor }) => {
  // --- DATA PREPARATION ---
  // Kailangan nating i-aggregate ang data by Month or Day para sa bar chart
  // Placeholder: Ipo-process natin ang raw historyJson data
  const processData = (rawData) => {
    // Halimbawa lang: Grupu-grupuin natin ang earnings by Month
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const aggregated = months.map(month => ({
      month,
      sales: 0,
      margin: 0 // Placeholder
    }));

    rawData.forEach(item => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      aggregated[monthIndex].sales += item.type !== "Expense" ? item.amount : 0;
      // aggregated[monthIndex].margin += ... (add your margin calculation here)
    });

    // SalesSight style often uses randomized placeholder values 
    // to fill in empty graph days for visual beauty. We will skip that 
    // and show real data, which might look sparser than the reference.
    return aggregated;
  };

  const chartData = processData(data);

  // --- STYLING HELPERS ---
  const formatCurrency = (value) => `$${value.toLocaleString()}`; // Tugma sa format ng picture

  // SalesSight uses overlapping double bars. We will simulate that for visual effect
  // though the data might not be exact.

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        barGap={-15} // Picture overlapping effect
        barSize={18} // Picture bar thickness
      >
        <Defs>
          {/* Gradient for Sales (Main Bar) */}
          <LinearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="5%" stopColor={mintColor} stopOpacity={1} />
            <Stop offset="95%" stopColor={mintColor} stopOpacity={0.8} />
          </LinearGradient>
          
          {/* Gradient for Margin (Secondary overlapping bar) */}
          <LinearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="5%" stopColor="#84cc16" stopOpacity={0.7} />
            <Stop offset="95%" stopColor="#84cc16" stopOpacity={0.5} />
          </LinearGradient>
        </Defs>
        
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: "#64748b" }} 
        />
        
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tickFormatter={formatCurrency}
          tick={{ fontSize: 10, fill: "#64748b" }}
          width={60} 
        />
        
        {/* Custom SalesSight styled tooltip */}
        <Tooltip 
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "10px",
            boxShadow: "0 10px 15px rgba(0,0,0,0.05)"
          }}
          labelStyle={{ color: "#1e293b", fontWeight: "bold", marginBottom: "5px" }}
          formatter={formatCurrency}
          cursor={{ fill: "rgba(87, 188, 144, 0.1)" }}
        />
        
        <Legend 
          iconType="circle" 
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", paddingTop: "20px" }}
        />
        
        {/* SalesSight Styled Double Bars */}
        <Bar 
          dataKey="sales" 
          name="Sales" 
          fill="url(#colorSales)" 
          radius={[10, 10, 0, 0]} // Beautiful rounded tops
        />
        
        {/* Secondary bar to simulate overlapping/dual data from picture */}
        <Bar 
          dataKey="margin" 
          name="Gross Margin" 
          fill="url(#colorMargin)" 
          radius={[10, 10, 0, 0]} // Rounded tops
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyEarningsGraph;