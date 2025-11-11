// Test Admin API endpoints
const http = require('http');

// First, login as admin to get real token
const loginData = JSON.stringify({
  email: 'admin@example.com',
  password: 'Admin@123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔐 Logging in as admin...');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Login response:', result);

      if (result.success && result.data && result.data.token) {
        const token = result.data.token;
        console.log('🎫 Got token:', token.substring(0, 20) + '...');

        // Now test admin stats endpoint
        testAdminStats(token);
      } else {
        console.error('❌ Login failed:', result);
      }
    } catch (e) {
      console.error('❌ Parse error:', e.message);
      console.log('Raw data:', data);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('❌ Login request error:', e.message);
});

loginReq.write(loginData);
loginReq.end();

function testAdminStats(token) {
  console.log('\n📊 Testing /api/admin/stats...');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Admin stats response:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
          console.log('\n🎉 SUCCESS! AdminPanel can now fetch data from database!');
          console.log('📈 Stats summary:');
          console.log(`  - Total Users: ${result.data.totalUsers}`);
          console.log(`  - Total Courses: ${result.data.totalCourses}`);
          console.log(`  - Total Revenue: ${result.data.totalRevenue} VND`);
        } else {
          console.log('⚠️ API returned success=false');
        }
      } catch (e) {
        console.error('❌ Parse error:', e.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Stats request error:', e.message);
  });

  req.end();
}
