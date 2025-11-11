-- Create exam_attempts table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'exam_attempts')
BEGIN
    CREATE TABLE exam_attempts (
        attempt_id BIGINT PRIMARY KEY IDENTITY(1,1),
        user_id BIGINT NOT NULL,
        mooc_id BIGINT NOT NULL,
        started_at DATETIME NOT NULL DEFAULT GETDATE(),
        submitted_at DATETIME NULL,
        time_taken INT NULL,
        total_questions INT NOT NULL,
        correct_answers INT NULL,
        score DECIMAL(5,2) NULL,
        passed BIT NOT NULL DEFAULT 0,
        answers NVARCHAR(MAX) NULL,
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

CREATE INDEX IX_exam_attempts_user_mooc ON exam_attempts(user_id, mooc_id);
CREATE INDEX IX_exam_attempts_mooc ON exam_attempts(mooc_id);
PRINT 'Indexes created successfully';
GO
