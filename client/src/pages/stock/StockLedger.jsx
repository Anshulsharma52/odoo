import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';

const StockLedger = () => {
  const [ledger, setLedger] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter !== 'all') params.transactionType = typeFilter;
      if (search) params.search = search;

      const res = await api.get('/ledger', { params });
      if (res.data.success) {
        setLedger(res.data.ledger);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stock ledger', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [typeFilter, search]);

  const handleExportCSV = () => {
    if (!ledger.length) return alert('No ledger records to export');

    const headers = ['Date', 'Type', 'Reference', 'Product', 'SKU', 'Source', 'Destination', 'Quantity Change', 'Pre Stock', 'New Stock', 'User', 'Notes'];
    const rows = ledger.map(l => [
      `"${new Date(l.date).toLocaleString()}"`,
      `"${l.transactionType}"`,
      `"${l.referenceNumber}"`,
      `"${l.productName}"`,
      `"${l.sku}"`,
      `"${l.sourceLocation}"`,
      `"${l.destinationLocation}"`,
      l.quantity,
      l.previousStock,
      l.newStock,
      `"${l.performedBy}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-odoo-50 text-odoo-600 border border-odoo-100">
              <History className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Stock Ledger & Move History
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete, immutable audit trail of every inventory movement, transfer, receipt, and adjustment.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Moves</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalTransactions}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase">Receipts</span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.receipts}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-blue-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase">Deliveries</span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.deliveries}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-amber-600">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase">Transfers</span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.transfers}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-purple-600">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase">Adjustments</span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.adjustments}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ref #, product, user, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
          >
            <option value="all">All Movement Types</option>
            <option value="RECEIPT">RECEIPT (Vendor Intake)</option>
            <option value="DELIVERY">DELIVERY (Customer Dispatch)</option>
            <option value="TRANSFER">TRANSFER (Internal Move)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Audit Reconciliation)</option>
          </select>
        </div>

        <button
          onClick={fetchLedger}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference Doc</th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Route (From → To)</th>
                <th className="py-3 px-4">Quantity Change</th>
                <th className="py-3 px-4">Balance Post-Move</th>
                <th className="py-3 px-6 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-odoo-600" />
                    Loading stock ledger...
                  </td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    No ledger transactions found.
                  </td>
                </tr>
              ) : (
                ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-600">
                      {new Date(entry.date).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] ${
                        entry.transactionType === 'RECEIPT' ? 'bg-emerald-100 text-emerald-800' :
                        entry.transactionType === 'DELIVERY' ? 'bg-blue-100 text-blue-800' :
                        entry.transactionType === 'TRANSFER' ? 'bg-amber-100 text-amber-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {entry.transactionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {entry.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{entry.productName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{entry.sku}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      <span>{entry.sourceLocation}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="font-semibold text-slate-800">{entry.destinationLocation}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold font-mono text-xs ${
                        entry.quantity > 0 ? 'text-emerald-600' :
                        entry.quantity < 0 ? 'text-rose-600' :
                        'text-slate-700'
                      }`}>
                        {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {entry.newStock}
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-500 font-medium">
                      {entry.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockLedger;
