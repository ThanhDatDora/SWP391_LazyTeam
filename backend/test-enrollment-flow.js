import { getPool } from './config/database.js';

async function testEnrollmentFlow() {
  try {
    const pool = await getPool();
    const userId = 13; // hanhvysayhi@gmail.com
    
    console.log('\n🧪 TESTING ENROLLMENT FLOW\n');
    console.log('═══════════════════════════════════════\n');
    
    // Step 1: Check current enrollments
    console.log('📊 Step 1: Current Enrollments');
    const before = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT e.enrollment_id, c.course_id, c.title, e.enrolled_at, e.completed_at
        FROM enrollments e
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE e.user_id = @userId AND e.status = 'active'
        ORDER BY e.enrolled_at DESC
      `);
    
    console.log(`  User has ${before.recordset.length} enrollments:`);
    before.recordset.forEach(e => {
      console.log(`    • ${e.title} (ID: ${e.course_id})`);
    });
    
    // Step 2: Find a course NOT enrolled yet
    console.log('\n📚 Step 2: Finding Available Course');
    const available = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT TOP 1 c.course_id, c.title, c.price
        FROM courses c
        WHERE c.course_id NOT IN (
          SELECT course_id FROM enrollments WHERE user_id = @userId
        )
        AND c.status = 'active'
      `);
    
    if (available.recordset.length === 0) {
      console.log('  ❌ No available courses to enroll!');
      process.exit(0);
    }
    
    const newCourse = available.recordset[0];
    console.log(`  Found: ${newCourse.title} (ID: ${newCourse.course_id}, Price: ${newCourse.price})`);
    
    // Step 3: Simulate enrollment (like after successful payment)
    console.log('\n💳 Step 3: Simulating Enrollment');
    await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('courseId', sql.Int, newCourse.course_id)
      .query(`
        INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
        VALUES (@userId, @courseId, GETDATE(), 'active')
      `);
    
    console.log(`  ✅ Enrolled in: ${newCourse.title}`);
    
    // Step 4: Check updated enrollments
    console.log('\n📊 Step 4: Updated Enrollments');
    const after = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT e.enrollment_id, c.course_id, c.title, e.enrolled_at
        FROM enrollments e
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE e.user_id = @userId AND e.status = 'active'
        ORDER BY e.enrolled_at DESC
      `);
    
    console.log(`  User now has ${after.recordset.length} enrollments:`);
    after.recordset.forEach(e => {
      const isNew = !before.recordset.find(b => b.course_id === e.course_id);
      console.log(`    ${isNew ? '🆕' : '  '} ${e.title} (ID: ${e.course_id})`);
    });
    
    // Step 5: Test API response
    console.log('\n🔍 Step 5: API Response Test');
    console.log('  Now refresh My Courses page in browser');
    console.log(`  Expected: ${after.recordset.length} courses displayed`);
    console.log(`  Should show: ${newCourse.title} as newest enrollment`);
    
    console.log('\n✅ TEST COMPLETED!');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Import sql for parameter types
import sql from 'mssql';

testEnrollmentFlow();
