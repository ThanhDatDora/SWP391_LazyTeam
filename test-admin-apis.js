// Test AdminPanel API calls
const API_BASE_URL = 'http://localhost:3001/api';

async function testAdminAPIs() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ No token found. Please login first.');
    return;
  }

  console.log('🔑 Using token:', token.substring(0, 20) + '...');
  console.log('📡 Testing Admin APIs...\n');

  const endpoints = [
    '/admin/stats',
    '/admin/users',
    '/admin/learners',
    '/admin/instructors',
    '/admin/courses',
    '/admin/courses/pending'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success:`, data);
        
        // Show data counts
        if (data.data) {
          if (data.data.users) console.log(`   📊 Users: ${data.data.users.length}`);
          if (data.data.learners) console.log(`   📊 Learners: ${data.data.learners.length}`);
          if (data.data.instructors) console.log(`   📊 Instructors: ${data.data.instructors.length}`);
          if (data.data.courses) console.log(`   📊 Courses: ${data.data.courses.length}`);
        }
      } else {
        const errorText = await response.text();
        console.error(`   ❌ Error:`, errorText);
      }
    } catch (error) {
      console.error(`   ❌ Exception:`, error.message);
    }
  }
  
  console.log('\n✅ API Testing Complete');
}

// Run the test
testAdminAPIs();
