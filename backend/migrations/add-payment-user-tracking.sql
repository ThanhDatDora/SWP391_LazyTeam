-- Migration: Add user_id and admin_note to payments table
-- Date: 2025-11-01

-- Add user_id column to track which learner made the payment
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'payments') AND name = 'user_id')
BEGIN
    ALTER TABLE payments ADD user_id BIGINT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE payments 
    ADD CONSTRAINT FK_payments_users 
    FOREIGN KEY (user_id) REFERENCES users(user_id);
    
    PRINT 'Added user_id column to payments table';
END
GO

-- Add admin_note column for admin verification comments
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'payments') AND name = 'admin_note')
BEGIN
    ALTER TABLE payments ADD admin_note NVARCHAR(500) NULL;
    PRINT 'Added admin_note column to payments table';
END
GO

-- Add payment_id column to invoices if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'invoices') AND name = 'payment_id')
BEGIN
    ALTER TABLE invoices ADD payment_id BIGINT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE invoices 
    ADD CONSTRAINT FK_invoices_payments 
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id);
    
    PRINT 'Added payment_id column to invoices table';
END
GO

PRINT 'Migration completed successfully';
