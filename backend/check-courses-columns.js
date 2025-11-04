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

async function checkCoursesColumns() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);

    console.log('\n📋 Checking COURSES table structure...\n');
    
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'courses'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 COURSES table columns:');
    result.recordset.forEach(col => {
      const maxLen = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)';
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${maxLen} ${nullable}`);
    });

    await pool.close();
    console.log('\n✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkCoursesColumns();
