const path = require('path');

async function getDb() {
  const { pathToFileURL } = require('url');
  const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
    return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
  });
  return dbMod;
}

async function createMissingExamRecords() {
  let pool;
  try {
    const dbMod = await getDb();
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;
    pool = await getPool();
    console.log('🔍 Connected to database successfully');

    // Check which MOOCs have questions but no exam records
    const checkQuery = `
      SELECT 
        m.mooc_id,
        m.title,
        COUNT(q.question_id) as question_count,
        e.exam_id
      FROM moocs m
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      LEFT JOIN exams e ON m.mooc_id = e.mooc_id
      WHERE m.course_id = 9
      GROUP BY m.mooc_id, m.title, e.exam_id
      HAVING COUNT(q.question_id) > 0 AND e.exam_id IS NULL
      ORDER BY m.mooc_id
    `;

  const missingExams = await pool.request().query(checkQuery);
    
    console.log('\n📋 MOOCs with questions but no exam records:');
    missingExams.recordset.forEach(mooc => {
      console.log(`MOOC ${mooc.mooc_id}: ${mooc.title} (${mooc.question_count} questions)`);
    });

    if (missingExams.recordset.length === 0) {
      console.log('✅ All MOOCs with questions already have exam records');
      return;
    }

    // Create exam records for MOOCs that have questions but no exams
    for (const mooc of missingExams.recordset) {
      console.log(`\n🎯 Creating exam record for MOOC ${mooc.mooc_id}: ${mooc.title}`);
      
      const createExamQuery = `
        INSERT INTO exams (mooc_id, name, duration_minutes, attempts_allowed, created_at)
        VALUES (@moocId, @name, @duration, @attempts, GETDATE())
      `;

      const examName = `${mooc.title} Assessment`;
      const duration = mooc.question_count <= 10 ? 20 : (mooc.question_count <= 30 ? 40 : 60);

      const request = pool.request();
      request.input('moocId', sqlLib.BigInt, mooc.mooc_id);
      request.input('name', sqlLib.NVarChar, examName);
      request.input('duration', sqlLib.Int, duration);
      request.input('attempts', sqlLib.Int, 3);

      await request.query(createExamQuery);
      console.log(`✅ Created exam: "${examName}" (${duration} minutes, 3 attempts)`);
    }

    // Verify all exams now exist
    const verifyQuery = `
      SELECT 
        m.mooc_id,
        m.title,
        COUNT(q.question_id) as question_count,
        e.exam_id,
        e.name as exam_name,
        e.duration_minutes
      FROM moocs m
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      LEFT JOIN exams e ON m.mooc_id = e.mooc_id
      WHERE m.course_id = 9
      GROUP BY m.mooc_id, m.title, e.exam_id, e.name, e.duration_minutes
      ORDER BY m.mooc_id
    `;

  const verifyResult = await pool.request().query(verifyQuery);
    
    console.log('\n✅ Final verification - All Course 9 MOOCs:');
    console.log('=' .repeat(80));
    
    verifyResult.recordset.forEach(mooc => {
      console.log(`MOOC ${mooc.mooc_id}: ${mooc.title}`);
      console.log(`  Questions: ${mooc.question_count}`);
      console.log(`  Exam: ${mooc.exam_id ? `${mooc.exam_name} (${mooc.duration_minutes}min)` : 'NO EXAM (expected for 0 questions)'}`);
      console.log('  ' + '-'.repeat(60));
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

createMissingExamRecords();