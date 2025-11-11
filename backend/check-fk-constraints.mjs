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

async function checkFK() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n🔗 Checking FOREIGN KEY constraints on essay_submissions...\n');
    
    const result = await pool.request().query(`
      SELECT 
        fk.name AS constraint_name,
        OBJECT_NAME(fk.parent_object_id) AS table_name,
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS column_name,
        OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
        COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS referenced_column
      FROM sys.foreign_keys AS fk
      INNER JOIN sys.foreign_key_columns AS fc 
        ON fk.object_id = fc.constraint_object_id
      WHERE OBJECT_NAME(fk.parent_object_id) = 'essay_submissions'
      ORDER BY fk.name;
    `);
    
    console.log('Found ' + result.recordset.length + ' FOREIGN KEY constraints:\n');
    
    result.recordset.forEach(fk => {
      console.log(`✅ ${fk.constraint_name}:`);
      console.log(`   ${fk.table_name}.${fk.column_name} → ${fk.referenced_table}.${fk.referenced_column}\n`);
    });
    
    // Check if FK_es_task exists
    const taskFK = result.recordset.find(fk => fk.constraint_name === 'FK_es_task');
    if (taskFK) {
      console.log('\n⚠️  PROBLEM FOUND:');
      console.log(`   FK_es_task constraint requires task_id to exist in essay_tasks table`);
      console.log(`   But essay_tasks only has 1 record (task_id=1)`);
      console.log(`   And lessons don't have corresponding tasks!\n`);
      
      console.log('\n💡 SOLUTIONS:\n');
      console.log('Option 1: Drop FK_es_task constraint (fastest)');
      console.log('   ALTER TABLE essay_submissions DROP CONSTRAINT FK_es_task;\n');
      
      console.log('Option 2: Create essay_tasks for each lesson (complex)');
      console.log('   Need to handle IDENTITY column and create mapping\n');
      
      console.log('Option 3: Change backend to NOT use essay_tasks');
      console.log('   Store lesson_id directly in essay_submissions\n');
    }
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFK();
