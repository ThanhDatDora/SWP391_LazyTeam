const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: { encrypt: false, trustServerCertificate: true }
};

async function checkMoocsColumns() {
  try {
    const pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'moocs'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n=== MOOCS TABLE COLUMNS ===');
    result.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
    });
    
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMoocsColumns();
