-- Create essay_submissions table for assignment submissions
-- Run this on MiniCoursera_Primary database

USE MiniCoursera_Primary;
GO

-- Check if table exists, drop if needed (for development)
IF OBJECT_ID('dbo.essay_submissions', 'U') IS NOT NULL
BEGIN
    PRINT 'Table essay_submissions already exists. Skipping creation...';
END
ELSE
BEGIN
    CREATE TABLE essay_submissions (
        essay_submission_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        task_id BIGINT NOT NULL, -- lesson_id of assignment
        user_id BIGINT NOT NULL,
        content_text NVARCHAR(MAX) NULL,
        file_url NVARCHAR(500) NULL,
        score DECIMAL(5, 2) NULL, -- 0-100
        feedback NVARCHAR(MAX) NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, graded
        submitted_at DATETIME NOT NULL DEFAULT GETDATE(),
        graded_at DATETIME NULL,
        graded_by BIGINT NULL, -- instructor user_id
        
        CONSTRAINT FK_essay_submissions_user FOREIGN KEY (user_id) 
            REFERENCES users(user_id) ON DELETE CASCADE,
        CONSTRAINT FK_essay_submissions_lesson FOREIGN KEY (task_id) 
            REFERENCES lessons(lesson_id) ON DELETE CASCADE,
        CONSTRAINT FK_essay_submissions_grader FOREIGN KEY (graded_by) 
            REFERENCES users(user_id) ON DELETE NO ACTION,
        
        INDEX IDX_essay_submissions_task_user (task_id, user_id),
        INDEX IDX_essay_submissions_status (status),
        INDEX IDX_essay_submissions_grader (graded_by)
    );
    
    PRINT '✅ Table essay_submissions created successfully';
END
GO

-- Verify table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'essay_submissions'
ORDER BY ORDINAL_POSITION;
GO

PRINT '';
PRINT '=== TABLE CREATED ===';
PRINT 'Table: essay_submissions';
PRINT 'Purpose: Store student assignment submissions';
PRINT 'Status: Ready for use';
PRINT '';
