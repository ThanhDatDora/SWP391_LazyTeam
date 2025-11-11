const path = require('path');

async function checkQuestionOptions() {
    let pool;
    try {
        console.log('🔍 CHECKING QUESTION OPTIONS TABLE');
        
            const { pathToFileURL } = require('url');
            const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
            const getPool = dbMod.getPool;
        pool = await getPool();
        
        // Check if question_options table exists
        console.log('\n📋 Checking question_options table:');
        const tableExistsQuery = `
            SELECT COUNT(*) as exists_count
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'question_options'
        `;
        const tableExists = await pool.request().query(tableExistsQuery);
        console.log(`question_options table exists: ${tableExists.recordset[0].exists_count > 0 ? 'YES' : 'NO'}`);
        
        if (tableExists.recordset[0].exists_count > 0) {
            // Check table structure
            console.log('\n📊 question_options table structure:');
            const structureQuery = `
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'question_options'
                ORDER BY ORDINAL_POSITION
            `;
            const structureResult = await pool.request().query(structureQuery);
            structureResult.recordset.forEach(col => {
                console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
            });
            
            // Check total options
            const totalQuery = `SELECT COUNT(*) as total FROM question_options`;
            const totalResult = await pool.request().query(totalQuery);
            console.log(`\nTotal options in database: ${totalResult.recordset[0].total}`);
            
            // Check options for MOOC 53 questions
            const moocOptionsQuery = `
                SELECT COUNT(*) as count
                FROM question_options qo
                INNER JOIN questions q ON qo.question_id = q.question_id
                WHERE q.mooc_id = 53
            `;
            const moocOptionsResult = await pool.request().query(moocOptionsQuery);
            console.log(`Options for MOOC 53 questions: ${moocOptionsResult.recordset[0].count}`);
            
        } else {
            console.log('\n❌ question_options table does not exist!');
            console.log('This might be why questions have no options.');
            
            // Check what tables exist that might contain options
            console.log('\n🔍 Looking for alternative option tables:');
            const alternativeQuery = `
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME LIKE '%option%' OR TABLE_NAME LIKE '%choice%' OR TABLE_NAME LIKE '%answer%'
                ORDER BY TABLE_NAME
            `;
            const alternativeResult = await pool.request().query(alternativeQuery);
            if (alternativeResult.recordset.length > 0) {
                alternativeResult.recordset.forEach(table => {
                    console.log(`  Found table: ${table.TABLE_NAME}`);
                });
            } else {
                console.log('  No option/choice/answer tables found');
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking question options:', error.message);
    } finally {
        try {
            if (pool && typeof pool.close === 'function') await pool.close();
        } catch (e) {
            // ignore
        }
    }
}

checkQuestionOptions();