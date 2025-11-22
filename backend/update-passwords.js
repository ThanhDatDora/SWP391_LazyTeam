import bcrypt from 'bcryptjs';
import { getPool, sql } from './config/database.js';

async function updateDemoPasswords() {
  try {
    const pool = await getPool();
    
    // Demo accounts với passwords
    const demoAccounts = [
      { email: 'admin@example.com', password: 'Admin@123' },
      { email: 'instructor@example.com', password: 'Instr@123' },
      { email: 'learner@example.com', password: 'Learner@123' },
      { email: 'learner2@example.com', password: 'Learner@123' }
    ];
    
    console.log('Updating demo account passwords...');
    
    for (const account of demoAccounts) {
      try {
        // Hash password với bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(account.password, saltRounds);
        
        // Update password trong database
        const result = await pool.request()
          .input('email', sql.NVarChar, account.email)
          .input('password_hash', sql.NVarChar, hashedPassword)
          .query(`
            UPDATE users 
            SET password_hash = @password_hash, 
                password_hash_bin = NULL,
                updated_at = GETDATE()
            WHERE email = @email
          `);
          
        if (result.rowsAffected[0] > 0) {
          console.log(`✅ Updated password for ${account.email}`);
        } else {
          console.log(`⚠️  No user found for ${account.email}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${account.email}:`, error.message);
      }
    }
    
    console.log('\n✅ Password update completed!');
    console.log('\nDemo accounts:');
    console.log('- admin@example.com / Admin@123');
    console.log('- instructor@example.com / Instr@123'); 
    console.log('- learner@example.com / Learner@123');
    console.log('- learner2@example.com / Learner@123');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    process.exit(0);
  }
}

updateDemoPasswords();