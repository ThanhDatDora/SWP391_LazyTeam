const path = require('path');

async function checkCourse9MOOCs() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();
    const sql = dbMod.sql;
    console.log('🔍 Connected to database successfully');

    // Check table structure first
    const tableCheck = `
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME IN ('moocs', 'exams', 'questions')
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;

  const tableResult = await pool.request().query(tableCheck);
    console.log('\n📋 Table structure:');
    console.log('=' .repeat(80));
    
    const tables = {};
    tableResult.recordset.forEach(col => {
      if (!tables[col.TABLE_NAME]) tables[col.TABLE_NAME] = [];
      tables[col.TABLE_NAME].push(`${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    Object.keys(tables).forEach(table => {
      console.log(`${table}:`);
      tables[table].forEach(col => console.log(`  ${col}`));
      console.log('');
    });

    // Get all MOOCs in Course 9
    const moocQuery = `
      SELECT 
        m.mooc_id,
        m.title as mooc_title,
        m.course_id,
        COUNT(q.question_id) as question_count
      FROM moocs m
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      WHERE m.course_id = 9
      GROUP BY m.mooc_id, m.title, m.course_id
      ORDER BY m.mooc_id
    `;

  const result = await pool.request().query(moocQuery);
    
    console.log('\n📚 Course 9 MOOCs and their question count:');
    console.log('=' .repeat(80));
    
    result.recordset.forEach(mooc => {
      console.log(`MOOC ${mooc.mooc_id}: ${mooc.mooc_title}`);
      console.log(`  Questions: ${mooc.question_count}`);
      console.log('  ' + '-'.repeat(60));
    });

    // Check if exams table exists and its structure
    const examTableCheck = `
      SELECT COUNT(*) as table_exists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'exams'
    `;

  const examTableResult = await pool.request().query(examTableCheck);
    
    if (examTableResult.recordset[0].table_exists > 0) {
      console.log('\n🎯 Exams table exists, checking exam records:');
      
      const examQuery = `
        SELECT 
          e.*
        FROM exams e
        JOIN moocs m ON e.mooc_id = m.mooc_id
        WHERE m.course_id = 9
        ORDER BY e.exam_id
      `;

  const examResult = await pool.request().query(examQuery);
      
      examResult.recordset.forEach(exam => {
        console.log(`Exam ${exam.exam_id} (MOOC ${exam.mooc_id})`);
        console.log(`  All fields:`, exam);
        console.log('  ' + '-'.repeat(60));
      });
    } else {
      console.log('\n❌ Exams table does not exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

checkCourse9MOOCs();