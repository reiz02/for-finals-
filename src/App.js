import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// === Pages Imports ===
// Siguraduhin na ang casing (malaki/maliit na letra) ay tugma sa actual filenames sa /pages folder
import Login from "./pages/login"; 
import Register from "./pages/register"; 
import Dashboard from "./pages/Dashboard";
import StockPage from "./pages/StockPage";
import AdminRegister from "./pages/AdminRegister";
import DailyEarnings from "./pages/DailyEarnings";
import ForgotPassword from "./pages/ForgotPassword";

// === Styles and Assets ===
import "./App.css";
import farmerBg from "./assets/gh2.png"; 

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* 1. VISUAL BACKGROUND ELEMENTS 
            Naka-fixed ito sa likod para kahit mag-scroll ang form, 
            hindi gumagalaw ang background image.
        */}
        <div 
          className="main-bg-image" 
          style={{ backgroundImage: `url(${farmerBg})` }}
        ></div>
        
        {/* Overlay para sa blur at dilim (Glassmorphism effect support) */}
        <div className="bg-overlay"></div>

        {/* 2. ROUTES
            Direkta na ang Routes dito dahil ang bawat page (Login/Register) 
            ay may sarili nang '.login-page-wrapper' na nag-aayos ng gitna (Flexbox).
        */}
        <Routes>
          {/* === AUTH ROUTES === */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* Registration at Forgot Password */}
          <Route path="/register" element={<Register />} />
          <Route path="/register-admin" element={<AdminRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* === MAIN APPLICATION ROUTES === */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/daily-earnings" element={<DailyEarnings />} />

          {/* 3. CATCH-ALL ROUTE */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;