const store = require('../storage/jsonStore');

class InventoryEngine {
  /**
   * Validate incoming receipt and record to Stock Ledger
   */
  validateReceipt(receiptId, user) {
    const receipt = store.findById('receipts', receiptId);
    if (!receipt) throw new Error('Receipt not found');
    if (receipt.status === 'DONE') throw new Error('Receipt is already validated');
    if (receipt.status === 'CANCELLED') throw new Error('Cannot validate a cancelled receipt');

    const destinationLocation = receipt.destinationLocation;
    if (!destinationLocation) throw new Error('Destination location is required for receipt');

    const ledgerEntries = [];

    // Process each line item
    for (const item of receipt.items) {
      const product = store.findById('products', item.productId);
      if (!product) throw new Error(`Product ${item.productName || item.productId} not found`);

      const qty = Number(item.quantity);
      if (qty <= 0) throw new Error('Item quantity must be greater than zero');

      const prevStock = Number(product.currentStock || 0);
      const newStock = prevStock + qty;

      if (!product.locationStock) product.locationStock = {};
      const prevLocStock = Number(product.locationStock[destinationLocation] || 0);
      product.locationStock[destinationLocation] = prevLocStock + qty;
      product.currentStock = newStock;

      store.update('products', product.id, {
        currentStock: product.currentStock,
        locationStock: product.locationStock
      });

      // Stock Ledger Entry
      const ledgerEntry = store.insert('stockLedger', {
        date: new Date().toISOString(),
        transactionType: 'RECEIPT',
        referenceNumber: receipt.receiptNumber,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        sourceLocation: `Vendor (${receipt.supplier})`,
        destinationLocation: destinationLocation,
        quantity: qty,
        previousStock: prevStock,
        newStock: newStock,
        performedBy: user?.name || 'Authorized Staff',
        notes: receipt.notes || `Stock intake from supplier ${receipt.supplier}`
      });

      ledgerEntries.push(ledgerEntry);
    }

    // Update receipt status
    const updatedReceipt = store.update('receipts', receiptId, {
      status: 'DONE',
      validatedAt: new Date().toISOString(),
      validatedBy: user?.name || 'Staff'
    });

    return { receipt: updatedReceipt, ledgerEntries };
  }

  /**
   * Validate outgoing delivery order and record to Stock Ledger
   */
  validateDelivery(deliveryId, user) {
    const delivery = store.findById('deliveries', deliveryId);
    if (!delivery) throw new Error('Delivery order not found');
    if (delivery.status === 'DONE') throw new Error('Delivery order is already validated');
    if (delivery.status === 'CANCELLED') throw new Error('Cannot validate a cancelled delivery');

    const sourceLocation = delivery.sourceLocation;
    if (!sourceLocation) throw new Error('Source location is required for delivery');

    // First check stock availability for all items to guarantee atomicity
    for (const item of delivery.items) {
      const product = store.findById('products', item.productId);
      if (!product) throw new Error(`Product ${item.productName || item.productId} not found`);

      const qty = Number(item.quantity);
      const locStock = Number(product.locationStock?.[sourceLocation] || 0);

      if (locStock < qty) {
        throw new Error(`Insufficient stock for "${product.name}" at location ${sourceLocation}. Available: ${locStock}, Required: ${qty}`);
      }
    }

    const ledgerEntries = [];

    // Deduct stock and log transactions
    for (const item of delivery.items) {
      const product = store.findById('products', item.productId);
      const qty = Number(item.quantity);

      const prevStock = Number(product.currentStock || 0);
      const newStock = Math.max(0, prevStock - qty);

      product.locationStock[sourceLocation] = Math.max(0, Number(product.locationStock[sourceLocation]) - qty);
      product.currentStock = newStock;

      store.update('products', product.id, {
        currentStock: product.currentStock,
        locationStock: product.locationStock
      });

      // Stock Ledger Entry
      const ledgerEntry = store.insert('stockLedger', {
        date: new Date().toISOString(),
        transactionType: 'DELIVERY',
        referenceNumber: delivery.deliveryNumber,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        sourceLocation: sourceLocation,
        destinationLocation: `Customer (${delivery.customer})`,
        quantity: -qty,
        previousStock: prevStock,
        newStock: newStock,
        performedBy: user?.name || 'Authorized Staff',
        notes: delivery.notes || `Dispatched to customer ${delivery.customer}`
      });

      ledgerEntries.push(ledgerEntry);
    }

    // Update delivery status
    const updatedDelivery = store.update('deliveries', deliveryId, {
      status: 'DONE',
      validatedAt: new Date().toISOString(),
      validatedBy: user?.name || 'Staff'
    });

    return { delivery: updatedDelivery, ledgerEntries };
  }

