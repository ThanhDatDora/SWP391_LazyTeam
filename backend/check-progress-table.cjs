const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkProgressTable() {
  try {
    const pool = await sql.connect(config);
    
    // Check table structure
    console.log('📋 Checking progress table structure...\n');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'progress'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Columns in progress table:');
    console.table(columns.recordset);
    
    // Check sample data
    console.log('\n📊 Sample data from progress table:');
    const data = await pool.request().query('SELECT TOP 5 * FROM progress');
    console.table(data.recordset);
    
    // Count records
    const count = await pool.request().query('SELECT COUNT(*) as total FROM progress');
    console.log(`\n✅ Total records: ${count.recordset[0].total}`);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProgressTable();
