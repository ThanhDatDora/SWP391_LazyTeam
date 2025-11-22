const sql = require('mssql');
const fs = require('fs');

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

async function runMigration() {
  try {
    console.log('🔧 Running migration: add is_completed column...\n');
    
    const pool = await sql.connect(config);
    
    // Read and run the SQL file
    const sqlScript = fs.readFileSync('./backend/add-enrollment-is-completed.sql', 'utf8');
    
    // Split by GO and execute each batch
    const batches = sqlScript.split(/\bGO\b/gi).filter(batch => batch.trim());
    
    for (const batch of batches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runMigration();
