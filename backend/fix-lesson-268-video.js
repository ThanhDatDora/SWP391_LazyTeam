import { getPool } from './config/database.js';
import sql from 'mssql';

async function fixLesson268() {
  try {
    const pool = await getPool();
    
    // Update lesson 268 with a working video
    // Using a popular photography exposure triangle tutorial
    const newVideoUrl = 'https://www.youtube.com/embed/V7z7BAZdt2M'; // Photography basics video
    
    console.log('🔄 Updating lesson 268 video URL...');
    
    await pool.request()
      .input('lessonId', sql.BigInt, 268)
      .input('newUrl', sql.NVarChar, newVideoUrl)
      .query(`
        UPDATE lessons
        SET content_url = @newUrl
        WHERE lesson_id = @lessonId
      `);
    
    console.log('✅ Updated lesson 268 video URL to:', newVideoUrl);
    
    // Verify
    const result = await pool.request()
      .input('lessonId', sql.BigInt, 268)
      .query(`
        SELECT lesson_id, title, content_url
        FROM lessons
        WHERE lesson_id = @lessonId
      `);
    
    console.log('\n📚 Verification:');
    console.log('Title:', result.recordset[0].title);
    console.log('New URL:', result.recordset[0].content_url);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixLesson268();
