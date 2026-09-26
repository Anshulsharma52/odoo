const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  adjustmentNumber: { type: String, required: true, unique: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  location: { type: String, required: true },
  previousQuantity: { type: Number, required: true },
  countedQuantity: { type: Number, required: true },
  difference: { type: Number, required: true },
  reason: { type: String, default: 'Physical Count' },
  status: { type: String, default: 'DONE' },
  performedBy: { type: String, default: 'Staff' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Adjustment', adjustmentSchema);
