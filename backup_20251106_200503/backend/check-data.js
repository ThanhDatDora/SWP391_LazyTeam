import { getPool } from './config/database.js';

async function checkCourseData() {
  try {
    const pool = await getPool();
    
    console.log('📊 Checking courses data...\n');
    
    // Count total courses
    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM courses');
    console.log(`Total courses: ${countResult.recordset[0].total}`);
    
    // Get first 5 courses
    const coursesResult = await pool.request().query(`
      SELECT TOP 5
        course_id, title, price, level, status, created_at
      FROM courses
      ORDER BY created_at DESC
    `);
    
    console.log('\n📚 Sample courses:');
    coursesResult.recordset.forEach(course => {
      console.log(`  ID: ${course.course_id}`);
      console.log(`  Title: ${course.title}`);
      console.log(`  Price: ${course.price}`);
      console.log(`  Level: ${course.level}`);
      console.log(`  Status: ${course.status}`);
      console.log(`  Created: ${course.created_at}`);
      console.log('  ---');
    });
    
    // Check categories
    const catResult = await pool.request().query('SELECT COUNT(*) as total FROM categories');
    console.log(`\nTotal categories: ${catResult.recordset[0].total}`);
    
    // Check instructors
    const instResult = await pool.request().query('SELECT COUNT(*) as total FROM instructors');
    console.log(`Total instructors: ${instResult.recordset[0].total}`);
    
    // Check users
    const userResult = await pool.request().query('SELECT COUNT(*) as total FROM users');
    console.log(`Total users: ${userResult.recordset[0].total}`);
    
    console.log('\n✅ Data check completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkCourseData();
