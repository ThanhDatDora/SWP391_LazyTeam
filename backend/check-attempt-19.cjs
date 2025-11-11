const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkAttempt() {
  try {
    const pool = await sql.connect(config);
    
    // Check attempt 19
    const attemptResult = await pool.request()
      .input('attemptId', sql.BigInt, 19)
      .query('SELECT attempt_id, user_id, mooc_id, score, passed, submitted_at FROM exam_attempts WHERE attempt_id = @attemptId');
    
    if (attemptResult.recordset.length === 0) {
      console.log('❌ Attempt 19 not found');
      await pool.close();
      return;
    }
    
    const attempt = attemptResult.recordset[0];
    console.log('✅ Attempt 19 found:');
    console.log(JSON.stringify(attempt, null, 2));
    
    // Check user info
    const userResult = await pool.request()
      .input('userId', sql.BigInt, attempt.user_id)
      .query('SELECT user_id, email, full_name FROM users WHERE user_id = @userId');
    
    console.log('\n👤 User info:');
    console.log(JSON.stringify(userResult.recordset[0], null, 2));
    
    // Check all attempts for this user
    const allAttemptsResult = await pool.request()
      .input('userId', sql.BigInt, attempt.user_id)
      .query('SELECT attempt_id, mooc_id, score, passed, submitted_at FROM exam_attempts WHERE user_id = @userId ORDER BY submitted_at DESC');
    
    console.log(`\n📊 All attempts for user ${attempt.user_id} (${allAttemptsResult.recordset.length} total):`);
    console.log(JSON.stringify(allAttemptsResult.recordset, null, 2));
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkAttempt();
