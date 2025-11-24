# 📚 HƯỚNG DẪN TRÌNH BÀY DỰ ÁN - MINI COURSERA

> **Dành cho:** Sinh viên thuyết trình với giảng viên  
> **Mục đích:** Hiểu rõ kiến trúc, chức năng để trả lời câu hỏi  
> **Cập nhật:** November 23, 2025

---

## 🎯 1. TỔNG QUAN DỰ ÁN

### **Hệ thống LMS (Learning Management System)**
- **Frontend:** React + Vite (Port 5173)
- **Backend:** Node.js + Express (Port 3001)
- **Database:** SQL Server (MiniCoursera_Primary)
- **Real-time:** Socket.IO (WebSocket)

### **3 Vai trò chính:**
1. **Admin (role_id = 1):** Quản trị toàn hệ thống
2. **Instructor (role_id = 2):** Tạo & quản lý khóa học
3. **Learner (role_id = 3):** Học viên

---

## 🔐 2. AUTHENTICATION & AUTHORIZATION

### **Cách hoạt động:**
```
User Login → Backend verify → Tạo JWT Token → Frontend lưu localStorage
↓
Mỗi API request → Gửi kèm: Authorization: Bearer <token>
↓
Backend middleware: authenticateToken() → Kiểm tra token hợp lệ
↓
Middleware: requireAdmin() → Kiểm tra role_id = 1
```

### **Flow code:**
```javascript
// backend/middleware/auth.js
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded; // { userId, email, role, roleName }
  next();
}

// backend/routes/admin.js
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 1) return res.status(403).json({ error: 'Admin only' });
  next();
}
```

---

## 🎛️ 3. ADMIN DASHBOARD (ADMIN PANEL)

### **A. CẤU TRÚC BACKEND**

#### **File Router:** `backend/routes/admin.js` (1208 dòng)

**Middleware stack:** Tất cả endpoint đều phải qua 2 middleware:
```javascript
router.method('/endpoint', authenticateToken, requireAdmin, handler)
```

#### **Danh sách API Endpoints:**

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/api/admin/stats` | GET | Dashboard KPI (users, courses, revenue) |
| `/api/admin/users` | GET | Danh sách tất cả users (phân trang) |
| `/api/admin/learners` | GET | Danh sách learners (role_id=3) |
| `/api/admin/instructors` | GET | Danh sách instructors (role_id=2) |
| `/api/admin/courses` | GET | Danh sách tất cả courses |
| `/api/admin/courses/pending` | GET | Courses chờ duyệt |
| `/api/admin/courses/:id/approve` | PUT | Duyệt course |
| `/api/admin/courses/:id/reject` | PUT | Từ chối course |
| `/api/admin/users/:id/lock` | PUT | Khóa tài khoản user |
| `/api/admin/users/:id/unlock` | PUT | Mở khóa tài khoản |
| `/api/admin/users/:id/role` | PUT | Đổi vai trò user |
| `/api/admin/users/:id` | DELETE | Xóa user |
| `/api/admin/categories` | GET | Danh sách categories |
| `/api/admin/categories` | POST | Tạo category mới |
| `/api/admin/categories/:id` | PUT | Sửa category |
| `/api/admin/categories/:id` | DELETE | Xóa category |
| `/api/admin/learning-stats` | GET | Thống kê học tập |

#### **Database Tables sử dụng:**
- **users:** Quản lý tài khoản (email, password_hash, role_id, status)
- **courses:** Thông tin khóa học (title, price, status, owner_instructor_id)
- **enrollments:** Đăng ký học (user_id, course_id, completed_at)
- **categories:** Danh mục khóa học
- **payments:** Thanh toán
- **invoices:** Hóa đơn

### **B. CẤU TRÚC FRONTEND**

#### **Main Component:** `src/pages/admin/AdminPanel.jsx` (5724 dòng)

**Các trang con (Sub-pages):**
- `UsersPage.jsx` - Quản lý users (lock/unlock, delete, change role)
- `LearnersPage.jsx` - Quản lý learners
- `InstructorsListPage.jsx` - Quản lý instructors
- `CoursesPage.jsx` - Quản lý courses
- `CoursePendingPage.jsx` - Duyệt courses chờ
- `CategoriesPage.jsx` - Quản lý categories
- `ConversationsPage.jsx` - Chat support
- `LearningStatsPage.jsx` - Thống kê học tập
- `PayoutsPage.jsx` - Quản lý chi trả

#### **React Router:**
```javascript
// src/router/AppRouter.jsx
<Route path="/admin" element={<AdminPanel />}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<UsersPage />} />
  <Route path="learners" element={<LearnersPage />} />
  <Route path="instructors" element={<InstructorsListPage />} />
  <Route path="courses" element={<CoursesPage />} />
  <Route path="categories" element={<CategoriesPage />} />
  <Route path="conversations" element={<ConversationsPage />} />
  ...
