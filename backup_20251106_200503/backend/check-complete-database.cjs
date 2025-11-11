const path = require('path');

async function checkCompleteDatabase() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    console.log('🔍 Kết nối database thành công');

    // 1. Kiểm tra structure các bảng quan trọng
    console.log('\n📋 1. CẤU TRÚC CÁC BẢNG QUAN TRỌNG:');
    console.log('=' .repeat(80));
    
    const tableStructure = `
      SELECT 
        t.TABLE_NAME,
        c.COLUMN_NAME,
        c.DATA_TYPE,
        c.IS_NULLABLE,
        c.COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.TABLES t
      JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
      WHERE t.TABLE_NAME IN ('courses', 'moocs', 'exams', 'questions', 'question_options', 'exam_attempts')
      ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION
    `;

    const structure = await pool.request().query(tableStructure);
    let currentTable = '';
    structure.recordset.forEach(col => {
      if (col.TABLE_NAME !== currentTable) {
        currentTable = col.TABLE_NAME;
        console.log(`\n🗃️  ${currentTable.toUpperCase()}:`);
      }
      console.log(`   ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // 2. Kiểm tra Course 9 và các MOOC
    console.log('\n📚 2. COURSE 9 VÀ CÁC MOOC:');
    console.log('=' .repeat(80));
    
    const courseQuery = `
      SELECT 
        c.course_id,
        c.title as course_title,
        COUNT(m.mooc_id) as total_moocs
      FROM courses c
      LEFT JOIN moocs m ON c.course_id = m.course_id
      WHERE c.course_id = 9
      GROUP BY c.course_id, c.title
    `;

    const courseResult = await pool.request().query(courseQuery);
    courseResult.recordset.forEach(course => {
      console.log(`Course ${course.course_id}: ${course.course_title}`);
      console.log(`  Tổng số MOOCs: ${course.total_moocs}`);
    });

    // 3. Chi tiết từng MOOC trong Course 9
    console.log('\n🎯 3. CHI TIẾT TỪNG MOOC TRONG COURSE 9:');
    console.log('=' .repeat(80));
    
    const moocDetailQuery = `
      SELECT 
        m.mooc_id,
        m.title as mooc_title,
        m.order_no,
        COUNT(DISTINCT q.question_id) as question_count,
        COUNT(DISTINCT l.lesson_id) as lesson_count,
        e.exam_id,
        e.name as exam_name,
        e.duration_minutes
      FROM moocs m
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      LEFT JOIN lessons l ON m.mooc_id = l.mooc_id
      LEFT JOIN exams e ON m.mooc_id = e.mooc_id
      WHERE m.course_id = 9
      GROUP BY m.mooc_id, m.title, m.order_no, e.exam_id, e.name, e.duration_minutes
      ORDER BY m.order_no, m.mooc_id
    `;

    const moocDetails = await pool.request().query(moocDetailQuery);
    moocDetails.recordset.forEach(mooc => {
      console.log(`\nMOOC ${mooc.mooc_id}: ${mooc.mooc_title} (Thứ tự: ${mooc.order_no})`);
      console.log(`  📝 Câu hỏi: ${mooc.question_count}`);
      console.log(`  📖 Bài học: ${mooc.lesson_count}`);
      console.log(`  🎯 Exam: ${mooc.exam_id ? `${mooc.exam_name} (${mooc.duration_minutes} phút)` : 'CHƯA CÓ'}`);
    });

    // 4. Kiểm tra chi tiết câu hỏi của từng MOOC
    console.log('\n❓ 4. CHI TIẾT CÂU HỎI THEO TỪNG MOOC:');
    console.log('=' .repeat(80));
    
    const questionQuery = `
      SELECT 
        m.mooc_id,
        m.title as mooc_title,
        q.question_id,
        q.stem,
        q.qtype,
        q.difficulty,
        COUNT(qo.option_id) as option_count
      FROM moocs m
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      LEFT JOIN question_options qo ON q.question_id = qo.question_id
      WHERE m.course_id = 9 AND q.question_id IS NOT NULL
      GROUP BY m.mooc_id, m.title, q.question_id, q.stem, q.qtype, q.difficulty
      ORDER BY m.mooc_id, q.question_id
    `;

    const questions = await pool.request().query(questionQuery);
    let currentMooc = null;
    questions.recordset.forEach(q => {
      if (q.mooc_id !== currentMooc) {
        currentMooc = q.mooc_id;
        console.log(`\n📚 MOOC ${q.mooc_id}: ${q.mooc_title}`);
      }
      console.log(`  Q${q.question_id} (${q.qtype}): ${q.stem.substring(0, 80)}...`);
      console.log(`    Độ khó: ${q.difficulty}, Options: ${q.option_count}`);
    });

    // 5. Kiểm tra exam table mapping
    console.log('\n🎯 5. MAPPING EXAM TABLE:');
    console.log('=' .repeat(80));
    
    const examMappingQuery = `
      SELECT 
        e.exam_id,
        e.mooc_id,
        m.title as mooc_title,
        e.name as exam_name,
        e.duration_minutes,
        e.attempts_allowed,
        COUNT(q.question_id) as question_count_via_mooc
      FROM exams e
      JOIN moocs m ON e.mooc_id = m.mooc_id
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      WHERE m.course_id = 9
      GROUP BY e.exam_id, e.mooc_id, m.title, e.name, e.duration_minutes, e.attempts_allowed
      ORDER BY e.exam_id
    `;

    const examMapping = await pool.request().query(examMappingQuery);
    examMapping.recordset.forEach(exam => {
      console.log(`Exam ${exam.exam_id} -> MOOC ${exam.mooc_id}: ${exam.mooc_title}`);
      console.log(`  Tên exam: ${exam.exam_name}`);
      console.log(`  Thời gian: ${exam.duration_minutes} phút, Attempts: ${exam.attempts_allowed}`);
      console.log(`  Câu hỏi qua MOOC: ${exam.question_count_via_mooc}`);
    });

    // 6. Kiểm tra API query chính xác
    console.log('\n🔍 6. KIỂM TRA API QUERY:');
    console.log('=' .repeat(80));
    
    for (const moocId of [52, 53, 54, 55, 56]) {
      const apiQuery = `
        SELECT COUNT(q.question_id) as total 
        FROM questions q
        WHERE q.mooc_id = ${moocId}
      `;
      
      const apiResult = await pool.request().query(apiQuery);
      console.log(`MOOC ${moocId}: ${apiResult.recordset[0].total} questions (API query)`);
    }

    // 7. Kiểm tra có exam attempts nào không
    console.log('\n📊 7. EXAM ATTEMPTS:');
    console.log('=' .repeat(80));
    
    const attemptsQuery = `
      SELECT 
        ea.attempt_id,
        ea.user_id,
        ea.mooc_id,
        m.title as mooc_title,
        ea.score,
        ea.passed,
        ea.submitted_at
      FROM exam_attempts ea
      JOIN moocs m ON ea.mooc_id = m.mooc_id
      WHERE m.course_id = 9
      ORDER BY ea.submitted_at DESC
    `;

    const attempts = await pool.request().query(attemptsQuery);
    if (attempts.recordset.length > 0) {
      attempts.recordset.forEach(attempt => {
        console.log(`Attempt ${attempt.attempt_id}: User ${attempt.user_id} -> MOOC ${attempt.mooc_id} (${attempt.mooc_title})`);
        console.log(`  Score: ${attempt.score}, Passed: ${attempt.passed}, Date: ${attempt.submitted_at}`);
      });
    } else {
      console.log('Chưa có exam attempts nào');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

checkCompleteDatabase();