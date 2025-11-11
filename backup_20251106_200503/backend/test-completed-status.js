import { getPool } from './config/database.js';
import sql from 'mssql';

async function testCompletedStatus() {
  try {
    const pool = await getPool();
    const userId = 13;
    const courseId = 9; // Photography Masterclass
    
    console.log('\n🎓 TESTING COMPLETED STATUS\n');
    console.log('═══════════════════════════════════════\n');
    
    // Step 1: Check course lessons
    console.log('📚 Step 1: Course Structure');
    const lessons = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query(`
        SELECT 
          m.mooc_id,
          m.title as mooc_title,
          COUNT(l.lesson_id) as lesson_count
        FROM moocs m
        LEFT JOIN lessons l ON m.mooc_id = l.mooc_id
        WHERE m.course_id = @courseId
        GROUP BY m.mooc_id, m.title
      `);
    
    const totalLessons = lessons.recordset.reduce((sum, m) => sum + m.lesson_count, 0);
    console.log(`  Course has ${lessons.recordset.length} moocs, ${totalLessons} total lessons`);
    
    if (totalLessons === 0) {
      console.log('  ⚠️  No lessons in this course - cannot test progress');
      console.log('  💡 Marking course as completed directly...\n');
      
      await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('courseId', sql.Int, courseId)
        .query(`
          UPDATE enrollments
          SET completed_at = GETDATE()
          WHERE user_id = @userId AND course_id = @courseId
        `);
      
      console.log('  ✅ Marked course as completed');
    } else {
      // Get all lesson IDs
      const allLessons = await pool.request()
        .input('courseId', sql.Int, courseId)
        .query(`
          SELECT l.lesson_id
          FROM lessons l
          INNER JOIN moocs m ON l.mooc_id = m.mooc_id
          WHERE m.course_id = @courseId
        `);
      
      console.log('\n📝 Step 2: Marking All Lessons Complete');
      for (const lesson of allLessons.recordset) {
        await pool.request()
          .input('userId', sql.BigInt, userId)
          .input('lessonId', sql.BigInt, lesson.lesson_id)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM progress WHERE user_id = @userId AND lesson_id = @lessonId)
            BEGIN
              INSERT INTO progress (user_id, lesson_id, is_completed, last_position_sec, updated_at)
              VALUES (@userId, @lessonId, 1, 0, GETDATE())
            END
            ELSE
            BEGIN
              UPDATE progress
              SET is_completed = 1, updated_at = GETDATE()
              WHERE user_id = @userId AND lesson_id = @lessonId
            END
          `);
      }
      
      console.log(`  ✅ Marked ${allLessons.recordset.length} lessons as completed`);
      
      console.log('\n🎓 Step 3: Marking Course Complete');
      await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('courseId', sql.Int, courseId)
        .query(`
          UPDATE enrollments
          SET completed_at = GETDATE()
          WHERE user_id = @userId AND course_id = @courseId
        `);
      
      console.log('  ✅ Course marked as completed');
    }
    
    // Verify result
    console.log('\n🔍 Step 4: Verification');
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('courseId', sql.Int, courseId)
      .query(`
        SELECT 
          e.completed_at,
          (SELECT COUNT(*) FROM progress p 
           INNER JOIN lessons l ON p.lesson_id = l.lesson_id 
           INNER JOIN moocs m ON l.mooc_id = m.mooc_id 
           WHERE m.course_id = @courseId AND p.user_id = @userId AND p.is_completed = 1) as completed_count,
          (SELECT COUNT(*) FROM lessons l 
           INNER JOIN moocs m ON l.mooc_id = m.mooc_id 
           WHERE m.course_id = @courseId) as total_count
        FROM enrollments e
        WHERE e.user_id = @userId AND e.course_id = @courseId
      `);
    
    const data = result.recordset[0];
    console.log(`  Completed At: ${data.completed_at}`);
    console.log(`  Progress: ${data.completed_count}/${data.total_count} lessons`);
    console.log(`  Status: ${data.completed_at ? '✅ COMPLETED' : '⏳ In Progress'}`);
    
    console.log('\n🎯 Frontend Test:');
    console.log('  1. Refresh My Courses page');
    console.log('  2. Filter by "Completed"');
    console.log('  3. Should see Photography Masterclass');
    console.log('  4. Should show 100% progress');
    console.log('  5. Should show certificate badge');
    
    console.log('\n✅ TEST COMPLETED!');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCompletedStatus();
