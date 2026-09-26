import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Public Pages
import Home from './pages/public/Home';

// Main Application Pages
import Dashboard from './pages/dashboard/Dashboard';
import ProductsList from './pages/products/ProductsList';
import CategoriesList from './pages/categories/CategoriesList';
import Receipts from './pages/operations/Receipts';
import Deliveries from './pages/operations/Deliveries';
import Transfers from './pages/operations/Transfers';
import Adjustments from './pages/operations/Adjustments';
import StockOverview from './pages/stock/StockOverview';
import StockLedger from './pages/stock/StockLedger';
import WarehousesList from './pages/warehouses/WarehousesList';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Initializing StockSense...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home / Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Inventory Master */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/stock" element={<StockOverview />} />

            {/* Operations */}
            <Route path="/operations/receipts" element={<Receipts />} />
            <Route path="/operations/deliveries" element={<Deliveries />} />
            <Route path="/operations/transfers" element={<Transfers />} />
            <Route path="/operations/adjustments" element={<Adjustments />} />

            {/* Ledger & Facilities */}
            <Route path="/stock/ledger" element={<StockLedger />} />
            <Route path="/warehouses" element={<WarehousesList />} />

            {/* Profile & Settings */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
