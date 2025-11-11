import { getPool } from './config/database.js';

async function checkSubmissions() {
  try {
    const pool = await getPool();
    
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('submissions', 'exam_instances', 'exam_answers', 'user_exam_attempts')
    `);
    
    console.log('📊 Exam attempt tables:');
    if (tables.recordset.length === 0) {
      console.log('  ❌ No submission/attempt tracking tables found\n');
      console.log('  Need to create: exam_instances, exam_answers');
    } else {
      for (const table of tables.recordset) {
        console.log(`  ✅ ${table.TABLE_NAME}`);
        
        const columns = await pool.request()
          .input('tableName', table.TABLE_NAME)
          .query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = @tableName
          `);
        
        columns.recordset.forEach(col => {
          console.log(`      ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });
        console.log('');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSubmissions();
