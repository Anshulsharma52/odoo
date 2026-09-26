import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import {
  ArrowDownLeft,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Warehouse,
  Package,
  RefreshCw,
  FileCheck,
  AlertCircle
} from 'lucide-react';

const Receipts = () => {
  const [searchParams] = useSearchParams();
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('create') === 'true');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    supplier: '',
    destinationLocation: '',
    productId: '',
    quantity: 10,
    notes: '',
    status: 'READY' // Default to ready for quick validation demo
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const [recRes, prodRes, locRes] = await Promise.all([
        api.get('/receipts', { params }),
        api.get('/products'),
        api.get('/warehouses/locations')
      ]);

      if (recRes.data.success) setReceipts(recRes.data.receipts);
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
        if (prodRes.data.products.length > 0 && !formData.productId) {
          setFormData(prev => ({ ...prev, productId: prodRes.data.products[0].id }));
        }
      }
      if (locRes.data.success) {
        setLocations(locRes.data.locations);
        if (locRes.data.locations.length > 0 && !formData.destinationLocation) {
          setFormData(prev => ({ ...prev, destinationLocation: locRes.data.locations[0].code }));
        }
      }
    } catch (err) {
      console.error('Failed to load receipts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    const selectedProduct = products.find(p => p.id === formData.productId);

    try {
      const payload = {
        supplier: formData.supplier,
        destinationLocation: formData.destinationLocation,
        status: formData.status,
        notes: formData.notes,
        items: [
          {
            productId: formData.productId,
            productName: selectedProduct?.name,
            sku: selectedProduct?.sku,
            quantity: Number(formData.quantity)
          }
        ]
      };

      const res = await api.post('/receipts', payload);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          supplier: '',
          destinationLocation: locations[0]?.code || '',
          productId: products[0]?.id || '',
          quantity: 10,
          notes: '',
          status: 'READY'
        });
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error creating receipt' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async (receiptId) => {
    if (!window.confirm('Validate this receipt? Inventory will increase automatically and a Stock Ledger record will be logged.')) return;
    try {
      const res = await api.post(`/receipts/${receiptId}/validate`);
      if (res.data.success) {
        alert(res.data.message);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Validation failed');
    }
  };

  const handleStatusChange = async (receiptId, nextStatus) => {
    try {
      await api.put(`/receipts/${receiptId}/status`, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowDownLeft className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Receipts (Incoming Stock)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Receive items from suppliers. Validating a receipt automatically increases product stock and writes to the ledger.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Receipt</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by receipt #, supplier, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting</option>
            <option value="ready">Ready (Staged)</option>
            <option value="done">Done (Validated)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={fetchData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Receipt #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Destination Location</th>
                <th className="py-3 px-4">Items Received</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                receipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900 font-mono">
                      {rec.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {rec.supplier}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {rec.destinationLocation}
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.items?.map((item, idx) => (
                        <div key={idx} className="font-medium text-slate-800">
                          {item.productName}{' '}
                          <span className="font-bold text-emerald-600">
                            +{item.quantity} {item.unitOfMeasure}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {rec.status === 'DONE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Stock Added
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStatusChange(rec.id, 'WAITING')}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                            >
                              Confirm
                            </button>
                          )}
                          {rec.status === 'WAITING' && (
                            <button
                              onClick={() => handleStatusChange(rec.id, 'READY')}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] transition"
                            >
                              Mark Ready
                            </button>
                          )}
                          {(rec.status === 'READY' || rec.status === 'WAITING') && (
                            <button
                              onClick={() => handleValidate(rec.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition cursor-pointer"
                            >
                              Validate (+Stock)
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Receipt Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Incoming Stock Receipt"
      >
        <form onSubmit={handleCreateReceipt} className="space-y-4 text-xs">
          {feedback && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor *</label>
            <input
              type="text"
              required
              placeholder="e.g. ABC Steel Corp"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product to Receive *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Received *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Shelf/Rack *</label>
              <select
                required
                value={formData.destinationLocation}
                onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              >
                <option value="READY">READY (Ready to validate)</option>
                <option value="WAITING">WAITING (Awaiting shipment)</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purchase Order / Delivery Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. PO-8941 delivered via transport truck #14"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Saving...' : 'Save Receipt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Receipts;
