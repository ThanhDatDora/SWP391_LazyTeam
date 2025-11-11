import { getPool } from './config/database.js';

async function checkProgressTable() {
  try {
    const pool = await getPool();
    
    console.log('\n=== PROGRESS TABLE SCHEMA ===');
    const schema = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'progress' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\nColumns:');
    schema.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE}) - ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n=== SAMPLE PROGRESS RECORD ===');
    const progress = await pool.request().query('SELECT TOP 1 * FROM progress');
    
    if (progress.recordset[0]) {
      console.log(progress.recordset[0]);
    } else {
      console.log('No progress records found (table is empty)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProgressTable();
