import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Globe
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(true);

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-odoo-600 text-white shadow-xs font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-1.5 pl-9 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'text-odoo-600 font-semibold bg-odoo-50'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
    }`;

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-200 bg-white min-h-screen">
      {/* Top Header */}
      <div>
        <Link
          to="/"
          className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 hover:bg-slate-50/80 transition"
          title="Visit Public Website"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-odoo-600 text-white font-bold shadow-xs">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Stock<span className="text-odoo-600">Sense</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Modular IMS • Odoo Style</p>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {/* Dashboard */}
          <NavLink to="/dashboard" className={navItemClass}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>

          {/* Public Home link */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 transition"
          >
            <Globe className="h-4 w-4 text-slate-400" />
            <span>Public Home</span>
          </Link>

          {/* Inventory Section */}
          <div className="pt-2">
            <button
              onClick={() => setInventoryOpen(!inventoryOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase hover:text-slate-600 transition"
            >
              <span>Inventory</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${inventoryOpen ? 'rotate-0' : '-rotate-90'}`} />
            </button>

            {inventoryOpen && (
              <div className="mt-1 space-y-0.5">
                <NavLink to="/products" className={subNavItemClass}>
                  <Package className="h-3.5 w-3.5" />
                  <span>Products</span>
                </NavLink>
                <NavLink to="/categories" className={subNavItemClass}>
                  <FolderTree className="h-3.5 w-3.5" />
                  <span>Categories</span>
                </NavLink>
                <NavLink to="/stock" className={subNavItemClass}>
                  <Boxes className="h-3.5 w-3.5" />
                  <span>Stock Overview</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Operations Section */}
          <div className="pt-2">
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase hover:text-slate-600 transition"
            >
              <span>Operations</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${operationsOpen ? 'rotate-0' : '-rotate-90'}`} />
            </button>

            {operationsOpen && (
              <div className="mt-1 space-y-0.5">
                <NavLink to="/operations/receipts" className={subNavItemClass}>
                  <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Receipts (Incoming)</span>
                </NavLink>
                <NavLink to="/operations/deliveries" className={subNavItemClass}>
                  <ArrowUpRight className="h-3.5 w-3.5 text-blue-600" />
                  <span>Delivery Orders</span>
                </NavLink>
                <NavLink to="/operations/transfers" className={subNavItemClass}>
                  <ArrowLeftRight className="h-3.5 w-3.5 text-amber-600" />
                  <span>Internal Transfers</span>
                </NavLink>
                <NavLink to="/operations/adjustments" className={subNavItemClass}>
                  <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />
                  <span>Stock Adjustments</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Stock Ledger */}
          <div className="pt-2">
            <p className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Ledger & Facility</p>
            <NavLink to="/stock/ledger" className={navItemClass}>
              <History className="h-4 w-4" />
              <span>Stock Ledger</span>
            </NavLink>

            <NavLink to="/warehouses" className={navItemClass}>
              <Warehouse className="h-4 w-4" />
              <span>Warehouses</span>
            </NavLink>
          </div>

          {/* Settings */}
          <NavLink to="/settings" className={navItemClass}>
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom Profile Menu (Specification: Profile Menu Left Sidebar) */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition group mb-1.5"
        >
          <div className="h-8 w-8 rounded-full bg-odoo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="overflow-hidden flex-1 text-left">
            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-odoo-600 transition">
              {user?.name || 'Staff User'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user?.role || 'Warehouse Staff'}</p>
          </div>
        </NavLink>

        <div className="flex gap-1">
          <NavLink
            to="/profile"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200 transition"
          >
            <User className="h-3.5 w-3.5" />
            <span>My Profile</span>
          </NavLink>
          <button
            onClick={logout}
            className="flex items-center justify-center p-1.5 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
