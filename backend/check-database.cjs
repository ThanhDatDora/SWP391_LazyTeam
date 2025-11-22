const sql = require('mssql');

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

async function checkDatabase() {
  try {
    const pool = await sql.connect(config);
    
    // Check courses table columns
    console.log('📋 Columns in courses table:');
    const coursesColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'courses'
      ORDER BY ORDINAL_POSITION
    `);
    console.log(coursesColumns.recordset);
    
    // Check enrollments table columns
    console.log('\n📋 Columns in enrollments table:');
    const enrollmentsColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'enrollments'
      ORDER BY ORDINAL_POSITION
    `);
    console.log(enrollmentsColumns.recordset);
    
    // Sample course with join
    console.log('\n📚 Sample course data:');
    const sampleCourse = await pool.request().query(`
      SELECT TOP 1 * FROM courses
    `);
    console.log(sampleCourse.recordset[0]);
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
