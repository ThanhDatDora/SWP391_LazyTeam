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

async function checkAllCourses() {
  try {
    const pool = await sql.connect(config);

    // Get all courses
    const courses = await pool.request().query(`
      SELECT course_id, title FROM courses ORDER BY course_id
    `);

    console.log(`\n📚 ALL COURSES STRUCTURE\n${'='.repeat(80)}\n`);

    for (const course of courses.recordset) {
      // Get MOOCs for this course
      const moocs = await pool.request().query(`
        SELECT mooc_id, title 
        FROM moocs 
        WHERE course_id = ${course.course_id}
        ORDER BY mooc_id
      `);

      // Count existing questions
      const questions = await pool.request().query(`
        SELECT COUNT(*) as total
        FROM questions
        WHERE mooc_id IN (SELECT mooc_id FROM moocs WHERE course_id = ${course.course_id})
      `);

      console.log(`📖 Course ${course.course_id}: ${course.title}`);
      console.log(`   MOOCs: ${moocs.recordset.length} | Questions: ${questions.recordset[0].total}`);
      
      if (moocs.recordset.length > 0) {
        moocs.recordset.forEach(m => {
          console.log(`     - MOOC ${m.mooc_id}: ${m.title}`);
        });
      }
      console.log('');
    }

    console.log(`${'='.repeat(80)}`);

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllCourses();
