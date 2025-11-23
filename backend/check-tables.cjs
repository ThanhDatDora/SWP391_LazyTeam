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

async function checkTables() {
  try {
    const pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n=== ALL TABLES ===');
    result.recordset.forEach((row, i) => {
      console.log(`${i + 1}. ${row.TABLE_NAME}`);
    });
    
    console.log('\n=== FILTERING lesson/progress ===');
    const filtered = result.recordset.filter(r => 
      r.TABLE_NAME.toLowerCase().includes('lesson') || 
      r.TABLE_NAME.toLowerCase().includes('progress')
    );
    filtered.forEach(row => console.log(`✅ ${row.TABLE_NAME}`));
    
    if (filtered.length === 0) {
      console.log('❌ No lesson_progress table found!');
      console.log('\n💡 Need to create lesson_progress table');
    }
    
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
