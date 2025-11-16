# 📘 HƯỚNG DẪN THUYẾT TRÌNH - ADMIN PANEL & CHAT SYSTEM

> **Dành cho:** Sinh viên thuyết trình đồ án, người mới học lập trình web  
> **Mục đích:** Giải thích chi tiết cách hoạt động của từng tính năng từ A-Z  
> **Kiến thức cần:** Hiểu biết cơ bản về React, Node.js, SQL

---

## 📚 KIẾN THỨC NỀN TẢNG

### **1. Kiến trúc hệ thống là gì?**
Dự án này sử dụng kiến trúc **Client-Server 3 lớp:**

```
[FRONTEND - React]  ←→  [BACKEND - Node.js/Express]  ←→  [DATABASE - SQL Server]
     (Người dùng)           (Xử lý logic)                    (Lưu dữ liệu)
```

- **Frontend (Client):** Giao diện web chạy trên trình duyệt, code bằng React
- **Backend (Server):** Máy chủ xử lý yêu cầu, code bằng Node.js + Express
- **Database:** Nơi lưu trữ dữ liệu (users, courses, messages...), dùng SQL Server

### **2. Request-Response Flow (Luồng giao tiếp):**

```
User click button → Frontend gửi HTTP Request → Backend xử lý → Database query
                                                        ↓
User thấy kết quả ← Frontend nhận data ← Backend trả Response ← Database trả data
```

**Ví dụ thực tế:** User click "Lock Account"
1. **Frontend:** Gọi API `PUT /api/admin/users/5/lock`
2. **Backend:** Nhận request, kiểm tra quyền admin
3. **Database:** Chạy SQL `UPDATE users SET status='locked' WHERE user_id=5`
4. **Backend:** Trả về `{success: true}`
5. **Frontend:** Hiển thị thông báo "Đã khóa tài khoản"

### **3. Authentication & Authorization (Xác thực & Phân quyền):**

**Authentication (Xác thực):** Bạn là ai?
- Dùng **JWT Token** (JSON Web Token)
- User login → Backend tạo token → Frontend lưu vào localStorage
- Mỗi request phải gửi kèm: `Authorization: Bearer <token>`

**Authorization (Phân quyền):** Bạn được làm gì?
- **Admin (role_id = 1):** Toàn quyền quản trị
- **Instructor (role_id = 2):** Tạo khóa học, chat với admin
- **Learner (role_id = 3):** Học khóa học, chat với admin

**Middleware kiểm tra:**
```javascript
// Kiểm tra có token không?
authenticateToken(req, res, next)

// Kiểm tra có phải admin không?
requireAdmin(req, res, next)
```

### **4. HTTP Methods (Các phương thức):**
- **GET:** Lấy dữ liệu (đọc) - VD: Lấy danh sách users
- **POST:** Tạo mới - VD: Tạo conversation
- **PUT:** Cập nhật - VD: Lock/unlock user
- **DELETE:** Xóa - VD: Xóa category

### **5. Database Tables (Bảng dữ liệu):**
- **users:** Thông tin người dùng (email, password, role_id, status)
- **courses:** Khóa học (title, price, status, owner_instructor_id)
- **enrollments:** Đăng ký học (user_id, course_id, completed_at)
- **conversations:** Cuộc trò chuyện chat
- **messages:** Tin nhắn trong chat
- **payments:** Thanh toán
- **invoices:** Hóa đơn

---

## 🗂️ CẤU TRÚC ROUTER & CONTEXT

### **📁 BACKEND ROUTES (Router Files):**

Hệ thống AdminPanel sử dụng **2 file router chính** được đăng ký trong `backend/server.js`:

#### **1. Admin Core Routes (`backend/routes/admin.js` - 1206 dòng)**

**Đăng ký:** `app.use('/api/admin', adminRoutes)` trong `server.js` dòng 241

**Chức năng:** Xử lý tất cả các nghiệp vụ quản trị chính

**Middleware bắt buộc:**
```javascript
// Mọi endpoint đều phải qua 2 middleware này:
router.method('/path', authenticateToken, requireAdmin, handler)
```

**Danh sách Endpoints:**

| Endpoint | Method | Dòng | Chức năng |
|----------|--------|------|-----------|
| `/stats` | GET | 44 | Dashboard KPI (tổng users, courses, revenue) |
| `/users` | GET | 121 | Danh sách tất cả users |
| `/learners` | GET | 199 | Danh sách learners (role_id=3) |
| `/instructors` | GET | 261 | Danh sách instructors (role_id=2) |
| `/courses` | GET | 326 | Danh sách tất cả courses |
| `/courses/pending` | GET | 395 | Courses chờ duyệt (status=pending) |
| `/courses/:courseId/approve` | POST | 439 | Approve course |
| `/courses/:courseId/approve` | PUT | 466 | Approve course (PUT method) |
| `/courses/:courseId/reject` | POST | 495 | Reject course |
| `/courses/:courseId/reject` | PUT | 526 | Reject course (PUT method) |
| `/users/:userId/toggle-status` | POST | 560 | Toggle user status |
| `/users/:userId/lock` | PUT | 592 | **Khóa user** |
| `/users/:userId/unlock` | PUT | 635 | **Mở khóa user** |
| `/users/:userId` | DELETE | 665 | Xóa user |
| `/instructor-revenue` | GET | 695 | Doanh thu theo instructor |
| `/users/:id/role` | PUT | 743 | Update user role |
| `/learning-stats` | GET | 824 | Thống kê học tập |
| `/categories` | GET | 987 | Danh sách categories |
| `/categories` | POST | 1040 | Tạo category mới |
| `/categories/:id` | PUT | - | Update category |
| `/categories/:id` | DELETE | 1157 | Xóa category |

**requireAdmin Middleware (Dòng 8-38):**
```javascript
const requireAdmin = (req, res, next) => {
  // Kiểm tra 3 cách để tương thích:
  // 1. req.user.role === 1 (role_id là số)
  // 2. req.user.role === 'admin' (role là string)
  // 3. req.user.roleName === 'admin' (roleName là string)
  const isAdmin = req.user.role === 1 || 
                  req.user.role === 'admin' || 
                  req.user.roleName === 'admin';
  
  if (!isAdmin) {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }
  next();
};
```

#### **2. Admin Revenue Routes (`backend/routes/admin-revenue.js` - 266 dòng)**

**Đăng ký:** `app.use('/api/admin', adminRevenueRoutes)` trong `server.js` dòng 242

**Chức năng:** Quản lý doanh thu, thanh toán

**Danh sách Endpoints:**

| Endpoint | Method | Dòng | Chức năng |
|----------|--------|------|-----------|
| `/revenue/summary` | GET | 16 | Tổng quan doanh thu platform |
| `/revenue/pending-payments` | GET | 69 | Danh sách payments chờ xác nhận |
| `/revenue/verify-payment/:paymentId` | POST | 107 | Xác nhận payment |
| `/revenue/instructor-revenue` | GET | 232 | Doanh thu chi tiết theo instructor |

**Giải thích cách hoạt động:**
```javascript
// File: backend/server.js
app.use('/api/admin', adminRoutes);        // Đăng ký routes từ admin.js
app.use('/api/admin', adminRevenueRoutes); // Đăng ký routes từ admin-revenue.js

// Khi Frontend gọi:
// GET /api/admin/stats → Vào adminRoutes → admin.js dòng 44
// GET /api/admin/revenue/summary → Vào adminRevenueRoutes → admin-revenue.js dòng 16
```

#### **3. Chat Routes (`backend/routes/chat.js` - 665 dòng)**

**Đăng ký:** `app.use('/api/chat', chatRoutes)` trong `server.js`

**Chức năng:** Chat giữa Instructor ↔ Admin

