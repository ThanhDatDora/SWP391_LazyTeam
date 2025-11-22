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

async function quickCheck() {
  try {
    await sql.connect(config);
    console.log('🔗 Connected to database');

    // Check exam for mooc 53
    console.log('\n🎯 CHECKING MOOC 53:');
    const examResult = await sql.query(`
      SELECT exam_id, mooc_id 
      FROM exams 
      WHERE mooc_id = 53
    `);
    console.log('Exam for MOOC 53:', examResult.recordset);

    if (examResult.recordset.length > 0) {
      const examId = examResult.recordset[0].exam_id;
      
      // Check questions for this exam
      const questionResult = await sql.query(`
        SELECT COUNT(*) as total_questions
        FROM exam_questions 
        WHERE exam_id = ${examId}
      `);
      console.log(`Questions for exam ${examId}:`, questionResult.recordset[0].total_questions);

      // Show first 3 questions
      const sampleQuestions = await sql.query(`
        SELECT TOP 3 question_id, question_text
        FROM exam_questions 
        WHERE exam_id = ${examId}
      `);
      console.log('Sample questions:');
      sampleQuestions.recordset.forEach((q, i) => {
        console.log(`${i+1}. ${q.question_text.substring(0, 60)}...`);
      });
    }

    // Test the API query directly
    console.log('\n🔍 TESTING API QUERY:');
    const apiQuery = await sql.query(`
      SELECT COUNT(eq.question_id) as total 
      FROM exam_questions eq
      JOIN exams e ON eq.exam_id = e.exam_id
      WHERE e.mooc_id = 53
    `);
    console.log('API query result:', apiQuery.recordset[0].total);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
  }
}

quickCheck();