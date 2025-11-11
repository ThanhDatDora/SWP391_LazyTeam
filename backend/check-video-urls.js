import { getPool } from './config/database.js';

async function checkVideoUrls() {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT TOP 5 lesson_id, title, content_type, content_url 
      FROM lessons 
      WHERE content_type = 'video'
      ORDER BY lesson_id DESC
    `);

    console.log('🎬 Video lessons in database:\n');
    result.recordset.forEach(lesson => {
      console.log(`ID: ${lesson.lesson_id}`);
      console.log(`Title: ${lesson.title}`);
      console.log(`URL: ${lesson.content_url}`);
      console.log('---\n');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVideoUrls();
