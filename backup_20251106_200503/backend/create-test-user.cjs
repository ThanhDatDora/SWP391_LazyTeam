const bcrypt = require("bcryptjs");
const path = require('path');

async function createTestUser() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;
    pool = await getPool();

    // Check if test user exists
    const check = await pool.request().query("SELECT user_id FROM users WHERE email = 'test-learner@exam.com'");
    
    if (check.recordset.length > 0) {
      console.log(" Test user already exists");
      return;
    }
    
    // Create new test user
    const hash = await bcrypt.hash("test123", 10);
    
    await pool.request().query(`
      INSERT INTO users (full_name, email, password_hash, role_id, status, email_verified)
      VALUES ('Test Learner', 'test-learner@exam.com', '${hash}', 3, 'active', 1)
    `);
    
    console.log(" Created test user: test-learner@exam.com / test123");
    
  } catch(e) {
    console.error("", e.message || e);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

createTestUser();
