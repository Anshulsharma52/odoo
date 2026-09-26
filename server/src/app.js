const express = require('express');
const cors = require('cors');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const transferRoutes = require('./routes/transferRoutes');
const adjustmentRoutes = require('./routes/adjustmentRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ================================
// Middlewares
// ================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ================================
// API Root
// ================================

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StockSense IMS API is running',
    version: '1.0.0'
  });
});

// ================================
// Health Check
// ================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    application: 'StockSense IMS API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ================================
// API Routes
// ================================

app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);

app.use('/api/categories', categoryRoutes);

app.use('/api/warehouses', warehouseRoutes);

app.use('/api/receipts', receiptRoutes);

app.use('/api/deliveries', deliveryRoutes);

app.use('/api/transfers', transferRoutes);

app.use('/api/adjustments', adjustmentRoutes);

app.use('/api/ledger', ledgerRoutes);

app.use('/api/dashboard', dashboardRoutes);

// ================================
// Error Handling
// ================================

// 404 handler - MUST be after all routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;