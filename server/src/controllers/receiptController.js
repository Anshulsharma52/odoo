const store = require('../storage/jsonStore');
const inventoryEngine = require('../services/inventoryEngine');

// @desc    Get all receipts with filters
// @route   GET /api/receipts
const getReceipts = (req, res) => {
  const { status, search } = req.query;
  let receipts = store.get('receipts');

  if (status && status !== 'all') {
    receipts = receipts.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    receipts = receipts.filter(r =>
      r.receiptNumber.toLowerCase().includes(q) ||
      r.supplier.toLowerCase().includes(q) ||
      r.items.some(it => it.productName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: receipts.length,
    receipts: receipts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
};

// @desc    Get single receipt by ID
// @route   GET /api/receipts/:id
const getReceiptById = (req, res) => {
  const receipt = store.findById('receipts', req.params.id);
  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  res.json({
    success: true,
    receipt
  });
};

// @desc    Create a new receipt
// @route   POST /api/receipts
const createReceipt = (req, res) => {
  const { supplier, warehouseId, destinationLocation, items, notes, status = 'DRAFT' } = req.body;

  if (!supplier || !destinationLocation || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Supplier, destination location, and at least one item are required.' });
  }

  const receiptCount = store.get('receipts').length + 1;
  const receiptNumber = `REC-${String(receiptCount).padStart(4, '0')}`;

  const formattedItems = items.map(item => {
    const product = store.findById('products', item.productId);
    return {
      productId: item.productId,
      productName: product ? product.name : (item.productName || 'Unknown Product'),
      sku: product ? product.sku : (item.sku || 'N/A'),
      quantity: Number(item.quantity) || 1,
      unitOfMeasure: product ? product.unitOfMeasure : 'units'
    };
  });

  const newReceipt = store.insert('receipts', {
    receiptNumber,
    supplier,
    warehouseId: warehouseId || 'wh-1',
    destinationLocation,
    status: status.toUpperCase(), // DRAFT, WAITING, READY
    items: formattedItems,
    notes: notes || '',
    createdBy: req.user?.name || 'Administrator',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Receipt created successfully',
    receipt: newReceipt
  });
};

// @desc    Update receipt status (DRAFT -> WAITING -> READY -> CANCELLED)
// @route   PUT /api/receipts/:id/status
const updateReceiptStatus = (req, res) => {
  const { status } = req.body;
  const receipt = store.findById('receipts', req.params.id);

  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  if (receipt.status === 'DONE') {
    return res.status(400).json({ success: false, message: 'Cannot modify a completed/validated receipt.' });
  }

  const validStatuses = ['DRAFT', 'WAITING', 'READY', 'CANCELLED'];
  if (!validStatuses.includes(status?.toUpperCase())) {
    return res.status(400).json({ success: false, message: `Invalid status. Valid options: ${validStatuses.join(', ')}` });
  }

  const updated = store.update('receipts', receipt.id, {
    status: status.toUpperCase()
  });

  res.json({
    success: true,
    message: `Receipt status changed to ${status}`,
    receipt: updated
  });
};

// @desc    Validate receipt & increase stock automatically
// @route   POST /api/receipts/:id/validate
const validateReceipt = (req, res, next) => {
  try {
    const result = inventoryEngine.validateReceipt(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Receipt validated successfully! Inventory has been updated and logged in the Stock Ledger.',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceiptStatus,
  validateReceipt
};
