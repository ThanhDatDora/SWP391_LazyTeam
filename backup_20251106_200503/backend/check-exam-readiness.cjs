/**
 * PRE-TESTING VERIFICATION SCRIPT
 * Checks if exam system is ready for testing
 */

const path = require('path');

async function checkExamReadiness() {
  let pool;
  try {
    console.log('\n🔍 EXAM SYSTEM READINESS CHECK\n');
    console.log('=' .repeat(60));
    
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;

    // Connect to database
    pool = await getPool();
    console.log('✅ Database connected\n');
    
    // 1. Check exam_attempts table exists
    console.log('📊 1. Checking exam_attempts table...');
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'exam_attempts'
    `);
    
    if (tableCheck.recordset[0].count === 0) {
      console.log('❌ exam_attempts table NOT FOUND!');
      console.log('   Run: backend/migrations/add-exam-attempts-table.sql');
      return;
    }
    console.log('✅ exam_attempts table exists');
    
    // 2. Check enrollments columns
    console.log('\n📊 2. Checking enrollments table columns...');
    const columnsCheck = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'enrollments'
      AND COLUMN_NAME IN ('current_mooc_id', 'moocs_completed', 'overall_score', 'is_completed')
    `);
    
    const columns = columnsCheck.recordset.map(r => r.COLUMN_NAME);
    const requiredColumns = ['current_mooc_id', 'moocs_completed', 'overall_score', 'is_completed'];
    const missingColumns = requiredColumns.filter(c => !columns.includes(c));
    
    if (missingColumns.length > 0) {
      console.log(`❌ Missing columns in enrollments: ${missingColumns.join(', ')}`);
      console.log('   Run: backend/migrations/add-enrollment-progress-columns.sql');
      return;
    }
    console.log('✅ All required columns exist');
    
    // 3. Count exam questions by course
    console.log('\n📊 3. Checking exam questions...');
    const questionsCount = await pool.request().query(`
      SELECT 
        c.course_id,
        c.title as course_title,
        COUNT(DISTINCT q.question_id) as question_count
      FROM courses c
      LEFT JOIN moocs m ON c.course_id = m.course_id
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      WHERE c.course_id BETWEEN 2 AND 8
      GROUP BY c.course_id, c.title
      ORDER BY c.course_id
    `);
    
    console.log('\nQuestions per course:');
    let totalQuestions = 0;
    questionsCount.recordset.forEach(row => {
      const status = row.question_count >= 10 ? '✅' : '⚠️';
      console.log(`  ${status} Course ${row.course_id} (${row.course_title}): ${row.question_count} questions`);
      totalQuestions += row.question_count;
    });
    console.log(`\n  📝 Total questions: ${totalQuestions}`);
    
    if (totalQuestions < 70) {
      console.log('⚠️  Warning: Less than 70 total questions (expected 70-80)');
    }
    
    // 4. Check exam configuration
    console.log('\n📊 4. Checking exam configuration...');
    const examsConfig = await pool.request().query(`
      SELECT 
        e.exam_id,
        m.mooc_id,
        m.title as mooc_title,
        e.duration_minutes,
        70 as passing_score,
        COUNT(ei.question_id) as question_count
      FROM exams e
      JOIN moocs m ON e.mooc_id = m.mooc_id
      LEFT JOIN exam_items ei ON e.exam_id = ei.exam_id
      WHERE m.course_id BETWEEN 2 AND 8
      GROUP BY e.exam_id, m.mooc_id, m.title, e.duration_minutes
      ORDER BY m.mooc_id
    `);
    
    console.log('\nExam configurations:');
    examsConfig.recordset.forEach(row => {
      const status = row.question_count >= 10 ? '✅' : '❌';
      console.log(`  ${status} MOOC ${row.mooc_id}: ${row.question_count} questions, ${row.duration_minutes} min, ${row.passing_score}% pass`);
    });
    
    // 5. Check test user enrollments
    console.log('\n📊 5. Checking test user enrollments...');
    const enrollments = await pool.request().query(`
      SELECT TOP 5
        u.user_id,
        u.email,
        u.full_name,
        c.course_id,
        c.title as course_title,
        e.current_mooc_id,
        e.moocs_completed,
        e.overall_score
      FROM users u
      JOIN enrollments e ON u.user_id = e.user_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'learner')
      ORDER BY e.enrolled_at DESC
    `);
    
    if (enrollments.recordset.length === 0) {
      console.log('⚠️  No test enrollments found');
      console.log('   Create test user and enroll in courses');
    } else {
      console.log('\nTest enrollments:');
      enrollments.recordset.forEach(row => {
        console.log(`  👤 ${row.email} → ${row.course_title}`);
        console.log(`     Current MOOC: ${row.current_mooc_id || 'NULL'}, Completed: ${row.moocs_completed || 0}, Score: ${row.overall_score || 0}%`);
      });
    }
    
    // 6. Check existing exam attempts
    console.log('\n📊 6. Checking existing exam attempts...');
    const attempts = await pool.request().query(`
      SELECT COUNT(*) as total_attempts
      FROM exam_attempts
    `);
    
    console.log(`  📝 Total exam attempts: ${attempts.recordset[0].total_attempts}`);
    
    if (attempts.recordset[0].total_attempts > 0) {
      const recentAttempts = await pool.request().query(`
        SELECT TOP 3
          ea.attempt_id,
          u.email,
          m.title as mooc_title,
          ea.score,
          ea.passed,
          ea.submitted_at
        FROM exam_attempts ea
        JOIN users u ON ea.user_id = u.user_id
        JOIN moocs m ON ea.mooc_id = m.mooc_id
        ORDER BY ea.submitted_at DESC
      `);
      
      console.log('\n  Recent attempts:');
      recentAttempts.recordset.forEach(row => {
        const status = row.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`    ${status} ${row.email} - ${row.mooc_title}: ${row.score}%`);
      });
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(60));
    console.log('🎯 READINESS STATUS:');
    console.log('='.repeat(60));
    
    const allChecks = [
      tableCheck.recordset[0].count > 0,
      missingColumns.length === 0,
      totalQuestions >= 70,
      examsConfig.recordset.every(e => e.question_count >= 10)
    ];
    
    if (allChecks.every(c => c)) {
      console.log('✅ SYSTEM READY FOR TESTING!');
      console.log('\nNext steps:');
      console.log('1. Open browser: http://localhost:5173');
      console.log('2. Login with test user');
      console.log('3. Enroll in Course 2 (React Development)');
      console.log('4. Follow EXAM_TESTING_GUIDE.md');
    } else {
      console.log('❌ SYSTEM NOT READY!');
      console.log('\nRequired fixes:');
      if (!allChecks[0]) console.log('- Create exam_attempts table');
      if (!allChecks[1]) console.log('- Add missing enrollments columns');
      if (!allChecks[2]) console.log('- Add more exam questions');
      if (!allChecks[3]) console.log('- Fix exams with <10 questions');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Run the check
checkExamReadiness();
