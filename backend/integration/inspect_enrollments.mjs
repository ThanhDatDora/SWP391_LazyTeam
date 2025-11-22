import { getPool } from '../config/database.js';
import sql from 'mssql';

async function run() {
  try {
    const pool = await getPool();
    const cols = await pool.request()
      .input('table', sql.NVarChar, 'enrollments')
      .query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table ORDER BY ORDINAL_POSITION`);

    console.log('enrollments columns:');
    cols.recordset.forEach(c => console.log('-', c.COLUMN_NAME, c.DATA_TYPE));

    const row = await pool.request().query('SELECT TOP 1 * FROM enrollments');
    console.log('\nSample enrollment row:');
    console.log(row.recordset[0]);
  } catch (err) {
    console.error('Error inspecting enrollments:', err && err.stack ? err.stack : err);
  } finally {
    try { await sql.close(); } catch (_) {}
  }
}

run();
