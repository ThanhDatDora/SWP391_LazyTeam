async function testExamStart() {
  console.log('🧪 Testing exam start API...\n');

  try {
    // Test: Start exam for exam_id = 7, user_id = 1
    const response = await fetch('http://localhost:3001/api/exams/7/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1 })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Exam started successfully!\n');
      console.log('📋 Response:', JSON.stringify(data, null, 2));
      console.log('\n🔑 Instance ID:', data.instanceId);
      console.log('📝 Total questions:', data.questions.length);
      console.log('⏰ Start time:', data.startTime);
      
      // Save instance ID for next test
      console.log('\n💾 Use this for next test:');
      console.log(`   Instance ID: ${data.instanceId}`);
      
      return data.instanceId;
    } else {
      console.error('❌ Failed:', data.error);
      console.error('Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testExamStart();
