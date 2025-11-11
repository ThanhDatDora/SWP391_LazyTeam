const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkMooc54() {
  try {
    const pool = await sql.connect(config);
    
    // Check if MOOC 54 exists
    const moocResult = await pool.request()
      .input('moocId', sql.BigInt, 54)
      .query('SELECT mooc_id, title, course_id FROM moocs WHERE mooc_id = @moocId');
    
    if (moocResult.recordset.length === 0) {
      console.log('❌ MOOC 54 not found!');
      await pool.close();
      return;
    }
    
    console.log('\n📚 MOOC 54 Info:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(moocResult.recordset[0], null, 2));
    
    // Check questions for MOOC 54
    const questionsResult = await pool.request()
      .input('moocId', sql.BigInt, 54)
      .query(`
        SELECT 
          question_id,
          stem,
          difficulty,
          mooc_id
        FROM questions
        WHERE mooc_id = @moocId
      `);
    
    console.log(`\n\n❓ Questions for MOOC 54: ${questionsResult.recordset.length} total`);
    console.log('='.repeat(80));
    
    if (questionsResult.recordset.length === 0) {
      console.log('❌ NO QUESTIONS FOUND! This is why exam cannot start.');
      console.log('💡 Solution: Add questions for MOOC 54 or use a different MOOC with questions.');
    } else {
      console.log(`✅ Found ${questionsResult.recordset.length} questions`);
      questionsResult.recordset.slice(0, 5).forEach((q, idx) => {
        console.log(`\n${idx + 1}. Question ${q.question_id}:`);
        console.log(`   Difficulty: ${q.difficulty}`);
        console.log(`   Stem: ${q.stem.substring(0, 100)}...`);
      });
    }
    
    // Check if there are any MOOCs with questions
    const moocsWithQuestionsResult = await pool.request().query(`
      SELECT 
        m.mooc_id,
        m.title,
        COUNT(q.question_id) as question_count
      FROM moocs m
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      GROUP BY m.mooc_id, m.title
      HAVING COUNT(q.question_id) > 0
      ORDER BY COUNT(q.question_id) DESC
    `);
    
    console.log('\n\n📊 MOOCs with questions available:');
    console.log('='.repeat(80));
    moocsWithQuestionsResult.recordset.slice(0, 10).forEach(mooc => {
      console.log(`MOOC ${mooc.mooc_id}: ${mooc.title} (${mooc.question_count} questions)`);
    });
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkMooc54();
