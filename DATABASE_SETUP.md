# Mini Coursera - Kết nối SQL Server Database

## 🎯 Hướng dẫn thiết lập SQL Server Database

### 1. **Cài đặt SQL Server**

Nếu chưa có SQL Server, hãy cài đặt:
- **SQL Server Express** (miễn phí): https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- **SQL Server Management Studio (SSMS)**: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

### 2. **Tạo Database**

1. Mở **SQL Server Management Studio**
2. Kết nối đến SQL Server instance
3. Chạy lệnh sau để tạo database:

```sql
CREATE DATABASE MiniCourseraDB;
GO
```

### 3. **Thực thi Database Schema**

1. Mở file `backend/database/schema.sql`
2. Copy toàn bộ nội dung 
3. Paste vào SSMS và chạy script
4. Kiểm tra các bảng đã được tạo:
   - Users
   - Categories  
   - Courses
   - CourseLessons
   - Enrollments
   - Exams
   - ExamQuestions
   - ExamSubmissions

### 4. **Cấu hình kết nối Database**

1. Copy file `.env.example` thành `.env` trong thư mục `backend`:
```bash
cd backend
copy .env.example .env
```

2. Cập nhật thông tin kết nối trong file `backend/.env`:
```env
# SQL Server Database Configuration
DB_SERVER=localhost                 # Hoặc tên server SQL của bạn
DB_NAME=MiniCourseraDB
DB_USER=sa                          # Hoặc username SQL Server của bạn
DB_PASSWORD=your_password_here      # Mật khẩu SQL Server của bạn

# JWT Secret (thay đổi thành chuỗi bảo mật)
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. **Khởi động ứng dụng**

#### Cách 1: Chạy đồng thời Frontend + Backend
```bash
npm run dev:full
```

#### Cách 2: Chạy riêng từng phần

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. **Kiểm tra kết nối**

1. **Backend API**: http://localhost:5000/api/health
2. **Frontend**: http://localhost:5173

Nếu thấy backend hiển thị:
```json
{
  "message": "Mini Coursera Backend is running!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

Và không có lỗi database connection trong console → **Thành công!** ✅

### 7. **Test Authentication**

1. Truy cập: http://localhost:5173
2. Click "Đăng ký" để tạo tài khoản mới
3. Đăng nhập với tài khoản vừa tạo
4. Kiểm tra dữ liệu trong SQL Server:

```sql
USE MiniCourseraDB;
SELECT * FROM Users;
SELECT * FROM Categories;
```

## 🔧 Cấu trúc Project

```
mini-coursera-ui-tailwind/
├── backend/                    # Node.js + Express API
│   ├── config/database.js     # Cấu hình SQL Server
│   ├── routes/                # API endpoints
│   ├── middleware/            # Authentication middleware  
│   ├── database/schema.sql    # Database schema
│   └── .env                   # Environment variables
├── src/
│   ├── services/api.js        # Real API service
│   ├── contexts/AuthContext   # Updated để dùng real API
│   └── ...
└── ...
```

## 🛠️ Troubleshooting

### Lỗi kết nối SQL Server:
```
ConnectionError: Failed to connect to localhost:1433
```

**Giải pháp:**
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra SQL Server Browser service
3. Enable TCP/IP protocol trong SQL Server Configuration Manager
4. Kiểm tra firewall cho port 1433

### Lỗi Authentication:
```
Login failed for user 'sa'
```

**Giải pháp:**
1. Kiểm tra username/password trong `.env`
2. Enable SQL Server Authentication (Mixed Mode)
3. Reset password cho user 'sa'

### Lỗi CORS:
```
Access to fetch blocked by CORS policy
```

**Giải pháp:**
- Đảm bảo `FRONTEND_URL=http://localhost:5173` trong backend `.env`
- Restart backend server

## 📚 API Endpoints

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user
- `GET /api/courses` - Lấy danh sách khóa học
- `POST /api/courses` - Tạo khóa học mới (Instructor)
- `POST /api/courses/:id/enroll` - Đăng ký khóa học

## 🚀 Production Deployment

Khi deploy production, cần:
1. Sử dụng SQL Server database thật (Azure SQL, AWS RDS, etc.)
2. Cập nhật connection string trong production environment
3. Thiết lập SSL/TLS cho database connection
4. Sử dụng environment variables an toàn

---

**Chúc bạn thành công! 🎉**

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong browser (F12)
2. Backend terminal logs
3. SQL Server connection status