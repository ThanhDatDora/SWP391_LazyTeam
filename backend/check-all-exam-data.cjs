const path = require('path');

async function checkAllExamData() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();
    console.log('🔗 Connected to database');

    // Check all exams
    console.log('\n📊 ALL EXAMS:');
    const examsResult = await pool.request().query(`
      SELECT exam_id, mooc_id, duration_minutes, passing_score
      FROM exams 
      ORDER BY exam_id
    `);
    console.log(`Found ${examsResult.recordset.length} exams:`);
    examsResult.recordset.forEach(exam => {
      console.log(`- Exam ${exam.exam_id} (MOOC ${exam.mooc_id}): ${exam.duration_minutes}min, ${exam.passing_score}% pass`);
    });

    // Check all questions
    console.log('\n❓ ALL EXAM QUESTIONS:');
    const questionsResult = await pool.request().query(`
      SELECT exam_id, COUNT(*) as question_count
      FROM exam_questions 
      GROUP BY exam_id
      ORDER BY exam_id
    `);
    console.log(`Found questions for ${questionsResult.recordset.length} exams:`);
    questionsResult.recordset.forEach(result => {
      console.log(`- Exam ${result.exam_id}: ${result.question_count} questions`);
    });

    // Check specific exam 53 (Camera Fundamentals)
    console.log('\n🎯 EXAM 53 DETAILS:');
    const exam53Questions = await pool.request().query(`
      SELECT question_id, question_text, question_type
      FROM exam_questions 
      WHERE exam_id = 53
    `);
    console.log(`Exam 53 has ${exam53Questions.recordset.length} questions:`);
    exam53Questions.recordset.forEach((q, index) => {
      console.log(`${index + 1}. [${q.question_type}] ${q.question_text.substring(0, 60)}...`);
    });

    // Check if tables exist
    console.log('\n📋 CHECKING TABLES:');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('exams', 'exam_questions', 'exam_answers')
      ORDER BY TABLE_NAME
    `);
    console.log('Exam-related tables:');
    tablesResult.recordset.forEach(table => {
      console.log(`- ${table.TABLE_NAME}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    try {
      if (pool && typeof pool.close === 'function') {
        await pool.close();
      }
    } catch (e) {
      // ignore
    }
  }
}

checkAllExamData();