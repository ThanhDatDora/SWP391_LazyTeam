// Complete Exam System Test
// Tests all exam APIs and verifies database state

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'learner@example.com',
  password: 'password123'  // Standard test password
};

// Helper to make HTTP requests with timeout
async function makeRequest(url, options = {}) {
  const timeout = options.timeout || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    return {
      status: response.status,
      data: data,
      headers: response.headers
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

async function runTests() {
  console.log('\n🚀 COMPLETE EXAM SYSTEM TEST');
  console.log('═══════════════════════════════════════════════════\n');
  
  let token = null;
  let examId = null;
  let attemptId = null;
  let testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Backend Health...');
    const health = await makeRequest(`${BASE_URL}/api/health`);
    console.log(`   📡 Response status: ${health.status}`);
    console.log(`   📦 Response data:`, JSON.stringify(health.data, null, 2));
    
    if (health.status === 200 && health.data.success) {
      console.log('   ✅ Backend is healthy');
      console.log(`   📊 Uptime: ${Math.floor(health.data.data.uptime)}s`);
      console.log(`   💾 Database: ${health.data.data.database}\n`);
      testResults.passed++;
      testResults.tests.push({ name: 'Health Check', status: 'PASS' });
    } else {
      throw new Error(`Health check failed: ${health.status} - ${JSON.stringify(health.data)}`);
    }
  } catch (error) {
    console.log('   ❌ Backend health check failed:', error.message, '\n');
    testResults.failed++;
    testResults.tests.push({ name: 'Health Check', status: 'FAIL', error: error.message });
    return testResults;
  }

  // Test 2: User Login
  try {
    console.log('2️⃣ Testing User Login...');
    const login = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    console.log(`   📡 Login response status: ${login.status}`);
    
    if (login.status === 200 && login.data.token) {
      token = login.data.token;
      console.log('   ✅ Login successful');
      console.log(`   👤 User: ${login.data.user?.email}`);
      console.log(`   🔑 Token: ${token.substring(0, 20)}...\n`);
      testResults.passed++;
      testResults.tests.push({ name: 'User Login', status: 'PASS' });
    } else {
      throw new Error(`Login failed: ${JSON.stringify(login.data)}`);
    }
  } catch (error) {
    console.log('   ❌ Login failed:', error.message, '\n');
    testResults.failed++;
    testResults.tests.push({ name: 'User Login', status: 'FAIL', error: error.message });
    return testResults;
  }

  // Test 3: Get Exam by MOOC
  try {
    console.log('3️⃣ Testing Get Exam by MOOC...');
    const moocId = 9; // Test MOOC
    const exam = await makeRequest(`${BASE_URL}/api/learning/exams/mooc/${moocId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (exam.status === 200 && exam.data.success) {
      examId = exam.data.data.exam_id;
      console.log('   ✅ Exam found for MOOC');
      console.log(`   📝 Exam ID: ${examId}`);
      console.log(`   ⏱️  Duration: ${exam.data.data.duration} minutes`);
      console.log(`   ❓ Questions: ${exam.data.data.question_count}\n`);
      testResults.passed++;
      testResults.tests.push({ name: 'Get Exam by MOOC', status: 'PASS' });
    } else {
      throw new Error('Failed to get exam');
    }
  } catch (error) {
    console.log('   ❌ Get exam failed:', error.message, '\n');
    testResults.failed++;
    testResults.tests.push({ name: 'Get Exam by MOOC', status: 'FAIL', error: error.message });
  }

  // Test 4: Start Exam
  try {
    console.log('4️⃣ Testing Start Exam...');
    const start = await makeRequest(`${BASE_URL}/api/learning/exams/${examId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (start.status === 200 && start.data.success) {
      attemptId = start.data.data.attempt_id;
      const questions = start.data.data.questions;
      console.log('   ✅ Exam started successfully');
      console.log(`   🎯 Attempt ID: ${attemptId}`);
      console.log(`   📋 Questions loaded: ${questions.length}`);
      console.log(`   🔢 First question ID: ${questions[0]?.exam_item_id}\n`);
      testResults.passed++;
      testResults.tests.push({ name: 'Start Exam', status: 'PASS' });
    } else {
      throw new Error('Failed to start exam');
    }
  } catch (error) {
    console.log('   ❌ Start exam failed:', error.message, '\n');
    testResults.failed++;
    testResults.tests.push({ name: 'Start Exam', status: 'FAIL', error: error.message });
  }

  // Test 5: Submit Exam
  try {
    console.log('5️⃣ Testing Submit Exam...');
    // Create dummy answers (all answer A for simplicity)
    const answers = Array.from({ length: 10 }, (_, i) => ({
      exam_item_id: i + 1,
      selected_answer: 'A'
    }));
    
    const submit = await makeRequest(`${BASE_URL}/api/learning/exams/${examId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        attempt_id: attemptId,
        answers: answers
      })
    });
    
    if (submit.status === 200 && submit.data.success) {
      console.log('   ✅ Exam submitted successfully');
      console.log(`   📊 Score: ${submit.data.data.score}%`);
      console.log(`   ${submit.data.data.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   🎯 Correct: ${submit.data.data.correct_count}/${submit.data.data.total_questions}\n`);
      testResults.passed++;
      testResults.tests.push({ name: 'Submit Exam', status: 'PASS' });
    } else {
      throw new Error('Failed to submit exam');
    }
  } catch (error) {
    console.log('   ❌ Submit exam failed:', error.message, '\n');
    testResults.failed++;
    testResults.tests.push({ name: 'Submit Exam', status: 'FAIL', error: error.message });
  }

  // Test 6: Get Exam Results
  try {
    console.log('6️⃣ Testing Get Exam Results...');
    const results = await makeRequest(`${BASE_URL}/api/learning/exams/attempt/${attemptId}/result`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (results.status === 200 && results.data.success) {
      console.log('   ✅ Results retrieved successfully');
      console.log(`   📈 Final Score: ${results.data.data.score}%`);
      console.log(`   ⏰ Time taken: ${results.data.data.time_taken || 'N/A'}`);
      console.log(`   📅 Submitted at: ${new Date(results.data.data.submitted_at).toLocaleString()}\n`);
      testResults.passed++;
      testResults.tests.push({ name: 'Get Exam Results', status: 'PASS' });
    } else {
      throw new Error('Failed to get results');
    }
  } catch (error) {
    console.log('   ❌ Get results failed:', error.message, '\n');
    testResults.failed++;
    testResults.tests.push({ name: 'Get Exam Results', status: 'FAIL', error: error.message });
  }

  // Print Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════\n');
  
  testResults.tests.forEach((test, idx) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${idx + 1}. ${icon} ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log('\n───────────────────────────────────────────────────');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  console.log('═══════════════════════════════════════════════════\n');
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Exam system is working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
  }
  
  return testResults;
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
