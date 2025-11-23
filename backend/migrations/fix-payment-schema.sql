-- ============================================
-- MIGRATION: Fix Payment Table Schema
-- Date: 2025-11-23
-- Issues Fixed:
--   1. amount_cents (INT) → amount (DECIMAL(10,2)) for USD
--   2. Status standardization (pending/paid/failed only)
--   3. Remove unused admin_note column
--   4. Make enrollment_id, user_id, txn_ref NOT NULL
--   5. Add proper constraints and indexes
-- ============================================

USE MiniCoursera_Primary;
GO

PRINT '=== STARTING PAYMENT TABLE MIGRATION ===';
GO

-- ============================================
-- STEP 1: Backup existing data
-- ============================================
PRINT 'Step 1: Creating backup table...';
IF OBJECT_ID('payments_backup_20251123', 'U') IS NOT NULL
    DROP TABLE payments_backup_20251123;

SELECT * INTO payments_backup_20251123 FROM payments;
PRINT 'Backup created with ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';
GO

-- ============================================
-- STEP 2: Data Cleanup - Fix NULL values
-- ============================================
PRINT 'Step 2: Cleaning NULL values...';

-- Delete records with NULL user_id (không hợp lý - payment phải có user)
DELETE FROM payments WHERE user_id IS NULL;
PRINT 'Deleted ' + CAST(@@ROWCOUNT AS VARCHAR) + ' records with NULL user_id';

-- Delete records with NULL enrollment_id (payment phải liên kết enrollment)
DELETE FROM payments WHERE enrollment_id IS NULL;
PRINT 'Deleted ' + CAST(@@ROWCOUNT AS VARCHAR) + ' records with NULL enrollment_id';

-- Fix NULL txn_ref - generate dummy txn_ref for old records
UPDATE payments 
SET txn_ref = 'LEGACY-' + CAST(payment_id AS VARCHAR) + '-' + FORMAT(created_at, 'yyyyMMddHHmmss')
WHERE txn_ref IS NULL;
PRINT 'Fixed ' + CAST(@@ROWCOUNT AS VARCHAR) + ' records with NULL txn_ref';
GO

-- ============================================
-- STEP 3: Standardize status values
-- ============================================
PRINT 'Step 3: Standardizing status values...';

-- Convert all 'completed' to 'paid'
UPDATE payments SET status = 'paid' WHERE status = 'completed';
PRINT 'Standardized ' + CAST(@@ROWCOUNT AS VARCHAR) + ' status values';

-- Verify status values
SELECT status, COUNT(*) as count 
FROM payments 
GROUP BY status;
GO

-- ============================================
-- STEP 4: Add new amount column with correct type
-- ============================================
PRINT 'Step 4: Adding amount DECIMAL(10,2) column...';

-- Add new column
IF COL_LENGTH('payments', 'amount') IS NULL
BEGIN
    ALTER TABLE payments ADD amount DECIMAL(10, 2);
    PRINT 'Added amount column';
END

-- Migrate data from amount_cents to amount
UPDATE payments SET amount = CAST(amount_cents AS DECIMAL(10, 2));
PRINT 'Migrated ' + CAST(@@ROWCOUNT AS VARCHAR) + ' amount values';
GO

-- ============================================
-- STEP 5: Drop unused columns
-- ============================================
PRINT 'Step 5: Dropping unused columns...';

-- Drop admin_note (không dùng)
IF COL_LENGTH('payments', 'admin_note') IS NOT NULL
BEGIN
    ALTER TABLE payments DROP COLUMN admin_note;
    PRINT 'Dropped admin_note column';
END
GO

-- ============================================
-- STEP 6: Modify columns to NOT NULL
-- ============================================
PRINT 'Step 6: Setting NOT NULL constraints...';

-- Make user_id NOT NULL
ALTER TABLE payments ALTER COLUMN user_id BIGINT NOT NULL;
PRINT 'Set user_id NOT NULL';

-- Make enrollment_id NOT NULL
ALTER TABLE payments ALTER COLUMN enrollment_id BIGINT NOT NULL;
PRINT 'Set enrollment_id NOT NULL';

-- Make txn_ref NOT NULL
ALTER TABLE payments ALTER COLUMN txn_ref NVARCHAR(200) NOT NULL;
PRINT 'Set txn_ref NOT NULL';

