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

async function showExamSummary() {
  try {
    const pool = await sql.connect(config);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 NGÂN HÀNG CÂU HỎI VÀ BÀI THI TRẮC NGHIỆM');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Get question stats
    const questionStats = await pool.request().query(`
      SELECT 
        c.course_id,
        c.title,
        COUNT(DISTINCT q.question_id) as total_questions,
        SUM(CASE WHEN q.difficulty = 'easy' THEN 1 ELSE 0 END) as easy_count,
        SUM(CASE WHEN q.difficulty = 'medium' THEN 1 ELSE 0 END) as medium_count,
        SUM(CASE WHEN q.difficulty = 'hard' THEN 1 ELSE 0 END) as hard_count
      FROM courses c
      LEFT JOIN moocs m ON c.course_id = m.course_id
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      GROUP BY c.course_id, c.title
      HAVING COUNT(DISTINCT q.question_id) > 0
      ORDER BY c.course_id
    `);
    
    console.log('📚 NGÂN HÀNG CÂU HỎI THEO KHÓA HỌC:\n');
    let totalQuestions = 0;
    
    for (const course of questionStats.recordset) {
      console.log(`🎓 Course ${course.course_id}: ${course.title}`);
      console.log(`   Tổng số câu hỏi: ${course.total_questions}`);
      console.log(`   - Dễ:      ${course.easy_count} câu`);
      console.log(`   - Trung bình: ${course.medium_count} câu`);
      console.log(`   - Khó:     ${course.hard_count} câu\n`);
      totalQuestions += course.total_questions;
    }
    
    console.log(`✅ Tổng cộng: ${totalQuestions} câu hỏi trong ngân hàng\n`);
    console.log('───────────────────────────────────────────────────────────\n');
    
    // Get exam stats
    const examStats = await pool.request().query(`
      SELECT 
        e.exam_id,
        e.name,
        e.duration_minutes,
        e.attempts_allowed,
        c.course_id,
        c.title as course_title,
        COUNT(ei.question_id) as question_count,
        SUM(ei.points) as total_points
      FROM exams e
      JOIN moocs m ON e.mooc_id = m.mooc_id
      JOIN courses c ON m.course_id = c.course_id
      LEFT JOIN exam_items ei ON e.exam_id = ei.exam_id
      GROUP BY e.exam_id, e.name, e.duration_minutes, e.attempts_allowed, c.course_id, c.title
      ORDER BY c.course_id
    `);
    
    console.log('📝 BÀI THI TRẮC NGHIỆM ĐÃ TẠO:\n');
    
    for (const exam of examStats.recordset) {
      console.log(`🎯 ${exam.name}`);
      console.log(`   Exam ID: ${exam.exam_id}`);
      console.log(`   Số câu hỏi: ${exam.question_count} câu`);
      console.log(`   Tổng điểm: ${exam.total_points} điểm`);
      console.log(`   Thời gian: ${exam.duration_minutes} phút`);
      console.log(`   Số lần thi: ${exam.attempts_allowed} lần\n`);
    }
    
    console.log(`✅ Tổng cộng: ${examStats.recordset.length} bài thi\n`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 SẴN SÀNG CHO HỌC VIÊN BẮT ĐẦU THI!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📌 HƯỚNG DẪN SỬ DỤNG:');
    console.log('1. Học viên enrolled khóa học');
    console.log('2. Vào trang /exam/:examId');
    console.log('3. Click "Bắt đầu thi"');
    console.log('4. Hệ thống random 30 câu hỏi từ ngân hàng');
    console.log('5. Tự động chấm điểm sau khi nộp bài');
    console.log('6. Xem kết quả chi tiết tại /exam-results/:instanceId\n');
    
    await sql.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

showExamSummary();
