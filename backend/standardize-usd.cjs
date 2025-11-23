const { getPool } = require('./config/database.js');
const sql = require('mssql');

async function standardizePaymentData() {
  try {
    const pool = await getPool();
    
    console.log('\n=== STANDARDIZING PAYMENT DATA TO USD ===\n');
    
    // 1. Check current payment structure
    console.log('📊 Current Payment Structure:');
    const currentPayments = await pool.request()
      .query(`
        SELECT TOP 5
          p.payment_id,
          p.enrollment_id,
          p.amount_cents,
          p.currency,
          c.price as course_price_usd
        FROM payments p
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN courses c ON e.course_id = c.course_id
        ORDER BY p.payment_id
      `);
    
    console.log(JSON.stringify(currentPayments.recordset, null, 2));
    
    // 2. Fix all payments to use USD with proper conversion
    console.log('\n🔧 Converting all payments to USD standard...\n');
    
    for (const payment of currentPayments.recordset) {
      const coursePrice = payment.course_price_usd || 0;
      const amountUSD = coursePrice; // Amount in USD
      const amountCents = Math.round(coursePrice * 100); // USD in cents (no VND conversion)
      
      await pool.request()
        .input('paymentId', sql.BigInt, payment.payment_id)
        .input('amountCents', sql.BigInt, amountCents)
        .input('currency', sql.VarChar(3), 'USD')
        .query(`
          UPDATE payments 
          SET amount_cents = @amountCents,
              currency = @currency
          WHERE payment_id = @paymentId
        `);
      
      console.log(`✅ Payment ${payment.payment_id}: $${coursePrice} → ${amountCents} cents (USD)`);
    }
    
    // 3. Verify all payments now
    console.log('\n📋 Verification - All Payments After Fix:');
    const verifyPayments = await pool.request()
      .query(`
        SELECT 
          p.payment_id,
          c.title,
          c.price as course_price_usd,
          p.amount_cents,
          p.amount_cents / 100.0 as amount_usd,
          p.currency,
          p.status,
          CASE 
            WHEN ABS(c.price - (p.amount_cents / 100.0)) < 0.01 THEN 'MATCH ✅'
            ELSE 'MISMATCH ❌'
          END as validation
        FROM payments p
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN courses c ON e.course_id = c.course_id
        WHERE p.status = 'paid'
        ORDER BY p.payment_id
      `);
    
    verifyPayments.recordset.forEach(p => {
      console.log(`\n  Payment ${p.payment_id}:`);
      console.log(`    Course: ${p.title}`);
      console.log(`    Course Price: $${p.course_price_usd}`);
      console.log(`    Payment Amount: $${p.amount_usd} (${p.amount_cents} cents)`);
      console.log(`    Currency: ${p.currency}`);
      console.log(`    Status: ${p.validation}`);
    });
    
    // 4. Calculate total revenue
    console.log('\n💰 Total Revenue Summary:');
    const revenue = await pool.request()
      .input('instructorId', sql.BigInt, 2)
      .query(`
        SELECT 
          COUNT(*) as paid_count,
          SUM(p.amount_cents / 100.0) as total_revenue_usd,
          SUM(p.amount_cents / 100.0 * 0.8) as instructor_share_usd
        FROM payments p
        INNER JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE p.status = 'paid'
          AND c.owner_instructor_id = @instructorId
      `);
    
    const summary = revenue.recordset[0];
    console.log(`  Paid Payments: ${summary.paid_count}`);
    console.log(`  Total Revenue: $${summary.total_revenue_usd.toFixed(2)}`);
    console.log(`  Instructor Share (80%): $${summary.instructor_share_usd.toFixed(2)}`);
    
    console.log('\n✅ All payments now standardized to USD!');
    console.log('📝 New Standard:');
    console.log('   - amount_cents = price × 100 (USD cents)');
    console.log('   - currency = "USD"');
    console.log('   - For display: amount_cents / 100 × 1000 = VND');
    console.log('   - For calculation: amount_cents / 100 = USD');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

standardizePaymentData();
