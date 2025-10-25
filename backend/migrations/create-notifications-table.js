import { getPool } from '../config/database.js';
import sql from 'mssql';

/**
 * Migration: Create notifications table
 * Purpose: Store user notifications for bell icon feature
 */

async function createNotificationsTable() {
  try {
    console.log('🔄 Starting notifications table migration...\n');
    
    const pool = await getPool();
    
    // Check if table already exists
    const tableExists = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'notifications'
    `);
    
    if (tableExists.recordset.length > 0) {
      console.log('✅ Notifications table already exists!');
      process.exit(0);
    }
    
    // Create notifications table
    await pool.request().query(`
      CREATE TABLE notifications (
        notification_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id BIGINT NOT NULL,
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(1000) NOT NULL,
        type NVARCHAR(20) NOT NULL DEFAULT 'info',
        -- Type: 'info', 'success', 'warning', 'error', 'course_update', 'enrollment', 'certificate'
        is_read BIT NOT NULL DEFAULT 0,
        link NVARCHAR(500) NULL,
        -- Optional link to related page
        icon NVARCHAR(50) NULL,
        -- Icon name from lucide-react
        metadata NVARCHAR(MAX) NULL,
        -- JSON data for additional info
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        read_at DATETIME NULL,
        
        CONSTRAINT FK_notifications_users 
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        
        INDEX IDX_notifications_user_created 
          (user_id, created_at DESC),
        INDEX IDX_notifications_user_read 
          (user_id, is_read, created_at DESC)
      )
    `);
    
    console.log('✅ Created notifications table!');
    
    // Insert sample notifications for testing
    console.log('\n📝 Inserting sample notifications...');
    
    await pool.request()
      .input('userId', sql.BigInt, 5) // User ID 5 (huy484820@gmail.com)
      .query(`
        INSERT INTO notifications (user_id, title, message, type, icon, link)
        VALUES 
          (@userId, N'Chào mừng đến với MiniCoursera!', 
           N'Cảm ơn bạn đã đăng ký tài khoản. Hãy khám phá các khóa học thú vị!',
           'success', 'CheckCircle', '/courses'),
           
          (@userId, N'Khóa học mới đã được cập nhật', 
           N'Khóa học "React Advanced" có nội dung mới. Hãy xem ngay!',
           'course_update', 'BookOpen', '/courses/1'),
           
          (@userId, N'Profile chưa hoàn thiện', 
           N'Bạn chưa cập nhật đầy đủ thông tin cá nhân. Hãy hoàn thiện profile để trải nghiệm tốt hơn.',
           'warning', 'AlertCircle', '/my-profile')
      `);
    
    console.log('✅ Inserted 3 sample notifications!');
    
    // Show table structure
    console.log('\n📋 Table structure:');
    const structure = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'notifications'
      ORDER BY ORDINAL_POSITION
    `);
    
    structure.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${nullable}${defaultVal}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('  1. Create backend API: GET /api/notifications');
    console.log('  2. Create backend API: PUT /api/notifications/:id/read');
    console.log('  3. Update frontend Navbar to show notification count');
    console.log('  4. Create NotificationDropdown component');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createNotificationsTable();