**Danh sách Endpoints:**

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/conversations` | GET | Lấy danh sách conversations |
| `/conversations` | POST | Tạo conversation mới |
| `/conversations/:id/messages` | GET | Lấy messages trong conversation |
| `/conversations/:id/messages` | POST | Gửi message |
| `/conversations/:id/status` | PUT | Update status (active/archived) |
| `/messages/:id/read` | PUT | Đánh dấu đã đọc |

**Logic phân quyền trong chat:**
```javascript
// Instructor (role_id=2): Chỉ thấy conversations của mình
// Admin (role_id=1): Thấy tất cả conversations
if (roleId === 2) {
  query += ` AND c.instructor_id = @userId`;
} else if (roleId === 1) {
  query += ` AND (c.admin_id = @userId OR c.admin_id IS NULL)`;
}
```

---

### **🎨 FRONTEND CONTEXTS:**

#### **1. AuthContext (`src/contexts/AuthContext.jsx` - 317 dòng)**

**Provider:** `<AuthContext.Provider value={{...}}>`

**Export:** `export const useAuth = () => useContext(AuthContext);`

**State quản lý:**
```javascript
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);
```

**User Object Structure:**
```javascript
user = {
  userId: 1,
  email: "admin@example.com",
  full_name: "Admin",
  role_id: 1,        // 1=Admin, 2=Instructor, 3=Learner
  role: 1,           // Alias của role_id
  roleName: "admin", // String version
  avatar_url: "...",
  phone: "...",
  address: "..."
}
```

**Functions (Methods):**

**a) login(credentials) - Dòng 77:**
```javascript
const login = async (credentials) => {
  // 1. Gọi API POST /api/auth/login
  const response = await api.auth.login(email, password);
  
  // 2. Lưu token + user vào localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  
  // 3. Update state
  setUser(userData);
  setIsAuthenticated(true);
  
  // 4. Auto redirect theo role
  if (roleId === 1) {
    window.location.href = '/admin';  // Admin → AdminPanel
  } else if (roleId === 2) {
    window.location.href = '/instructor'; // Instructor
  }
}
```

**b) logout() - Dòng 200+:**
```javascript
const logout = () => {
  // 1. Xóa localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 2. Reset state
  setUser(null);
  setIsAuthenticated(false);
  
  // 3. Clear cache
  cacheUtils.clearAllCache();
  
  // 4. Redirect về home
  window.location.href = '/';
}
```

**c) checkAuthStatus() - Dòng 29:**
```javascript
const checkAuthStatus = async () => {
  // 1. Lấy token + user từ localStorage
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // 2. Nếu có → setUser, setIsAuthenticated
  if (token && userData) {
    setUser(JSON.parse(userData));
    setIsAuthenticated(true);
    
    // 3. Refresh profile từ backend (optional)
    const response = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

**d) updateProfile(profileData):**
```javascript
const updateProfile = async (profileData) => {
  // Update user info trong state + localStorage
  const updatedUser = { ...user, ...profileData };
  setUser(updatedUser);
  localStorage.setItem('user', JSON.stringify(updatedUser));
}
```

**Cách sử dụng trong component:**
```javascript
// File: src/pages/admin/AdminPanel.jsx
import { useAuth } from '../../contexts/AuthContext';

function AdminPanel() {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Kiểm tra quyền admin
  if (user?.role_id !== 1) {
    return <Navigate to="/" />;
  }
  
  return (
    <div>
      <p>Xin chào, {user.full_name}</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
```

#### **2. WebSocketContext (`src/contexts/WebSocketContext.jsx`)**

**Chức năng:** Quản lý Socket.IO connection cho realtime chat

**Export:** `export const useWebSocket = () => useContext(WebSocketContext);`

**State quản lý:**
```javascript
const [socket, setSocket] = useState(null);
const [isConnected, setIsConnected] = useState(false);
```

**Events lắng nghe:**
- `connect` - Khi kết nối thành công
- `disconnect` - Khi mất kết nối
- `new_message` - Khi có tin nhắn mới
- `conversation_updated` - Khi conversation update

**Cách sử dụng:**
```javascript
import { useWebSocket } from '../../contexts/WebSocketContext';

function ChatComponent() {
  const { socket, isConnected } = useWebSocket();
  
  useEffect(() => {
    if (socket) {
      // Lắng nghe event
      socket.on('new_message', (message) => {
        console.log('New message:', message);
      });
    }
  }, [socket]);
  
  // Gửi message
  const sendMessage = () => {
    socket.emit('send_message', { text: '...' });
  };
}
```

#### **3. TabsContext (Internal - trong AdminPanel.jsx)**

**Chức năng:** Quản lý tab switching trong AdminPanel

**Không export ra ngoài** - chỉ dùng nội bộ

**State:**
```javascript
const [activeTab, setActiveTab] = useState('dashboard');
```

**Tabs:**
- `dashboard` - Trang chủ
- `users` - Quản lý users
- `courses` - Quản lý courses
- `categories` - Quản lý categories
- `revenue` - Quản lý doanh thu
- `learning-stats` - Thống kê học tập
- `chat` - Chat support

---

### **🔄 LUỒNG AUTHENTICATION TOÀN HỆ THỐNG:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER LOGIN                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. AUTHCONTEXT.login()                                          │
│    - Input: { email, password }                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CALL API: POST /api/auth/login                               │
│    - Body: { email, password }                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. BACKEND VERIFY                                               │
│    - Check email exists trong database                          │
│    - bcrypt.compare(password, hashedPassword)                   │
│    - Query: SELECT * FROM users WHERE email = @email            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. CREATE JWT TOKEN                                             │
│    - jwt.sign({ userId, email, role, roleName }, SECRET)        │
│    - Token expires: 7 days                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. RETURN RESPONSE                                              │
│    {                                                            │
│      success: true,                                             │
│      data: {                                                    │
│        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",        │
│        user: {                                                  │
│          userId: 1,                                             │
│          email: "admin@example.com",                            │
│          role_id: 1,                                            │
│          role: 1,                                               │
│          roleName: "admin",                                     │
│          full_name: "Admin"                                     │
│        }                                                        │
│      }                                                          │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. AUTHCONTEXT LƯU DỮ LIỆU                                      │
│    - localStorage.setItem('token', token)                       │
│    - localStorage.setItem('user', JSON.stringify(user))         │
│    - setUser(user)                                              │
│    - setIsAuthenticated(true)                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. AUTO REDIRECT THEO ROLE                                      │
│    - if (role_id === 1) → window.location.href = '/admin'       │
│    - if (role_id === 2) → window.location.href = '/instructor'  │
│    - if (role_id === 3) → window.location.href = '/'            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. ADMINPANEL CHECK QUYỀN                                       │
│    - useAuth() lấy user từ AuthContext                          │
│    - if (user.role_id !== 1) return <Navigate to="/" />         │
│    - else → Hiển thị AdminPanel                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. GỌI ADMIN APIs                                              │
│     - fetch('/api/admin/stats', {                               │
│         headers: {                                              │
│           'Authorization': `Bearer ${token}`                    │
│         }                                                       │
│       })                                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. BACKEND MIDDLEWARE                                          │
│     a) authenticateToken()                                      │
│        - Lấy token từ headers.authorization                     │
│        - jwt.verify(token, SECRET)                              │
│        - Decode token → req.user = { userId, role, ... }        │
│                                                                 │
│     b) requireAdmin()                                           │
│        - Check req.user.role === 1                              │
│        - Nếu không → return 403 Forbidden                       │
│        - Nếu OK → next() chuyển sang handler                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. HANDLER XỬ LÝ REQUEST                                       │
│     - Lấy data từ database                                      │
│     - Process business logic                                    │
│     - Return response                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 13. FRONTEND NHẬN RESPONSE                                      │
│     - Parse JSON                                                │
│     - Update component state                                    │
│     - Re-render UI                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 MỤC LỤC
1. [Quản lý User (Lock/Unlock Account)](#1-quản-lý-user)
2. [Quản lý Courses (Approve/Reject)](#2-quản-lý-courses)
3. [Chat System (Admin Support)](#3-chat-system)
4. [Revenue Management](#4-revenue-management)
5. [Learning Statistics](#5-learning-statistics)
6. [Categories Management](#6-categories-management)

---

## 1. QUẢN LÝ USER (LOCK/UNLOCK ACCOUNT)

### 📋 **NGHIỆP VỤ (Business Logic):**

**Vấn đề cần giải quyết:**  
Trong hệ thống học trực tuyến, có thể có user vi phạm (spam, lừa đảo, nội dung không phù hợp). Admin cần công cụ để tạm ngưng quyền truy cập của họ.

**Giải pháp:**  
Tính năng Lock/Unlock Account cho phép:
- ✅ **Lock (Khóa):** Admin khóa tài khoản → User không thể login
- ✅ **Unlock (Mở khóa):** Admin mở khóa → User có thể login lại
- ✅ **Không xóa dữ liệu:** Vẫn giữ nguyên courses, enrollments của user

**Use Case (Tình huống sử dụng):**
1. User A spam tin nhắn trong chat
2. Admin phát hiện → vào UsersPage
3. Tìm User A → click nút "Lock Account"
4. User A bị khóa → không thể login
5. Sau 7 ngày, User A xin lỗi
6. Admin click "Unlock Account" → User A login lại được

### 👤 **AI LÀM (Actors - Vai trò):**

**Người thực hiện:**
- **Admin (role_id = 1):** Người quản trị hệ thống
  - Quyền: Lock/Unlock bất kỳ user nào
  - Truy cập: UsersPage trong Admin Panel
  
**Đối tượng bị tác động:**
- **Instructor (role_id = 2):** Giảng viên
- **Learner (role_id = 3):** Học viên
- **Không thể lock Admin:** Để tránh khóa nhầm quản trị viên

**Điều kiện:**
- Phải đăng nhập với tài khoản Admin
- Có JWT token hợp lệ
- Không thể tự lock chính mình

### 📁 **Ở CLASS NÀO (File Structure - Cấu trúc file):**

#### **📱 FRONTEND (Phần giao diện người dùng):**

**1. Trang quản lý Users:**
```
src/pages/admin/UsersPage.jsx
```
- **Chức năng:** Hiển thị danh sách tất cả users (admin, instructor, learner)
- **Có gì:** Bảng users, nút Lock/Unlock, filter theo role
- **Khi nào dùng:** Admin click menu "Users" trong Admin Panel

### 🔧 **HÀM NÀO (Functions & Code - Code thực tế):**

#### **📱 FRONTEND FUNCTIONS (Hàm trên giao diện):**

**1. Khóa tài khoản - handleLockUser:**

```javascript
// File: src/pages/admin/UsersPage.jsx
// Vị trí: Khoảng dòng 200-230 (tùy version)

const handleLockUser = async (userId) => {
  // Bước 1: Hiển thị confirm dialog (hỏi admin có chắc không)
  const confirmed = window.confirm('Bạn có chắc muốn khóa tài khoản này?');
  if (!confirmed) return; // User click Cancel → dừng lại
  
  // Bước 2: Lấy token từ localStorage
  const token = localStorage.getItem('token');
  
  // Bước 3: Gọi API lock user
  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/lock`, // URL: http://localhost:3001/api/admin/users/5/lock
    {
      method: 'PUT', // Dùng PUT vì cập nhật dữ liệu
      headers: {
        'Authorization': `Bearer ${token}`, // Gửi token để xác thực
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Bước 4: Kiểm tra kết quả
  if (response.ok) {
    // Thành công (status 200)
    alert('Đã khóa tài khoản!');
    loadUsers(); // Reload lại danh sách users để thấy thay đổi
  } else {
    // Thất bại (status 400/500)
    const error = await response.json();
    alert(`Lỗi: ${error.message}`);
  }
}
```

**Giải thích từng bước:**
- **userId:** ID của user cần khóa (VD: 5)
- **fetch():** Hàm gọi API (giống XMLHttpRequest nhưng hiện đại hơn)
- **method: 'PUT':** Dùng PUT vì đây là update (không phải GET/POST)
- **Authorization header:** Backend kiểm tra header này để biết ai đang gọi
- **response.ok:** Là `true` nếu status code 200-299

**2. Mở khóa tài khoản - handleUnlockUser:**

```javascript
// File: src/pages/admin/UsersPage.jsx

const handleUnlockUser = async (userId) => {
  // Tương tự handleLockUser, chỉ khác endpoint
  const confirmed = window.confirm('Mở khóa tài khoản này?');
  if (!confirmed) return;
  
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/unlock`, // Khác: /unlock thay vì /lock
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    alert('Đã mở khóa tài khoản!');
    loadUsers();
  }
}
```

**3. Load danh sách users - loadUsers:**

```javascript
// File: src/pages/admin/UsersPage.jsx

const loadUsers = async () => {
  const token = localStorage.getItem('token');
  
  // Gọi API lấy danh sách users
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET', // GET = lấy dữ liệu
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json(); // Parse JSON response
  
  // data.data là array users: [{user_id: 1, full_name: "..."}, ...]
  setUsers(data.data); // Update state → React re-render bảng
}
```

**React State & Re-render:**
```javascript
#### **🔧 BACKEND API ENDPOINTS (API trên server):**

**1. API Lock User - Dòng 592-633:**

```javascript
// File: backend/routes/admin.js

// Route definition (định nghĩa route)
router.put(
  '/users/:userId/lock',        // Endpoint path (URL pattern)
  authenticateToken,             // Middleware 1: Kiểm tra token
  requireAdmin,                  // Middleware 2: Kiểm tra admin
  async (req, res) => {          // Handler function (hàm xử lý chính)
    
    // Bước 1: Lấy userId từ URL params
    // VD: URL = /users/5/lock → userId = 5
    const userId = parseInt(req.params.userId);
    
    // Bước 2: Kết nối database
    const pool = await getPool(); // Lấy connection pool từ database.js
    
    try {
      // Bước 3: Thực thi SQL query
      await pool.request()
        .input('userId', sql.Int, userId) // Bind parameter (tránh SQL injection)
        .query(`
          UPDATE users 
          SET status = 'locked' 
          WHERE user_id = @userId
        `);
      
      // Bước 4: Trả response thành công
      res.json({ 
        success: true, 
        message: 'User locked successfully' 
      });
      
    } catch (error) {
      // Bước 5: Xử lý lỗi (nếu có)
      console.error('Lock user error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to lock user' 
      });
    }
  }
);
```

**Giải thích chi tiết:**

**a) Route Parameters (`:userId`):**
```javascript
'/users/:userId/lock'  // Pattern với dynamic parameter

// Ví dụ:
// Request: PUT /users/5/lock
// → req.params.userId = "5" (string)
// → parseInt() → 5 (number)
```

**b) SQL Injection Prevention:**
```javascript
// ❌ SAI - Dễ bị SQL injection:
query(`UPDATE users SET status = 'locked' WHERE user_id = ${userId}`)

// ✅ ĐÚNG - Dùng parameterized query:
.input('userId', sql.Int, userId) // Bind parameter
.query(`... WHERE user_id = @userId`) // Dùng @userId placeholder
```

**c) Async/Await:**
```javascript
// Vì database query mất thời gian → dùng async/await
const pool = await getPool();        // Đợi kết nối DB
await pool.request().query(...);     // Đợi query hoàn thành
```

**2. API Unlock User - Dòng 635-663:**

```javascript
// File: backend/routes/admin.js

router.put('/users/:userId/unlock', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const pool = await getPool();
  
  try {
    // Khác Lock chỗ này: status = 'active' thay vì 'locked'
    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE users 
        SET status = 'active' 
        WHERE user_id = @userId
      `);
    
    res.json({ 
      success: true, 
      message: 'User unlocked successfully' 
    });
    
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to unlock user' 
### 🗄️ **DATABASE (Cơ sở dữ liệu):**

**Bảng: `users`**

**Cấu trúc bảng (Schema):**
```sql
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY IDENTITY(1,1),  -- ID tự tăng
  email NVARCHAR(255) UNIQUE NOT NULL,       -- Email đăng nhập
  password NVARCHAR(255) NOT NULL,           -- Password đã hash
  full_name NVARCHAR(255),                   -- Tên đầy đủ
  role_id INT NOT NULL,                      -- 1=Admin, 2=Instructor, 3=Learner
  status NVARCHAR(50) DEFAULT 'active',      -- 'active' hoặc 'locked' ← QUAN TRỌNG
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2
);
```

**Cột quan trọng: `status`**
- **Giá trị:** 
  - `'active'` - Tài khoản hoạt động bình thường
  - `'locked'` - Tài khoản bị khóa
- **Default:** `'active'` (khi tạo user mới)
- **Kiểu dữ liệu:** NVARCHAR(50)

**SQL Query Lock:**
```sql
UPDATE users 
SET status = 'locked'     -- Đổi từ 'active' → 'locked'
WHERE user_id = 5;        -- Chỉ update user có ID = 5
```

**SQL Query Unlock:**
```sql
UPDATE users 
SET status = 'active'     -- Đổi từ 'locked' → 'active'
WHERE user_id = 5;
```

**Ví dụ dữ liệu:**

| user_id | email | full_name | role_id | status | created_at |
|---------|-------|-----------|---------|--------|------------|
| 1 | admin@example.com | Admin | 1 | active | 2025-01-01 |
| 2 | gv.nguyen@example.com | GV. Nguyễn Văn A | 2 | active | 2025-01-05 |
| 3 | student@example.com | Học viên B | 3 | **locked** | 2025-02-10 |

→ User ID 3 bị lock → không thể login

**Kiểm tra status khi login:**

```javascript
// File: backend/routes/auth.js (Login endpoint)

// Sau khi verify password đúng
const user = await pool.request()
  .input('email', sql.NVarChar, email)
  .query(`SELECT * FROM users WHERE email = @email`);

// Kiểm tra status
if (user.recordset[0].status === 'locked') {
  return res.status(403).json({
    success: false,
    message: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.'
  });
}

// OK → tạo JWT token và cho phép login
```

### 🔄 **LUỒNG HOẠT ĐỘNG (Workflow - Chi tiết từng bước):**

**Kịch bản: Admin khóa tài khoản User ID = 5**

```
[FRONTEND - Browser]                [BACKEND - Server]              [DATABASE]

1. Admin click "Lock"
   ↓
2. Hiện confirm dialog
   "Bạn có chắc?"
   ↓
3. Admin click "Yes"
   ↓
4. handleLockUser(5)
   ↓
5. fetch('PUT /users/5/lock')
   Headers: {
     Authorization: "Bearer eyJ..."
   }
   ─────────────────→            6. Nhận request
                                    ↓
                                 7. authenticateToken()
                                    - Kiểm tra header có token?
                                    - Decode JWT
                                    - req.user = {userId: 1, role_id: 1}
                                    ↓
                                 8. requireAdmin()
                                    - Check role_id == 1?
                                    - ✅ OK → next()
                                    ↓
                                 9. Handler function
                                    - userId = 5
                                    - pool.request()
                                    ───────────────→         10. UPDATE users
                                                                 SET status = 'locked'
                                                                 WHERE user_id = 5
                                                             ↓
                                    ←───────────────         11. Query OK (1 row affected)
                                 12. res.json({
                                       success: true
                                     })
   ←─────────────────            
6. Response: {success: true}
   ↓
7. if (response.ok)
   ↓
8. alert('Đã khóa!')
   ↓
9. loadUsers()
   - Gọi GET /users
   - Nhận danh sách mới
   ↓
10. setUsers(newData)
    ↓
11. React re-render
    → Bảng users update
    → User 5 hiện status "Locked"
```

**User bị lock cố gắng login:**

```
[User 5 - Browser]              [BACKEND - Server]              [DATABASE]

1. Nhập email/password
   ↓
2. Click "Login"
   ↓
3. POST /auth/login
   ─────────────────→        4. Verify password
                                - ✅ Password đúng
                                ↓
                             5. Query user từ DB
                                ───────────────→     6. SELECT * FROM users
                                                        WHERE email = '...'
                                ←───────────────     7. Return: {
                                                          user_id: 5,
                                                          status: 'locked'
                                                        }
                                ↓
                             8. Check status
                                if (status === 'locked')
                                ↓
                             9. res.status(403).json({
                                  message: 'Tài khoản bị khóa'
                                })
   ←─────────────────        
4. Response: 403 Forbidden
   ↓
5. Hiện AccountLockedModal
   "⚠️ Tài khoản của bạn đã bị khóa"
```

**Thời gian xử lý:**
- Frontend → Backend: ~50-100ms (network latency)
- Backend xử lý: ~10-20ms (middleware + handler)
- Database query: ~5-10ms (UPDATE đơn giản)
- **Tổng:** ~100-150ms (rất nhanh)
**Middleware Code:**

```javascript
// File: backend/middleware/auth.js

// Middleware 1: Kiểm tra token
function authenticateToken(req, res, next) {
  // Lấy token từ header
  const authHeader = req.headers['authorization']; // "Bearer eyJhbGc..."
  const token = authHeader && authHeader.split(' ')[1]; // Lấy phần sau "Bearer "
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    req.user = user; // Gắn user info vào request
    // user = { userId: 1, role_id: 1, email: "admin@..." }
    next(); // Chuyển sang middleware tiếp theo
  });
}

// Middleware 2: Kiểm tra quyền admin
function requireAdmin(req, res, next) {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next(); // OK → chuyển sang handler
}
```ext(); // OK → chuyển sang handler
}
```

### 🔧 **HÀM NÀO:**

#### **Frontend Functions:**

**1. Khóa tài khoản:**
```javascript
// File: src/pages/admin/UsersPage.jsx
const handleLockUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/lock`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    // Reload user list
    loadUsers();
  }
}
```

**2. Mở khóa tài khoản:**
```javascript
// File: src/pages/admin/UsersPage.jsx
const handleUnlockUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unlock`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}
```

#### **Backend API Endpoints:**

**1. Lock User - Line 592-633:**
```javascript
// File: backend/routes/admin.js
router.put('/users/:userId/lock', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const pool = await getPool();
  
  // Update user status to 'locked'
  await pool.request()
    .input('userId', sql.Int, userId)
    .query(`UPDATE users SET status = 'locked' WHERE user_id = @userId`);
    
  res.json({ success: true, message: 'User locked successfully' });
});
```

**2. Unlock User - Line 635-663:**
```javascript
// File: backend/routes/admin.js
router.put('/users/:userId/unlock', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const pool = await getPool();
  
  // Update user status to 'active'
  await pool.request()
    .input('userId', sql.Int, userId)
    .query(`UPDATE users SET status = 'active' WHERE user_id = @userId`);
    
  res.json({ success: true, message: 'User unlocked successfully' });
});
```

### 🗄️ **DATABASE:**
- **Bảng:** `users`
- **Cột liên quan:** `status` ('active', 'locked')
- **SQL Query:**
  ```sql
  UPDATE users 
  SET status = 'locked' 
  WHERE user_id = @userId
  ```

### 🔄 **LUỒNG HOẠT ĐỘNG:**
1. Admin click nút "Lock" trên UsersPage
2. Frontend gọi API `PUT /api/admin/users/:userId/lock`
3. Backend kiểm tra quyền admin (requireAdmin middleware)
4. Backend update `status = 'locked'` trong bảng `users`
5. Trả về kết quả success
6. Frontend reload danh sách users
7. User bị khóa không thể login (check ở auth.js)

---

## 2. QUẢN LÝ COURSES (APPROVE/REJECT)

### 📋 **NGHIỆP VỤ:**
Instructor tạo khóa học mới với status='pending'. Admin phải duyệt (approve) hoặc từ chối (reject) trước khi khóa học được public.

### 👤 **AI LÀM:**
- **Tạo course:** Instructor (role_id = 2)
- **Duyệt course:** Admin (role_id = 1)

### 📁 **Ở CLASS NÀO:**

#### **Frontend:**
- **Trang duyệt:** `src/pages/admin/CoursePendingPage.jsx`
- **Trang quản lý:** `src/pages/admin/CoursesPage.jsx`
- **Dashboard:** `src/pages/admin/AdminPanel.jsx` (hiển thị KPI pending courses)

#### **Backend:**
- **API Routes:** `backend/routes/admin.js` (line 395-558)
- **Middleware:** `authenticateToken`, `requireAdmin`

### 🔧 **HÀM NÀO:**

#### **Frontend Functions:**

**1. Lấy danh sách pending courses:**
```javascript
// File: src/pages/admin/CoursePendingPage.jsx
const loadPendingCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/courses/pending`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setPendingCourses(data.data);
}
```

**2. Approve course:**
```javascript
// File: src/pages/admin/CoursePendingPage.jsx
const handleApproveCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    loadPendingCourses(); // Reload
  }
}
```

**3. Reject course:**
```javascript
// File: src/pages/admin/CoursePendingPage.jsx
const handleRejectCourse = async (courseId, reason) => {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/reject`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
}
```

#### **Backend API Endpoints:**

**1. Get Pending Courses - Line 395-437:**
```javascript
// File: backend/routes/admin.js
router.get('/courses/pending', authenticateToken, requireAdmin, async (req, res) => {
  const pool = await getPool();
  
  const result = await pool.request().query(`
    SELECT 
      c.course_id,
      c.title,
      c.description,
      c.price,
      c.status,
      c.created_at,
      u.full_name as instructor_name
    FROM courses c
    JOIN users u ON c.owner_instructor_id = u.user_id
    WHERE c.status = 'pending'
    ORDER BY c.created_at DESC
  `);
  
  res.json({ success: true, data: result.recordset });
});
```

**2. Approve Course - Line 466-493:**
```javascript
// File: backend/routes/admin.js
router.put('/courses/:courseId/approve', authenticateToken, requireAdmin, async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const pool = await getPool();
  
  // Update course status to 'active'
  await pool.request()
    .input('courseId', sql.BigInt, courseId)
    .query(`
      UPDATE courses 
      SET status = 'active', updated_at = GETDATE() 
      WHERE course_id = @courseId
    `);
  
  res.json({ success: true, message: 'Course approved successfully' });
});
```

**3. Reject Course - Line 526-558:**
```javascript
// File: backend/routes/admin.js
router.put('/courses/:courseId/reject', authenticateToken, requireAdmin, async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const { reason } = req.body;
  const pool = await getPool();
  
  // Update course status to 'rejected'
  await pool.request()
    .input('courseId', sql.BigInt, courseId)
    .input('reason', sql.NVarChar, reason)
    .query(`
      UPDATE courses 
      SET status = 'rejected', 
          rejection_reason = @reason,
          updated_at = GETDATE() 
      WHERE course_id = @courseId
    `);
  
  // TODO: Send notification to instructor
  
  res.json({ success: true, message: 'Course rejected' });
});
```

### 🗄️ **DATABASE:**
- **Bảng:** `courses`
- **Cột liên quan:** 
  - `status` ('pending', 'active', 'rejected', 'draft')
  - `rejection_reason` (nếu reject)
  - `updated_at`

### 🔄 **LUỒNG HOẠT ĐỘNG:**
1. Instructor tạo course → status = 'pending'
2. Admin vào CoursePendingPage → gọi API GET `/admin/courses/pending`
3. Hiển thị danh sách courses chờ duyệt
4. Admin click "Approve" hoặc "Reject"
5. Frontend gọi API PUT `/admin/courses/:id/approve` hoặc `/reject`
6. Backend update status trong database
7. (Optional) Gửi notification cho instructor
8. Frontend reload danh sách

---

## 3. CHAT SYSTEM (ADMIN SUPPORT)

### 📋 **NGHIỆP VỤ:**
User (learner/instructor) có thể chat trực tiếp với Admin/Support qua hệ thống chat realtime. Admin có thể assign, archive, close conversations.

### 👤 **AI LÀM:**
- **Bắt đầu chat:** Learner/Instructor
- **Trả lời chat:** Admin (role_id = 1)
- **Quản lý chat:** Admin

### 📁 **Ở CLASS NÀO:**

#### **Frontend:**
- **Admin chat view:** `src/pages/admin/ConversationsPage.jsx` (920 lines)
- **Instructor floating chat:** `src/components/chat/InstructorAdminChat.jsx` (895 lines)
- **UI components:** `src/components/ui/chat.jsx`
- **WebSocket context:** `src/contexts/WebSocketContext.jsx`

#### **Backend:**
- **API Routes:** `backend/routes/chat.js` (680 lines)
- **WebSocket handlers:** `backend/server.js` (Socket.IO events)
- **Middleware:** `authenticateToken`

### 🔧 **HÀM NÀO:**

#### **Frontend Functions:**

**1. Bắt đầu conversation (User):**
```javascript
// File: src/components/chat/InstructorAdminChat.jsx (line 130-180)
const startConversation = async () => {
  // Gọi API tạo conversation
  const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      participant_ids: [adminId], // Admin user_id
      title: 'Support Request'
    })
  });
  
  const data = await response.json();
  setConversationId(data.data.conversation_id);
  
  // Emit socket event
  socket.emit('chat:start_conversation', {
    conversationId: data.data.conversation_id
  });
}
```

**2. Gửi tin nhắn:**
```javascript
// File: src/components/chat/InstructorAdminChat.jsx (line 220-260)
const sendMessage = async (messageText) => {
  // Gọi API gửi message
  const response = await fetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: messageText })
    }
  );
  
  // Emit socket event
  socket.emit('chat:send_message', {
    conversationId,
    content: messageText
  });
}
```

**3. Archive conversation (Admin):**
```javascript
// File: src/pages/admin/ConversationsPage.jsx (line 320-350)
const handleArchiveConversation = async (conversationId) => {
  const response = await fetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/archive`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    loadConversations(); // Reload list
  }
}
```

**4. Restore conversation:**
```javascript
// File: src/pages/admin/ConversationsPage.jsx (line 380-410)
const handleRestoreConversation = async (conversationId) => {
  const response = await fetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/restore`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
}
```

#### **Backend API Endpoints:**

**1. Get Conversations - Line 16-89:**
```javascript
// File: backend/routes/chat.js
router.get('/conversations', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { status } = req.query; // 'active', 'archived', 'closed'
  
  const pool = await getPool();
  
  let statusFilter = status ? `AND c.status = '${status}'` : '';
  
  const result = await pool.request()
    .input('userId', sql.BigInt, userId)
    .query(`
      SELECT 
        c.conversation_id,
        c.title,
        c.status,
        c.created_at,
        c.updated_at,
        u.full_name as participant_name,
        (SELECT TOP 1 content 
         FROM messages 
         WHERE conversation_id = c.conversation_id 
         ORDER BY created_at DESC) as last_message
      FROM conversations c
      JOIN conversation_participants cp ON c.conversation_id = cp.conversation_id
      JOIN users u ON cp.user_id = u.user_id
      WHERE cp.user_id = @userId ${statusFilter}
      ORDER BY c.updated_at DESC
    `);
  
  res.json({ success: true, data: result.recordset });
});
```

**2. Create Conversation - Line 91-153:**
```javascript
// File: backend/routes/chat.js
router.post('/conversations', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { participant_ids, title } = req.body;
  
  const pool = await getPool();
  
  // Insert conversation
  const convResult = await pool.request()
    .input('title', sql.NVarChar, title || 'New Conversation')
    .query(`
      INSERT INTO conversations (title, status, created_at, updated_at)
      OUTPUT INSERTED.conversation_id
      VALUES (@title, 'active', GETDATE(), GETDATE())
    `);
  
  const conversationId = convResult.recordset[0].conversation_id;
  
  // Add participants (user + admin)
  const participantIds = [userId, ...participant_ids];
  for (const pid of participantIds) {
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('userId', sql.BigInt, pid)
      .query(`
        INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
        VALUES (@conversationId, @userId, GETDATE())
      `);
  }
  
  res.json({ success: true, data: { conversation_id: conversationId } });
});
```

**3. Archive Conversation - Line 246-310:**
```javascript
// File: backend/routes/chat.js
router.put('/conversations/:id/archive', authenticateToken, async (req, res) => {
  const conversationId = parseInt(req.params.id);
  const pool = await getPool();
  
  await pool.request()
    .input('conversationId', sql.BigInt, conversationId)
    .query(`
      UPDATE conversations 
      SET status = 'archived', updated_at = GETDATE() 
      WHERE conversation_id = @conversationId
    `);
  
  res.json({ success: true, message: 'Conversation archived' });
});
```

**4. Restore Conversation - Line 312-376:**
```javascript
// File: backend/routes/chat.js
router.put('/conversations/:id/restore', authenticateToken, async (req, res) => {
  const conversationId = parseInt(req.params.id);
  const pool = await getPool();
  
  await pool.request()
    .input('conversationId', sql.BigInt, conversationId)
    .query(`
      UPDATE conversations 
      SET status = 'active', updated_at = GETDATE() 
      WHERE conversation_id = @conversationId
    `);
  
  res.json({ success: true, message: 'Conversation restored' });
});
```

**5. Send Message - Line 536-636:**
```javascript
// File: backend/routes/chat.js
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const conversationId = parseInt(req.params.id);
  const userId = req.user.userId;
  const { content } = req.body;
  
  const pool = await getPool();
  
  // Insert message
  const result = await pool.request()
    .input('conversationId', sql.BigInt, conversationId)
    .input('senderId', sql.BigInt, userId)
    .input('content', sql.NVarChar, content)
    .query(`
      INSERT INTO messages (conversation_id, sender_id, content, created_at)
      OUTPUT INSERTED.*
      VALUES (@conversationId, @senderId, @content, GETDATE())
    `);
  
  // Update conversation updated_at
  await pool.request()
    .input('conversationId', sql.BigInt, conversationId)
    .query(`UPDATE conversations SET updated_at = GETDATE() WHERE conversation_id = @conversationId`);
  
  res.json({ success: true, data: result.recordset[0] });
});
```

#### **WebSocket Events:**

**File: backend/server.js**

```javascript
// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join conversation room
  socket.on('chat:start_conversation', ({ conversationId }) => {
    socket.join(`conversation_${conversationId}`);
  });
  
  // Send message
  socket.on('chat:send_message', ({ conversationId, content }) => {
    // Broadcast to all in room
    io.to(`conversation_${conversationId}`).emit('chat:message_received', {
      conversationId,
      content,
      timestamp: new Date()
    });
  });
  
  // Typing indicator
  socket.on('chat:typing', ({ conversationId, userName }) => {
    socket.to(`conversation_${conversationId}`).emit('chat:user_typing', { userName });
  });
});
```

### 🗄️ **DATABASE:**
- **Bảng:** 
  - `conversations` (conversation_id, title, status, created_at, updated_at)
  - `messages` (message_id, conversation_id, sender_id, content, created_at)
  - `conversation_participants` (conversation_id, user_id, joined_at)

### 🔄 **LUỒNG HOẠT ĐỘNG:**
1. User click icon chat → mở InstructorAdminChat component
2. Frontend gọi API POST `/chat/conversations` → tạo conversation
3. Socket emit `chat:start_conversation` → join room
4. User gõ tin nhắn → gọi API POST `/chat/conversations/:id/messages`
5. Socket emit `chat:send_message`
6. Server broadcast `chat:message_received` cho tất cả trong room
7. Admin nhận realtime message trên ConversationsPage
8. Admin trả lời → lặp lại flow
9. Admin có thể archive/restore/close conversation

---

## 4. REVENUE MANAGEMENT

### 📋 **NGHIỆP VỤ:**
Quản lý doanh thu từ các khóa học, thanh toán cho instructor, xem báo cáo doanh thu.

### 👤 **AI LÀM:**
- **Xem revenue:** Admin
- **Xem báo cáo cá nhân:** Instructor
- **Thanh toán:** Admin (PayoutsPage)

### 📁 **Ở CLASS NÀO:**

#### **Frontend:**
- **Tổng quan:** `src/pages/admin/AdminPanel.jsx` (KPI card "Doanh thu")
- **Báo cáo instructor:** `src/pages/admin/InstructorReportsPage.jsx`
- **Thanh toán:** `src/pages/admin/PayoutsPage.jsx`

#### **Backend:**
- **Admin revenue:** `backend/routes/admin.js` (line 695-741)
- **Stats API:** `backend/routes/admin.js` (line 44-118)

### 🔧 **HÀM NÀO:**

#### **Frontend Functions:**

**1. Load Dashboard Revenue (KPI Card):**
```javascript
// File: src/pages/admin/AdminPanel.jsx (line 1082-1120)
const loadDashboardData = async () => {
  // Fetch stats
  const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const statsData = await statsRes.json();
  
  // Set revenue from payments table
  setStats({
    totalRevenue: statsData.data.totalRevenue || 0, // From payments.amount_cents
    // ... other stats
  });
}
```

**2. Load Instructor Revenue:**
```javascript
// File: src/pages/admin/InstructorReportsPage.jsx
const loadInstructorRevenue = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/instructor-revenue`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setInstructorRevenue(data.data); // Array of instructor revenue
}
```

#### **Backend API Endpoints:**

**1. Get Dashboard Stats (Total Revenue) - Line 44-118:**
```javascript
// File: backend/routes/admin.js
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  const pool = await getPool();
  
  // Total revenue from payments table
  const revenueResult = await pool.request().query(`
    SELECT 
      ISNULL(SUM(amount_cents), 0) as totalRevenue,
      ISNULL(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END), 0) as completedRevenue
    FROM payments
  `);
  
  const revenue = revenueResult.recordset[0];
  
  res.json({
    success: true,
    data: {
      totalRevenue: revenue.totalRevenue || 0, // In cents
      completedRevenue: revenue.completedRevenue || 0,
      // ... other stats
    }
  });
});
```

**2. Get Instructor Revenue - Line 695-741:**
```javascript
// File: backend/routes/admin.js
router.get('/instructor-revenue', authenticateToken, requireAdmin, async (req, res) => {
  const pool = await getPool();
  
  const query = `
    SELECT 
      u.user_id,
      u.full_name as instructor_name,
      u.email,
      ISNULL(SUM(inv.amount), 0) as total_revenue,
      ISNULL(SUM(inv.amount), 0) * 0.10 as commission_owed,
      COUNT(DISTINCT c.course_id) as course_count
    FROM users u
    LEFT JOIN courses c ON c.owner_instructor_id = u.user_id
    LEFT JOIN invoices inv ON inv.course_id = c.course_id AND inv.status = 'paid'
    WHERE u.role_id = 2
    GROUP BY u.user_id, u.full_name, u.email
    ORDER BY total_revenue DESC
  `;
  
  const result = await pool.request().query(query);
  
  res.json({
    success: true,
    data: result.recordset
  });
});
```

### 🗄️ **DATABASE:**
- **Bảng revenue:**
  - `payments` - Payment từ VNPay/gateway (amount_cents)
  - `invoices` - Invoice nội bộ (amount, status='paid')
  
- **Công thức:**
  ```sql
  -- Total platform revenue (từ payments)
  SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'
  
  -- Instructor revenue (từ invoices)
  SELECT 
    SUM(invoices.amount) as total_revenue,
    SUM(invoices.amount) * 0.10 as commission
  FROM courses
  JOIN invoices ON courses.course_id = invoices.course_id
  WHERE courses.owner_instructor_id = @instructorId 
    AND invoices.status = 'paid'
  ```

### 🔄 **LUỒNG HOẠT ĐỘNG:**
1. User mua khóa học → tạo record trong `payments` (status='paid')
2. Tạo record trong `invoices` (amount, course_id)
3. AdminPanel hiển thị total revenue từ `payments.SUM(amount_cents)`
4. InstructorReportsPage hiển thị revenue theo instructor từ `invoices`
5. Commission = total_revenue * 10%

---

## 5. LEARNING STATISTICS

### 📋 **NGHIỆP VỤ:**
Xem thống kê học tập: số learners, progress, study time, exam performance, top courses, top learners.

### 👤 **AI LÀM:**
- **Xem stats:** Admin

### 📁 **Ở CLASS NÀO:**

#### **Frontend:**
- **Trang thống kê:** `src/pages/admin/LearningStatsPage.jsx` (450 lines)

#### **Backend:**
- **API endpoint:** `backend/routes/admin.js` (line 824-985)

### 🔧 **HÀM NÀO:**

#### **Frontend Functions:**

**File: src/pages/admin/LearningStatsPage.jsx**

```javascript
const loadStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/learning-stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  setStatsData({
    overview: data.data.overview,           // Total enrollments, learners, avg progress
    completion: data.data.completion,       // Not started, in progress, completed
    studyTime: data.data.studyTime,         // Avg time, total hours
    examPerformance: data.data.examPerformance, // Pass rate, avg score
    recentActivity: data.data.recentActivity,   // Last 30 days
    topCourses: data.data.topCourses,       // Top 5 courses
    topLearners: data.data.topLearners      // Top 10 learners
  });
}
```

#### **Backend API Endpoint:**

**File: backend/routes/admin.js (Line 824-985)**

```javascript
router.get('/learning-stats', authenticateToken, requireAdmin, async (req, res) => {
  const pool = await getPool();
  
  // 1. Enrollment & completion stats
  const completionResult = await pool.request().query(`
    SELECT 
      COUNT(*) as total_enrollments,
      COUNT(DISTINCT user_id) as total_learners,
      SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as not_started,
      SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed,
      CAST(SUM(CASE WHEN completed_at IS NOT NULL THEN 100.0 ELSE 0 END) / NULLIF(COUNT(*), 0) as DECIMAL(5,2)) as completion_rate
    FROM enrollments
    WHERE status = 'active'
  `);
  
  // 2. Top courses
  const topCoursesResult = await pool.request().query(`
    SELECT TOP 5
      c.course_id,
      c.title,
      c.thumbnail_url,
      u.full_name as instructor_name,
      COUNT(e.enrollment_id) as enrolled_count,
      CAST(SUM(CASE WHEN e.completed_at IS NOT NULL THEN 100.0 ELSE 0 END) / NULLIF(COUNT(e.enrollment_id), 0) as DECIMAL(5,2)) as completion_rate
    FROM courses c
    LEFT JOIN users u ON c.owner_instructor_id = u.user_id
    LEFT JOIN enrollments e ON c.course_id = e.course_id
    WHERE c.status = 'active'
    GROUP BY c.course_id, c.title, c.thumbnail_url, u.full_name
    ORDER BY enrolled_count DESC
  `);
  
  // 3. Study time from progress table
  const avgTimeResult = await pool.request().query(`
    SELECT 
      COUNT(DISTINCT user_id) as active_learners,
      SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as total_completed_lessons,
      COUNT(*) as total_lesson_attempts
    FROM progress
  `);
  
  // 4. Exam performance (mock data - table doesn't exist)
  const examStatsResult = {
    recordset: [{
      students_took_exams: 0,
      total_exam_attempts: 0,
      passed_attempts: 0,
      avg_exam_score: 0,
      pass_rate: 0
    }]
  };
  
  // 5. Recent activity (30 days)
  const recentActivityResult = await pool.request().query(`
    SELECT 
      COUNT(DISTINCT e.user_id) as active_users_last_30days,
      COUNT(DISTINCT CASE WHEN e.enrollment_date >= DATEADD(day, -30, GETDATE()) THEN e.user_id END) as new_enrollments_last_30days,
      COUNT(DISTINCT CASE WHEN e.completed_at >= DATEADD(day, -30, GETDATE()) THEN e.user_id END) as completions_last_30days
    FROM enrollments e
    WHERE e.last_accessed >= DATEADD(day, -30, GETDATE())
  `);
  
  // 6. Top learners
  const topLearnersResult = await pool.request().query(`
    SELECT TOP 10
      u.user_id,
      u.full_name,
      u.email,
      COUNT(e.enrollment_id) as courses_enrolled,
      SUM(CASE WHEN e.completed_at IS NOT NULL THEN 1 ELSE 0 END) as courses_completed
    FROM users u
## 📊 TỔNG KẾT CÁCH THUYẾT TRÌNH

### **KHI ĐƯỢC HỎI VỀ MỘT TÍNH NĂNG, TRẢ LỜI THEO 5 BƯỚC:**

#### **BƯỚC 1: NGHIỆP VỤ (Business Logic) - "Làm gì? Tại sao cần?"**

**Template trả lời:**
> "Tính năng [tên] giúp [ai] có thể [làm gì]. Điều này giải quyết vấn đề [vấn đề gì] trong hệ thống. Ví dụ: [kịch bản cụ thể]."

**Ví dụ:**
> "Tính năng Lock Account giúp Admin có thể tạm khóa tài khoản người dùng vi phạm. Điều này giải quyết vấn đề spam, lừa đảo mà không cần xóa vĩnh viễn tài khoản. Ví dụ: User A spam tin nhắn → Admin lock → User không login được nhưng vẫn giữ dữ liệu."

#### **BƯỚC 2: AI LÀM (Actors) - "Ai có quyền? Ai bị ảnh hưởng?"**

**Phân tích vai trò:**
- **Admin (role_id = 1):** Toàn quyền quản trị
- **Instructor (role_id = 2):** Tạo khóa học, xem revenue
- **Learner (role_id = 3):** Học tập, mua khóa học

**Template:**
> "Chức năng này do [role] thực hiện, tác động đến [đối tượng]. Cần quyền [permission] mới có thể sử dụng."

**Ví dụ:**
> "Chức năng Lock do Admin thực hiện, tác động đến Instructor và Learner. Cần quyền Admin (role_id = 1) được kiểm tra bởi middleware requireAdmin."

#### **BƯỚC 3: Ở CLASS NÀO (Files) - "File nào? Dòng nào?"**

**Cấu trúc trả lời:**

**Frontend:**
- Page/Component: `src/pages/admin/XxxPage.jsx`
- Function chính: `handleXxx()` 
- UI Component: `src/components/xxx.jsx`

**Backend:**
- Route file: `backend/routes/xxx.js`
- Endpoint: `router.method('/path', middleware, handler)` (dòng X-Y)
- Middleware: `backend/middleware/auth.js`

**Database:**
- Table: `table_name`
- Columns: `column1, column2`

**Template:**
> "Frontend nằm ở [file] dòng [X-Y], có hàm [tên hàm]. Backend ở [file] dòng [X-Y], endpoint [method + path]. Database dùng bảng [tên] với cột [tên cột]."

**Ví dụ cụ thể:**
> "Frontend nằm ở UsersPage.jsx dòng 200-230, có hàm handleLockUser(). Backend ở admin.js dòng 592-633, endpoint PUT /users/:userId/lock. Database dùng bảng users với cột status."

#### **BƯỚC 4: HÀM NÀO (Code) - "Code thực tế như thế nào?"**

**Giải thích từng phần:**

**Frontend Function:**
```javascript
const handleLockUser = async (userId) => {
  // 1. Confirm
  // 2. Get token từ localStorage
  // 3. Gọi API fetch()
  // 4. Check response
  // 5. Update UI
}
```

**Backend Endpoint:**
```javascript
router.put('/path', authenticateToken, requireAdmin, async (req, res) => {
  // 1. Lấy params
  // 2. Connect DB
  // 3. Execute query
  // 4. Return response
  // 5. Error handling
});
```

**SQL Query:**
```sql
UPDATE table_name 
SET column = 'value' 
WHERE condition;
```

**Template:**
> "Hàm [tên] thực hiện [số] bước: 1) [bước 1], 2) [bước 2]... Backend endpoint nhận [params], xử lý qua [middleware], chạy query [SQL]."

#### **BƯỚC 5: LUỒNG HOẠT ĐỘNG (Flow) - "Chạy từ đầu đến cuối thế nào?"**

**Vẽ sơ đồ flow:**

```
User Action → Frontend Function → API Call → Middleware → Handler → DB Query → Response → UI Update
```

**Chi tiết từng bước:**

1. **User Action:** User click button/submit form
2. **Frontend Function:** handleXxx() được gọi
3. **API Call:** fetch() gửi HTTP request + token
4. **Middleware:** Backend check authentication & authorization
5. **Handler:** Xử lý logic, validate input
6. **DB Query:** Execute SQL (INSERT/UPDATE/DELETE/SELECT)
7. **Response:** Backend trả JSON {success, data/error}
8. **UI Update:** Frontend nhận response, update state, re-render

**Template:**
> "Luồng hoạt động: 1) User [hành động] → 2) Frontend gọi [function] → 3) API [method + endpoint] → 4) Middleware [tên] kiểm tra [gì] → 5) Handler [xử lý gì] → 6) Database [query gì] → 7) Response [trả về gì] → 8) UI [update như thế nào]."

**Ví dụ hoàn chỉnh:**
> "Luồng Lock Account: 
> 1) Admin click nút Lock → 
> 2) Frontend gọi handleLockUser(5) → 
> 3) API PUT /users/5/lock với token → 
> 4) Middleware authenticateToken kiểm tra JWT, requireAdmin kiểm tra role_id → 
> 5) Handler lấy userId từ params → 
> 6) Database chạy UPDATE users SET status='locked' WHERE user_id=5 → 
> 7) Response {success: true} → 
> 8) UI reload danh sách users, hiển thị status 'Locked'."

---

## 🎤 SCRIPT THUYẾT TRÌNH MẪU

### **Câu hỏi: "Em hãy giải thích tính năng Lock/Unlock Account"**

**Trả lời (2-3 phút):**

"Dạ em xin trình bày về tính năng Lock/Unlock Account ạ.

**[BƯỚC 1 - NGHIỆP VỤ]**
Tính năng này giúp Admin có thể tạm khóa tài khoản người dùng khi phát hiện vi phạm như spam hoặc gian lận. Điểm đặc biệt là khi khóa, hệ thống không xóa dữ liệu mà chỉ ngăn user login, và Admin có thể unlock bất cứ lúc nào. Ví dụ thực tế: nếu học viên A spam tin nhắn trong chat, Admin có thể khóa tài khoản ngay lập tức, khi học viên xin lỗi thì Admin unlock lại.

**[BƯỚC 2 - VAI TRÒ]**
Chỉ có Admin với role_id = 1 mới được phép lock/unlock. Đối tượng bị tác động là Instructor (role_id = 2) và Learner (role_id = 3). Hệ thống có middleware requireAdmin để đảm bảo chỉ admin mới gọi được API này.

**[BƯỚC 3 - CẤU TRÚC FILE]**
Về mặt kỹ thuật, Frontend em đặt ở file UsersPage.jsx trong thư mục src/pages/admin, có hàm handleLockUser và handleUnlockUser. Backend em viết ở admin.js dòng 592 đến 663, có 2 endpoints: PUT /users/:userId/lock và PUT /users/:userId/unlock. Database em dùng bảng users với cột status, có 2 giá trị là 'active' và 'locked'.

**[BƯỚC 4 - CODE CHẠY]**
Khi Admin click nút Lock, frontend sẽ gọi hàm handleLockUser(). Hàm này làm 3 việc: 1) Hiện confirm dialog, 2) Lấy token từ localStorage, 3) Gọi API fetch() với method PUT. Backend nhận request, chạy qua 2 middleware là authenticateToken để kiểm tra JWT token, và requireAdmin để kiểm tra role_id. Sau đó chạy SQL query: UPDATE users SET status = 'locked' WHERE user_id = [id]. Database update xong trả về success.

**[BƯỚC 5 - LUỒNG HOẠT ĐỘNG]**
Tổng kết luồng chạy: Admin click Lock → Frontend gọi API → Backend check token và quyền → Database update status → Frontend nhận response → Reload danh sách users → Hiển thị trạng thái 'Locked'. Khi user bị lock cố gắng login, backend sẽ kiểm tra cột status, nếu là 'locked' thì trả về lỗi 403 và hiện modal 'Tài khoản bị khóa'.

**[KẾT]**
Như vậy tính năng Lock/Unlock giúp Admin quản lý user hiệu quả mà không mất dữ liệu, đảm bảo an toàn và có thể khôi phục bất cứ lúc nào ạ."

---

## 💡 MẸO THUYẾT TRÌNH CHO NGƯỜI MỚI

### **1. Chuẩn bị trước:**
- [ ] Đọc kỹ file này 2-3 lần
- [ ] Chạy thử từng tính năng trên localhost
- [ ] Mở Chrome DevTools → Network tab → xem API calls
- [ ] Mở database → chạy thử SQL queries
- [ ] Ghi chú line numbers quan trọng

### **2. Khi thuyết trình:**
- ✅ **Bắt đầu từ User (người dùng):** "User làm gì → hệ thống phản ứng thế nào"
- ✅ **Dùng thuật ngữ đơn giản:** "Gọi API" thay vì "Invoke RESTful endpoint"
- ✅ **Vẽ sơ đồ:** Frontend → Backend → Database (dùng bảng trắng)
- ✅ **Demo thật:** Mở browser, click thử, xem console log
- ✅ **Giải thích từng bước:** Không nhảy cóc, đi từ trái sang phải

### **3. Trả lời câu hỏi:**
- ✅ **Nghe kỹ câu hỏi:** Xác định hỏi về nghiệp vụ hay kỹ thuật
- ✅ **Trả lời ngắn gọn trước:** "Tính năng này làm X" → sau đó mới detail
- ✅ **Thừa nhận nếu không biết:** "Em chưa tìm hiểu phần này, nhưng em nghĩ..."
- ✅ **Liên hệ thực tế:** "Giống như Facebook khi ban account"

### **4. Tránh những lỗi này:**
- ❌ Nói quá nhanh → khán giả không kịp hiểu
- ❌ Dùng quá nhiều thuật ngữ kỹ thuật → người không chuyên khó hiểu
- ❌ Không giải thích tại sao → chỉ nói "làm thế này" không nói "tại sao"
- ❌ Quên demo → lý thuyết suông nhàm chán
- ❌ Không chuẩn bị câu hỏi → bị hỏi là blank

### **5. Từ vựng nên dùng:**

**Thay vì nói:**
- "Invoke API" → "Gọi API" ✅
- "Instantiate object" → "Tạo object" ✅
- "Parameterized query" → "Query có tham số" ✅
- "Middleware pipeline" → "Chuỗi kiểm tra trước khi xử lý" ✅
- "State management" → "Quản lý dữ liệu trên giao diện" ✅

### **6. Các câu hỏi hay gặp:**

**Q: "Tại sao dùng PUT không dùng POST?"**
A: "PUT dùng để update dữ liệu có sẵn, POST dùng để tạo mới. Lock/Unlock là update cột status nên dùng PUT."

**Q: "JWT token là gì?"**
A: "JWT là chuỗi mã hóa chứa thông tin user (user_id, role). Backend dùng nó để biết ai đang gọi API mà không cần query database mỗi lần."

**Q: "Tại sao cần middleware?"**
A: "Middleware giúp tách code kiểm tra ra khỏi handler. Thay vì mỗi endpoint đều viết code check token, em chỉ cần thêm middleware vào route."

**Q: "SQL Injection là gì? Làm sao phòng tránh?"**
A: "SQL Injection là khi hacker nhập input độc hại để chạy SQL lạ. Em phòng tránh bằng parameterized query (.input()) thay vì ghép string trực tiếp."

**Q: "React re-render khi nào?"**
A: "Khi state thay đổi (VD: setUsers() được gọi). React so sánh state cũ/mới, nếu khác thì re-render component."

---

## 📚 TÀI LIỆU THAM KHẢO THÊM

### **Học thêm về:**
- **JWT:** https://jwt.io/introduction
- **RESTful API:** https://restfulapi.net/
- **React Hooks:** https://react.dev/reference/react
- **Express.js:** https://expressjs.com/en/guide/routing.html
- **SQL Server:** https://learn.microsoft.com/en-us/sql/

### **Tools hữu ích:**
- **Postman:** Test API không cần frontend
- **DB Browser:** Xem database trực quan (Azure Data Studio)
- **React DevTools:** Debug React components
- **Chrome DevTools:** Debug network, console
  - `courses` - Course info
  - `users` - User info

### 🔄 **LUỒNG HOẠT ĐỘNG:**
1. Admin vào LearningStatsPage
2. Frontend gọi API GET `/admin/learning-stats`
3. Backend chạy 6 queries song song
4. Aggregate data và return JSON
5. Frontend hiển thị:
   - 4 KPI cards (learners, avg progress, completion rate, study time)
   - Recent activity panel
   - Study time & exam performance grids
   - Top courses với thumbnails
   - Top learners table với progress bars

---

## 6. CATEGORIES MANAGEMENT

### 📋 **NGHIỆP VỤ:**
Quản lý danh mục khóa học (Technology, Business, Design, etc.)

### 👤 **AI LÀM:**
- **Quản lý:** Admin

### 📁 **Ở CLASS NÀO:**

#### **Frontend:**
- **Trang quản lý:** `src/pages/admin/CategoriesPage.jsx`

#### **Backend:**
- **API routes:** `backend/routes/admin.js` (line 987-1205)

### 🔧 **HÀM NÀO:**

#### **Backend API Endpoints:**

**1. Get Categories - Line 987-1038:**
```javascript
router.get('/categories', authenticateToken, requireAdmin, async (req, res) => {
  const pool = await getPool();
  
  const result = await pool.request().query(`
    SELECT 
      category_id,
      name,
      description,
      created_at
    FROM categories
    ORDER BY name ASC
  `);
  
  res.json({ success: true, data: result.recordset });
});
```

**2. Create Category - Line 1040-1094:**
```javascript
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  const pool = await getPool();
  
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .query(`
      INSERT INTO categories (name, description, created_at)
      OUTPUT INSERTED.*
      VALUES (@name, @description, GETDATE())
    `);
  
  res.json({ success: true, data: result.recordset[0] });
});
```

**3. Update Category - Line 1096-1155:**
```javascript
router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  const categoryId = parseInt(req.params.id);
  const { name, description } = req.body;
  const pool = await getPool();
  
  await pool.request()
    .input('categoryId', sql.Int, categoryId)
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .query(`
      UPDATE categories 
      SET name = @name, description = @description 
      WHERE category_id = @categoryId
    `);
  
  res.json({ success: true, message: 'Category updated' });
});
```

**4. Delete Category - Line 1157-1205:**
```javascript
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  const categoryId = parseInt(req.params.id);
  const pool = await getPool();
  
  // Check if category has courses
  const checkResult = await pool.request()
    .input('categoryId', sql.Int, categoryId)
    .query(`SELECT COUNT(*) as count FROM courses WHERE category_id = @categoryId`);
  
  if (checkResult.recordset[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with existing courses'
    });
  }
  
  // Delete category
  await pool.request()
    .input('categoryId', sql.Int, categoryId)
    .query(`DELETE FROM categories WHERE category_id = @categoryId`);
  
  res.json({ success: true, message: 'Category deleted' });
});
```

---

## 📊 TỔNG KẾT CÁCH THUYẾT TRÌNH

### **Khi được hỏi về một tính năng, trả lời theo cấu trúc:**

#### **1. NGHIỆP VỤ** (Business Logic)
- Mô tả chức năng làm gì
- Giải quyết vấn đề gì
- Ai được phép sử dụng

#### **2. AI LÀM** (Actors)
- Admin (role_id = 1)
- Instructor (role_id = 2)
- Learner (role_id = 3)

#### **3. Ở CLASS NÀO** (Files & Structure)
- **Frontend:** Component/Page nào
- **Backend:** Route file nào
- **Database:** Table nào

#### **4. HÀM NÀO** (Functions & API)
- Frontend: Function name + line number
- Backend: Endpoint + HTTP method + line number
- SQL: Query cụ thể

#### **5. LUỒNG HOẠT ĐỘNG** (Workflow)
- Bước 1 → 2 → 3 (User action → API call → DB update → Response)

---

## 🎯 VÍ DỤ THỰC TẾ

### **Câu hỏi: "Giải thích tính năng Lock/Unlock Account"**

**Trả lời:**

**1. Nghiệp vụ:**
"Tính năng Lock Account cho phép Admin khóa tài khoản người dùng khi phát hiện vi phạm nội quy hoặc spam. User bị khóa không thể đăng nhập vào hệ thống cho đến khi Admin unlock."

**2. Ai làm:**
"Chỉ có Admin (role_id = 1) mới có quyền lock/unlock. Đối tượng bị khóa là Learner hoặc Instructor (role_id = 2, 3)."

**3. Ở class nào:**
"Frontend: Trang UsersPage.jsx (src/pages/admin/UsersPage.jsx) hiển thị danh sách users và button Lock/Unlock.

Backend: File admin.js (backend/routes/admin.js) có 2 endpoints:
- PUT /users/:userId/lock (line 592-633)
- PUT /users/:userId/unlock (line 635-663)

Middleware: requireAdmin kiểm tra quyền admin."

**4. Hàm nào:**
"Frontend có hàm handleLockUser và handleUnlockUser, gọi API với method PUT.

Backend:
- router.put('/users/:userId/lock') nhận userId từ params, update status='locked' vào bảng users
- router.put('/users/:userId/unlock') update status='active'

SQL query: UPDATE users SET status = 'locked' WHERE user_id = @userId"

**5. Luồng hoạt động:**
"1. Admin vào UsersPage → hiển thị danh sách users
2. Click nút Lock → frontend gọi PUT /api/admin/users/:userId/lock
3. Backend kiểm tra middleware requireAdmin
4. Update status='locked' trong database
5. Return success
6. Frontend reload danh sách → user status đổi thành 'Locked'
7. User bị khóa không thể login (check ở auth.js)"

---

## 📝 CHECKLIST TRƯỚC KHI THUYẾT TRÌNH

- [ ] Đọc kỹ file này
- [ ] Chạy thử tất cả tính năng trong dự án
- [ ] Kiểm tra database structure (bảng nào liên quan)
- [ ] Trace code từ Frontend → Backend → Database
- [ ] Chuẩn bị demo live (nếu có)
- [ ] Ghi nhớ line numbers quan trọng
- [ ] Hiểu rõ middleware (authenticateToken, requireAdmin)
- [ ] Biết SQL queries cơ bản

---

## 🚀 MẸO THUYẾT TRÌNH HAY

1. **Dùng sơ đồ:** Vẽ flow User → Frontend → Backend → Database
2. **Show code:** Mở file và point đúng function
3. **Demo live:** Chạy thật để họ thấy flow
4. **Giải thích middleware:** Tại sao cần authenticateToken, requireAdmin
5. **Nói về security:** Validate input, prevent SQL injection, check permissions
6. **Metrics:** "Có X users, Y courses, Z revenue trong database"

---

**Chúc thuyết trình tốt! 🎉**
