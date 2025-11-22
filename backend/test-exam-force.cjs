const BASE = "http://localhost:3001/api";

async function testExamAPIs() {
  try {
    console.log("\n🔬 ===== FORCE TESTING EXAM APIs (SKIP LESSON CHECK) =====\n");

    // 1. Login
    console.log("1️⃣ Login...");
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test-learner@exam.com", password: "test123" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("✅ Logged in");

    const headers = { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    //2. Complete all lessons for MOOC 3 (force)
    console.log("\n2️⃣ Force completing lessons for MOOC 3...");
    const sql = require('mssql');
    const config = {
      server: 'localhost',
      database: 'MiniCoursera_Primary',
      user: 'sa',
      password: '123456',
      options: { encrypt: false, trustServerCertificate: true }
    };
    
    const pool = await sql.connect(config);
    
    // Get all lessons for MOOC 3
    const lessons = await pool.request()
      .query('SELECT lesson_id FROM lessons WHERE mooc_id = 3');
    
    console.log(`   Found ${lessons.recordset.length} lessons`);
    
    // Mark all as completed
    for (const lesson of lessons.recordset) {
      await pool.request()
        .query(`
          MERGE INTO progress AS target
          USING (SELECT ${lesson.lesson_id} AS lesson_id, 15 AS user_id) AS source
          ON target.lesson_id = source.lesson_id AND target.user_id = source.user_id
          WHEN MATCHED THEN
            UPDATE SET is_completed = 1, updated_at = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (user_id, lesson_id, is_completed, last_position_sec, updated_at)
            VALUES (15, ${lesson.lesson_id}, 1, 0, GETDATE());
        `);
    }
    console.log("✅ All lessons marked complete");

    // 3. Get exam info again
    console.log("\n3️⃣ Get exam info (should show can_take_exam=true)...");
    const examInfoRes = await fetch(`${BASE}/learning/exams/mooc/3`, { headers });
    const examInfo = await examInfoRes.json();
    console.log(`   Can take exam: ${examInfo.data.can_take_exam}`);
    console.log(`   Lessons completed: ${examInfo.data.lessons_completed}/${examInfo.data.total_lessons}`);

    if (!examInfo.data.can_take_exam) {
      console.log("❌ Still cannot take exam!");
      process.exit(1);
    }

    // 4. Start exam
    console.log("\n4️⃣ Start exam...");
    const startRes = await fetch(`${BASE}/learning/exams/3/start`, { method: "POST", headers });
    const startData = await startRes.json();
    
    if (!startData.success) {
      console.log("❌ Start failed:", startData.error);
      process.exit(1);
    }

    console.log("✅ Started:", {
      attempt_id: startData.data.attempt_id,
      questions: startData.data.questions.length
    });

    const attemptId = startData.data.attempt_id;
    const questions = startData.data.questions;

    // 5. Submit (answer all with option A)
    console.log("\n5️⃣ Submit exam...");
    const answers = questions.map(q => ({
      question_id: q.question_id,
      selected_option: "A"
    }));

    const submitRes = await fetch(`${BASE}/learning/exams/3/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ attempt_id: attemptId, answers })
    });
    const submitData = await submitRes.json();
    
    if (!submitData.success) {
      console.log("❌ Submit failed:", submitData.error);
      process.exit(1);
    }

    console.log("✅ Submitted:", {
      score: submitData.data.score,
      passed: submitData.data.passed,
      correct: submitData.data.correct_answers,
      total: submitData.data.total_questions
    });

    // 6. Get result
    console.log("\n6️⃣ Get result details...");
    const resultRes = await fetch(`${BASE}/learning/exams/attempts/${attemptId}/result`, { headers });
    const resultData = await resultRes.json();
    
    if (!resultData.success) {
      console.log("❌ Result failed:", resultData.error);
      process.exit(1);
    }

    console.log("✅ Result:", {
      score: resultData.data.score,
      correct: resultData.data.correct_answers,
      total: resultData.data.total_questions,
      answers_count: resultData.data.answers.length
    });

    // 7. Course progress
    console.log("\n7️⃣ Course progress...");
    const progressRes = await fetch(`${BASE}/learning/exams/course/2/progress`, { headers });
    const progressData = await progressRes.json();
    
    if (!progressData.success) {
      console.log("❌ Progress failed:", progressData.error);
      process.exit(1);
    }

    console.log("✅ Progress:", {
      moocs_count: progressData.data.moocs.length,
      moocs_completed: progressData.data.moocs_completed,
      overall_score: progressData.data.overall_score
    });

    console.log("\n🎉 ===== ALL TESTS PASSED! =====\n");

    await pool.close();
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testExamAPIs();
