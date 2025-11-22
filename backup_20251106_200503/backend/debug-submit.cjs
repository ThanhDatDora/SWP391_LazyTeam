const path = require('path');

async function debugSubmit() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    
    // Get attempt 2 details
    const attempt = await pool.request().query('SELECT * FROM exam_attempts WHERE attempt_id = 2');
    console.log('\n=== ATTEMPT 2 ===');
    console.log(JSON.stringify(attempt.recordset[0], null, 2));
    
    // Get questions from start (should be in database somewhere)
    // Let's check what questions exist for MOOC 3
    const questions = await pool.request().query('SELECT TOP 5 question_id, stem FROM questions WHERE mooc_id = 3');
    console.log('\n=== QUESTIONS FOR MOOC 3 (first 5) ===');
    questions.recordset.forEach(q => {
      console.log(`  ${q.question_id}: ${q.stem.substring(0, 50)}...`);
    });
    
    // Get options for first question
    if (questions.recordset.length > 0) {
      const qid = questions.recordset[0].question_id;
      const options = await pool.request().query(`SELECT * FROM question_options WHERE question_id = ${qid}`);
      console.log(`\n=== OPTIONS FOR QUESTION ${qid} ===`);
      console.log(JSON.stringify(options.recordset, null, 2));
    }
    
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message || error);
    console.error(error && error.stack);
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    process.exit(1);
  }
}

debugSubmit();
