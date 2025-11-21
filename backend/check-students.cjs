const { getPool } = require('./config/database.js');
(async () => {
  const pool = await getPool();
  
  // Check actual student count for instructor 2
  const result = await pool.request().query(`
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
  
  console.log('=== STUDENTS PER COURSE ===');
  result.recordset.forEach(r => {
    console.log(`Course ${r.course_id}: ${r.title}`);
    console.log(`  Unique Students: ${r.unique_students}`);
    console.log(`  Total Enrollments: ${r.total_enrollments}`);
  });
  
  // Check total unique students across all courses
  const total = await pool.request().query(`
    SELECT COUNT(DISTINCT e.user_id) as total_unique_students
    FROM courses c
    LEFT JOIN enrollments e ON c.course_id = e.course_id
    WHERE c.owner_instructor_id = 2
  `);
  
  console.log('\n=== TOTAL UNIQUE STUDENTS ===');
  console.log('Should be:', total.recordset[0].total_unique_students);
  
  process.exit(0);
})();
