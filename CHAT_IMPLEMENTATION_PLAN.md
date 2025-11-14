# 📱 KẾ HOẠCH TRIỂN KHAI CHAT REALTIME - INSTRUCTOR & ADMIN

## 🎯 MỤC TIÊU
Xây dựng hệ thống chat realtime giữa **Instructor** và **Admin** để hỗ trợ:
- Giảng viên liên hệ Admin khi cần hỗ trợ về khóa học
- Admin tư vấn, giải đáp thắc mắc của giảng viên
- Thông báo realtime khi có tin nhắn mới
- Lưu trữ lịch sử chat để theo dõi

---

## 📊 PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### ✅ CÁC THÀNH PHẦN ĐÃ CÓ SẴN

#### 1. **WebSocket Infrastructure** ✅
- **Backend**: `backend/services/websocketService.js` - Socket.IO server đã được cài đặt
- **Frontend**: `src/contexts/WebSocketContext.jsx` - Context provider cho WebSocket
- **Server Integration**: WebSocket service đã tích hợp vào `backend/server.js`

**Chức năng hiện có:**
```javascript
// Backend WebSocketService
- Authentication middleware (JWT token verification)
- Room management (user rooms, course rooms)
- Real-time notifications
- Chat messages cho courses (handleChatMessage)
- Typing indicators (handleTypingStart, handleTypingStop)
- User tracking (connectedUsers Map)
```

**Socket Events đã có:**
- `join_course` / `leave_course` - Tham gia/rời khỏi course room
- `chat_message` - Gửi tin nhắn chat
- `typing_start` / `typing_stop` - Trạng thái đang nhập
- `admin_broadcast` - Admin gửi thông báo broadcast
- `notification` - Thông báo realtime

#### 2. **UI Components** ✅
- **Chat Component**: `src/components/ui/chat.jsx`
  - `CourseChat`: Component chat cho khóa học
  - `ChatToggle`: Toggle button mở/đóng chat
  - Hỗ trợ typing indicators, message list, send message

#### 3. **Database** ✅
Database: `MiniCoursera_Primary` (SQL Server)

**Các bảng hiện có:**
```
✅ users (user_id, full_name, email, role_id)
✅ roles (role_id, role_name)
✅ instructors (instructor_id, user_id, bio, expertise)
```

**Roles:**
- Admin: role_id = 3
- Instructor: role_id = 2  
- Learner: role_id = 1

---

## ❌ NHỮNG GÌ CẦN THỰC HIỆN

### 1. **DATABASE SCHEMA** 🗄️

#### Bảng `conversations` (Quản lý cuộc hội thoại)
```sql
CREATE TABLE conversations (
  conversation_id BIGINT IDENTITY(1,1) PRIMARY KEY,
  instructor_id BIGINT NOT NULL,
  admin_id BIGINT NULL, -- NULL nếu chưa admin nào nhận
  status NVARCHAR(20) DEFAULT 'active', -- 'active', 'closed', 'archived'
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE(),
  last_message_at DATETIME2 DEFAULT GETDATE(),
  
  FOREIGN KEY (instructor_id) REFERENCES users(user_id),
  FOREIGN KEY (admin_id) REFERENCES users(user_id),
  
  INDEX idx_instructor (instructor_id),
  INDEX idx_admin (admin_id),
  INDEX idx_status (status),
  INDEX idx_updated (updated_at DESC)
);
```

#### Bảng `chat_messages` (Tin nhắn chat)
```sql
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
  
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(user_id),
  
  INDEX idx_conversation (conversation_id, created_at DESC),
  INDEX idx_sender (sender_id),
  INDEX idx_unread (is_read, conversation_id)
);
```

#### Bảng `conversation_participants` (Người tham gia - Optional cho mở rộng)
```sql
CREATE TABLE conversation_participants (
  participant_id BIGINT IDENTITY(1,1) PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  joined_at DATETIME2 DEFAULT GETDATE(),
  last_read_at DATETIME2 DEFAULT GETDATE(),
  
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  
  UNIQUE (conversation_id, user_id),
  INDEX idx_user_conversations (user_id, conversation_id)
);
```

---

### 2. **BACKEND API ENDPOINTS** 🔌

#### File: `backend/routes/chat.js` (MỚI)

