import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function checkTables() {
  try {
    await sql.connect(config);
    
    // Check reviews table
    console.log('📋 REVIEWS table columns:');
    const reviews = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'reviews' 
      ORDER BY ORDINAL_POSITION
    `);
    reviews.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME}: ${c.DATA_TYPE}`));
    
    // Check enrollments table
    console.log('\n📋 ENROLLMENTS table columns:');
    const enrollments = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'enrollments' 
      ORDER BY ORDINAL_POSITION
    `);
    enrollments.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME}: ${c.DATA_TYPE}`));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.close();
  }
}

checkTables();
