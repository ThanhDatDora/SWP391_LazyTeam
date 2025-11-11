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

async function checkCourseMoocs() {
  try {
    const pool = await sql.connect(config);

    // Get Course 2 info
    const course = await pool.request().query(`
      SELECT course_id, title FROM courses WHERE course_id = 2
    `);
    console.log(`\n📚 Course ${course.recordset[0].course_id}: ${course.recordset[0].title}\n`);

    // Get all MOOCs in Course 2
    const moocs = await pool.request().query(`
      SELECT mooc_id, title 
      FROM moocs 
      WHERE course_id = 2 
      ORDER BY mooc_id
    `);

    console.log(`📋 Total MOOCs: ${moocs.recordset.length}\n`);
    moocs.recordset.forEach(m => {
      console.log(`  MOOC ${m.mooc_id}: ${m.title}`);
    });

    // Count existing questions
    const questions = await pool.request().query(`
      SELECT mooc_id, COUNT(*) as count
      FROM questions
      WHERE mooc_id IN (SELECT mooc_id FROM moocs WHERE course_id = 2)
      GROUP BY mooc_id
    `);

    console.log(`\n📊 Existing questions:`);
    if (questions.recordset.length === 0) {
      console.log(`  No questions yet`);
    } else {
      questions.recordset.forEach(q => {
        console.log(`  MOOC ${q.mooc_id}: ${q.count} questions`);
      });
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCourseMoocs();
