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

async function checkQuestions() {
  try {
    const pool = await sql.connect(config);

    // Check questions table structure
    console.log('📋 QUESTIONS table structure:');
    const structure = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'questions'
      ORDER BY ORDINAL_POSITION
    `);
    structure.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? '(required)' : '(nullable)'}`);
    });

    // Count questions
    const count = await pool.request().query(`
      SELECT COUNT(*) as total FROM questions
    `);
    console.log(`\n📊 Total questions: ${count.recordset[0].total}`);

    // Count by mooc
    const byMooc = await pool.request().query(`
      SELECT 
        m.mooc_id,
        m.title as mooc_title,
        c.course_id,
        c.title as course_title,
        COUNT(q.question_id) as question_count
      FROM moocs m
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      LEFT JOIN courses c ON m.course_id = c.course_id
      GROUP BY m.mooc_id, m.title, c.course_id, c.title
      HAVING COUNT(q.question_id) > 0
      ORDER BY c.course_id, m.mooc_id
    `);

    console.log('\n📊 Questions by MOOC:');
    byMooc.recordset.forEach(row => {
      console.log(`  Course ${row.course_id} - MOOC ${row.mooc_id} (${row.mooc_title}): ${row.question_count} questions`);
    });

    // Sample questions
    console.log('\n📝 Sample questions (first 5):');
    const sample = await pool.request().query(`
      SELECT TOP 5 question_id, mooc_id, stem, qtype, created_at
      FROM questions
      ORDER BY question_id DESC
    `);
    console.table(sample.recordset);

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkQuestions();
