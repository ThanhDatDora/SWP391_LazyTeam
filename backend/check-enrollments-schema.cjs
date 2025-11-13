const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Thanhdatse172548',
  server: 'LAPTOP-C9N89KGI\\SQLEXPRESS',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function checkSchema() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database');
    
    // Get column names
    const result = await sql.query`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'enrollments'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log('\n📋 Enrollments table columns:');
    result.recordset.forEach(row => {
      console.log(`  - ${row.COLUMN_NAME}`);
    });
    
    // Get sample data
    const sampleData = await sql.query`SELECT TOP 1 * FROM enrollments`;
    console.log('\n📊 Sample row:');
    if (sampleData.recordset.length > 0) {
      console.log(JSON.stringify(sampleData.recordset[0], null, 2));
    }
    
    await sql.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sql.close();
  }
}

checkSchema();
