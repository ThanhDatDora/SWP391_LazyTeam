const { getPool } = require('./config/database.js');
const sql = require('mssql');

(async () => {
  try {
    const pool = await getPool();
    const instructorId = 2;

    console.log('\n=== QUERY 1: WITH 6-MONTH FILTER (CURRENT API) ===');
    const q1 = await pool.request()
      .input('instructor_id', sql.BigInt, instructorId)
      .query(`
        SELECT 
          FORMAT(p.paid_at, 'yyyy-MM') as month,
          COUNT(DISTINCT e.enrollment_id) as sales,
          ISNULL(SUM(p.amount_cents / 100.0), 0) as revenue,
          ISNULL(SUM(p.amount_cents / 100.0 * 0.8), 0) as instructor_share
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id AND p.status IN ('paid', 'completed')
        WHERE c.owner_instructor_id = @instructor_id
          AND p.paid_at >= DATEADD(MONTH, -6, GETDATE())
        GROUP BY FORMAT(p.paid_at, 'yyyy-MM')
        ORDER BY month DESC
      `);

    console.log('Result:', JSON.stringify(q1.recordset, null, 2));
    console.log('Count:', q1.recordset.length);

    console.log('\n=== QUERY 2: WITHOUT FILTER (ALL DATA) ===');
    const q2 = await pool.request()
      .input('instructor_id', sql.BigInt, instructorId)
      .query(`
        SELECT 
          FORMAT(p.paid_at, 'yyyy-MM') as month,
          COUNT(DISTINCT e.enrollment_id) as sales,
          ISNULL(SUM(p.amount_cents / 100.0), 0) as revenue,
          ISNULL(SUM(p.amount_cents / 100.0 * 0.8), 0) as instructor_share
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id AND p.status IN ('paid', 'completed')
        WHERE c.owner_instructor_id = @instructor_id
          AND p.paid_at IS NOT NULL
        GROUP BY FORMAT(p.paid_at, 'yyyy-MM')
        ORDER BY month DESC
      `);

    console.log('Result:', JSON.stringify(q2.recordset, null, 2));
    console.log('Count:', q2.recordset.length);

    console.log('\n=== DATE RANGE CHECK ===');
    const q3 = await pool.request()
      .query(`
        SELECT 
          MIN(paid_at) as earliest_payment,
          MAX(paid_at) as latest_payment,
          DATEADD(MONTH, -6, GETDATE()) as six_months_ago,
          GETDATE() as today
        FROM payments
        WHERE status IN ('paid', 'completed')
          AND paid_at IS NOT NULL
      `);

    console.log('Dates:', JSON.stringify(q3.recordset, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
