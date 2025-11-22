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

async function createExamsForCourses() {
  try {
    console.log('🔄 Creating exams for courses...\n');
    
    const pool = await sql.connect(config);
    
    // Get the FIRST mooc of each course that has questions
    const moocsResult = await pool.request().query(`
      SELECT 
        MIN(m.mooc_id) as mooc_id,
        m.course_id,
        c.title as course_title,
        COUNT(DISTINCT q.question_id) as question_count
      FROM moocs m
      JOIN courses c ON m.course_id = c.course_id
      JOIN questions q ON m.mooc_id = q.mooc_id
      WHERE m.course_id IN (3, 4, 5, 6, 8)
      GROUP BY m.course_id, c.title
      HAVING COUNT(DISTINCT q.question_id) >= 30
      ORDER BY m.course_id
    `);
    
    console.log(`📚 Found ${moocsResult.recordset.length} MOOCs with 30+ questions\n`);
    
    let examCount = 0;
    
    for (const mooc of moocsResult.recordset) {
      // Check if exam already exists
      const existingExam = await pool.request()
        .input('mooc_id', sql.BigInt, mooc.mooc_id)
        .query('SELECT exam_id FROM exams WHERE mooc_id = @mooc_id');
      
      if (existingExam.recordset.length > 0) {
        console.log(`⏭️  Exam already exists for ${mooc.course_title} (MOOC ${mooc.mooc_id})`);
        continue;
      }
      
      // Create exam
      const examResult = await pool.request()
        .input('mooc_id', sql.BigInt, mooc.mooc_id)
        .input('name', sql.NVarChar(255), `${mooc.course_title} - Final Exam`)
        .input('duration_minutes', sql.Int, 45)
        .input('attempts_allowed', sql.Int, 3)
        .query(`
          INSERT INTO exams (mooc_id, name, duration_minutes, attempts_allowed, created_at)
          OUTPUT INSERTED.exam_id
          VALUES (@mooc_id, @name, @duration_minutes, @attempts_allowed, GETDATE())
        `);
      
      const examId = examResult.recordset[0].exam_id;
      
      // Get questions for this course (from ALL moocs)
      const questionsResult = await pool.request()
        .input('course_id', sql.Int, mooc.course_id)
        .query(`
          SELECT TOP 30 q.question_id, q.difficulty
          FROM questions q
          JOIN moocs m ON q.mooc_id = m.mooc_id
          WHERE m.course_id = @course_id
          ORDER BY NEWID()
        `);
      
      // Add questions to exam
      let orderNo = 1;
      for (const question of questionsResult.recordset) {
        let points = 1.0;
        switch (question.difficulty) {
          case 'easy': points = 1.0; break;
          case 'medium': points = 1.5; break;
          case 'hard': points = 2.0; break;
        }
        
        await pool.request()
          .input('exam_id', sql.BigInt, examId)
          .input('question_id', sql.BigInt, question.question_id)
          .input('order_no', sql.Int, orderNo)
          .input('points', sql.Decimal(5, 2), points)
          .query(`
            INSERT INTO exam_items (exam_id, question_id, order_no, points)
            VALUES (@exam_id, @question_id, @order_no, @points)
          `);
        
        orderNo++;
      }
      
      console.log(`✅ Created exam for ${mooc.course_title} (MOOC ${mooc.mooc_id})`);
      console.log(`   Exam ID: ${examId}, Questions: ${questionsResult.recordset.length}\n`);
      examCount++;
    }
    
    await sql.close();
    console.log(`\n🎉 Done! Created ${examCount} exams!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createExamsForCourses();
