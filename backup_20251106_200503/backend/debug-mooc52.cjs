const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

async function debugMOOC52() {
  try {
    await sql.connect(config);
    console.log('🔍 Connected to database successfully');

    // Check MOOC 52 questions directly
    const mooc52Query = `
      SELECT 
        q.question_id,
        q.mooc_id,
        q.stem,
        q.qtype,
        q.difficulty,
        q.max_score,
        q.created_at
      FROM questions q
      WHERE q.mooc_id = 52
      ORDER BY q.question_id
    `;

    const result = await sql.query(mooc52Query);
    
    console.log(`\n📋 MOOC 52 Questions (Total: ${result.recordset.length}):`);
    console.log('=' .repeat(80));
    
    result.recordset.forEach((q, index) => {
      console.log(`${index + 1}. Question ${q.question_id} (${q.qtype}):`);
      console.log(`   ${q.stem.substring(0, 100)}...`);
      console.log(`   Difficulty: ${q.difficulty}, Score: ${q.max_score}`);
      console.log(`   Created: ${q.created_at}`);
      console.log('   ' + '-'.repeat(60));
    });

    // Check if there are any constraints or filters
    const countQuery = `SELECT COUNT(*) as total FROM questions WHERE mooc_id = 52`;
    const countResult = await sql.query(countQuery);
    console.log(`\n🧮 Direct count: ${countResult.recordset[0].total} questions`);

    // Check the exact same query the API uses
    const apiQuery = `
      SELECT COUNT(q.question_id) as total 
      FROM questions q
      WHERE q.mooc_id = 52
    `;

    const apiResult = await sql.query(apiQuery);
    console.log(`🔍 API query result: ${apiResult.recordset[0].total} questions`);

    // Check if there are duplicate exam records affecting the API
    const examQuery = `
      SELECT * FROM exams WHERE mooc_id = 52
    `;

    const examResult = await sql.query(examQuery);
    console.log(`\n🎯 Exam records for MOOC 52:`);
    examResult.recordset.forEach(exam => {
      console.log(`  Exam ${exam.exam_id}: ${exam.name}`);
      console.log(`  Duration: ${exam.duration_minutes} minutes`);
      console.log(`  Attempts: ${exam.attempts_allowed}`);
      console.log(`  Created: ${exam.created_at}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
  }
}

debugMOOC52();