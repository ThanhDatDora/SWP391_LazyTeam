import sql from 'mssql';
import { getPool } from './config/database.js';

async function alterLessonsTable() {
  try {
    const pool = await getPool();
    
    console.log('📝 Altering lessons table...\n');
    
    // Alter content_url to NVARCHAR(MAX) to support long JSON content
    await pool.request().query(`
      ALTER TABLE lessons
      ALTER COLUMN content_url NVARCHAR(MAX)
    `);
    
    console.log('✅ Successfully altered content_url to NVARCHAR(MAX)');
    console.log('✅ Can now store long JSON content for reading materials, quizzes, etc.\n');
    
    // Verify
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'lessons' AND COLUMN_NAME = 'content_url'
    `);
    
    console.log('📊 Updated schema:');
    console.log(result.recordset[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
  }
}

alterLessonsTable();
