// Simple API test utility
const API_BASE_URL = 'http://localhost:3001/api';

export const testApiConnection = async () => {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test 1: Health check
    console.log('📊 Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Test auth endpoint structure
    console.log('🔐 Testing auth endpoint (should get validation error)...');
    const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({}) // Empty body should trigger validation error
    });
    
    const authResult = await authResponse.json();
    console.log('🔐 Auth test response:', authResult);
    
    if (authResult.message && authResult.message.includes('Validation')) {
      console.log('✅ Auth endpoint is working (got expected validation error)');
      return { success: true, message: 'API connection successful' };
    } else {
      console.log('⚠️ Auth endpoint response unexpected:', authResult);
      return { success: false, message: 'Auth endpoint response unexpected' };
    }
    
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return { 
      success: false, 
      message: `Connection failed: ${error.message}`,
      error: error
    };
  }
};

// Test login with real credentials
export const testLogin = async (email, password) => {
  console.log('🔑 Testing login with credentials...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    console.log('🔑 Login test result:', result);
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};