-- Make amount NOT NULL
ALTER TABLE payments ALTER COLUMN amount DECIMAL(10, 2) NOT NULL;
PRINT 'Set amount NOT NULL';
GO

-- ============================================
-- STEP 7: Add CHECK constraint for status
-- ============================================
PRINT 'Step 7: Adding status constraint...';

IF OBJECT_ID('CK_payments_status', 'C') IS NOT NULL
    ALTER TABLE payments DROP CONSTRAINT CK_payments_status;

ALTER TABLE payments 
ADD CONSTRAINT CK_payments_status 
CHECK (status IN ('pending', 'paid', 'failed'));
PRINT 'Added status CHECK constraint';
GO

-- ============================================
-- STEP 8: Add CHECK constraint for currency
-- ============================================
PRINT 'Step 8: Adding currency constraint...';

IF OBJECT_ID('CK_payments_currency', 'C') IS NOT NULL
    ALTER TABLE payments DROP CONSTRAINT CK_payments_currency;

ALTER TABLE payments 
ADD CONSTRAINT CK_payments_currency 
CHECK (currency IN ('USD', 'VND'));
PRINT 'Added currency CHECK constraint';
GO

-- ============================================
-- STEP 9: Add indexes for performance
-- ============================================
PRINT 'Step 9: Adding indexes...';

-- Index on user_id for fast user payment lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_payments_user_id')
BEGIN
    CREATE INDEX IX_payments_user_id ON payments(user_id);
    PRINT 'Created index on user_id';
END

-- Index on enrollment_id for fast enrollment lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_payments_enrollment_id')
BEGIN
    CREATE INDEX IX_payments_enrollment_id ON payments(enrollment_id);
    PRINT 'Created index on enrollment_id';
END

-- Unique index on txn_ref (mỗi transaction ref phải unique)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UX_payments_txn_ref')
BEGIN
    CREATE UNIQUE INDEX UX_payments_txn_ref ON payments(txn_ref) WHERE txn_ref IS NOT NULL;
    PRINT 'Created unique index on txn_ref';
END

-- Index on status for filtering
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_payments_status')
BEGIN
    CREATE INDEX IX_payments_status ON payments(status);
    PRINT 'Created index on status';
END

-- Composite index for pending payment check
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_payments_enrollment_status')
BEGIN
    CREATE INDEX IX_payments_enrollment_status ON payments(enrollment_id, status) 
    INCLUDE (payment_id, txn_ref);
    PRINT 'Created composite index on enrollment_id, status';
END
GO

-- ============================================
-- STEP 10: Drop old amount_cents column
-- ============================================
PRINT 'Step 10: Dropping old amount_cents column...';

IF COL_LENGTH('payments', 'amount_cents') IS NOT NULL
BEGIN
    ALTER TABLE payments DROP COLUMN amount_cents;
    PRINT 'Dropped amount_cents column';
END
GO

-- ============================================
-- STEP 11: Verification
-- ============================================
PRINT 'Step 11: Verification...';

-- Show final schema
PRINT 'Final schema:';
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    NUMERIC_PRECISION,
    NUMERIC_SCALE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'payments'
ORDER BY ORDINAL_POSITION;

-- Show constraints
PRINT 'Constraints:';
SELECT 
    name AS constraint_name,
    type_desc AS constraint_type
FROM sys.objects
WHERE parent_object_id = OBJECT_ID('payments')
    AND type IN ('C', 'PK', 'F', 'UQ');

-- Show indexes
PRINT 'Indexes:';
SELECT 
    name AS index_name,
    type_desc AS index_type,
    is_unique
FROM sys.indexes
WHERE object_id = OBJECT_ID('payments')
    AND name IS NOT NULL;

-- Show data sample
PRINT 'Sample data:';
SELECT TOP 5 
    payment_id, 
    user_id, 
    enrollment_id, 
    provider,
    amount, 
    currency, 
    status, 
    txn_ref,
    paid_at,
    created_at
FROM payments
ORDER BY created_at DESC;

-- Show statistics
PRINT 'Statistics:';
SELECT 
    COUNT(*) as total_payments,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM payments;

PRINT '=== MIGRATION COMPLETED SUCCESSFULLY ===';
GO

-- ============================================
-- ROLLBACK SCRIPT (nếu cần)
-- ============================================
-- To rollback:
-- DROP TABLE payments;
-- SELECT * INTO payments FROM payments_backup_20251123;
-- GO
