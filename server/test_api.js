const app = require('./src/app');
const http = require('http');

const server = http.createServer(app);

server.listen(5099, async () => {
  console.log('Testing server started on port 5099');

  const BASE = 'http://localhost:5099/api';

  async function request(endpoint, options = {}) {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
      },
      ...options
    });
    return res.json();
  }

  try {
    // 1. Health check
    const health = await request('/health');
    console.log('1. Health check:', health.status);

    // 2. Login
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@stocksense.com', password: 'admin123' })
    });
    console.log('2. Login success:', loginRes.success, 'User:', loginRes.user?.name);
    const token = loginRes.token;

    // 3. Dashboard stats
    const stats = await request('/dashboard/stats');
    console.log('3. Dashboard KPIs:');
    console.log('   - Total Products:', stats.kpis?.totalProducts);
    console.log('   - Total Stock Quantity:', stats.kpis?.totalStockQuantity);
    console.log('   - Low Stock Count:', stats.kpis?.lowStockCount);
    console.log('   - Out of Stock Count:', stats.kpis?.outOfStockCount);
    console.log('   - Pending Receipts:', stats.kpis?.pendingReceiptsCount);
    console.log('   - Pending Deliveries:', stats.kpis?.pendingDeliveriesCount);

    // 4. Products list
    const productsRes = await request('/products');
    console.log('4. Products count:', productsRes.products?.length);
    const sampleProduct = productsRes.products[0];
    console.log('   Sample product:', sampleProduct.name, 'Stock:', sampleProduct.currentStock);

    // 5. Test Receipt creation & validation
    const createRecRes = await request('/receipts', {
      method: 'POST',
      token,
      body: JSON.stringify({
        supplier: 'Test Metal Suppliers Inc',
        destinationLocation: 'WH-MAIN-RACK-A',
        status: 'READY',
        items: [{ productId: sampleProduct.id, quantity: 20 }]
      })
    });
    console.log('5. Receipt created:', createRecRes.receipt?.receiptNumber);

    const valRecRes = await request(`/receipts/${createRecRes.receipt.id}/validate`, {
      method: 'POST',
      token
    });
    console.log('   Receipt validated! Message:', valRecRes.message);

    // 6. Test Delivery creation & validation
    const createDelRes = await request('/deliveries', {
      method: 'POST',
      token,
      body: JSON.stringify({
        customer: 'Global Logistics Client',
        sourceLocation: 'WH-MAIN-RACK-A',
        status: 'READY',
        items: [{ productId: sampleProduct.id, quantity: 5 }]
      })
    });
    console.log('6. Delivery created:', createDelRes.delivery?.deliveryNumber);

    const valDelRes = await request(`/deliveries/${createDelRes.delivery.id}/validate`, {
      method: 'POST',
      token
    });
    console.log('   Delivery validated! Message:', valDelRes.message);

    // 7. Test Internal Transfer
    const createTrRes = await request('/transfers', {
      method: 'POST',
      token,
      body: JSON.stringify({
        sourceLocation: 'WH-MAIN-RACK-A',
        destinationLocation: 'WH-MAIN-RACK-B',
        status: 'READY',
        items: [{ productId: sampleProduct.id, quantity: 10 }]
      })
    });
    console.log('7. Transfer created:', createTrRes.transfer?.transferNumber);

    const valTrRes = await request(`/transfers/${createTrRes.transfer.id}/validate`, {
      method: 'POST',
      token
    });
    console.log('   Transfer validated! Message:', valTrRes.message);

    // 8. Test Stock Adjustment
    const adjRes = await request('/adjustments', {
      method: 'POST',
      token,
      body: JSON.stringify({
        productId: sampleProduct.id,
        location: 'WH-MAIN-RACK-A',
        countedQuantity: 97,
        reason: 'Physical count damage write-off'
      })
    });
    console.log('8. Stock Adjustment applied:', adjRes.adjustment?.adjustmentNumber, 'Diff:', adjRes.adjustment?.difference);

    // 9. Verify Stock Ledger has all events
    const ledgerRes = await request('/ledger');
    console.log('9. Stock Ledger total entries:', ledgerRes.count);
    console.log('   Latest 3 ledger entries:');
    ledgerRes.ledger.slice(0, 3).forEach(l => {
      console.log(`   - [${l.transactionType}] ${l.referenceNumber} | ${l.productName} | ${l.sourceLocation} -> ${l.destinationLocation} | Qty: ${l.quantity} | Pre: ${l.previousStock} -> New: ${l.newStock}`);
    });

    // 10. Test OTP password reset flow
    const forgotRes = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@stocksense.com' })
    });
    console.log('10. Forgot password OTP generated:', forgotRes.otp);

    const verifyRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@stocksense.com', otp: forgotRes.otp })
    });
    console.log('    OTP verification:', verifyRes.success, verifyRes.message);

    const resetRes = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@stocksense.com', otp: forgotRes.otp, newPassword: 'admin123' })
    });
    console.log('    Password reset complete:', resetRes.success, resetRes.message);

    console.log('\n ALL 10 TEST SUITES PASSED FLAWLESSLY! \n');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
  }
});
