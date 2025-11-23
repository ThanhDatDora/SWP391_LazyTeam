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

async function rollbackExamQuestions() {
  try {
    console.log('🔄 Starting rollback of exam questions and exams...\n');

    const pool = await sql.connect(config);

    // Step 1: Check current state
    console.log('📊 Current state:');
    const currentState = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM questions) as total_questions,
        (SELECT COUNT(*) FROM exams WHERE mooc_id IS NULL) as course_exams,
        (SELECT COUNT(*) FROM submissions) as exam_instances
    `);
    console.log(`   Questions: ${currentState.recordset[0].total_questions}`);
    console.log(`   Course-level exams: ${currentState.recordset[0].course_exams}`);
    console.log(`   Submissions: ${currentState.recordset[0].exam_instances}\n`);

    // Step 2: Delete submissions for course-level exams first
    console.log('🗑️ Deleting submissions for course-level exams...');
    const deleteInstances = await pool.request().query(`
      DELETE FROM submissions 
      WHERE exam_id IN (SELECT exam_id FROM exams WHERE mooc_id IS NULL)
    `);
    console.log(`   Deleted ${deleteInstances.rowsAffected[0]} submissions\n`);

    // Step 3: Delete exam_items for course-level exams
    console.log('🗑️ Deleting exam_items for course-level exams...');
    const deleteItems = await pool.request().query(`
      DELETE FROM exam_items 
      WHERE exam_id IN (SELECT exam_id FROM exams WHERE mooc_id IS NULL)
    `);
    console.log(`   Deleted ${deleteItems.rowsAffected[0]} exam items\n`);

    // Step 4: Delete course-level exams
    console.log('🗑️ Deleting course-level exams...');
    const deleteExams = await pool.request().query(`
      DELETE FROM exams WHERE mooc_id IS NULL
    `);
    console.log(`   Deleted ${deleteExams.rowsAffected[0]} course-level exams\n`);

    // Step 5: Get question count before deletion
    const beforeCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM questions
    `);
    const originalCount = 62; // Original question count before populate
    const addedCount = beforeCount.recordset[0].count - originalCount;

    console.log(`📝 Questions before: ${beforeCount.recordset[0].count}`);
    console.log(`📝 Original questions: ${originalCount}`);
    console.log(`📝 Added questions: ${addedCount}\n`);

    // Step 6: Delete recently added questions (keep original 62)
    // Delete questions with question_id > 64 (keeping original questions)
    console.log('🗑️ Deleting added questions (question_id > 64)...');
    
    // First delete exam_items referencing these questions
    const deleteExamItems = await pool.request().query(`
      DELETE FROM exam_items WHERE question_id > 64
    `);
    console.log(`   Deleted ${deleteExamItems.rowsAffected[0]} exam_items referencing new questions`);

    // Then delete question_options
    const deleteQuestions = await pool.request().query(`
      DELETE FROM question_options WHERE question_id > 64
    `);
    console.log(`   Deleted ${deleteQuestions.rowsAffected[0]} question options`);

    // Finally delete the questions themselves
    const deleteQuestionsMain = await pool.request().query(`
      DELETE FROM questions WHERE question_id > 64
    `);
    console.log(`   Deleted ${deleteQuestionsMain.rowsAffected[0]} questions\n`);

    // Step 7: Verify final state
    const afterCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM questions
    `);
    console.log('✅ Final state:');
    console.log(`   Questions remaining: ${afterCount.recordset[0].count}`);
    console.log(`   Expected: ~${originalCount}\n`);

    // Show breakdown by course
    console.log('📊 Questions by course:');
    const breakdown = await pool.request().query(`
      SELECT 
        c.course_id,
        c.title,
        COUNT(q.question_id) as question_count
      FROM courses c
      LEFT JOIN moocs m ON c.course_id = m.course_id
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      GROUP BY c.course_id, c.title
      ORDER BY c.course_id
    `);

    breakdown.recordset.forEach(row => {
      console.log(`   Course ${row.course_id} (${row.title}): ${row.question_count} questions`);
    });

    console.log('\n🎉 Rollback completed successfully!');

    await pool.close();

  } catch (error) {
    console.error('❌ Rollback error:', error);
    throw error;
  }
}

rollbackExamQuestions();
