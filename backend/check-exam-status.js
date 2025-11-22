import { getPool } from './config/database.js';

async function checkExamStatus() {
  try {
    const pool = await getPool();
    
    // Check exam attempts for mooc 53
    console.log('=== EXAM ATTEMPTS FOR MOOC 53 ===');
    const attempts = await pool.request().query(`
      SELECT ea.*, u.email 
      FROM exam_attempts ea 
      JOIN users u ON ea.user_id = u.user_id 
      WHERE ea.mooc_id = 53 
      ORDER BY ea.started_at DESC
    `);
    
    attempts.recordset.forEach(attempt => {
      console.log(`User: ${attempt.email}, Started: ${attempt.started_at}, Status: ${attempt.status}`);
      console.log(`Duration: ${attempt.duration_minutes}min, Score: ${attempt.score || 'NULL'}`);
      console.log('---');
    });

    // Check lesson progress for different users in mooc 53
    console.log('\n=== LESSON PROGRESS FOR MOOC 53 ===');
    const progress = await pool.request().query(`
      SELECT u.user_id, u.email, 
             COUNT(l.lesson_id) as total_lessons,
             SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
      FROM users u
      CROSS JOIN lessons l
      LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = u.user_id
      WHERE l.mooc_id = 53 AND u.user_id IN (3, 5, 16)
      GROUP BY u.user_id, u.email
      ORDER BY u.user_id
    `);
    
    progress.recordset.forEach(p => {
      console.log(`User ${p.user_id} (${p.email}): ${p.completed_lessons}/${p.total_lessons} lessons completed`);
    });

    // Check recent attempts with time
    console.log('\n=== RECENT ATTEMPTS (last 10 minutes) ===');
    const recentAttempts = await pool.request().query(`
      SELECT ea.*, u.email, 
             DATEDIFF(SECOND, ea.started_at, GETDATE()) as seconds_ago
      FROM exam_attempts ea 
      JOIN users u ON ea.user_id = u.user_id 
      WHERE ea.mooc_id = 53 
        AND DATEDIFF(MINUTE, ea.started_at, GETDATE()) <= 10
      ORDER BY ea.started_at DESC
    `);
    
    if (recentAttempts.recordset.length > 0) {
      recentAttempts.recordset.forEach(attempt => {
        console.log(`${attempt.email}: ${attempt.seconds_ago} seconds ago (${Math.floor(attempt.seconds_ago/60)}min)`);
      });
    } else {
      console.log('No recent attempts found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkExamStatus();