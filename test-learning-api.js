const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Use the token from previous successful login
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibGVhcm5lckBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjMsImlhdCI6MTczMDY4NjIxOCwiZXhwIjoxNzMwNzcyNjE4fQ.u4AqPmCEtEUkCMRwHNVPWYm56kElDSFj2g_BdK0j0rs';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testLearningAPI() {
  try {
    console.log('\n📚 Testing Learning API...\n');
    
    // Test 1: Get course content (use courseId from enrollments)
    console.log('🔍 Test 1: Get Course Content (courseId: 9)');
    const contentRes = await axios.get(`${API_URL}/enrollments/course/9/content`, { headers });
    console.log('✅ Response:', {
      success: contentRes.data.success,
      moocs_count: contentRes.data.data?.moocs?.length || 0,
      first_mooc: contentRes.data.data?.moocs?.[0]?.title || 'N/A',
      lessons_in_first_mooc: contentRes.data.data?.moocs?.[0]?.lessons?.length || 0,
      first_lesson: contentRes.data.data?.moocs?.[0]?.lessons?.[0]?.title || 'N/A'
    });
    
    const firstLesson = contentRes.data.data?.moocs?.[0]?.lessons?.[0];
    if (firstLesson) {
      console.log('\n📝 First Lesson Details:', {
        lesson_id: firstLesson.lesson_id,
        title: firstLesson.title,
        video_url: firstLesson.video_url,
        duration_minutes: firstLesson.duration_minutes,
        completed: firstLesson.completed,
        last_position_sec: firstLesson.last_position_sec
      });
      
      // Test 2: Mark lesson complete
      console.log('\n🎯 Test 2: Mark Lesson Complete');
      const completeRes = await axios.post(
        `${API_URL}/enrollments/lesson/${firstLesson.lesson_id}/complete`,
        { lastPositionSec: 120 }, // 2 minutes watched
        { headers }
      );
      console.log('✅ Mark complete response:', completeRes.data);
      
      // Test 3: Get course content again to verify completion
      console.log('\n🔄 Test 3: Verify Lesson Marked Complete');
      const verifyRes = await axios.get(`${API_URL}/enrollments/course/9/content`, { headers });
      const updatedLesson = verifyRes.data.data?.moocs?.[0]?.lessons?.[0];
      console.log('✅ Updated lesson status:', {
        lesson_id: updatedLesson.lesson_id,
        title: updatedLesson.title,
        completed: updatedLesson.completed,
        completed_at: updatedLesson.completed_at,
        last_position_sec: updatedLesson.last_position_sec
      });
    }
    
    console.log('\n✅ All learning API tests passed!');
    
  } catch (error) {
    console.error('\n❌ Learning API test failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testLearningAPI();
