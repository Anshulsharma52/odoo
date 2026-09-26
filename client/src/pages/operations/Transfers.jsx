import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Transfers = () => {
  const [searchParams] = useSearchParams();
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('create') === 'true');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sourceLocation: '',
    destinationLocation: '',
    productId: '',
    quantity: 10,
    notes: '',
    status: 'READY'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const [trRes, prodRes, locRes] = await Promise.all([
        api.get('/transfers', { params }),
        api.get('/products'),
        api.get('/warehouses/locations')
      ]);

      if (trRes.data.success) setTransfers(trRes.data.transfers);
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
        if (prodRes.data.products.length > 0 && !formData.productId) {
          setFormData(prev => ({ ...prev, productId: prodRes.data.products[0].id }));
        }
      }
      if (locRes.data.success && locRes.data.locations.length >= 2) {
        setLocations(locRes.data.locations);
        if (!formData.sourceLocation || !formData.destinationLocation) {
          setFormData(prev => ({
            ...prev,
            sourceLocation: locRes.data.locations[0].code,
            destinationLocation: locRes.data.locations[1].code
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load transfers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    if (formData.sourceLocation === formData.destinationLocation) {
      setActionLoading(false);
      return setFeedback({ type: 'error', message: 'Source and destination locations must be different.' });
    }

    const selectedProduct = products.find(p => p.id === formData.productId);

    try {
      const payload = {
        sourceLocation: formData.sourceLocation,
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

      const res = await api.post('/transfers', payload);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          sourceLocation: locations[0]?.code || '',
          destinationLocation: locations[1]?.code || '',
          productId: products[0]?.id || '',
          quantity: 10,
          notes: '',
          status: 'READY'
        });
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error creating internal transfer' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async (transferId) => {
    if (!window.confirm('Validate internal transfer? Stock will be relocated between locations while company total remains unchanged.')) return;
    try {
      const res = await api.post(`/transfers/${transferId}/validate`);
      if (res.data.success) {
        alert(res.data.message);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Transfer validation failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <ArrowLeftRight className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Internal Transfers
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Move inventory between racks, bays, or different warehouse locations. Total company stock remains constant.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Internal Transfer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by transfer #, location, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting</option>
            <option value="ready">Ready (Staged)</option>
            <option value="done">Done (Relocated)</option>
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

      {/* Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Transfer #</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4">Destination Location</th>
                <th className="py-3 px-4">Item & Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-600" />
                    Loading transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    No internal transfers found.
                  </td>
                </tr>
              ) : (
                transfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900 font-mono">
                      {tr.transferNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {tr.sourceLocation}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {tr.destinationLocation}
                    </td>
                    <td className="py-3.5 px-4">
                      {tr.items?.map((item, idx) => (
                        <div key={idx} className="font-medium text-slate-800">
                          {item.productName}{' '}
                          <span className="font-bold text-amber-600">
                            ({item.quantity} {item.unitOfMeasure})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={tr.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(tr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {tr.status === 'DONE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Relocated
                        </span>
                      ) : (
                        <button
                          onClick={() => handleValidate(tr.id)}
                          className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-xs transition cursor-pointer"
                        >
                          Validate Transfer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Transfer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Internal Stock Transfer"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
          {feedback && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Location *</label>
              <select
                required
                value={formData.sourceLocation}
                onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Location *</label>
              <select
                required
                value={formData.destinationLocation}
                onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product to Move *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity to Relocate *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Movement Reason / Work Order</label>
            <textarea
              rows={2}
              placeholder="e.g. Move to production rack for scheduled batch assembly"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
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
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Saving...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transfers;
