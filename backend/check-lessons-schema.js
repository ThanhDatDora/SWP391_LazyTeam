import sql from 'mssql';
import { getPool } from './config/database.js';

async function checkSchema() {
  try {
    const pool = await getPool();
    
    // Check lessons columns
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'lessons'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('=== LESSONS TABLE SCHEMA ===\n');
    result.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH || 'N/A';
      console.log(`${col.COLUMN_NAME}: ${col.DATA_TYPE}(${length})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.close();
  }
}

checkSchema();
