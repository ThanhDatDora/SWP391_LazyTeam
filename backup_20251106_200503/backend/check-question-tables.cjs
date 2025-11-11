const path = require('path');
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional
}

async function checkTables() {
    let pool;
    try {
        console.log('🔗 Connecting to database...');
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
          return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        });
        const getPool = dbMod.getPool;
        pool = await getPool();
        console.log('✅ Connected successfully!');
        
        // Check all tables in database
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        console.log('\n📋 All tables in database:');
        result.recordset.forEach(row => {
            console.log(`- ${row.TABLE_NAME}`);
        });
        
        // Check specifically for question-related tables
        const questionTables = result.recordset.filter(row => 
            row.TABLE_NAME.toLowerCase().includes('question')
        );
        
        console.log('\n❓ Question-related tables:');
        questionTables.forEach(row => {
            console.log(`- ${row.TABLE_NAME}`);
        });
        
        // Check questions table structure if it exists
        const questionsTable = questionTables.find(row => 
            row.TABLE_NAME.toLowerCase() === 'questions'
        );
        
        if (questionsTable) {
            console.log('\n📊 Questions table structure:');
            const structure = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'questions'
                ORDER BY ORDINAL_POSITION
            `);
            
            structure.recordset.forEach(col => {
                console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
            });
            
            // Sample data
            const sample = await pool.request().query(`
                SELECT TOP 3 * FROM questions
            `);
            
            console.log('\n🔍 Sample questions data:');
            sample.recordset.forEach(q => {
                console.log(`- ID ${q.question_id}: ${q.stem?.substring(0, 50)}...`);
                console.log(`  MOOC: ${q.mooc_id}, Type: ${q.qtype}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

checkTables();