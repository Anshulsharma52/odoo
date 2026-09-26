import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Warehouse,
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opsLoading, setOpsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Dynamic Filters
  const [filterDocType, setFilterDocType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, whRes, catRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/warehouses'),
        api.get('/categories')
      ]);

      if (statsRes.data.success) setStats(statsRes.data);
      if (whRes.data.success) setWarehouses(whRes.data.warehouses || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperations = async () => {
    try {
      setOpsLoading(true);
      const params = {};
      if (filterDocType !== 'all') params.docType = filterDocType;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterWarehouse !== 'all') params.warehouseId = filterWarehouse;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/dashboard/operations', { params });
      if (res.data.success) {
        setOperations(res.data.operations || []);
      }
    } catch (err) {
      console.error('Failed to load operations', err);
    } finally {
      setOpsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [filterDocType, filterStatus, filterWarehouse, searchQuery]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-odoo-600" />
          <p className="text-sm font-medium">Loading inventory dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock ledger, pending movements, and multi-location logistics.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/operations/receipts?create=true')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span>New Receipt</span>
          </button>
          <button
            onClick={() => navigate('/operations/deliveries?create=true')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>New Delivery</span>
          </button>
          <button
            onClick={() => navigate('/operations/transfers?create=true')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => navigate('/operations/adjustments?create=true')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Stock Count</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Matches PDF Problem Statement KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Products */}
        <div 
          onClick={() => navigate('/products')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-odoo-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
            <div className="p-2 rounded-lg bg-odoo-50 text-odoo-600 group-hover:bg-odoo-600 group-hover:text-white transition">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {kpis.totalProducts || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {kpis.totalStockQuantity?.toLocaleString() || 0} total units in stock
          </p>
        </div>

        {/* KPI 2: Low / Out of Stock */}
        <div 
          onClick={() => navigate('/products?status=low_stock')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-amber-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Low / Out of Stock</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900">
              {(kpis.lowStockCount || 0) + (kpis.outOfStockCount || 0)}
            </p>
            {kpis.outOfStockCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                {kpis.outOfStockCount} Out
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            Requires restocking order
          </p>
        </div>

        {/* KPI 3: Pending Receipts */}
        <div 
          onClick={() => navigate('/operations/receipts?status=waiting')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Receipts</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {kpis.pendingReceiptsCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Incoming vendor shipments
          </p>
        </div>

        {/* KPI 4: Pending Deliveries */}
        <div 
          onClick={() => navigate('/operations/deliveries?status=waiting')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Deliveries</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {kpis.pendingDeliveriesCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Outgoing customer dispatches
          </p>
        </div>

        {/* KPI 5: Internal Transfers Scheduled */}
        <div 
          onClick={() => navigate('/operations/transfers')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-purple-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Transfers Scheduled</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {kpis.internalTransfersScheduledCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Inter-location moves
          </p>
        </div>
      </div>

      {/* Dynamic Filters Bar (Matches PDF Dynamic Filters Specification) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-odoo-600" />
            <h2 className="text-sm font-bold text-slate-900">Dynamic Inventory Operations Filter</h2>
          </div>
          <span className="text-xs text-slate-400">
            Showing {operations.length} matching document(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Document Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Document Type
            </label>
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            >
              <option value="all">All Documents</option>
              <option value="receipts">Receipts (Incoming)</option>
              <option value="delivery">Deliveries (Outgoing)</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustments">Stock Adjustments</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting (Picking / In Transit)</option>
              <option value="ready">Ready (Packing / Staged)</option>
              <option value="done">Done (Validated)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Warehouse Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Warehouse / Facility
            </label>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          {/* Live Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Search Document / Partner
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. REC-0001, ABC Steel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filter Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Operational Documents</h3>
          <button
            onClick={() => { setFilterDocType('all'); setFilterStatus('all'); setFilterWarehouse('all'); setSearchQuery(''); }}
            className="text-xs text-odoo-600 hover:text-odoo-700 font-medium"
          >
            Reset Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Document #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Partner / Destination</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Items / Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opsLoading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-odoo-600" />
                    Updating filtered operations...
                  </td>
                </tr>
              ) : operations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No documents matching the current filter criteria.
                  </td>
                </tr>
              ) : (
                operations.map((op) => {
                  let viewUrl = '/operations/receipts';
                  if (op.documentType === 'Delivery') viewUrl = '/operations/deliveries';
                  if (op.documentType === 'Internal') viewUrl = '/operations/transfers';
                  if (op.documentType === 'Adjustments') viewUrl = '/operations/adjustments';

                  return (
                    <tr key={op.id || op.docNumber} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {op.docNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {op.documentType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {op.partner || op.customer || op.supplier || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {op.location || 'Default'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {op.items?.length > 0 ? (
                          <span>
                            {op.items[0].productName || 'Item'}{' '}
                            <span className="font-semibold text-slate-800">
                              ({op.items[0].quantity > 0 ? `+${op.items[0].quantity}` : op.items[0].quantity})
                            </span>
                            {op.items.length > 1 && ` +${op.items.length - 1} more`}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={op.status} />
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => navigate(viewUrl)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-odoo-600 hover:text-odoo-700 p-1 hover:bg-odoo-50 rounded transition"
                        >
                          <span>Manage</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Low Stock Watchlist & Recent Ledger Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Low & Out-of-Stock Watchlist</h3>
            </div>
            <Link to="/products?status=low_stock" className="text-xs font-semibold text-odoo-600 hover:text-odoo-700">
              View All ({stats?.lowStockList?.length || 0})
            </Link>
          </div>

          <div className="space-y-3">
            {!stats?.lowStockList?.length ? (
              <p className="text-xs text-slate-400 py-6 text-center">All inventory levels are currently above reorder points.</p>
            ) : (
              stats.lowStockList.slice(0, 4).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      SKU: <span className="font-mono text-slate-700">{item.sku}</span> • Min Reorder: {item.reorderLevel} {item.unitOfMeasure}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${Number(item.currentStock) === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.currentStock} {item.unitOfMeasure}
                    </p>
                    <button
                      onClick={() => navigate('/operations/receipts?create=true')}
                      className="text-[10px] font-semibold text-odoo-600 hover:underline mt-0.5"
                    >
                      + Create PO Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Ledger Audit Trail */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-odoo-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Stock Ledger Entries</h3>
            </div>
            <Link to="/stock/ledger" className="text-xs font-semibold text-odoo-600 hover:text-odoo-700">
              Full Ledger
            </Link>
          </div>

          <div className="space-y-3">
            {!stats?.recentMovements?.length ? (
              <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded yet.</p>
            ) : (
              stats.recentMovements.slice(0, 4).map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-xs font-bold ${
                      entry.transactionType === 'RECEIPT' ? 'bg-emerald-100 text-emerald-700' :
                      entry.transactionType === 'DELIVERY' ? 'bg-blue-100 text-blue-700' :
                      entry.transactionType === 'TRANSFER' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {entry.transactionType.slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{entry.productName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {entry.referenceNumber} • {entry.destinationLocation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${entry.quantity > 0 ? 'text-emerald-600' : entry.quantity < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Balance: {entry.newStock}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
