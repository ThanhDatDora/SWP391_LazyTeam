const sql = require('mssql');

async function checkConstraint() {
  try {
    const pool = await sql.connect({
      server: 'localhost\\SQLEXPRESS',
      database: 'MiniCoursera_Primary',
      user: 'sa',
      password: '123456',
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    });

    const result = await pool.request().query(`
      SELECT definition 
      FROM sys.check_constraints 
      WHERE name = 'CK__questions__qtype__1DB06A4F'
    `);

    console.log('CHECK Constraint Definition:');
    console.log(JSON.stringify(result.recordset, null, 2));

    await pool.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkConstraint();
