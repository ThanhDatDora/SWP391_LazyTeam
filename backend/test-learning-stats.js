import { getPool } from './config/database.js';

async function testLearningStats() {
  try {
    console.log('🧪 Testing Learning Stats Queries...\n');
    const pool = await getPool();

    // Test 1: Completion stats
    console.log('📊 Test 1: Completion stats from enrollments');
    try {
      const result1 = await pool.request().query(`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(DISTINCT user_id) as total_learners,
          SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as not_started,
          SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed
        FROM enrollments
        WHERE status = 'active'
      `);
      console.log('✅ Query 1 SUCCESS:', result1.recordset[0]);
    } catch (err) {
      console.error('❌ Query 1 FAILED:', err.message);
    }

    // Test 2: Top courses
    console.log('\n📚 Test 2: Top courses');
    try {
      const result2 = await pool.request().query(`
        SELECT TOP 5
          c.course_id,
          c.title,
          COUNT(e.enrollment_id) as enrolled_count
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        WHERE c.status = 'active'
        GROUP BY c.course_id, c.title
        ORDER BY enrolled_count DESC
      `);
      console.log('✅ Query 2 SUCCESS:', result2.recordset.length, 'courses');
    } catch (err) {
      console.error('❌ Query 2 FAILED:', err.message);
    }

    // Test 3: Progress table - check if it exists and column names
    console.log('\n📖 Test 3: Check progress table structure');
    try {
      const tableCheck = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'progress'
        ORDER BY ORDINAL_POSITION
      `);
      console.log('✅ Progress table columns:', tableCheck.recordset.map(c => c.COLUMN_NAME).join(', '));
    } catch (err) {
      console.error('❌ Progress table check FAILED:', err.message);
    }

    // Test 4: Study time from progress
    console.log('\n⏱️  Test 4: Study time from progress');
    try {
      const result3 = await pool.request().query(`
        SELECT 
          COUNT(DISTINCT user_id) as active_learners,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as total_completed_lessons,
          COUNT(*) as total_lesson_attempts
        FROM progress
      `);
      console.log('✅ Query 3 SUCCESS:', result3.recordset[0]);
    } catch (err) {
      console.error('❌ Query 3 FAILED:', err.message);
      // Try alternative column name
      console.log('   Trying alternative column name "completed"...');
      try {
        const resultAlt = await pool.request().query(`
          SELECT 
            COUNT(DISTINCT user_id) as active_learners,
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as total_completed_lessons,
            COUNT(*) as total_lesson_attempts
          FROM progress
        `);
        console.log('✅ Alternative query SUCCESS:', resultAlt.recordset[0]);
        console.log('⚠️  Use "completed" instead of "is_completed"');
      } catch (err2) {
        console.error('❌ Alternative query FAILED:', err2.message);
      }
    }

    // Test 5: Exam attempts table
    console.log('\n🎯 Test 5: Check exam_attempts table');
    try {
      const tableCheck = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'exam_attempts'
        ORDER BY ORDINAL_POSITION
      `);
      console.log('✅ Exam_attempts table columns:', tableCheck.recordset.map(c => c.COLUMN_NAME).join(', '));
      
      const count = await pool.request().query(`SELECT COUNT(*) as total FROM exam_attempts`);
      console.log('   Total exam attempts:', count.recordset[0].total);
    } catch (err) {
      console.error('❌ Exam_attempts table check FAILED:', err.message);
    }

    await pool.close();
    console.log('\n✅ Test completed!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

testLearningStats();
