const { getPool } = require('./config/database.js');
const sql = require('mssql');

async function cleanOrphanedPayments() {
  try {
    const pool = await getPool();
    
    console.log('\n=== CLEANING ORPHANED VND PAYMENTS ===\n');
    
    // 1. Find all VND payments
    const vndPayments = await pool.request()
      .query(`
        SELECT 
          p.payment_id,
          p.enrollment_id,
          p.amount_cents,
          p.currency,
          p.status
        FROM payments p
        WHERE p.currency = 'VND'
        ORDER BY p.payment_id
      `);
    
    console.log(`Found ${vndPayments.recordset.length} VND payments\n`);
    
    // 2. Categorize
    const withEnrollment = vndPayments.recordset.filter(p => p.enrollment_id != null);
    const withoutEnrollment = vndPayments.recordset.filter(p => p.enrollment_id == null);
    
    console.log(`With enrollment: ${withEnrollment.length}`);
    console.log(`Without enrollment (orphaned): ${withoutEnrollment.length}\n`);
    
    // 3. Convert ALL VND payments to USD (can't delete due to FK constraints)
    console.log('🔧 Converting ALL VND payments to USD...\n');
    
    // For orphaned payments (no enrollment), set to $0
    console.log('Setting orphaned payments to $0...');
    const updateOrphaned = await pool.request()
      .query(`
        UPDATE payments
        SET amount_cents = 0,
            currency = 'USD'
        WHERE currency = 'VND'
          AND enrollment_id IS NULL
      `);
    
    console.log(`✅ Updated ${updateOrphaned.rowsAffected[0]} orphaned payments to $0\n`);
    
    // For payments with enrollments, convert based on course price
    console.log('Converting payments with enrollments...\n');
    
    for (const payment of withEnrollment) {
      // Get course price
      const courseQuery = await pool.request()
        .input('enrollmentId', sql.BigInt, payment.enrollment_id)
        .query(`
          SELECT c.price, c.title
          FROM enrollments e
          INNER JOIN courses c ON e.course_id = c.course_id
          WHERE e.enrollment_id = @enrollmentId
        `);
      
      if (courseQuery.recordset.length > 0) {
        const course = courseQuery.recordset[0];
        const correctAmountCents = Math.round(course.price * 100);
        
        await pool.request()
          .input('paymentId', sql.BigInt, payment.payment_id)
          .input('amountCents', sql.BigInt, correctAmountCents)
          .query(`
            UPDATE payments
            SET amount_cents = @amountCents,
                currency = 'USD'
            WHERE payment_id = @paymentId
          `);
        
        console.log(`✅ Payment ${payment.payment_id}: ${course.title}`);
        console.log(`   ${payment.amount_cents} VND → ${correctAmountCents} USD cents ($${course.price})\n`);
      }
    }
    
    // 5. Final verification
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL VERIFICATION');
    console.log('='.repeat(60));
    
    const finalCheck = await pool.request()
      .query(`
        SELECT 
          currency,
          COUNT(*) as count,
          SUM(CASE WHEN enrollment_id IS NULL THEN 1 ELSE 0 END) as orphaned
        FROM payments
        GROUP BY currency
        ORDER BY currency
      `);
    
    console.log('\nCurrency distribution:');
    finalCheck.recordset.forEach(row => {
      console.log(`  ${row.currency}: ${row.count} payments (${row.orphaned} orphaned)`);
    });
    
    // Check for any remaining VND
    const remainingVND = await pool.request()
      .query(`SELECT COUNT(*) as count FROM payments WHERE currency = 'VND'`);
    
    console.log('\n' + '='.repeat(60));
    if (remainingVND.recordset[0].count === 0) {
      console.log('✅ SUCCESS! NO MORE VND PAYMENTS!');
      console.log('✅ ALL PAYMENTS ARE NOW IN USD!');
    } else {
      console.log(`⚠️  WARNING: ${remainingVND.recordset[0].count} VND payments still remain`);
    }
    console.log('='.repeat(60) + '\n');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanOrphanedPayments();
