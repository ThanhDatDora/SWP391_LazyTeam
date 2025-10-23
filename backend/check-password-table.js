import { getPool, sql } from './config/database.js';

const checkTable = async () => {
  try {
    const pool = await getPool();
    
    // Create table if not exists  
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='password_resets' AND xtype='U')
      BEGIN
        CREATE TABLE password_resets (
          id BIGINT IDENTITY(1,1) PRIMARY KEY,
          user_id BIGINT NOT NULL,
          reset_token NVARCHAR(10) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          used BIT DEFAULT 0,
          used_at DATETIME NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
        
        CREATE INDEX IX_password_resets_token ON password_resets(reset_token);
        CREATE INDEX IX_password_resets_user_id ON password_resets(user_id);
        CREATE INDEX IX_password_resets_expires ON password_resets(expires_at);
        
        PRINT 'Password resets table created successfully!';
      END
    `);
    
    // Check if table exists
    const result = await pool.request().query(`
      SELECT name FROM sysobjects WHERE name='password_resets' AND xtype='U'
    `);
    
    console.log('✅ Password resets table exists:', result.recordset.length > 0);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkTable();