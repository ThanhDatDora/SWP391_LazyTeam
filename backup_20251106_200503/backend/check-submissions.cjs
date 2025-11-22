const path = require('path');

(async () => {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;

    pool = await getPool();
    
    // Check for submission/assignment tables
    const tables = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME LIKE '%submission%' OR TABLE_NAME LIKE '%assignment%'
        ORDER BY TABLE_NAME
      `);

    console.log('📊 Submission/Assignment Tables:');
    console.log('================================\n');
    
    for (const table of tables.recordset) {
      console.log(`\n📋 Table: ${table.TABLE_NAME}`);
      console.log('─'.repeat(50));
      
      // Get columns
      const columns = await pool.request()
        .input('tableName', sqlLib.NVarChar, table.TABLE_NAME)
        .query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = @tableName
          ORDER BY ORDINAL_POSITION
        `);
      
      columns.recordset.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)';
        const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
        console.log(`  ${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE}${length} ${nullable}`);
      });
      
      // Get row count
      const count = await pool.request()
        .query(`SELECT COUNT(*) as count FROM ${table.TABLE_NAME}`);
      
      console.log(`\n  Total rows: ${count.recordset[0].count}`);
    }
    
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e){}
  }
})();
