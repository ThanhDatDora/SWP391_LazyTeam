const path = require('path');

(async () => {
  let pool;
  try {
    console.log('🔍 Checking course data...\n');
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;
    pool = await getPool();
    
    // Get all courses
    const courses = await pool.request().query(`
      SELECT course_id, title 
      FROM courses 
      ORDER BY course_id
    `);
    
    console.log('📚 All Courses:');
    console.log('=====================================');
    
    for (const course of courses.recordset) {
      console.log(`\n📖 Course ${course.course_id}: ${course.title}`);
      
      // Get MOOCs
      const moocs = await pool.request()
        .input('cid', sqlLib.BigInt, course.course_id)
        .query('SELECT mooc_id, title, order_no FROM moocs WHERE course_id = @cid ORDER BY order_no');
      
      // Get total lessons
      const lessons = await pool.request()
        .input('cid', sqlLib.BigInt, course.course_id)
        .query(`
          SELECT COUNT(*) as cnt 
          FROM lessons 
          WHERE mooc_id IN (SELECT mooc_id FROM moocs WHERE course_id = @cid)
        `);
      
      // Get exams
      const exams = await pool.request()
        .input('cid', sqlLib.BigInt, course.course_id)
        .query(`
          SELECT COUNT(*) as cnt 
          FROM exams 
          WHERE mooc_id IN (SELECT mooc_id FROM moocs WHERE course_id = @cid)
        `);
      
      console.log(`   MOOCs: ${moocs.recordset.length}`);
      console.log(`   Lessons: ${lessons.recordset[0].cnt}`);
      console.log(`   Exams: ${exams.recordset[0].cnt}`);
      
      if (moocs.recordset.length > 0) {
        console.log(`   \n   📝 MOOCs Details:`);
        for (const mooc of moocs.recordset) {
          const lessonCount = await pool.request()
            .input('mid', sqlLib.BigInt, mooc.mooc_id)
            .query('SELECT COUNT(*) as cnt FROM lessons WHERE mooc_id = @mid');
          
          console.log(`      ${mooc.order_no}. ${mooc.title} (${lessonCount.recordset[0].cnt} lessons)`);
        }
      } else {
        console.log(`   ⚠️  NO MOOCs - Course has no content!`);
      }
    }
    
    console.log('\n=====================================');
    console.log('✅ Check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
})();
