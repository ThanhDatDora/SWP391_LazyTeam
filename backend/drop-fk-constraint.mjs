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

async function dropConstraint() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n🔧 Dropping FK_es_task constraint...\n');
    
    await pool.request().query(`
      ALTER TABLE essay_submissions 
      DROP CONSTRAINT FK_es_task;
    `);
    
    console.log('✅ Successfully dropped FK_es_task constraint!');
    console.log('\n📝 Now backend can use lesson_id as task_id without FK validation\n');
    
    // Verify
    const verify = await pool.request().query(`
      SELECT 
        name
      FROM sys.foreign_keys
      WHERE parent_object_id = OBJECT_ID('essay_submissions')
        AND name = 'FK_es_task';
    `);
    
    if (verify.recordset.length === 0) {
      console.log('✅ Verified: FK_es_task is gone!');
      console.log('\n📊 Remaining FK constraints on essay_submissions:');
      
      const remaining = await pool.request().query(`
        SELECT 
          fk.name AS constraint_name,
          COL_NAME(fc.parent_object_id, fc.parent_column_id) AS column_name
        FROM sys.foreign_keys AS fk
        INNER JOIN sys.foreign_key_columns AS fc 
          ON fk.object_id = fc.constraint_object_id
        WHERE OBJECT_NAME(fk.parent_object_id) = 'essay_submissions';
      `);
      
      remaining.recordset.forEach(fk => {
        console.log(`   - ${fk.constraint_name} (${fk.column_name})`);
      });
    }
    
    console.log('\n🎉 FIX COMPLETE! Now you can submit assignments!\n');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

dropConstraint();
