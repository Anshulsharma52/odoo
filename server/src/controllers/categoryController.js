const store = require('../storage/jsonStore');

const getCategories = (req, res) => {
  const categories = store.get('categories');
  const products = store.get('products');

  // Dynamically compute productCount
  const withCounts = categories.map(cat => ({
    ...cat,
    productCount: products.filter(p => p.category === cat.name || p.categoryId === cat.id).length
  }));

  res.json({
    success: true,
    categories: withCounts
  });
};

const createCategory = (req, res) => {
  const { name, description = '' } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const existing = store.get('categories').find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Category already exists' });
  }

  const newCat = store.insert('categories', {
    name,
    description,
    productCount: 0
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category: newCat
  });
};

const updateCategory = (req, res) => {
  const cat = store.findById('categories', req.params.id);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const { name, description } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;

  const updated = store.update('categories', cat.id, updates);

  res.json({
    success: true,
    message: 'Category updated successfully',
    category: updated
  });
};

const deleteCategory = (req, res) => {
  const cat = store.findById('categories', req.params.id);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  store.delete('categories', cat.id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