  /**
   * Validate internal transfer between company locations
   */
  validateTransfer(transferId, user) {
    const transfer = store.findById('transfers', transferId);
    if (!transfer) throw new Error('Transfer record not found');
    if (transfer.status === 'DONE') throw new Error('Transfer is already validated');
    if (transfer.status === 'CANCELLED') throw new Error('Cannot validate a cancelled transfer');

    const { sourceLocation, destinationLocation } = transfer;
    if (!sourceLocation || !destinationLocation) {
      throw new Error('Both source and destination locations are required');
    }
    if (sourceLocation === destinationLocation) {
      throw new Error('Source and destination location cannot be the same');
    }

    // Pre-check stock at source location
    for (const item of transfer.items) {
      const product = store.findById('products', item.productId);
      if (!product) throw new Error(`Product ${item.productName || item.productId} not found`);

      const qty = Number(item.quantity);
      const locStock = Number(product.locationStock?.[sourceLocation] || 0);

      if (locStock < qty) {
        throw new Error(`Insufficient stock for "${product.name}" at ${sourceLocation}. Available: ${locStock}, Moving: ${qty}`);
      }
    }

    const ledgerEntries = [];

    // Transfer stock: Total stock stays identical, location balances change
    for (const item of transfer.items) {
      const product = store.findById('products', item.productId);
      const qty = Number(item.quantity);

      if (!product.locationStock) product.locationStock = {};
      product.locationStock[sourceLocation] = Number(product.locationStock[sourceLocation] || 0) - qty;
      product.locationStock[destinationLocation] = Number(product.locationStock[destinationLocation] || 0) + qty;

      store.update('products', product.id, {
        locationStock: product.locationStock
      });

      // Stock Ledger Entry
      const ledgerEntry = store.insert('stockLedger', {
        date: new Date().toISOString(),
        transactionType: 'TRANSFER',
        referenceNumber: transfer.transferNumber,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        sourceLocation: sourceLocation,
        destinationLocation: destinationLocation,
        quantity: qty,
        previousStock: product.currentStock,
        newStock: product.currentStock, // Unchanged in total!
        performedBy: user?.name || 'Authorized Staff',
        notes: transfer.notes || `Internal transfer from ${sourceLocation} to ${destinationLocation}`
      });

      ledgerEntries.push(ledgerEntry);
    }

    const updatedTransfer = store.update('transfers', transferId, {
      status: 'DONE',
      validatedAt: new Date().toISOString(),
      validatedBy: user?.name || 'Staff'
    });

    return { transfer: updatedTransfer, ledgerEntries };
  }

  /**
   * Apply stock adjustment after physical inventory count
   */
  applyAdjustment(adjustmentData, user) {
    const { productId, location, countedQuantity, reason } = adjustmentData;
    const product = store.findById('products', productId);
    if (!product) throw new Error('Product not found');

    const counted = Number(countedQuantity);
    if (isNaN(counted) || counted < 0) throw new Error('Counted quantity must be a non-negative number');

    if (!product.locationStock) product.locationStock = {};
    const previousLocStock = Number(product.locationStock[location] || 0);
    const difference = counted - previousLocStock;

    const previousTotalStock = Number(product.currentStock || 0);
    const newTotalStock = Math.max(0, previousTotalStock + difference);

    // Apply location and total stock changes
    product.locationStock[location] = counted;
    product.currentStock = newTotalStock;

    store.update('products', product.id, {
      currentStock: newTotalStock,
      locationStock: product.locationStock
    });

    const adjustmentNumber = `ADJ-${String(store.get('adjustments').length + 1).padStart(4, '0')}`;

    const adjustmentRecord = store.insert('adjustments', {
      adjustmentNumber,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      warehouseId: adjustmentData.warehouseId || 'wh-1',
      location: location,
      previousQuantity: previousLocStock,
      countedQuantity: counted,
      difference: difference,
      reason: reason || 'Physical inventory audit',
      status: 'DONE',
      performedBy: user?.name || 'Demo Admin',
      createdAt: new Date().toISOString()
    });

    // Create stock ledger entry
    const ledgerEntry = store.insert('stockLedger', {
      date: new Date().toISOString(),
      transactionType: 'ADJUSTMENT',
      referenceNumber: adjustmentNumber,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      sourceLocation: location,
      destinationLocation: difference >= 0 ? `Inventory Gain (${reason || 'Count'})` : `Inventory Loss (${reason || 'Count'})`,
      quantity: difference,
      previousStock: previousTotalStock,
      newStock: newTotalStock,
      performedBy: user?.name || 'Demo Admin',
      notes: reason || `Count audit reconciled from ${previousLocStock} to ${counted} (Diff: ${difference})`
    });

    return { adjustment: adjustmentRecord, ledgerEntry };
  }
}

module.exports = new InventoryEngine();
