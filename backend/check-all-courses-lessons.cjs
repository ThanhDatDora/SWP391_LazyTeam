const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  try {
    const pool = await sql.connect(config);
    
    // Get all courses
    const courses = await pool.request()
      .query('SELECT course_id, title FROM courses ORDER BY course_id');
    
    console.log('📚 Checking ALL Courses:');
    console.log('========================\n');
    
    for (const course of courses.recordset) {
      console.log(`\n🎓 Course ${course.course_id}: ${course.title}`);
      console.log('─────────────────────────────────────────');
      
      // Get MOOCs for this course
      const moocs = await pool.request()
        .input('cid', sql.BigInt, course.course_id)
        .query('SELECT mooc_id, title FROM moocs WHERE course_id = @cid ORDER BY order_no');
      
      for (const mooc of moocs.recordset) {
        console.log(`  📖 MOOC ${mooc.mooc_id}: ${mooc.title}`);
        
        // Get lessons for this MOOC
        const lessons = await pool.request()
          .input('mid', sql.BigInt, mooc.mooc_id)
          .query('SELECT lesson_id, title, content_type, content_url FROM lessons WHERE mooc_id = @mid ORDER BY order_no');
        
        if (lessons.recordset.length === 0) {
          console.log('     ⚠️ No lessons found');
        } else {
          const nullCount = lessons.recordset.filter(l => !l.content_url || l.content_url === 'N/A').length;
          const totalCount = lessons.recordset.length;
          
          console.log(`     ✓ ${totalCount} lessons (${nullCount} NULL/N/A content_url)`);
          
          // Show first 3 lessons
          lessons.recordset.slice(0, 3).forEach(lesson => {
            const urlStatus = !lesson.content_url || lesson.content_url === 'N/A' 
              ? '❌ NULL/N/A' 
              : lesson.content_url.length > 50 
                ? `✓ ${lesson.content_url.substring(0, 50)}...`
                : `✓ ${lesson.content_url}`;
            console.log(`       - Lesson ${lesson.lesson_id} (${lesson.content_type}): ${urlStatus}`);
          });
        }
      }
    }
    
    await pool.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
