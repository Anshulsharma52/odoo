const store = require('../storage/jsonStore');

// @desc    Get dashboard KPIs and aggregated metrics
// @route   GET /api/dashboard/stats
const getDashboardStats = (req, res) => {
  const products = store.get('products');
  const receipts = store.get('receipts');
  const deliveries = store.get('deliveries');
  const transfers = store.get('transfers');
  const adjustments = store.get('adjustments');
  const ledger = store.get('stockLedger');

  // Total products in stock & total quantity
  const totalProducts = products.length;
  const totalStockQuantity = products.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);

  // Low stock and out of stock items
  const lowStockItems = products.filter(p => Number(p.currentStock) > 0 && Number(p.currentStock) <= Number(p.reorderLevel));
  const outOfStockItems = products.filter(p => Number(p.currentStock) === 0);

  // Pending operations (status is not DONE and not CANCELLED)
  const pendingReceipts = receipts.filter(r => r.status !== 'DONE' && r.status !== 'CANCELLED');
  const pendingDeliveries = deliveries.filter(d => d.status !== 'DONE' && d.status !== 'CANCELLED');
  const internalTransfersScheduled = transfers.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED');

  // Recent activity from ledger
  const recentMovements = ledger
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  // Group by document type for operations overview
  const operationsByType = {
    receipts: receipts.length,
    deliveries: deliveries.length,
    transfers: transfers.length,
    adjustments: adjustments.length
  };

  // Status breakdown
  const allOps = [
    ...receipts.map(r => ({ ...r, opType: 'RECEIPT' })),
    ...deliveries.map(d => ({ ...d, opType: 'DELIVERY' })),
    ...transfers.map(t => ({ ...t, opType: 'TRANSFER' })),
    ...adjustments.map(a => ({ ...a, opType: 'ADJUSTMENT' }))
  ];

  const statusBreakdown = {
    draft: allOps.filter(o => o.status === 'DRAFT').length,
    waiting: allOps.filter(o => o.status === 'WAITING').length,
    ready: allOps.filter(o => o.status === 'READY').length,
    done: allOps.filter(o => o.status === 'DONE').length,
    cancelled: allOps.filter(o => o.status === 'CANCELLED').length,
  };

  res.json({
    success: true,
    kpis: {
      totalProducts,
      totalStockQuantity,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      pendingReceiptsCount: pendingReceipts.length,
      pendingDeliveriesCount: pendingDeliveries.length,
      internalTransfersScheduledCount: internalTransfersScheduled.length
    },
    lowStockList: lowStockItems.concat(outOfStockItems),
    recentMovements,
    operationsByType,
    statusBreakdown,
    recentPending: {
      receipts: pendingReceipts.slice(0, 4),
      deliveries: pendingDeliveries.slice(0, 4),
      transfers: internalTransfersScheduled.slice(0, 4)
    }
  });
};

// @desc    Dynamic operations filter query
// @route   GET /api/dashboard/operations
const getFilteredOperations = (req, res) => {
  const { docType, status, warehouseId, category, search } = req.query;

  let ops = [];

  const receipts = store.get('receipts').map(r => ({
    ...r,
    documentType: 'Receipt',
    docNumber: r.receiptNumber,
    partner: r.supplier,
    location: r.destinationLocation
  }));

  const deliveries = store.get('deliveries').map(d => ({
    ...d,
    documentType: 'Delivery',
    docNumber: d.deliveryNumber,
    partner: d.customer,
    location: d.sourceLocation
  }));

  const transfers = store.get('transfers').map(t => ({
    ...t,
    documentType: 'Internal',
    docNumber: t.transferNumber,
    partner: `${t.sourceLocation} → ${t.destinationLocation}`,
    location: t.destinationLocation
  }));

  const adjustments = store.get('adjustments').map(a => ({
    ...a,
    documentType: 'Adjustments',
    docNumber: a.adjustmentNumber,
    partner: a.reason,
    location: a.location,
    items: [{ productName: a.productName, sku: a.sku, quantity: a.difference }]
  }));

  if (!docType || docType.toLowerCase() === 'all') {
    ops = [...receipts, ...deliveries, ...transfers, ...adjustments];
  } else if (docType.toLowerCase() === 'receipts') {
    ops = receipts;
  } else if (docType.toLowerCase() === 'delivery') {
    ops = deliveries;
  } else if (docType.toLowerCase() === 'internal') {
    ops = transfers;
  } else if (docType.toLowerCase() === 'adjustments') {
    ops = adjustments;
  }

  // Filter by status
  if (status && status.toLowerCase() !== 'all') {
    ops = ops.filter(o => o.status?.toLowerCase() === status.toLowerCase());
  }

  // Filter by warehouse
  if (warehouseId && warehouseId.toLowerCase() !== 'all') {
    ops = ops.filter(o => o.warehouseId === warehouseId || o.sourceWarehouseId === warehouseId || o.destinationWarehouseId === warehouseId);
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    ops = ops.filter(o =>
      o.docNumber?.toLowerCase().includes(q) ||
      o.partner?.toLowerCase().includes(q) ||
      o.location?.toLowerCase().includes(q)
    );
  }

  ops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    count: ops.length,
    operations: ops
  });
};

module.exports = {
  getDashboardStats,
  getFilteredOperations
};
