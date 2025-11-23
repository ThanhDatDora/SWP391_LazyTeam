import { getPool } from './config/database.js';

async function checkUsers() {
  try {
    const pool = await getPool();
    
    // Check users with password hash
    const users = await pool.request().query(`
      SELECT user_id, email, full_name, 
             CASE WHEN password_hash IS NOT NULL THEN 'YES' ELSE 'NO' END as has_password 
      FROM users 
      ORDER BY user_id
    `);
    
    console.log('=== USERS WITH PASSWORD STATUS ===');
    users.recordset.forEach(u => {
      console.log(`ID: ${u.user_id}, Email: ${u.email}, Name: ${u.full_name}, HasPassword: ${u.has_password}`);
    });

    // Check specific user for more details
    const learnerUser = await pool.request()
      .input('email', 'learner@example.com')
      .query('SELECT user_id, email, password_hash, status FROM users WHERE email = @email');
    
    if (learnerUser.recordset.length > 0) {
      const user = learnerUser.recordset[0];
      console.log('\n=== LEARNER USER DETAILS ===');
      console.log(`ID: ${user.user_id}, Email: ${user.email}`);
      console.log(`Status: ${user.status}`);
      console.log(`Password Hash: ${user.password_hash ? 'EXISTS' : 'NULL'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();