import { getPool } from './config/database.js';
import sql from 'mssql';

async function testProgressData() {
  try {
    console.log('🔍 Testing Progress Page Data Consistency\n');
    const pool = await getPool();
    
    // Test with a specific user (change this to actual user ID)
    const testUserId = 5; // huy484820@gmail.com based on previous logs
    
    console.log(`👤 Testing for user_id: ${testUserId}\n`);
    
    // 1. Check enrollments
    console.log('📚 Step 1: Check enrollments');
    const enrollments = await pool.request()
      .input('userId', sql.BigInt, testUserId)
      .query(`
        SELECT 
          e.enrollment_id,
          c.course_id,
          c.title,
          e.enrolled_at,
          e.completed_at,
          e.status
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.user_id = @userId AND e.status = 'active'
      `);
    
    console.log(`  ✅ Found ${enrollments.recordset.length} active enrollments`);
    enrollments.recordset.forEach(e => {
      console.log(`    - ${e.title} (ID: ${e.course_id})`);
    });
    
    // 2. Check lesson progress for first enrollment
    if (enrollments.recordset.length > 0) {
      const firstCourse = enrollments.recordset[0];
      console.log(`\n📖 Step 2: Check lesson progress for "${firstCourse.title}"`);
      
      const lessonStats = await pool.request()
        .input('userId', sql.BigInt, testUserId)
        .input('courseId', sql.BigInt, firstCourse.course_id)
        .query(`
          SELECT 
            (SELECT COUNT(*) FROM lessons l 
             JOIN moocs m ON l.mooc_id = m.mooc_id 
             WHERE m.course_id = @courseId) as total_lessons,
            
            (SELECT COUNT(DISTINCT p.lesson_id) 
             FROM progress p
             JOIN lessons l ON p.lesson_id = l.lesson_id
             JOIN moocs m ON l.mooc_id = m.mooc_id
             WHERE m.course_id = @courseId AND p.user_id = @userId AND p.is_completed = 1) as completed_lessons
        `);
      
      const stats = lessonStats.recordset[0];
      console.log(`  ✅ Lessons: ${stats.completed_lessons}/${stats.total_lessons} completed`);
      console.log(`  📊 Progress: ${stats.total_lessons > 0 ? Math.round((stats.completed_lessons / stats.total_lessons) * 100) : 0}%`);
      
      // 3. Check MOOCs progress
      console.log(`\n📦 Step 3: Check MOOCs progress`);
      const moocStats = await pool.request()
        .input('userId', sql.BigInt, testUserId)
        .input('courseId', sql.BigInt, firstCourse.course_id)
        .query(`
          SELECT 
            (SELECT COUNT(*) FROM moocs WHERE course_id = @courseId) as total_moocs,
            
            (SELECT COUNT(DISTINCT m.mooc_id)
             FROM moocs m
             JOIN lessons l ON m.mooc_id = l.mooc_id
             JOIN progress p ON l.lesson_id = p.lesson_id
             WHERE m.course_id = @courseId 
             AND p.user_id = @userId 
             AND p.is_completed = 1
             AND NOT EXISTS (
               SELECT 1 FROM lessons l2 
               WHERE l2.mooc_id = m.mooc_id 
               AND NOT EXISTS (
                 SELECT 1 FROM progress p2 
                 WHERE p2.lesson_id = l2.lesson_id 
                 AND p2.user_id = @userId 
                 AND p2.is_completed = 1
               )
             )) as completed_moocs
        `);
      
      const moocs = moocStats.recordset[0];
      console.log(`  ✅ MOOCs: ${moocs.completed_moocs}/${moocs.total_moocs} completed`);
      
      // 4. Check exam scores
      console.log(`\n📝 Step 4: Check exam scores`);
      const examScores = await pool.request()
        .input('userId', sql.BigInt, testUserId)
        .input('courseId', sql.BigInt, firstCourse.course_id)
        .query(`
          SELECT 
            e.exam_id,
            e.name as exam_name,
            s.score as best_score,
            s.max_score,
            s.submitted_at
          FROM exams e
          JOIN moocs m ON e.mooc_id = m.mooc_id
          JOIN courses c ON m.course_id = c.course_id
          LEFT JOIN submissions s ON e.exam_id = s.exam_id AND s.user_id = @userId AND s.is_best = 1
          WHERE c.course_id = @courseId
        `);
      
      console.log(`  ✅ Found ${examScores.recordset.length} exams`);
      examScores.recordset.forEach(exam => {
        if (exam.best_score !== null) {
          console.log(`    ✅ ${exam.exam_name}: ${exam.best_score}/${exam.max_score} (${Math.round((exam.best_score / exam.max_score) * 100)}%)`);
        } else {
          console.log(`    ⏳ ${exam.exam_name}: Not submitted`);
        }
      });
      
      // 5. Test the actual API response structure
      console.log(`\n🔄 Step 5: Simulating API response...`);
      const apiResponse = {
        enrollment_id: firstCourse.enrollment_id,
        course: {
          course_id: firstCourse.course_id,
          title: firstCourse.title,
          total_moocs: moocs.total_moocs
        },
        progress: {
          completed_moocs: moocs.completed_moocs,
          total_moocs: moocs.total_moocs,
          completed_lessons: stats.completed_lessons,
          total_lessons: stats.total_lessons,
          percentage: stats.total_lessons > 0 ? Math.round((stats.completed_lessons / stats.total_lessons) * 100) : 0, // CALCULATED!
          exam_scores: examScores.recordset
            .filter(e => e.best_score !== null)
            .map(e => ({
              exam_name: e.exam_name,
              best_score: parseFloat(e.best_score),
              max_score: parseFloat(e.max_score)
            }))
        }
      };
      
      console.log('\n📦 API Response Structure:');
      console.log(JSON.stringify(apiResponse, null, 2));
    }
    
    console.log('\n✅ Test completed successfully!');
    await pool.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testProgressData();
