import { getPool } from './config/database.js';

async function checkCoursesTable() {
  try {
    const pool = await getPool();
    
    console.log('📊 Courses table structure:');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'courses'
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check categories table too
    console.log('\n📊 Categories table structure:');
    const catColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'categories'
      ORDER BY ORDINAL_POSITION
    `);
    
    catColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check moocs table
    console.log('\n📊 MOOCs table structure:');
    const moocColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'moocs'
      ORDER BY ORDINAL_POSITION
    `);
    
    moocColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n✅ Check completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCoursesTable();