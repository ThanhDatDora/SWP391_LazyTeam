import { getPool } from './config/database.js';

async function checkUserColumns() {
    const pool = await getPool();
    try {
        // Check columns in users table
        const columnsQuery = `
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users'
            ORDER BY ORDINAL_POSITION
        `;
        
        const result = await pool.request().query(columnsQuery);
        
        console.log('=== USERS TABLE COLUMNS ===');
        result.recordset.forEach(col => {
            console.log(`📝 ${col.COLUMN_NAME} - ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} - ${col.IS_NULLABLE}`);
        });
        
        // Also check actual user data
        const userQuery = `
            SELECT TOP 1 * 
            FROM users 
            WHERE email = 'learner@example.com'
        `;
        
        const userResult = await pool.request().query(userQuery);
        
        if (userResult.recordset.length > 0) {
            console.log('\n=== USER DATA ===');
            const user = userResult.recordset[0];
            console.log('User keys:', Object.keys(user));
            console.log('User data:', user);
        } else {
            console.log('❌ No user found with email: learner@example.com');
        }
        
    } catch (error) {
        console.error('❌ Error checking columns:', error);
    } finally {
        await pool.close();
    }
}

checkUserColumns();