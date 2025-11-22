const http = require('http');

// Get token from command line or use default instructor token
const token = process.argv[2] || 'YOUR_TOKEN_HERE';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/instructor/revenue/summary',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

console.log('Testing GET /api/instructor/revenue/summary');
console.log('Using token:', token.substring(0, 20) + '...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:\n');
    
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success && json.data && json.data.summary) {
        console.log('\n📊 SUMMARY:');
        console.log('Total Revenue USD: $' + json.data.summary.totalRevenue?.toFixed(2));
        console.log('Total Revenue VND: ' + Math.round(json.data.summary.totalRevenue * 1000).toLocaleString('vi-VN') + 'đ');
        console.log('Instructor Share USD: $' + json.data.summary.instructorShare?.toFixed(2));
        console.log('Instructor Share VND: ' + Math.round(json.data.summary.instructorShare * 1000).toLocaleString('vi-VN') + 'đ');
        console.log('Total Sales:', json.data.summary.totalSales);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
