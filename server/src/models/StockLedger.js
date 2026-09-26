const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  transactionType: {
    type: String,
    enum: ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'],
    required: true
  },
  referenceNumber: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  sourceLocation: { type: String, required: true },
  destinationLocation: { type: String, required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  performedBy: { type: String, default: 'System' },
  notes: { type: String, default: '' }
});

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
