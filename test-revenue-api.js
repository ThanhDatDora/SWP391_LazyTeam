// Quick test for revenue API endpoints
import http from 'http';

const testEndpoint = (path) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${path} - Status: ${res.statusCode}`);
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      console.log(`❌ ${path} - Error: ${error.code} - ${error.message}`);
      resolve(null);
    });

    req.end();
  });
};

(async () => {
  console.log('\n🧪 Testing Revenue API Endpoints...\n');
  
  await testEndpoint('/api/admin/revenue/summary');
  await testEndpoint('/api/admin/revenue/pending-payments');
  await testEndpoint('/api/admin/revenue/instructor-revenue');
  await testEndpoint('/api/instructor/revenue/summary');
  await testEndpoint('/api/instructor/revenue/transactions');
  
  console.log('\n✅ All endpoints tested!');
  console.log('Note: 401 = Route exists but needs authentication ✅');
  console.log('      404 = Route not found ❌\n');
})();
