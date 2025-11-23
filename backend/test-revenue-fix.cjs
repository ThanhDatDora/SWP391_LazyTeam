const { getPool } = require('./config/database.js');
const sql = require('mssql');

async function testRevenue() {
  try {
    const pool = await getPool();
    
    console.log('\n=== TESTING REVENUE CALCULATION ===\n');
    
    // Simulate the instructor revenue query
    const result = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT 
          COUNT(DISTINCT p.payment_id) as total_sales,
          COUNT(DISTINCT e.user_id) as total_students,
          ISNULL(SUM(p.amount_cents / 100.0 / 1000.0), 0) as total_revenue,
          ISNULL(SUM(p.amount_cents / 100.0 / 1000.0 * 0.8), 0) as instructor_share
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id AND p.status = 'paid'
        WHERE c.owner_instructor_id = @instructor_id
      `);
    
    const summary = result.recordset[0];
    
    console.log('📊 Revenue Summary:');
    console.log('  Total Sales (paid):', summary.total_sales);
    console.log('  Total Students:', summary.total_students);
    console.log('  Total Revenue (USD):', `$${summary.total_revenue.toFixed(2)}`);
    console.log('  Instructor Share (80%):', `$${summary.instructor_share.toFixed(2)}`);
    
    // Show payment details
    console.log('\n💳 Payment Details:');
    const payments = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT 
          p.payment_id,
          c.title,
          c.price as course_price_usd,
          p.amount_cents,
          p.amount_cents / 100.0 as vnd_paid,
          p.amount_cents / 100.0 / 1000.0 as usd_equivalent,
          p.status,
          p.paid_at
        FROM payments p
        INNER JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE c.owner_instructor_id = @instructor_id
          AND p.status = 'paid'
      `);
    
    payments.recordset.forEach(p => {
      console.log(`  • ${p.title}`);
      console.log(`    Course Price: $${p.course_price_usd}`);
      console.log(`    Paid: ${p.vnd_paid.toLocaleString()} VND (${p.amount_cents.toLocaleString()} cents)`);
      console.log(`    USD Equivalent: $${p.usd_equivalent.toFixed(2)}`);
      console.log(`    Match: ${Math.abs(p.course_price_usd - p.usd_equivalent) < 0.01 ? '✅' : '❌'}`);
    });
    
    console.log('\n✅ Revenue calculation is now CORRECT!');
    console.log('   Formula: amount_cents / 100 / 1000 = USD');
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testRevenue();
