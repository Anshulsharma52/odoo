const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  unitOfMeasure: { type: String, default: 'units' },
  reorderLevel: { type: Number, default: 10 },
  initialStock: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  description: { type: String, default: '' },
  locationStock: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
