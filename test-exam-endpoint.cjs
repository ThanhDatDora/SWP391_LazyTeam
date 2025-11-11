const fetch = require('node-fetch');

async function testExamEndpoint() {
  try {
    console.log('🧪 Testing exam endpoint...');
    
    const response = await fetch('http://localhost:3001/api/learning/exams/mooc/9');
    const text = await response.text();
    
    console.log(`📡 Status: ${response.status}`);
    console.log(`📦 Response: ${text}`);
    
    if (response.status === 200) {
      const data = JSON.parse(text);
      console.log('✅ Exam endpoint working!');
      console.log(`📊 Exam data:`, data);
    } else {
      console.log('❌ Exam endpoint failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testExamEndpoint();