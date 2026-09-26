const store = require('../storage/jsonStore');

// @desc    Get all products with filtering & search
// @route   GET /api/products
const getProducts = (req, res) => {
  const { search, category, status, warehouseId } = req.query;
  let products = store.get('products');

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category || p.categoryId === category);
  }

  if (status) {
    if (status === 'out_of_stock') {
      products = products.filter(p => Number(p.currentStock) === 0);
    } else if (status === 'low_stock') {
      products = products.filter(p => Number(p.currentStock) > 0 && Number(p.currentStock) <= Number(p.reorderLevel));
    } else if (status === 'in_stock') {
      products = products.filter(p => Number(p.currentStock) > Number(p.reorderLevel));
    }
  }

  res.json({
    success: true,
    count: products.length,
    products
  });
};

// @desc    Get single product by ID with location breakdown & history
// @route   GET /api/products/:id
const getProductById = (req, res) => {
  const product = store.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Find recent ledger activity for this product
  const ledger = store.get('stockLedger')
    .filter(entry => entry.productId === product.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  res.json({
    success: true,
    product,
    recentMovements: ledger
  });
};

// @desc    Create a new product
// @route   POST /api/products
const createProduct = (req, res) => {
  const {
    name,
    sku,
    category,
    categoryId,
    unitOfMeasure = 'units',
    initialStock = 0,
    reorderLevel = 10,
    description = '',
    initialLocation = 'WH-MAIN-RACK-A'
  } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Product name is required.' });
  }

  const generatedSku = sku ? sku.trim().toUpperCase() : `SKU-${Date.now().toString().slice(-6)}`;

  // Check unique SKU
  const existingSku = store.get('products').find(p => p.sku.toUpperCase() === generatedSku);
  if (existingSku) {
    return res.status(400).json({ success: false, message: `Product with SKU "${generatedSku}" already exists.` });
  }

  const initStockNum = Math.max(0, Number(initialStock) || 0);
  const locationStock = {};
  if (initStockNum > 0 && initialLocation) {
    locationStock[initialLocation] = initStockNum;
  }

  const newProduct = store.insert('products', {
    name,
    sku: generatedSku,
    category: category || 'General',
    categoryId: categoryId || 'cat-1',
    unitOfMeasure,
    reorderLevel: Number(reorderLevel) || 0,
    initialStock: initStockNum,
    currentStock: initStockNum,
    description,
    locationStock
  });

  // If initial stock is greater than 0, create initial ledger transaction
  if (initStockNum > 0) {
    store.insert('stockLedger', {
      date: new Date().toISOString(),
      transactionType: 'RECEIPT',
      referenceNumber: 'INITIAL-STOCK',
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      sourceLocation: 'Opening Inventory',
      destinationLocation: initialLocation,
      quantity: initStockNum,
      previousStock: 0,
      newStock: initStockNum,
      performedBy: req.user?.name || 'Administrator',
      notes: 'Initial inventory balance setup'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product: newProduct
  });
};

// @desc    Update product details
// @route   PUT /api/products/:id
const updateProduct = (req, res) => {
  const product = store.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const { name, category, categoryId, unitOfMeasure, reorderLevel, description } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (category) updates.category = category;
  if (categoryId) updates.categoryId = categoryId;
  if (unitOfMeasure) updates.unitOfMeasure = unitOfMeasure;
  if (reorderLevel !== undefined) updates.reorderLevel = Number(reorderLevel);
  if (description !== undefined) updates.description = description;

  const updated = store.update('products', product.id, updates);

  res.json({
    success: true,
    message: 'Product updated successfully',
    product: updated
  });
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = (req, res) => {
  const product = store.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  store.delete('products', product.id);

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
