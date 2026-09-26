const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['Storage', 'Input', 'Output', 'Internal'], default: 'Storage' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
