const store = require('../storage/jsonStore');
const inventoryEngine = require('../services/inventoryEngine');

// @desc    Get all internal transfers
// @route   GET /api/transfers
const getTransfers = (req, res) => {
  const { status, search } = req.query;
  let transfers = store.get('transfers');

  if (status && status !== 'all') {
    transfers = transfers.filter(t => t.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    transfers = transfers.filter(t =>
      t.transferNumber.toLowerCase().includes(q) ||
      t.sourceLocation.toLowerCase().includes(q) ||
      t.destinationLocation.toLowerCase().includes(q) ||
      t.items.some(it => it.productName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: transfers.length,
    transfers: transfers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
};

// @desc    Get transfer by ID
// @route   GET /api/transfers/:id
const getTransferById = (req, res) => {
  const transfer = store.findById('transfers', req.params.id);
  if (!transfer) {
    return res.status(404).json({ success: false, message: 'Transfer record not found' });
  }

  res.json({
    success: true,
    transfer
  });
};

// @desc    Create a new internal transfer
// @route   POST /api/transfers
const createTransfer = (req, res) => {
  const {
    sourceWarehouseId,
    sourceLocation,
    destinationWarehouseId,
    destinationLocation,
    items,
    notes,
    status = 'DRAFT'
  } = req.body;

  if (!sourceLocation || !destinationLocation || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Source location, destination location, and items are required.' });
  }

  if (sourceLocation === destinationLocation) {
    return res.status(400).json({ success: false, message: 'Source and destination locations cannot be identical.' });
  }

  const transferCount = store.get('transfers').length + 1;
  const transferNumber = `TR-${String(transferCount).padStart(4, '0')}`;

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

  const newTransfer = store.insert('transfers', {
    transferNumber,
    sourceWarehouseId: sourceWarehouseId || 'wh-1',
    sourceLocation,
    destinationWarehouseId: destinationWarehouseId || 'wh-1',
    destinationLocation,
    status: status.toUpperCase(), // DRAFT, WAITING, READY
    items: formattedItems,
    notes: notes || '',
    createdBy: req.user?.name || 'Administrator',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Internal transfer created successfully',
    transfer: newTransfer
  });
};

// @desc    Update transfer status
// @route   PUT /api/transfers/:id/status
const updateTransferStatus = (req, res) => {
  const { status } = req.body;
  const transfer = store.findById('transfers', req.params.id);

  if (!transfer) {
    return res.status(404).json({ success: false, message: 'Transfer record not found' });
  }

  if (transfer.status === 'DONE') {
    return res.status(400).json({ success: false, message: 'Cannot modify a completed transfer.' });
  }

  const validStatuses = ['DRAFT', 'WAITING', 'READY', 'CANCELLED'];
  if (!validStatuses.includes(status?.toUpperCase())) {
    return res.status(400).json({ success: false, message: `Invalid status. Valid options: ${validStatuses.join(', ')}` });
  }

  const updated = store.update('transfers', transfer.id, {
    status: status.toUpperCase()
  });

  res.json({
    success: true,
    message: `Transfer status updated to ${status}`,
    transfer: updated
  });
};

// @desc    Validate transfer & relocate stock
// @route   POST /api/transfers/:id/validate
const validateTransfer = (req, res, next) => {
  try {
    const result = inventoryEngine.validateTransfer(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Transfer validated! Stock locations updated and recorded in the Stock Ledger.',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransferStatus,
  validateTransfer
};
