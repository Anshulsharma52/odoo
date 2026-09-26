const express = require('express');
const router = express.Router();
const { getLedgerEntries } = require('../controllers/ledgerController');

router.get('/', getLedgerEntries);

module.exports = router;
