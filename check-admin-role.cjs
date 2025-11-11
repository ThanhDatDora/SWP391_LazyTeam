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

async function checkAdminRole() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);
    
    console.log('\n📊 Checking admin user...');
    const result = await pool.request()
      .input('email', sql.NVarChar, 'admin@example.com')
      .query(`
        SELECT 
          u.user_id,
          u.email,
          u.full_name,
          u.role_id,
          u.status,
          r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = @email
      `);
    
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      console.log('\n✅ Admin user found:');
      console.log(JSON.stringify(user, null, 2));
      console.log('\n🔍 Detailed analysis:');
      console.log('user_id:', user.user_id, 'Type:', typeof user.user_id);
      console.log('email:', user.email, 'Type:', typeof user.email);
      console.log('full_name:', user.full_name, 'Type:', typeof user.full_name);
      console.log('role_id:', user.role_id, 'Type:', typeof user.role_id);
      console.log('role_name:', user.role_name, 'Type:', typeof user.role_name);
      console.log('status:', user.status, 'Type:', typeof user.status);
      
      console.log('\n🎯 Comparisons:');
      console.log('role_id === 1:', user.role_id === 1);
      console.log('role_id === "1":', user.role_id === "1");
      console.log('role_id == 1:', user.role_id == 1);
      console.log('parseInt(role_id) === 1:', parseInt(user.role_id) === 1);
    } else {
      console.log('\n❌ Admin user NOT found!');
    }
    
    console.log('\n📋 All roles:');
    const rolesResult = await pool.request().query('SELECT * FROM roles ORDER BY role_id');
    console.table(rolesResult.recordset);
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkAdminRole();
