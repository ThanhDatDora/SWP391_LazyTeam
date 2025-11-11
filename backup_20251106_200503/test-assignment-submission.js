/**
 * Test Assignment Submission API
 * Tests the new essay_submissions workflow
 */

const API_BASE_URL = 'http://localhost:3001/api';

async function testAssignmentSubmission() {
  console.log('🧪 Testing Assignment Submission API\n');

  // Step 1: Login to get token
  console.log('Step 1: Logging in...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student1@example.com',
      password: 'password123'
    })
  });

  const loginData = await loginResponse.json();
  console.log('Login response:', JSON.stringify(loginData, null, 2));
  
  if (!loginData.success) {
    console.error('❌ Login failed:', loginData.error);
    return;
  }

  const token = loginData.data.token;
  const userId = loginData.data.user.user_id;
  console.log('✅ Logged in as user:', userId);
  console.log('Token:', token.substring(0, 20) + '...\n');

  // Step 2: Submit assignment (without file)
  console.log('Step 2: Submitting assignment...');
  const submissionText = `
# Bài tập về React Hooks

## 1. Giới thiệu
Tôi đã học về useState và useEffect hooks trong React.

## 2. Ví dụ code
\`\`\`javascript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log('Count changed:', count);
}, [count]);
\`\`\`

## 3. Kết luận
React Hooks giúp code component function đơn giản hơn class component.
  `.trim();

  const formData = new FormData();
  formData.append('lesson_id', '4'); // Assignment lesson in Course 2
  formData.append('content_text', submissionText);

  const submitResponse = await fetch(`${API_BASE_URL}/assignments/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const submitData = await submitResponse.json();
  console.log('Response:', JSON.stringify(submitData, null, 2));

  if (!submitData.success) {
    console.error('❌ Submission failed:', submitData.error);
    return;
  }

  console.log('✅ Submission successful!');
  console.log('Submission ID:', submitData.data.submission_id);
  console.log('Status:', submitData.data.status);
  console.log('');

  // Step 3: Get submission status
  console.log('Step 3: Fetching submission status...');
  const statusResponse = await fetch(`${API_BASE_URL}/assignments/submission/4`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const statusData = await statusResponse.json();
  console.log('Response:', JSON.stringify(statusData, null, 2));

  if (statusData.success) {
    console.log('✅ Submission found!');
    console.log('Status:', statusData.data.submission.status);
    console.log('Submitted at:', statusData.data.submission.submitted_at);
    console.log('Text preview:', statusData.data.submission.content_text.substring(0, 100) + '...');
  }

  console.log('\n🎉 All tests passed!');
}

testAssignmentSubmission().catch(error => {
  console.error('💥 Test failed:', error);
});
