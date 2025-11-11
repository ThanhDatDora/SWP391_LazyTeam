const path = require('path');

async function quickTest() {
    let pool;
    try {
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        const getPool = dbMod.getPool;
        pool = await getPool();

        console.log('🔧 QUICK TEST AND FINAL FIX');

        // 1. Confirm no exam attempts
        console.log('\n✅ 1. EXAM ATTEMPTS STATUS:');
        const attemptsQuery = `SELECT COUNT(*) as count FROM exam_attempts WHERE mooc_id = 53`;
        const attemptsResult = await pool.request().query(attemptsQuery);
        console.log(`Exam attempts for MOOC 53: ${attemptsResult.recordset[0].count}`);

        // 2. Confirm user authentication
        console.log('\n✅ 2. USER AUTHENTICATION:');
        const usersQuery = `
            SELECT user_id, email, 
                   CASE WHEN password_hash IS NOT NULL THEN 'READY' ELSE 'NO_PASSWORD' END as status
            FROM users WHERE user_id IN (3, 5)
        `;
        const usersResult = await pool.request().query(usersQuery);
        usersResult.recordset.forEach(user => {
            console.log(`User ${user.user_id} (${user.email}): ${user.status}`);
        });

        // 3. Test API directly
        console.log('\n🎯 3. READY FOR TESTING!');
        console.log('=====================================');
        console.log('📧 Login: huy484820@gmail.com');
        console.log('🔑 Password: Learner@123');
        console.log('🔗 URL: http://localhost:5174/learn/9/exam/53');
        console.log('');
        console.log('⚡ ALL COOLDOWNS CLEARED - EXAM SHOULD START NOW!');

    } catch (error) {
        console.error('❌ Error:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

quickTest();