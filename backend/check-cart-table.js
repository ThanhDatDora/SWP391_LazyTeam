import { getPool } from './config/database.js';

async function checkCartTable() {
    try {
        const pool = await getPool();
        
        // Check if cart table exists
        const tableCheck = await pool.request().query(`
            SELECT * FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'cart'
        `);
        
        if (tableCheck.recordset.length > 0) {
            console.log('✅ Cart table EXISTS in database');
            
            // Get table structure
            const columns = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'cart'
                ORDER BY ORDINAL_POSITION
            `);
            
            console.log('\n📋 Cart table structure:');
            columns.recordset.forEach(col => {
                console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
            
            // Count records
            const count = await pool.request().query('SELECT COUNT(*) as total FROM cart');
            console.log(`\n📊 Total cart items in database: ${count.recordset[0].total}`);
            
        } else {
            console.log('❌ Cart table DOES NOT EXIST in database');
            console.log('\n💡 To create cart table, run:');
            console.log('   sqlcmd -S localhost -U sa -P YourPassword -d MiniCoursera_Primary -i backend\\migrations\\create-cart-table.sql');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking cart table:', error.message);
        process.exit(1);
    }
}

checkCartTable();
