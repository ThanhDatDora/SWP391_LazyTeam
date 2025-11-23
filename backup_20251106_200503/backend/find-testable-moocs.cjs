const path = require('path');

async function findTestableMOOCs() {
  let pool;
  try {
    console.log('🔍 Finding MOOCs ready for exam testing...\n');
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    
    // Find MOOCs with ≥10 questions in exam_items
    const result = await pool.request().query(`
      SELECT 
        c.course_id,
        c.title as course_title,
        m.mooc_id,
        m.title as mooc_title,
        e.exam_id,
        e.duration_minutes,
        COUNT(ei.question_id) as question_count,
        (SELECT COUNT(*) FROM lessons WHERE mooc_id = m.mooc_id) as lesson_count
      FROM courses c
      JOIN moocs m ON c.course_id = m.course_id
      JOIN exams e ON m.mooc_id = e.mooc_id
      LEFT JOIN exam_items ei ON e.exam_id = ei.exam_id
      WHERE c.course_id BETWEEN 2 AND 8
      GROUP BY c.course_id, c.title, m.mooc_id, m.title, e.exam_id, e.duration_minutes
      HAVING COUNT(ei.question_id) >= 10
      ORDER BY c.course_id, m.mooc_id
    `);
    
    if (result.recordset.length === 0) {
      console.log('❌ No MOOCs found with ≥10 questions!');
      console.log('\n💡 Need to run: add-questions-course*.cjs scripts');
      return;
    }
    
    console.log(`✅ Found ${result.recordset.length} testable MOOCs:\n`);
    console.log('═'.repeat(80));
    
    result.recordset.forEach((mooc, index) => {
      console.log(`\n${index + 1}. 📚 ${mooc.course_title}`);
      console.log(`   MOOC ID: ${mooc.mooc_id} | "${mooc.mooc_title}"`);
      console.log(`   📝 ${mooc.question_count} questions | ⏱️  ${mooc.duration_minutes} minutes | 📖 ${mooc.lesson_count} lessons`);
      console.log(`   🎯 Ready for testing!`);
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 RECOMMENDED TEST MOOC:');
    const recommended = result.recordset[0];
    console.log(`   Course ID: ${recommended.course_id}`);
    console.log(`   MOOC ID: ${recommended.mooc_id}`);
    console.log(`   Title: ${recommended.mooc_title}`);
    console.log(`   Questions: ${recommended.question_count}`);
    
    console.log('\n📋 TEST STEPS:');
    console.log('   1. Login as test-learner@exam.com');
    console.log(`   2. Navigate to Course ${recommended.course_id}: ${recommended.course_title}`);
    console.log(`   3. Complete all ${recommended.lesson_count} lessons in MOOC ${recommended.mooc_id}`);
    console.log('   4. Click "Take Exam" button');
    console.log('   5. Complete exam flow');
    
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

findTestableMOOCs();
