const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function createLearnerChatTables() {
  try {
    console.log('📊 Connecting to database...');
    const pool = await sql.connect(config);
    
    // Check if tables already exist
    const checkTables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('learner_conversations', 'learner_chat_messages')
    `);
    
    if (checkTables.recordset.length > 0) {
      console.log('ℹ️ Tables already exist:', checkTables.recordset.map(t => t.TABLE_NAME).join(', '));
      console.log('⚠️ Skipping creation. Drop tables manually if you want to recreate them.');
      await pool.close();
      return;
    }
    
    console.log('🔨 Creating learner_conversations table...');
    await pool.request().query(`
      CREATE TABLE learner_conversations (
        conversation_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        learner_id BIGINT NOT NULL,
        instructor_id BIGINT NOT NULL,
        course_id BIGINT NOT NULL,
        status NVARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        last_message_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (learner_id) REFERENCES users(user_id),
        FOREIGN KEY (instructor_id) REFERENCES users(user_id),
        FOREIGN KEY (course_id) REFERENCES courses(course_id),
        CONSTRAINT UQ_learner_course UNIQUE (learner_id, course_id)
      );
    `);
    console.log('✅ learner_conversations table created');
    
    console.log('🔨 Creating learner_chat_messages table...');
    await pool.request().query(`
      CREATE TABLE learner_chat_messages (
        message_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        conversation_id BIGINT NOT NULL,
        sender_id BIGINT NOT NULL,
        message_text NVARCHAR(MAX) NOT NULL,
        message_type NVARCHAR(20) DEFAULT 'text',
        file_url NVARCHAR(500),
        is_read BIT DEFAULT 0,
        is_edited BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (conversation_id) REFERENCES learner_conversations(conversation_id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(user_id)
      );
    `);
    console.log('✅ learner_chat_messages table created');
    
    console.log('🔨 Creating indexes...');
    await pool.request().query(`
      CREATE INDEX idx_learner_conv_learner ON learner_conversations(learner_id);
      CREATE INDEX idx_learner_conv_instructor ON learner_conversations(instructor_id);
      CREATE INDEX idx_learner_conv_course ON learner_conversations(course_id);
      CREATE INDEX idx_learner_conv_status ON learner_conversations(status);
      CREATE INDEX idx_learner_msg_conversation ON learner_chat_messages(conversation_id);
      CREATE INDEX idx_learner_msg_sender ON learner_chat_messages(sender_id);
      CREATE INDEX idx_learner_msg_is_read ON learner_chat_messages(is_read);
    `);
    console.log('✅ Indexes created');
    
    console.log('\n🎉 Learner chat tables created successfully!');
    console.log('\n📋 Tables created:');
    console.log('  1. learner_conversations - Stores learner-instructor conversations per course');
    console.log('  2. learner_chat_messages - Stores messages in learner conversations');
    
    await pool.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createLearnerChatTables();
