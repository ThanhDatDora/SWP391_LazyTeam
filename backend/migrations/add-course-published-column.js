import { getPool } from '../config/database.js';

export async function addCoursePublishedColumn() {
  try {
    console.log('🔧 Adding isPublished column to Courses table...');
    
    const pool = await getPool();
    
    // Check if column already exists
    const checkColumnResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Courses' AND COLUMN_NAME = 'isPublished'
    `);
    
    if (checkColumnResult.recordset[0].count > 0) {
      console.log('✅ isPublished column already exists in Courses table');
      return;
    }
    
    // Add isPublished column
    await pool.request().query(`
      ALTER TABLE Courses 
      ADD isPublished BIT NOT NULL DEFAULT 1
    `);
    
    console.log('✅ Successfully added isPublished column to Courses table');
    
    // Update existing courses to be published
    const updateResult = await pool.request().query(`
      UPDATE Courses 
      SET isPublished = 1 
      WHERE isPublished IS NULL
    `);
    
    console.log(`✅ Updated ${updateResult.rowsAffected[0]} existing courses to published status`);
    
  } catch (error) {
    console.error('❌ Error adding isPublished column:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addCoursePublishedColumn()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}