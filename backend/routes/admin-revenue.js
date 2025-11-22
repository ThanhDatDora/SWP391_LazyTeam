import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.roleId !== 1) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get platform revenue summary
router.get('/revenue/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    // Total revenue
    const revenueResult = await pool.request().query(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(amount_cents) as totalRevenue,
        SUM(CASE WHEN status = 'completed' THEN amount_cents ELSE 0 END) as completedRevenue,
        SUM(CASE WHEN status = 'pending_verification' THEN amount_cents ELSE 0 END) as pendingRevenue
      FROM payments
    `);

    // Revenue by month (last 6 months)
    const monthlyResult = await pool.request().query(`
      SELECT 
        FORMAT(created_at, 'yyyy-MM') as month,
        COUNT(*) as paymentCount,
        SUM(amount_cents) as revenue
      FROM payments
      WHERE created_at >= DATEADD(MONTH, -6, GETDATE())
        AND status = 'completed'
      GROUP BY FORMAT(created_at, 'yyyy-MM')
      ORDER BY month DESC
    `);

    // Platform fee earned
    const platformFeeRate = 0.2; // 20%
    const summary = revenueResult.recordset[0];
    const platformFee = Math.round((summary.completedRevenue || 0) * platformFeeRate);
    const instructorShare = (summary.completedRevenue || 0) - platformFee;

    res.json({
      success: true,
      data: {
        totalPayments: summary.totalPayments || 0,
        totalRevenue: summary.totalRevenue || 0,
        completedRevenue: summary.completedRevenue || 0,
        pendingRevenue: summary.pendingRevenue || 0,
        platformFee: platformFee,
        instructorShare: instructorShare,
        monthlyRevenue: monthlyResult.recordset
      }
    });

  } catch (error) {
    console.error('Get revenue summary error:', error);
    res.status(500).json({ error: 'Failed to get revenue summary' });
  }
});

// Get pending payments for verification
router.get('/revenue/pending-payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        p.payment_id,
        p.amount_cents,
        p.status,
        p.created_at,
        u.full_name as learner_name,
        u.email as learner_email,
        (
          SELECT STRING_AGG(c.title, ', ')
          FROM invoices i
          JOIN courses c ON i.course_id = c.course_id
          WHERE i.user_id = p.user_id 
            AND i.created_at >= DATEADD(MINUTE, -10, p.created_at)
            AND i.created_at <= DATEADD(MINUTE, 10, p.created_at)
        ) as courses
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'pending_verification'
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to get pending payments' });
  }
});

// Verify payment (Admin confirms payment received)
router.post('/revenue/verify-payment/:paymentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { verified, note } = req.body;
    const pool = await getPool();

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      if (verified) {
        // Update payment status
        const txnRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
        
        await transaction.request()
          .input('paymentId', sql.BigInt, paymentId)
          .input('txnRef', sql.NVarChar, txnRef)
          .query(`
            UPDATE payments 
            SET status = 'completed', 
                txn_ref = @txnRef,
                paid_at = GETDATE(),
                admin_note = @note
            WHERE payment_id = @paymentId
          `);

        // Get payment info to find user
        const paymentInfo = await transaction.request()
          .input('paymentId', sql.BigInt, paymentId)
          .query('SELECT user_id FROM payments WHERE payment_id = @paymentId');

        if (paymentInfo.recordset.length === 0) {
          throw new Error('Payment not found');
        }

        const userId = paymentInfo.recordset[0].user_id;

        // Get pending invoices for this user
        const invoices = await transaction.request()
          .input('userId', sql.BigInt, userId)
          .query(`
            SELECT invoice_id, course_id 
            FROM invoices 
            WHERE user_id = @userId AND status = 'pending'
          `);

        // Update invoices and create enrollments
        for (const invoice of invoices.recordset) {
          await transaction.request()
            .input('invoiceId', sql.BigInt, invoice.invoice_id)
            .query(`
              UPDATE invoices 
              SET status = 'paid', paid_at = GETDATE()
              WHERE invoice_id = @invoiceId
            `);

          // Check existing enrollment
          const existing = await transaction.request()
            .input('userId', sql.BigInt, userId)
            .input('courseId', sql.BigInt, invoice.course_id)
            .query(`
              SELECT enrollment_id 
              FROM enrollments 
              WHERE user_id = @userId AND course_id = @courseId
            `);

          if (existing.recordset.length === 0) {
            await transaction.request()
              .input('userId', sql.BigInt, userId)
              .input('courseId', sql.BigInt, invoice.course_id)
              .query(`
                INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
                VALUES (@userId, @courseId, GETDATE(), 'active')
              `);
          }
        }

        // Send notification to user
        await transaction.request()
          .input('userId', sql.BigInt, userId)
          .query(`
            INSERT INTO notifications (user_id, title, message, type, icon, link)
            VALUES (
              @userId,
              N'Thanh toán đã được xác nhận',
              N'Admin đã xác nhận thanh toán của bạn. Các khóa học đã sẵn sàng!',
              'success',
              'CheckCircle',
              '/my-learning'
            )
          `);

      } else {
        // Reject payment
        await transaction.request()
          .input('paymentId', sql.BigInt, paymentId)
          .input('note', sql.NVarChar, note)
          .query(`
            UPDATE payments 
            SET status = 'rejected',
                admin_note = @note,
                updated_at = GETDATE()
            WHERE payment_id = @paymentId
          `);
      }

      await transaction.commit();

      res.json({
        success: true,
        message: verified ? 'Payment verified successfully' : 'Payment rejected'
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get instructor revenue breakdown
router.get('/revenue/instructor-revenue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        i.instructor_id,
        u.full_name as instructor_name,
        u.email,
        COUNT(DISTINCT inv.invoice_id) as totalSales,
        SUM(inv.amount) as totalRevenue,
        SUM(inv.amount) * 0.8 as instructorShare,
        SUM(inv.amount) * 0.2 as platformFee
      FROM instructors i
      JOIN users u ON i.user_id = u.user_id
      LEFT JOIN courses c ON c.instructor_id = i.instructor_id
      LEFT JOIN invoices inv ON inv.course_id = c.course_id AND inv.status = 'paid'
      GROUP BY i.instructor_id, u.full_name, u.email
      HAVING COUNT(DISTINCT inv.invoice_id) > 0
      ORDER BY totalRevenue DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Get instructor revenue error:', error);
    res.status(500).json({ error: 'Failed to get instructor revenue' });
  }
});

export default router;
