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

async function createTasksForLessons() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n📝 Creating essay_tasks for assignment lessons...\n');
    
    // Get all assignment lessons without tasks
    const lessons = await pool.request().query(`
      SELECT 
        l.lesson_id,
        l.mooc_id,
        l.title,
        l.content_type
      FROM lessons l
      WHERE (l.content_type = 'assignment' OR l.content_type LIKE '%assignment%')
        AND NOT EXISTS (
          SELECT 1 FROM essay_tasks et 
          WHERE et.task_id = l.lesson_id
        )
      ORDER BY l.mooc_id, l.lesson_id;
    `);
    
    console.log(`Found ${lessons.recordset.length} assignment lessons without tasks\n`);
    
    if (lessons.recordset.length === 0) {
      console.log('✅ All assignment lessons already have tasks!');
      await pool.close();
      return;
    }
    
    // Create essay_task for each lesson
    for (const lesson of lessons.recordset) {
      try {
        await pool.request()
          .input('taskId', sql.BigInt, lesson.lesson_id)
          .input('moocId', sql.BigInt, lesson.mooc_id)
          .input('title', sql.NVarChar(200), lesson.title)
          .input('maxScore', sql.Decimal(5, 2), 10) // Default max score
          .input('dueAt', sql.DateTime2, null)
          .query(`
            INSERT INTO essay_tasks (task_id, mooc_id, title, max_score, due_at)
            VALUES (@taskId, @moocId, @title, @maxScore, @dueAt)
          `);
        
        console.log(`✅ Created task ${lesson.lesson_id} for: ${lesson.title}`);
      } catch (err) {
        console.error(`❌ Failed to create task for lesson ${lesson.lesson_id}:`, err.message);
      }
    }
    
    console.log(`\n✅ Done! Created tasks for ${lessons.recordset.length} lessons`);
    
    // Verify
    const verify = await pool.request().query('SELECT COUNT(*) as count FROM essay_tasks');
    console.log(`\n📊 Total essay_tasks now: ${verify.recordset[0].count}`);
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

createTasksForLessons();
