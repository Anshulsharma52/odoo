const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;


if (MONGODB_URI && process.env.USE_MONGOOSE === 'true') {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log(' Connected to MongoDB instance successfully.'))
    .catch((err) => console.log('⚠️ MongoDB not connected, running with embedded JSON data store.', err.message));
} else {
  console.log('📦 StockSense running with persistent JSON data engine & instant demo seed.');
}

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` StockSense IMS Server running on port ${PORT}`);
  console.log(` REST API URL: http://localhost:${PORT}/api`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
