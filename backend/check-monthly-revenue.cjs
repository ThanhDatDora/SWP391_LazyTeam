const { getPool } = require('./config/database.js');

(async () => {
  try {
    const pool = await getPool();
    const instructorId = 2;

    console.log('\n📊 CHECKING MONTHLY REVENUE DATA\n');

    // Check monthly revenue data
    const monthlyResult = await pool.request()
      .input('instructorId', instructorId)
      .query(`
        SELECT 
          FORMAT(p.paid_at, 'yyyy-MM') AS month,
          COUNT(*) AS sales,
          SUM(p.amount_cents / 100.0) AS revenue,
          SUM(p.amount_cents / 100.0) * 0.8 AS instructorShare
        FROM payments p
        JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        JOIN courses c ON e.course_id = c.course_id
        WHERE c.owner_instructor_id = @instructorId
          AND p.status IN ('paid', 'completed')
          AND p.paid_at IS NOT NULL
        GROUP BY FORMAT(p.paid_at, 'yyyy-MM')
        ORDER BY month DESC
      `);

    console.log('Monthly Revenue Data:');
    console.log(JSON.stringify(monthlyResult.recordset, null, 2));

    console.log('\n📊 FORMATTED FOR CHART:\n');
    const chartData = monthlyResult.recordset.map(row => ({
      month: row.month,
      sales: row.sales,
      revenue: parseFloat(row.revenue).toFixed(2),
      instructorShare: parseFloat(row.instructorShare).toFixed(2),
      revenueVND: Math.round(parseFloat(row.revenue) * 1000).toLocaleString('vi-VN'),
      instructorShareVND: Math.round(parseFloat(row.instructorShare) * 1000).toLocaleString('vi-VN')
    }));
    console.log(JSON.stringify(chartData, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
