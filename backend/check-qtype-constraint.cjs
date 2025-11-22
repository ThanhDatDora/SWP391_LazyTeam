const path = require('path');

async function checkQtypeValues() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;

    pool = await getPool();
    console.log('🔗 Connected to database');

    // Check constraint details
    console.log('\n🔍 Checking qtype constraint...');
    const constraintResult = await pool.request().query(`
      SELECT cc.name as constraint_name,
             cc.definition,
             t.name as table_name,
             c.name as column_name
      FROM sys.check_constraints cc
      JOIN sys.tables t ON cc.parent_object_id = t.object_id
      JOIN sys.columns c ON cc.parent_object_id = c.object_id 
      WHERE t.name = 'questions' AND c.name = 'qtype'
    `);
    
    console.log('Constraint details:');
    constraintResult.recordset.forEach(row => {
      console.log(`- ${row.constraint_name}: ${row.definition}`);
    });

    // Check existing qtype values in database
    console.log('\n📊 Existing qtype values in questions table:');
    const qtypeResult = await pool.request().query(`
      SELECT DISTINCT qtype, COUNT(*) as count
      FROM questions
      GROUP BY qtype
      ORDER BY qtype
    `);
    
    qtypeResult.recordset.forEach(row => {
      console.log(`- "${row.qtype}": ${row.count} questions`);
    });

    // Check a few sample questions
    console.log('\n🔍 Sample questions with qtype:');
    const sampleResult = await pool.request().query(`
      SELECT TOP 5 question_id, mooc_id, qtype, stem
      FROM questions
      ORDER BY question_id
    `);
    
    sampleResult.recordset.forEach(q => {
      console.log(`- Q${q.question_id} (MOOC ${q.mooc_id}): qtype="${q.qtype}"`);
      console.log(`  Stem: ${q.stem?.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message || error);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

checkQtypeValues();