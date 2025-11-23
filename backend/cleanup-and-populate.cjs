const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function cleanup() {
  try {
    console.log('🔄 Connecting to database...\n');
    const pool = await sql.connect(config);
    
    console.log('============================================================');
    console.log('STEP 1: DELETE ORPHANED INVOICES AND PAYMENTS');
    console.log('============================================================\n');
    
    // First, delete invoices where payment has enrollment_id = NULL
    const deleteInvoices = await pool.request().query(`
      DELETE FROM invoices
      WHERE payment_id IN (
        SELECT payment_id FROM payments WHERE enrollment_id IS NULL
      )
    `);
    console.log(`✅ Deleted ${deleteInvoices.rowsAffected[0]} orphaned invoices\n`);
    
    // Then delete orphaned payments
    const deletePayments = await pool.request().query(`
      DELETE FROM payments
      WHERE enrollment_id IS NULL
    `);
    console.log(`✅ Deleted ${deletePayments.rowsAffected[0]} orphaned payments\n`);
    
    console.log('============================================================');
    console.log('STEP 2: FIND ENROLLMENTS WITHOUT PAYMENT/INVOICE');
    console.log('============================================================\n');
    
    // Find enrollments that don't have payments
    const missingPayments = await pool.request().query(`
      SELECT 
        e.enrollment_id,
        e.user_id,
        e.course_id,
        c.title,
        c.price,
        e.enrolled_at
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id
      WHERE p.payment_id IS NULL
      ORDER BY e.enrolled_at
    `);
    
    console.log(`Found ${missingPayments.recordset.length} enrollments without payment records\n`);
    
    if (missingPayments.recordset.length > 0) {
      console.log('============================================================');
      console.log('STEP 3: CREATE MISSING PAYMENTS AND INVOICES');
      console.log('============================================================\n');
      
      for (const enrollment of missingPayments.recordset) {
        const amountCents = Math.round(enrollment.price * 100);
        
        // Insert payment
        const paymentResult = await pool.request()
          .input('enrollmentId', sql.BigInt, enrollment.enrollment_id)
          .input('userId', sql.BigInt, enrollment.user_id)
          .input('provider', sql.NVarChar(50), 'manual')
          .input('amountCents', sql.Int, amountCents)
          .input('currency', sql.Char(3), 'USD')
          .input('status', sql.NVarChar(20), 'completed')
          .input('createdAt', sql.DateTime2, enrollment.enrolled_at)
          .query(`
            INSERT INTO payments (
              enrollment_id, user_id, provider, amount_cents, currency, 
              status, created_at, paid_at
            )
            OUTPUT INSERTED.payment_id
            VALUES (
              @enrollmentId, @userId, @provider, @amountCents, @currency,
              @status, @createdAt, @createdAt
            )
          `);
        
        const paymentId = paymentResult.recordset[0].payment_id;
        
        // Insert invoice
        await pool.request()
          .input('paymentId', sql.BigInt, paymentId)
          .input('userId', sql.BigInt, enrollment.user_id)
          .input('courseId', sql.BigInt, enrollment.course_id)
          .input('amount', sql.Decimal(10, 2), enrollment.price)
          .input('status', sql.NVarChar(20), 'paid')
          .input('createdAt', sql.DateTime2, enrollment.enrolled_at)
          .query(`
            INSERT INTO invoices (
              payment_id, user_id, course_id, amount,
              status, created_at, paid_at
            )
            VALUES (
              @paymentId, @userId, @courseId, @amount,
              @status, @createdAt, @createdAt
            )
          `);
        
        console.log(`✅ Created payment & invoice for enrollment ${enrollment.enrollment_id}`);
        console.log(`   Course: ${enrollment.title}`);
        console.log(`   Amount: $${enrollment.price} (${amountCents} cents USD)\n`);
      }
    }
    
    console.log('============================================================');
    console.log('STEP 4: FINAL VERIFICATION');
    console.log('============================================================\n');
    
    // Count remaining payments
    const paymentCount = await pool.request().query(`
      SELECT COUNT(*) as total FROM payments
    `);
    console.log(`Total payments: ${paymentCount.recordset[0].total}`);
    
    // Count payments with enrollments
    const withEnrollment = await pool.request().query(`
      SELECT COUNT(*) as total FROM payments WHERE enrollment_id IS NOT NULL
    `);
    console.log(`Payments with enrollment: ${withEnrollment.recordset[0].total}`);
    
    // Count orphaned payments
    const orphaned = await pool.request().query(`
      SELECT COUNT(*) as total FROM payments WHERE enrollment_id IS NULL
    `);
    console.log(`Orphaned payments: ${orphaned.recordset[0].total}`);
    
    // Total revenue
    const revenue = await pool.request().query(`
      SELECT SUM(amount_cents / 100.0) as total_usd
      FROM payments
      WHERE enrollment_id IS NOT NULL
    `);
    console.log(`\nTotal revenue: $${revenue.recordset[0].total_usd?.toFixed(2) || '0.00'}`);
    console.log(`Revenue in VND: ${Math.round((revenue.recordset[0].total_usd || 0) * 1000).toLocaleString('vi-VN')}đ`);
    
    console.log('\n✅ CLEANUP AND POPULATION COMPLETE!\n');
    
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

cleanup();
