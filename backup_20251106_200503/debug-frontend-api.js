// Test script to debug frontend API call
// Run in browser console to debug exam API

console.log('🔍 DEBUGGING EXAM API CALL');

// Check token
const token = localStorage.getItem('authToken');
console.log('📝 Token:', token ? 'EXISTS' : 'MISSING');

// Test API call
async function testExamAPI() {
  try {
    console.log('🚀 Testing API call for MOOC 53...');
        
    const response = await fetch('http://localhost:3001/api/learning/exams/mooc/53', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
        
    console.log('📊 Response Status:', response.status);
        
    const data = await response.json();
    console.log('📋 Response Data:', data);
        
    if (data.success) {
      console.log('✅ API Success!');
      console.log('🔢 Total Questions:', data.data.total_questions);
      console.log('📚 Exam Data:', data.data);
    } else {
      console.log('❌ API Error:', data.error);
    }
        
  } catch (error) {
    console.error('❌ Fetch Error:', error);
  }
}

// Auto run
testExamAPI();