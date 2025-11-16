const https = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/learning-stats',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0dWFub21lZ2FAZ21haWwuY29tIiwicm9sZSI6MSwiaWF0IjoxNzMxNzQ3NTY2LCJleHAiOjE3MzE4MzM5NjZ9.M2tYF5KmQRG3xqB6F7t5XkJ0eL5zQwY5Z8jD3hN4kP8'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      console.log('✅ Success!');
      console.log('Overview:', json.data.overview);
      console.log('Study Time:', json.data.studyTime);
    } else {
      console.log('❌ Error:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
