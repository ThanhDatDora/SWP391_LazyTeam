import { getPool } from './config/database.js';

async function createProgressForUser3() {
  try {
    const pool = await getPool();
    
    // Get lessons for mooc 53
    const lessons = await pool.request()
      .input('moocId', 53)
      .query('SELECT lesson_id FROM lessons WHERE mooc_id = @moocId');
    
    console.log(`Found ${lessons.recordset.length} lessons for MOOC 53`);
    
    // Create progress for user 3 (learner@example.com)
    for (const lesson of lessons.recordset) {
      await pool.request()
        .input('userId', 3)
        .input('lessonId', lesson.lesson_id)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM progress WHERE user_id = @userId AND lesson_id = @lessonId)
            INSERT INTO progress (user_id, lesson_id, is_completed, updated_at)
            VALUES (@userId, @lessonId, 1, GETDATE())
          ELSE
            UPDATE progress 
            SET is_completed = 1, updated_at = GETDATE()
            WHERE user_id = @userId AND lesson_id = @lessonId
        `);
      
      console.log(`✅ Created/updated progress for lesson ${lesson.lesson_id}`);
    }
    
    // Verify progress
    const progress = await pool.request()
      .input('userId', 3)
      .input('moocId', 53)
      .query(`
        SELECT 
          COUNT(*) as total_lessons,
          SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
        FROM lessons l
        LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = @userId
        WHERE l.mooc_id = @moocId
      `);
    
    const p = progress.recordset[0];
    console.log(`\n✅ User 3 now has ${p.completed_lessons}/${p.total_lessons} lessons completed`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createProgressForUser3();