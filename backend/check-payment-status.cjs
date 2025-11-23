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

async function checkStatus() {
  try {
    const pool = await sql.connect(config);
    
    console.log('Payment status distribution:');
    const result = await pool.request().query(`
      SELECT DISTINCT status, COUNT(*) as count 
      FROM payments 
      GROUP BY status
    `);
    result.recordset.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    console.log('\nRevenue with status = "paid":');
    const paid = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT ISNULL(SUM(p.amount_cents / 100.0), 0) as revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id AND p.status = 'paid'
        WHERE c.owner_instructor_id = @instructor_id
      `);
    console.log(`  $${paid.recordset[0].revenue}`);
    
    console.log('\nRevenue with status = "completed":');
    const completed = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT ISNULL(SUM(p.amount_cents / 100.0), 0) as revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id AND p.status = 'completed'
        WHERE c.owner_instructor_id = @instructor_id
      `);
    console.log(`  $${completed.recordset[0].revenue}`);
    
    console.log('\nRevenue WITHOUT status filter:');
    const all = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT ISNULL(SUM(p.amount_cents / 100.0), 0) as revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id
        WHERE c.owner_instructor_id = @instructor_id
      `);
    console.log(`  $${all.recordset[0].revenue}`);
    
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkStatus();
