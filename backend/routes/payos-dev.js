import express from 'express';
import sql from 'mssql';
import { getPool } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * DEVELOPMENT ONLY - Simulate PayOS payment success
 * @route   POST /api/payment/payos/dev/simulate-success/:orderCode
 * @desc    Manually mark payment as paid and create enrollment (for testing without webhook)
 * @access  Private (Admin/Instructor for testing)
 */
router.post('/simulate-success/:orderCode', authenticateToken, async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available in development mode'
      });
    }

    const { orderCode } = req.params;

    console.log('🧪 DEV: Simulating PayOS payment success for order:', orderCode);

    // Get payment record from database
    const pool = await getPool();
    const paymentResult = await pool
      .request()
      .input('txnRef', sql.NVarChar, orderCode.toString())
      .query(
        'SELECT payment_id, user_id, course_id, status FROM payments WHERE txn_ref = @txnRef'
      );

    if (paymentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Payment not found for order code: ${orderCode}`
      });
    }

    const payment = paymentResult.recordset[0];

    console.log('📦 Found payment:', payment);

    // Check if already processed
    if (payment.status === 'paid') {
      console.log('ℹ️ Payment already paid, skipping');
      return res.json({
        success: true,
        message: 'Payment already processed',
        data: { status: 'already_paid' }
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

    // Create enrollment record
    const enrollmentCheck = await pool
      .request()
      .input('userId', sql.Int, payment.user_id)
      .input('courseId', sql.Int, payment.course_id)
      .query(
        'SELECT enrollment_id FROM enrollments WHERE user_id = @userId AND course_id = @courseId'
      );

    if (enrollmentCheck.recordset.length === 0) {
      // Create new enrollment
      await pool
        .request()
        .input('userId', sql.Int, payment.user_id)
        .input('courseId', sql.Int, payment.course_id)
        .input('status', sql.NVarChar, 'active')
        .input('enrolledAt', sql.DateTime, new Date()).query(`
          INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
          VALUES (@userId, @courseId, @status, @enrolledAt)
        `);

      console.log('✅ Enrollment created for user:', payment.user_id);
    } else {
      console.log('ℹ️ Enrollment already exists');
    }

    res.json({
      success: true,
      message: 'Payment simulated successfully - User enrolled in course',
      data: {
        orderCode: orderCode,
        status: 'paid',
        userId: payment.user_id,
        courseId: payment.course_id,
        enrollmentCreated: enrollmentCheck.recordset.length === 0
      }
    });
  } catch (error) {
    console.error('❌ DEV: Simulate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate payment',
      error: error.message
    });
  }
});

/**
 * DEVELOPMENT ONLY - List all pending PayOS payments
 * @route   GET /api/payment/payos/dev/pending
 * @desc    Get list of pending payments for testing
 * @access  Private
 */
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available in development mode'
      });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .query(`
        SELECT 
          p.payment_id,
          p.txn_ref as orderCode,
          p.user_id,
          p.course_id,
          p.amount_cents as amount,
          p.currency,
          p.status,
          p.created_at,
          u.email,
          u.full_name,
          c.title as course_title
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN courses c ON p.course_id = c.course_id
        WHERE p.provider = 'payos' AND p.status = 'pending'
        ORDER BY p.created_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('❌ DEV: List pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list pending payments',
      error: error.message
    });
  }
});

export default router;
