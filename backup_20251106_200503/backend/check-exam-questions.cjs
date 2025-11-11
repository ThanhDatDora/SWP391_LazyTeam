const path = require('path');
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional for one-off scripts; ignore if not installed
}

async function checkExamQuestions() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;
    pool = await getPool();
    console.log('🔗 Connected to database');

    // Check mooc 53 exam
    console.log('\n📋 CHECKING MOOC 53 EXAM:');
    const examResult = await pool.request().query(`
      SELECT e.exam_id, e.mooc_id, m.title as mooc_name, 
             e.duration_minutes, e.attempts_allowed,
             COUNT(ei.question_id) as total_questions
      FROM exams e
      LEFT JOIN moocs m ON e.mooc_id = m.mooc_id
      LEFT JOIN exam_items ei ON e.exam_id = ei.exam_id
      WHERE e.mooc_id = 53
      GROUP BY e.exam_id, e.mooc_id, m.title, e.duration_minutes, e.attempts_allowed
    `);
    console.log('Exam data:', examResult.recordset);

    // Check questions for this exam
    if (examResult.recordset.length > 0) {
      const examId = examResult.recordset[0].exam_id;
      console.log(`\n❓ CHECKING QUESTIONS FOR EXAM ${examId}:`);
      const questionsResult = await pool.request().query(`
        SELECT q.question_id, q.stem, q.qtype
        FROM exam_items ei
        JOIN questions q ON ei.question_id = q.question_id
        WHERE ei.exam_id = ${examId}
        ORDER BY ei.order_no
      `);
      console.log('Questions count:', questionsResult.recordset.length);
      console.log('Sample questions:', questionsResult.recordset.slice(0, 3));
    }

    // Check all exams
    console.log('\n📊 ALL EXAMS SUMMARY:');
    const allExamsResult = await pool.request().query(`
      SELECT e.exam_id, e.mooc_id, m.title as mooc_name, 
             COUNT(ei.question_id) as actual_questions
      FROM exams e
      LEFT JOIN moocs m ON e.mooc_id = m.mooc_id
      LEFT JOIN exam_items ei ON e.exam_id = ei.exam_id
      GROUP BY e.exam_id, e.mooc_id, m.title
      ORDER BY e.exam_id
    `);
    console.log('All exams with question counts:');
    allExamsResult.recordset.forEach(exam => {
      console.log(`- Exam ${exam.exam_id} (MOOC ${exam.mooc_id}): ${exam.mooc_name} - ${exam.actual_questions} questions`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e){}
  }
}

checkExamQuestions();