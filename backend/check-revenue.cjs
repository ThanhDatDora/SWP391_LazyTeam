const { getPool } = require('./config/database.js');
const sql = require('mssql');

async function checkRevenue() {
  try {
    const pool = await getPool();
    
    // Check payments table
    const payments = await pool.request()
      .input('instructorId', sql.BigInt, 2)
      .query(`
        SELECT 
          COUNT(*) as payment_count,
          SUM(amount_cents/100.0) as total_from_payments,
          SUM(amount_cents/100.0 * 0.8) as instructor_share_from_payments
        FROM payments 
        WHERE status = 'paid' 
          AND enrollment_id IN (
            SELECT enrollment_id 
            FROM enrollments 
            WHERE course_id IN (
              SELECT course_id 
              FROM courses 
              WHERE owner_instructor_id = @instructorId
            )
          )
      `);
    
    // Calculate from enrollments × price
    const enrollments = await pool.request()
      .input('instructorId', sql.BigInt, 2)
      .query(`
        SELECT 
          c.title,
          c.price,
          COUNT(e.enrollment_id) as student_count,
          c.price * COUNT(e.enrollment_id) as course_revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        WHERE c.owner_instructor_id = @instructorId
        GROUP BY c.course_id, c.title, c.price
        ORDER BY course_revenue DESC
      `);
    
    console.log('\n=== PAYMENTS TABLE (Actual Paid) ===');
    console.log(JSON.stringify(payments.recordset, null, 2));
    
    console.log('\n=== REVENUE BY ENROLLMENT (price × students) ===');
    enrollments.recordset.forEach(course => {
      console.log(`${course.title}: ${course.student_count} students × $${course.price} = $${course.course_revenue}`);
    });
    
    const totalFromEnrollments = enrollments.recordset.reduce((sum, c) => sum + parseFloat(c.course_revenue || 0), 0);
    const instructorShare = totalFromEnrollments * 0.8;
    
    console.log('\n=== SUMMARY ===');
    console.log('Method 1 (Payments table):', payments.recordset[0].instructor_share_from_payments || 0);
    console.log('Method 2 (Enrollments × Price):', totalFromEnrollments);
    console.log('Instructor share (80%):', instructorShare);
    console.log('\nWhich one is correct? enrollments × price (Method 2)');
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRevenue();
