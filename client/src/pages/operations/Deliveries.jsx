import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import {
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Deliveries = () => {
  const [searchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState([]);
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
    customer: '',
    sourceLocation: '',
    productId: '',
    quantity: 5,
    notes: '',
    status: 'READY'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const [delRes, prodRes, locRes] = await Promise.all([
        api.get('/deliveries', { params }),
        api.get('/products'),
        api.get('/warehouses/locations')
      ]);

      if (delRes.data.success) setDeliveries(delRes.data.deliveries);
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
        if (prodRes.data.products.length > 0 && !formData.productId) {
          setFormData(prev => ({ ...prev, productId: prodRes.data.products[0].id }));
        }
      }
      if (locRes.data.success) {
        setLocations(locRes.data.locations);
        if (locRes.data.locations.length > 0 && !formData.sourceLocation) {
          setFormData(prev => ({ ...prev, sourceLocation: locRes.data.locations[0].code }));
        }
      }
    } catch (err) {
      console.error('Failed to load deliveries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    const selectedProduct = products.find(p => p.id === formData.productId);

    try {
      const payload = {
        customer: formData.customer,
        sourceLocation: formData.sourceLocation,
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

      const res = await api.post('/deliveries', payload);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          customer: '',
          sourceLocation: locations[0]?.code || '',
          productId: products[0]?.id || '',
          quantity: 5,
          notes: '',
          status: 'READY'
        });
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error creating delivery order' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async (deliveryId) => {
    if (!window.confirm('Validate this delivery order? Stock will decrease automatically and be recorded in the Stock Ledger.')) return;
    try {
      const res = await api.post(`/deliveries/${deliveryId}/validate`);
      if (res.data.success) {
        alert(res.data.message);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Validation failed. Check available stock.');
    }
  };

  const handleStatusChange = async (deliveryId, nextStatus) => {
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ArrowUpRight className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Delivery Orders (Outgoing Stock)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pick, pack, and ship orders to customers. Validating a delivery order deducts items from storage and logs the transaction.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Delivery Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by delivery #, customer, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting (Picking)</option>
            <option value="ready">Ready (Packed)</option>
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

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Delivery #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4">Items Dispatched</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-6 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading deliveries...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    No delivery orders found.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900 font-mono">
                      {del.deliveryNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {del.customer}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {del.sourceLocation}
                    </td>
                    <td className="py-3.5 px-4">
                      {del.items?.map((item, idx) => (
                        <div key={idx} className="font-medium text-slate-800">
                          {item.productName}{' '}
                          <span className="font-bold text-rose-600">
                            -{item.quantity} {item.unitOfMeasure}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={del.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(del.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {del.status === 'DONE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Stock Deducted
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {del.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStatusChange(del.id, 'WAITING')}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                            >
                              Pick Items
                            </button>
                          )}
                          {del.status === 'WAITING' && (
                            <button
                              onClick={() => handleStatusChange(del.id, 'READY')}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] transition"
                            >
                              Pack Items
                            </button>
                          )}
                          {(del.status === 'READY' || del.status === 'WAITING') && (
                            <button
                              onClick={() => handleValidate(del.id)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs transition cursor-pointer"
                            >
                              Validate (-Stock)
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

      {/* Create Delivery Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Outgoing Delivery Order"
      >
        <form onSubmit={handleCreateDelivery} className="space-y-4 text-xs">
          {feedback && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer / Client Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Tech Corp"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product to Deliver *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currentStock} {p.unitOfMeasure} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Pick Rack *</label>
              <select
                required
                value={formData.sourceLocation}
                onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="READY">READY (Packed & ready to validate)</option>
                <option value="WAITING">WAITING (Picking in progress)</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shipping / Customer Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Sales order SO-1049, ship via express freight"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Saving...' : 'Create Delivery Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deliveries;
