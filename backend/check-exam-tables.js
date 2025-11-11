import { getPool } from './config/database.js';

async function checkExamTables() {
  try {
    const pool = await getPool();
    
    console.log('🔍 Checking exam-related tables...\n');
    
    // Get all tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME LIKE '%exam%' 
        OR TABLE_NAME LIKE '%question%'
        OR TABLE_NAME LIKE '%quiz%'
      ORDER BY TABLE_NAME
    `);
    
    console.log('📊 Found tables:');
    for (const table of tables.recordset) {
      console.log(`  - ${table.TABLE_NAME}`);
      
      // Get columns for each table
      const columns = await pool.request()
        .input('tableName', table.TABLE_NAME)
        .query(`
          SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = @tableName
          ORDER BY ORDINAL_POSITION
        `);
      
      console.log(`    Columns:`);
      columns.recordset.forEach(col => {
        const type = col.CHARACTER_MAXIMUM_LENGTH 
          ? `${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH})`
          : col.DATA_TYPE;
        console.log(`      ${col.COLUMN_NAME}: ${type} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      console.log('');
    }
    
    // Check if exam data exists
    const examCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM exams
    `);
    console.log(`\n📚 Total exams: ${examCount.recordset[0].count}`);
    
    // Check if questions exist
    const questionTables = tables.recordset.filter(t => 
      t.TABLE_NAME.includes('question') || t.TABLE_NAME.includes('quiz')
    );
    
    if (questionTables.length > 0) {
      for (const table of questionTables) {
        const count = await pool.request().query(`
          SELECT COUNT(*) as count FROM ${table.TABLE_NAME}
        `);
        console.log(`📝 Total ${table.TABLE_NAME}: ${count.recordset[0].count}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkExamTables();
