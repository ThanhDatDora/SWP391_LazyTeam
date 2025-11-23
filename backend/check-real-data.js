import { getPool } from './config/database.js';

async function checkRealData() {
  try {
    const pool = await getPool();
    
    // Check users table structure first
    console.log('=== USERS TABLE STRUCTURE ===');
    const userColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users'
    `);
    userColumns.recordset.forEach(col => {
      console.log(`Column: ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Check enrollments table structure
    console.log('\n=== ENROLLMENTS TABLE STRUCTURE ===');
    const enrollmentColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'enrollments'
    `);
    enrollmentColumns.recordset.forEach(col => {
      console.log(`Column: ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Check users with actual columns
    const users = await pool.request().query('SELECT TOP 10 user_id, email, full_name FROM users ORDER BY user_id');
    console.log('\n=== USERS IN DATABASE ===');
    users.recordset.forEach(user => {
      console.log(`ID: ${user.user_id}, Email: ${user.email}, Name: ${user.full_name || 'N/A'}`);
    });

    // Check courses/moocs
    const courses = await pool.request().query('SELECT TOP 10 mooc_id, title, course_id FROM moocs ORDER BY mooc_id');
    console.log('\n=== COURSES/MOOCS IN DATABASE ===');
    courses.recordset.forEach(course => {
      console.log(`MOOC ID: ${course.mooc_id}, Title: ${course.title}, Course ID: ${course.course_id}`);
    });

    // Check enrollments with correct column names (will adjust based on structure)
    const enrollments = await pool.request().query('SELECT TOP 10 * FROM enrollments ORDER BY enrolled_at DESC');
    console.log('\n=== RECENT ENROLLMENTS ===');
    enrollments.recordset.forEach(enrollment => {
      console.log(`User ID: ${enrollment.user_id}, Course ID: ${enrollment.course_id}, Enrolled: ${enrollment.enrolled_at}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRealData();