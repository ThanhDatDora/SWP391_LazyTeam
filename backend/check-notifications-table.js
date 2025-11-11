import { getPool } from './config/database.js';

async function checkNotificationsTable() {
  try {
    const pool = await getPool();
    
    // Check if notifications table exists
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'notifications' OR TABLE_NAME LIKE '%notif%'
    `);
    
    console.log('🔍 Checking for notifications table...\n');
    
    if (tableCheck.recordset.length > 0) {
      console.log('✅ Found tables:');
      tableCheck.recordset.forEach(row => console.log(`  - ${row.TABLE_NAME}`));
      
      // Get table structure
      const structure = await pool.request().query(`
        SELECT 
          COLUMN_NAME, 
          DATA_TYPE, 
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${tableCheck.recordset[0].TABLE_NAME}'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('\n📋 Table structure:');
      structure.recordset.forEach(col => {
        const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${nullable}`);
      });
    } else {
      console.log('❌ No notifications table found!');
      console.log('\n💡 Suggestion: Create notifications table with:');
      console.log('  - notification_id (PK)');
      console.log('  - user_id (FK to users)');
      console.log('  - title (notification title)');
      console.log('  - message (notification content)');
      console.log('  - type (info/success/warning/error)');
      console.log('  - is_read (boolean)');
      console.log('  - link (optional URL)');
      console.log('  - created_at (timestamp)');
      
      // Check all tables
      console.log('\n📊 All tables in database:');
      const allTables = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
      allTables.recordset.forEach(row => console.log(`  - ${row.TABLE_NAME}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkNotificationsTable();
