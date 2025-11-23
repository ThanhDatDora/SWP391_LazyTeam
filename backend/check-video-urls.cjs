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

async function checkVideoUrls() {
  try {
    const pool = await sql.connect(config);
    
    // First, check lessons table structure
    const schemaResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'lessons'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n📋 Lessons Table Schema:');
    console.log('='.repeat(80));
    schemaResult.recordset.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE.padEnd(15)} ${col.IS_NULLABLE}`);
    });
    
    // Check sample of lessons
    const result = await pool.request().query(`
      SELECT TOP 10
        lesson_id, 
        mooc_id,
        title,
        content_type,
        content_url,
        order_no,
        is_preview
      FROM lessons
      ORDER BY lesson_id
    `);
    
    console.log('\n📚 Sample Lessons in Database:');
    console.log('='.repeat(80));
    result.recordset.forEach(lesson => {
      console.log(`\nLesson ${lesson.lesson_id}: ${lesson.title}`);
      console.log(`  MOOC ID: ${lesson.mooc_id}`);
      console.log(`  Order: ${lesson.order_no}`);
      console.log(`  Content Type: ${lesson.content_type || 'NULL'}`);
      console.log(`  Content URL: ${lesson.content_url || 'NULL'}`);
      console.log(`  Is Preview: ${lesson.is_preview}`);
    });
    
    // Check for NULL/empty URLs
    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN content_url IS NULL OR content_url = '' THEN 1 ELSE 0 END) as null_urls,
        SUM(CASE WHEN content_type = 'video' THEN 1 ELSE 0 END) as video_lessons
      FROM lessons
    `);
    
    console.log('\n\n📊 Statistics:');
    console.log('='.repeat(80));
    console.log(`Total lessons: ${statsResult.recordset[0].total_lessons}`);
    console.log(`Lessons with NULL/empty URLs: ${statsResult.recordset[0].null_urls}`);
    console.log(`Video lessons: ${statsResult.recordset[0].video_lessons}`);
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkVideoUrls();
