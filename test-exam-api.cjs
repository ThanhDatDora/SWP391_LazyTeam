// Simple Node.js test for exam API flow
const http = require('http');

const baseUrl = 'localhost';
const port = 3001;
const examId = 53;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: port,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  try {
    console.log('=== Testing Exam API Flow ===\n');

    // Step 1: Start exam
    console.log(`Step 1: POST /learning/exams/${examId}/start`);
    const startRes = await makeRequest('POST', `/learning/exams/${examId}/start`);
    console.log(`Status: ${startRes.status}`);
    console.log('Response:', JSON.stringify(startRes.data, null, 2));
    
    if (!startRes.data.success) {
      console.error('Failed to start exam:', startRes.data.error);
      return;
    }

    const attemptId = startRes.data.data.attempt_id;
    const questions = startRes.data.data.questions;
    
    console.log(`\nAttempt ID: ${attemptId}`);
    console.log(`Questions: ${questions.length}\n`);

    // Step 2: Prepare answers (select first option for each)
    const answers = questions.map(q => ({
      question_id: q.question_id,
      selected_option: q.options[0].label
    }));

    // Step 3: Submit exam
    console.log(`Step 2: POST /learning/exams/${examId}/submit`);
    const submitRes = await makeRequest('POST', `/learning/exams/${examId}/submit`, {
      attempt_id: parseInt(attemptId),
      answers: answers
    });
    console.log(`Status: ${submitRes.status}`);
    console.log('Response:', JSON.stringify(submitRes.data, null, 2));

    if (!submitRes.data.success) {
      console.error('Failed to submit exam:', submitRes.data.error);
      return;
    }

    const resultAttemptId = submitRes.data.data.attempt_id;
    
    // Step 4: Fetch result
    console.log(`\nStep 3: GET /learning/exams/attempts/${resultAttemptId}/result`);
    const resultRes = await makeRequest('GET', `/learning/exams/attempts/${resultAttemptId}/result`);
    console.log(`Status: ${resultRes.status}`);
    console.log('Response:', JSON.stringify(resultRes.data, null, 2));

    console.log('\n=== Test Complete ===');
    console.log(`Final Score: ${submitRes.data.data.score}`);
    console.log(`Passed: ${submitRes.data.data.passed}`);
    console.log(`Correct: ${submitRes.data.data.correct_answers}/${submitRes.data.data.total_questions}`);

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
