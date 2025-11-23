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

(async () => {
  try {
    const pool = await sql.connect(config);
    
    // Check if file_url and submitted_at columns exist
    const columns = await pool.request()
      .query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'essay_submissions' 
        AND COLUMN_NAME IN ('file_url', 'submitted_at')
      `);
    
    const existingColumns = columns.recordset.map(c => c.COLUMN_NAME);
    
    if (!existingColumns.includes('file_url')) {
      console.log('➕ Adding file_url column...');
      await pool.request().query(`
        ALTER TABLE essay_submissions 
        ADD file_url NVARCHAR(500) NULL
      `);
      console.log('✅ Added file_url column');
    } else {
      console.log('✓ file_url column already exists');
    }
    
    if (!existingColumns.includes('submitted_at')) {
      console.log('➕ Adding submitted_at column...');
      await pool.request().query(`
        ALTER TABLE essay_submissions 
        ADD submitted_at DATETIME2 NULL
      `);
      console.log('✅ Added submitted_at column');
    } else {
      console.log('✓ submitted_at column already exists');
    }
    
    console.log('\n✅ Database schema updated!');
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
