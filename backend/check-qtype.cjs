const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkQtypes() {
  try {
    const pool = await sql.connect(config);

    // Check existing qtypes
    const result = await pool.request().query(`
      SELECT DISTINCT qtype 
      FROM questions 
      WHERE qtype IS NOT NULL
    `);

    console.log('📋 Existing qtype values in database:');
    console.log('=' .repeat(50));
    result.recordset.forEach(row => {
      console.log(`  - ${row.qtype}`);
    });

    // Check the constraint
    const constraint = await pool.request().query(`
      SELECT definition 
      FROM sys.check_constraints 
      WHERE name = 'CK__questions__qtype__1DB06A4F'
    `);

    if (constraint.recordset.length > 0) {
      console.log('\n🔍 CHECK constraint definition:');
      console.log('=' .repeat(50));
      console.log(constraint.recordset[0].definition);
    }

    await pool.close();

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkQtypes();
