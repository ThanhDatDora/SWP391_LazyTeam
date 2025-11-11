import { getPool } from './config/database.js';

async function checkEnrollments() {
  try {
    console.log('🔍 Checking enrollments table...\n');
    
    const pool = await getPool();
    
    // Check if enrollments table exists
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'enrollments'
    `);
    
    if (tableCheck.recordset.length === 0) {
      console.log('❌ enrollments table does NOT exist!');
      console.log('💡 Run the migration to create it first.');
      process.exit(1);
    }
    
    console.log('✅ enrollments table exists\n');
    
    // Check enrollments data
    const enrollmentsResult = await pool.request().query(`
      SELECT 
        e.enrollment_id,
        e.user_id,
        e.course_id,
        e.enrolled_at,
        e.status,
        u.email as user_email,
        c.title as course_title
      FROM enrollments e
      LEFT JOIN users u ON e.user_id = u.user_id
      LEFT JOIN courses c ON e.course_id = c.course_id
    `);
    
    console.log(`📊 Total enrollments: ${enrollmentsResult.recordset.length}\n`);
    
    if (enrollmentsResult.recordset.length === 0) {
      console.log('⚠️  No enrollments found in database!');
      console.log('💡 You need to:');
      console.log('   1. Purchase a course from frontend');
      console.log('   2. Complete payment');
      console.log('   3. System will auto-create enrollment');
      console.log('\n📝 Or manually insert test data:');
      console.log(`
INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
VALUES (1, 1, GETDATE(), 'active');
      `);
    } else {
      console.log('📚 Enrollments found:\n');
      enrollmentsResult.recordset.forEach((row, index) => {
        console.log(`${index + 1}. Enrollment #${row.enrollment_id}`);
        console.log(`   User: ${row.user_email} (ID: ${row.user_id})`);
        console.log(`   Course: ${row.course_title} (ID: ${row.course_id})`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Date: ${row.enrolled_at}`);
        console.log('');
      });
    }
    
    // Check users table
    const usersResult = await pool.request().query(`
      SELECT user_id, email, full_name, role_name 
      FROM users 
      WHERE role_name = 'learner'
    `);
    console.log(`\n👥 Total learner users: ${usersResult.recordset.length}`);
    if (usersResult.recordset.length > 0) {
      console.log('Sample learners:');
      usersResult.recordset.slice(0, 3).forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.user_id}, Name: ${user.full_name})`);
      });
    }
    
    // Check courses table
    const coursesResult = await pool.request().query(`
      SELECT course_id, title, price, status 
      FROM courses 
      WHERE status = 'active'
    `);
    console.log(`\n📖 Total active courses: ${coursesResult.recordset.length}`);
    if (coursesResult.recordset.length > 0) {
      console.log('Sample courses:');
      coursesResult.recordset.slice(0, 3).forEach(course => {
        console.log(`   - ${course.title} (ID: ${course.course_id}, Price: $${course.price})`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkEnrollments();
