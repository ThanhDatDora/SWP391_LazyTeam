const bcrypt = require("bcryptjs");
const path = require('path');

async function createTestUser() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    pool = await getPool();
    const sql = dbMod.sql;

    // Check if user exists
    const existing = await pool.request().query("SELECT user_id FROM users WHERE email = 'testuser@example.com'");
    
    if (existing.recordset.length > 0) {
      console.log("✅ Test user already exists: testuser@example.com / password123");
      return;
    }
    
    // Create password hash
    const passwordHash = await bcrypt.hash("password123", 10);
    
    // Insert new user
    await pool.request().query(`
      INSERT INTO users (full_name, email, password_hash, role_id, status, email_verified, created_at, updated_at)
      VALUES ('Test User', 'testuser@example.com', '${passwordHash}', 3, 'active', 1, GETDATE(), GETDATE())
    `);
    
    console.log("✅ Created test user: testuser@example.com / password123");
    
    // Enroll in course 9
    const user = await pool.request().query("SELECT user_id FROM users WHERE email = 'testuser@example.com'");
    const userId = user.recordset[0].user_id;
    
    await pool.request().query(`
      INSERT INTO enrollments (user_id, course_id, enrollment_date, is_completed, progress_percentage)
      VALUES (${userId}, 9, GETDATE(), 0, 0)
    `);
    
    console.log("✅ Enrolled test user in course 9");
    
  } catch(error) {
    console.error("❌ Error:", error.message);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (e) {}
  }
}

createTestUser();