</Route>
```

#### **API Service:**
```javascript
// Frontend gọi API
const response = await fetch(`${API_BASE_URL}/admin/users`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### **C. CHỨC NĂNG QUAN TRỌNG**

#### **1. Dashboard (Trang chính)**
- **KPI Cards:** Tổng users, courses, revenue, enrollments
- **Charts:** Line chart (Revenue theo tháng), Bar chart (Users theo role)
- **Recent Activities:** Hoạt động gần đây

**Query SQL (ví dụ - Total Users):**
```sql
SELECT 
  COUNT(*) as totalUsers,
  SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as totalAdmins,
  SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as totalInstructors,
  SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as totalLearners
FROM users
WHERE status = 'active'
```

#### **2. Quản lý Users**
- **Lock/Unlock:** Khóa/mở khóa tài khoản
  ```sql
  UPDATE users SET status = 'locked' WHERE user_id = @userId
  ```
- **Delete:** Xóa user (kèm WebSocket notify)
  ```sql
  DELETE FROM users WHERE user_id = @userId
  ```
- **Change Role:** Đổi vai trò (learner ↔ instructor)
  ```sql
  UPDATE users SET role_id = @newRoleId WHERE user_id = @userId
  ```

#### **3. Duyệt Courses**
- **Approve:** 
  ```sql
  UPDATE courses SET status = 'active', approved_at = GETDATE() 
  WHERE course_id = @courseId
  ```
- **Reject:**
  ```sql
  UPDATE courses SET status = 'rejected' WHERE course_id = @courseId
  ```

---

## 💬 4. CHAT REALTIME (INSTRUCTOR-ADMIN)

### **A. DATABASE SCHEMA**

**File migration:** `backend/migrations/create-chat-tables.sql`

#### **3 bảng chính:**

**1. conversations** - Cuộc trò chuyện
```sql
CREATE TABLE conversations (
  conversation_id BIGINT IDENTITY(1,1) PRIMARY KEY,
  instructor_id BIGINT NOT NULL,
  admin_id BIGINT NULL,  -- NULL nếu chưa assign
  status NVARCHAR(20) DEFAULT 'active',  -- 'active', 'archived'
  created_at DATETIME2 DEFAULT GETDATE(),
  last_message_at DATETIME2 DEFAULT GETDATE()
)
```

**2. chat_messages** - Tin nhắn
```sql
CREATE TABLE chat_messages (
  message_id BIGINT IDENTITY(1,1) PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  message_text NVARCHAR(MAX) NOT NULL,
  is_read BIT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE()
)
```

**3. conversation_participants** - Người tham gia
```sql
CREATE TABLE conversation_participants (
  participant_id BIGINT IDENTITY(1,1) PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  last_read_at DATETIME2 DEFAULT GETDATE()
)
```

### **B. BACKEND API**

**File router:** `backend/routes/chat.js` (1110 dòng)

#### **API Endpoints:**

| Endpoint | Method | Người dùng | Chức năng |
|----------|--------|------------|-----------|
| `/api/chat/conversations` | GET | Instructor/Admin | Lấy danh sách conversations |
| `/api/chat/conversations` | POST | Instructor | Tạo conversation mới |
| `/api/chat/conversations/:id/messages` | GET | Both | Lấy messages của conversation |
| `/api/chat/conversations/:id/messages` | POST | Both | Gửi message mới |
| `/api/chat/conversations/:id/read` | PUT | Both | Đánh dấu đã đọc |
| `/api/chat/conversations/:id/assign` | PUT | Admin | Assign conversation cho admin |
| `/api/chat/conversations/:id/archive` | PUT | Admin | Archive conversation |
| `/api/chat/unread-count` | GET | Admin | Đếm tin nhắn chưa đọc |

#### **Ví dụ code:**

**Lấy conversations (Instructor):**
```javascript
router.get('/conversations', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const roleId = req.user.roleId;
  
  let query = `
    SELECT c.*, instructor.full_name as instructor_name,
           admin.full_name as admin_name,
           (SELECT COUNT(*) FROM chat_messages 
            WHERE conversation_id = c.conversation_id 
            AND sender_id != @userId AND is_read = 0) as unread_count
    FROM conversations c
    LEFT JOIN users instructor ON c.instructor_id = instructor.user_id
    LEFT JOIN users admin ON c.admin_id = admin.user_id
    WHERE `;
  
  if (roleId === 2) query += `c.instructor_id = @userId`; // Instructor
  if (roleId === 1) query += `c.admin_id = @userId OR c.status = 'active'`; // Admin
  
  const result = await pool.request()
    .input('userId', sql.BigInt, userId)
    .query(query);
  
  res.json({ success: true, data: result.recordset });
});
```

**Gửi message:**
```javascript
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { message_text } = req.body;
  const senderId = req.user.userId;
  
  // Insert message
  const result = await pool.request()
    .input('conversationId', sql.BigInt, id)
    .input('senderId', sql.BigInt, senderId)
    .input('messageText', sql.NVarChar, message_text)
    .query(`
      INSERT INTO chat_messages (conversation_id, sender_id, message_text)
      OUTPUT INSERTED.*
      VALUES (@conversationId, @senderId, @messageText)
    `);
  
  // Update last_message_at
  await pool.request()
    .input('conversationId', sql.BigInt, id)
    .query(`
      UPDATE conversations 
      SET last_message_at = GETDATE() 
      WHERE conversation_id = @conversationId
    `);
  
  // Emit WebSocket event
  const io = req.app.get('io');
  io.to(`conversation:${id}`).emit('new_chat_message', {
    conversationId: id,
    message: result.recordset[0]
  });
  
  res.json({ success: true, data: result.recordset[0] });
});
```

### **C. WEBSOCKET (REALTIME)**

**File service:** `backend/services/websocketService.js` (684 dòng)

#### **Cách hoạt động:**

**1. Kết nối:**
```javascript
// Frontend
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('token') }
});

// Backend - Authentication middleware
this.io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, JWT_SECRET);
  socket.userId = decoded.userId;
  socket.userRole = decoded.role;
  next();
});
```

**2. Join conversation room:**
```javascript
// Frontend
socket.emit('join_conversation', { conversationId: 123 });

// Backend
socket.on('join_conversation', (data) => {
  socket.join(`conversation:${data.conversationId}`);
  console.log(`User ${socket.userId} joined conversation ${data.conversationId}`);
});
```

**3. Realtime message:**
```javascript
// Backend gửi message mới
io.to(`conversation:${conversationId}`).emit('new_chat_message', {
  conversationId,
  message: { message_id, sender_id, message_text, created_at }
});

// Frontend nhận message
socket.on('new_chat_message', (data) => {
  setMessages(prev => [...prev, data.message]);
});
```

**4. Typing indicator:**
```javascript
// User đang gõ
socket.emit('typing_start', { conversationId });

// Backend broadcast
socket.on('typing_start', (data) => {
  socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
    userId: socket.userId,
    userName: socket.userName
  });
});
```

### **D. FRONTEND COMPONENTS**

#### **Admin Chat:** `src/pages/admin/ConversationsPage.jsx` (1074 dòng)

**Tính năng:**
- Hiển thị danh sách conversations (active/archived)
- Unread badge (số tin nhắn chưa đọc)
- Assign conversation cho admin
- Archive/Restore conversation
- Realtime nhận tin nhắn mới

**Cấu trúc UI:**
```
┌─────────────────────────────────────────┐
│  [Active] [Archived]        Badge: 3    │
├──────────────┬──────────────────────────┤
│ Conversation │  Chat Messages           │
│ List (Left)  │                          │
│              │  [User Message]          │
│ - John Doe   │  [Admin Reply]           │
│   "Hello..." │                          │
│   [3 unread] │  [Input Box] [Send]      │
└──────────────┴──────────────────────────┘
```

#### **Instructor Chat:** `src/components/chat/InstructorAdminChat.jsx`

**Floating button:** Góc dưới phải màn hình
```javascript
<button 
  onClick={() => setIsOpen(true)}
  style={{
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 9999
  }}
>
  <MessageCircle />
  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
</button>
```

### **E. CONTEXT (STATE MANAGEMENT)**

**File:** `src/contexts/WebSocketContext.jsx` (615 dòng)

**State quản lý:**
```javascript
const initialState = {
  socket: null,
  isConnected: false,
  chatMessages: {},  // { conversationId: [messages] }
  conversationTyping: {},  // { conversationId: { userId: true } }
  notifications: []
};
```

**API cung cấp:**
```javascript
const { 
  joinConversation,     // Join conversation room
  leaveConversation,    // Leave conversation room
  sendChatMessage,      // Gửi message
  chatMessages,         // Messages của conversations
  isConnected          // WebSocket connection status
} = useWebSocket();
```

---

## 🤖 5. AI CHATBOT (GEMINI)

### **A. TỔNG QUAN**

**File component:** `src/components/chat/AIChatbot.jsx` (717 dòng)

**Công nghệ:** Google Gemini 2.5 Flash API

**Hiển thị cho:**
- ✅ Learner (role_id = 3)
- ✅ Guest (chưa đăng nhập)
- ❌ Admin & Instructor (ẩn)

### **B. BACKEND API**

**File router:** `backend/routes/ai-chatbot.js` (193 dòng)

**Endpoint duy nhất:**
```javascript
GET /api/ai-chatbot/courses-context
// Trả về danh sách courses để AI tư vấn
```

**Response format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "JavaScript ES6 Mastery",
      "description": "...",
      "price": 299000,
      "category": "Lập trình",
      "level": "Intermediate",
      "instructor": "Nguyễn Văn A"
    }
  ],
  "summary": {
    "total": 15,
    "categories": ["Lập trình", "Design", "Marketing"],
    "levels": ["Beginner", "Intermediate", "Advanced"]
  }
}
```

### **C. GEMINI API INTEGRATION**

**Flow hoạt động:**
```
User gửi message → Fetch courses từ backend → Build system prompt
→ Call Gemini API → Nhận AI response → Hiển thị cho user
```

**Code gọi API:**
```javascript
const callGeminiAPI = async (userPrompt, coursesData) => {
  // Build system prompt với courses context
  let systemPrompt = `Bạn là trợ lý AI của Mini Coursera...`;
  
  if (coursesData.length > 0) {
    systemPrompt += `\n\nDanh sách ${coursesData.length} khóa học:\n`;
    coursesData.forEach(course => {
      systemPrompt += `- ${course.title}: ${course.price}đ, ${course.level}\n`;
    });
  }
  
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt + userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    })
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
```

### **D. TÍNH NĂNG**

**1. Lưu lịch sử chat:**
```javascript
// LocalStorage key unique cho mỗi user
const storageKey = `ai_chat_history_${userId}`;
localStorage.setItem(storageKey, JSON.stringify(messages));
```

**2. Dark mode:**
```javascript
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}, []);
```

**3. UI Elements:**
- Floating button (góc dưới trái)
- Chat window (400x600px)
- Auto-scroll khi có tin nhắn mới
- Typing indicator khi AI đang trả lời
- Clear chat history

---

## 📋 6. CÂU HỎI THƯỜNG GẶP (FAQ)

### **Q1: Làm sao phân biệt Admin và Instructor?**
**A:** Kiểm tra `role_id` trong database users:
- `role_id = 1` → Admin
- `role_id = 2` → Instructor  
- `role_id = 3` → Learner

### **Q2: Chat realtime hoạt động như thế nào?**
**A:** 
1. WebSocket kết nối khi user login
2. User join conversation room
3. Khi gửi message → Lưu DB → Emit event qua WebSocket
4. Client khác trong room nhận event → Update UI realtime

### **Q3: AI Chatbot lấy data courses từ đâu?**
**A:**
1. Frontend gọi `/api/ai-chatbot/courses-context`
2. Backend query database: `SELECT * FROM courses WHERE status='active'`
3. Format data và trả về JSON
4. Frontend truyền vào Gemini API làm context

### **Q4: Tại sao cần JWT Token?**
**A:** 
- **Xác thực:** Biết user là ai (userId, email, role)
- **Bảo mật:** Không lưu password, chỉ lưu token
- **Stateless:** Backend không cần lưu session

### **Q5: WebSocket khác gì HTTP?**
**A:**
- **HTTP:** Request-Response (1 chiều, phải hỏi mới trả lời)
- **WebSocket:** Persistent connection (2 chiều, server push được data)

---

## 🎤 7. SCRIPT TRÌNH BÀY (MẪU)

### **Giới thiệu dự án (30s):**
> "Dự án Mini Coursera là hệ thống LMS cho phép instructor tạo khóa học, learner học online, và admin quản trị. Hệ thống có 3 tính năng nổi bật: Admin Dashboard quản lý toàn bộ, Chat realtime hỗ trợ instructor, và AI Chatbot tư vấn 24/7."

### **Admin Panel (1 phút):**
> "Admin Panel sử dụng React Router với nhiều trang con. Tất cả API đều qua 2 middleware: authenticateToken kiểm tra đăng nhập, và requireAdmin kiểm tra role_id = 1. Ví dụ khi khóa user, frontend gọi PUT /api/admin/users/:id/lock, backend update status='locked' trong database, và gửi WebSocket event để logout user ngay lập tức."

### **Chat Realtime (1 phút):**
> "Chat sử dụng Socket.IO để realtime. Database có 3 bảng: conversations lưu cuộc trò chuyện, chat_messages lưu tin nhắn, và conversation_participants lưu người tham gia. Khi instructor gửi message, backend insert vào DB, emit WebSocket event 'new_chat_message', admin nhận event và update UI không cần refresh."

### **AI Chatbot (45s):**
> "AI Chatbot dùng Google Gemini API. Khi user hỏi, component fetch danh sách courses từ backend, build system prompt kèm context courses, gọi Gemini API, và hiển thị response. Lịch sử chat lưu trong localStorage theo từng user_id."

---

## 📊 8. SƠ ĐỒ TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│                        MINI COURSERA SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FRONTEND (React)                BACKEND (Node.js)                │
│  ─────────────────              ──────────────────                │
│                                                                   │
│  ┌──────────────┐               ┌─────────────────┐              │
│  │ AdminPanel   │──── HTTP ────→│ /api/admin/*    │              │
│  │ (Dashboard)  │←──── JSON ────│ (Admin Routes)  │              │
│  └──────────────┘               └─────────────────┘              │
│                                         │                         │
│  ┌──────────────┐                       ↓                         │
│  │Conversations │               ┌─────────────────┐              │
│  │Page (Chat)   │──── HTTP ────→│ /api/chat/*     │              │
│  └──────────────┘               │ (Chat Routes)   │              │
│         │                       └─────────────────┘              │
│         │                               │                         │
│         └────── WebSocket ──────────────┤                         │
│                                         ↓                         │
│  ┌──────────────┐               ┌─────────────────┐              │
│  │ AIChatbot    │──── HTTP ────→│ /api/ai-chatbot │              │
│  │ (Gemini)     │               │ (AI Routes)     │              │
│  └──────────────┘               └─────────────────┘              │
│         │                               │                         │
│         │                               ↓                         │
│         │                       ┌─────────────────┐              │
│         └──── HTTP ────────────→│ Gemini API      │              │
│                                 │ (Google Cloud)  │              │
│                                 └─────────────────┘              │
│                                         │                         │
│                                         ↓                         │
│                                 ┌─────────────────┐              │
│                                 │ SQL SERVER      │              │
│                                 │ - users         │              │
│                                 │ - courses       │              │
│                                 │ - conversations │              │
│                                 │ - chat_messages │              │
│                                 └─────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ 9. CHECKLIST TRƯỚC KHI TRÌNH BÀY

- [ ] Hiểu rõ flow: User login → JWT Token → API Request
- [ ] Biết cách Admin lock user (API + SQL query)
- [ ] Giải thích được WebSocket hoạt động thế nào
- [ ] Demo được 1 chức năng (VD: Approve course)
- [ ] Trả lời được: "Tại sao dùng WebSocket cho chat?"
- [ ] Trả lời được: "AI Chatbot lấy data từ đâu?"
- [ ] Nhớ middleware: `authenticateToken` + `requireAdmin`

---

## 🔥 10. ĐIỂM NỔI BẬT KHI TRÌNH BÀY

1. **Kiến trúc 3 lớp rõ ràng:** Frontend - Backend - Database
2. **Security:** JWT Token + Middleware authorization
3. **Realtime:** WebSocket cho chat (không phải polling)
4. **AI Integration:** Gemini API với context courses từ DB
5. **Scalable:** Component-based (React) + Modular routes (Express)

---

**📝 Lưu ý:** File này tóm tắt cốt lõi để trình bày. Đọc kỹ từng phần, test thử các chức năng, và chuẩn bị demo live nếu có thể!
