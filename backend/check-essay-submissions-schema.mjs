import sql from 'mssql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkEssaySubmissionsTable() {
  try {
    console.log('🔍 Checking essay_submissions table structure...\n');
    
    const pool = await sql.connect(config);

    // Get column information
    const columns = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'essay_submissions'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📊 Table: essay_submissions');
    console.log('=' .repeat(80));
    columns.recordset.forEach(col => {
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE}${length}`.padEnd(50) + nullable);
    });

    // Check if table has data
    const count = await pool.request().query(`
      SELECT COUNT(*) as total FROM essay_submissions
    `);
    console.log(`\n📝 Total submissions: ${count.recordset[0].total}`);

    // Sample submission
    const sample = await pool.request().query(`
      SELECT TOP 1 * FROM essay_submissions
    `);
    
    if (sample.recordset.length > 0) {
      console.log('\n📄 Sample submission:');
      console.log(JSON.stringify(sample.recordset[0], null, 2));
    }

    await pool.close();
    console.log('\n✅ Check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkEssaySubmissionsTable();
