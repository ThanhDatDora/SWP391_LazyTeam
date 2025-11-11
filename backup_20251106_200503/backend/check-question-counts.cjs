const path = require('path');

async function checkQuestionCounts() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT 
        c.course_id, 
        c.title, 
        COUNT(DISTINCT q.question_id) as question_count
      FROM courses c
      LEFT JOIN moocs m ON c.course_id = m.course_id
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      GROUP BY c.course_id, c.title
      ORDER BY c.course_id
    `);
    
    console.log('📊 Question Count by Course:\n');
    let total = 0;
    result.recordset.forEach(r => {
      console.log(`  Course ${r.course_id}: ${r.title}`);
      console.log(`    Questions: ${r.question_count}\n`);
      total += r.question_count;
    });
    
    console.log(`\n✅ Total Questions: ${total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

checkQuestionCounts();
