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

async function verify() {
  try {
    console.log('🔄 Connecting to database...\n');
    const pool = await sql.connect(config);
    
    // Check currency distribution
    const currencyCheck = await pool.request().query(`
      SELECT currency, COUNT(*) as count
      FROM payments
      GROUP BY currency
    `);
    
    console.log('📊 CURRENCY DISTRIBUTION:');
    currencyCheck.recordset.forEach(row => {
      console.log(`   ${row.currency}: ${row.count} payments`);
    });
    
    // Check non-zero payments
    const activePayments = await pool.request().query(`
      SELECT COUNT(*) as count, SUM(amount_cents / 100.0) as total_usd
      FROM payments
      WHERE amount_cents > 0
    `);
    
    console.log('\n💰 ACTIVE PAYMENTS (amount > $0):');
    console.log(`   Count: ${activePayments.recordset[0].count}`);
    console.log(`   Total: $${activePayments.recordset[0].total_usd?.toFixed(2) || '0.00'}`);
    
    // Check instructor revenue
    const revenueCheck = await pool.request()
      .input('instructorId', sql.BigInt, 2)
      .query(`
        SELECT SUM(p.amount_cents / 100.0) as total_revenue
        FROM payments p
        INNER JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE c.owner_instructor_id = @instructorId
      `);
    
    console.log('\n👨‍🏫 INSTRUCTOR REVENUE (User ID 2):');
    console.log(`   Total: $${revenueCheck.recordset[0].total_revenue?.toFixed(2) || '0.00'}`);
    
    console.log('\n✅ Verification complete!\n');
    
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verify();
