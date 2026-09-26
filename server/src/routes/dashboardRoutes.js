const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getFilteredOperations
} = require('../controllers/dashboardController');

router.get('/stats', getDashboardStats);
router.get('/operations', getFilteredOperations);

module.exports = router;
