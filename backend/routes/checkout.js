import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Verify payment status (check if payment received via QR/Bank transfer)
router.post('/verify-payment', authenticateToken, [
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

    // Check payment status in database
    const result = await pool.request()
      .input('paymentId', sql.BigInt, paymentId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT payment_id, status, paid_at, txn_ref, created_at
        FROM payments 
        WHERE payment_id = @paymentId AND user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.json({
        success: false,
        error: 'Payment not found'
      });
    }

    const payment = result.recordset[0];
    
    // TODO: Integrate with VietQR API or bank webhook to check actual payment
    // For now, we simulate: if payment was created more than 5 seconds ago, consider verified
    // In production, this should call bank API or check webhook notifications
    const createdAt = new Date(payment.created_at);
    const now = new Date();
    const secondsPassed = (now - createdAt) / 1000;
    
    // Simulate payment verification:
    // - If status is already 'completed', return verified
    // - If pending and > 5 seconds old, mark as completed (simulating instant bank confirmation)
    let verified = payment.status === 'completed';
    
    if (!verified && payment.status === 'pending' && secondsPassed >= 5) {
      // Simulate bank confirmation received
      // In production: Check with VietQR/Bank API here
      verified = true;
      
      // Update status to completed
      const txnRef = payment.txn_ref || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
      await pool.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('txnRef', sql.NVarChar, txnRef)
        .query(`
          UPDATE payments 
          SET status = 'completed', txn_ref = @txnRef, paid_at = GETDATE()
          WHERE payment_id = @paymentId
        `);
    }

    res.json({
      success: true,
      data: {
        verified,
        status: verified ? 'completed' : payment.status,
        paidAt: payment.paid_at,
        transactionRef: payment.txn_ref
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while verifying payment'
    });
  }
});

