import { getPool } from './config/database.js';

async function checkProgressTable() {
  try {
    const pool = await getPool();
    
    console.log('📋 PROGRESS table structure:\n');
    
    const cols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'progress'
      ORDER BY ORDINAL_POSITION
    `);
    
    cols.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'NO' ? 'required' : 'nullable'})`);
    });
    
    console.log('\n📊 Sample data:\n');
    const sample = await pool.request().query('SELECT TOP 3 * FROM progress');
    console.log(JSON.stringify(sample.recordset, null, 2));
    
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProgressTable();
