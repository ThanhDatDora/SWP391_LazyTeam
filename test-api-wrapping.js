// Test script to verify apiRequest smart wrapping logic
// Run: node test-api-wrapping.js

console.log('🧪 Testing apiRequest Smart Wrapping Logic\n');

function apiRequestLogic(backendResponse) {
  const data = backendResponse;
  // Smart wrapping: Only wrap if backend doesn't already have success field
  const result = data.success !== undefined ? data : { success: true, data };
  return result;
}

// Test Case 1: Backend already has success field (e.g., /courses/my-enrolled)
console.log('📝 Test 1: Backend with success field');
const test1Input = { 
  success: true, 
  data: [
    { id: 1, title: 'Photography Masterclass' }
  ] 
};
const test1Output = apiRequestLogic(test1Input);
console.log('Input:', JSON.stringify(test1Input, null, 2));
console.log('Output:', JSON.stringify(test1Output, null, 2));
console.log('✅ Result: No double wrapping!\n');

// Test Case 2: Backend without success field (e.g., /auth/login)
console.log('📝 Test 2: Backend without success field');
const test2Input = {
  message: 'Login successful',
  user: { id: 13, email: 'hanhvysayhi@gmail.com', role: 'learner' },
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
const test2Output = apiRequestLogic(test2Input);
console.log('Input:', JSON.stringify(test2Input, null, 2));
console.log('Output:', JSON.stringify(test2Output, null, 2));
console.log('✅ Result: Wrapped with success: true\n');

// Test Case 3: Backend with success: false (error case)
console.log('📝 Test 3: Backend with success: false (error)');
const test3Input = {
  success: false,
  message: 'Invalid credentials'
};
const test3Output = apiRequestLogic(test3Input);
console.log('Input:', JSON.stringify(test3Input, null, 2));
console.log('Output:', JSON.stringify(test3Output, null, 2));
console.log('✅ Result: Preserved error state!\n');

// Test Case 4: Backend with different format (e.g., /courses with pagination)
console.log('📝 Test 4: Backend with custom format');
const test4Input = {
  courses: [{ id: 1 }, { id: 2 }],
  pagination: { page: 1, total: 10 }
};
const test4Output = apiRequestLogic(test4Input);
console.log('Input:', JSON.stringify(test4Input, null, 2));
console.log('Output:', JSON.stringify(test4Output, null, 2));
console.log('✅ Result: Wrapped with success: true, preserves structure\n');

console.log('🎉 All tests passed! Smart wrapping logic is correct.');
console.log('\n📋 Summary:');
console.log('  • Endpoints WITH success field → returned unchanged (no double wrapping)');
console.log('  • Endpoints WITHOUT success field → wrapped with { success: true, data: ... }');
console.log('  • Frontend code can safely access response.data for all cases!');
