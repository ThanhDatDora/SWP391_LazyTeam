-- Add is_completed column to enrollments table

USE MiniCoursera_Primary;
GO

-- Check if column already exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'enrollments' 
    AND COLUMN_NAME = 'is_completed'
)
BEGIN
    ALTER TABLE enrollments 
    ADD is_completed BIT DEFAULT 0;
    
    PRINT '✅ Added is_completed column to enrollments table';
END
ELSE
BEGIN
    PRINT '⚠️  is_completed column already exists in enrollments table';
END
GO

-- Verify
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'enrollments'
AND COLUMN_NAME IN ('current_mooc_id', 'moocs_completed', 'overall_score', 'is_completed');
GO
