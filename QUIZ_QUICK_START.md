# 🚀 Quiz Question Bank - Quick Start Guide

## ✨ What's New?

Quiz giờ đây sử dụng **Question Bank** thay vì phải tạo câu hỏi cho từng Quiz!

### Trước đây:
❌ Tạo Quiz → Nhập từng câu hỏi → Lưu → Lặp lại cho Quiz khác  
❌ Không thể tái sử dụng câu hỏi  
❌ Khó quản lý khi có nhiều Quiz

### Bây giờ:
✅ Tạo câu hỏi 1 lần trong Question Bank  
✅ Tạo Quiz chỉ cần config (số câu, thời gian, điểm đạt)  
✅ Mỗi lần làm Quiz → Random câu hỏi khác nhau  
✅ Dễ quản lý, cập nhật câu hỏi

---

## 📝 Hướng dẫn sử dụng (Instructor)

### Bước 1: Tạo Câu hỏi trong Question Bank

1. Vào **Quản lý khóa học**
2. Chọn 1 khóa học
3. Click nút **"Question Bank"** bên cạnh MOOC/Week
4. Click **"Tạo câu hỏi mới"**
5. Điền thông tin:
   - **Câu hỏi**: Nội dung câu hỏi
   - **Loại**: MCQ (Multiple Choice) hoặc True/False
   - **Độ khó**: Easy/Medium/Hard
   - **Điểm**: 10 điểm
   - **Đáp án**: Nhập các lựa chọn, đánh dấu đáp án đúng
6. Click **"Tạo câu hỏi"**

**Lặp lại** để tạo nhiều câu hỏi (ít nhất 5-10 câu cho 1 MOOC)

---

### Bước 2: Tạo Quiz Lesson

1. Trong **Quản lý khóa học**, click **"Thêm bài học"**
2. Điền form:
   - **Tên bài học**: "Quiz Week 1: Java Basics"
   - **MOOC**: Chọn Week (MOOC) tương ứng
   - **Loại nội dung**: Chọn **"Quiz (Bài kiểm tra)"** ← MỚI!

3. Form cấu hình Quiz sẽ xuất hiện (màu tím):

   ```
   ┌─────────────────────────────────────────────┐
   │ Cấu hình Quiz (sử dụng Question Bank)      │
   ├─────────────────────────────────────────────┤
   │ Số câu hỏi: [5]  (Random từ Question Bank) │
   │ Thời gian:  [10] phút                       │
   │ Điểm đạt:   [70] %                          │
   │                                             │
   │ 💡 Quiz sẽ random 5 câu hỏi từ Question    │
   │    Bank. Mỗi lần làm = bộ câu khác nhau.   │
   └─────────────────────────────────────────────┘
   ```

4. Nhập giá trị:
   - **Số câu hỏi**: 5 (sẽ random 5 câu từ Question Bank)
   - **Thời gian**: 10 phút
   - **Điểm đạt**: 70% (học viên cần >= 70% để pass)

5. Click **"Tạo mới"**

---

### Bước 3: Xong!

Quiz đã được tạo. Học viên giờ có thể:
- Mở Quiz
- Làm bài với 5 câu hỏi random
- Nộp bài và xem điểm
- Làm lại → Nhận câu hỏi khác

---

## 🎓 Hướng dẫn cho Học viên

### Làm Quiz

1. Vào trang học khóa học
2. Click vào bài **Quiz**
3. Màn hình loading → Hệ thống đang random câu hỏi
4. Quiz hiển thị với:
   - Đếm ngược thời gian (ví dụ: 10:00)
   - Progress bar (1/5, 2/5, ...)
   - Câu hỏi và các lựa chọn

5. Chọn đáp án cho từng câu
6. Click **"Câu tiếp theo"** hoặc **"Nộp bài"**

### Xem kết quả

- Điểm số hiển thị (ví dụ: 80%)
- Pass/Fail status
- Chi tiết từng câu:
  - ✅ Đúng: Đáp án của bạn
  - ❌ Sai: Đáp án của bạn + Đáp án đúng

### Làm lại

