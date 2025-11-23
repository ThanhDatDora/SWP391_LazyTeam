import { getPool } from '../config/database.js';
import sql from 'mssql';

const addProfileFields = async () => {
  console.log('🔧 Starting migration: Add profile fields to users table...\n');

  try {
    const pool = await getPool();

    // Check if columns already exist
    const checkColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('phone', 'address', 'bio', 'avatar_url', 'date_of_birth', 'gender')
    `);

    const existingColumns = checkColumns.recordset.map(row => row.COLUMN_NAME);
    console.log('📋 Existing profile columns:', existingColumns.length > 0 ? existingColumns.join(', ') : 'None');

    // Add phone column
    if (!existingColumns.includes('phone')) {
      await pool.request().query(`
        ALTER TABLE users
        ADD phone NVARCHAR(20) NULL
      `);
      console.log('  ✅ Added phone column');
    } else {
      console.log('  ⏭️  phone column already exists');
    }

    // Add address column
    if (!existingColumns.includes('address')) {
      await pool.request().query(`
        ALTER TABLE users
        ADD address NVARCHAR(500) NULL
      `);
      console.log('  ✅ Added address column');
    } else {
      console.log('  ⏭️  address column already exists');
    }

    // Add bio column
    if (!existingColumns.includes('bio')) {
      await pool.request().query(`
        ALTER TABLE users
        ADD bio NVARCHAR(MAX) NULL
      `);
      console.log('  ✅ Added bio column');
    } else {
      console.log('  ⏭️  bio column already exists');
    }

    // Add avatar_url column
    if (!existingColumns.includes('avatar_url')) {
      await pool.request().query(`
        ALTER TABLE users
        ADD avatar_url NVARCHAR(500) NULL
      `);
      console.log('  ✅ Added avatar_url column');
    } else {
      console.log('  ⏭️  avatar_url column already exists');
    }

    // Add date_of_birth column
    if (!existingColumns.includes('date_of_birth')) {
      await pool.request().query(`
        ALTER TABLE users
        ADD date_of_birth DATE NULL
      `);
      console.log('  ✅ Added date_of_birth column');
    } else {
      console.log('  ⏭️  date_of_birth column already exists');
    }

    // Add gender column
    if (!existingColumns.includes('gender')) {
      await pool.request().query(`
        ALTER TABLE users
        ADD gender NVARCHAR(10) NULL
      `);
      console.log('  ✅ Added gender column');
    } else {
      console.log('  ⏭️  gender column already exists');
    }

    // Display final table structure
    console.log('\n📊 Updated users table structure:');
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

    result.recordset.forEach(col => {
      const type = col.DATA_TYPE;
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`   - ${col.COLUMN_NAME}: ${type}${length} ${nullable}`);
    });

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
};

addProfileFields();
