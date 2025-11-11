import { getPool } from './config/database.js';
import sql from 'mssql';

async function checkCurrentUser() {
  try {
    console.log('🔍 Checking current user enrollments\n');
    const pool = await getPool();
    
    // Check which user has enrollments
    console.log('👥 All users with enrollments:');
    const usersWithEnrollments = await pool.request().query(`
      SELECT DISTINCT 
        u.user_id,
        u.email,
        u.full_name,
        COUNT(e.enrollment_id) as enrollment_count
      FROM users u
      JOIN enrollments e ON u.user_id = e.user_id
      WHERE e.status = 'active'
      GROUP BY u.user_id, u.email, u.full_name
      ORDER BY enrollment_count DESC
    `);
    
    console.table(usersWithEnrollments.recordset);
    
    // For each user, show their enrollments
    for (const user of usersWithEnrollments.recordset) {
      console.log(`\n📚 Enrollments for ${user.full_name} (${user.email}):`);
      
      const enrollments = await pool.request()
        .input('userId', sql.BigInt, user.user_id)
        .query(`
          SELECT 
            c.course_id,
            c.title,
            e.enrolled_at,
            e.status,
            
            -- Lesson progress
            (SELECT COUNT(*) FROM lessons l 
             JOIN moocs m ON l.mooc_id = m.mooc_id 
             WHERE m.course_id = c.course_id) as total_lessons,
            
            (SELECT COUNT(DISTINCT p.lesson_id) 
             FROM progress p
             JOIN lessons l ON p.lesson_id = l.lesson_id
             JOIN moocs m ON l.mooc_id = m.mooc_id
             WHERE m.course_id = c.course_id AND p.user_id = e.user_id AND p.is_completed = 1) as completed_lessons
             
          FROM enrollments e
          JOIN courses c ON e.course_id = c.course_id
          WHERE e.user_id = @userId AND e.status = 'active'
          ORDER BY e.enrolled_at DESC
        `);
      
      enrollments.recordset.forEach(course => {
        const progress = course.total_lessons > 0 
          ? Math.round((course.completed_lessons / course.total_lessons) * 100) 
          : 0;
        console.log(`  - ${course.title}`);
        console.log(`    Lessons: ${course.completed_lessons}/${course.total_lessons} (${progress}%)`);
        console.log(`    Enrolled: ${course.enrolled_at.toISOString().split('T')[0]}`);
      });
    }
    
    console.log('\n✅ Done!');
    await pool.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrentUser();
