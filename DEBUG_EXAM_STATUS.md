# 🐛 Debug Exam Status Issue

## Vấn đề hiện tại:
1. ❌ Lỗi khi quay lại khóa học sau khi pass exam
2. ❌ ExamCard không hiển thị "Passed ✅" mặc dù đã pass

## Debug Steps:

### 1. Kiểm tra Console Logs
Sau khi click "Quay lại khóa học", mở Console (F12) và tìm:

✅ **Logs mong đợi:**
```
🔄 Exam completed, reloading attempts...
📡 API Request: /learning/exams/mooc/52
✅ Exam attempts reloaded successfully
```

❌ **Lỗi có thể gặp:**
```
Cannot read properties of undefined (reading 'success')
Cannot read properties of undefined (reading 'error')
```

### 2. Kiểm tra Network Tab
1. Mở DevTools → Network tab
2. Click "Quay lại khóa học"
3. Tìm request: `/learning/exams/mooc/52`
4. Click vào request → Preview tab

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "exam_id": 52,
    "attempts": [
      {
        "attempt_id": 123,
        "score_percentage": 100,
        "passed": true
      }
    ],
    "passing_score": 70
  }
}
```

### 3. Kiểm tra examAttempts State
Mở React DevTools:
1. Tìm component `CourseLearningPage`
2. Xem state `examAttempts`
3. Kiểm tra `examAttempts[52]`:
   ```javascript
   {
     hasAttempts: true,
     attemptCount: 1,
     bestScore: 100,
     passed: true,
     passingScore: 70
   }
   ```

### 4. Kiểm tra ExamCard Props
React DevTools → Tìm component `ExamCard` → Props:
```javascript
{
  passed: true,          // Phải là true
  bestScore: 100,        // Phải là điểm pass
  previousAttempts: 1,   // Số lần thi
  passingScore: 70
}
```

## Các fix đã áp dụng:

✅ Thêm null check: `if (response && response.success && response.data)`
✅ Thêm toast null check: `if (toast)`
✅ Clear cache sau submit exam
✅ Navigate với examCompleted state
✅ Auto-reload exam attempts

## Nếu vẫn lỗi:

### Cách 1: Hard reset cache
```javascript
// Paste vào Console browser:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Cách 2: Check API response trực tiếp
```javascript
// Paste vào Console browser:
fetch('http://localhost:3001/api/learning/exams/mooc/52', {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
  }
})
.then(r => r.json())
.then(data => console.log('📋 Exam data:', data));
```

### Cách 3: Force reload attempts
```javascript
// Paste vào Console browser (khi đang ở trang khóa học):
window.location.reload();
```

## Expected Behavior:

1. ✅ Submit exam → Score 100%
2. ✅ Click "Quay lại khóa học"
3. ✅ Console: "🔄 Exam completed, reloading attempts..."
4. ✅ API call: GET /learning/exams/mooc/52
5. ✅ examAttempts state updated
6. ✅ ExamCard re-renders
7. ✅ Display: "Passed ✅" with green badge
8. ✅ Toast: "🎉 Chúc mừng! Bạn đã vượt qua bài thi!"

Nếu bất kỳ bước nào fail → Gửi console log + network response cho tôi!
