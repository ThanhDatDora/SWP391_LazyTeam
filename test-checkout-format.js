// Test script to check backend checkout response format

async function testCheckoutResponse() {
  console.log('🧪 TESTING CHECKOUT RESPONSE FORMAT\n');
  
  // First login to get token
  console.log('🔐 Step 1: Login to get token...');
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hanhvysayhi@gmail.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, token obtained\n');
    
    // Test create order
    console.log('📦 Step 2: Test create-order endpoint...');
    const orderResponse = await fetch('http://localhost:3001/api/checkout/create-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courses: [{ courseId: 7 }],
        billingInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          phone: '1234567890',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          country: 'VN',
          zipCode: '12345'
        },
        paymentMethod: 'qr'
      })
    });
    
    const responseData = await orderResponse.json();
    
    console.log('\n📊 BACKEND RESPONSE ANALYSIS:');
    console.log('═══════════════════════════════════════');
    console.log('Status Code:', orderResponse.status);
    console.log('Response Type:', typeof responseData);
    console.log('\nResponse Structure:');
    console.log(JSON.stringify(responseData, null, 2));
    
    console.log('\n🔍 KEY FIELDS CHECK:');
    console.log('  • Has "success" field?', 'success' in responseData);
    console.log('  • Has "data" field?', 'data' in responseData);
    console.log('  • Has "paymentId" field?', 'paymentId' in responseData);
    console.log('  • Has "invoiceIds" field?', 'invoiceIds' in responseData);
    console.log('  • Has "totalAmount" field?', 'totalAmount' in responseData);
    
    console.log('\n🎯 DETECTED FORMAT:');
    if (responseData.success && responseData.data) {
      console.log('  ✅ Format 1: Wrapped format { success: true, data: {...} }');
      console.log('  📦 Actual data in: response.data.data');
      console.log('  💳 PaymentId:', responseData.data.paymentId);
    } else if (responseData.paymentId) {
      console.log('  ✅ Format 2: Direct format { paymentId, invoiceIds, ... }');
      console.log('  📦 Actual data in: response.data');
      console.log('  💳 PaymentId:', responseData.paymentId);
    } else {
      console.log('  ❌ Unknown format!');
    }
    
    console.log('\n✅ TEST COMPLETED!');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testCheckoutResponse();
