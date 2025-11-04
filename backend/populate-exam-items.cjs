/**
 * Populate exam_items table
 * Links questions to exams via exam_items junction table
 */

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

async function populateExamItems() {
  let pool;
  
  try {
    console.log('🔧 Populating exam_items table...\n');
    
    pool = await sql.connect(config);
    
    // Get all exams
    const exams = await pool.request().query(`
      SELECT e.exam_id, e.mooc_id, m.title as mooc_title
      FROM exams e
      JOIN moocs m ON e.mooc_id = m.mooc_id
      WHERE m.course_id BETWEEN 2 AND 8
      ORDER BY e.exam_id
    `);
    
    console.log(`Found ${exams.recordset.length} exams to process\n`);
    
    let totalAdded = 0;
    
    for (const exam of exams.recordset) {
      console.log(`📝 Processing: MOOC ${exam.mooc_id} - ${exam.mooc_title}`);
      
      // Check existing items
      const existing = await pool.request()
        .input('exam_id', sql.BigInt, exam.exam_id)
        .query(`
          SELECT COUNT(*) as count
          FROM exam_items
          WHERE exam_id = @exam_id
        `);
      
      if (existing.recordset[0].count > 0) {
        console.log(`   ⚠️  Already has ${existing.recordset[0].count} items, skipping\n`);
        continue;
      }
      
      // Get questions for this MOOC (limit to 10 questions per exam)
      const questions = await pool.request()
        .input('mooc_id', sql.BigInt, exam.mooc_id)
        .query(`
          SELECT TOP 10 question_id
          FROM questions
          WHERE mooc_id = @mooc_id
          ORDER BY NEWID()
        `);
      
      if (questions.recordset.length === 0) {
        console.log(`   ❌ No questions found for this MOOC\n`);
        continue;
      }
      
      // Insert into exam_items
      let itemsAdded = 0;
      for (let i = 0; i < questions.recordset.length; i++) {
        await pool.request()
          .input('exam_id', sql.BigInt, exam.exam_id)
          .input('question_id', sql.BigInt, questions.recordset[i].question_id)
          .input('order_no', sql.Int, i + 1)
          .input('points', sql.Decimal(5, 2), 10.0)
          .query(`
            INSERT INTO exam_items (exam_id, question_id, order_no, points)
            VALUES (@exam_id, @question_id, @order_no, @points)
          `);
        itemsAdded++;
      }
      
      console.log(`   ✅ Added ${itemsAdded} questions\n`);
      totalAdded += itemsAdded;
    }
    
    console.log('═'.repeat(60));
    console.log(`✅ COMPLETED! Added ${totalAdded} exam items total\n`);
    
    // Verify
    const verification = await pool.request().query(`
      SELECT 
        e.exam_id,
        m.mooc_id,
        m.title as mooc_title,
        COUNT(ei.question_id) as question_count
      FROM exams e
      JOIN moocs m ON e.mooc_id = m.mooc_id
      LEFT JOIN exam_items ei ON e.exam_id = ei.exam_id
      WHERE m.course_id BETWEEN 2 AND 8
      GROUP BY e.exam_id, m.mooc_id, m.title
      ORDER BY m.mooc_id
    `);
    
    console.log('📊 Verification - Questions per exam:');
    verification.recordset.forEach(row => {
      const status = row.question_count >= 10 ? '✅' : '⚠️';
      console.log(`  ${status} MOOC ${row.mooc_id}: ${row.question_count} questions`);
    });
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

populateExamItems();
