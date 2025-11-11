import { getPool } from './config/database.js';

async function checkExamStructure() {
  try {
    console.log('🔄 Connecting to database...');
    const pool = await getPool();
    
    // Check exams table
    console.log('\n📋 EXAMS table structure:');
    const examsColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'exams'
      ORDER BY ORDINAL_POSITION
    `);
    examsColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'NO' ? 'required' : 'nullable'})`);
    });
    
    // Check submissions table
    console.log('\n📋 SUBMISSIONS table structure:');
    const submissionsColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'submissions'
      ORDER BY ORDINAL_POSITION
    `);
    submissionsColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'NO' ? 'required' : 'nullable'})`);
    });
    
    // Check exam_items table
    console.log('\n📋 EXAM_ITEMS table structure:');
    const examItemsColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'exam_items'
      ORDER BY ORDINAL_POSITION
    `);
    examItemsColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'NO' ? 'required' : 'nullable'})`);
    });
    
    // Sample data
    console.log('\n📊 Sample exam data:');
    const sampleExams = await pool.request().query(`
      SELECT TOP 3 * FROM exams
    `);
    console.log(JSON.stringify(sampleExams.recordset, null, 2));
    
    console.log('\n📊 Sample submission data:');
    const sampleSubmissions = await pool.request().query(`
      SELECT TOP 3 * FROM submissions
    `);
    console.log(JSON.stringify(sampleSubmissions.recordset, null, 2));
    
    await pool.close();
    console.log('\n✅ Check completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit(0);
}

checkExamStructure();
