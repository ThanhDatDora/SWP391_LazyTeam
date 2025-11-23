const sql = require('mssql');

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

async function checkExamTables() {
  try {
    console.log('🔍 Checking exam-related tables...\n');
    
    const pool = await sql.connect(config);
    
    // Get all tables with 'exam' or 'question' in name
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND (TABLE_NAME LIKE '%exam%' OR TABLE_NAME LIKE '%question%')
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 Exam/Question Tables:');
    for (const table of tables.recordset) {
      console.log(`  - ${table.TABLE_NAME}`);
      
      // Get columns
      const columns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${table.TABLE_NAME}'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('    Columns:');
      columns.recordset.forEach(col => {
        console.log(`      - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.IS_NULLABLE === 'YES' ? ', NULL' : ', NOT NULL'})`);
      });
      
      // Get row count
      const count = await pool.request().query(`SELECT COUNT(*) as count FROM ${table.TABLE_NAME}`);
      console.log(`    Rows: ${count.recordset[0].count}\n`);
    }
    
    // Check courses
    const courses = await pool.request().query(`
      SELECT course_id, title 
      FROM courses 
      ORDER BY course_id
    `);
    
    console.log('\n📚 Available Courses:');
    courses.recordset.forEach(course => {
      console.log(`  ${course.course_id}. ${course.title}`);
    });
    
    await sql.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkExamTables();
