import { getPool } from './config/database.js';

async function checkInstructorsTable() {
  try {
    const pool = await getPool();
    
    console.log('📊 Instructors table structure:');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'instructors' 
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check existing instructors
    console.log('\n👨‍🏫 Existing instructors:');
    const instructors = await pool.request().query('SELECT * FROM instructors');
    console.log(`Found ${instructors.recordset.length} instructors:`);
    instructors.recordset.forEach(inst => {
      console.log(`  - ID: ${inst.instructor_id}, Columns:`, Object.keys(inst));
    });
    
    console.log('\n✅ Check completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkInstructorsTable();