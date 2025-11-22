import { getPool } from './config/database.js';

async function checkExamTablesStructure() {
    const pool = await getPool();
    try {
        // Check what exam-related tables exist
        const tablesQuery = `
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME LIKE '%exam%' OR TABLE_NAME LIKE '%attempt%'
            ORDER BY TABLE_NAME
        `;
        
        const tablesResult = await pool.request().query(tablesQuery);
        
        console.log('=== EXAM-RELATED TABLES ===');
        tablesResult.recordset.forEach(table => {
            console.log(`📋 ${table.TABLE_NAME}`);
        });
        
        // Check each table structure
        for (const table of tablesResult.recordset) {
            const tableName = table.TABLE_NAME;
            
            const columnsQuery = `
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${tableName}'
                ORDER BY ORDINAL_POSITION
            `;
            
            const columnsResult = await pool.request().query(columnsQuery);
            
            console.log(`\n=== ${tableName.toUpperCase()} COLUMNS ===`);
            columnsResult.recordset.forEach(col => {
                console.log(`📝 ${col.COLUMN_NAME} - ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} - ${col.IS_NULLABLE}`);
            });
            
            // Check sample data
            try {
                const sampleQuery = `SELECT TOP 3 * FROM ${tableName}`;
                const sampleResult = await pool.request().query(sampleQuery);
                
                if (sampleResult.recordset.length > 0) {
                    console.log(`\n=== ${tableName.toUpperCase()} SAMPLE DATA ===`);
                    sampleResult.recordset.forEach((row, index) => {
                        console.log(`Row ${index + 1}:`, row);
                    });
                } else {
                    console.log(`\n❌ No data in ${tableName}`);
                }
            } catch (sampleError) {
                console.log(`\n❌ Error reading ${tableName} sample:`, sampleError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking exam tables:', error);
    } finally {
        await pool.close();
    }
}

checkExamTablesStructure();