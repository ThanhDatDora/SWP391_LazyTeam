// Simple API connection test
console.log('🔍 Testing API connection...');

const API_BASE_URL = 'http://localhost:3001/api';

// Test health endpoint
fetch(`${API_BASE_URL}/health`)
  .then(response => {
    console.log('✅ Health check response:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Health data:', data);
  })
  .catch(error => {
    console.error('❌ Health check failed:', error);
  });

// Test login endpoint with dummy data
const testLogin = async () => {
  try {
    console.log('🔐 Testing login endpoint...');
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    console.log('🔐 Login response status:', response.status);
    const data = await response.json();
    console.log('🔐 Login response data:', data);
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
};

// Run tests
setTimeout(testLogin, 1000);