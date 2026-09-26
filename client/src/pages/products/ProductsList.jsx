import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Warehouse,
  Boxes,
  MapPin,
  TrendingDown,
  History
} from 'lucide-react';

const ProductsList = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    categoryId: '',
    unitOfMeasure: 'units',
    reorderLevel: 10,
    initialStock: 0,
    initialLocation: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const [prodRes, catRes, locRes, whRes] = await Promise.all([
        api.get('/products', { params }),
        api.get('/categories'),
        api.get('/warehouses/locations'),
        api.get('/warehouses')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (locRes.data.success) {
        setLocations(locRes.data.locations);
        if (locRes.data.locations.length > 0 && !formData.initialLocation) {
          setFormData(prev => ({ ...prev, initialLocation: locRes.data.locations[0].code }));
        }
      }
      if (whRes.data.success) setWarehouses(whRes.data.warehouses);
    } catch (err) {
      console.error('Failed to fetch product data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter, statusFilter]);

  const handleOpenDetails = async (product) => {
    setSelectedProduct(product);
    try {
      const res = await api.get(`/products/${product.id}`);
      if (res.data.success) {
        setProductDetails(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch product details', err);
    }
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      categoryId: product.categoryId || '',
      unitOfMeasure: product.unitOfMeasure || 'units',
      reorderLevel: product.reorderLevel || 10,
      description: product.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          sku: '',
          category: categories[0]?.name || 'Raw Materials',
          categoryId: categories[0]?.id || '',
          unitOfMeasure: 'units',
          reorderLevel: 10,
          initialStock: 0,
          initialLocation: locations[0]?.code || '',
          description: ''
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/products/${selectedProduct.id}`, formData);
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Product Master & Stock Availability
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage product catalog, reordering thresholds, and per-location inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              sku: '',
              category: categories[0]?.name || 'Raw Materials',
              categoryId: categories[0]?.id || '',
              unitOfMeasure: 'units',
              reorderLevel: 10,
              initialStock: 0,
              initialLocation: locations[0]?.code || '',
              description: ''
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-odoo-600 hover:bg-odoo-700 text-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (Optimal)</option>
            <option value="low_stock">Low Stock (≤ Reorder Level)</option>
            <option value="out_of_stock">Out of Stock (0 units)</option>
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

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Product Details</th>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-odoo-600" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockNum = Number(product.currentStock) || 0;
                  const reorderNum = Number(product.reorderLevel) || 0;
                  const isOutOfStock = stockNum === 0;
                  const isLowStock = !isOutOfStock && stockNum <= reorderNum;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-odoo-50 text-odoo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-odoo-100">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{product.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {product.sku}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {product.category}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {stockNum} <span className="text-[11px] font-normal text-slate-500">{product.unitOfMeasure}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {reorderNum} {product.unitOfMeasure}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <StatusBadge status="OUT_OF_STOCK" />
                        ) : isLowStock ? (
                          <StatusBadge status="LOW_STOCK" />
                        ) : (
                          <StatusBadge status="IN_STOCK" />
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(product)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-odoo-600 hover:bg-odoo-50 transition"
                            title="View stock per location & history"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Inventory Product"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Steel Rods (12mm)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU / Code (Leave empty to auto-generate)</label>
              <input
                type="text"
                placeholder="e.g. STL-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 uppercase font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Category</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selCat = categories.find(c => c.name === e.target.value);
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    categoryId: selCat?.id || ''
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <select
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              >
                <option value="units">units</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="boxes">boxes</option>
                <option value="liters">liters</option>
                <option value="meters">meters</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Level Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <Boxes className="h-4 w-4 text-amber-600" />
              <span>Initial Opening Stock (Optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Initial Storage Location</label>
                <select
                  value={formData.initialLocation}
                  onChange={(e) => setFormData({ ...formData, initialLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Technical specifications or handling notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-odoo-600 hover:bg-odoo-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product Details"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Level Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-odoo-600 hover:bg-odoo-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
            >
              Update Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Details Modal (Matches PDF: Stock availability per location) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={productDetails?.product?.name || 'Product Details'}
        maxWidth="max-w-3xl"
      >
        {productDetails && (
          <div className="space-y-6 text-xs">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">SKU Code</span>
                <p className="font-mono text-sm font-bold text-slate-900 mt-0.5">{productDetails.product.sku}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Total Current Stock</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {productDetails.product.currentStock} {productDetails.product.unitOfMeasure}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Reorder Threshold</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {productDetails.product.reorderLevel} {productDetails.product.unitOfMeasure}
                </p>
              </div>
            </div>

            {/* Location Stock Breakdown (Core Requirement from PDF Page 2) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-odoo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Stock Availability Per Location
                </h4>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Location Code</th>
                      <th className="py-2.5 px-4">Warehouse Facility</th>
                      <th className="py-2.5 px-4 text-right">Available Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.keys(productDetails.product.locationStock || {}).length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-4 text-center text-slate-400">
                          No stock allocated to any location currently.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(productDetails.product.locationStock || {}).map(([locCode, qty]) => {
                        const locObj = locations.find(l => l.code === locCode);
                        return (
                          <tr key={locCode} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                              {locCode} {locObj ? `(${locObj.name})` : ''}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">
                              {locObj?.warehouseName || 'Main Warehouse'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                              {qty} <span className="font-normal text-slate-500">{productDetails.product.unitOfMeasure}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Transaction History for this Product */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-odoo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Recent Ledger Movements
                </h4>
              </div>

              <div className="space-y-2">
                {productDetails.recentMovements?.length === 0 ? (
                  <p className="text-slate-400 py-3 text-center">No ledger entries for this product.</p>
                ) : (
                  productDetails.recentMovements.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-[11px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            m.transactionType === 'RECEIPT' ? 'bg-emerald-100 text-emerald-800' :
                            m.transactionType === 'DELIVERY' ? 'bg-blue-100 text-blue-800' :
                            m.transactionType === 'TRANSFER' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {m.transactionType}
                          </span>
                          <span className="font-mono text-slate-700 font-semibold">{m.referenceNumber}</span>
                        </div>
                        <p className="text-slate-500 mt-1">{m.sourceLocation} → {m.destinationLocation}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${m.quantity > 0 ? 'text-emerald-600' : m.quantity < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {productDetails.product.unitOfMeasure}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(m.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsList;
