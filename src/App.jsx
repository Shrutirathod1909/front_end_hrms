// src/App.jsx (Updated with all Master Routes)
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Layout and Authentication
import MainLayout from "./layouts/MainLayout";

// Pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
// === MASTER Pages ===
import CompanyPage from "./pages/master/CompanyPage";
import BranchPage from "./pages/master/BranchPage";
import Supplier from "./pages/master/supplier";
import Product from "./pages/master/product";
import PurchaseOrder from "./pages/master/purchase_order";
// PrivateRoute Component (Login check sathi)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Private Routes (Layout sobat) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          
          {/* Default page */}
          <Route index element={<Dashboard />} />

          {/* ======================================================= */}
          {/* === MASTER Module che 4 Routes ithe define kara === */}
          {/* ======================================================= */}
          <Route path="/master/companies" element={<CompanyPage />} />
          <Route path="/master/branches" element={<BranchPage />} />
          <Route path="/master/product" element={<Product />} />
<Route
  path="/master/purchase-orders"
  element={<PurchaseOrder />}
/>
<Route path="/master/supplier" element={<Supplier/>} />
        </Route>

        {/* Jar konta route match nahi zala tar */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
