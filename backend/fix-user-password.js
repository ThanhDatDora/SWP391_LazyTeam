import { getPool } from './config/database.js';
import bcrypt from 'bcryptjs';

async function fixUserPassword() {
  try {
    const pool = await getPool();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Update learner@example.com password
    await pool.request()
      .input('email', 'learner@example.com')
      .input('password', hashedPassword)
      .query('UPDATE users SET password_hash = @password WHERE email = @email');
    
    console.log('✅ Updated password for learner@example.com');
    
    // Also clear all exam attempts to reset cooldown
    await pool.request()
      .input('moocId', 53)
      .query('DELETE FROM exam_attempts WHERE mooc_id = @moocId');
    
    console.log('✅ Cleared all exam attempts for MOOC 53');
    
    // Verify user can login
    const user = await pool.request()
      .input('email', 'learner@example.com')
      .query('SELECT user_id, email, full_name FROM users WHERE email = @email');
    
    if (user.recordset.length > 0) {
      console.log(`✅ User found: ${user.recordset[0].full_name} (ID: ${user.recordset[0].user_id})`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixUserPassword();