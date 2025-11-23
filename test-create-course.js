// Test create course API
const testCreateCourse = async () => {
  const token = 'YOUR_INSTRUCTOR_TOKEN_HERE'; // Lấy từ localStorage trong browser

  const courseData = {
    title: 'Test Course - Node.js Basics',
    description: 'Learn Node.js from scratch',
    category: 'programming',
    level: 'beginner',
    price: 29.99,
    is_free: false,
    duration: 10,
    language: 'vi',
    requirements: 'Basic JavaScript knowledge',
    what_you_will_learn: 'Build Node.js applications'
  };

  console.log('📤 Sending:', courseData);

  try {
    const response = await fetch('http://localhost:3001/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(courseData)
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('📥 Response:', result);

    if (response.ok) {
      console.log('✅ SUCCESS!');
    } else {
      console.error('❌ FAILED!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Uncomment to run test
// testCreateCourse();

console.log(`
📝 Instructions:
1. Open browser console on http://localhost:5173
2. Get token: localStorage.getItem('token')
3. Replace 'YOUR_INSTRUCTOR_TOKEN_HERE' with your token
4. Run: node test-create-course.js
`);
