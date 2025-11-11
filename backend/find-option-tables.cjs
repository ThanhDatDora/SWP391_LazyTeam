const path = require('path');

async function findOptionTables() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();

    const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%option%' OR TABLE_NAME LIKE '%choice%' OR TABLE_NAME LIKE '%answer%'");

    console.log('Tables with options/choices/answers:', tables.recordset.map(t => t.TABLE_NAME));

    // Check all tables to find potential options table
    const allTables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    console.log('\nAll tables:');
    allTables.recordset.forEach(t => console.log('- ' + t.TABLE_NAME));

  } catch(error) {
    console.error("Error:", error.message);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

findOptionTables();