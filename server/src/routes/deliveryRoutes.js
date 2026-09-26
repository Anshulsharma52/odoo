const express = require('express');
const router = express.Router();
const {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDeliveryStatus,
  validateDelivery
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDeliveries)
  .post(protect, createDelivery);

router.route('/:id')
  .get(getDeliveryById);

router.route('/:id/status')
  .put(protect, updateDeliveryStatus);

router.route('/:id/validate')
  .post(protect, validateDelivery);

module.exports = router;
