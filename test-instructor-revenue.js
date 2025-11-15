// Test Instructor Revenue API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/instructor/revenue/summary';

// You need to replace this with a valid instructor token
// Get it from: Login as instructor → Open DevTools → Application → localStorage → token
const INSTRUCTOR_TOKEN = 'YOUR_TOKEN_HERE';

async function testInstructorRevenue() {
  console.log('🧪 Testing Instructor Revenue API...\n');
  
  try {
    console.log(`📡 Calling: ${API_URL}`);
    console.log(`🔑 Token: ${INSTRUCTOR_TOKEN.substring(0, 20)}...`);
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTRUCTOR_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Revenue data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ ERROR! Response:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('\n💥 Request failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Backend đang chạy? (http://localhost:3001)');
    console.error('2. Token hợp lệ? (Login → DevTools → localStorage → token)');
    console.error('3. User có role instructor? (role_id = 2)');
  }
}

// Instructions
console.log('═══════════════════════════════════════════════════════════');
console.log('  TEST INSTRUCTOR REVENUE API');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n📝 HƯỚNG DẪN:');
console.log('1. Đăng nhập với tài khoản instructor');
console.log('2. Mở DevTools (F12) → Tab Application → localStorage');
console.log('3. Copy giá trị của key "token"');
console.log('4. Paste vào biến INSTRUCTOR_TOKEN ở đầu file này');
console.log('5. Run: node test-instructor-revenue.js\n');
console.log('═══════════════════════════════════════════════════════════\n');

if (INSTRUCTOR_TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('⚠️  Chưa cấu hình token!');
  console.log('Vui lòng đọc hướng dẫn ở trên và cập nhật INSTRUCTOR_TOKEN\n');
  process.exit(1);
}

testInstructorRevenue();
