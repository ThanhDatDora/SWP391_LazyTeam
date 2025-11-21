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

async function checkRevenue() {
  try {
    console.log('🔄 Connecting to database...\n');
    const pool = await sql.connect(config);
    
    // Check what the stats API returns
    console.log('============================================================');
    console.log('STATS API QUERY (instructor_id = 2):');
    console.log('============================================================\n');
    
    const stats = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT 
          COUNT(DISTINCT c.course_id) as total_courses,
          COUNT(DISTINCT e.user_id) as total_students,
          ISNULL(AVG(CAST(r.rating as FLOAT)), 0) as avg_rating,
          SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0 END) as active_courses
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN reviews r ON c.course_id = r.course_id
        WHERE c.owner_instructor_id = @instructor_id
      `);
    
    console.log('Stats result:', stats.recordset[0]);
    
    // Check revenue summary API
    console.log('\n============================================================');
    console.log('REVENUE SUMMARY API QUERY:');
    console.log('============================================================\n');
    
    const revenue = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT 
          SUM(p.amount_cents / 100.0) as total_revenue,
          COUNT(p.payment_id) as total_sales
        FROM payments p
        INNER JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE c.owner_instructor_id = @instructor_id
      `);
    
    console.log('Revenue result:', revenue.recordset[0]);
    console.log(`Total revenue USD: $${revenue.recordset[0].total_revenue?.toFixed(2) || '0.00'}`);
    console.log(`Total revenue VND: ${Math.round((revenue.recordset[0].total_revenue || 0) * 1000).toLocaleString('vi-VN')}đ`);
    
    // Check monthly revenue
    console.log('\n============================================================');
    console.log('MONTHLY REVENUE (last 6 months):');
    console.log('============================================================\n');
    
    const monthly = await pool.request()
      .input('instructor_id', sql.BigInt, 2)
      .query(`
        SELECT TOP 6
          FORMAT(p.created_at, 'yyyy-MM') as month,
          SUM(p.amount_cents / 100.0) as total_revenue,
          COUNT(p.payment_id) as sales
        FROM payments p
        INNER JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE c.owner_instructor_id = @instructor_id
        GROUP BY FORMAT(p.created_at, 'yyyy-MM')
        ORDER BY month DESC
      `);
    
    monthly.recordset.forEach(row => {
      console.log(`${row.month}: $${row.total_revenue.toFixed(2)} (${row.sales} sales)`);
    });
    
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkRevenue();
