const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkStatsQuery() {
  try {
    const pool = await sql.connect(config);
    const instructorId = 2;
    
    console.log('\n=== RUNNING STATS QUERY (Same as backend) ===');
    const result = await pool.request()
      .input('instructor_id', sql.BigInt, instructorId)
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
    
    console.log('\nStats Result:');
    console.log(result.recordset[0]);
    
    // Debug: check enrollment data
    console.log('\n=== ENROLLMENT DEBUG ===');
    const enrollDebug = await pool.request().query(`
      SELECT 
        c.course_id,
        c.title,
        COUNT(DISTINCT e.user_id) as unique_students,
        COUNT(e.enrollment_id) as total_enrollments
      FROM courses c
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      WHERE c.owner_instructor_id = 2
      GROUP BY c.course_id, c.title
      ORDER BY c.course_id
    `);
    
    console.log('\nPer-course breakdown:');
    enrollDebug.recordset.forEach(row => {
      console.log(`Course ${row.course_id}: ${row.unique_students} students, ${row.total_enrollments} enrollments`);
    });
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatsQuery();
