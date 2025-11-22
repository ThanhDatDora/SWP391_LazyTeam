# 📋 TỔNG HỢP CẤU TRÚC FILE - ADMIN PANEL, CHAT REALTIME & AI CHATBOT

> **Ngày tạo:** 22/11/2025  
> **Dự án:** Mini Coursera - SWP391_LazyTeam  
> **Branch:** tuan

---

## 🎯 MỤC LỤC

1. [ADMIN PANEL](#1-admin-panel)
2. [CHAT REALTIME](#2-chat-realtime)
3. [AI CHATBOT](#3-ai-chatbot)
4. [SHARED DEPENDENCIES](#4-shared-dependencies)

---

## 1. ADMIN PANEL

### 📂 Frontend Files

#### **Main Admin Panel**
- **File:** `src/pages/admin/AdminPanel.jsx`
  - **Chức năng:** Trang chính admin dashboard với sidebar navigation
  - **Features:**
    - Dashboard tổng quan
    - Quản lý users, courses, instructors, learners
    - Chat conversations management
    - Statistics & reports
  - **Dependencies:** React Router, AuthContext

#### **Admin Sub-pages**
1. **`src/pages/admin/UsersPage.jsx`**
   - Quản lý toàn bộ users (Admin, Instructor, Learner)
   - CRUD operations, role management
   - Account locking/unlocking

2. **`src/pages/admin/LearnersPage.jsx`**
   - Quản lý học viên
   - Theo dõi progress, enrollments
   - Learner statistics

3. **`src/pages/admin/InstructorsListPage.jsx`**
   - Danh sách giảng viên
   - Performance metrics

4. **`src/pages/admin/InstructorRequestsPage.jsx`**
   - Duyệt yêu cầu đăng ký giảng viên
   - Approve/Reject requests

5. **`src/pages/admin/InstructorReportsPage.jsx`**
   - Báo cáo từ giảng viên
   - Report management

6. **`src/pages/admin/CoursesPage.jsx`**
   - Quản lý tất cả khóa học
   - Course approval, deletion

7. **`src/pages/admin/CoursePendingPage.jsx`**
   - Khóa học chờ duyệt
   - Review & approve workflow

8. **`src/pages/admin/CategoriesPage.jsx`**
   - Quản lý danh mục khóa học
   - CRUD categories

9. **`src/pages/admin/PayoutsPage.jsx`**
   - Quản lý thanh toán cho giảng viên
   - Payout requests & processing

10. **`src/pages/admin/LearningStatsPage.jsx`**
    - Thống kê học tập
    - Analytics dashboard

11. **`src/pages/admin/ConversationsPage.jsx`**
    - **Quản lý chat conversations**
    - View all learner-instructor chats
    - Chat moderation

#### **Admin Components**
- **`src/components/admin/AccountLockedModal.jsx`**
  - Modal hiển thị khi tài khoản bị khóa
  - Thông báo lý do khóa

### 📂 Backend Files

#### **Admin API Routes**
- **`backend/routes/admin.js`** (Assumed - check if exists)
  - Admin authentication
  - User management APIs
  - Course approval APIs
  - Statistics APIs

---

## 2. CHAT REALTIME

### 📂 Frontend Files

#### **Chat Components**

1. **`src/components/chat/LearnerChatButton.jsx`**
   - **Vai trò:** Nút mở chat cho learner
   - **Vị trí:** Fixed bottom-right (bottom: 5rem, right: 1.5rem)
   - **z-index:** 99999
   - **Chức năng:** 
     - Toggle chat panel
     - Show unread message count

2. **`src/components/chat/LearnerConversationList.jsx`**
   - **Vai trò:** Danh sách conversations của learner
   - **Chức năng:**
     - Hiển thị tất cả conversations
     - Real-time updates qua WebSocket
     - Chọn conversation để chat

3. **`src/components/chat/InstructorChatButton.jsx`**
   - **Vai trò:** Nút mở chat cho instructor
   - **Chức năng:** Tương tự LearnerChatButton

4. **`src/components/chat/InstructorChatPanel.jsx`**
   - **Vai trò:** Panel chat chính cho instructor
   - **Chức năng:**
     - Hiển thị conversation list
     - Chat box
     - Real-time messaging

5. **`src/components/chat/InstructorConversationList.jsx`**
   - **Vai trò:** Danh sách conversations của instructor
   - **Chức năng:** Tương tự LearnerConversationList

6. **`src/components/chat/InstructorAdminChat.jsx`**
   - **Vai trò:** Chat interface cho admin/instructor
   - **Chức năng:**
     - Advanced chat features
     - Moderation tools

7. **`src/components/chat/ConversationList.jsx`**
   - **Vai trò:** Generic conversation list component
   - **Chức năng:** Reusable conversation display

8. **`src/components/chat/ChatBox.jsx`**
   - **Vai trò:** Chat message display & input
   - **Chức năng:**
     - Hiển thị messages
     - Send messages
     - Real-time updates
     - Message status (sent, delivered, read)

### 📂 Context Files

- **`src/contexts/WebSocketContext.jsx`**
  - **Vai trò:** WebSocket connection manager
  - **Chức năng:**
    - Establish WebSocket connection
    - Handle real-time events
    - Reconnection logic
    - Message broadcasting
  - **Events:**
    - `new_message` - Tin nhắn mới
    - `message_read` - Đánh dấu đã đọc
    - `typing` - Người dùng đang gõ
    - `user_online/offline` - Trạng thái online
  - **Dependencies:** socket.io-client, AuthContext

### 📂 Backend Files

#### **Chat Routes**
- **`backend/routes/chat.js`**
  - **Endpoints:**
    - `GET /api/chat/learner/conversations` - Lấy conversations của learner
    - `GET /api/chat/instructor/conversations` - Lấy conversations của instructor
    - `GET /api/chat/:conversationId/messages` - Lấy messages
    - `POST /api/chat/send` - Gửi message
    - `PUT /api/chat/mark-read/:conversationId` - Đánh dấu đã đọc
    - `POST /api/chat/create-conversation` - Tạo conversation mới
  - **Dependencies:** WebSocket service

#### **WebSocket Service**
- **`backend/services/websocketService.js`**
  - **Vai trò:** WebSocket server implementation
  - **Chức năng:**
    - Socket.IO server setup
    - Authentication middleware
    - Real-time message broadcasting
    - Online status tracking
    - Room management
  - **Key Methods:**
    - `handleConnection(socket)` - Xử lý kết nối mới
    - `sendMessage(conversationId, message)` - Broadcast message
    - `markUserOnline(userId)` - Cập nhật trạng thái online
    - `getUsersInConversation(conversationId)` - Lấy users trong conversation

#### **Server Configuration**
- **`backend/server.js`**
  - **Lines 18:** Import WebSocketService
  - **Lines 34-35:** Import chat routes & AI chatbot routes
  - **Lines 250-251:** Register routes
    ```js
    app.use('/api/chat', chatRoutes);
    app.use('/api/ai-chatbot', aiChatbotRoutes);
    ```
  - **Lines 296-301:** Initialize WebSocket
    ```js
    const wsService = new WebSocketService(server);
    global.websocketService = wsService;
    ```

### 📂 Database Schema (Chat)

**Tables:**
- `conversations`
  - conversation_id (PK)
  - learner_id (FK → users)
  - instructor_id (FK → users)
  - created_at
  - updated_at

- `messages`
  - message_id (PK)
  - conversation_id (FK → conversations)
  - sender_id (FK → users)
  - message_text
  - is_read (BIT)
  - sent_at
  - read_at

---

## 3. AI CHATBOT

### 📂 Frontend Files

#### **AI Chatbot Component**
- **`src/components/chat/AIChatbot.jsx`**
  - **Vị trí:** Fixed bottom-right (bottom: 10rem, right: 1.5rem)
  - **z-index:** 100000 (Cao hơn chat realtime)
  - **Chức năng:**
    - Chat interface với AI
    - Fetch courses data từ backend
    - Gọi Gemini AI API
    - Hiển thị tin nhắn với markdown support
    - Chat history persistence (localStorage)
  
  - **Key Features:**
    - 🤖 **Tính cách linh hoạt:**
      - Trò chuyện tự nhiên (tâm sự, chào hỏi...)
      - Tư vấn khóa học từ database
      - Thân thiện, hài hước
    
    - 📚 **Tích hợp Database:**
      - Fetch courses từ `/api/ai-chatbot/courses-context`
      - Hiển thị khóa học thực tế (tên, giá, cấp độ...)
      - Không bịa đặt thông tin
    
    - 🎨 **UI/UX:**
      - Floating button với icon Sparkles
      - Chat window với gradient purple
      - Auto-scroll to bottom
      - Typing indicator
      - Message timestamps

  - **State Management:**
    ```jsx
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    ```

  - **API Integration:**
    - **Backend:** `http://localhost:3001/api/ai-chatbot/courses-context`
    - **Gemini AI:** `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`

### 📂 Backend Files

#### **AI Chatbot Routes**
- **`backend/routes/ai-chatbot.js`**
  - **Endpoints:**
    
    1. **`GET /api/ai-chatbot/courses-context`**
       - **Chức năng:** Lấy tất cả courses để AI tư vấn
       - **Query:**
         ```sql
         SELECT 
           c.course_id,
           c.title,
           c.description,
           c.price,
           cat.name as category,
           c.level,
           c.language_code,
           u.full_name as instructor_name
         FROM courses c
         LEFT JOIN users u ON c.owner_instructor_id = u.user_id
         LEFT JOIN categories cat ON c.category_id = cat.category_id
         WHERE c.status = 'active'
         ORDER BY c.created_at DESC
         ```
       - **Response:**
         ```json
         {
           "success": true,
           "data": [
             {
               "id": 1,
               "title": "React Fundamentals",
               "description": "...",
               "price": 500000,
               "category": "Programming",
               "level": "Beginner",
               "language": "vi",
               "duration": "10 hours",
               "instructor": "Nguyễn Văn A"
             }
           ],
           "summary": {
             "total": 10,
             "categories": ["Programming", "Design", ...],
             "levels": ["Beginner", "Intermediate", "Advanced"]
           }
         }
         ```
    
    2. **`GET /api/ai-chatbot/course/:id`**
       - **Chức năng:** Lấy chi tiết 1 khóa học
       - **Note:** Có sử dụng cột `instructor_id` và `is_published` (cần fix tương tự courses-context)
    
    3. **`POST /api/ai-chatbot/search-courses`**
       - **Chức năng:** Tìm kiếm khóa học theo tiêu chí
       - **Body:** `{ category, level, priceMax, keyword }`
       - **Note:** Có sử dụng các cột cũ (cần fix)

### 📂 Environment Variables

- **`.env`** (Frontend - Vite)
  ```env
  VITE_GEMINI_API_KEY=AIzaSyD7tyKqjZE17xudVXMjPnP-LEJ9SgQ173o
  ```

### 📂 AI Chatbot System Prompt

**Prompt Structure:**
```
Bạn là trợ lý AI thân thiện và nhiệt tình của "Mini Coursera"

🌟 TÍNH CÁCH & PHONG CÁCH:
- Trò chuyện tự nhiên, gần gũi như bạn bè
- Có thể tâm sự, chia sẻ, động viên
- Linh hoạt với nhiều chủ đề
- Thân thiện, hài hước

💼 NHIỆM VỤ CHÍNH:
- Tư vấn khóa học THỰC TẾ từ database
- Trả lời câu hỏi về giá, nội dung
- Trò chuyện, tâm sự với người dùng

🎯 XỬ LÝ TÌNH HUỐNG:
📚 Hỏi về KHÓA HỌC → Dùng data từ database
💬 TÂM SỰ/CHAT THƯỜNG → Trả lời tự nhiên

📋 DANH SÁCH X KHÓA HỌC:
[Courses data formatted by category...]
```

### 📂 Database Integration

**Columns Used:**
- ✅ `course_id` - ID khóa học
- ✅ `title` - Tên khóa học
- ✅ `description` - Mô tả
- ✅ `price` - Giá (VNĐ)
- ✅ `category_id` → `categories.name` - Danh mục
- ✅ `level` - Cấp độ (Beginner, Intermediate, Advanced)
- ✅ `language_code` - Ngôn ngữ (vi, en)
- ✅ `owner_instructor_id` → `users.full_name` - Giảng viên
- ✅ `status = 'active'` - Chỉ lấy khóa đang hoạt động

---

## 4. SHARED DEPENDENCIES

### 📂 Context Providers

1. **`src/contexts/AuthContext.jsx`**
   - **Chức năng:** Quản lý authentication state
   - **Provides:**
     - `user` - Current user object
     - `isAuthenticated` - Boolean
     - `login()` - Login function
     - `logout()` - Logout function
     - `refreshProfile()` - Refresh user data
   - **Used by:**
     - AdminPanel (role check)
     - Chat components (user identification)
     - AI Chatbot (role-based display)

2. **`src/contexts/WebSocketContext.jsx`**
   - **Chức năng:** WebSocket connection management
   - **Provides:**
     - `socket` - Socket.IO instance
     - `isConnected` - Connection status
     - `sendMessage()` - Send message via socket
     - `onMessage()` - Listen to messages
   - **Used by:**
     - All chat components
     - Conversations pages
     - Real-time notifications

### 📂 Backend Shared

#### **Database Connection**
- **`backend/config/database.js`**
  - SQL Server connection pool
  - Connection string management

#### **Middleware**
- **`backend/middleware/auth.js`**
  - JWT verification
  - Role-based access control
  - Token refresh

#### **Server Entry**
- **`backend/server.js`**
  - Express app setup
  - CORS configuration
  - Routes registration
  - WebSocket initialization
  - Port: 3001

### 📂 Package Dependencies

#### **Frontend (package.json)**
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-router-dom": "^6.x",
    "socket.io-client": "^4.x",
    "lucide-react": "^0.x",  // Icons for chat & AI
    "markdown-to-jsx": "^7.x"  // AI chatbot message rendering
  }
}
```

#### **Backend (package.json)**
```json
{
  "dependencies": {
    "express": "^4.x",
    "socket.io": "^4.x",
    "mssql": "^10.x",
    "jsonwebtoken": "^9.x",
    "dotenv": "^16.x"
  }
}
```

---

## 5. FILE STRUCTURE TREE

```
📦 SWP391_LazyTeam-tuan
│
├── 📂 src/
│   ├── 📂 pages/
│   │   └── 📂 admin/
│   │       ├── AdminPanel.jsx ⭐ (Main Admin Dashboard)
│   │       ├── UsersPage.jsx
│   │       ├── LearnersPage.jsx
│   │       ├── InstructorsListPage.jsx
│   │       ├── InstructorRequestsPage.jsx
│   │       ├── InstructorReportsPage.jsx
│   │       ├── CoursesPage.jsx
│   │       ├── CoursePendingPage.jsx
│   │       ├── CategoriesPage.jsx
│   │       ├── PayoutsPage.jsx
│   │       ├── LearningStatsPage.jsx
│   │       └── ConversationsPage.jsx 💬 (Admin Chat Management)
│   │
│   ├── 📂 components/
│   │   ├── 📂 admin/
│   │   │   └── AccountLockedModal.jsx
│   │   │
│   │   └── 📂 chat/
│   │       ├── LearnerChatButton.jsx 💬 (z-index: 99999, bottom: 5rem)
│   │       ├── LearnerConversationList.jsx 💬
│   │       ├── InstructorChatButton.jsx 💬
│   │       ├── InstructorChatPanel.jsx 💬
│   │       ├── InstructorConversationList.jsx 💬
│   │       ├── InstructorAdminChat.jsx 💬
│   │       ├── ConversationList.jsx 💬
│   │       ├── ChatBox.jsx 💬
│   │       └── AIChatbot.jsx 🤖 (z-index: 100000, bottom: 10rem)
│   │
│   └── 📂 contexts/
│       ├── AuthContext.jsx 🔐 (Shared by all)
│       └── WebSocketContext.jsx 🔌 (Chat Realtime)
│
├── 📂 backend/
│   ├── 📂 routes/
│   │   ├── chat.js 💬 (Chat Realtime API)
│   │   └── ai-chatbot.js 🤖 (AI Chatbot API)
│   │
│   ├── 📂 services/
│   │   └── websocketService.js 🔌 (WebSocket Server)
│   │
│   ├── 📂 config/
│   │   └── database.js 🗄️
│   │
│   └── server.js ⚙️ (Main Server Entry)
│
└── .env 🔑 (VITE_GEMINI_API_KEY)
```

---

## 6. COMPONENT POSITIONING

### Vị trí các floating components:

```
┌─────────────────────────────────────────┐
│                                         │
│          Main Content Area              │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                        ┌──────────────┐ │
│                        │              │ │ ← AI Chatbot
│                        │  🤖 Chatbot  │ │   (bottom: 10rem)
│                        │  z: 100000   │ │   (z-index: 100000)
│                        └──────────────┘ │
│                                         │
│                        ┌──────────────┐ │
│                        │              │ │ ← Learner Chat
│                        │  💬 Chat     │ │   (bottom: 5rem)
│                        │  z: 99999    │ │   (z-index: 99999)
│                        └──────────────┘ │
└─────────────────────────────────────────┘
```

---

## 7. API ENDPOINTS SUMMARY

### Chat Realtime APIs
```
GET    /api/chat/learner/conversations      - Lấy conversations của learner
GET    /api/chat/instructor/conversations   - Lấy conversations của instructor
GET    /api/chat/:conversationId/messages   - Lấy messages trong conversation
POST   /api/chat/send                       - Gửi message
PUT    /api/chat/mark-read/:conversationId  - Đánh dấu đã đọc
POST   /api/chat/create-conversation        - Tạo conversation mới
```

### AI Chatbot APIs
```
GET    /api/ai-chatbot/courses-context      - Lấy tất cả courses cho AI
GET    /api/ai-chatbot/course/:id           - Lấy chi tiết 1 course
POST   /api/ai-chatbot/search-courses       - Tìm kiếm courses
```

### WebSocket Events
```
Client → Server:
  - authenticate          - Xác thực user
  - send_message          - Gửi message
  - typing               - Đang gõ
  - mark_read            - Đánh dấu đã đọc

Server → Client:
  - new_message          - Tin nhắn mới
  - message_read         - Message đã được đọc
  - user_online          - User online
  - user_offline         - User offline
  - typing               - Ai đó đang gõ
```

---

## 8. DATABASE SCHEMA

### Chat Realtime Tables
```sql
-- Conversations
CREATE TABLE conversations (
  conversation_id BIGINT PRIMARY KEY IDENTITY,
  learner_id BIGINT NOT NULL,
  instructor_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (learner_id) REFERENCES users(user_id),
  FOREIGN KEY (instructor_id) REFERENCES users(user_id)
);

-- Messages
CREATE TABLE messages (
  message_id BIGINT PRIMARY KEY IDENTITY,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  message_text NVARCHAR(MAX) NOT NULL,
  is_read BIT DEFAULT 0,
  sent_at DATETIME DEFAULT GETDATE(),
  read_at DATETIME,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
  FOREIGN KEY (sender_id) REFERENCES users(user_id)
);
```

### AI Chatbot Data Source
```sql
-- Courses (used by AI)
SELECT 
  c.course_id,
  c.title,
  c.description,
  c.price,
  cat.name as category,
  c.level,
  c.language_code,
  u.full_name as instructor_name
FROM courses c
LEFT JOIN users u ON c.owner_instructor_id = u.user_id
LEFT JOIN categories cat ON c.category_id = cat.category_id
WHERE c.status = 'active'
```

---

## 9. SECURITY & AUTHENTICATION

### Frontend
- **AuthContext** checks user role
- **Protected Routes** for admin pages
- **Token stored** in localStorage
- **Auto refresh** on token expiry

### Backend
- **JWT Authentication** middleware
- **Role-based access control**
- **WebSocket authentication** on connection
- **CORS** enabled for localhost:5173

---

## 10. KEY FEATURES IMPLEMENTED

### ✅ Admin Panel
- [x] Dashboard overview
- [x] User management (CRUD)
- [x] Course approval workflow
- [x] Instructor request handling
- [x] Chat conversations monitoring
- [x] Statistics & analytics
- [x] Category management
- [x] Payout processing

### ✅ Chat Realtime
- [x] 1-on-1 learner-instructor chat
- [x] Real-time messaging via WebSocket
- [x] Message read status
- [x] Typing indicators
- [x] Online/offline status
- [x] Unread message count
- [x] Chat history persistence
- [x] Conversation creation

### ✅ AI Chatbot
- [x] Gemini AI integration
- [x] Database-backed course recommendations
- [x] Natural conversation (tâm sự, chào hỏi...)
- [x] Course search & filter
- [x] Price/level/category queries
- [x] Markdown message support
- [x] Chat history in localStorage
- [x] Smart positioning (above chat button)

---

## 11. NOTES & TODO

### ⚠️ Issues to Fix

1. **AI Chatbot Backend (ai-chatbot.js)**
   - ❌ Lines 97-110: Still using old column names in `/course/:id` endpoint
     - `instructor_id` → should be `owner_instructor_id`
     - `is_published` → should be `status = 'active'`
   
   - ❌ Lines 130-180: `/search-courses` endpoint có vấn đề tương tự
     - Cần update column names

2. **Database Schema**
   - Check nếu thiếu index cho performance:
     - `conversations.learner_id`
     - `conversations.instructor_id`
     - `messages.conversation_id`
     - `courses.status`

3. **WebSocket**
   - Add reconnection logic on client side
   - Implement message queue khi offline

### 📝 Future Enhancements

1. **Admin Panel**
   - [ ] Real-time notifications
   - [ ] Advanced search & filters
   - [ ] Bulk operations
   - [ ] Export reports (CSV, PDF)

2. **Chat Realtime**
   - [ ] File/image attachments
   - [ ] Voice messages
   - [ ] Message reactions (emoji)
   - [ ] Group chat support
   - [ ] Message search

3. **AI Chatbot**
   - [ ] Multi-language support
   - [ ] Voice input/output
   - [ ] Course enrollment integration
   - [ ] Smart course recommendations based on user history
   - [ ] Sentiment analysis
   - [ ] Conversation analytics

---

## 📞 CONTACT

- **Developer:** LazyTeam
- **Project:** SWP391
- **Repository:** ThanhDatDora/SWP391_LazyTeam
- **Branch:** tuan

---

**Last Updated:** 22/11/2025 15:30 ICT
