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

async function checkRelationship() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n🔍 Looking for relationship between lessons and essay_tasks...\n');
    
    // Check all tables related to tasks
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
        AND (TABLE_NAME LIKE '%task%' OR TABLE_NAME LIKE '%lesson%' OR TABLE_NAME LIKE '%assignment%')
      ORDER BY TABLE_NAME;
    `);
    
    console.log('📋 Related tables found:');
    tablesResult.recordset.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    
    // Check tasks table (mentioned in error as dbo.essay_tasks exists)
    console.log('\n\n📋 Checking tasks table (if exists)...\n');
    
    const tasksResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'tasks'
      ORDER BY ORDINAL_POSITION;
    `);
    
    if (tasksResult.recordset.length > 0) {
      console.log('✅ tasks table columns:');
      tasksResult.recordset.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? '(' + col.CHARACTER_MAXIMUM_LENGTH + ')' : ''})`);
      });
      
      // Sample data from tasks
      const sampleTasks = await pool.request().query('SELECT TOP 5 * FROM tasks');
      if (sampleTasks.recordset.length > 0) {
        console.log('\n📄 Sample tasks data:');
        sampleTasks.recordset.forEach((row, i) => {
          console.log(`\n${i + 1}. Task ID ${row.task_id}:`);
          Object.entries(row).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              console.log(`   ${key}: ${value}`);
            }
          });
        });
      }
    } else {
      console.log('❌ No tasks table found');
    }
    
    // Check if there's a lesson_id in tasks table
    console.log('\n\n🔗 Checking if tasks table has lesson_id...\n');
    const checkLesson = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME LIKE '%lesson%';
    `);
    
    if (checkLesson.recordset.length > 0) {
      console.log('✅ Found lesson-related columns in tasks:');
      checkLesson.recordset.forEach(col => console.log(`   - ${col.COLUMN_NAME}`));
    } else {
      console.log('❌ No lesson-related columns in tasks table');
    }
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRelationship();
