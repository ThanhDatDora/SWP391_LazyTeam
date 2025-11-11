import { getPool, sql } from './config/database.js';

const checkEmail = async () => {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('email', sql.NVarChar, 'btlovedh@gmail.com')
      .query('SELECT user_id, full_name, email, status FROM users WHERE email = @email');
    
    console.log('📧 Email check results:');
    if (result.recordset.length > 0) {
      console.log('✅ User found:', result.recordset[0]);
    } else {
      console.log('❌ User not found with email: btlovedh@gmail.com');
      
      // List some users to see what's in database
      const allUsers = await pool.request()
        .query('SELECT TOP 5 user_id, full_name, email, status FROM users ORDER BY created_at DESC');
      
      console.log('\n📋 Recent users in database:');
      allUsers.recordset.forEach(user => {
        console.log(`- ${user.email} (${user.full_name}) - Status: ${user.status}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkEmail();