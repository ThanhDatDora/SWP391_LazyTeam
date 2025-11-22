import http from 'http';

// Test function
function testEndpoint(url, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📡 URL: ${url}`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📦 Response:`, data);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  try {
    // Test simple server on port 3002
    await testEndpoint('http://127.0.0.1:3002/test', 'Simple Test Server - /test');
    await testEndpoint('http://127.0.0.1:3002/health', 'Simple Test Server - /health');
    
    // Test main server on port 3001
    await testEndpoint('http://127.0.0.1:3001/api/health', 'Main Server - /api/health');
    await testEndpoint('http://127.0.0.1:3001/api/courses', 'Main Server - /api/courses');
    
    console.log('\n\n✅ All tests completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.log('\n\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();
