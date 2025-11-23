import { getPool } from './config/database.js';

async function checkTables() {
  try {
    const pool = await getPool();
    
    console.log('📋 Getting database tables...');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('🗂️ Available tables:');
    tables.recordset.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    // Check if we have users table structure
    if (tables.recordset.find(t => t.TABLE_NAME === 'users')) {
      console.log('\n📊 Users table structure:');
      const userColumns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION
      `);
      
      userColumns.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    console.log('\n✅ Database check completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    process.exit(1);
  }
}

checkTables();