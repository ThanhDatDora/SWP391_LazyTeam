import { getPool, sql } from './config/database.js';

async function checkDatabaseStructure() {
  try {
    const pool = await getPool();
    
    console.log('🔍 Checking database structure...\n');
    
    // Check if roles table exists
    console.log('1. Checking roles table...');
    try {
      const rolesResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'roles'
      `);
      
      if (rolesResult.recordset.length > 0) {
        console.log('✅ Roles table exists');
        
        // Check roles data
        const rolesData = await pool.request().query('SELECT * FROM roles');
        console.log('📊 Roles data:', rolesData.recordset);
      } else {
        console.log('❌ Roles table does NOT exist');
      }
    } catch (error) {
      console.log('❌ Error checking roles table:', error.message);
    }
    
    console.log('\n2. Checking users table structure...');
    try {
      // Check users table columns
      const usersColumns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('📋 Users table columns:');
      usersColumns.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
      });
    } catch (error) {
      console.log('❌ Error checking users table:', error.message);
    }
    
    console.log('\n3. Checking users with passwords...');
    try {
      const usersWithPasswords = await pool.request().query(`
        SELECT user_id, email, full_name, role_id, status,
               CASE 
                 WHEN password_hash IS NOT NULL THEN 'Has password'
                 ELSE 'No password'
               END as password_status
        FROM users
      `);
      
      console.log('👥 Users status:');
      usersWithPasswords.recordset.forEach(user => {
        console.log(`  - ${user.email}: role_id=${user.role_id}, status=${user.status}, ${user.password_status}`);
      });
    } catch (error) {
      console.log('❌ Error checking users:', error.message);
    }
    
    console.log('\n4. Testing login query...');
    try {
      // Test the exact query used in login
      const testResult = await pool.request()
        .input('email', sql.NVarChar, 'learner@example.com')
        .query(`
          SELECT u.user_id, u.email, u.password_hash, u.full_name, u.status, u.role_id
          FROM users u
          WHERE u.email = @email
        `);
        
      if (testResult.recordset.length > 0) {
        const user = testResult.recordset[0];
        console.log('✅ User found with simple query:', {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
          status: user.status,
          has_password: user.password_hash ? 'Yes' : 'No',
          password_starts_with: user.password_hash ? user.password_hash.substring(0, 10) + '...' : 'None'
        });
      } else {
        console.log('❌ User not found with simple query');
      }
    } catch (error) {
      console.log('❌ Error with test query:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabaseStructure();