-- ============================================
-- Chat System Tables Migration
-- Instructor-Admin Chat Support
-- ============================================

USE MiniCoursera_Primary;
GO

-- Table 1: Conversations
-- Manages chat conversations between instructors and admins
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='conversations' AND xtype='U')
BEGIN
  CREATE TABLE conversations (
    conversation_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    instructor_id BIGINT NOT NULL,
    admin_id BIGINT NULL, -- NULL if not assigned yet
    status NVARCHAR(20) DEFAULT 'active', -- 'active', 'closed', 'archived'
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    last_message_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_conversations_instructor FOREIGN KEY (instructor_id) REFERENCES users(user_id),
    CONSTRAINT FK_conversations_admin FOREIGN KEY (admin_id) REFERENCES users(user_id),
    CONSTRAINT CHK_status CHECK (status IN ('active', 'closed', 'archived'))
  );
  
  -- Indexes for performance
  CREATE INDEX idx_conversations_instructor ON conversations(instructor_id);
  CREATE INDEX idx_conversations_admin ON conversations(admin_id);
  CREATE INDEX idx_conversations_status ON conversations(status);
  CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
  CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
  
  PRINT '✅ Table [conversations] created successfully';
END
ELSE
BEGIN
  PRINT '⚠️ Table [conversations] already exists';
END
GO

-- Table 2: Chat Messages
-- Stores all chat messages in conversations
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='chat_messages' AND xtype='U')
BEGIN
  CREATE TABLE chat_messages (
    message_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_text NVARCHAR(MAX) NOT NULL,
    message_type NVARCHAR(20) DEFAULT 'text', -- 'text', 'file', 'image'
    file_url NVARCHAR(500) NULL,
    is_read BIT DEFAULT 0,
    is_edited BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_chat_messages_conversation FOREIGN KEY (conversation_id) 
      REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT FK_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users(user_id),
    CONSTRAINT CHK_message_type CHECK (message_type IN ('text', 'file', 'image', 'system'))
  );
  
  -- Indexes for performance
  CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
  CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
  CREATE INDEX idx_chat_messages_unread ON chat_messages(is_read, conversation_id) WHERE is_read = 0;
  CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
  
  PRINT '✅ Table [chat_messages] created successfully';
END
ELSE
BEGIN
  PRINT '⚠️ Table [chat_messages] already exists';
END
GO

-- Table 3: Conversation Participants (for future multi-participant support)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='conversation_participants' AND xtype='U')
BEGIN
  CREATE TABLE conversation_participants (
    participant_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at DATETIME2 DEFAULT GETDATE(),
    last_read_at DATETIME2 DEFAULT GETDATE(),
    is_active BIT DEFAULT 1,
    
    CONSTRAINT FK_participants_conversation FOREIGN KEY (conversation_id) 
      REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT FK_participants_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT UQ_conversation_user UNIQUE (conversation_id, user_id)
  );
  
  -- Indexes for performance
  CREATE INDEX idx_participants_user ON conversation_participants(user_id, conversation_id);
  CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id, is_active);
  
  PRINT '✅ Table [conversation_participants] created successfully';
END
ELSE
BEGIN
  PRINT '⚠️ Table [conversation_participants] already exists';
END
GO

-- Verify tables
SELECT 
  TABLE_NAME, 
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = T.TABLE_NAME) as ColumnCount
FROM INFORMATION_SCHEMA.TABLES T
WHERE TABLE_NAME IN ('conversations', 'chat_messages', 'conversation_participants')
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

PRINT '🎉 Chat tables migration completed!';
GO