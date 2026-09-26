const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitOfMeasure: { type: String, default: 'units' }
});

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  supplier: { type: String, required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  destinationLocation: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED'], default: 'DRAFT' },
  items: [receiptItemSchema],
  notes: { type: String, default: '' },
  createdBy: { type: String, default: 'Staff' },
  validatedBy: { type: String },
  validatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Receipt', receiptSchema);
