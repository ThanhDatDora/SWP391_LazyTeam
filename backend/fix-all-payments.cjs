const { getPool } = require('./config/database.js');
const sql = require('mssql');

async function fixAllPayments() {
  try {
    const pool = await getPool();
    
    console.log('\n=== FIXING ALL PAYMENTS TO USD STANDARD ===\n');
    
    // 1. Get all payments with their course prices
    console.log('📊 Loading all payments...');
    const allPayments = await pool.request()
      .query(`
        SELECT 
          p.payment_id,
          p.enrollment_id,
          p.amount_cents,
          p.currency,
          c.price as course_price_usd,
          c.title as course_title
        FROM payments p
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN courses c ON e.course_id = c.course_id
        ORDER BY p.payment_id
      `);
    
    console.log(`Found ${allPayments.recordset.length} payments\n`);
    
    // 2. Categorize payments
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    console.log('🔧 Processing payments...\n');
    
    for (const payment of allPayments.recordset) {
      try {
        const coursePrice = payment.course_price_usd;
        
        // Skip if no enrollment (orphaned payment)
        if (!payment.enrollment_id || !coursePrice) {
          console.log(`⚠️  Payment ${payment.payment_id}: No enrollment/course - SKIPPED`);
          skippedCount++;
          continue;
        }
        
        // Calculate correct USD cents
        const correctAmountCents = Math.round(coursePrice * 100);
        
        // Check if already correct
        if (payment.currency === 'USD' && payment.amount_cents === correctAmountCents) {
          // Already correct, skip
          continue;
        }
        
        // Update to USD standard
        await pool.request()
          .input('paymentId', sql.BigInt, payment.payment_id)
          .input('amountCents', sql.BigInt, correctAmountCents)
          .input('currency', sql.VarChar(3), 'USD')
          .query(`
            UPDATE payments 
            SET amount_cents = @amountCents,
                currency = @currency
            WHERE payment_id = @paymentId
          `);
        
        console.log(`✅ Payment ${payment.payment_id}: ${payment.course_title || 'Unknown'}`);
        console.log(`   Old: ${payment.amount_cents} cents (${payment.currency})`);
        console.log(`   New: ${correctAmountCents} cents (USD) = $${coursePrice}\n`);
        
        fixedCount++;
        
      } catch (error) {
        console.error(`❌ Payment ${payment.payment_id}: Error - ${error.message}`);
        errorCount++;
      }
    }
    
    // 3. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONVERSION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total payments: ${allPayments.recordset.length}`);
    console.log(`✅ Fixed: ${fixedCount}`);
    console.log(`⚠️  Skipped (no enrollment): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));
    
    // 4. Verification
    console.log('\n🔍 VERIFICATION - Checking all payments...\n');
    
    const verify = await pool.request()
      .query(`
        SELECT 
          currency,
          COUNT(*) as count
        FROM payments
        GROUP BY currency
        ORDER BY currency
      `);
    
    console.log('Currency distribution:');
    verify.recordset.forEach(row => {
      console.log(`  ${row.currency}: ${row.count} payments`);
    });
    
    // 5. Show sample of fixed payments
    console.log('\n📋 Sample of payments (first 10 with courses):\n');
    
    const sample = await pool.request()
      .query(`
        SELECT TOP 10
          p.payment_id,
          c.title,
          c.price as course_price,
          p.amount_cents,
          p.amount_cents / 100.0 as calculated_price,
          p.currency,
          p.status,
          CASE 
            WHEN c.price IS NULL THEN 'No Course'
            WHEN ABS(c.price - (p.amount_cents / 100.0)) < 0.01 THEN '✅ MATCH'
            ELSE '❌ MISMATCH'
          END as validation
        FROM payments p
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN courses c ON e.course_id = c.course_id
        WHERE c.price IS NOT NULL
        ORDER BY p.payment_id
      `);
    
    sample.recordset.forEach(p => {
      console.log(`Payment ${p.payment_id}: ${p.title}`);
      console.log(`  Course: $${p.course_price} | Payment: $${p.calculated_price} (${p.amount_cents} cents)`);
      console.log(`  Currency: ${p.currency} | Status: ${p.status} | ${p.validation}\n`);
    });
    
    console.log('✅ ALL PAYMENTS NOW USE USD STANDARD!\n');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllPayments();