// Create order/invoice (Ghi danh ngay hoặc từ giỏ hàng)
router.post('/create-order', authenticateToken, [
  body('courses').isArray().notEmpty().withMessage('Courses must be a non-empty array'),
  body('courses.*.courseId').isInt().withMessage('Valid course ID required'),
  body('billingInfo').isObject().withMessage('Billing information required'),
  body('billingInfo.firstName').trim().notEmpty(),
  body('billingInfo.lastName').trim().notEmpty(),
  body('billingInfo.email').isEmail(),
  body('billingInfo.address').trim().notEmpty(),
  body('billingInfo.city').trim().notEmpty(),
  body('billingInfo.country').trim().notEmpty(),
  body('billingInfo.zipCode').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courses, billingInfo, paymentMethod = 'card' } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();

    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      const invoiceIds = [];
      let totalAmount = 0;

      // Create invoice for each course
      for (const item of courses) {
        const { courseId } = item;

        // Get course price
        const courseResult = await transaction.request()
          .input('courseId', sql.BigInt, courseId)
          .query('SELECT price, title FROM courses WHERE course_id = @courseId');

        if (courseResult.recordset.length === 0) {
          throw new Error(`Course ${courseId} not found`);
        }

        const course = courseResult.recordset[0];
        const amount = course.price;
        totalAmount += amount;

        // Create invoice
        const invoiceResult = await transaction.request()
          .input('userId', sql.BigInt, userId)
          .input('courseId', sql.BigInt, courseId)
          .input('amount', sql.Decimal(10, 2), amount)
          .input('status', sql.NVarChar(30), 'pending')
          .query(`
            INSERT INTO invoices (user_id, course_id, amount, status, created_at)
            OUTPUT INSERTED.invoice_id
            VALUES (@userId, @courseId, @amount, @status, GETDATE())
          `);

        invoiceIds.push(invoiceResult.recordset[0].invoice_id);
      }

      // Create payment record
      const paymentResult = await transaction.request()
        .input('userId', sql.BigInt, userId)
        .input('provider', sql.NVarChar, paymentMethod)
        .input('amountCents', sql.Int, Math.round(totalAmount * 100)) // Convert to cents
        .input('currency', sql.Char(3), 'VND')
        .input('status', sql.NVarChar, 'pending')
        .query(`
          INSERT INTO payments (user_id, provider, amount_cents, currency, status, created_at)
          OUTPUT INSERTED.payment_id
          VALUES (@userId, @provider, @amountCents, @currency, @status, GETDATE())
        `);

      const paymentId = paymentResult.recordset[0].payment_id;
      
      // Link invoices to payment
      for (const invoiceId of invoiceIds) {
        await transaction.request()
          .input('invoiceId', sql.BigInt, invoiceId)
          .input('paymentId', sql.BigInt, paymentId)
          .query(`UPDATE invoices SET payment_id = @paymentId WHERE invoice_id = @invoiceId`);
      }

      // Commit transaction
      await transaction.commit();

      res.json({
        success: true,
        message: 'Order created successfully',
        data: {
          paymentId,
          invoiceIds,
          totalAmount,
          billingInfo
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
});

// Complete payment and enroll
router.post('/complete-payment', authenticateToken, [
  body('paymentId').isInt().withMessage('Valid payment ID required'),
  body('paymentDetails').isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Update payment status
      const txnRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
      
      await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('status', sql.NVarChar, 'completed')
        .input('txnRef', sql.NVarChar, txnRef)
        .query(`
          UPDATE payments 
          SET status = @status, txn_ref = @txnRef, paid_at = GETDATE()
          WHERE payment_id = @paymentId
        `);

      // Get all pending invoices for this user
      const invoicesResult = await transaction.request()
        .input('userId', sql.BigInt, userId)
        .query(`
          SELECT invoice_id, course_id, amount 
          FROM invoices 
          WHERE user_id = @userId AND status = 'pending'
        `);

      // Update invoices and create enrollments
      for (const invoice of invoicesResult.recordset) {
        // Update invoice status
        await transaction.request()
          .input('invoiceId', sql.BigInt, invoice.invoice_id)
          .query(`
            UPDATE invoices 
            SET status = 'paid', paid_at = GETDATE()
            WHERE invoice_id = @invoiceId
          `);

        // Check if already enrolled
        const existingEnrollment = await transaction.request()
          .input('userId', sql.BigInt, userId)
          .input('courseId', sql.BigInt, invoice.course_id)
          .query(`
            SELECT enrollment_id 
            FROM enrollments 
            WHERE user_id = @userId AND course_id = @courseId
          `);

        // Create enrollment if not exists
        if (existingEnrollment.recordset.length === 0) {
          const enrollResult = await transaction.request()
            .input('userId', sql.BigInt, userId)
            .input('courseId', sql.BigInt, invoice.course_id)
            .input('status', sql.NVarChar(20), 'active')
            .query(`
              INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
              OUTPUT INSERTED.enrollment_id
              VALUES (@userId, @courseId, GETDATE(), @status)
            `);

          const enrollmentId = enrollResult.recordset[0].enrollment_id;

          // Link payment to enrollment
          await transaction.request()
            .input('paymentId', sql.BigInt, paymentId)
            .input('enrollmentId', sql.BigInt, enrollmentId)
            .query(`
              UPDATE payments 
              SET enrollment_id = @enrollmentId 
              WHERE payment_id = @paymentId
            `);
        }
      }

      // Create notification
      await transaction.request()
        .input('userId', sql.BigInt, userId)
        .query(`
          INSERT INTO notifications (user_id, title, message, type, icon, link)
          VALUES (
            @userId,
            N'Thanh toán thành công',
            N'Bạn đã ghi danh thành công các khóa học. Hãy bắt đầu học ngay!',
            'success',
            'CheckCircle',
            '/my-learning'
          )
        `);

      await transaction.commit();

      res.json({
        success: true,
        message: 'Payment completed successfully',
        data: {
          transactionRef: txnRef,
          enrolledCourses: invoicesResult.recordset.length
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ 
      error: 'Failed to complete payment',
      message: error.message 
    });
  }
});

// Get user's invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          i.invoice_id as id,
          i.course_id as courseId,
          c.title as courseTitle,
          i.amount,
          i.status,
          i.created_at as createdAt,
          i.paid_at as paidAt
        FROM invoices i
        INNER JOIN courses c ON i.course_id = c.course_id
        WHERE i.user_id = @userId
        ORDER BY i.created_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Enroll immediately (Ghi danh ngay - bypass cart)
router.post('/enroll-now', authenticateToken, [
  body('courseId').isInt().withMessage('Valid course ID required'),
  body('billingInfo').isObject(),
  body('paymentMethod').isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, paymentMethod = 'card' } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Get course info
      const courseResult = await transaction.request()
        .input('courseId', sql.BigInt, courseId)
        .query('SELECT price, title FROM courses WHERE course_id = @courseId');

      if (courseResult.recordset.length === 0) {
        throw new Error('Course not found');
      }

      const course = courseResult.recordset[0];

      // Create invoice
      const invoiceResult = await transaction.request()
        .input('userId', sql.BigInt, userId)
        .input('courseId', sql.BigInt, courseId)
        .input('amount', sql.Decimal(10, 2), course.price)
        .input('status', sql.NVarChar(30), 'paid')
        .query(`
          INSERT INTO invoices (user_id, course_id, amount, status, created_at, paid_at)
          OUTPUT INSERTED.invoice_id
          VALUES (@userId, @courseId, @amount, @status, GETDATE(), GETDATE())
        `);

      const invoiceId = invoiceResult.recordset[0].invoice_id;

      // Create payment
      const txnRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
      
      const paymentResult = await transaction.request()
        .input('provider', sql.NVarChar, paymentMethod)
        .input('invoiceId', sql.BigInt, invoiceId)
        .input('amountCents', sql.Int, Math.round(course.price * 100))
        .input('currency', sql.Char(3), 'VND')
        .input('status', sql.NVarChar, 'completed')
        .input('txnRef', sql.NVarChar, txnRef)
        .query(`
          INSERT INTO payments (provider, amount_cents, currency, status, txn_ref, paid_at, created_at)
          OUTPUT INSERTED.payment_id
          VALUES (@provider, @amountCents, @currency, @status, @txnRef, GETDATE(), GETDATE())
        `);

      const paymentId = paymentResult.recordset[0].payment_id;

      // Check existing enrollment
      const existingEnrollment = await transaction.request()
        .input('userId', sql.BigInt, userId)
        .input('courseId', sql.BigInt, courseId)
        .query(`
          SELECT enrollment_id 
          FROM enrollments 
          WHERE user_id = @userId AND course_id = @courseId
        `);

      let enrollmentId;
      if (existingEnrollment.recordset.length === 0) {
        // Create new enrollment
        const enrollResult = await transaction.request()
          .input('userId', sql.BigInt, userId)
          .input('courseId', sql.BigInt, courseId)
          .input('status', sql.NVarChar(20), 'active')
          .query(`
            INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
            OUTPUT INSERTED.enrollment_id
            VALUES (@userId, @courseId, GETDATE(), @status)
          `);

        enrollmentId = enrollResult.recordset[0].enrollment_id;
      } else {
        enrollmentId = existingEnrollment.recordset[0].enrollment_id;
      }

      // Link payment to enrollment
      await transaction.request()
        .input('paymentId', sql.BigInt, paymentId)
        .input('enrollmentId', sql.BigInt, enrollmentId)
        .query(`
          UPDATE payments 
          SET enrollment_id = @enrollmentId 
          WHERE payment_id = @paymentId
        `);

      // Create notification
      await transaction.request()
        .input('userId', sql.BigInt, userId)
        .input('courseTitle', sql.NVarChar, course.title)
        .query(`
          INSERT INTO notifications (user_id, title, message, type, icon, link)
          VALUES (
            @userId,
            N'Ghi danh thành công',
            N'Bạn đã ghi danh thành công khóa học "' + @courseTitle + N'". Hãy bắt đầu học ngay!',
            'success',
            'CheckCircle',
            '/my-learning'
          )
        `);

      await transaction.commit();

      res.json({
        success: true,
        message: 'Enrollment successful',
        data: {
          transactionRef: txnRef,
          courseId,
          courseTitle: course.title,
          enrollmentId
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Enroll now error:', error);
    res.status(500).json({ 
      error: 'Failed to enroll',
      message: error.message 
    });
  }
});

export default router;
