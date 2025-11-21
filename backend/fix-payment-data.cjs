const { getPool } = require('./config/database.js');
const sql = require('mssql');

async function fixData() {
  try {
    const pool = await getPool();
    
    // 1. Check Java Servlet price
    console.log('\n=== Java Servlet Current Price ===');
    const javaResult = await pool.request()
      .query("SELECT course_id, title, price FROM courses WHERE title LIKE '%Java Servlet%'");
    console.log(JSON.stringify(javaResult.recordset, null, 2));
    
    // 2. Fix Java Servlet price to USD (reasonable price ~$99.99)
    if (javaResult.recordset.length > 0 && javaResult.recordset[0].price > 1000) {
      console.log('\n=== Fixing Java Servlet Price ===');
      await pool.request()
        .input('courseId', sql.BigInt, javaResult.recordset[0].course_id)
        .input('newPrice', sql.Decimal(10, 2), 99.99)
        .query('UPDATE courses SET price = @newPrice WHERE course_id = @courseId');
      console.log('✅ Updated Java Servlet price to $99.99');
    }
    
    // 3. Show payment amounts explanation
    console.log('\n=== Payment Amounts Explanation ===');
    const payments = await pool.request()
      .query(`
        SELECT TOP 5 
          p.payment_id,
          p.amount_cents,
          c.title,
          c.price as course_price_usd,
          p.amount_cents / 100.0 as vnd_amount,
          p.amount_cents / 100.0 / 1000.0 as back_to_usd
        FROM payments p
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN courses c ON e.course_id = c.course_id
        WHERE p.status = 'paid'
      `);
    console.log(JSON.stringify(payments.recordset, null, 2));
    
    console.log('\n=== Correct Formula ===');
    console.log('USD → VND: price * 1000 (for display)');
    console.log('USD → amount_cents: price * 1000 * 100 (for storage)');
    console.log('amount_cents → USD: amount_cents / 100 / 1000');
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixData();
