-- Create password_resets table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[password_resets]') AND type in (N'U'))
BEGIN
    CREATE TABLE password_resets (
        reset_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        reset_token NVARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        used BIT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- Create index for faster token lookup
    CREATE INDEX idx_password_resets_token ON password_resets(reset_token);
    CREATE INDEX idx_password_resets_user ON password_resets(user_id);
    CREATE INDEX idx_password_resets_expires ON password_resets(expires_at);

    PRINT 'Table password_resets created successfully';
END
ELSE
BEGIN
    PRINT 'Table password_resets already exists';
END
GO