import { getPool, sql } from './config/database.js';

const checkUsersTable = async () => {
  try {
    const pool = await getPool();
    
    // Check users table structure
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📋 Users table structure:');
    result.recordset.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUsersTable();