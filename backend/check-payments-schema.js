import { getPool } from './config/database.js';

async function checkPaymentsTable() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'payments'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 Payments table columns:');
    result.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPaymentsTable();
