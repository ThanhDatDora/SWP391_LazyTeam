import { getPool } from './config/database.js';

async function checkProgressTables() {
  try {
    const pool = await getPool();
    
    console.log('\n=== CHECKING PROGRESS-RELATED TABLES ===');
    
    // Check all tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\nAll tables in database:');
    tables.recordset.forEach(t => console.log('  -', t.TABLE_NAME));
    
    // Check if lessons table exists
    console.log('\n=== LESSONS TABLE ===');
    try {
      const lessons = await pool.request().query('SELECT TOP 1 * FROM lessons');
      if (lessons.recordset[0]) {
        console.log('Columns:', Object.keys(lessons.recordset[0]));
        console.log('Sample:', lessons.recordset[0]);
      }
    } catch (e) {
      console.log('No lessons table or error:', e.message);
    }
    
    // Check if moocs table exists
    console.log('\n=== MOOCS TABLE ===');
    try {
      const moocs = await pool.request().query('SELECT TOP 1 * FROM moocs');
      if (moocs.recordset[0]) {
        console.log('Columns:', Object.keys(moocs.recordset[0]));
      }
    } catch (e) {
      console.log('No moocs table or error:', e.message);
    }
    
    // Check enrollment_id: 48 details
    console.log('\n=== USER 13 ENROLLMENT DETAILS ===');
    const enrollment = await pool.request().query(`
      SELECT 
        e.*,
        c.title as course_title
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.course_id
      WHERE e.user_id = 13
    `);
    
    console.log('Enrollment:', enrollment.recordset[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProgressTables();
