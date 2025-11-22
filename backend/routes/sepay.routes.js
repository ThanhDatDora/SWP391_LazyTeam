/**
 * SePay Payment Routes
 * API endpoints cho thanh toán qua SePay (QR Code Banking)
 */

import express from 'express';
import axios from 'axios';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import sepayClient from '../config/sepay-pg.config.js';
import { sepayPgConfig } from '../config/sepay-pg.config.js';

const router = express.Router();

/**
 * POST /api/payment/sepay/create
 * Tạo đơn hàng và generate QR code thanh toán
 */
router.post('/create', authenticateToken, [
  body('courses').isArray().notEmpty().withMessage('Courses must be a non-empty array'),
  body('courses.*.courseId').isInt().withMessage('Valid course ID required'),
  body('billingInfo').isObject().withMessage('Billing information required'),
  body('billingInfo.firstName').trim().notEmpty(),
  body('billingInfo.email').isEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ SePay validation errors:', JSON.stringify(errors.array(), null, 2));
      console.error('📦 Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    const { courses, billingInfo } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      let totalAmount = 0;
      const courseDetails = [];

      // Calculate total amount
      for (const item of courses) {
        const { courseId } = item;

        const courseResult = await transaction.request()
          .input('courseId', sql.BigInt, courseId)
          .query('SELECT price, title FROM courses WHERE course_id = @courseId');

        if (courseResult.recordset.length === 0) {
          throw new Error(`Course ${courseId} not found`);
        }

        const course = courseResult.recordset[0];
        console.log(`💰 Course ${courseId} price from database:`, course.price);
        
        // Convert USD to VND if price < 1000 (assuming USD format)
        let priceVND = course.price;
        if (course.price < 1000) {
          priceVND = course.price * 25000; // 1 USD = 25,000 VND
          console.log(`💱 Converting ${course.price} USD to ${priceVND} VND`);
        }
        
        totalAmount += priceVND;
        courseDetails.push({
          courseId,
          title: course.title,
          price: priceVND,
        });
      }

      console.log(`💰 Total amount calculated:`, totalAmount);

      // Create payment record
      const customerName = billingInfo.lastName 
        ? `${billingInfo.firstName} ${billingInfo.lastName}`.trim()
        : billingInfo.firstName.trim();
      
      const paymentResult = await transaction.request()
        .input('userId', sql.BigInt, userId)
        .input('provider', sql.NVarChar, 'sepay')
        .input('amountCents', sql.Int, Math.round(totalAmount * 100))
        .input('currency', sql.Char(3), 'VND')
        .input('status', sql.NVarChar, 'pending')
        .query(`
          INSERT INTO payments (
            user_id, provider, amount_cents, currency, status, created_at
          )
          OUTPUT INSERTED.payment_id
          VALUES (
            @userId, @provider, @amountCents, @currency, @status, GETDATE()
          )
        `);

      const paymentId = paymentResult.recordset[0].payment_id;

      // Generate transaction reference
      const transactionRef = `SEPAY${Date.now()}${paymentId}`;

      // Update payment with transaction ref
      await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('txnRef', sql.NVarChar, transactionRef)
        .query(`
          UPDATE payments 
          SET txn_ref = @txnRef
          WHERE payment_id = @paymentId
        `);

      // Create invoices for each course
      for (const course of courseDetails) {
        await transaction.request()
          .input('userId', sql.BigInt, userId)
          .input('courseId', sql.BigInt, course.courseId)
          .input('paymentId', sql.BigInt, paymentId)
          .input('amount', sql.Decimal(10, 2), course.price)
          .input('status', sql.NVarChar(30), 'pending')
          .query(`
            INSERT INTO invoices (
              user_id, course_id, payment_id, amount, status, created_at
            )
            VALUES (
              @userId, @courseId, @paymentId, @amount, @status, GETDATE()
            )
          `);
      }

      // Generate SePay checkout URL using SDK
      // Note: SDK checkout may not work until merchant is fully activated
      // Using fallback VietQR QR code for now
      
      const bankCode = process.env.SEPAY_BANK_CODE || 'OCB';
      const accountNo = process.env.SEPAY_ACCOUNT_NO || 'SEPNDH91622';
      const accountName = process.env.SEPAY_ACCOUNT_NAME || 'NGUYEN DUC HUY';
      
      // Generate VietQR URL for QR code
      const qrContent = `${transactionRef}`;
      const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${Math.round(totalAmount)}&addInfo=${encodeURIComponent(qrContent)}&accountName=${encodeURIComponent(accountName)}`;
      
      await transaction.commit();

      res.json({
        success: true,
        message: 'Đơn hàng đã được tạo thành công',
        data: {
          paymentId,
          transactionRef,
          amount: totalAmount,
          amountFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount),
          qrCode: qrUrl,
          qrContent: qrContent,
          bankInfo: {
            bankCode,
            accountNo,
            accountName,
          },
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          courses: courseDetails,
          billingInfo: {
            name: customerName,
            email: billingInfo.email,
          },
        },
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Create SePay payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Không thể tạo đơn hàng',
      message: error.message 
    });
  }
});

/**
 * POST /api/payment/sepay/check-status
 * Kiểm tra trạng thái thanh toán
 */
router.post('/check-status', authenticateToken, [
  body('paymentId').isInt().withMessage('Valid payment ID required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();

    // Get payment info
    const result = await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          payment_id, txn_ref, amount_cents, status, 
          paid_at, created_at
        FROM payments 
        WHERE payment_id = @paymentId AND user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn hàng',
      });
    }

    const payment = result.recordset[0];

    // If already completed, return status
    if (payment.status === 'completed') {
      return res.json({
        success: true,
        paid: true,
        status: 'completed',
        paidAt: payment.paid_at,
      });
    }

    // Check if payment expired (15 minutes)
    const createdAt = new Date(payment.created_at);
    const now = new Date();
    const minutesPassed = (now - createdAt) / 1000 / 60;

    if (minutesPassed > 15) {
      // Mark as expired
      await pool.request()
        .input('paymentId', sql.BigInt, paymentId)
        .query(`
          UPDATE payments 
          SET status = 'expired'
          WHERE payment_id = @paymentId AND status = 'pending'
        `);

      return res.json({
        success: true,
        paid: false,
        status: 'expired',
        message: 'Đơn hàng đã hết hạn. Vui lòng tạo đơn hàng mới.',
      });
    }

    // Return pending status
    // SePay Sandbox doesn't support transaction query API
    // User needs to use manual confirmation button
    const amount = payment.amount_cents / 100;
    
    return res.json({
      success: true,
      paid: false,
      status: payment.status,
      amount: amount,
      amountFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
      message: 'Vui lòng nhấn "Tôi đã chuyển khoản" sau khi chuyển khoản thành công',
    });

  } catch (error) {
    console.error('Check SePay status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Không thể kiểm tra trạng thái thanh toán',
      message: error.message 
    });
  }
});

/**
 * POST /api/payment/sepay/confirm
 * Manual payment confirmation - User confirms they have transferred
 */
router.post('/confirm', authenticateToken, [
  body('paymentId').isInt().withMessage('Valid payment ID required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { paymentId } = req.body;
    const userId = req.user.userId;

    const pool = await getPool();

    // Get payment details
    const paymentResult = await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT payment_id, user_id, status, amount_cents
        FROM payments
        WHERE payment_id = @paymentId AND user_id = @userId
      `);

    if (paymentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    const payment = paymentResult.recordset[0];

    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already completed'
      });
    }

    if (payment.status === 'expired') {
      return res.json({
        success: false,
        error: 'Payment has expired. Please create a new order.'
      });
    }

    // Get course IDs from invoices table (not payment_items)
    const itemsResult = await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .query(`
        SELECT course_id FROM invoices WHERE payment_id = @paymentId
      `);

    const courseIds = itemsResult.recordset.map(item => item.course_id);

    // Update payment status to completed
    await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .query(`
        UPDATE payments
        SET status = 'completed',
            paid_at = GETDATE()
        WHERE payment_id = @paymentId
      `);

    // Create enrollments for each course
    for (const courseId of courseIds) {
      await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('courseId', sql.BigInt, courseId)
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM enrollments
            WHERE user_id = @userId AND course_id = @courseId
          )
          BEGIN
            INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
            VALUES (@userId, @courseId, GETDATE(), 'active')
          END
        `);
    }

    console.log(`✅ Payment ${paymentId} manually confirmed by user ${userId}`);

    res.json({
      success: true,
      message: 'Payment confirmed successfully! You have been enrolled in the courses.',
    });
  } catch (error) {
    console.error('Manual confirm error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/payment/sepay/webhook
 * Webhook endpoint để nhận thông báo từ SePay khi có giao dịch mới
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-sepay-signature'];
    const payload = req.body;

    // Verify signature (if configured)
    // For VietQR fallback, we don't have signature verification
    // In production with SePay SDK, use: sepayClient.verifyWebhookSignature()
    
    const {
      transaction_content,
      amount_in,
      gateway_transaction_id,
      transaction_date,
    } = payload;

    // Extract payment ID from transaction content
    // Format: MCOURSE [PaymentID] [CustomerName]
    const match = transaction_content.match(/MCOURSE\s*(\d+)/);
    if (!match) {
      console.log('Invalid transaction content format:', transaction_content);
      return res.json({ success: true, message: 'Ignored' });
    }

    const paymentId = parseInt(match[1]);
    const pool = await getPool();

    // Check if payment exists
    const paymentResult = await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .query(`
        SELECT payment_id, amount_cents, status, user_id
        FROM payments 
        WHERE payment_id = @paymentId
      `);

    if (paymentResult.recordset.length === 0) {
      console.log('Payment not found:', paymentId);
      return res.json({ success: true, message: 'Payment not found' });
    }

    const payment = paymentResult.recordset[0];

    // Check if already completed
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Already processed' });
    }

    // Verify amount
    const expectedAmount = payment.amount_cents / 100;
    if (parseFloat(amount_in) !== expectedAmount) {
      console.error(`Amount mismatch for payment ${paymentId}: expected ${expectedAmount}, got ${amount_in}`);
      return res.json({ success: true, message: 'Amount mismatch' });
    }

    // Process payment
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Update payment status
      await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('gatewayTxnId', sql.NVarChar, gateway_transaction_id)
        .query(`
          UPDATE payments 
          SET 
            status = 'completed',
            paid_at = GETDATE()
          WHERE payment_id = @paymentId
        `);

      // Get invoices and create enrollments (same as check-status)
      const invoicesResult = await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .query(`
          SELECT invoice_id, course_id 
          FROM invoices 
          WHERE payment_id = @paymentId
        `);

      for (const invoice of invoicesResult.recordset) {
        await transaction.request()
          .input('invoiceId', sql.BigInt, invoice.invoice_id)
          .query(`
            UPDATE invoices 
            SET status = 'paid', paid_at = GETDATE()
            WHERE invoice_id = @invoiceId
          `);

        const existingEnrollment = await transaction.request()
          .input('userId', sql.BigInt, payment.user_id)
          .input('courseId', sql.BigInt, invoice.course_id)
          .query(`
            SELECT enrollment_id 
            FROM enrollments 
            WHERE user_id = @userId AND course_id = @courseId
          `);

        if (existingEnrollment.recordset.length === 0) {
          await transaction.request()
            .input('userId', sql.BigInt, payment.user_id)
            .input('courseId', sql.BigInt, invoice.course_id)
            .input('status', sql.NVarChar(20), 'active')
            .query(`
              INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
              VALUES (@userId, @courseId, GETDATE(), @status)
            `);
        }
      }

      // Create notification
      await transaction.request()
        .input('userId', sql.BigInt, payment.user_id)
        .query(`
          INSERT INTO notifications (user_id, title, message, type, icon, link)
          VALUES (
            @userId,
            N'Thanh toán thành công',
            N'Đơn hàng của bạn đã được thanh toán. Hãy bắt đầu học ngay!',
            'success',
            'CheckCircle',
            '/my-learning'
          )
        `);

      await transaction.commit();

      console.log(`✅ Payment ${paymentId} completed via webhook`);

      res.json({
        success: true,
        message: 'Payment processed successfully',
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('SePay webhook error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/payment/sepay/ipn
 * SePay IPN (Instant Payment Notification) callback
 * This endpoint receives automatic notifications from SePay when payment status changes
 */
router.post('/ipn', async (req, res) => {
  try {
    console.log('📥 SePay IPN received:', JSON.stringify(req.body, null, 2));

    // Verify signature from SePay
    const isValid = await sepayClient.checkout.verifySignature(req.body);
    
    if (!isValid) {
      console.error('❌ Invalid IPN signature');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid signature' 
      });
    }

    const { order_id, status, amount, transaction_id } = req.body;

    // Only process successful payments
    if (status !== 'success' && status !== 'completed') {
      console.log(`⚠️ IPN status is ${status}, skipping processing`);
      return res.json({ success: true, message: 'Status noted' });
    }

    const pool = await getPool();
    const transaction = await pool.transaction();

    try {
      await transaction.begin();

      // Find payment by transaction ref (order_id)
      const paymentResult = await transaction.request()
        .input('txnRef', sql.NVarChar, order_id)
        .query(`
          SELECT payment_id, user_id, amount_cents, status
          FROM payments 
          WHERE txn_ref = @txnRef
        `);

      if (paymentResult.recordset.length === 0) {
        console.error(`❌ Payment not found for order_id: ${order_id}`);
        await transaction.rollback();
        return res.status(404).json({ 
          success: false,
          error: 'Payment not found' 
        });
      }

      const payment = paymentResult.recordset[0];
      const paymentId = payment.payment_id;
      const userId = payment.user_id;

      // Check if already processed
      if (payment.status === 'completed') {
        console.log(`✅ Payment ${paymentId} already completed, skipping`);
        await transaction.rollback();
        return res.json({ success: true, message: 'Already processed' });
      }

      // Update payment status
      await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('status', sql.NVarChar, 'completed')
        .query(`
          UPDATE payments 
          SET status = @status, paid_at = GETDATE()
          WHERE payment_id = @paymentId
        `);

      // Update invoices
      await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .query(`
          UPDATE invoices 
          SET status = 'paid'
          WHERE payment_id = @paymentId
        `);

      // Get course IDs from invoices
      const invoicesResult = await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .query(`
          SELECT course_id, amount 
          FROM invoices 
          WHERE payment_id = @paymentId
        `);

      // Create enrollments
      for (const invoice of invoicesResult.recordset) {
        await transaction.request()
          .input('userId', sql.BigInt, userId)
          .input('courseId', sql.BigInt, invoice.course_id)
          .query(`
            IF NOT EXISTS (
              SELECT 1 FROM enrollments 
              WHERE user_id = @userId AND course_id = @courseId
            )
            BEGIN
              INSERT INTO enrollments (user_id, course_id, enrolled_at)
              VALUES (@userId, @courseId, GETDATE())
            END
          `);
      }

      // Create notification
      await transaction.request()
        .input('userId', sql.BigInt, userId)
        .query(`
          INSERT INTO notifications (
            user_id, title, message, type, icon, action_url, created_at
          )
          VALUES (
            @userId, 
            N'Thanh toán thành công',
            N'Đơn hàng của bạn đã được thanh toán qua SePay. Hãy bắt đầu học ngay!',
            'success',
            'CheckCircle',
            '/my-learning',
            GETDATE()
          )
        `);

      await transaction.commit();

      console.log(`✅ Payment ${paymentId} completed via IPN for order ${order_id}`);

      res.json({
        success: true,
        message: 'Payment processed successfully',
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('SePay IPN error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * GET /api/payment/sepay/bank-info
 * Lấy thông tin ngân hàng (public endpoint)
 */
router.get('/bank-info', (req, res) => {
  try {
    const bankInfo = {
      bankCode: sepayPgConfig.bankCode,
      accountNo: sepayPgConfig.accountNo,
      accountName: sepayPgConfig.accountName,
    };
    res.json({
      success: true,
      data: bankInfo,
    });
  } catch (error) {
    console.error('Get bank info error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;
