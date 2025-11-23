# 📝 ASSIGNMENT SUBMISSION SYSTEM - TESTING GUIDE

## 🎯 Mục đích
Hệ thống nộp bài tập cho phép:
- **Học viên**: Nộp bài assignment (text + file)
- **Giảng viên**: Chấm điểm và feedback

---

## 🛠️ SETUP - Chuẩn bị

### 1. Tạo Database Table
```powershell
# Run SQL script to create essay_submissions table
sqlcmd -S localhost -d MiniCoursera_Primary -i backend\sql\create-essay-submissions.sql
```

### 2. Tạo Upload Folder
Folder đã được tạo sẵn tại: `backend/uploads/assignments/`

### 3. Khởi động Server
```powershell
# Backend
cd backend
npm run dev

# Frontend
cd ..
npm run dev
```

---

## 📋 TESTING FLOW

### PHASE 1: Student nộp bài (Learner)

#### Bước 1: Login as Student
- Email: `learner@test.com` hoặc học viên đã enroll khóa học
- Password: `password123`

#### Bước 2: Vào khóa học có assignment
1. Navigate to: "My Courses" hoặc trang chủ
2. Click vào khóa học (ví dụ: Photography, Web Development)
3. Trong danh sách lessons, tìm lesson có `content_type = 'assignment'`

#### Bước 3: Xem assignment
- Click vào assignment lesson
- Kiểm tra hiển thị:
  - ✅ Mô tả bài tập
  - ✅ Hướng dẫn chi tiết
  - ✅ Điểm tối đa
  - ✅ Hạn nộp (nếu có)

#### Bước 4: Nộp bài
1. Nhập nội dung bài làm vào textarea
2. (Optional) Upload file đính kèm:
   - Hỗ trợ: PDF, Word, ZIP, RAR, JPG, PNG
   - Max size: 10MB
3. Click "Nộp bài"

#### Expected Results:
```
✅ Toast: "Nộp bài thành công!"
✅ Hiển thị màn hình "Nộp bài thành công"
✅ Lesson được mark complete
✅ Database: Tạo record trong essay_submissions với status='pending'
```

#### Database Verification:
```sql
SELECT TOP 10 
    es.essay_submission_id,
    es.task_id,
    u.full_name,
    l.title as lesson_title,
    es.content_text,
    es.file_url,
    es.status,
    es.submitted_at
FROM essay_submissions es
JOIN users u ON es.user_id = u.user_id
JOIN lessons l ON es.task_id = l.lesson_id
ORDER BY es.submitted_at DESC;
```

---

### PHASE 2: Instructor chấm điểm

#### Bước 1: Login as Instructor
- Email: `instructor@test.com`
- Password: `password123`
- Navigate to: `/instructor`

#### Bước 2: Vào Course Management
1. Click vào khóa học cần chấm bài
2. URL: `/instructor/courses/{courseId}`

#### Bước 3: Tab "Assignments"
- Click vào tab "Assignments"
- Kiểm tra hiển thị:
  - ✅ Badge: "X chưa chấm" / "Y đã chấm"
  - ✅ Bảng danh sách bài nộp:
    - Tên học viên
    - Email
    - Bài tập (lesson title)
    - Trạng thái (pending/graded)
    - Điểm (nếu đã chấm)
    - Thời gian nộp
    - Button "Chấm điểm"

#### Bước 4: Chấm điểm
1. Click button "Chấm điểm" trên bài chưa chấm
2. Navigate to: `/instructor/courses/{courseId}/assignments/grade?lessonId={lessonId}`

#### Bước 5: Grading Page
**Left Panel: Danh sách bài nộp**
- ✅ Hiển thị tất cả submissions
- ✅ Highlight bài đang xem
- ✅ Badge: pending (vàng) / graded (xanh)
- ✅ Hiển thị số điểm (nếu đã chấm)

**Right Panel: Chi tiết bài nộp**
- ✅ Thông tin học viên (tên, email, thời gian nộp)
- ✅ Nội dung bài làm (text)
- ✅ File đính kèm (nếu có) với button "Tải xuống"
- ✅ Form chấm điểm:
  - Input điểm (0-100)
  - Textarea feedback
  - Button "Lưu điểm"

#### Bước 6: Nhập điểm và feedback
1. Nhập điểm: `85`
2. Nhập feedback: `Bài làm tốt! Cần cải thiện phần X, Y, Z...`
3. Click "Lưu điểm"

#### Expected Results:
```
✅ Toast: "Chấm điểm thành công!"
✅ Status badge chuyển từ "pending" → "graded"
✅ Hiển thị "Bài này đã được chấm điểm"
✅ Auto-select bài pending tiếp theo (nếu có)
✅ Database: Update status='graded', score=85, feedback=..., graded_at=now
```

#### Database Verification:
```sql
SELECT 
    es.essay_submission_id,
    u.full_name as student,
    l.title as assignment,
    es.score,
    es.feedback,
    es.status,
    es.submitted_at,
    es.graded_at,
    instructor.full_name as graded_by
FROM essay_submissions es
JOIN users u ON es.user_id = u.user_id
JOIN lessons l ON es.task_id = l.lesson_id
LEFT JOIN users instructor ON es.graded_by = instructor.user_id
WHERE es.status = 'graded'
ORDER BY es.graded_at DESC;
```

---

### PHASE 3: Student xem điểm (TODO - Chưa implement)

