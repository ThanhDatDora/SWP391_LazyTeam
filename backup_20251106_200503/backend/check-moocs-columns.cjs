const path = require('path');

async function checkMoocsColumns() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'moocs'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n=== MOOCS TABLE COLUMNS ===');
    result.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    process.exit(0);
  }
}

checkMoocsColumns();
