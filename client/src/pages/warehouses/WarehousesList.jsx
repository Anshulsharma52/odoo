import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Warehouse, Plus, MapPin, Boxes, RefreshCw, Layers } from 'lucide-react';

const WarehousesList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [selectedWhId, setSelectedWhId] = useState('');

  // Form states
  const [whFormData, setWhFormData] = useState({ name: '', code: '', address: '' });
  const [locFormData, setLocFormData] = useState({ warehouseId: '', name: '', code: '', type: 'Storage' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warehouses');
      if (res.data.success) {
        setWarehouses(res.data.warehouses);
      }
    } catch (err) {
      console.error('Failed to load warehouses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/warehouses', whFormData);
      if (res.data.success) {
        setIsWhModalOpen(false);
        setWhFormData({ name: '', code: '', address: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating warehouse');
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/warehouses/locations', locFormData);
      if (res.data.success) {
        setIsLocModalOpen(false);
        setLocFormData({ warehouseId: '', name: '', code: '', type: 'Storage' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating location');
    }
  };

  const handleOpenAddLocation = (warehouseId) => {
    setSelectedWhId(warehouseId);
    setLocFormData(prev => ({ ...prev, warehouseId }));
    setIsLocModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-odoo-50 text-odoo-600 border border-odoo-100">
              <Warehouse className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Warehouse & Location Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure physical storage facilities, internal zones, production racks, and receiving bays.
          </p>
        </div>

        <button
          onClick={() => setIsWhModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-odoo-600 hover:bg-odoo-700 text-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Warehouse</span>
        </button>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-odoo-600" />
            Loading warehouse facilities...
          </div>
        ) : (
          warehouses.map((wh) => (
            <div key={wh.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-odoo-50 text-odoo-600 border border-odoo-100">
                      <Warehouse className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{wh.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">Code: {wh.code}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {wh.status || 'Active'}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Physical Address</span>
                    <p className="font-medium text-slate-700 mt-0.5">{wh.address || 'Standard Address'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-medium">Active Stock</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{wh.totalStock} units</p>
                  </div>
                </div>

                {/* Sub Locations / Racks */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Layers className="h-3.5 w-3.5 text-odoo-600" />
                      <span>Racks & Storage Locations ({wh.locations?.length || 0})</span>
                    </div>
                    <button
                      onClick={() => handleOpenAddLocation(wh.id)}
                      className="text-xs font-semibold text-odoo-600 hover:text-odoo-700 transition"
                    >
                      + Add Location
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {wh.locations?.map((loc) => (
                      <div key={loc.id} className="p-2.5 rounded-lg border border-slate-200/70 bg-white hover:border-slate-300 transition">
                        <p className="font-semibold text-xs text-slate-800">{loc.name}</p>
                        <p className="font-mono text-[10px] text-slate-500 mt-0.5">{loc.code} • {loc.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Created: {new Date(wh.createdAt).toLocaleDateString()}</span>
                <span className="text-odoo-600 font-medium">Multi-Warehouse Enabled</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={isWhModalOpen}
        onClose={() => setIsWhModalOpen(false)}
        title="Add New Warehouse Facility"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warehouse Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Distribution Center West"
              value={whFormData.name}
              onChange={(e) => setWhFormData({ ...whFormData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warehouse Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. WH-WEST"
              value={whFormData.code}
              onChange={(e) => setWhFormData({ ...whFormData, code: e.target.value })}
              className="w-full px-3 py-2 uppercase font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
            <textarea
              rows={2}
              placeholder="e.g. 55 Terminal Ave, Industrial Zone"
              value={whFormData.address}
              onChange={(e) => setWhFormData({ ...whFormData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWhModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-odoo-600 hover:bg-odoo-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
            >
              Save Warehouse
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Location Modal */}
      <Modal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        title="Add Storage Location / Rack"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warehouse *</label>
            <select
              required
              value={locFormData.warehouseId}
              onChange={(e) => setLocFormData({ ...locFormData, warehouseId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location / Rack Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rack C"
                value={locFormData.name}
                onChange={(e) => setLocFormData({ ...locFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location Type</label>
              <select
                value={locFormData.type}
                onChange={(e) => setLocFormData({ ...locFormData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              >
                <option value="Storage">Storage Rack/Shelf</option>
                <option value="Input">Input / Staging Bay</option>
                <option value="Output">Output / Packing Bay</option>
                <option value="Internal">Production Floor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Custom Code (Optional)</label>
            <input
              type="text"
              placeholder="Leave empty to auto-generate from warehouse code"
              value={locFormData.code}
              onChange={(e) => setLocFormData({ ...locFormData, code: e.target.value })}
              className="w-full px-3 py-2 uppercase font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLocModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-odoo-600 hover:bg-odoo-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
            >
              Add Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehousesList;
