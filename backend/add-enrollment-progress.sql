-- Add progress column to enrollments table

USE MiniCoursera_Primary;
GO

-- Check if column already exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'enrollments' 
    AND COLUMN_NAME = 'progress'
)
BEGIN
    ALTER TABLE enrollments 
    ADD progress DECIMAL(5,2) DEFAULT 0.00;
    
    PRINT '✅ Added progress column to enrollments table';
END
ELSE
BEGIN
    PRINT '⚠️  progress column already exists in enrollments table';
END
GO

-- Calculate and update progress for existing enrollments
UPDATE e
SET progress = CASE 
    WHEN total_moocs.mooc_count = 0 THEN 0
    ELSE (CAST(e.moocs_completed AS DECIMAL(5,2)) / total_moocs.mooc_count) * 100
END
FROM enrollments e
CROSS APPLY (
    SELECT COUNT(*) as mooc_count
    FROM moocs m
    WHERE m.course_id = e.course_id
) total_moocs;

PRINT '✅ Updated progress for existing enrollments';
GO

-- Verify
SELECT TOP 5 
    enrollment_id, 
    user_id, 
    course_id, 
    moocs_completed,
    progress,
    overall_score
FROM enrollments
ORDER BY enrollment_id DESC;
GO

PRINT '✅ Enrollment progress setup complete!';
