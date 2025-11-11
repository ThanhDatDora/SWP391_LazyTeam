import { connectDB, getPool } from './config/database.js';

async function checkDatabaseStructure() {
  try {
    await connectDB();
    const pool = await getPool();
    
    // Check Users table structure
    const usersResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Users table columns:');
    usersResult.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE}) - Nullable: ${col.IS_NULLABLE}`);
    });
    
    // Check Courses table structure
    const coursesResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'courses' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\nCourses table columns:');
    coursesResult.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE}) - Nullable: ${col.IS_NULLABLE}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabaseStructure();