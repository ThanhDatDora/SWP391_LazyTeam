const http = require('http');

const data = JSON.stringify({
  email: 'admin@example.com',
  password: 'Admin@123'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing admin login...');
console.log('📡 Request:', options);
console.log('📦 Body:', data);

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));

  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\n✅ Response received:');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      console.log('\n🔍 Detailed analysis:');
      console.log('success:', parsed.success, typeof parsed.success);
      console.log('data exists:', !!parsed.data);
      if (parsed.data) {
        console.log('data.user exists:', !!parsed.data.user);
        if (parsed.data.user) {
          console.log('user.role_id:', parsed.data.user.role_id, typeof parsed.data.user.role_id);
          console.log('user.role:', parsed.data.user.role, typeof parsed.data.user.role);
          console.log('user.role_name:', parsed.data.user.role_name);
          console.log('user.email:', parsed.data.user.email);
          console.log('user.full_name:', parsed.data.user.full_name);
        }
        console.log('data.token exists:', !!parsed.data.token);
      }
    } catch (e) {
      console.log('❌ Failed to parse JSON:', e.message);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(data);
req.end();
