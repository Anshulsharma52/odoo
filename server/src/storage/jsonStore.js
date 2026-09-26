const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'stocksense-data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('admin123', salt);

  const categories = [
    { id: 'cat-1', name: 'Raw Materials', description: 'Metals, polymers, and raw inputs', productCount: 2, createdAt: new Date().toISOString() },
    { id: 'cat-2', name: 'Finished Goods', description: 'Complete items ready for distribution', productCount: 1, createdAt: new Date().toISOString() },
    { id: 'cat-3', name: 'Hardware', description: 'Screws, bolts, fasteners, brackets', productCount: 1, createdAt: new Date().toISOString() },
    { id: 'cat-4', name: 'Packaging', description: 'Boxes, tapes, wraps, cushioning', productCount: 1, createdAt: new Date().toISOString() },
    { id: 'cat-5', name: 'Electronics', description: 'Cables, chips, circuit components', productCount: 1, createdAt: new Date().toISOString() },
  ];

  const warehouses = [
    {
      id: 'wh-1',
      name: 'Main Warehouse',
      code: 'WH-MAIN',
      address: '100 Industrial Parkway, Sector 4',
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'wh-2',
      name: 'Secondary Warehouse',
      code: 'WH-SEC',
      address: '45 Logistics Blvd, North Hub',
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'wh-3',
      name: 'Production Facility',
      code: 'WH-PLANT',
      address: '12 Assembly Way, Industrial Zone',
      status: 'Active',
      createdAt: new Date().toISOString(),
    }
  ];

  const locations = [
    { id: 'loc-1', warehouseId: 'wh-1', warehouseName: 'Main Warehouse', name: 'Rack A', code: 'WH-MAIN-RACK-A', type: 'Storage' },
    { id: 'loc-2', warehouseId: 'wh-1', warehouseName: 'Main Warehouse', name: 'Rack B', code: 'WH-MAIN-RACK-B', type: 'Storage' },
    { id: 'loc-3', warehouseId: 'wh-1', warehouseName: 'Main Warehouse', name: 'Receiving & Staging', code: 'WH-MAIN-STAGE', type: 'Input' },
    { id: 'loc-4', warehouseId: 'wh-2', warehouseName: 'Secondary Warehouse', name: 'Bay 1', code: 'WH-SEC-BAY-1', type: 'Storage' },
    { id: 'loc-5', warehouseId: 'wh-3', warehouseName: 'Production Facility', name: 'Production Floor', code: 'WH-PLANT-PROD', type: 'Internal' },
  ];

  const products = [
    {
      id: 'prod-1',
      name: 'Steel Rods (12mm)',
      sku: 'STL-001',
      category: 'Raw Materials',
      categoryId: 'cat-1',
      unitOfMeasure: 'kg',
      reorderLevel: 50,
      initialStock: 150,
      currentStock: 150,
      description: 'High tensile carbon steel rods for framing and fabrication',
      locationStock: {
        'WH-MAIN-RACK-A': 100,
        'WH-MAIN-RACK-B': 50
      },
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-2',
      name: 'Ergonomic Office Chair',
      sku: 'CHR-002',
      category: 'Finished Goods',
      categoryId: 'cat-2',
      unitOfMeasure: 'units',
      reorderLevel: 15,
      initialStock: 40,
      currentStock: 40,
      description: 'Adjustable mesh office chair with lumbar support',
      locationStock: {
        'WH-MAIN-RACK-B': 40
      },
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-3',
      name: 'Aluminum Sheets 2mm',
      sku: 'ALM-003',
      category: 'Raw Materials',
      categoryId: 'cat-1',
      unitOfMeasure: 'kg',
      reorderLevel: 60,
      initialStock: 200,
      currentStock: 200,
      description: 'Anodized aluminum alloy sheets for lightweight casing',
      locationStock: {
        'WH-MAIN-RACK-A': 120,
        'WH-PLANT-PROD': 80
      },
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-4',
      name: 'Industrial Screws M8',
      sku: 'SCR-004',
      category: 'Hardware',
      categoryId: 'cat-3',
      unitOfMeasure: 'boxes',
      reorderLevel: 25,
      initialStock: 18,
      currentStock: 18,
      description: 'Standard steel hex cap screws (100 pcs per box)',
      locationStock: {
        'WH-MAIN-RACK-A': 18
      },
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-5',
      name: 'Heavy Duty Cardboard Box',
      sku: 'BOX-005',
      category: 'Packaging',
      categoryId: 'cat-4',
      unitOfMeasure: 'units',
      reorderLevel: 100,
      initialStock: 350,
      currentStock: 350,
      description: 'Double-walled corrugated packing boxes (40x30x30 cm)',
      locationStock: {
        'WH-MAIN-STAGE': 350
      },
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-6',
      name: 'Copper Wire Roll (10m)',
      sku: 'CPR-006',
      category: 'Electronics',
      categoryId: 'cat-5',
      unitOfMeasure: 'units',
      reorderLevel: 15,
      initialStock: 0,
      currentStock: 0,
      description: 'Insulated copper grounding wire',
      locationStock: {},
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const stockLedger = [
    {
      id: 'led-1',
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      transactionType: 'RECEIPT',
      referenceNumber: 'REC-0001',
      productId: 'prod-1',
      productName: 'Steel Rods (12mm)',
      sku: 'STL-001',
      sourceLocation: 'Vendor (ABC Steel Corp)',
      destinationLocation: 'WH-MAIN-RACK-A',
      quantity: 100,
      previousStock: 0,
      newStock: 100,
      performedBy: 'Demo Admin',
      notes: 'Initial stock intake from vendor PO-902'
    },
    {
      id: 'led-2',
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      transactionType: 'RECEIPT',
      referenceNumber: 'REC-0001',
      productId: 'prod-1',
      productName: 'Steel Rods (12mm)',
      sku: 'STL-001',
      sourceLocation: 'Vendor (ABC Steel Corp)',
      destinationLocation: 'WH-MAIN-RACK-B',
      quantity: 50,
      previousStock: 100,
      newStock: 150,
      performedBy: 'Demo Admin',
      notes: 'Secondary rack shelving'
    },
    {
      id: 'led-3',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      transactionType: 'DELIVERY',
      referenceNumber: 'DEL-0001',
      productId: 'prod-2',
      productName: 'Ergonomic Office Chair',
      sku: 'CHR-002',
      sourceLocation: 'WH-MAIN-RACK-B',
      destinationLocation: 'Customer (Apex Tech Corp)',
      quantity: -10,
      previousStock: 50,
      newStock: 40,
      performedBy: 'Demo Admin',
      notes: 'Dispatched order SO-410'
    },
    {
      id: 'led-4',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      transactionType: 'TRANSFER',
      referenceNumber: 'TR-0001',
      productId: 'prod-3',
      productName: 'Aluminum Sheets 2mm',
      sku: 'ALM-003',
      sourceLocation: 'WH-MAIN-RACK-A',
      destinationLocation: 'WH-PLANT-PROD',
      quantity: 40,
      previousStock: 200,
      newStock: 200,
      performedBy: 'Demo Admin',
      notes: 'Shifted to production line for assembly'
    },
    {
      id: 'led-5',
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      transactionType: 'ADJUSTMENT',
      referenceNumber: 'ADJ-0001',
      productId: 'prod-1',
      productName: 'Steel Rods (12mm)',
      sku: 'STL-001',
      sourceLocation: 'WH-MAIN-RACK-A',
      destinationLocation: 'Damaged / Write-Off',
      quantity: -3,
      previousStock: 153,
      newStock: 150,
      performedBy: 'Demo Admin',
      notes: 'Damaged during forklift handling'
    }
  ];

  const receipts = [
    {
      id: 'rec-1',
      receiptNumber: 'REC-0001',
      supplier: 'ABC Steel Corp',
      warehouseId: 'wh-1',
      destinationLocation: 'WH-MAIN-RACK-A',
      status: 'DONE',
      items: [
        { productId: 'prod-1', productName: 'Steel Rods (12mm)', sku: 'STL-001', quantity: 100, unitOfMeasure: 'kg' }
      ],
      notes: 'Delivered via logistics truck #419',
      createdBy: 'Demo Admin',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      validatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'rec-2',
      receiptNumber: 'REC-0002',
      supplier: 'Apex Fasteners Ltd',
      warehouseId: 'wh-1',
      destinationLocation: 'WH-MAIN-STAGE',
      status: 'READY',
      items: [
        { productId: 'prod-4', productName: 'Industrial Screws M8', sku: 'SCR-004', quantity: 30, unitOfMeasure: 'boxes' }
      ],
      notes: 'Awaiting QC inspect before validation',
      createdBy: 'Demo Admin',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'rec-3',
      receiptNumber: 'REC-0003',
      supplier: 'Global Wire Solutions',
      warehouseId: 'wh-1',
      destinationLocation: 'WH-MAIN-RACK-A',
      status: 'WAITING',
      items: [
        { productId: 'prod-6', productName: 'Copper Wire Roll (10m)', sku: 'CPR-006', quantity: 25, unitOfMeasure: 'units' }
      ],
      notes: 'Vendor dispatched from port',
      createdBy: 'Demo Admin',
      createdAt: new Date().toISOString()
    }
  ];

  const deliveries = [
    {
      id: 'del-1',
      deliveryNumber: 'DEL-0001',
      customer: 'Apex Tech Corp',
      warehouseId: 'wh-1',
      sourceLocation: 'WH-MAIN-RACK-B',
      status: 'DONE',
      items: [
        { productId: 'prod-2', productName: 'Ergonomic Office Chair', sku: 'CHR-002', quantity: 10, unitOfMeasure: 'units' }
      ],
      notes: 'Client delivery confirmed by courier',
      createdBy: 'Demo Admin',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      validatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'del-2',
      deliveryNumber: 'DEL-0002',
      customer: 'Horizon Enterprise',
      warehouseId: 'wh-1',
      sourceLocation: 'WH-MAIN-RACK-B',
      status: 'WAITING',
      items: [
        { productId: 'prod-2', productName: 'Ergonomic Office Chair', sku: 'CHR-002', quantity: 5, unitOfMeasure: 'units' }
      ],
      notes: 'Order confirmed, pending warehouse packing',
      createdBy: 'Demo Admin',
      createdAt: new Date().toISOString()
    }
  ];

  const transfers = [
    {
      id: 'tr-1',
      transferNumber: 'TR-0001',
      sourceWarehouseId: 'wh-1',
      sourceLocation: 'WH-MAIN-RACK-A',
      destinationWarehouseId: 'wh-3',
      destinationLocation: 'WH-PLANT-PROD',
      status: 'DONE',
      items: [
        { productId: 'prod-3', productName: 'Aluminum Sheets 2mm', sku: 'ALM-003', quantity: 40, unitOfMeasure: 'kg' }
      ],
      notes: 'Internal move for frame fabrication',
      createdBy: 'Demo Admin',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      validatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'tr-2',
      transferNumber: 'TR-0002',
      sourceWarehouseId: 'wh-1',
      sourceLocation: 'WH-MAIN-RACK-A',
      destinationWarehouseId: 'wh-1',
      destinationLocation: 'WH-MAIN-RACK-B',
      status: 'READY',
      items: [
        { productId: 'prod-1', productName: 'Steel Rods (12mm)', sku: 'STL-001', quantity: 20, unitOfMeasure: 'kg' }
      ],
      notes: 'Balancing rack capacity',
      createdBy: 'Demo Admin',
      createdAt: new Date().toISOString()
    }
  ];

  const adjustments = [
    {
      id: 'adj-1',
      adjustmentNumber: 'ADJ-0001',
      productId: 'prod-1',
      productName: 'Steel Rods (12mm)',
      sku: 'STL-001',
      warehouseId: 'wh-1',
      location: 'WH-MAIN-RACK-A',
      previousQuantity: 103,
      countedQuantity: 100,
      difference: -3,
      reason: 'Damaged in transit',
      status: 'DONE',
      performedBy: 'Demo Admin',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  const users = [
    {
      id: 'usr-1',
      name: 'Demo Admin',
      email: 'admin@stocksense.com',
      password: hashedPassword,
      role: 'Inventory Manager',
      warehouse: 'Main Warehouse',
      phone: '+1 (555) 019-2834',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'usr-2',
      name: 'Alex Staff',
      email: 'staff@stocksense.com',
      password: hashedPassword,
      role: 'Warehouse Staff',
      warehouse: 'Main Warehouse',
      phone: '+1 (555) 019-4822',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ];

  return {
    users,
    categories,
    warehouses,
    locations,
    products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    stockLedger,
    otpCodes: []
  };
}

class JsonStore {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      this.data = initial;
    } else {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading json store, resetting to initial:', err);
        const initial = getInitialData();
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
        this.data = initial;
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving data store:', err);
    }
  }

  get(collection) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    return this.data[collection];
  }

  findById(collection, id) {
    const list = this.get(collection);
    return list.find(item => item.id === id || item._id === id);
  }

  insert(collection, doc) {
    const list = this.get(collection);
    const newDoc = {
      id: doc.id || `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    list.unshift(newDoc);
    this.save();
    return newDoc;
  }

  update(collection, id, updates) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return list[index];
  }

  delete(collection, id) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.save();
    return true;
  }
}

const store = new JsonStore();

module.exports = store;
