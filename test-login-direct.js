// Direct test of login API
// Node.js v18+ has built-in fetch

async function testLogin() {
  console.log('🧪 Testing login API directly...\n');
  
  const credentials = {
    email: 'learner@example.com',
    password: 'Learner@123'
  };
  
  console.log('📤 Sending credentials:', { email: credentials.email, password: '***' });
  console.log('📤 Request body:', JSON.stringify(credentials));
  console.log('📤 Body length:', JSON.stringify(credentials).length);
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\n📥 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login test PASSED');
    } else {
      console.log('\n❌ Login test FAILED');
      console.log('Error:', data.message);
      if (data.errors) {
        console.log('Validation errors:', data.errors);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testLogin();
