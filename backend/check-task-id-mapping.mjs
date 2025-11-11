import sql from 'mssql';

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

async function checkTaskMapping() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n📋 Checking lesson → task mapping...\n');
    
    // Check if lessons have corresponding essay_tasks
    const result = await pool.request().query(`
      SELECT 
        l.lesson_id,
        l.title as lesson_title,
        l.lesson_type,
        et.task_id,
        et.task_title,
        et.task_description
      FROM lessons l
      LEFT JOIN essay_tasks et ON l.lesson_id = et.lesson_id
      WHERE l.lesson_type = 'assignment'
      ORDER BY l.lesson_id;
    `);
    
    console.log(`Total assignment lessons: ${result.recordset.length}`);
    console.log('\n📊 First 10 lessons:\n');
    
    result.recordset.slice(0, 10).forEach(row => {
      const hasTask = row.task_id ? '✅' : '❌';
      console.log(`${hasTask} Lesson ${row.lesson_id}: ${row.lesson_title}`);
      console.log(`   Task ID: ${row.task_id || 'MISSING!'}`);
      console.log(`   Task Title: ${row.task_title || 'N/A'}`);
      console.log('');
    });
    
    // Count lessons without tasks
    const withoutTasks = result.recordset.filter(r => !r.task_id);
    
    if (withoutTasks.length > 0) {
      console.log(`⚠️  WARNING: ${withoutTasks.length} assignment lessons have NO essay_task!\n`);
      console.log('Lessons without tasks:');
      withoutTasks.forEach(l => {
        console.log(`   - Lesson ${l.lesson_id}: ${l.lesson_title}`);
      });
    } else {
      console.log('✅ All assignment lessons have essay_tasks!\n');
    }
    
    // Show what the frontend is likely sending
    console.log('\n🔍 Sample test: If frontend sends lesson_id = 1...\n');
    const testResult = await pool.request()
      .input('lessonId', sql.Int, 1)
      .query(`
        SELECT task_id 
        FROM essay_tasks 
        WHERE lesson_id = @lessonId
      `);
    
    if (testResult.recordset.length > 0) {
      console.log(`✅ Found task_id: ${testResult.recordset[0].task_id}`);
      console.log('   Backend should use this task_id for INSERT!\n');
    } else {
      console.log('❌ No task found for lesson_id = 1\n');
    }
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTaskMapping();
