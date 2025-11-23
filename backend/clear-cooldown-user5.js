import { getPool } from './config/database.js';

async function clearCooldownUser5() {
    const pool = await getPool();
    try {
        // Check current attempts for User 5
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
            WHERE user_id = 5 AND mooc_id = 53
            ORDER BY started_at DESC
        `;
        
        const checkResult = await pool.request().query(checkQuery);
        
        console.log('=== USER 5 EXAM ATTEMPTS FOR MOOC 53 ===');
        checkResult.recordset.forEach(attempt => {
            console.log(`📋 Attempt ${attempt.attempt_id}: Started ${attempt.started_at}, Submitted: ${attempt.submitted_at || 'NOT SUBMITTED'}`);
            console.log(`📊 Score: ${attempt.score || 'NO SCORE'}, Passed: ${attempt.passed}`);
        });
        
        // Option to clear attempts (uncomment if needed)
        const clearQuery = `
            DELETE FROM exam_attempts 
            WHERE user_id = 5 AND mooc_id = 53
        `;
        
        console.log('\n🔄 Clearing exam attempts for User 5...');
        const clearResult = await pool.request().query(clearQuery);
        
        console.log(`✅ Cleared ${clearResult.rowsAffected[0]} exam attempts for User 5`);
        console.log('✅ User 5 can now take exam immediately');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.close();
    }
}

clearCooldownUser5();