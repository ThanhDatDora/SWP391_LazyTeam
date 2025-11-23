const { getPool } = require('./config/database.js');

(async () => {
  const pool = await getPool();
  
  const cols = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'payments' 
    ORDER BY ORDINAL_POSITION
  `);
  
  console.log('=== PAYMENTS TABLE ===');
  console.log(JSON.stringify(cols.recordset, null, 2));
  
  process.exit(0);
})();
