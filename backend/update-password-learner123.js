import { getPool } from './config/database.js';
import bcrypt from 'bcryptjs';

async function updatePasswordToLearner123() {
    const pool = await getPool();
    try {
        // Hash the new password
        const newPassword = 'Learner@123';
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        console.log(`🔑 Updating password for learner@example.com to: ${newPassword}`);
        console.log(`🔐 Hashed password: ${hashedPassword}`);
        
        // Update user password
        const updateQuery = `
            UPDATE users 
            SET password_hash = @password 
            WHERE email = @email
        `;
        
        const request = pool.request();
        request.input('password', hashedPassword);
        request.input('email', 'learner@example.com');
        
        const result = await request.query(updateQuery);
        
        if (result.rowsAffected[0] > 0) {
            console.log(`✅ Password updated for learner@example.com to: ${newPassword}`);
            
            // Verify the user
            const verifyQuery = `
                SELECT user_id, full_name, email, password_hash 
                FROM users 
                WHERE email = @email
            `;
            
            const verifyRequest = pool.request();
            verifyRequest.input('email', 'learner@example.com');
            const userResult = await verifyRequest.query(verifyQuery);
            
            if (userResult.recordset.length > 0) {
                const user = userResult.recordset[0];
                console.log(`✅ User verified: ${user.full_name} (ID: ${user.user_id})`);
                
                // Test password comparison
                const isMatch = await bcrypt.compare(newPassword, user.password_hash);
                console.log(`✅ Password verification: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
            }
        } else {
            console.log(`❌ No user found with email: learner@example.com`);
        }
        
    } catch (error) {
        console.error('❌ Error updating password:', error);
    } finally {
        await pool.close();
    }
}

updatePasswordToLearner123();