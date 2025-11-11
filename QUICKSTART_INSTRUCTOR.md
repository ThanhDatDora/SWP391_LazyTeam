# 🚀 Quick Start - Instructor Features

## Đăng nhập và Test ngay (5 phút)

### Bước 1: Đăng nhập Instructor
```
1. Mở trình duyệt: http://localhost:5173/auth
2. Email: instructor@example.com
3. Password: [mật khẩu của bạn]
4. Click Login
```

### Bước 2: Vào Course Management
```
1. Click vào bất kỳ course card nào
2. Hoặc trực tiếp: http://localhost:5173/instructor/courses/3
   (Course 3 = Python for Data Science)
```

### Bước 3: Chấm Assignment (NGAY BÂY GIỜ!)
```
Hiện tại có 1 bài nộp đang chờ chấm:
- Student: Hoc Vien Demo (learner2@example.com)
- Course: Java Servlet & React Web Dev
- Assignment: Giới thiệu Servlet & Tomcat
- Status: submitted (chưa chấm)

Cách chấm:
1. Vào tab "Assignments" trong course management
2. Click nút "Chấm điểm"
3. Nhập điểm: 85 (hoặc bất kỳ số 0-100)
4. Nhập feedback: "Bài làm tốt! Tiếp tục phát huy."
5. Click "Chấm điểm"
6. ✅ Done! Xem status đổi sang "Đã chấm"
```

## Tạo MOOC và Lesson mới

### Tạo MOOC
```
1. Click "Thêm MOOC mới"
2. Điền:
   - Tên: Week 10: Advanced Topics
   - Mô tả: Deep dive into advanced concepts
   - Thứ tự: 10
3. Click "Tạo mới"
```

### Tạo Lesson
```
1. Click "Thêm bài học" trên MOOC
2. Điền:
   - Chọn MOOC: Week 10
   - Tên: Advanced React Patterns
   - Loại: Video / Assignment / Reading
   - URL: https://youtube.com/embed/xxx (nếu video)
   - Mô tả: Learn advanced React patterns
   - Thời lượng: 45 phút
3. Click "Tạo mới"
```

## Xem Submissions

### Xem tất cả bài nộp
```
Tab "Assignments" → Danh sách submissions
- Pending: màu vàng (⏳)
- Graded: màu xanh (✓)
```

### Tải file nộp của student
```
Click vào submission → Click "Download File"
```

## Features Chính

✅ **Quản lý Course Content**
- Thêm/sửa/xóa MOOC
- Thêm/sửa/xóa Lesson
- Sắp xếp thứ tự

✅ **Chấm Điểm Assignment**
- Xem danh sách bài nộp
- Chấm điểm 0-100
- Viết feedback
- Tải file của student

✅ **Theo dõi Students**
- Xem danh sách đăng ký
- Số bài hoàn thành
- Tiến độ học tập

✅ **Analytics**
- Số học viên
- Số bài nộp
- Điểm trung bình

## Kiểm tra Database

Xem data trong SQL Server:
```sql
-- Bài nộp pending
SELECT * FROM essay_submissions WHERE status = 'pending';

-- Bài nộp đã chấm
SELECT * FROM essay_submissions WHERE status = 'graded';

-- MOOCs trong course
SELECT * FROM moocs WHERE course_id = 3;

-- Lessons trong MOOC
SELECT * FROM lessons WHERE mooc_id = 1;
```

## Lỗi thường gặp

❌ **"Insufficient permissions"**
→ Kiểm tra role trong DB:
```sql
SELECT u.email, r.role_name 
FROM users u 
JOIN roles r ON u.role_id = r.role_id;
```

❌ **"Cannot find submissions"**
→ Kiểm tra có assignment lessons không:
```sql
SELECT * FROM lessons WHERE content_type = 'assignment';
```

❌ **File upload fail**
→ Tạo folder:
```powershell
New-Item -ItemType Directory -Force -Path "backend\uploads\assignments"
```

## Next Steps

📚 **Đọc docs chi tiết**: `INSTRUCTOR_SYSTEM_COMPLETE.md`
🧪 **Testing guide**: `ASSIGNMENT_GRADING_TESTING.md`
🔍 **Verify system**: 
```powershell
cd backend
node verify-assignment-system.mjs
```

---

🎉 **Chúc mừng!** Bạn đã có hệ thống instructor hoàn chỉnh!
