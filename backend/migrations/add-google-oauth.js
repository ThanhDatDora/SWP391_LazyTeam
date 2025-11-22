/**
 * Database Migration: Add Google OAuth and Email Verification Support
 * This script adds columns for Google OAuth integration and email verification
 */

import { getPool } from '../config/database.js';

async function addGoogleOAuthColumns() {
  try {
    const pool = await getPool();
    
    console.log('🔄 Starting database migration...');

    // Check if google_id column exists
    const checkGoogleId = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'google_id'
    `);

    if (checkGoogleId.recordset.length === 0) {
      console.log('📊 Adding google_id column...');
      await pool.request().query(`
        ALTER TABLE users 
        ADD google_id NVARCHAR(255) NULL
      `);
      console.log('✅ google_id column added successfully');
    } else {
      console.log('⚠️ google_id column already exists');
    }

    // Check if email_verified column exists
    const checkEmailVerified = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified'
    `);

    if (checkEmailVerified.recordset.length === 0) {
      console.log('📊 Adding email_verified column...');
      await pool.request().query(`
        ALTER TABLE users 
        ADD email_verified BIT DEFAULT 0
      `);
      console.log('✅ email_verified column added successfully');
    } else {
      console.log('⚠️ email_verified column already exists');
    }

    // Create index on google_id for better performance
    try {
      await pool.request().query(`
        CREATE NONCLUSTERED INDEX IX_users_google_id 
        ON users (google_id)
        WHERE google_id IS NOT NULL
      `);
      console.log('✅ Index on google_id created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Index on google_id already exists');
      } else {
        console.log('⚠️ Failed to create index on google_id:', error.message);
      }
    }

    // Update existing users to have email_verified = 1 (assuming they were verified manually)
    const updateResult = await pool.request().query(`
      UPDATE users 
      SET email_verified = 1 
      WHERE email_verified = 0 OR email_verified IS NULL
    `);
    
    console.log(`✅ Updated ${updateResult.rowsAffected[0]} existing users to email_verified = 1`);

    console.log('🎉 Database migration completed successfully!');
    
    return {
      success: true,
      message: 'Google OAuth columns added successfully'
    };

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}

async function createOTPTable() {
  try {
    const pool = await getPool();
    
    console.log('🔄 Creating OTP table...');

    // Check if OTP table exists
    const checkTable = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'otp_codes'
    `);

    if (checkTable.recordset.length === 0) {
      await pool.request().query(`
        CREATE TABLE otp_codes (
          id BIGINT IDENTITY(1,1) PRIMARY KEY,
          email NVARCHAR(255) NOT NULL,
          otp_code NVARCHAR(10) NOT NULL,
          purpose NVARCHAR(50) NOT NULL DEFAULT 'registration',
          attempts INT DEFAULT 0,
          max_attempts INT DEFAULT 3,
          expires_at DATETIME2 NOT NULL,
          created_at DATETIME2 DEFAULT GETDATE(),
          used_at DATETIME2 NULL,
          is_used BIT DEFAULT 0,
          
          INDEX IX_otp_codes_email_purpose (email, purpose),
          INDEX IX_otp_codes_expires_at (expires_at)
        )
      `);
      console.log('✅ OTP table created successfully');
    } else {
      console.log('⚠️ OTP table already exists');
    }

  } catch (error) {
    console.error('❌ Failed to create OTP table:', error);
    throw error;
  }
}

// Main migration function
async function runMigration() {
  try {
    console.log('🚀 Starting Google OAuth & OTP Migration...');
    
    await addGoogleOAuthColumns();
    await createOTPTable();
    
    console.log('🎉 All migrations completed successfully!');
    console.log('');
    console.log('📝 Summary of changes:');
    console.log('  ✅ Added google_id column to users table');
    console.log('  ✅ Added email_verified column to users table');
    console.log('  ✅ Created index on google_id');
    console.log('  ✅ Created otp_codes table');
    console.log('  ✅ Updated existing users to email_verified = 1');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('  1. Configure Google OAuth credentials in .env');
    console.log('  2. Set up Gmail SMTP for OTP emails');
    console.log('  3. Test Google login and OTP registration');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { addGoogleOAuthColumns, createOTPTable, runMigration };