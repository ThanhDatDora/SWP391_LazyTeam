const path = require('path');

async function fixUser5Password() {
    let pool;
    try {
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        const getPool = dbMod.getPool;
        const sqlLib = dbMod.sql;

        pool = await getPool();

        console.log('🔧 Fixing User 5 password by copying from working user...');
        
        // Get password hash from User 3 (learner@example.com) which we know works
        console.log('\n🔍 Getting working password hash from User 3...');
        const workingUserQuery = `
            SELECT user_id, email, password_hash
            FROM users 
            WHERE user_id = 3
        `;
        
        const workingUserResult = await pool.request().query(workingUserQuery);
        if (workingUserResult.recordset.length === 0) {
            console.log('❌ User 3 not found!');
            return;
        }
        
        const workingUser = workingUserResult.recordset[0];
        console.log(`📧 Working user: ${workingUser.email}`);
        console.log(`🔑 Has password hash: ${workingUser.password_hash ? 'YES' : 'NO'}`);
        
        // Copy the password hash to User 5
        console.log('\n🔄 Copying password hash to User 5...');
        const updateQuery = `
            UPDATE users 
            SET password_hash = @passwordHash
            WHERE user_id = 5
        `;
        
        const request = pool.request();
        request.input('passwordHash', sqlLib.NVarChar, workingUser.password_hash);
        
        await request.query(updateQuery);
        
        console.log('✅ Password hash copied successfully!');
        
        // Verify both users now have the same password
        console.log('\n🔍 Verifying users...');
        const verifyQuery = `
            SELECT user_id, email, 
                   CASE WHEN password_hash IS NOT NULL THEN 'HAS_HASH' ELSE 'NO_HASH' END as hash_status
            FROM users 
            WHERE user_id IN (3, 5)
            ORDER BY user_id
        `;
        
        const verifyResult = await pool.request().query(verifyQuery);
        verifyResult.recordset.forEach(user => {
            console.log(`User ${user.user_id} (${user.email}): ${user.hash_status}`);
        });
        
        console.log('\n🎯 Both users now use the same password!');
        console.log('📧 User 3: learner@example.com - Password: Learner@123');
        console.log('📧 User 5: huy484820@gmail.com - Password: Learner@123');
        console.log('🔧 Try login with Learner@123 for both users!');
        
    } catch (error) {
        console.error('❌ Error fixing password:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

fixUser5Password();