const store = require('../storage/jsonStore');
const inventoryEngine = require('../services/inventoryEngine');

// @desc    Get all inventory adjustments
// @route   GET /api/adjustments
const getAdjustments = (req, res) => {
  const { productId, location, search } = req.query;
  let adjustments = store.get('adjustments');

  if (productId) {
    adjustments = adjustments.filter(a => a.productId === productId);
  }

  if (location) {
    adjustments = adjustments.filter(a => a.location === location);
  }

  if (search) {
    const q = search.toLowerCase();
    adjustments = adjustments.filter(a =>
      a.adjustmentNumber.toLowerCase().includes(q) ||
      a.productName.toLowerCase().includes(q) ||
      a.sku.toLowerCase().includes(q) ||
      (a.reason && a.reason.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: adjustments.length,
    adjustments: adjustments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
};

// @desc    Create and immediately apply an inventory adjustment
// @route   POST /api/adjustments
const createAdjustment = (req, res, next) => {
  try {
    const { productId, location, countedQuantity, reason, warehouseId } = req.body;

    if (!productId || !location || countedQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product, location, and counted quantity are required.'
      });
    }

    const result = inventoryEngine.applyAdjustment({
      productId,
      location,
      countedQuantity,
      reason,
      warehouseId
    }, req.user);

    res.status(201).json({
      success: true,
      message: 'Physical inventory adjustment applied and logged to Stock Ledger.',
      ...result
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getAdjustments,
  createAdjustment
};
