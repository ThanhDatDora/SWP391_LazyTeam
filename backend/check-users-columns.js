import sql from 'mssql';

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkUsersColumns() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);

    console.log('\n📋 Checking USERS table structure...\n');
    
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 USERS table columns:');
    result.recordset.forEach(col => {
      const maxLen = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)';
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${maxLen} ${nullable}`);
    });

    console.log('\n✅ Check column names related to profile/avatar/picture');
    const profileColumns = result.recordset.filter(col => 
      col.COLUMN_NAME.toLowerCase().includes('profile') ||
      col.COLUMN_NAME.toLowerCase().includes('avatar') ||
      col.COLUMN_NAME.toLowerCase().includes('picture')
    );
    
    if (profileColumns.length > 0) {
      console.log('\n📸 Profile-related columns found:');
      profileColumns.forEach(col => {
        console.log(`  ✅ ${col.COLUMN_NAME}`);
      });
    } else {
      console.log('\n❌ NO profile_picture, avatar, or similar columns found!');
    }

    await pool.close();
    console.log('\n✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkUsersColumns();
