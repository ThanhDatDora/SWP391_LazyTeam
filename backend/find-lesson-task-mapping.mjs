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

async function findMapping() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n📊 Finding relationship between lessons and essay_tasks...\n');
    
    // Get lesson data
    const lessonsResult = await pool.request().query(`
      SELECT TOP 10
        lesson_id, mooc_id, title, content_type, order_no
      FROM lessons
      WHERE content_type = 'assignment' OR content_type LIKE '%assignment%'
      ORDER BY mooc_id, order_no;
    `);
    
    console.log(`✅ Found ${lessonsResult.recordset.length} assignment-type lessons:\n`);
    lessonsResult.recordset.forEach(l => {
      console.log(`   Lesson ${l.lesson_id} (MOOC ${l.mooc_id}): ${l.title} [${l.content_type}]`);
    });
    
    // Get essay_tasks data
    const tasksResult = await pool.request().query(`
      SELECT task_id, mooc_id, title, max_score
      FROM essay_tasks
      ORDER BY mooc_id;
    `);
    
    console.log(`\n✅ Found ${tasksResult.recordset.length} essay_tasks:\n`);
    tasksResult.recordset.forEach(t => {
      console.log(`   Task ${t.task_id} (MOOC ${t.mooc_id}): ${t.title} [max: ${t.max_score}]`);
    });
    
    // Try to find matching mooc_id
    console.log('\n\n🔗 Attempting to match by mooc_id...\n');
    
    if (lessonsResult.recordset.length > 0 && tasksResult.recordset.length > 0) {
      const lesson = lessonsResult.recordset[0];
      const matchingTask = tasksResult.recordset.find(t => t.mooc_id === lesson.mooc_id);
      
      if (matchingTask) {
        console.log(`✅ MATCH FOUND!`);
        console.log(`   Lesson ${lesson.lesson_id}: "${lesson.title}"`);
        console.log(`   → Task ${matchingTask.task_id}: "${matchingTask.title}"`);
        console.log(`   Both in MOOC ${lesson.mooc_id}`);
        console.log('\n💡 Solution: Backend should find task_id by matching mooc_id!');
      } else {
        console.log(`❌ No matching task found for lesson mooc_id ${lesson.mooc_id}`);
      }
    }
    
    // Suggest fix
    console.log('\n\n📝 BACKEND FIX NEEDED:\n');
    console.log('Instead of using lesson_id directly, backend should:');
    console.log('1. Receive lesson_id from frontend');
    console.log('2. Query lessons table to get mooc_id');
    console.log('3. Query essay_tasks to get task_id by mooc_id');
    console.log('4. Use that task_id for essay_submissions INSERT');
    
    console.log('\n📄 Example SQL query:\n');
    console.log(`
    SELECT et.task_id 
    FROM lessons l
    JOIN essay_tasks et ON l.mooc_id = et.mooc_id
    WHERE l.lesson_id = @lessonId;
    `);
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

findMapping();
