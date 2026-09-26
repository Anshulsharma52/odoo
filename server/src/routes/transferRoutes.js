const express = require('express');
const router = express.Router();
const {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransferStatus,
  validateTransfer
} = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTransfers)
  .post(protect, createTransfer);

router.route('/:id')
  .get(getTransferById);

router.route('/:id/status')
  .put(protect, updateTransferStatus);

router.route('/:id/validate')
  .post(protect, validateTransfer);

module.exports = router;
