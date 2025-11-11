import sql from 'mssql';

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
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
    
    console.log('\n📋 Checking progress table structure...\n');
    
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'progress'
      ORDER BY ORDINAL_POSITION;
    `);
    
    console.log('✅ progress table columns:');
    result.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProgressTable();
