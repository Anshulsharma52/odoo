import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { Boxes, Search, Warehouse, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';

const StockOverview = () => {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, locRes, whRes] = await Promise.all([
        api.get('/products'),
        api.get('/warehouses/locations'),
        api.get('/warehouses')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (locRes.data.success) setLocations(locRes.data.locations);
      if (whRes.data.success) setWarehouses(whRes.data.warehouses);
    } catch (err) {
      console.error('Failed to fetch stock overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Flatten stock entries by product and location
  const flattenedStock = [];
  products.forEach(p => {
    if (p.locationStock && Object.keys(p.locationStock).length > 0) {
      Object.entries(p.locationStock).forEach(([locCode, qty]) => {
        const loc = locations.find(l => l.code === locCode);
        const wh = warehouses.find(w => w.id === loc?.warehouseId);

        flattenedStock.push({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          category: p.category,
          unitOfMeasure: p.unitOfMeasure,
          reorderLevel: p.reorderLevel,
          locationCode: locCode,
          locationName: loc?.name || locCode,
          warehouseId: wh?.id || '',
          warehouseName: wh?.name || 'Main Warehouse',
          quantity: Number(qty)
        });
      });
    } else {
      // Product with 0 allocated stock
      flattenedStock.push({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        unitOfMeasure: p.unitOfMeasure,
        reorderLevel: p.reorderLevel,
        locationCode: 'Unassigned',
        locationName: 'No Rack Allocated',
        warehouseId: '',
        warehouseName: '—',
        quantity: 0
      });
    }
  });

  // Apply filters
  const filtered = flattenedStock.filter(item => {
    if (warehouseFilter !== 'all' && item.warehouseId !== warehouseFilter) return false;
    if (locationFilter !== 'all' && item.locationCode !== locationFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.locationCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-odoo-50 text-odoo-600 border border-odoo-100">
              <Boxes className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Stock Availability by Location
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-location inventory levels across all warehouse racks and staging bays.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, SKU, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
          >
            <option value="all">All Specific Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filtered.length} location balance(s)
        </span>
      </div>

      {/* Stock Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Specific Location</th>
                <th className="py-3 px-4">Available Qty</th>
                <th className="py-3 px-4">Min Reorder</th>
                <th className="py-3 px-6 text-right">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-odoo-600" />
                    Loading stock levels...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    No matching location stock found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={`${item.productId}-${item.locationCode}-${idx}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {item.productName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {item.sku}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.warehouseName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-800 font-semibold">
                      {item.locationCode} <span className="font-normal text-slate-500">({item.locationName})</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.quantity} <span className="text-[11px] font-normal text-slate-500">{item.unitOfMeasure}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.reorderLevel} {item.unitOfMeasure}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {item.quantity === 0 ? (
                        <StatusBadge status="OUT_OF_STOCK" />
                      ) : item.quantity <= item.reorderLevel ? (
                        <StatusBadge status="LOW_STOCK" />
                      ) : (
                        <StatusBadge status="IN_STOCK" />
                      )}
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

export default StockOverview;
