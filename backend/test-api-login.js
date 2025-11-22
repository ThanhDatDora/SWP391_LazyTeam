// Test API endpoint
async function testAPILogin() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'learner@example.com',
        password: 'Learner@123'
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ API login successful!');
    } else {
      console.log('❌ API login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testAPILogin();