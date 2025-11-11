import fetch from 'node-fetch';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function testSubmission() {
  try {
    console.log('🧪 Testing assignment submission...\n');

    // First, login to get token
    console.log('1️⃣ Logging in as student...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'learner2@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('✅ Logged in successfully');
    console.log(`   User: ${loginData.user.full_name}`);
    console.log(`   Role: ${loginData.user.role}\n`);

    // Test submission
    console.log('2️⃣ Submitting assignment...');
    const formData = new FormData();
    formData.append('lesson_id', '4'); // Assignment lesson ID
    formData.append('content_text', 'This is a test submission from script');

    const submitResponse = await fetch('http://localhost:3001/api/assignments/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    console.log(`   Status: ${submitResponse.status} ${submitResponse.statusText}`);

    const submitData = await submitResponse.json();
    
    if (submitResponse.ok) {
      console.log('✅ Submission successful!');
      console.log('   Response:', JSON.stringify(submitData, null, 2));
    } else {
      console.error('❌ Submission failed!');
      console.error('   Error:', JSON.stringify(submitData, null, 2));
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
  }
}

testSubmission();
