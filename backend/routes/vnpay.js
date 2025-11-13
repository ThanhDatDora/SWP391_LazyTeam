import express from 'express';
import crypto from 'crypto';
import querystring from 'querystring';
import { getPool, sql } from '../config/database.js';

const router = express.Router();

// VNPay Configuration from .env
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'DEMOV210',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ',
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5173/checkout/vnpay-return',
  vnp_Version: process.env.VNPAY_VERSION || '2.1.0'
};

/**
 * Sort object keys alphabetically (required for VNPay signature)
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

/**
 * Create VNPay payment URL
 * POST /api/vnpay/create-payment-url
 */
router.post('/create-payment-url', async (req, res) => {
  try {
    console.log('🔵 VNPay create payment URL called:', req.body);

    const { paymentId, amount } = req.body;

    if (!paymentId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing paymentId or amount'
      });
    }

    // Get payment details from database
    const pool = await getPool();
    const result = await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .query(`
        SELECT payment_id, user_id, amount_cents, status, created_at
        FROM payments
        WHERE payment_id = @paymentId AND status = 'pending'
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found or already completed'
      });
    }

    const payment = result.recordset[0];
    
    // VNPay requires amount in VND (smallest unit, no decimals)
    const amountVND = Math.round(amount * 24000); // USD to VND conversion

    // Create VNPay payment data
    const date = new Date();
    const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14); // YYYYMMDDHHmmss
    const orderId = `MC${paymentId}${Date.now()}`; // Unique order ID
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';

    let vnp_Params = {
      vnp_Version: vnpayConfig.vnp_Version,
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan khoa hoc Mini Coursera - Payment ID: ${paymentId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amountVND * 100, // VNPay requires amount * 100
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    // Sort params and create signature
    vnp_Params = sortObject(vnp_Params);
    
    // VNPay requires signature from URL-ENCODED query string
    const signData = querystring.stringify(vnp_Params);
    
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    // Build payment URL
    const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params);

    console.log('✅ VNPay payment URL created:');
    console.log('  Payment ID:', paymentId);
    console.log('  Order ID:', orderId);
    console.log('  Amount VND:', amountVND);
    console.log('  📝 Signature data (ENCODED):', signData);
    console.log('  🔒 Signature (HMAC-SHA512):', signed);
    console.log('  Full URL:', paymentUrl);
    console.log('  URL length:', paymentUrl.length);

    // Update payment with order ID
    await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .input('orderId', sql.NVarChar, orderId)
      .query(`
        UPDATE payments
        SET txn_ref = @orderId
        WHERE payment_id = @paymentId
      `);

    res.json({
      success: true,
      data: {
        paymentUrl,
        orderId,
        amount: amountVND
      }
    });

  } catch (error) {
    console.error('❌ VNPay create payment URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment URL',
      message: error.message
    });
  }
});

/**
 * VNPay Return URL Handler
 * GET /api/vnpay/vnpay-return
 */
router.get('/vnpay-return', async (req, res) => {
  try {
    console.log('🔵 VNPay return callback:', req.query);

    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Remove hash params for verification
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sort and verify signature
    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      console.error('❌ Invalid VNPay signature');
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const transactionNo = vnp_Params['vnp_TransactionNo'];
    const amount = vnp_Params['vnp_Amount'] / 100; // Convert back from VNPay format

    console.log('💳 VNPay transaction result:', {
      orderId,
      responseCode,
      transactionNo,
      amount,
      success: responseCode === '00'
    });

    // Extract payment ID from order ID (format: MC{paymentId}{timestamp})
    const paymentIdMatch = orderId.match(/^MC(\d+)/);
    if (!paymentIdMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
    }

    const paymentId = parseInt(paymentIdMatch[1]);

    // Update payment status in database
    const pool = await getPool();

    if (responseCode === '00') {
      // Payment successful
      await pool.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('transactionNo', sql.NVarChar, transactionNo)
        .query(`
          UPDATE payments
          SET 
            status = 'completed',
            txn_ref = @transactionNo,
            paid_at = GETDATE()
          WHERE payment_id = @paymentId
        `);

      console.log('✅ Payment completed successfully:', paymentId);

      // Redirect to frontend success page
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/success?paymentId=${paymentId}&status=success`);
    } else {
      // Payment failed
      await pool.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('responseCode', sql.NVarChar, responseCode)
        .query(`
          UPDATE payments
          SET status = 'failed'
          WHERE payment_id = @paymentId
        `);

      console.log('❌ Payment failed:', { paymentId, responseCode });

      // Redirect to frontend failure page
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/failure?paymentId=${paymentId}&status=failed&code=${responseCode}`);
    }

  } catch (error) {
    console.error('❌ VNPay return handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment return',
      message: error.message
    });
  }
});

/**
 * VNPay IPN (Instant Payment Notification) Handler
 * GET /api/vnpay/vnpay-ipn
 */
router.get('/vnpay-ipn', async (req, res) => {
  try {
    console.log('🔔 VNPay IPN received:', req.query);

    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Remove hash params
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Verify signature
    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      console.error('❌ Invalid IPN signature');
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const transactionNo = vnp_Params['vnp_TransactionNo'];

    // Extract payment ID
    const paymentIdMatch = orderId.match(/^MC(\d+)/);
    if (!paymentIdMatch) {
      return res.status(200).json({ RspCode: '99', Message: 'Invalid order ID' });
    }

    const paymentId = parseInt(paymentIdMatch[1]);
    const pool = await getPool();

    // Check if payment exists
    const result = await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .query('SELECT status FROM payments WHERE payment_id = @paymentId');

    if (result.recordset.length === 0) {
      return res.status(200).json({ RspCode: '01', Message: 'Payment not found' });
    }

    const currentStatus = result.recordset[0].status;

    // If already completed, return success
    if (currentStatus === 'completed') {
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    }

    // Update payment status based on response code
    if (responseCode === '00') {
      await pool.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('transactionNo', sql.NVarChar, transactionNo)
        .query(`
          UPDATE payments
          SET 
            status = 'completed',
            txn_ref = @transactionNo,
            paid_at = GETDATE()
          WHERE payment_id = @paymentId
        `);

      console.log('✅ IPN: Payment completed:', paymentId);
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      await pool.request()
        .input('paymentId', sql.BigInt, paymentId)
        .query(`
          UPDATE payments
          SET status = 'failed'
          WHERE payment_id = @paymentId
        `);

      console.log('❌ IPN: Payment failed:', paymentId);
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    }

  } catch (error) {
    console.error('❌ VNPay IPN error:', error);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
});

export default router;
