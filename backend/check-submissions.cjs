const { getPool } = require('./config/database.js');

(async () => {
  try {
    const pool = await getPool();

    console.log('\n📊 CHECKING ESSAY SUBMISSIONS\n');

    const result = await pool.request()
      .query(`
        SELECT TOP 10
          es.essay_submission_id,
          es.content_text,
          es.score,
          es.status,
          es.submitted_at,
          es.graded_at,
          u.full_name as student_name,
          l.title as lesson_title,
          c.title as course_title,
          c.owner_instructor_id
        FROM essay_submissions es
        JOIN users u ON es.user_id = u.user_id
        JOIN lessons l ON es.task_id = l.lesson_id
        JOIN moocs m ON l.mooc_id = m.mooc_id
        JOIN courses c ON m.course_id = c.course_id
        ORDER BY es.submitted_at DESC
      `);

    console.log('Total submissions:', result.recordset.length);
    console.log('\nSubmissions:');
    result.recordset.forEach(s => {
      console.log(`\nID: ${s.essay_submission_id}`);
      console.log(`  Student: ${s.student_name}`);
      console.log(`  Lesson: ${s.lesson_title}`);
      console.log(`  Course: ${s.course_title} (Instructor ID: ${s.owner_instructor_id})`);
      console.log(`  Score: ${s.score || 'Chưa chấm'}`);
      console.log(`  Status: ${s.status}`);
      console.log(`  Submitted: ${s.submitted_at}`);
    });

    console.log('\n📝 Test URL for instructor (ID=2):');
    const instructorSubmissions = result.recordset.filter(s => s.owner_instructor_id === 2);
    if (instructorSubmissions.length > 0) {
      console.log(`http://localhost:5173/instructor/submissions/${instructorSubmissions[0].essay_submission_id}`);
    } else {
      console.log('❌ No submissions found for instructor ID=2');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
