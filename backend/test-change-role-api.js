/**
 * Test Change User Role API
 * 
 * Tests the PUT /api/admin/users/:id/role endpoint
 * 
 * Usage: node test-change-role-api.js
 */

const API_BASE_URL = 'http://localhost:3000/api';

// IMPORTANT: Replace with actual admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

// Test user IDs (replace with real user IDs from your database)
const TEST_USER_ID = 5; // Replace with a real learner/instructor user ID

/**
 * Test changing user role
 */
async function testChangeRole(userId, newRoleId) {
  console.log(`\n📝 Testing: Change user ${userId} to role ${newRoleId}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role_id: newRoleId })
    });

    const status = response.status;
    console.log(`📡 Status: ${status}`);

    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📦 Response:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('📦 Response (text):', text);
    }

    if (response.ok) {
      console.log('✅ TEST PASSED: Role changed successfully');
      return { success: true, data };
    } else {
      console.log('❌ TEST FAILED: API returned error');
      return { success: false, status, data };
    }

  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Testing Change User Role API');
  console.log('='.repeat(60));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Admin Token: ${ADMIN_TOKEN.substring(0, 20)}...`);
  console.log('='.repeat(60));

  // Test 1: Change to Instructor (role_id = 2)
  await testChangeRole(TEST_USER_ID, 2);

  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Change back to Learner (role_id = 3)
  await testChangeRole(TEST_USER_ID, 3);

  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Invalid role_id (should fail)
  console.log(`\n📝 Testing: Invalid role_id (1 = Admin)`);
  console.log('='.repeat(60));
  const invalidResult = await testChangeRole(TEST_USER_ID, 1);
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log('✅ TEST PASSED: Correctly rejected Admin role');
  } else {
    console.log('❌ TEST FAILED: Should have rejected Admin role');
  }

  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Invalid user ID (should fail)
  console.log(`\n📝 Testing: Invalid user ID (9999)`);
  console.log('='.repeat(60));
  const notFoundResult = await testChangeRole(9999, 2);
  if (!notFoundResult.success && notFoundResult.status === 404) {
    console.log('✅ TEST PASSED: Correctly returned 404 for non-existent user');
  } else {
    console.log('❌ TEST FAILED: Should have returned 404');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 All tests completed!');
  console.log('='.repeat(60));
}

// Check if token is set
if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
  console.error('❌ ERROR: Please set ADMIN_TOKEN in the script first!');
  console.log('\nHow to get admin token:');
  console.log('1. Login as admin in the app');
  console.log('2. Open browser DevTools → Application → Local Storage');
  console.log('3. Find "token" key');
  console.log('4. Copy the token value');
  console.log('5. Replace ADMIN_TOKEN in this script');
  process.exit(1);
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
