const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function insertProgressData() {
  try {
    const pool = await sql.connect(config);
    
    console.log('🔍 Finding existing lessons and learner users...\n');
    
    // Get lessons from lessons table
    const lessonsResult = await pool.request().query(`
      SELECT TOP 5 lesson_id 
      FROM lessons 
      ORDER BY lesson_id
    `);
    
    // Get learner users (role_id = 3)
    const usersResult = await pool.request().query(`
      SELECT TOP 3 user_id 
      FROM users 
      WHERE role_id = 3
      ORDER BY user_id
    `);
    
    if (lessonsResult.recordset.length === 0) {
      console.log('❌ No lessons found in moocs table');
      await pool.close();
      return;
    }
    
    if (usersResult.recordset.length === 0) {
      console.log('❌ No learner users found (role_id = 3)');
      await pool.close();
      return;
    }
    
    const lessons = lessonsResult.recordset.map(r => r.lesson_id);
    const users = usersResult.recordset.map(r => r.user_id);
    
    console.log(`Found ${lessons.length} lessons:`, lessons);
    console.log(`Found ${users.length} learner users:`, users);
    console.log('\n📝 Inserting 3 progress records...\n');
    
    // Create 3 progress records with varying completion status
    const progressData = [
      {
        user_id: users[0],
        lesson_id: lessons[0],
        is_completed: 1,
        last_position_sec: 120,
        description: 'Completed lesson'
      },
      {
        user_id: users[0],
        lesson_id: lessons[1],
        is_completed: 0,
        last_position_sec: 45,
        description: 'In progress - 45 seconds'
      },
      {
        user_id: users.length > 1 ? users[1] : users[0],
        lesson_id: lessons.length > 2 ? lessons[2] : lessons[0],
        is_completed: 1,
        last_position_sec: 300,
        description: 'Completed lesson'
      }
    ];
    
    for (const data of progressData) {
      await pool.request()
        .input('user_id', sql.BigInt, data.user_id)
        .input('lesson_id', sql.BigInt, data.lesson_id)
        .input('is_completed', sql.Bit, data.is_completed)
        .input('last_position_sec', sql.Int, data.last_position_sec)
        .query(`
          INSERT INTO progress (user_id, lesson_id, is_completed, last_position_sec, updated_at)
          VALUES (@user_id, @lesson_id, @is_completed, @last_position_sec, GETDATE())
        `);
      
      console.log(`✅ Inserted: User ${data.user_id}, Lesson ${data.lesson_id} - ${data.description}`);
    }
    
    console.log('\n📊 Verifying inserted data...');
    const verify = await pool.request().query('SELECT * FROM progress');
    console.table(verify.recordset);
    
    console.log(`\n✅ Successfully inserted ${progressData.length} progress records!`);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

insertProgressData();
