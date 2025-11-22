const path = require('path');

async function clearExamCooldown() {
    let pool;
    try {
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        const getPool = dbMod.getPool;
        pool = await getPool();

        console.log('🔄 Clearing exam cooldown for all test users...');

        // Check current exam attempts for both test users
        console.log('\n📋 Current exam attempts for test users:');
        const checkQuery = `
            SELECT 
                attempt_id,
                user_id,
                mooc_id,
                started_at,
                submitted_at,
                score,
                passed
            FROM exam_attempts 
            WHERE user_id IN (3, 5) AND mooc_id = 53
            ORDER BY user_id, started_at DESC
        `;

        const checkResult = await pool.request().query(checkQuery);
        checkResult.recordset.forEach((attempt, index) => {
            console.log(`${index + 1}. User ${attempt.user_id} - Attempt ${attempt.attempt_id} - Started: ${attempt.started_at} - Submitted: ${attempt.submitted_at || 'NOT SUBMITTED'}`);
        });

        // Delete all unfinished exam attempts to clear cooldowns
        console.log('\n🗑️ Deleting all unfinished exam attempts...');
        const deleteQuery = `
            DELETE FROM exam_attempts 
            WHERE user_id IN (3, 5) AND mooc_id = 53 AND submitted_at IS NULL
        `;

        const deleteResult = await pool.request().query(deleteQuery);
        console.log(`✅ Deleted ${deleteResult.rowsAffected[0]} unfinished attempts`);

        // Verify the cooldown is cleared
        console.log('\n🔍 Verifying cooldown clearance:');
        const verifyResult = await pool.request().query(checkQuery);

        if (verifyResult.recordset.length === 0) {
            console.log('✅ No unfinished exam attempts remaining - cooldowns completely cleared!');
        } else {
            console.log('📋 Remaining attempts (only completed ones):');
            verifyResult.recordset.forEach((attempt, index) => {
                console.log(`${index + 1}. User ${attempt.user_id} - Attempt ${attempt.attempt_id} - Started: ${attempt.started_at} - Submitted: ${attempt.submitted_at}`);
            });
        }

        console.log('\n🎯 COOLDOWNS CLEARED FOR ALL TEST USERS!');
        console.log('✅ User 5 (huy484820@gmail.com) can now start fresh exam');
        console.log('✅ User 3 (learner@example.com) can now start fresh exam');
        console.log('🔧 Try accessing the exam: http://localhost:5174/learn/9/exam/53');

    } catch (error) {
        console.error('❌ Error clearing cooldown:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

clearExamCooldown();