```javascript
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { connectDB } from '../config/database.js';
import sql from 'mssql';

const router = express.Router();

// ===== CONVERSATIONS =====

// GET /api/chat/conversations - Lấy danh sách conversations
// Instructor: Lấy conversations của mình
// Admin: Lấy tất cả conversations hoặc conversations đã assign
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    
    let query = `
      SELECT 
        c.conversation_id,
        c.instructor_id,
        c.admin_id,
        c.status,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        instructor.full_name as instructor_name,
        instructor.email as instructor_email,
        admin.full_name as admin_name,
        admin.email as admin_email,
        (SELECT COUNT(*) FROM chat_messages 
         WHERE conversation_id = c.conversation_id 
         AND sender_id != @userId AND is_read = 0) as unread_count,
        (SELECT TOP 1 message_text FROM chat_messages 
         WHERE conversation_id = c.conversation_id 
         ORDER BY created_at DESC) as last_message
      FROM conversations c
      LEFT JOIN users instructor ON c.instructor_id = instructor.user_id
      LEFT JOIN users admin ON c.admin_id = admin.user_id
      WHERE 1=1
    `;
    
    // Filter based on role
    if (roleId === 2) { // Instructor
      query += ` AND c.instructor_id = @userId`;
    } else if (roleId === 3) { // Admin
      query += ` AND (c.admin_id = @userId OR c.admin_id IS NULL)`;
    }
    
    query += ` ORDER BY c.last_message_at DESC`;
    
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(query);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/conversations - Tạo conversation mới (Instructor only)
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const instructorId = req.user.userId;
    const roleId = req.user.roleId;
    
    // Only instructors can create conversations
    if (roleId !== 2) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only instructors can create conversations' 
      });
    }
    
    // Check if conversation already exists
    const existing = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        SELECT conversation_id FROM conversations 
        WHERE instructor_id = @instructorId AND status = 'active'
      `);
    
    if (existing.recordset.length > 0) {
      return res.json({
        success: true,
        data: { conversation_id: existing.recordset[0].conversation_id }
      });
    }
    
    // Create new conversation
    const result = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        INSERT INTO conversations (instructor_id, status)
        OUTPUT INSERTED.conversation_id
        VALUES (@instructorId, 'active')
      `);
    
    res.status(201).json({
      success: true,
      data: { conversation_id: result.recordset[0].conversation_id }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/chat/conversations/:id/assign - Admin assign conversation
router.put('/conversations/:id/assign', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const adminId = req.user.userId;
    const roleId = req.user.roleId;
    const conversationId = req.params.id;
    
    if (roleId !== 3) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can assign conversations' 
      });
    }
    
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('adminId', sql.BigInt, adminId)
      .query(`
        UPDATE conversations 
        SET admin_id = @adminId, updated_at = GETDATE()
        WHERE conversation_id = @conversationId
      `);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error assigning conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== MESSAGES =====

// GET /api/chat/conversations/:id/messages - Lấy messages
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const conversationId = req.params.id;
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify user has access to this conversation
    const access = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT conversation_id FROM conversations 
        WHERE conversation_id = @conversationId 
        AND (instructor_id = @userId OR admin_id = @userId)
      `);
    
    if (access.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }
    
    const messages = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('limit', sql.Int, parseInt(limit))
      .input('offset', sql.Int, parseInt(offset))
      .query(`
        SELECT 
          m.message_id,
          m.conversation_id,
          m.sender_id,
          m.message_text,
          m.message_type,
          m.file_url,
          m.is_read,
          m.is_edited,
          m.created_at,
          m.updated_at,
          u.full_name as sender_name,
          u.email as sender_email
        FROM chat_messages m
        LEFT JOIN users u ON m.sender_id = u.user_id
        WHERE m.conversation_id = @conversationId
        ORDER BY m.created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);
    
    // Mark messages as read
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('userId', sql.BigInt, userId)
      .query(`
        UPDATE chat_messages 
        SET is_read = 1 
        WHERE conversation_id = @conversationId 
        AND sender_id != @userId 
        AND is_read = 0
      `);
    
    res.json({
      success: true,
      data: messages.recordset.reverse()
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/conversations/:id/messages - Gửi message
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const conversationId = req.params.id;
    const senderId = req.user.userId;
    const { message_text, message_type = 'text', file_url = null } = req.body;
    
    // Insert message
    const result = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('senderId', sql.BigInt, senderId)
      .input('messageText', sql.NVarChar, message_text)
      .input('messageType', sql.NVarChar, message_type)
      .input('fileUrl', sql.NVarChar, file_url)
      .query(`
        INSERT INTO chat_messages 
        (conversation_id, sender_id, message_text, message_type, file_url)
        OUTPUT INSERTED.*
        VALUES (@conversationId, @senderId, @messageText, @messageType, @fileUrl)
      `);
    
    // Update conversation last_message_at
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .query(`
        UPDATE conversations 
        SET last_message_at = GETDATE(), updated_at = GETDATE()
        WHERE conversation_id = @conversationId
      `);
    
    const message = result.recordset[0];
    
    // Get sender info
    const sender = await pool.request()
      .input('senderId', sql.BigInt, senderId)
      .query(`SELECT full_name, email FROM users WHERE user_id = @senderId`);
    
    const messageData = {
      ...message,
      sender_name: sender.recordset[0].full_name,
      sender_email: sender.recordset[0].email
    };
    
    res.status(201).json({
      success: true,
      data: messageData
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

**Thêm vào `backend/server.js`:**
```javascript
import chatRoutes from './routes/chat.js';
app.use('/api/chat', chatRoutes);
```

---

### 3. **WEBSOCKET EVENTS** 📡

#### Cập nhật `backend/services/websocketService.js`

**Thêm event handlers mới:**

```javascript
// Add to setupEventHandlers()
socket.on('join_conversation', (data) => {
  this.handleJoinConversation(socket, data);
});

socket.on('leave_conversation', (data) => {
  this.handleLeaveConversation(socket, data);
});

socket.on('send_chat_message', (data) => {
  this.handleSendChatMessage(socket, data);
});

socket.on('mark_messages_read', (data) => {
  this.handleMarkMessagesRead(socket, data);
});

// Add new handler methods
handleJoinConversation(socket, data) {
  try {
    const { conversationId } = data;
    const roomName = `conversation:${conversationId}`;
    socket.join(roomName);
    
    console.log(`[WebSocket] User ${socket.userId} joined conversation ${conversationId}`);
    
    // Notify others in conversation
    socket.to(roomName).emit('user_joined_conversation', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      conversationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[WebSocket] Error joining conversation:', error);
  }
}

handleLeaveConversation(socket, data) {
  try {
    const { conversationId } = data;
    const roomName = `conversation:${conversationId}`;
    socket.leave(roomName);
    
    console.log(`[WebSocket] User ${socket.userId} left conversation ${conversationId}`);
  } catch (error) {
    console.error('[WebSocket] Error leaving conversation:', error);
  }
}

handleSendChatMessage(socket, data) {
  try {
    const { conversationId, message } = data;
    const roomName = `conversation:${conversationId}`;
    
    const chatMessage = {
      ...message,
      userId: socket.userId,
      userEmail: socket.userEmail,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast to conversation room (excluding sender)
    socket.to(roomName).emit('new_chat_message', chatMessage);
    
    // Also send to sender for confirmation
    socket.emit('message_sent', chatMessage);
    
    console.log(`[WebSocket] Chat message in conversation ${conversationId} from ${socket.userEmail}`);
  } catch (error) {
    console.error('[WebSocket] Error sending chat message:', error);
  }
}

handleMarkMessagesRead(socket, data) {
  try {
    const { conversationId, messageIds } = data;
    const roomName = `conversation:${conversationId}`;
    
    // Notify others that messages were read
    socket.to(roomName).emit('messages_read', {
      conversationId,
      messageIds,
      readBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[WebSocket] Error marking messages read:', error);
  }
}

// Public method để gửi notification khi có tin nhắn mới
sendNewMessageNotification(userId, conversationId, message) {
  try {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit('new_message_notification', {
        conversationId,
        message,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('[WebSocket] Error sending new message notification:', error);
    return false;
  }
}
```

---

### 4. **FRONTEND COMPONENTS** 🎨

#### A. Context Update: `src/contexts/WebSocketContext.jsx`

**Thêm chat methods:**

```javascript
// Add to WebSocketProvider
const joinConversation = useCallback((conversationId) => {
  if (state.socket && state.isConnected) {
    state.socket.emit('join_conversation', { conversationId });
  }
}, [state.socket, state.isConnected]);

const leaveConversation = useCallback((conversationId) => {
  if (state.socket && state.isConnected) {
    state.socket.emit('leave_conversation', { conversationId });
  }
}, [state.socket, state.isConnected]);

const sendChatMessage = useCallback((conversationId, message) => {
  if (state.socket && state.isConnected) {
    state.socket.emit('send_chat_message', { conversationId, message });
  }
}, [state.socket, state.isConnected]);

// Add event listeners in setupEventListeners()
socket.on('new_chat_message', (message) => {
  dispatch({ type: WS_ACTIONS.ADD_CHAT_MESSAGE, payload: message });
  
  toast({
    title: 'New Message',
    description: `${message.sender_name}: ${message.message_text}`,
    variant: 'info'
  });
});

socket.on('new_message_notification', (data) => {
  toast({
    title: '💬 New Message',
    description: 'You have a new message from support',
    variant: 'info'
  });
});

// Export in value
return (
  <WebSocketContext.Provider value={{
    ...value,
    joinConversation,
    leaveConversation,
    sendChatMessage
  }}>
    {children}
  </WebSocketContext.Provider>
);
```

#### B. Chat Component: `src/components/chat/InstructorAdminChat.jsx` (MỚI)

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Minimize2, Maximize2, X, MessageCircle } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export function InstructorAdminChat({ className = '' }) {
  const { state: authState } = useAuth();
  const { joinConversation, leaveConversation, sendChatMessage, isConnected } = useWebSocket();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load or create conversation
  const initializeConversation = async () => {
    try {
      setLoading(true);
      
      // Get conversations
      const convRes = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const convData = await convRes.json();
      
      let conv = null;
      
      if (convData.data && convData.data.length > 0) {
        conv = convData.data[0];
      } else if (authState.user.role_id === 2) {
        // Instructor creates new conversation
        const createRes = await fetch(`${API_BASE_URL}/chat/conversations`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const createData = await createRes.json();
        conv = { conversation_id: createData.data.conversation_id };
      }
      
      if (conv) {
        setConversation(conv);
        joinConversation(conv.conversation_id);
        loadMessages(conv.conversation_id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load messages
  const loadMessages = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversation.conversation_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message_text: newMessage })
        }
      );
      
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        
        // Send via WebSocket for realtime
        sendChatMessage(conversation.conversation_id, data.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Toggle chat
  const toggleChat = () => {
    if (!isOpen) {
      initializeConversation();
    } else {
      if (conversation) {
        leaveConversation(conversation.conversation_id);
      }
    }
    setIsOpen(!isOpen);
  };
  
  // Listen for new messages via WebSocket
  useEffect(() => {
    // This will be handled by WebSocketContext
    // Messages will be added to state automatically
  }, []);
  
  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all ${className}`}
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl ${isMinimized ? 'h-14' : 'h-[500px]'} flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white rounded-t-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {authState.user.role_id === 2 ? 'Chat with Admin' : 'Instructor Support'}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-indigo-700 p-1 rounded">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={toggleChat} className="hover:bg-indigo-700 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${msg.sender_id === authState.user.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-lg p-3 ${
                        msg.sender_id === authState.user.user_id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        <p className="text-sm">{msg.message_text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2">Disconnected. Reconnecting...</p>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
```

#### C. Admin Conversations Page: `src/pages/admin/ConversationsPage.jsx` (MỚI)

```jsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    loadConversations();
  }, []);
  
  const loadConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const assignToMe = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/assign`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        loadConversations();
      }
    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-7 h-7" />
        Instructor Support Conversations
      </h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <div key={conv.conversation_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">{conv.instructor_name}</span>
                    <span className="text-sm text-gray-500">({conv.instructor_email})</span>
                  </div>
                  
                  {conv.last_message && (
                    <p className="text-sm text-gray-600 mb-2">{conv.last_message}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.last_message_at).toLocaleString('vi-VN')}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full">
                        {conv.unread_count} unread
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  {!conv.admin_id && (
                    <button
                      onClick={() => assignToMe(conv.conversation_id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Assign to Me
                    </button>
                  )}
                  {conv.admin_id && (
                    <span className="text-sm text-green-600">
                      Assigned to {conv.admin_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 5. **INTEGRATION** 🔗

#### A. Add Chat to Instructor Dashboard

**File: `src/pages/instructor/InstructorDashboard.jsx`**

```jsx
import { InstructorAdminChat } from '../../components/chat/InstructorAdminChat';

export default function InstructorDashboard() {
  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Add Chat Widget */}
      <InstructorAdminChat />
    </div>
  );
}
```

#### B. Add to Admin Panel Navigation

**File: `src/pages/admin/AdminPanel.jsx`**

```jsx
import ConversationsPage from './ConversationsPage';

// Add to navigation items
const navItems = [
  // ... existing items
  {
    id: 'conversations',
    label: 'Hỗ trợ Giảng viên',
    icon: MessageCircle,
    badge: unreadConversations // số lượng conversations chưa đọc
  }
];

// Add to routes
<Route path="conversations" element={<ConversationsPage />} />
```

---

## 📋 CHECKLIST TRIỂN KHAI

### Phase 1: Database & Backend (Ngày 1-2)
- [ ] Tạo file migration SQL cho 3 bảng: `conversations`, `chat_messages`, `conversation_participants`
- [ ] Chạy migration trên database `MiniCoursera_Primary`
- [ ] Tạo file `backend/routes/chat.js` với tất cả API endpoints
- [ ] Test API endpoints với Postman/Thunder Client
- [ ] Cập nhật `websocketService.js` với conversation events
- [ ] Import chat routes vào `server.js`

### Phase 2: Frontend Components (Ngày 3-4)
- [ ] Cập nhật `WebSocketContext.jsx` với conversation methods
- [ ] Tạo component `InstructorAdminChat.jsx`
- [ ] Tạo component `ConversationsPage.jsx` cho Admin
- [ ] Test realtime messaging giữa 2 tabs (Instructor & Admin)
- [ ] Thêm typing indicators
- [ ] Thêm unread count badges

### Phase 3: Integration & Polish (Ngày 5)
- [ ] Integrate chat widget vào Instructor Dashboard
- [ ] Add Conversations page vào Admin Panel navigation
- [ ] Test với multiple users simultaneously
- [ ] Thêm notification sounds (optional)
- [ ] Thêm file upload (optional - Phase 2)
- [ ] UI/UX improvements

### Phase 4: Testing & Deployment (Ngày 6-7)
- [ ] End-to-end testing
- [ ] Performance testing (nhiều conversations)
- [ ] Security testing (authorization, XSS, SQL injection)
- [ ] Documentation
- [ ] Deploy to production

---

## 🔒 BẢO MẬT & BEST PRACTICES

### Security
1. **Authentication**: Tất cả API endpoints require JWT token
2. **Authorization**: Verify user có quyền truy cập conversation
3. **Input Validation**: Sanitize message_text để tránh XSS
4. **Rate Limiting**: Giới hạn số messages/phút để tránh spam
5. **SQL Injection**: Sử dụng parameterized queries

### Performance
1. **Message Pagination**: Load messages theo batch (50 messages/lần)
2. **Database Indexing**: Indexes trên conversation_id, sender_id, created_at
3. **WebSocket Rooms**: Chỉ broadcast đến participants trong conversation
4. **Lazy Loading**: Load conversations on-demand

### UX
1. **Realtime Updates**: WebSocket cho instant messaging
2. **Typing Indicators**: Hiển thị khi người khác đang nhập
3. **Read Receipts**: Đánh dấu tin nhắn đã đọc
4. **Notifications**: Browser notifications cho messages mới
5. **Offline Support**: Queue messages khi offline, gửi khi online

---

## 🚀 MỞ RỘNG TƯƠNG LAI (Optional)

1. **File Attachments**: Upload hình ảnh, file đính kèm
2. **Voice Messages**: Ghi âm và gửi voice messages
3. **Video Call**: Tích hợp WebRTC cho video call
4. **Group Chat**: Support cho nhiều admins trong 1 conversation
5. **Canned Responses**: Admin có thể lưu template responses
6. **Chat Analytics**: Thống kê response time, satisfaction rating
7. **AI Chatbot**: Auto-response cho câu hỏi thường gặp
8. **Message Search**: Tìm kiếm trong lịch sử chat
9. **Message Reactions**: Emoji reactions cho messages
10. **Thread Replies**: Reply to specific messages

---

## 📝 NOTES

- **Existing Chat Component**: `src/components/ui/chat.jsx` hiện tại dành cho course chat, KHÔNG dùng cho Instructor-Admin chat
- **WebSocket Service**: Đã có sẵn infrastructure, chỉ cần thêm conversation-specific events
- **Database**: SQL Server, sử dụng `mssql` package
- **Authentication**: JWT token stored in localStorage
- **Roles**: Admin (3), Instructor (2), Learner (1)

---

## 💡 TIPS

1. **Development**: Test với 2 browser windows (1 Instructor, 1 Admin)
2. **Debugging**: Sử dụng console.log trong WebSocket events để track messages
3. **State Management**: WebSocketContext đã handle state, không cần Redux
4. **Styling**: Sử dụng Tailwind CSS như các components khác
5. **Icons**: Sử dụng `lucide-react` icons

---

## 📚 REFERENCES

- **Existing Code**:
  - `backend/services/websocketService.js` - WebSocket implementation
  - `src/contexts/WebSocketContext.jsx` - Frontend WebSocket context
  - `src/components/ui/chat.jsx` - Course chat component (reference)
  - `backend/routes/admin.js` - API structure reference

- **Libraries**:
  - Socket.IO: https://socket.io/docs/
  - React Context: https://react.dev/reference/react/useContext
  - SQL Server: https://www.npmjs.com/package/mssql

---

**🎉 GOOD LUCK WITH IMPLEMENTATION!**
