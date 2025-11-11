// Test admin routes after fixes
const baseURL = 'http://localhost:3001/api/admin';

// You'll need to replace this with a valid admin JWT token
const adminToken = 'YOUR_ADMIN_TOKEN_HERE';

const routes = [
  '/stats',
  '/users',
  '/learners', 
  '/instructors',
  '/instructor-revenue'
];

async function testRoute(route) {
  try {
    console.log(`\n🧪 Testing: ${route}`);
    const response = await fetch(baseURL + route, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Response:`, JSON.stringify(data, null, 2).substring(0, 500));
    
    if (data.success && data.data) {
      console.log(`📊 Records count: ${data.data.length}`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function testAll() {
  console.log('🚀 Testing all admin routes...\n');
  console.log('⚠️ Make sure to replace adminToken with a valid token first!\n');
  
  for (const route of routes) {
    await testRoute(route);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testAll();
