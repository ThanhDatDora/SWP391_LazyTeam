import { getPool } from './config/database.js';

async function checkUsers() {
  try {
    const pool = await getPool();
    
    // Count total users first
    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM users');
    console.log(`👥 Total users in database: ${countResult.recordset[0].total}\n`);
    
    console.log('📋 ALL users in database:');
    const result = await pool.request().query(`
      SELECT 
        u.user_id, u.email, u.full_name, u.status, r.role_name,
        u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.user_id ASC
    `);
    
    result.recordset.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.user_id}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Name: ${user.full_name}`);
      console.log(`   🏷️  Role: ${user.role_name}`);
      console.log(`   📊 Status: ${user.status}`);
      console.log(`   📅 Created: ${user.created_at}`);
      console.log('');
    });
    
    console.log(`✅ Listed all ${result.recordset.length} users from database`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();