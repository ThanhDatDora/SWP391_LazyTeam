-- Create exam_attempts table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'exam_attempts')
BEGIN
    CREATE TABLE exam_attempts (
        attempt_id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        mooc_id INT NOT NULL,
        started_at DATETIME NOT NULL DEFAULT GETDATE(),
        submitted_at DATETIME NULL,
        time_taken INT NULL, -- seconds
        total_questions INT NOT NULL,
        correct_answers INT NULL,
        score DECIMAL(5,2) NULL, -- percentage (0-100)
        passed BIT NOT NULL DEFAULT 0,
        answers NVARCHAR(MAX) NULL, -- JSON: [{question_id: 1, selected_option: 'A'}]
        CONSTRAINT FK_exam_attempts_user FOREIGN KEY (user_id) REFERENCES users(user_id),
        CONSTRAINT FK_exam_attempts_mooc FOREIGN KEY (mooc_id) REFERENCES moocs(mooc_id)
    );
    PRINT 'Table exam_attempts created successfully';
END
ELSE
BEGIN
    PRINT 'Table exam_attempts already exists';
END
GO

-- Add indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_exam_attempts_user_mooc')
BEGIN
    CREATE INDEX IX_exam_attempts_user_mooc ON exam_attempts(user_id, mooc_id);
    PRINT 'Index IX_exam_attempts_user_mooc created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_exam_attempts_mooc')
BEGIN
    CREATE INDEX IX_exam_attempts_mooc ON exam_attempts(mooc_id);
    PRINT 'Index IX_exam_attempts_mooc created';
END
GO

-- Update enrollments table (if columns don't exist)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('enrollments') AND name = 'current_mooc_id')
BEGIN
    ALTER TABLE enrollments ADD current_mooc_id INT NULL;
    PRINT 'Column current_mooc_id added to enrollments';
END
ELSE
BEGIN
    PRINT 'Column current_mooc_id already exists in enrollments';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('enrollments') AND name = 'moocs_completed')
BEGIN
    ALTER TABLE enrollments ADD moocs_completed INT DEFAULT 0;
    PRINT 'Column moocs_completed added to enrollments';
END
ELSE
BEGIN
    PRINT 'Column moocs_completed already exists in enrollments';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('enrollments') AND name = 'overall_score')
BEGIN
    ALTER TABLE enrollments ADD overall_score DECIMAL(5,2) NULL;
    PRINT 'Column overall_score added to enrollments';
END
ELSE
BEGIN
    PRINT 'Column overall_score already exists in enrollments';
END
GO
