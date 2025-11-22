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

async function checkQuestionCounts() {
  try {
    const pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT 
        c.course_id, 
        c.title, 
        COUNT(DISTINCT q.question_id) as question_count
      FROM courses c
      LEFT JOIN moocs m ON c.course_id = m.course_id
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      GROUP BY c.course_id, c.title
      ORDER BY c.course_id
    `);
    
    console.log('📊 Question Count by Course:\n');
    let total = 0;
    result.recordset.forEach(r => {
      console.log(`  Course ${r.course_id}: ${r.title}`);
      console.log(`    Questions: ${r.question_count}\n`);
      total += r.question_count;
    });
    
    console.log(`\n✅ Total Questions: ${total}`);
    
    await sql.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkQuestionCounts();
