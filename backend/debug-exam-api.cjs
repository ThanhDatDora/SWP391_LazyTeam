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

async function debugExamAPI() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n=== 1. CHECK MOOC 3 ===');
    const moocResult = await pool.request().query('SELECT * FROM moocs WHERE mooc_id = 3');
    console.log('MOOC 3:', JSON.stringify(moocResult.recordset, null, 2));
    
    console.log('\n=== 2. CHECK ENROLLMENT ===');
    const enrollResult = await pool.request().query(`
      SELECT e.enrollment_id, e.user_id, e.course_id, e.current_mooc_id, e.moocs_completed
      FROM enrollments e 
      WHERE e.user_id = 15 AND e.course_id = 2
    `);
    console.log('Enrollment:', JSON.stringify(enrollResult.recordset, null, 2));
    
    if (enrollResult.recordset.length === 0) {
      console.log('\n❌ NO ENROLLMENT FOUND - Creating enrollment...');
      await pool.request().query(`
        INSERT INTO enrollments (user_id, course_id, enrolled_at, current_mooc_id, moocs_completed, overall_score)
        VALUES (15, 2, GETDATE(), 3, 0, 0)
      `);
      console.log('✅ Created enrollment');
    }
    
    console.log('\n=== 3. CHECK LESSONS ===');
    const lessonsResult = await pool.request().query('SELECT lesson_id, mooc_id, title FROM lessons WHERE mooc_id = 3');
    console.log('Lessons in MOOC 3:', JSON.stringify(lessonsResult.recordset, null, 2));
    
    console.log('\n=== 4. CHECK LESSON PROGRESS ===');
    const progressResult = await pool.request().query(`
      SELECT lp.lesson_id, lp.completed, l.mooc_id
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.lesson_id
      WHERE lp.user_id = 15 AND l.mooc_id = 3
    `);
    console.log('Lesson Progress:', JSON.stringify(progressResult.recordset, null, 2));
    
    console.log('\n=== 5. CHECK EXAM ===');
    const examResult = await pool.request().query('SELECT * FROM exams WHERE mooc_id = 3');
    console.log('Exam for MOOC 3:', JSON.stringify(examResult.recordset, null, 2));
    
    if (examResult.recordset.length === 0) {
      console.log('\n❌ NO EXAM FOUND - This is the problem!');
    }
    
    console.log('\n=== 6. CHECK QUESTIONS ===');
    const questionsResult = await pool.request().query('SELECT COUNT(*) as count FROM exam_questions WHERE mooc_id = 3');
    console.log('Questions for MOOC 3:', questionsResult.recordset[0].count);
    
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugExamAPI();
