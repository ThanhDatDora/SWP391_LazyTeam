const { getPool } = require('./config/database.js');

(async () => {
  const pool = await getPool();
  
  // Check lessons table schema
  const schema = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'lessons'
    ORDER BY ORDINAL_POSITION
  `);
  
  console.log('=== LESSONS TABLE COLUMNS ===');
  schema.recordset.forEach(col => {
    const maxLen = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
    console.log(`  ${col.COLUMN_NAME} ${col.DATA_TYPE}${maxLen}`);
  });
  
  process.exit(0);
})();
