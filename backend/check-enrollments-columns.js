import { getPool } from './config/database.js';

async function checkEnrollmentsTable() {
  try {
    const pool = await getPool();
    
    console.log('📋 ENROLLMENTS table structure:\n');
    
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'enrollments'
      ORDER BY ORDINAL_POSITION
    `);
    
    result.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'NO' ? 'required' : 'nullable'})`);
    });
    
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEnrollmentsTable();
