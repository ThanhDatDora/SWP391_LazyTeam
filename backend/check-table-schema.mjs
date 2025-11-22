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

async function checkTables() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n📋 Checking essay_tasks table structure...\n');
    
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'essay_tasks'
      ORDER BY ORDINAL_POSITION;
    `);
    
    console.log('✅ essay_tasks columns:');
    result.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? '(' + col.CHARACTER_MAXIMUM_LENGTH + ')' : ''}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check if table has any data
    const dataResult = await pool.request().query('SELECT COUNT(*) as count FROM essay_tasks');
    console.log(`\n📊 Total essay_tasks records: ${dataResult.recordset[0].count}`);
    
    // Sample data
    const sampleResult = await pool.request().query('SELECT TOP 3 * FROM essay_tasks');
    if (sampleResult.recordset.length > 0) {
      console.log('\n📄 Sample data:');
      sampleResult.recordset.forEach((row, i) => {
        console.log(`\n${i + 1}. Record:`);
        Object.entries(row).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      });
    }
    
    // Check lessons table
    console.log('\n\n📋 Checking lessons table structure...\n');
    
    const lessonsResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'lessons'
      ORDER BY ORDINAL_POSITION;
    `);
    
    console.log('✅ lessons columns:');
    lessonsResult.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? '(' + col.CHARACTER_MAXIMUM_LENGTH + ')' : ''}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTables();
