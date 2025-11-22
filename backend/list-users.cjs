const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  const pool = await sql.connect(config);
  
  const users = await pool.request()
    .query('SELECT TOP 10 user_id, full_name, email FROM users ORDER BY user_id');
  
  console.log('👥 Users in database:');
  console.log('================================\n');
  users.recordset.forEach(u => {
    console.log(`${u.user_id}: ${u.full_name}`);
    console.log(`   📧 ${u.email}\n`);
  });
  
  await pool.close();
})();
