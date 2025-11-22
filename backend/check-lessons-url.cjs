const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  try {
    const pool = await sql.connect(config);
    
    // Check Course 2 lessons
    const result = await pool.request()
      .input('mid', sql.BigInt, 3)
      .query('SELECT lesson_id, title, content_type, content_url FROM lessons WHERE mooc_id = @mid ORDER BY order_no');
    
    console.log('📚 Course 2 Lessons (MOOC ID = 3):');
    console.log('=====================================\n');
    
    result.recordset.forEach((lesson, idx) => {
      console.log(`${idx + 1}. Lesson ${lesson.lesson_id}: ${lesson.title}`);
      console.log(`   Type: ${lesson.content_type}`);
      console.log(`   URL: ${lesson.content_url ? lesson.content_url.substring(0, 150) : '❌ NULL'}`);
      console.log('');
    });
    
    // Count nulls
    const nullCount = result.recordset.filter(l => !l.content_url).length;
    console.log(`\n⚠️ Found ${nullCount} lessons with NULL content_url`);
    
    await pool.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
