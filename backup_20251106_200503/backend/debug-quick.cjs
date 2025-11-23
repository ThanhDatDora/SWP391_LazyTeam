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

async function debugQuick() {
  try {
    await sql.connect(config);
    console.log('🔗 Connected to database');

    // 1. Check tables exist
    console.log('\n📋 CHECKING TABLES:');
    const tables = await sql.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('exams', 'exam_questions', 'exam_answers', 'moocs')
    `);
    console.log('Found tables:', tables.recordset.map(t => t.TABLE_NAME));

    // 2. Check mooc 53
    console.log('\n🔍 MOOC 53 INFO:');
    const moocInfo = await sql.query(`
      SELECT mooc_id, title, course_id FROM moocs WHERE mooc_id = 53
    `);
    console.log('MOOC 53:', moocInfo.recordset[0]);

    // 3. Check exam for mooc 53
    console.log('\n🎯 EXAM FOR MOOC 53:');
    const examInfo = await sql.query(`
      SELECT exam_id, mooc_id FROM exams WHERE mooc_id = 53
    `);
    console.log('Exam info:', examInfo.recordset);

    if (examInfo.recordset.length > 0) {
      const examId = examInfo.recordset[0].exam_id;
      
      // 4. Check questions directly
      console.log(`\n❓ QUESTIONS FOR EXAM ${examId}:`);
      const directQuestions = await sql.query(`
        SELECT COUNT(*) as count FROM exam_questions WHERE exam_id = ${examId}
      `);
      console.log(`Direct count: ${directQuestions.recordset[0].count}`);

      // 5. Test the API query exactly
      console.log('\n🔍 API QUERY TEST:');
      const apiQuery = await sql.query(`
        SELECT COUNT(eq.question_id) as total 
        FROM exam_questions eq
        JOIN exams e ON eq.exam_id = e.exam_id
        WHERE e.mooc_id = 53
      `);
      console.log(`API query result: ${apiQuery.recordset[0].total}`);
    }

    // 6. Check all exams with questions
    console.log('\n📊 ALL EXAMS WITH QUESTIONS:');
    const allExams = await sql.query(`
      SELECT e.exam_id, e.mooc_id, COUNT(eq.question_id) as question_count
      FROM exams e
      LEFT JOIN exam_questions eq ON e.exam_id = eq.exam_id
      GROUP BY e.exam_id, e.mooc_id
      HAVING COUNT(eq.question_id) > 0
      ORDER BY e.exam_id
    `);
    console.log('Exams with questions:');
    allExams.recordset.forEach(exam => {
      console.log(`- Exam ${exam.exam_id} (MOOC ${exam.mooc_id}): ${exam.question_count} questions`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
  }
}

debugQuick();