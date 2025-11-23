const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001';

async function testCourseAPI() {
  try {
    console.log('🔐 Testing Course Learning API...\n');
    
    // First, login to get token
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.com',
        password: '123456'
      })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.data.token;
    const userId = loginData.data.user.user_id;
    console.log(`✅ Logged in as user ${userId}\n`);
    
    // Get course content for Course 2
    console.log('2. Fetching Course 2 content...');
    const courseRes = await fetch(`${API_URL}/enrollments/course/2/content`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const courseData = await courseRes.json();
    
    if (!courseData.success) {
      console.error('❌ Failed to fetch course:', courseData.error);
      
      // Try to enroll first
      console.log('\n3. Attempting to enroll in Course 2...');
      const enrollRes = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: 2 })
      });
      
      const enrollData = await enrollRes.json();
      console.log('Enrollment result:', enrollData);
      
      return;
    }
    
    console.log('✅ Course content fetched successfully!\n');
    console.log('📊 Summary:');
    console.log(`   MOOCs: ${courseData.data.moocs.length}`);
    
    courseData.data.moocs.forEach((mooc, idx) => {
      console.log(`\n   MOOC ${idx + 1}: ${mooc.title}`);
      console.log(`      Lessons: ${mooc.lessons.length}`);
      
      mooc.lessons.forEach((lesson, lessonIdx) => {
        const hasUrl = lesson.content_url ? '✅' : '❌';
        console.log(`         ${lessonIdx + 1}. ${hasUrl} ${lesson.title} (${lesson.content_type})`);
        if (!lesson.content_url) {
          console.log(`            ⚠️ Missing content_url!`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCourseAPI();
