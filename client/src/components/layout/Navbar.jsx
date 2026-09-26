import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Bell,
  Search,
  Warehouse,
  User as UserIcon,
  LogOut,
  AlertTriangle,
  Layers,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setLowStockAlerts(res.data.lowStockList || []);
        }
      } catch (err) {
        // Silently handle
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xs">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, SKU, documents (Press Enter)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
          />
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Active Warehouse badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <Warehouse className="h-3.5 w-3.5 text-odoo-600" />
          <span>{user?.warehouse || 'Main Warehouse'}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Stock Notifications"
          >
            <Bell className="h-5 w-5" />
            {lowStockAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div 
              className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5 z-50 border border-slate-100"
              onClick={() => setNotificationsOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-semibold text-slate-700">Stock Alerts & Notices</span>
                <span className="text-[11px] text-slate-400">{lowStockAlerts.length} item(s)</span>
              </div>
              <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5">
                {lowStockAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">All stock levels are optimal.</p>
                ) : (
                  lowStockAlerts.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => navigate('/products')}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-amber-50/60 cursor-pointer transition text-left"
                    >
                      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${Number(item.currentStock) === 0 ? 'text-rose-500' : 'text-amber-500'}`} />
                      <div className="text-xs">
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-slate-500">
                          {Number(item.currentStock) === 0 
                            ? 'Out of stock!' 
                            : `Current stock: ${item.currentStock} ${item.unitOfMeasure} (Min: ${item.reorderLevel})`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2">
                <Link
                  to="/products"
                  className="block text-center text-xs font-medium text-odoo-600 hover:text-odoo-700 py-1"
                >
                  View All Inventory
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="h-8 w-8 rounded-full bg-odoo-600 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{user?.role || 'Staff'}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5 z-50 border border-slate-100"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                <UserIcon className="h-3.5 w-3.5" />
                My Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                <Layers className="h-3.5 w-3.5" />
                Settings
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
