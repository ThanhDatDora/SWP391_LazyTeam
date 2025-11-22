const BASE = "http://localhost:3001/api";

async function testExamAPIs() {
  try {
    console.log("\n ===== TESTING EXAM APIs =====\n");

    // 1. Login
    console.log("1 Login...");
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test-learner@exam.com", password: "test123" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token; // FIXED: direct .token, not .data.token
    console.log(" Logged in");

    const headers = { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    // 2. Get exam info
    console.log("\n2 Get exam info for MOOC 3...");
    const examInfoRes = await fetch(`${BASE}/learning/exams/mooc/3`, { headers });
    const examInfo = await examInfoRes.json();
    console.log(" Exam info:", JSON.stringify(examInfo, null, 2));

    // 3. Start exam
    console.log("\n3 Start exam...");
    const startRes = await fetch(`${BASE}/learning/exams/3/start`, { method: "POST", headers });
    const startData = await startRes.json();
    console.log(" Started:", {
      attempt_id: startData.data.attempt_id,
      questions: startData.data.questions.length
    });

    const attemptId = startData.data.attempt_id;
    const questions = startData.data.questions;

    // 4. Submit
    console.log("\n4 Submit exam...");
    const answers = questions.map(q => ({
      question_id: q.question_id,
      selected_option: q.options[0]?.label || "A"
    }));

    const submitRes = await fetch(`${BASE}/learning/exams/3/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ attempt_id: attemptId, answers })
    });
    const submitData = await submitRes.json();
    console.log(" Submitted:", {
      score: submitData.data.score,
      passed: submitData.data.passed
    });

    // 5. Result
    console.log("\n5 Get result...");
    const resultRes = await fetch(`${BASE}/learning/exams/attempts/${attemptId}/result`, { headers });
    const resultData = await resultRes.json();
    console.log(" Result:", {
      score: resultData.data.score,
      correct: resultData.data.correct_answers,
      total: resultData.data.total_questions
    });

    // 6. Progress
    console.log("\n6 Course progress...");
    const progressRes = await fetch(`${BASE}/learning/exams/course/2/progress`, { headers });
    const progressData = await progressRes.json();
    console.log(" Progress:", JSON.stringify(progressData, null, 2));

    console.log("\n ===== ALL TESTS PASSED! =====\n");

  } catch (error) {
    console.error("\n Failed:", error.message);
    console.error(error.stack);
  }
}

testExamAPIs();
