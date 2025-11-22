import express from 'express';
import { getPool, sql } from '../config/database.js';
import crypto from 'crypto';

const router = express.Router();

// VietQR Webhook Secret (lấy từ VietQR dashboard)
const VIETQR_SECRET = process.env.VIETQR_WEBHOOK_SECRET || 'your-secret-key-here';

/**
 * VietQR Webhook Endpoint
 * Nhận thông báo khi có giao dịch chuyển tiền
 * 
 * QUAN TRỌNG:
 * - Endpoint này PHẢI public (không cần authentication)
 * - VietQR sẽ gọi từ server của họ
 * - Verify signature để đảm bảo request đến từ VietQR
 */
router.post('/vietqr', async (req, res) => {
  try {
    console.log('🔔 VietQR Webhook received:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // 1. Verify webhook signature (bảo mật)
    const signature = req.headers['x-vietqr-signature'];
    const isValid = verifyVietQRSignature(req.body, signature);
    
    if (!isValid) {
      console.error('❌ Invalid VietQR signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Extract transaction data
    const {
      accountNumber,    // Số tài khoản nhận (0933027148)
      amount,           // Số tiền (VND)
      description,      // Nội dung CK: "MINICOURSE-123456"
      transactionId,    // Mã giao dịch ngân hàng
      timestamp         // Thời gian
    } = req.body;

    console.log('💳 Transaction details:', {
      accountNumber,
      amount,
      description,
      transactionId,
      timestamp
    });

    // 3. Validate account number
    if (accountNumber !== '0933027148') {
      console.error('❌ Wrong account number:', accountNumber);
      return res.status(400).json({ error: 'Wrong account number' });
    }

    // 4. Extract payment ID from description
    // Format: "MINICOURSE-{paymentId}" hoặc "MINICOURSE-{timestamp}"
    const paymentIdMatch = description.match(/MINICOURSE-(\d+)/);
    if (!paymentIdMatch) {
      console.error('❌ Invalid description format:', description);
      return res.status(400).json({ error: 'Invalid description format' });
    }

    const descriptionPaymentId = paymentIdMatch[1];
    console.log('🔍 Extracted from description:', descriptionPaymentId);

    // 5. Find matching payment in database
    const pool = await getPool();
    
    // Tìm payment gần đây nhất có amount khớp và status = pending
    const result = await pool.request()
      .input('amountVND', sql.Int, amount)
      .input('timestamp', sql.DateTime, new Date(timestamp))
      .query(`
        SELECT TOP 1 payment_id, user_id, amount_cents, status, created_at
        FROM payments 
        WHERE 
          status = 'pending'
          AND ABS(DATEDIFF(SECOND, created_at, @timestamp)) <= 300
          AND ABS((amount_cents / 100.0 * 24000) - @amountVND) <= 1000
        ORDER BY created_at DESC
      `);

    if (result.recordset.length === 0) {
      console.error('❌ No matching payment found for amount:', amount);
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = result.recordset[0];
    console.log('✅ Found matching payment:', payment);

    // 6. Update payment status to completed
    const txnRef = `VQR-${transactionId}`;
    await pool.request()
      .input('paymentId', sql.BigInt, payment.payment_id)
      .input('txnRef', sql.NVarChar, txnRef)
      .query(`
        UPDATE payments 
        SET 
          status = 'completed', 
          txn_ref = @txnRef, 
          paid_at = GETDATE(),
          updated_at = GETDATE()
        WHERE payment_id = @paymentId
      `);

    console.log('✅ Payment verified successfully:', {
      paymentId: payment.payment_id,
      txnRef,
      amount
    });

    // 7. Respond to VietQR (must respond within 5 seconds)
    res.json({
      success: true,
      message: 'Payment verified',
      paymentId: payment.payment_id
    });

  } catch (error) {
    console.error('💥 VietQR webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * Verify VietQR webhook signature
 * @param {Object} payload - Request body
 * @param {String} signature - Signature from header
 * @returns {Boolean}
 */
function verifyVietQRSignature(payload, signature) {
  if (!signature) return false;
  
  // Create HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', VIETQR_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Test endpoint (chỉ dùng để test, XÓA khi deploy production)
 */
router.post('/vietqr/test', async (req, res) => {
  console.log('🧪 Test webhook called:', req.body);
  
  // Giả lập webhook call
  const testPayload = {
    accountNumber: '0933027148',
    amount: req.body.amount || 13200,
    description: req.body.description || 'MINICOURSE-12345',
    transactionId: 'TEST-' + Date.now(),
    timestamp: new Date().toISOString()
  };

  // Forward to real webhook handler
  req.body = testPayload;
  req.headers['x-vietqr-signature'] = crypto
    .createHmac('sha256', VIETQR_SECRET)
    .update(JSON.stringify(testPayload))
    .digest('hex');
  
  // Call the actual handler
  return router.handle(req, res);
});

export default router;