- Click **"Làm lại"** để thử lại
- Nhận bộ câu hỏi mới (random)

---

## 🔧 Technical Details (For Developers)

### Database Structure

```
questions (Question Bank)
├── question_id (PK)
├── mooc_id (FK)
├── stem (câu hỏi)
├── qtype (mcq, tf, essay)
├── difficulty (easy, medium, hard)
└── max_score

question_options
├── option_id (PK)
├── question_id (FK)
├── label (A, B, C, D)
├── content (nội dung đáp án)
└── is_correct (1 = đúng, 0 = sai)

lessons
├── lesson_id (PK)
├── mooc_id (FK)
├── title
├── content_type ('quiz')
└── content_url (JSON config)
```

### Quiz Config Format (New)

```json
{
  "type": "quiz_v2",
  "numQuestions": 5,
  "timeLimit": 10,
  "passingScore": 70,
  "description": "Kiểm tra kiến thức..."
}
```

### API Endpoint

```
GET /api/question-bank/mooc/:moocId/random?limit=5
Authorization: Bearer {token}

Returns: 5 random questions from Question Bank
```

---

## ❓ FAQ

### Q: Tôi có bao nhiêu câu hỏi trong Question Bank?
A: Click nút "Question Bank" để xem. Stats hiển thị:
- Tổng số câu hỏi
- MCQ count
- True/False count
- Essay count

### Q: Quiz cần ít nhất bao nhiêu câu hỏi?
A: Ít nhất = số câu hỏi bạn config. Ví dụ: Quiz config 5 câu → cần >= 5 câu trong Question Bank.

### Q: Nếu không đủ câu hỏi thì sao?
A: Quiz sẽ lấy hết số câu có sẵn (ví dụ: chỉ có 3 câu thì lấy 3, không phải 5).

### Q: Học viên làm 2 lần có cùng câu hỏi không?
A: Không! Mỗi lần làm = random lại từ Question Bank. Có thể trùng 1-2 câu nhưng thứ tự khác.

### Q: Quiz cũ (format cũ) vẫn hoạt động không?
A: Có! Backward compatible. Quiz cũ vẫn dùng câu hỏi JSON inline như trước.

### Q: Làm sao biết Quiz đang dùng Question Bank?
A: Kiểm tra database:
```sql
SELECT content_url FROM lessons WHERE lesson_id = ?
```
Nếu thấy `"type": "quiz_v2"` → Đang dùng Question Bank ✅

### Q: Tôi có thể sửa câu hỏi sau khi tạo Quiz không?
A: Có! Sửa trong Question Bank → Tất cả Quiz tự động cập nhật.

---

## ✅ Checklist

### Instructor
- [ ] Tạo ít nhất 5 câu hỏi trong Question Bank
- [ ] Tạo Quiz với config (số câu, thời gian, điểm đạt)
- [ ] Kiểm tra Quiz hiển thị trong danh sách bài học

### Learner
- [ ] Mở Quiz → Thấy loading
- [ ] Quiz hiển thị câu hỏi
- [ ] Timer đếm ngược
- [ ] Trả lời và nộp bài
- [ ] Xem kết quả
- [ ] Làm lại → Câu hỏi khác

### Developer
- [ ] Backend endpoint `/random` hoạt động
- [ ] Frontend fetch questions từ API
- [ ] Questions transform đúng format
- [ ] Old Quiz format vẫn work

---

## 🎉 Kết luận

Quiz giờ đây:
- ✅ **Dễ tạo hơn** - Chỉ cần config, không nhập câu hỏi
- ✅ **Tái sử dụng** - Câu hỏi dùng cho nhiều Quiz
- ✅ **Random** - Mỗi lần làm khác nhau
- ✅ **Dễ quản lý** - Sửa 1 lần, áp dụng toàn bộ

**Thử ngay**: Tạo Quiz mới với Question Bank! 🚀

---

**Tài liệu chi tiết**:
- QUIZ_QUESTION_BANK_UPGRADE.md - Technical documentation
- QUIZ_TESTING_GUIDE.md - Testing instructions

**Liên hệ**: GitHub Copilot
