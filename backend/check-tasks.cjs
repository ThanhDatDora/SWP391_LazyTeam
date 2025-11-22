const { getPool } = require('./config/database.js');
(async () => {
  const pool = await getPool();
  const cols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'essay_tasks' ORDER BY ORDINAL_POSITION`);
  console.log('ESSAY_TASKS:', JSON.stringify(cols.recordset.map(c => c.COLUMN_NAME)));
  process.exit(0);
})();
