import { getPool } from './config/database.js';

async function checkLesson268() {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT lesson_id, title, content_type, content_url, mooc_id
      FROM lessons 
      WHERE lesson_id = 268
    `);

    if (result.recordset.length > 0) {
      const lesson = result.recordset[0];
      console.log('📚 Lesson 268 (Understanding Exposure Triangle):');
      console.log(`Title: ${lesson.title}`);
      console.log(`Type: ${lesson.content_type}`);
      console.log(`MOOC ID: ${lesson.mooc_id}`);
      console.log(`URL: ${lesson.content_url}`);
    } else {
      console.log('❌ Lesson 268 not found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLesson268();
