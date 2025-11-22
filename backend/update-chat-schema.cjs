/**
 * Script để cập nhật database schema:
 * - Bỏ course_id từ learner_conversations
 * - Thêm UNIQUE constraint cho (learner_id, instructor_id)
 */

const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function updateChatSchema() {
  try {
    console.log('📚 Connecting to database...');
    const pool = await sql.connect(config);

    // 1. Drop existing tables
    console.log('\n🗑️  Dropping old chat tables...');
    await pool.request().query(`
      IF OBJECT_ID('learner_chat_messages', 'U') IS NOT NULL
        DROP TABLE learner_chat_messages;
      
      IF OBJECT_ID('learner_conversations', 'U') IS NOT NULL
        DROP TABLE learner_conversations;
    `);
    console.log('✅ Dropped old tables');

    // 2. Create new learner_conversations table (without course_id)
    console.log('\n📝 Creating new learner_conversations table...');
    await pool.request().query(`
      CREATE TABLE learner_conversations (
        conversation_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        learner_id BIGINT NOT NULL,
        instructor_id BIGINT NOT NULL,
        status NVARCHAR(50) DEFAULT 'active',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        last_message_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_learner_conversations_learner FOREIGN KEY (learner_id) REFERENCES users(user_id),
        CONSTRAINT FK_learner_conversations_instructor FOREIGN KEY (instructor_id) REFERENCES users(user_id),
        CONSTRAINT UQ_learner_instructor UNIQUE (learner_id, instructor_id)
      );
    `);
    console.log('✅ Created learner_conversations table');

    // 3. Create indexes
    console.log('\n📊 Creating indexes...');
    await pool.request().query(`
      CREATE INDEX idx_learner_conversations_learner ON learner_conversations(learner_id);
      CREATE INDEX idx_learner_conversations_instructor ON learner_conversations(instructor_id);
      CREATE INDEX idx_learner_conversations_status ON learner_conversations(status);
    `);
    console.log('✅ Created indexes');

    // 4. Create learner_chat_messages table
    console.log('\n📝 Creating learner_chat_messages table...');
    await pool.request().query(`
      CREATE TABLE learner_chat_messages (
        message_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        conversation_id BIGINT NOT NULL,
        sender_id BIGINT NOT NULL,
        message_text NVARCHAR(MAX) NOT NULL,
        message_type NVARCHAR(50) DEFAULT 'text',
        created_at DATETIME2 DEFAULT GETDATE(),
        is_read BIT DEFAULT 0,
        CONSTRAINT FK_learner_chat_messages_conversation FOREIGN KEY (conversation_id) REFERENCES learner_conversations(conversation_id),
        CONSTRAINT FK_learner_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users(user_id)
      );
    `);
    console.log('✅ Created learner_chat_messages table');

    // 5. Create indexes for messages
    await pool.request().query(`
      CREATE INDEX idx_learner_chat_messages_conversation ON learner_chat_messages(conversation_id);
      CREATE INDEX idx_learner_chat_messages_sender ON learner_chat_messages(sender_id);
      CREATE INDEX idx_learner_chat_messages_created ON learner_chat_messages(created_at);
    `);
    console.log('✅ Created message indexes');

    console.log('\n✅ ĐÃ HOÀN THÀNH CẬP NHẬT SCHEMA!');
    console.log('📋 Thay đổi:');
    console.log('   - Bỏ course_id từ learner_conversations');
    console.log('   - Thêm UNIQUE constraint (learner_id, instructor_id)');
    console.log('   - 1 learner chỉ có 1 conversation với 1 instructor');

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateChatSchema();
