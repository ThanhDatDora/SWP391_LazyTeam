const path = require('path');

async function debugExamAPI() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    
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
    // note: some older scripts reference exam_questions; prefer canonical tables like exam_items/questions
    const questionsResult = await pool.request().query('SELECT COUNT(*) as count FROM question_options qo JOIN questions q ON qo.question_id = q.question_id WHERE q.mooc_id = 3');
    console.log('Questions for MOOC 3 (via questions table):', questionsResult.recordset[0].count);
    
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    console.error(error && error.stack);
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    process.exit(1);
  }
}

debugExamAPI();
