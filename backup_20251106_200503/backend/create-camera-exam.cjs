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

async function createCameraExam() {
  try {
    await sql.connect(config);
    console.log('🔗 Connected to database');

    // Check if exam exists for MOOC 53
    console.log('\n🔍 Checking existing exam for MOOC 53...');
    const existingExam = await sql.query(`
      SELECT exam_id FROM exams WHERE mooc_id = 53
    `);

    if (existingExam.recordset.length > 0) {
      console.log(`✅ Exam already exists: ${existingExam.recordset[0].exam_id}`);
      return;
    }

    // Create exam for MOOC 53
    console.log('\n➕ Creating exam for Camera Fundamentals (MOOC 53)...');
    const createResult = await sql.query(`
      INSERT INTO exams (mooc_id, name, duration_minutes, attempts_allowed)
      OUTPUT INSERTED.exam_id
      VALUES (53, 'Camera Fundamentals Assessment', 20, 3)
    `);

    const examId = createResult.recordset[0].exam_id;
    console.log(`🎉 Created exam with ID: ${examId} for MOOC 53`);

    // Verify all exams for Course 9
    console.log('\n📊 All exams for Course 9:');
    const allExams = await sql.query(`
      SELECT e.exam_id, e.mooc_id, m.title as mooc_title
      FROM exams e
      JOIN moocs m ON e.mooc_id = m.mooc_id
      WHERE m.course_id = 9
      ORDER BY e.mooc_id
    `);

    allExams.recordset.forEach(exam => {
      console.log(`- Exam ${exam.exam_id} for MOOC ${exam.mooc_id}: ${exam.mooc_title}`);
    });

    console.log('\n✅ SUCCESS! Camera Fundamentals exam created!');
    console.log('Next step: Run populate-camera-fundamentals.cjs to add questions');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
  }
}

createCameraExam();