const sql = require('mssql');
require('dotenv').config();

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  const pool = await sql.connect(config);
  const result = await pool.request().query('SELECT TOP 1 * FROM courses');
  
  console.log('Courses table columns:');
  Object.keys(result.recordset[0] || {}).forEach(col => {
    console.log(`  - ${col}`);
  });
  
  await pool.close();
})();
