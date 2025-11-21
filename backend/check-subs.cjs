const { getPool } = require('./config/database.js');
(async () => {
  const pool = await getPool();
  const cols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'essay_submissions' ORDER BY ORDINAL_POSITION`);
  console.log('ESSAY_SUBMISSIONS:', JSON.stringify(cols.recordset.map(c => c.COLUMN_NAME)));
  const lessonCols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'lessons' ORDER BY ORDINAL_POSITION`);
  console.log('LESSONS:', JSON.stringify(lessonCols.recordset.map(c => c.COLUMN_NAME)));
  process.exit(0);
})();
