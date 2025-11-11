const path = require('path');

async function checkQuestion() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();

    // First check table structure
    const result = await pool.request().query(`SELECT TOP 1 * FROM questions WHERE question_id = 49`);
    
    if (result.recordset.length > 0) {
      const question = result.recordset[0];
      console.log('Question 49 columns:', Object.keys(question));
      console.log('Question data:', question);
    } else {
      console.log('Question 49 not found');
    }
    
  } catch(error) {
    console.error("Error:", error.message);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

checkQuestion();