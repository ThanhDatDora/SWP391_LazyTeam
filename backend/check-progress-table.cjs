const path = require('path');

async function checkProgressTable() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();

    // Get table structure
    const structure = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'progress'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Progress table columns:');
    structure.recordset.forEach(col => {
      console.log(`- ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Sample record
    const sample = await pool.request().query('SELECT TOP 1 * FROM progress');
    if (sample.recordset.length > 0) {
      console.log('\nSample record:');
      console.log(sample.recordset[0]);
    }

  } catch(error) {
    console.error("Error:", error.message);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

checkProgressTable();