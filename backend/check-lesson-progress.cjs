const path = require('path');

async function checkLessonProgress() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();

    const userId = 16; // testuser@example.com
    const moocId = 53;
    
    // Check lesson progress for user 16 in mooc 53
    const result = await pool.request().query(`
      SELECT 
        l.lesson_id,
        l.title,
        l.order_no,
        p.is_completed
      FROM lessons l
      LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = ${userId}
      WHERE l.mooc_id = ${moocId}
      ORDER BY l.order_no
    `);
    
    console.log(`Lesson progress for user ${userId} in mooc ${moocId}:`);
    
    if (result.recordset.length === 0) {
      console.log('No lessons found for this MOOC');
    } else {
      const totalLessons = result.recordset.length;
      const completedLessons = result.recordset.filter(l => l.is_completed === true || l.is_completed === 1).length;
      
      console.log(`Total lessons: ${totalLessons}`);
      console.log(`Completed lessons: ${completedLessons}`);
      console.log(`Can take exam: ${completedLessons >= totalLessons ? 'YES' : 'NO'}`);
      console.log('\nLesson details:');
      
      result.recordset.forEach(lesson => {
        const status = lesson.is_completed ? '✅' : '❌';
        console.log(`${status} ${lesson.order_no}. ${lesson.title}`);
      });
    }
    
  } catch(error) {
    console.error("Error:", error.message);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

checkLessonProgress();