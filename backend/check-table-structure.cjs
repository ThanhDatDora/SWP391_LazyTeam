const path = require('path');

async function checkTableStructure() {
  let pool;
  try {
    // Use shared pool from backend/config/database.js
      const { pathToFileURL } = require('url');
      const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();
    console.log('🔗 Connected to database');

    // Check exams table structure
    console.log('\n📋 EXAMS TABLE STRUCTURE:');
    const examsColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'exams'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('Exams table columns:');
    examsColumns.recordset.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // Check exam_questions table structure  
    console.log('\n❓ EXAM_QUESTIONS TABLE STRUCTURE:');
    const questionsColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'exam_questions'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('Exam_questions table columns:');
    questionsColumns.recordset.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // Check actual data in exams table
    console.log('\n📊 EXAMS DATA:');
    const examsData = await pool.request().query(`SELECT TOP 5 * FROM exams`);
    console.log('Sample exams:');
    examsData.recordset.forEach(exam => {
      console.log(`- Exam ID: ${exam.exam_id}, MOOC: ${exam.mooc_id}`);
    });

    // Check questions count for each exam
    console.log('\n🔢 QUESTIONS COUNT BY EXAM:');
    const questionCounts = await pool.request().query(`
      SELECT e.exam_id, e.mooc_id, COUNT(q.question_id) as question_count
      FROM exams e
      LEFT JOIN exam_questions q ON e.exam_id = q.exam_id
      GROUP BY e.exam_id, e.mooc_id
      ORDER BY e.exam_id
    `);
    console.log('Questions per exam:');
    questionCounts.recordset.forEach(item => {
      console.log(`- Exam ${item.exam_id} (MOOC ${item.mooc_id}): ${item.question_count} questions`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    try {
      if (pool && typeof pool.close === 'function') {
        await pool.close();
      }
    } catch (e) {
      // ignore close errors
    }
  }
}

checkTableStructure();