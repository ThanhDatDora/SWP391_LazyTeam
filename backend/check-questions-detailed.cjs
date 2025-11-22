const path = require('path');

async function checkQuestions() {
    let pool;
    try {
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        const getPool = dbMod.getPool;
        pool = await getPool();

        console.log('🔍 CHECKING QUESTIONS AVAILABILITY');

        // Check questions table structure
        console.log('\n📋 Questions table structure:');
        const structureQuery = `
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'questions'
            ORDER BY ORDINAL_POSITION
        `;
        const structureResult = await pool.request().query(structureQuery);
        structureResult.recordset.forEach(col => {
            console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });

        // Check total questions
        console.log('\n📊 Questions count:');
        const totalQuery = `SELECT COUNT(*) as total FROM questions`;
        const totalResult = await pool.request().query(totalQuery);
        console.log(`Total questions in database: ${totalResult.recordset[0].total}`);

        // Check questions for MOOC 53
        console.log('\n🎯 Questions for MOOC 53:');
        const moocQuery = `
            SELECT COUNT(*) as count
            FROM questions 
            WHERE mooc_id = 53
        `;
        const moocResult = await pool.request().query(moocQuery);
        console.log(`Questions for MOOC 53: ${moocResult.recordset[0].count}`);

        // Check sample questions
        console.log('\n📝 Sample questions for MOOC 53:');
        const sampleQuery = `
            SELECT TOP 3 question_id, qtype, question_text
            FROM questions 
            WHERE mooc_id = 53
        `;
        const sampleResult = await pool.request().query(sampleQuery);
        if (sampleResult.recordset.length > 0) {
            sampleResult.recordset.forEach((q, i) => {
                console.log(`${i+1}. ID: ${q.question_id}, Type: ${q.qtype}, Text: ${q.question_text.substring(0, 50)}...`);
            });
        } else {
            console.log('❌ No questions found for MOOC 53!');

            // Check what MOOCs have questions
            console.log('\n🔍 Checking what MOOCs have questions:');
            const allMoocsQuery = `
                SELECT mooc_id, COUNT(*) as question_count
                FROM questions 
                GROUP BY mooc_id
                ORDER BY mooc_id
            `;
            const allMoocsResult = await pool.request().query(allMoocsQuery);
            allMoocsResult.recordset.forEach(mooc => {
                console.log(`MOOC ${mooc.mooc_id}: ${mooc.question_count} questions`);
            });
        }

    } catch (error) {
        console.error('❌ Error checking questions:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

checkQuestions();