const path = require('path');

async function checkTableStructures() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();
    console.log('🔗 Connected to database');

    // Check questions table columns
    console.log('\n📊 Questions table structure:');
    const questionsStructure = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'questions'
      ORDER BY ORDINAL_POSITION
    `);
    
    questionsStructure.recordset.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });

    // Check question_options table columns
    console.log('\n📊 Question_options table structure:');
    const optionsStructure = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'question_options'
      ORDER BY ORDINAL_POSITION
    `);
    
    optionsStructure.recordset.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });

    // Check sample data from question_options
    console.log('\n🔍 Sample question_options data:');
    const sampleOptions = await pool.request().query(`
      SELECT TOP 3 * FROM question_options
    `);
    
    sampleOptions.recordset.forEach((opt, i) => {
      console.log(`- Option ${i+1}:`, opt);
    });

  } catch (error) {
    console.error('❌ Error:', error.message || error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

checkTableStructures();