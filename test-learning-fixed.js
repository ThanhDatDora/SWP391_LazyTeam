const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibGVhcm5lckBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjMsImlhdCI6MTczMDY4NjIxOCwiZXhwIjoxNzMwNzcyNjE4fQ.u4AqPmCEtEUkCMRwHNVPWYm56kElDSFj2g_BdK0j0rs';

async function testLearningAPI() {
  try {
    console.log('\n🧪 Testing Learning API (Fixed)...\n');
    
    // Test: Get course content (courseId: 9)
    console.log('📚 Test: Get Course Content');
    const response = await axios.get(`${API_URL}/enrollments/course/9/content`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ MOOCs count:', response.data.data?.moocs?.length || 0);
    
    if (response.data.data?.moocs?.length > 0) {
      const firstMooc = response.data.data.moocs[0];
      console.log('\n📖 First MOOC:', {
        mooc_id: firstMooc.mooc_id,
        title: firstMooc.title,
        order: firstMooc.order,
        lessons_count: firstMooc.lessons?.length || 0,
        exams_count: firstMooc.exams?.length || 0
      });
      
      if (firstMooc.lessons?.length > 0) {
        const firstLesson = firstMooc.lessons[0];
        console.log('\n📝 First Lesson:', {
          lesson_id: firstLesson.lesson_id,
          title: firstLesson.title,
          content_type: firstLesson.content_type,
          content_url: firstLesson.content_url,
          order: firstLesson.order,
          is_preview: firstLesson.is_preview,
          completed: firstLesson.completed,
          last_position_sec: firstLesson.last_position_sec
        });
      }
      
      if (firstMooc.exams?.length > 0) {
        console.log('\n📋 Exams in MOOC:', firstMooc.exams.map(e => ({
          exam_id: e.exam_id,
          title: e.title,
          attempts: e.attempts,
          best_score: e.best_score
        })));
      }
    }
    
    console.log('\n✅ Learning API test PASSED!');
    
  } catch (error) {
    console.error('\n❌ Test FAILED:', {
      message: error.message,
      status: error.response?.status,
      error: error.response?.data?.error
    });
  }
}

testLearningAPI();
