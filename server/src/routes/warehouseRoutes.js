const express = require('express');
const router = express.Router();
const {
  getWarehouses,
  createWarehouse,
  getLocations,
  createLocation
} = require('../controllers/warehouseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getWarehouses)
  .post(protect, createWarehouse);

router.route('/locations')
  .get(getLocations)
  .post(protect, createLocation);

module.exports = router;
