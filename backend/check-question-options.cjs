const path = require('path');

async function checkQuestionOptions() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();

    const result = await pool.request().query('SELECT * FROM question_options WHERE question_id = 49');

    console.log('Question 49 options:');
    if (result.recordset.length > 0) {
      console.log('Columns:', Object.keys(result.recordset[0]));
      result.recordset.forEach((option, index) => {
        console.log(`Option ${index + 1}:`, option);
      });
    } else {
      console.log('No options found for question 49');
    }
    
  } catch(error) {
    console.error("Error:", error.message);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

checkQuestionOptions();