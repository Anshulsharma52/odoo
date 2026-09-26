const store = require('../storage/jsonStore');
const inventoryEngine = require('../services/inventoryEngine');

// @desc    Get all delivery orders
// @route   GET /api/deliveries
const getDeliveries = (req, res) => {
  const { status, search } = req.query;
  let deliveries = store.get('deliveries');

  if (status && status !== 'all') {
    deliveries = deliveries.filter(d => d.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    deliveries = deliveries.filter(d =>
      d.deliveryNumber.toLowerCase().includes(q) ||
      d.customer.toLowerCase().includes(q) ||
      d.items.some(it => it.productName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: deliveries.length,
    deliveries: deliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
};

// @desc    Get single delivery by ID
// @route   GET /api/deliveries/:id
const getDeliveryById = (req, res) => {
  const delivery = store.findById('deliveries', req.params.id);
  if (!delivery) {
    return res.status(404).json({ success: false, message: 'Delivery order not found' });
  }

  res.json({
    success: true,
    delivery
  });
};

// @desc    Create a new delivery order
// @route   POST /api/deliveries
const createDelivery = (req, res) => {
  const { customer, warehouseId, sourceLocation, items, notes, status = 'DRAFT' } = req.body;

  if (!customer || !sourceLocation || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Customer, source location, and at least one item are required.' });
  }

  const deliveryCount = store.get('deliveries').length + 1;
  const deliveryNumber = `DEL-${String(deliveryCount).padStart(4, '0')}`;

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

  const newDelivery = store.insert('deliveries', {
    deliveryNumber,
    customer,
    warehouseId: warehouseId || 'wh-1',
    sourceLocation,
    status: status.toUpperCase(), // DRAFT, WAITING (Pick), READY (Pack)
    items: formattedItems,
    notes: notes || '',
    createdBy: req.user?.name || 'Administrator',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Delivery order created successfully',
    delivery: newDelivery
  });
};

// @desc    Update delivery status (DRAFT -> WAITING [Picking] -> READY [Packing] -> CANCELLED)
// @route   PUT /api/deliveries/:id/status
const updateDeliveryStatus = (req, res) => {
  const { status } = req.body;
  const delivery = store.findById('deliveries', req.params.id);

  if (!delivery) {
    return res.status(404).json({ success: false, message: 'Delivery order not found' });
  }

  if (delivery.status === 'DONE') {
    return res.status(400).json({ success: false, message: 'Cannot modify a completed/validated delivery order.' });
  }

  const validStatuses = ['DRAFT', 'WAITING', 'READY', 'CANCELLED'];
  if (!validStatuses.includes(status?.toUpperCase())) {
    return res.status(400).json({ success: false, message: `Invalid status. Valid options: ${validStatuses.join(', ')}` });
  }

  const updated = store.update('deliveries', delivery.id, {
    status: status.toUpperCase()
  });

  res.json({
    success: true,
    message: `Delivery status updated to ${status}`,
    delivery: updated
  });
};

// @desc    Validate delivery & deduct stock automatically
// @route   POST /api/deliveries/:id/validate
const validateDelivery = (req, res, next) => {
  try {
    const result = inventoryEngine.validateDelivery(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Delivery order validated! Stock has been deducted and logged in the Stock Ledger.',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDeliveryStatus,
  validateDelivery
};
