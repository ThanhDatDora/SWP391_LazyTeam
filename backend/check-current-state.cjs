const path = require('path');

// Database connection configuration

async function checkCurrentState() {
    let pool;
    console.log('🔍 CHECKING CURRENT STATE...\n');
    
    try {
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        const getPool = dbMod.getPool;
        pool = await getPool();
        
        // Check exam attempts for the last 30 minutes
        console.log('📊 Recent exam attempts (last 30 minutes):');
        const recentAttempts = await pool.request().query(`
            SELECT attempt_id, user_id, mooc_id, started_at, submitted_at,
                   DATEDIFF(second, started_at, GETDATE()) as seconds_since_start
            FROM exam_attempts 
            WHERE started_at > DATEADD(minute, -30, GETDATE())
            ORDER BY started_at DESC
        `);
        
        if (recentAttempts.recordset.length > 0) {
            recentAttempts.recordset.forEach((attempt, index) => {
                const status = attempt.submitted_at ? 'COMPLETED' : 'INCOMPLETE';
                console.log(`${index + 1}. User ${attempt.user_id} - Attempt ${attempt.attempt_id} - MOOC ${attempt.mooc_id} - ${status}`);
                console.log(`   Started: ${attempt.started_at} (${attempt.seconds_since_start}s ago)`);
                if (attempt.submitted_at) {
                    console.log(`   Submitted: ${attempt.submitted_at}`);
                }
                console.log('');
            });
        } else {
            console.log('✅ No recent exam attempts\n');
        }
        
        // Check users that might be trying to take exam
        console.log('👥 User accounts that might be testing:');
        const users = await pool.request().query(`
            SELECT user_id, full_name, email, password_hash 
            FROM users 
            WHERE email IN ('huy484820@gmail.com', 'learner@example.com', 'student@example.com')
        `);
        
        users.recordset.forEach(user => {
            console.log(`- User ${user.user_id}: ${user.full_name} (${user.email})`);
            console.log(`  Password hash: ${user.password_hash.substring(0, 20)}...`);
        });
        console.log('');
        
        // Test which passwords work
        const bcrypt = require('bcrypt');
        console.log('🔐 Testing passwords:');
        
        for (const user of users.recordset) {
            const passwords = ['Learner@123', 'password123', '123456'];
            for (const password of passwords) {
                try {
                    const isValid = await bcrypt.compare(password, user.password_hash);
                    if (isValid) {
                        console.log(`✅ User ${user.user_id} (${user.email}): password "${password}" works`);
                    }
                } catch (error) {
                    // Ignore bcrypt errors
                }
            }
        }
        
        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('1. Login with: huy484820@gmail.com / Learner@123');
        console.log('2. Go to: http://localhost:5174/learn/9/exam/53');
        console.log('3. Check browser console for any errors');
        console.log('4. If still failing, clear localStorage and try again');
        
    } catch (error) {
        console.error('❌ Error:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

checkCurrentState();