#### Planned Feature:
- Student quay lại assignment lesson
- Hiển thị:
  - ✅ "Đã nộp bài"
  - ✅ Điểm: X/100
  - ✅ Nhận xét từ giảng viên
  - ✅ Button "Nộp lại" (nếu cho phép)

---

## 🧪 TEST CASES

### TC1: Nộp bài chỉ có text (không upload file)
- Input: Content text only
- Expected: Save successful, file_url = NULL

### TC2: Nộp bài chỉ có file (không nhập text)
- Input: File only
- Expected: Save successful, content_text = NULL

### TC3: Nộp bài có cả text và file
- Input: Both text and file
- Expected: Save both fields

### TC4: Nộp lại bài (update submission)
- Action: Submit twice for same lesson
- Expected: Update existing record, not create new

### TC5: Upload file sai format
- Input: .exe, .bat, .sh file
- Expected: Error "Only PDF, Word, ZIP, RAR, JPG, PNG allowed"

### TC6: Upload file quá lớn
- Input: File > 10MB
- Expected: Error "File too large"

### TC7: Chấm điểm ngoài range
- Input: score = 150
- Expected: Error "Điểm phải từ 0 đến 100"

### TC8: Chấm điểm không có feedback
- Input: Score without feedback
- Expected: Error "Vui lòng nhập nhận xét"

### TC9: Multiple submissions per lesson
- Setup: 5 students submit same assignment
- Expected: Instructor sees all 5 in grading page

### TC10: Navigate between pending submissions
- Setup: 3 pending submissions
- Action: Grade first, auto-select next
- Expected: Smooth navigation to next pending

---

## 🔍 DEBUG CHECKLIST

### Backend Logs:
```
📝 Submitting assignment: { lesson_id, userId, has_text, has_file }
✅ Created new submission: {id}
✅ Updated existing submission: {id}
✅ Graded submission: {id}
```

### Frontend Console:
```
✅ Nộp bài thành công!
❌ Assignment submission error: {error}
✅ Chấm điểm thành công!
❌ Error loading submissions: {error}
```

### Network Tab:
- POST `/api/assignments/submit` → 200 OK
- GET `/api/assignments/lesson/{id}/submissions` → 200 OK
- POST `/api/assignments/grade` → 200 OK
- GET `/api/assignments/lesson-info/{id}` → 200 OK

---

## 📊 DATABASE SCHEMA

### Table: essay_submissions
```sql
CREATE TABLE essay_submissions (
    essay_submission_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    task_id BIGINT NOT NULL,           -- lesson_id
    user_id BIGINT NOT NULL,            -- student
    content_text NVARCHAR(MAX) NULL,
    file_url NVARCHAR(500) NULL,
    score DECIMAL(5, 2) NULL,           -- 0-100
    feedback NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NOT NULL,       -- 'pending', 'graded'
    submitted_at DATETIME NOT NULL,
    graded_at DATETIME NULL,
    graded_by BIGINT NULL               -- instructor user_id
);
```

### Sample Data:
```sql
-- Insert test submission
INSERT INTO essay_submissions 
    (task_id, user_id, content_text, status, submitted_at)
VALUES 
    (123, 456, 'This is my assignment submission...', 'pending', GETDATE());

-- Update with grade
UPDATE essay_submissions
SET score = 85.5,
    feedback = 'Great work! Keep it up.',
    status = 'graded',
    graded_at = GETDATE(),
    graded_by = 789
WHERE essay_submission_id = 1;
```

---

## ✅ SUCCESS CRITERIA

### Student Flow:
- [x] Can view assignment details
- [x] Can submit text content
- [x] Can upload file
- [x] Receives success confirmation
- [x] Lesson marked complete
- [ ] Can view grade and feedback (TODO)

### Instructor Flow:
- [x] Can view all submissions in course
- [x] Can filter by status (pending/graded)
- [x] Can navigate to grading page
- [x] Can view submission details
- [x] Can download attached file
- [x] Can enter score and feedback
- [x] Can save grade
- [x] Can move to next submission

### System:
- [x] No duplicate submissions (UPDATE not INSERT)
- [x] File size limit enforced
- [x] File type validation
- [x] Score range validation (0-100)
- [x] Feedback required for grading
- [x] Status tracking (pending → graded)
- [x] Timestamp tracking (submitted_at, graded_at)

---

## 🚀 DEPLOYMENT CHECKLIST

Before production:
- [ ] Run SQL script to create table
- [ ] Create uploads/assignments folder
- [ ] Set folder permissions (write access)
- [ ] Configure file size limit in nginx/apache
- [ ] Test file upload/download
- [ ] Test with multiple concurrent users
- [ ] Add email notification (optional)
- [ ] Add deadline enforcement (optional)
- [ ] Add late submission penalty (optional)
- [ ] Implement student view of grades

---

## 📞 SUPPORT

### Common Issues:

**"Failed to submit assignment"**
- Check: Database connection
- Check: essay_submissions table exists
- Check: uploads/assignments folder exists with write permission

**"File upload failed"**
- Check: Multer configuration in assignments.js
- Check: File size < 10MB
- Check: File type in allowed list
- Check: Folder permissions

**"No submissions showing for instructor"**
- Check: User has instructor role (role_id = 2)
- Check: Course belongs to instructor
- Check: Lesson content_type = 'assignment'

**"Cannot navigate to grading page"**
- Check: Route registered in AppRouter.jsx
- Check: lessonId in query params
- Check: AssignmentGradingPage imported

---

## 🎉 DONE!

Assignment submission system is now complete and ready for testing! 🚀
