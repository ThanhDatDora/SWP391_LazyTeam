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

async function checkAllMoocsQuestions() {
  try {
    const pool = await sql.connect(config);
    
    // Get all MOOCs for course 9 (Photography) with question counts
    const result = await pool.request()
      .input('courseId', sql.BigInt, 9)
      .query(`
        SELECT 
          m.mooc_id,
          m.title,
          m.order_no,
          COUNT(q.question_id) as question_count
        FROM moocs m
        LEFT JOIN questions q ON m.mooc_id = q.mooc_id
        WHERE m.course_id = @courseId
        GROUP BY m.mooc_id, m.title, m.order_no
        ORDER BY m.order_no
      `);
    
    console.log('\n📊 Course 9 (Photography) - MOOCs and Questions:');
    console.log('='.repeat(80));
    
    result.recordset.forEach(mooc => {
      const status = mooc.question_count > 0 ? '✅' : '❌';
      console.log(`${status} MOOC ${mooc.mooc_id}: ${mooc.title}`);
      console.log(`   Order: ${mooc.order_no}, Questions: ${mooc.question_count}`);
    });
    
    // Check which MOOCs have questions
    const withQuestions = result.recordset.filter(m => m.question_count > 0);
    const withoutQuestions = result.recordset.filter(m => m.question_count === 0);
    
    console.log('\n\n📈 Summary:');
    console.log('='.repeat(80));
    console.log(`Total MOOCs: ${result.recordset.length}`);
    console.log(`With questions: ${withQuestions.length}`);
    console.log(`Without questions: ${withoutQuestions.length}`);
    
    if (withoutQuestions.length > 0) {
      console.log('\n❌ MOOCs WITHOUT questions (need to copy from another MOOC):');
      withoutQuestions.forEach(m => {
        console.log(`   - MOOC ${m.mooc_id}: ${m.title}`);
      });
      
      if (withQuestions.length > 0) {
        console.log(`\n💡 Solution: Copy questions from MOOC ${withQuestions[0].mooc_id} (${withQuestions[0].question_count} questions)`);
      }
    }
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkAllMoocsQuestions();
