const path = require('path');

async function markLessonsCompleted() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();

    const userId = 16; // testuser@example.com
    const moocId = 53;

    // Get all lessons for mooc 53
    const lessons = await pool.request().query(`
      SELECT lesson_id, title FROM lessons WHERE mooc_id = ${moocId}
    `);

    console.log(`Creating progress records for user ${userId} in mooc ${moocId}...`);

    for (const lesson of lessons.recordset) {
      // Check if progress already exists
      const existing = await pool.request().query(`
        SELECT user_id FROM progress 
        WHERE user_id = ${userId} AND lesson_id = ${lesson.lesson_id}
      `);

      if (existing.recordset.length === 0) {
        // Create new progress record
        await pool.request().query(`
          INSERT INTO progress (user_id, lesson_id, is_completed, updated_at)
          VALUES (${userId}, ${lesson.lesson_id}, 1, GETDATE())
        `);
        console.log(`✅ Marked lesson "${lesson.title}" as completed`);
      } else {
        // Update existing progress
        await pool.request().query(`
          UPDATE progress 
          SET is_completed = 1, updated_at = GETDATE()
          WHERE user_id = ${userId} AND lesson_id = ${lesson.lesson_id}
        `);
        console.log(`✅ Updated lesson "${lesson.title}" to completed`);
      }
    }

    console.log('\n🎉 All lessons marked as completed! User can now take the exam.');

  } catch(error) {
    console.error("Error:", error.message);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

markLessonsCompleted();