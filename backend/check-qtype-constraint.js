import { getPool } from './config/database.js';

async function checkQtypeConstraint() {
  try {
    const pool = await getPool();

    console.log('🔍 Checking qtype constraint...\n');

    // Get constraint definition
    const constraint = await pool.request().query(`
      SELECT 
        cc.name AS constraint_name,
        cc.definition
      FROM sys.check_constraints cc
      JOIN sys.columns c ON cc.parent_column_id = c.column_id AND cc.parent_object_id = c.object_id
      WHERE c.name = 'qtype' AND OBJECT_NAME(c.object_id) = 'questions'
    `);

    if (constraint.recordset.length > 0) {
      console.log('📋 Constraint definition:');
      console.log(constraint.recordset[0]);
    } else {
      console.log('❌ No constraint found for qtype column');
    }

    // Get existing qtype values
    console.log('\n📊 Existing qtype values in questions table:');
    const existing = await pool.request().query(`
      SELECT DISTINCT qtype FROM questions
    `);
    console.log(existing.recordset);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkQtypeConstraint();
