-- Migration: Create Cart table for persistent cart storage
-- Date: 2025-11-01
-- Description: Store user cart items in database instead of localStorage

-- Create cart table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cart')
BEGIN
    CREATE TABLE cart (
        cart_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id BIGINT NOT NULL,
        course_id BIGINT NOT NULL,
        quantity INT DEFAULT 1,
        added_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        
        -- Foreign keys
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        
        -- Unique constraint: user can only have one cart item per course
        UNIQUE(user_id, course_id)
    );
    
    PRINT 'Cart table created successfully';
END
ELSE
BEGIN
    PRINT 'Cart table already exists';
END
GO

-- Create index for faster queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_cart_user_id')
BEGIN
    CREATE INDEX IX_cart_user_id ON cart(user_id);
    PRINT 'Index IX_cart_user_id created';
END
GO

-- Sample data for testing (optional)
-- INSERT INTO cart (user_id, course_id, quantity) VALUES (1, 1, 1);
-- INSERT INTO cart (user_id, course_id, quantity) VALUES (1, 2, 1);

PRINT 'Cart table migration completed successfully';
GO
