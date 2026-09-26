import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import {
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Scale
} from 'lucide-react';

const Adjustments = () => {
  const [searchParams] = useSearchParams();
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('create') === 'true');
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    location: '',
    countedQuantity: 0,
    reason: 'Physical Count Discrepancy'
  });

  const [systemQuantity, setSystemQuantity] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const [adjRes, prodRes, locRes] = await Promise.all([
        api.get('/adjustments', { params }),
        api.get('/products'),
        api.get('/warehouses/locations')
      ]);

      if (adjRes.data.success) setAdjustments(adjRes.data.adjustments);
      if (prodRes.data.success && prodRes.data.products.length > 0) {
        setProducts(prodRes.data.products);
        if (!formData.productId) {
          const firstP = prodRes.data.products[0];
          setFormData(prev => ({ ...prev, productId: firstP.id }));
        }
      }
      if (locRes.data.success && locRes.data.locations.length > 0) {
        setLocations(locRes.data.locations);
        if (!formData.location) {
          setFormData(prev => ({ ...prev, location: locRes.data.locations[0].code }));
        }
      }
    } catch (err) {
      console.error('Failed to load adjustments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  // Update system quantity when product or location changes in modal
  useEffect(() => {
    if (formData.productId && formData.location) {
      const selectedProd = products.find(p => p.id === formData.productId);
      if (selectedProd && selectedProd.locationStock) {
        const recorded = Number(selectedProd.locationStock[formData.location] || 0);
        setSystemQuantity(recorded);
        setFormData(prev => ({ ...prev, countedQuantity: recorded }));
      } else {
        setSystemQuantity(0);
        setFormData(prev => ({ ...prev, countedQuantity: 0 }));
      }
    }
  }, [formData.productId, formData.location, products]);

  const difference = Number(formData.countedQuantity) - Number(systemQuantity);

  const handleApplyAdjustment = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await api.post('/adjustments', {
        productId: formData.productId,
        location: formData.location,
        countedQuantity: Number(formData.countedQuantity),
        reason: formData.reason
      });

      if (res.data.success) {
        alert(res.data.message);
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply adjustment');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Stock Adjustments & Physical Count Reconciliation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile physical inventory discrepancies with system records. Immediate stock correction and immutable ledger delta.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search adjustments by #, product, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
          />
        </div>

        <button
          onClick={fetchData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Adjustment #</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Previous Stock</th>
                <th className="py-3 px-4">Physical Count</th>
                <th className="py-3 px-4">Difference</th>
                <th className="py-3 px-4">Audit Reason</th>
                <th className="py-3 px-6 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading adjustments...
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    No adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900 font-mono">
                      {adj.adjustmentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {adj.productName}{' '}
                      <span className="font-mono text-[10px] text-slate-400">({adj.sku})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {adj.location}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {adj.previousQuantity}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {adj.countedQuantity}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        adj.difference > 0 ? 'bg-emerald-100 text-emerald-800' :
                        adj.difference < 0 ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {adj.reason}
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-500 font-medium">
                      {adj.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Physical Stock Count Adjustment"
      >
        <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Product *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location Rack *</label>
              <select
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reconciliation Comparator Card */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">System Recorded Stock:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{systemQuantity}</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Physical Counted Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.countedQuantity}
                onChange={(e) => setFormData({ ...formData, countedQuantity: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg font-bold text-sm text-slate-900 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-purple-200">
              <span className="font-semibold text-slate-700">Calculated Discrepancy (Delta):</span>
              <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded ${
                difference > 0 ? 'bg-emerald-100 text-emerald-800' :
                difference < 0 ? 'bg-rose-100 text-rose-800' :
                'bg-slate-200 text-slate-800'
              }`}>
                {difference > 0 ? `+${difference}` : difference}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason *</label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
            >
              <option value="Physical Count Discrepancy">Physical Count Discrepancy</option>
              <option value="Damaged in transit / warehouse">Damaged in transit / warehouse</option>
              <option value="Lost or misplaced stock">Lost or misplaced stock</option>
              <option value="Found unaccounted inventory">Found unaccounted inventory</option>
              <option value="Scrapped / Expired items">Scrapped / Expired items</option>
              <option value="Annual audit reconciliation">Annual audit reconciliation</option>
            </select>
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Applying...' : 'Apply Stock Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Adjustments;
