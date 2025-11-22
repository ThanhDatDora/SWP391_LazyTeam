// Test script để login và lấy token mới
const https = require('https');
const http = require('http');

console.log('🔑 Testing Login and New Token...');
console.log('='.repeat(60));

// Test login để lấy token mới
const loginData = JSON.stringify({
  email: "test@example.com",
  password: "password"
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('📡 Attempting login...');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`📊 Login Status: ${res.statusCode}`);
    
    try {
      const loginResult = JSON.parse(data);
      
      if (res.statusCode === 200 && loginResult.token) {
        console.log('✅ Login successful!');
        console.log('🎫 New token received');
        
        // Test API với token mới
        testApiWithNewToken(loginResult.token);
        
      } else {
        console.log('❌ Login failed:', loginResult.message || 'Unknown error');
        console.log('📄 Response:', data);
        
        // Test API without authentication để xem có vấn đề gì
        testApiWithoutAuth();
      }
    } catch (e) {
      console.log('❌ Login response parse error:', e.message);
      console.log('📄 Raw response:', data);
    }
  });
});

loginReq.on('error', (error) => {
  console.log('❌ Login request error:', error.message);
  testApiWithoutAuth();
});

loginReq.setTimeout(5000, () => {
  console.log('⏰ Login timeout');
  loginReq.destroy();
  testApiWithoutAuth();
});

loginReq.write(loginData);
loginReq.end();

function testApiWithNewToken(token) {
  console.log('\n🧪 Testing API with NEW TOKEN...');
  
  const apiOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/learning/exams/mooc/52',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const apiReq = http.request(apiOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`📊 API Status: ${res.statusCode}`);
      
      try {
        const apiResult = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ API Success with new token!');
          console.log(`📝 Questions found: ${apiResult.data?.questions?.length || 0}`);
          console.log(`📋 Exam available: ${apiResult.data?.exam ? 'Yes' : 'No'}`);
          
          if (apiResult.data?.questions?.length > 0) {
            console.log('🎉 PROBLEM SOLVED! New token works perfectly!');
            console.log(`📊 Full question count: ${apiResult.data.questions.length}`);
          } else {
            console.log('⚠️ API works but still no questions - check backend logic');
          }
        } else {
          console.log('❌ API failed even with new token:', apiResult.message);
        }
      } catch (e) {
        console.log('❌ API response parse error:', e.message);
        console.log('📄 Raw response:', data);
      }
    });
  });
  
  apiReq.on('error', (error) => {
    console.log('❌ API request error:', error.message);
  });
  
  apiReq.setTimeout(5000, () => {
    console.log('⏰ API timeout');
    apiReq.destroy();
  });
  
  apiReq.end();
}

function testApiWithoutAuth() {
  console.log('\n🧪 Testing API WITHOUT AUTH...');
  
  const apiOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/learning/exams/mooc/52',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const apiReq = http.request(apiOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`📊 API Status: ${res.statusCode}`);
      
      if (res.statusCode === 401) {
        console.log('✅ Expected 401 - Authentication required');
        console.log('🔐 Backend is working, just needs valid credentials');
      } else {
        console.log('📄 Response:', data);
      }
    });
  });
  
  apiReq.on('error', (error) => {
    console.log('❌ API request error:', error.message);
  });
  
  apiReq.end();
}