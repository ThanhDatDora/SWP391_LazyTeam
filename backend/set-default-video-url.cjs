const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Default demo video - Một video YouTube về education/learning
// Bạn có thể thay bằng video khác bất kỳ
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (famous demo video)
// Hoặc dùng video này về online learning:
// const DEFAULT_VIDEO_URL = 'https://www.youtube.com/embed/kqtD5dpn9C8'; // What is Online Learning?

async function setDefaultVideoUrl() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n🎥 Setting default video URL for all video lessons...');
    console.log(`Default URL: ${DEFAULT_VIDEO_URL}`);
    console.log('='.repeat(80));
    
    // Update all lessons with content_type = 'video'
    const result = await pool.request()
      .input('defaultUrl', sql.NVarChar, DEFAULT_VIDEO_URL)
      .query(`
        UPDATE lessons
        SET content_url = @defaultUrl
        WHERE content_type = 'video'
      `);
    
    console.log(`\n✅ Updated ${result.rowsAffected[0]} video lessons with default URL`);
    
    // Verify the update
    const verifyResult = await pool.request().query(`
      SELECT COUNT(*) as count, content_url
      FROM lessons
      WHERE content_type = 'video'
      GROUP BY content_url
    `);
    
    console.log('\n📊 Video URL distribution after update:');
    console.log('='.repeat(80));
    verifyResult.recordset.forEach(row => {
      console.log(`${row.count} lessons: ${row.content_url}`);
    });
    
    console.log('\n\n✨ Done! All video lessons now use the default video URL.');
    console.log('💡 Instructors can edit individual lesson videos from the UI later.');
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

setDefaultVideoUrl();
