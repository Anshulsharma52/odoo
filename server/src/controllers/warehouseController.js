const store = require('../storage/jsonStore');

const getWarehouses = (req, res) => {
  const warehouses = store.get('warehouses');
  const locations = store.get('locations');
  const products = store.get('products');

  const detailed = warehouses.map(wh => {
    const whLocations = locations.filter(loc => loc.warehouseId === wh.id);
    let totalStock = 0;
    
    // Count stock present in locations of this warehouse
    whLocations.forEach(loc => {
      products.forEach(prod => {
        if (prod.locationStock && prod.locationStock[loc.code]) {
          totalStock += Number(prod.locationStock[loc.code] || 0);
        }
      });
    });

    return {
      ...wh,
      locationCount: whLocations.length,
      totalStock,
      locations: whLocations
    };
  });

  res.json({
    success: true,
    warehouses: detailed
  });
};

const createWarehouse = (req, res) => {
  const { name, code, address } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Warehouse name and code are required.' });
  }

  const existing = store.get('warehouses').find(w => w.code.toUpperCase() === code.toUpperCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Warehouse with this code already exists.' });
  }

  const newWh = store.insert('warehouses', {
    name,
    code: code.toUpperCase(),
    address: address || '',
    status: 'Active'
  });

  // Automatically create a default storage location for this warehouse
  const defaultLoc = store.insert('locations', {
    warehouseId: newWh.id,
    warehouseName: newWh.name,
    name: 'General Storage',
    code: `${newWh.code}-GEN`,
    type: 'Storage'
  });

  res.status(201).json({
    success: true,
    message: 'Warehouse created successfully',
    warehouse: { ...newWh, locations: [defaultLoc] }
  });
};

const getLocations = (req, res) => {
  const { warehouseId } = req.query;
  let locations = store.get('locations');

  if (warehouseId) {
    locations = locations.filter(loc => loc.warehouseId === warehouseId);
  }

  res.json({
    success: true,
    locations
  });
};

const createLocation = (req, res) => {
  const { warehouseId, name, code, type = 'Storage' } = req.body;
  if (!warehouseId || !name) {
    return res.status(400).json({ success: false, message: 'Warehouse and location name are required.' });
  }

  const warehouse = store.findById('warehouses', warehouseId);
  if (!warehouse) {
    return res.status(404).json({ success: false, message: 'Warehouse not found' });
  }

  const generatedCode = code ? code.toUpperCase() : `${warehouse.code}-${name.replace(/\s+/g, '-').toUpperCase()}`;

  const existingLoc = store.get('locations').find(l => l.code === generatedCode);
  if (existingLoc) {
    return res.status(400).json({ success: false, message: 'Location with this code already exists' });
  }

  const newLoc = store.insert('locations', {
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    name,
    code: generatedCode,
    type
  });

  res.status(201).json({
    success: true,
    message: 'Location added successfully',
    location: newLoc
  });
};

module.exports = {
  getWarehouses,
  createWarehouse,
  getLocations,
  createLocation
};
