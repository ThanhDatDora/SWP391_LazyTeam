import express from 'express';
import sql from 'mssql';
import { getPool } from '../config/database.js';
import payosService from '../services/payos.service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/payment/payos/create
 * @desc    Create PayOS payment link for course purchase
 * @access  Private (Learner)
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;  // ✅ Fixed: use userId not id
    const { courseId, courseName, coursePrice } = req.body;

    console.log('📝 PayOS payment creation request:', {
      userId,
      courseId,
      courseName,
      coursePrice,
      coursePriceType: typeof coursePrice,
      rawBody: req.body
    });

    // Validate input
    if (!courseId || !courseName || !coursePrice) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin khóa học',
      });
    }

    // Get user information
    const pool = await getPool();
    const userResult = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query('SELECT email FROM users WHERE user_id = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const user = userResult.recordset[0];

    // Check existing enrollment (any status)
    const enrollmentCheck = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('courseId', sql.Int, courseId)
      .query(
        "SELECT enrollment_id, status FROM enrollments WHERE user_id = @userId AND course_id = @courseId"
      );

    let enrollmentId;

    if (enrollmentCheck.recordset.length > 0) {
      const existingEnrollment = enrollmentCheck.recordset[0];
      
      // If already active, reject
      if (existingEnrollment.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đăng ký khóa học này rồi',
        });
      }
      
      // If pending, reuse the existing enrollment
      enrollmentId = existingEnrollment.enrollment_id;
      console.log('🔄 Reusing pending enrollment:', enrollmentId);
      
      // Check if there's already a PENDING payment for this enrollment
      const pendingPaymentCheck = await pool
        .request()
        .input('enrollmentId', sql.Int, enrollmentId)
        .input('userId', sql.Int, userId)
        .query(`
          SELECT payment_id, txn_ref, created_at 
          FROM payments 
          WHERE enrollment_id = @enrollmentId 
            AND user_id = @userId 
            AND status = 'pending'
            AND provider = 'payos'
          ORDER BY created_at DESC
        `);
      
      if (pendingPaymentCheck.recordset.length > 0) {
        const existingPayment = pendingPaymentCheck.recordset[0];
        console.log('⚠️ Found existing pending payment:', existingPayment.payment_id);
        
        // Return existing payment instead of creating new one
        const existingOrderCode = existingPayment.txn_ref;
        
        // Get existing PayOS payment link
        const existingPaymentData = await payosService.getPaymentInfo(existingOrderCode);
        
        if (existingPaymentData.success) {
          console.log('♻️ Reusing existing PayOS payment link');
          return res.json({
            success: true,
            message: 'Link thanh toán đã tồn tại',
            data: {
              paymentId: existingPayment.payment_id,
              orderCode: existingOrderCode,
              amount: existingPaymentData.data.amount,
              amountUSD: coursePrice,
              checkoutUrl: existingPaymentData.data.checkoutUrl,
              qrCode: existingPaymentData.data.qrCode,
            },
          });
        }
        
        // If existing payment link expired/invalid, will create new one below
        console.log('⚠️ Existing payment link invalid, creating new one');
      }
    } else {
      // Create new pending enrollment
      const enrollmentResult = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('courseId', sql.Int, courseId)
        .input('status', sql.NVarChar, 'pending')
        .input('enrolledAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
          OUTPUT INSERTED.enrollment_id
          VALUES (@userId, @courseId, @status, @enrolledAt)
        `);

      enrollmentId = enrollmentResult.recordset[0].enrollment_id;
      console.log('✅ New pending enrollment created:', enrollmentId);
    }

    // Generate unique order code
    const orderCode = payosService.generateOrderCode();

    // Convert USD to VND (PayOS only accepts VND)
    const amountVND = payosService.convertUSDtoVND(coursePrice);

    // Create short description (max 25 characters for PayOS)
    const shortDescription = courseName.length > 20 
      ? `${courseName.substring(0, 20)}...` 
      : `Khoa hoc: ${courseName}`;

    // Create payment link
    const paymentResult = await payosService.createPaymentLink({
      orderCode: orderCode,
      amount: amountVND,
      description: shortDescription.substring(0, 25), // PayOS max 25 chars
      buyerName: user.username || 'Học viên',
      buyerEmail: user.email,
      buyerPhone: '',
      returnUrl: `${process.env.FRONTEND_URL}/payment/payos/success?orderCode=${orderCode}`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/payos/cancel`,
    });

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Không thể tạo link thanh toán',
        error: paymentResult.error,
      });
    }

    // Save payment record to database (status: pending)
    // enrollmentId was already obtained/created above
    const insertResult = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('provider', sql.NVarChar, 'payos')
      .input('amount', sql.Decimal(12, 2), coursePrice)
      .input('currency', sql.NVarChar, 'USD')
      .input('status', sql.NVarChar, 'pending')
      .input('txnRef', sql.NVarChar, orderCode)
      .input('createdAt', sql.DateTime, new Date()).query(`
        INSERT INTO payments (user_id, enrollment_id, provider, amount_cents, currency, status, txn_ref, created_at)
        OUTPUT INSERTED.payment_id
        VALUES (@userId, @enrollmentId, @provider, @amount, @currency, @status, @txnRef, @createdAt)
      `);

    const paymentId = insertResult.recordset[0].payment_id;
    console.log('✅ Payment record created in database with ID:', paymentId);

    res.json({
      success: true,
      message: 'Tạo link thanh toán thành công',
      data: {
        paymentId: paymentId,
        orderCode: paymentResult.data.orderCode,
        amount: amountVND,
        amountUSD: coursePrice,
        checkoutUrl: paymentResult.data.checkoutUrl,
        qrCode: paymentResult.data.qrCode,
      },
    });
  } catch (error) {
    console.error('❌ PayOS create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo thanh toán',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/payment/payos/webhook
 * @desc    Handle PayOS webhook notifications
 * @access  Public (PayOS callback)
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;

    console.log('📨 PayOS webhook received:', JSON.stringify(webhookData, null, 2));

    // Verify webhook signature using PayOS SDK
    // Note: PayOS SDK throws error if verification fails
    let paymentData;
    try {
      paymentData = await payosService.verifyWebhookData(webhookData);
      console.log('✅ Webhook verification passed');
    } catch (verifyError) {
      console.warn('⚠️ Invalid PayOS webhook signature:', verifyError.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const orderCode = paymentData.orderCode;
    const paymentStatus = paymentData.code; // '00' = success

    console.log('🔍 Webhook payment status:', {
      orderCode,
      status: paymentStatus,
      description: paymentData.desc,
    });

    // Only process successful payments
    if (paymentStatus !== '00') {
      console.log('⚠️ Payment not successful, skipping enrollment');
      return res.json({
        success: true,
        message: 'Payment not successful',
      });
    }

    // Get payment record from database
    const pool = await getPool();
    const paymentResult = await pool
      .request()
      .input('txnRef', sql.NVarChar, String(orderCode)) // Convert number to string
      .query(
        'SELECT payment_id, user_id, enrollment_id, status FROM payments WHERE txn_ref = @txnRef'
      );

    if (paymentResult.recordset.length === 0) {
      console.warn('⚠️ Payment record not found for order:', orderCode, '(possibly PayOS test webhook)');
      // Return 200 OK for PayOS webhook validation (they send test data)
      return res.json({
        success: true,
        message: 'Webhook received but payment not found (test webhook or invalid order)',
      });
    }

    const payment = paymentResult.recordset[0];

    // Check if already processed
    if (payment.status === 'paid') {
      console.log('ℹ️ Payment already processed, skipping');
      return res.json({
        success: true,
        message: 'Payment already processed',
      });
    }

    // Update payment status to 'paid'
    await pool
      .request()
      .input('paymentId', sql.Int, payment.payment_id)
      .input('paidAt', sql.DateTime, new Date())
      .query(
        'UPDATE payments SET status = \'paid\', paid_at = @paidAt WHERE payment_id = @paymentId'
      );

    console.log('✅ Payment status updated to paid');

    // Update enrollment status to active
    await pool
      .request()
      .input('enrollmentId', sql.Int, payment.enrollment_id)
      .query(
        "UPDATE enrollments SET status = 'active' WHERE enrollment_id = @enrollmentId"
      );

    console.log('✅ Enrollment activated for enrollment_id:', payment.enrollment_id);

    res.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('❌ PayOS webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/payment/payos/status/:orderCode
 * @desc    Check PayOS payment status
 * @access  Private
 */
router.get('/status/:orderCode', authenticateToken, async (req, res) => {
  try {
    const { orderCode } = req.params;

    console.log('🔍 Checking PayOS payment status for order:', orderCode);

    // Get payment info from PayOS
    const paymentInfo = await payosService.getPaymentInfo(orderCode);

    if (!paymentInfo.success) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin thanh toán',
        error: paymentInfo.error,
      });
    }

    // Get local payment record
    const pool = await getPool();
    const paymentResult = await pool
      .request()
      .input('txnRef', sql.NVarChar, orderCode.toString())
      .query('SELECT status FROM payments WHERE txn_ref = @txnRef');

    const localStatus = paymentResult.recordset.length > 0 
      ? paymentResult.recordset[0].status 
      : 'not_found';

    res.json({
      success: true,
      data: {
        orderCode: paymentInfo.data.orderCode,
        amount: paymentInfo.data.amount,
        status: paymentInfo.data.status,
        localStatus: localStatus,
        transactions: paymentInfo.data.transactions,
      },
    });
  } catch (error) {
    console.error('❌ PayOS check status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái thanh toán',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/payment/payos/complete-by-order/:orderCode
 * @desc    Complete payment using orderCode (when webhook fails)
 * @access  Private
 */
router.post('/complete-by-order/:orderCode', authenticateToken, async (req, res) => {
  try {
    const { orderCode } = req.params;
    const userId = req.user.userId;

    console.log('🔄 Manual completion for order:', orderCode, 'user:', userId);

    const pool = await getPool();

    // Get payment by orderCode
    const paymentResult = await pool
      .request()
      .input('txnRef', sql.NVarChar, String(orderCode))
      .input('userId', sql.Int, userId)
      .query(`
        SELECT payment_id, user_id, enrollment_id, status 
        FROM payments 
        WHERE txn_ref = @txnRef AND user_id = @userId
      `);

    if (paymentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const payment = paymentResult.recordset[0];

    // If already paid, return success
    if (payment.status === 'paid') {
      return res.json({
        success: true,
        message: 'Payment already completed',
      });
    }

    // Verify with PayOS API that payment is actually PAID
    const paymentInfo = await payosService.getPaymentInfo(orderCode);
    
    if (!paymentInfo.success || paymentInfo.data.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Payment not yet completed in PayOS',
      });
    }

    // Update payment status
    await pool
      .request()
      .input('paymentId', sql.Int, payment.payment_id)
      .input('paidAt', sql.DateTime, new Date())
      .query(`
        UPDATE payments 
        SET status = 'paid', paid_at = @paidAt 
        WHERE payment_id = @paymentId
      `);

    console.log('✅ Payment updated to paid:', payment.payment_id);

    // Update enrollment status
    if (payment.enrollment_id) {
      await pool
        .request()
        .input('enrollmentId', sql.Int, payment.enrollment_id)
        .query(`
          UPDATE enrollments 
          SET status = 'active' 
          WHERE enrollment_id = @enrollmentId
        `);

      console.log('✅ Enrollment activated:', payment.enrollment_id);
    }

    res.json({
      success: true,
      message: 'Payment completed successfully',
    });
  } catch (error) {
    console.error('❌ Complete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete payment',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/payment/payos/cancel/:orderCode
 * @desc    Cancel PayOS payment link
 * @access  Private
 */
router.post('/cancel/:orderCode', authenticateToken, async (req, res) => {
  try {
    const { orderCode } = req.params;

    console.log('🚫 Cancelling PayOS payment:', orderCode);

    // Cancel payment link on PayOS
    const cancelResult = await payosService.cancelPaymentLink(orderCode);

    if (!cancelResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy thanh toán',
        error: cancelResult.error,
      });
    }

    // Update local payment status
    const pool = await getPool();
    await pool
      .request()
      .input('txnRef', sql.NVarChar, orderCode.toString())
      .query('UPDATE payments SET status = \'cancelled\' WHERE txn_ref = @txnRef');

    res.json({
      success: true,
      message: 'Đã hủy thanh toán thành công',
    });
  } catch (error) {
    console.error('❌ PayOS cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy thanh toán',
      error: error.message,
    });
  }
});

export default router;
