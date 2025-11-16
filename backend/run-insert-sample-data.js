// =====================================================
// Execute SQL Insert Script for Pending Courses & Reports
// Node.js version (alternative to PowerShell)
// =====================================================

import { getPool } from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSqlFile() {
  const sqlFilePath = path.join(__dirname, 'insert-pending-courses-and-reports.sql');
  
  console.log('🚀 Executing SQL insert script...\n');
  console.log('📂 SQL File:', sqlFilePath);
  
  try {
    // Read SQL file
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ Error: SQL file not found at', sqlFilePath);
      process.exit(1);
    }
    
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ SQL file loaded successfully\n');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    const pool = await getPool();
    console.log('✅ Connected to SQL Server\n');
    
    // Split SQL script by GO statements (SQL Server batch separator)
    const batches = sqlScript
      .split(/\r?\nGO\r?\n/gi)
      .filter(batch => batch.trim().length > 0);
    
    console.log(`📊 Found ${batches.length} SQL batches to execute\n`);
    
    // Execute each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch.length === 0 || batch.startsWith('--')) continue;
      
      try {
        // Filter out PRINT statements (not supported in mssql driver)
        const filteredBatch = batch
          .split('\n')
          .filter(line => !line.trim().startsWith('PRINT'))
          .join('\n');
        
        if (filteredBatch.trim().length > 0 && !filteredBatch.trim().startsWith('--')) {
          await pool.request().query(filteredBatch);
          console.log(`✅ Batch ${i + 1}/${batches.length} executed`);
        }
      } catch (batchError) {
        console.error(`❌ Error in batch ${i + 1}:`, batchError.message);
        // Continue with next batch (some batches might fail if data exists)
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ SQL SCRIPT EXECUTION COMPLETED!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Verify inserted data
    console.log('🔍 Verifying inserted data...\n');
    
    const pendingCoursesResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE status IN ('pending', 'draft')
    `);
    console.log('📚 Pending/Draft courses:', pendingCoursesResult.recordset[0].count);
    
    const enrollmentsResult = await pool.request().query(`
      SELECT COUNT(*) as count FROM enrollments
    `);
    console.log('👥 Total enrollments:', enrollmentsResult.recordset[0].count);
    
    const invoicesResult = await pool.request().query(`
      SELECT COUNT(*) as count, SUM(amount) as total_revenue 
      FROM invoices 
      WHERE status = 'paid'
    `);
    console.log('💰 Paid invoices:', invoicesResult.recordset[0].count);
    console.log('💵 Total revenue:', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoicesResult.recordset[0].total_revenue || 0));
    
    console.log('\n🎯 Next steps:');
    console.log('  1. Open admin panel in browser');
    console.log('  2. Navigate to "Khóa học chờ duyệt" tab');
    console.log('  3. You should see new pending courses');
    console.log('  4. Navigate to "Báo cáo giảng viên" tab');
    console.log('  5. You should see updated instructor statistics\n');
    
    await pool.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error executing SQL script:', error.message);
    console.error('\n💡 Alternative: Open SQL Server Management Studio and run the .sql file manually\n');
    process.exit(1);
  }
}

// Run
executeSqlFile();
