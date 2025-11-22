const path = require('path');

async function enrollTestUser() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    
    const userResult = await pool.request().query("SELECT user_id FROM users WHERE email = 'test-learner@exam.com'");
    if (userResult.recordset.length === 0) {
      console.log(" Test user not found");
      return;
    }
    const userId = userResult.recordset[0].user_id;
    
    const check = await pool.request().query(`SELECT * FROM enrollments WHERE user_id = ${userId} AND course_id = 2`);
    if (check.recordset.length > 0) {
      console.log(" Already enrolled in Course 2");
      return;
    }
    
    await pool.request().query(`
      INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
      VALUES (${userId}, 2, GETDATE(), 'active')
    `);
    
    console.log(" Enrolled test user in Course 2 (React)");
    
  } catch(e) {
    console.error("", e.message || e);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

enrollTestUser();
