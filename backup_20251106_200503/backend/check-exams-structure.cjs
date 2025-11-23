const path = require('path');

async function checkExamsTable() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    console.log('🔗 Connected to database');

    // Check exams table structure
    console.log('\n📋 EXAMS TABLE STRUCTURE:');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'exams'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Exams table columns:');
    columns.recordset.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });

    // Show sample data
    console.log('\n📊 SAMPLE EXAMS:');
    const sampleData = await pool.request().query(`SELECT TOP 3 * FROM exams`);
    sampleData.recordset.forEach(exam => {
      console.log('Sample exam:', exam);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

checkExamsTable();