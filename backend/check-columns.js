import { getPool } from './config/database.js';

async function checkColumns() {
  try {
    const pool = await getPool();
    
    console.log('\n=== CATEGORIES TABLE ===');
    const cat = await pool.request().query('SELECT TOP 1 * FROM categories');
    if (cat.recordset[0]) {
      console.log('Columns:', Object.keys(cat.recordset[0]));
    }
    
    console.log('\n=== COURSES TABLE ===');
    const courses = await pool.request().query('SELECT TOP 1 * FROM courses');
    if (courses.recordset[0]) {
      console.log('Columns:', Object.keys(courses.recordset[0]));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
