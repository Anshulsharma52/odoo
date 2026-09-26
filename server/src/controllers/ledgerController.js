const store = require('../storage/jsonStore');

// @desc    Get Stock Ledger / Move History
// @route   GET /api/ledger
const getLedgerEntries = (req, res) => {
  const { productId, transactionType, location, search } = req.query;
  let ledger = store.get('stockLedger');

  if (productId) {
    ledger = ledger.filter(item => item.productId === productId);
  }

  if (transactionType && transactionType !== 'all') {
    ledger = ledger.filter(item => item.transactionType.toUpperCase() === transactionType.toUpperCase());
  }

  if (location && location !== 'all') {
    ledger = ledger.filter(item =>
      (item.sourceLocation && item.sourceLocation.includes(location)) ||
      (item.destinationLocation && item.destinationLocation.includes(location))
    );
  }

  if (search) {
    const q = search.toLowerCase();
    ledger = ledger.filter(item =>
      item.referenceNumber.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      (item.performedBy && item.performedBy.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  }

  // Sort descending by date
  ledger = ledger.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Compute breakdown stats
  const stats = {
    totalTransactions: ledger.length,
    receipts: ledger.filter(l => l.transactionType === 'RECEIPT').length,
    deliveries: ledger.filter(l => l.transactionType === 'DELIVERY').length,
    transfers: ledger.filter(l => l.transactionType === 'TRANSFER').length,
    adjustments: ledger.filter(l => l.transactionType === 'ADJUSTMENT').length,
  };

  res.json({
    success: true,
    count: ledger.length,
    stats,
    ledger
  });
};

module.exports = {
  getLedgerEntries
};
