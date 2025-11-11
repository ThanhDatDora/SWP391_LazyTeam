import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkColumns() {
  try {
    await sql.connect(config);
    
    console.log('\n📊 COURSES table columns:');
    const coursesColumns = await sql.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'courses'
      ORDER BY ORDINAL_POSITION
    `);
    coursesColumns.recordset.forEach(col => console.log(`  - ${col.COLUMN_NAME}`));
    
    console.log('\n📊 MOOCS table columns:');
    const moocsColumns = await sql.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'moocs'
      ORDER BY ORDINAL_POSITION
    `);
    moocsColumns.recordset.forEach(col => console.log(`  - ${col.COLUMN_NAME}`));
    
    await sql.close();
    console.log('\n✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkColumns();
