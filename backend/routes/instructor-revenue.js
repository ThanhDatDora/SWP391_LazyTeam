import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware check instructor role
const requireInstructor = (req, res, next) => {
  if (req.user.roleId !== 2) {
    return res.status(403).json({ error: 'Instructor access required' });
  }
  next();
};

// Get instructor revenue summary
router.get('/revenue/summary', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = await getPool();

    // Get instructor ID
    const instructorResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query('SELECT instructor_id FROM instructors WHERE user_id = @userId');

    if (instructorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const instructorId = instructorResult.recordset[0].instructor_id;

    // Get revenue summary
    const revenueResult = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        SELECT 
          COUNT(DISTINCT inv.invoice_id) as totalSales,
          COUNT(DISTINCT inv.course_id) as coursesSold,
          COUNT(DISTINCT e.enrollment_id) as totalEnrollments,
          SUM(inv.amount) as totalRevenue,
          SUM(inv.amount) * 0.8 as instructorShare,
          SUM(inv.amount) * 0.2 as platformFee
        FROM courses c
        JOIN invoices inv ON inv.course_id = c.course_id
        LEFT JOIN enrollments e ON e.course_id = c.course_id
        WHERE c.instructor_id = @instructorId 
          AND inv.status = 'paid'
      `);

    // Get monthly revenue (last 6 months)
    const monthlyResult = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        SELECT 
          FORMAT(inv.paid_at, 'yyyy-MM') as month,
          COUNT(*) as sales,
          SUM(inv.amount) as revenue,
          SUM(inv.amount) * 0.8 as instructorShare
        FROM courses c
        JOIN invoices inv ON inv.course_id = c.course_id
        WHERE c.instructor_id = @instructorId 
          AND inv.status = 'paid'
          AND inv.paid_at >= DATEADD(MONTH, -6, GETDATE())
        GROUP BY FORMAT(inv.paid_at, 'yyyy-MM')
        ORDER BY month DESC
      `);

    // Get revenue by course
    const courseResult = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        SELECT 
          c.course_id,
          c.title,
          c.price,
          COUNT(inv.invoice_id) as sales,
          SUM(inv.amount) as totalRevenue,
          SUM(inv.amount) * 0.8 as instructorShare
        FROM courses c
        LEFT JOIN invoices inv ON inv.course_id = c.course_id AND inv.status = 'paid'
        WHERE c.instructor_id = @instructorId
        GROUP BY c.course_id, c.title, c.price
        ORDER BY sales DESC
      `);

    const summary = revenueResult.recordset[0] || {
      totalSales: 0,
      coursesSold: 0,
      totalEnrollments: 0,
      totalRevenue: 0,
      instructorShare: 0,
      platformFee: 0
    };

    res.json({
      success: true,
      data: {
        summary,
        monthlyRevenue: monthlyResult.recordset,
        courseRevenue: courseResult.recordset
      }
    });

  } catch (error) {
    console.error('Get instructor revenue error:', error);
    res.status(500).json({ error: 'Failed to get revenue summary' });
  }
});

// Get recent transactions
router.get('/revenue/transactions', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;
    const pool = await getPool();

    // Get instructor ID
    const instructorResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query('SELECT instructor_id FROM instructors WHERE user_id = @userId');

    if (instructorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const instructorId = instructorResult.recordset[0].instructor_id;

    const result = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .input('limit', sql.Int, parseInt(limit))
      .input('offset', sql.Int, parseInt(offset))
      .query(`
        SELECT 
          inv.invoice_id,
          inv.amount,
          inv.amount * 0.8 as instructorShare,
          inv.status,
          inv.paid_at,
          c.title as course_title,
          u.full_name as learner_name,
          u.email as learner_email,
          p.txn_ref
        FROM invoices inv
        JOIN courses c ON inv.course_id = c.course_id
        JOIN users u ON inv.user_id = u.user_id
        LEFT JOIN payments p ON p.payment_id = inv.payment_id
        WHERE c.instructor_id = @instructorId
        ORDER BY inv.paid_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

export default router;
