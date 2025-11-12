const sql = require('./backend/node_modules/mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function testCoursesSchema() {
  try {
    console.log('🔄 Connecting to database...');
    const pool = await sql.connect(config);
    
    // Get courses table columns
    console.log('\n📋 Courses table columns:');
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'courses'
      ORDER BY ORDINAL_POSITION
    `);
    console.table(columnsResult.recordset);
    
    // Get sample courses data
    console.log('\n📊 Sample courses data (first 3):');
    const coursesResult = await pool.request().query(`
      SELECT TOP 3 
        course_id, 
        title, 
        price,
        status,
        created_at
      FROM courses
      ORDER BY course_id
    `);
    console.table(coursesResult.recordset);
    
    // Count courses by status
    console.log('\n📈 Courses by status:');
    const statusResult = await pool.request().query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM courses
      GROUP BY status
    `);
    console.table(statusResult.recordset);
    
    // Count enrollments
    console.log('\n👥 Total enrollments:');
    const enrollResult = await pool.request().query(`
      SELECT COUNT(*) as totalEnrollments FROM enrollments
    `);
    console.log('Total:', enrollResult.recordset[0].totalEnrollments);
    
    // Check payments table structure
    console.log('\n💰 Payments table columns:');
    const paymentsColumnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'payments'
      ORDER BY ORDINAL_POSITION
    `);
    console.table(paymentsColumnsResult.recordset);
    
    // Check payments data
    console.log('\n💳 Sample payments (first 3):');
    const paymentsResult = await pool.request().query(`
      SELECT TOP 3 * FROM payments ORDER BY payment_id
    `);
    console.table(paymentsResult.recordset);
    
    await pool.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCoursesSchema();
