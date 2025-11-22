/**
 * Database Migration: Add Instructor Profile Support
 * This script creates instructors table for additional instructor information
 */

import { getPool } from '../config/database.js';

async function createInstructorTable() {
  try {
    const pool = await getPool();
    
    console.log('🔄 Creating instructors table...');

    // Check if instructors table exists
    const checkTable = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'instructors'
    `);

    if (checkTable.recordset.length === 0) {
      await pool.request().query(`
        CREATE TABLE instructors (
          instructor_id BIGINT IDENTITY(1,1) PRIMARY KEY,
          user_id BIGINT NOT NULL,
          headline NVARCHAR(500) NULL,
          bio NTEXT NULL,
          degrees_and_certificates NTEXT NULL,
          work_history NTEXT NULL,
          awards NTEXT NULL,
          documents NVARCHAR(MAX) NULL, -- JSON field for document URLs
          verified BIT DEFAULT 0,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE(),
          
          CONSTRAINT FK_instructors_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          CONSTRAINT UQ_instructors_user_id UNIQUE (user_id)
        )
      `);
      
      // Create indexes
      await pool.request().query(`
        CREATE NONCLUSTERED INDEX IX_instructors_user_id ON instructors (user_id);
        CREATE NONCLUSTERED INDEX IX_instructors_verified ON instructors (verified);
      `);
      
      console.log('✅ Instructors table created successfully');
    } else {
      console.log('⚠️ Instructors table already exists');
    }

    return {
      success: true,
      message: 'Instructor table setup completed'
    };

  } catch (error) {
    console.error('❌ Failed to create instructor table:', error);
    throw error;
  }
}

// Main migration function
async function runInstructorMigration() {
  try {
    console.log('🚀 Starting Instructor Profile Migration...');
    
    await createInstructorTable();
    
    console.log('🎉 Instructor migration completed successfully!');
    console.log('');
    console.log('📝 Summary of changes:');
    console.log('  ✅ Created instructors table');
    console.log('  ✅ Added foreign key to users table');
    console.log('  ✅ Created necessary indexes');
    console.log('');
    console.log('📊 Table structure:');
    console.log('  - instructor_id (Primary Key)');
    console.log('  - user_id (Foreign Key to users)');
    console.log('  - headline (Short description)');
    console.log('  - bio (Detailed biography)');
    console.log('  - degrees_and_certificates (Education background)');
    console.log('  - work_history (Work experience)');
    console.log('  - awards (Achievements and awards)');
    console.log('  - documents (JSON - document URLs)');
    console.log('  - verified (Admin verification status)');
    
  } catch (error) {
    console.error('💥 Instructor migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runInstructorMigration();
}

export { createInstructorTable, runInstructorMigration };