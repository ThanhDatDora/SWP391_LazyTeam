const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function testLearningStatsQuery() {
  try {
    const pool = await sql.connect(config);
    
    console.log('Testing learning stats queries...\n');
    
    // Check enrollments status values
    console.log('0️⃣ Checking enrollments status values:');
    const statusCheck = await pool.request().query(`
      SELECT DISTINCT status, COUNT(*) as count 
      FROM enrollments 
      GROUP BY status
    `);
    console.table(statusCheck.recordset);
    
    // Test the query from admin.js line 832-846
    console.log('\n1️⃣ Testing completionResult query:');
    const completionResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(DISTINCT user_id) as total_learners,
        SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as excellent,
        0 as good,
        SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as needs_improvement,
        50.0 as avg_progress,
        CAST(SUM(CASE WHEN completed_at IS NOT NULL THEN 100.0 ELSE 0 END) / NULLIF(COUNT(*), 0) as DECIMAL(5,2)) as completion_rate
      FROM enrollments
      WHERE status = 'active'
    `);
    console.table(completionResult.recordset);
    
    // Test topCoursesResult query
    console.log('\n2️⃣ Testing topCoursesResult query:');
    const topCoursesResult = await pool.request().query(`
      SELECT TOP 5
        c.course_id,
        c.title,
        c.thumbnail as thumbnail_url,
        u.full_name as instructor_name,
        COUNT(e.enrollment_id) as enrolled_count,
        CAST(SUM(CASE WHEN e.completed_at IS NOT NULL THEN 100.0 ELSE 0 END) / NULLIF(COUNT(e.enrollment_id), 0) as DECIMAL(5,2)) as completion_rate,
        50.0 as avg_progress
      FROM courses c
      LEFT JOIN users u ON c.owner_instructor_id = u.user_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      WHERE c.status = 'active'
      GROUP BY c.course_id, c.title, c.thumbnail, u.full_name
      ORDER BY enrolled_count DESC
    `);
    console.table(topCoursesResult.recordset);
    
    // Test avgTimeResult query from progress table
    console.log('\n3️⃣ Testing avgTimeResult query from progress table:');
    const avgTimeResult = await pool.request().query(`
      SELECT 
        0.0 as avg_lesson_time_minutes,
        0 as total_study_time_minutes,
        COUNT(DISTINCT user_id) as active_learners,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as total_completed_lessons,
        COUNT(*) as total_lesson_attempts
      FROM progress
    `);
    
    console.table(avgTimeResult.recordset);
    console.log('✅ Query executed successfully\n');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLearningStatsQuery();
