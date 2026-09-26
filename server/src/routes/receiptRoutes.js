const express = require('express');
const router = express.Router();
const {
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceiptStatus,
  validateReceipt
} = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getReceipts)
  .post(protect, createReceipt);

router.route('/:id')
  .get(getReceiptById);

router.route('/:id/status')
  .put(protect, updateReceiptStatus);

router.route('/:id/validate')
  .post(protect, validateReceipt);

module.exports = router;
