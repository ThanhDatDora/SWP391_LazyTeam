console.log('🧪 Testing Exam API Endpoints via HTTP\n');

const API_BASE = 'http://localhost:3001/api/exams';
let instanceId = null;
let questionIds = [];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPIs() {
  try {
    // Test 1: Start Exam
    console.log('1️⃣ Testing POST /api/exams/:examId/start');
    const startResponse = await fetch(`${API_BASE}/7/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 5 })
    });
    
    if (!startResponse.ok) {
      const error = await startResponse.json();
      throw new Error(`Start exam failed: ${error.error}`);
    }
    
    const startData = await startResponse.json();
    instanceId = startData.instanceId;
    questionIds = startData.questions || [];
    
    console.log(`✅ Exam started successfully`);
    console.log(`   Instance ID: ${instanceId}`);
    console.log(`   Questions: ${questionIds.length}`);
    console.log(`   Start Time: ${startData.startTime}\n`);
    
    await delay(500);

    // Test 2: Get Instance
    console.log('2️⃣ Testing GET /api/exams/instances/:instanceId');
    const instanceResponse = await fetch(`${API_BASE}/instances/${instanceId}`);
    
    if (!instanceResponse.ok) {
      throw new Error('Get instance failed');
    }
    
    const instanceData = await instanceResponse.json();
    console.log(`✅ Instance retrieved successfully`);
    console.log(`   Questions loaded: ${instanceData.questions?.length || 0}`);
    console.log(`   First question stem: ${instanceData.questions?.[0]?.stem?.substring(0, 50)}...`);
    console.log(`   Options per question: ${instanceData.questions?.[0]?.options?.length || 0}\n`);
    
    await delay(500);

    // Test 3: Save Answer
    console.log('3️⃣ Testing POST /api/exams/instances/:instanceId/answer');
    
    if (instanceData.questions && instanceData.questions.length > 0) {
      const firstQuestion = instanceData.questions[0];
      const firstOption = firstQuestion.options?.[0];
      
      if (firstOption) {
        const answerResponse = await fetch(`${API_BASE}/instances/${instanceId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: firstQuestion.question_id,
            selectedOptions: [firstOption.option_id],
            timeRemainingSeconds: 3500
          })
        });
        
        if (!answerResponse.ok) {
          const error = await answerResponse.json();
          throw new Error(`Save answer failed: ${error.error}`);
        }
        
        const answerData = await answerResponse.json();
        console.log(`✅ Answer saved successfully`);
        console.log(`   Question ID: ${firstQuestion.question_id}`);
        console.log(`   Selected option: ${firstOption.option_id}\n`);
      }
    }
    
    await delay(500);

    // Test 4: Submit Exam
    console.log('4️⃣ Testing POST /api/exams/instances/:instanceId/submit');
    const submitResponse = await fetch(`${API_BASE}/instances/${instanceId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(`Submit failed: ${error.error}`);
    }
    
    const submitData = await submitResponse.json();
    console.log(`✅ Exam submitted successfully`);
    console.log(`   Score: ${submitData.score}/${submitData.maxScore}`);
    console.log(`   Percentage: ${submitData.percentage}%`);
    console.log(`   Correct answers: ${submitData.correctCount}\n`);
    
    await delay(500);

    // Test 5: Get Results
    console.log('5️⃣ Testing GET /api/exams/instances/:instanceId/results');
    const resultsResponse = await fetch(`${API_BASE}/instances/${instanceId}/results`);
    
    if (!resultsResponse.ok) {
      throw new Error('Get results failed');
    }
    
    const resultsData = await resultsResponse.json();
    console.log(`✅ Results retrieved successfully`);
    console.log(`   Final score: ${resultsData.score}/${resultsData.maxScore} (${resultsData.percentage}%)`);
    console.log(`   Questions with results: ${resultsData.questions?.length || 0}\n`);

    // Success!
    console.log('🎉 ALL API TESTS PASSED!\n');
    console.log('📊 Test Results Summary:');
    console.log('   ✅ POST /api/exams/:examId/start - Working');
    console.log('   ✅ GET /api/exams/instances/:instanceId - Working');
    console.log('   ✅ POST /api/exams/instances/:instanceId/answer - Working');
    console.log('   ✅ POST /api/exams/instances/:instanceId/submit - Working');
    console.log('   ✅ GET /api/exams/instances/:instanceId/results - Working');
    console.log(`\n🆔 Test Instance ID: ${instanceId}`);

  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testAPIs().then(() => {
  console.log('\n✨ All tests completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
