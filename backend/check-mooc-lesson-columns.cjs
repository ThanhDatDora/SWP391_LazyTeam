const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'Dat03102004'
    }
  }
};

async function checkColumns() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n📋 Checking moocs table columns...');
    const moocsResult = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'moocs'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('✅ moocs columns:');
    moocsResult.recordset.forEach(row => console.log('  -', row.COLUMN_NAME));
    
    console.log('\n📋 Checking lessons table columns...');
    const lessonsResult = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'lessons'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('✅ lessons columns:');
    lessonsResult.recordset.forEach(row => console.log('  -', row.COLUMN_NAME));
    
    sql.close();
  } catch (err) {
    console.error('❌ Error:', err);
    sql.close();
  }
}

checkColumns();
