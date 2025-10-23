import { getPool, sql } from '../config/database.js';

const createPasswordResetsTable = async () => {
  try {
    const pool = await getPool();
    
    console.log('🔄 Creating password_resets table...');
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='password_resets' AND xtype='U')
      BEGIN
        CREATE TABLE password_resets (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          reset_token NVARCHAR(10) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          used BIT DEFAULT 0,
          used_at DATETIME NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
        
        -- Index for faster lookups
        CREATE INDEX IX_password_resets_token ON password_resets(reset_token);
        CREATE INDEX IX_password_resets_user_id ON password_resets(user_id);
        CREATE INDEX IX_password_resets_expires ON password_resets(expires_at);
        
        PRINT 'Password resets table created successfully!';
      END
      ELSE
      BEGIN
        PRINT 'Password resets table already exists!';
      END
    `);
    
    console.log('✅ Password resets table migration completed!');
    
  } catch (error) {
    console.error('❌ Error creating password_resets table:', error);
    throw error;
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createPasswordResetsTable()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default createPasswordResetsTable;