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

async function checkConstraints() {
  try {
    console.log('🔍 Checking constraints on essay_submissions...\n');
    
    const pool = await sql.connect(config);

    const constraints = await pool.request().query(`
      SELECT 
        tc.CONSTRAINT_NAME,
        tc.CONSTRAINT_TYPE,
        cc.CHECK_CLAUSE
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      LEFT JOIN INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc 
        ON tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
      WHERE tc.TABLE_NAME = 'essay_submissions'
    `);

    console.log('📋 Constraints:');
    console.log('=' .repeat(80));
    constraints.recordset.forEach(c => {
      console.log(`Type: ${c.CONSTRAINT_TYPE}`);
      console.log(`Name: ${c.CONSTRAINT_NAME}`);
      if (c.CHECK_CLAUSE) {
        console.log(`Check: ${c.CHECK_CLAUSE}`);
      }
      console.log('');
    });

    // Try to insert test data
    console.log('\n🧪 Testing INSERT with status = "pending"...');
    try {
      await pool.request()
        .input('task_id', sql.BigInt, 1)
        .input('user_id', sql.BigInt, 3)
        .input('content_text', sql.NVarChar(sql.MAX), 'Test content')
        .input('file_url', sql.NVarChar(500), null)
        .input('status', sql.NVarChar(30), 'pending')
        .query(`
          INSERT INTO essay_submissions (task_id, user_id, content_text, file_url, status, submitted_at)
          VALUES (@task_id, @user_id, @content_text, @file_url, @status, GETDATE())
        `);
      console.log('✅ INSERT successful with status = "pending"');
      
      // Delete test record
      await pool.request().query(`
        DELETE FROM essay_submissions WHERE user_id = 3 AND task_id = 1
      `);
      console.log('🗑️  Test record deleted');
      
    } catch (error) {
      console.error('❌ INSERT failed:', error.message);
    }

    await pool.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkConstraints();
