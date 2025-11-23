import { getPool } from './config/database.js';

async function createExamAnswersTable() {
  try {
    const pool = await getPool();
    
    console.log('📝 Creating exam_answers table...\n');
    
    await pool.request().query(`
      -- Table to store user's answer for each question in an exam attempt
      CREATE TABLE exam_answers (
        answer_id BIGINT PRIMARY KEY IDENTITY(1,1),
        submission_id BIGINT NOT NULL,
        question_id BIGINT NOT NULL,
        selected_options NVARCHAR(MAX), -- JSON array of option_ids: [123, 456]
        is_correct BIT DEFAULT 0,
        points_earned DECIMAL(5,2) DEFAULT 0,
        answered_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(question_id)
      );
      
      CREATE INDEX IX_exam_answers_submission ON exam_answers(submission_id);
      CREATE INDEX IX_exam_answers_question ON exam_answers(question_id);
    `);
    
    console.log('✅ exam_answers table created successfully!\n');
    
    // Also create a table to track exam instances (for timer and question selection)
    console.log('📝 Creating exam_instances table...\n');
    
    await pool.request().query(`
      -- Table to track each exam attempt (for active sessions, timer, selected questions)
      CREATE TABLE exam_instances (
        instance_id BIGINT PRIMARY KEY IDENTITY(1,1),
        exam_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        attempt_number INT NOT NULL,
        selected_questions NVARCHAR(MAX), -- JSON array of question_ids in random order
        start_time DATETIME2 DEFAULT GETDATE(),
        end_time DATETIME2 NULL,
        time_remaining_sec INT, -- For pause/resume
        status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'expired', 'paused'
        submission_id BIGINT NULL, -- Link to submissions table after submit
        
        FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
      );
      
      CREATE INDEX IX_exam_instances_user ON exam_instances(user_id);
      CREATE INDEX IX_exam_instances_exam ON exam_instances(exam_id);
      CREATE INDEX IX_exam_instances_status ON exam_instances(status);
    `);
    
    console.log('✅ exam_instances table created successfully!\n');
    
    console.log('📊 Verifying tables...');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('exam_answers', 'exam_instances')
    `);
    
    tables.recordset.forEach(t => {
      console.log(`  ✅ ${t.TABLE_NAME}`);
    });
    
    console.log('\n✅ All exam tables ready!');
    console.log('\nFull exam structure:');
    console.log('  📚 exams - Exam definitions');
    console.log('  ❓ questions - Question bank');
    console.log('  📝 question_options - Answer options');
    console.log('  🔗 exam_items - Questions assigned to exams');
    console.log('  🎯 exam_instances - Active exam sessions (NEW)');
    console.log('  ✍️ exam_answers - User answers (NEW)');
    console.log('  📊 submissions - Final scores');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createExamAnswersTable();
