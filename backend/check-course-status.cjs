const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkCourseStatus() {
  try {
    const pool = await sql.connect(config);
    
    // First, check what columns exist in courses table
    console.log('\n=== COURSES TABLE COLUMNS ===');
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'courses' 
      ORDER BY ORDINAL_POSITION
    `);
    console.log(columnsResult.recordset);
    
    // Get course data with all fields
    console.log('\n=== COURSES DATA (Instructor ID 2) ===');
    const coursesResult = await pool.request().query(`
      SELECT 
        course_id,
        title,
        status,
        owner_instructor_id,
        CASE 
          WHEN status = 'approved' THEN 'Đã duyệt'
          WHEN status = 'rejected' THEN 'Bị từ chối'
          WHEN status = 'pending' THEN 'Chờ duyệt'
          WHEN status = 'archived' THEN 'Lưu trữ'
          ELSE status
        END as status_vn
      FROM courses 
      WHERE owner_instructor_id = 2
      ORDER BY course_id
    `);
    
    console.log('\nTotal courses:', coursesResult.recordset.length);
    console.log('\nCourses by status:');
    coursesResult.recordset.forEach(c => {
      console.log(`- Course ${c.course_id}: ${c.title.substring(0, 40)}... | Status: ${c.status} (${c.status_vn})`);
    });
    
    // Count by status
    console.log('\n=== STATUS COUNTS ===');
    const statusCount = await pool.request().query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM courses 
      WHERE owner_instructor_id = 2
      GROUP BY status
      ORDER BY status
    `);
    console.log(statusCount.recordset);
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCourseStatus();
