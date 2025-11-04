import { getPool } from './config/database.js';

async function checkAllEnrollments() {
  try {
    const pool = await getPool();
    
    console.log('\n=== ALL USERS WITH ENROLLMENTS ===');
    const result = await pool.request().query(`
      SELECT DISTINCT 
        u.user_id, 
        u.email, 
        u.full_name, 
        COUNT(e.enrollment_id) as enrollment_count
      FROM users u
      INNER JOIN enrollments e ON u.user_id = e.user_id
      WHERE e.status = 'active'
      GROUP BY u.user_id, u.email, u.full_name
      ORDER BY u.user_id
    `);
    
    result.recordset.forEach(user => {
      console.log(`\nUser ID: ${user.user_id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.full_name}`);
      console.log(`  Enrollments: ${user.enrollment_count}`);
    });
    
    console.log('\n=== ENROLLMENT DETAILS ===');
    const enrollments = await pool.request().query(`
      SELECT 
        e.user_id, 
        u.email, 
        c.course_id, 
        c.title, 
        e.enrolled_at
      FROM enrollments e
      INNER JOIN users u ON e.user_id = u.user_id
      INNER JOIN courses c ON e.course_id = c.course_id
      WHERE e.status = 'active'
      ORDER BY e.user_id, e.enrolled_at
    `);
    
    enrollments.recordset.forEach(e => {
      console.log(`\n${e.email} (ID: ${e.user_id})`);
      console.log(`  → Course ${e.course_id}: ${e.title}`);
      console.log(`  → Enrolled: ${e.enrolled_at.toISOString().split('T')[0]}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllEnrollments();
