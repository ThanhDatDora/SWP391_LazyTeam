const sql = require("mssql");
const bcrypt = require("bcryptjs");
const c = {user:"sa",password:"123456",server:"localhost",database:"MiniCoursera_Primary",options:{encrypt:false,trustServerCertificate:true}};

async function createTestUser() {
  try {
    await sql.connect(c);
    
    // Check if test user exists
    const check = await sql.query`SELECT user_id FROM users WHERE email = 'test-learner@exam.com'`;
    
    if (check.recordset.length > 0) {
      console.log(" Test user already exists");
      return;
    }
    
    // Create new test user
    const hash = await bcrypt.hash("test123", 10);
    
    await sql.query`
      INSERT INTO users (full_name, email, password_hash, role_id, status, email_verified)
      VALUES ('Test Learner', 'test-learner@exam.com', ${hash}, 3, 'active', 1)
    `;
    
    console.log(" Created test user: test-learner@exam.com / test123");
    
  } catch(e) {
    console.error("", e.message);
  } finally {
    await sql.close();
  }
}

createTestUser();
