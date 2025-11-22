# 🧪 Quiz Question Bank Integration - Testing Guide

## 📋 Pre-requisites

✅ Backend server running on http://localhost:5000  
✅ Frontend running on http://localhost:5174  
✅ Database has questions in Question Bank (IDs: 1082, 1083, 1084 exist)  
✅ Login as instructor (user has instructor role)

---

## 🎯 Test Scenario 1: Create New Quiz with Question Bank

### Step 1: Login as Instructor
1. Go to http://localhost:5174
2. Login with instructor credentials
3. Navigate to "Quản lý khóa học" (Course Management)

### Step 2: Create Quiz Lesson
1. Select a course
2. Click "Thêm bài học" (Add Lesson) button
3. Fill in form:
   - **Tên bài học**: "Quiz Week 1: Java Basics"
   - **MOOC**: Select "Week 1: ..." (any MOOC)
   - **Loại nội dung**: Select "Quiz (Bài kiểm tra)" ← **NEW**
4. Quiz config form should appear (purple background)

### Step 3: Configure Quiz
1. In Quiz config section:
   - **Số câu hỏi**: 5 (will random 5 questions from Question Bank)
   - **Thời gian**: 10 minutes
   - **Điểm đạt**: 70%
2. Optional: Add description
3. Click "Tạo mới" (Create)

### Step 4: Verify Creation
1. Toast success message appears
2. Quiz lesson appears in lesson list
3. Check database:
   ```sql
   SELECT lesson_id, title, content_type, content_url 
   FROM lessons 
   WHERE content_type = 'quiz' 
   ORDER BY lesson_id DESC
   ```
4. `content_url` should contain:
   ```json
   {
     "type": "quiz_v2",
     "numQuestions": 5,
     "timeLimit": 10,
     "passingScore": 70,
     "description": "..."
   }
   ```

**Expected Result**: ✅ Quiz lesson created with config (not questions)

---

## 🎯 Test Scenario 2: View Quiz as Learner

### Step 1: Enroll in Course
1. Logout from instructor account
2. Login as learner (e.g., learner123)
3. Enroll in the course with the Quiz

### Step 2: Navigate to Quiz Lesson
1. Open course learning page
2. Click on the Quiz lesson you just created
3. Quiz should load with:
   - Loading spinner ("Đang tải Quiz...")
   - "Đang chuẩn bị câu hỏi từ Question Bank"

### Step 3: Verify Questions Loaded
1. After loading, Quiz interface appears
2. Check browser console for log:
   ```
   🎯 Loading Quiz from Question Bank... {numQuestions: 5, ...}
   ✅ Loaded questions from Question Bank: {questions: [...]}
   ```
3. Questions should be displayed
4. Timer should show (e.g., "10:00")
5. Progress bar shows "1/5"

### Step 4: Answer Questions
1. Select answers for all 5 questions
2. Navigate through questions with "Câu tiếp theo" button
3. On last question, click "Nộp bài" (Submit)

### Step 5: Check Results
1. Results screen appears
2. Score calculated (e.g., "80%")
3. Pass/fail status shown
4. Detailed answers displayed with correct/wrong indicators

**Expected Result**: ✅ Quiz loads questions from Question Bank and works correctly

---

## 🎯 Test Scenario 3: Random Question Selection

### Step 1: Complete Quiz First Time
1. As learner, complete the Quiz
2. **Note the questions** shown (take screenshot or write them down)
3. Note question IDs in browser console

### Step 2: Retry Quiz
1. Click "Làm lại" (Retry) button
2. Quiz resets
3. **Check if questions are different**
4. Compare with previous attempt

### Step 3: Verify Randomization
1. Check browser console for new API call:
   ```
   GET /api/question-bank/mooc/{moocId}/random?limit=5
   ```
2. Response should have different questions OR same questions in different order
3. Each attempt should feel unique

**Expected Result**: ✅ Questions are randomized from Question Bank

---

## 🎯 Test Scenario 4: Edit Existing Quiz

### Step 1: Edit Quiz Lesson
1. Login as instructor
2. Go to Course Management
3. Find the Quiz lesson
4. Click edit icon (pencil)

### Step 2: Verify Config Loaded
1. Quiz config form appears
2. Check values match what you created:
   - Số câu hỏi: 5
   - Thời gian: 10
   - Điểm đạt: 70

### Step 3: Modify Config
1. Change "Số câu hỏi" to 3
2. Change "Thời gian" to 15
3. Click "Cập nhật" (Update)

### Step 4: Verify Changes
1. As learner, reload Quiz
2. Should now show:
   - Only 3 questions (not 5)
   - 15:00 timer (not 10:00)

**Expected Result**: ✅ Quiz config can be edited and changes apply

---

## 🎯 Test Scenario 5: No Questions Available

### Step 1: Test Empty Question Bank
1. Select a MOOC with **NO questions** in Question Bank
2. Create a Quiz for this MOOC
3. Save Quiz

### Step 2: View as Learner
1. Navigate to this Quiz
2. Should show error state:
   - "Quiz chưa có nội dung"
   - "Không thể tải câu hỏi. Vui lòng kiểm tra lại Question Bank."

**Expected Result**: ✅ Graceful error handling when no questions exist

---

## 🎯 Test Scenario 6: Backward Compatibility

### Step 1: Check Old Quiz Format
1. Find an existing Quiz with old format (inline questions)
2. Check its `content_url` in database:
   ```sql
   SELECT content_url FROM lessons 
   WHERE content_type = 'quiz' 
   AND content_url LIKE '%"questions":%'
   ```
3. Should have `"type": "quiz"` (not "quiz_v2")

### Step 2: View Old Quiz
1. As learner, open this old Quiz
2. Should still work correctly
3. Questions displayed from JSON (not API call)

**Expected Result**: ✅ Old Quiz format still works (backward compatible)

---

## 🧪 API Testing (Optional)

### Test Random Questions Endpoint

**Request:**
```http
GET http://localhost:5000/api/question-bank/mooc/52/random?limit=5
Authorization: Bearer {your_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "question_id": 1082,
      "mooc_id": 52,
      "stem": "What is React?",
      "qtype": "mcq",
      "difficulty": "easy",
      "max_score": 10,
      "options": [
        {
          "option_id": 4345,
          "label": "A",
          "content": "A JavaScript library",
          "is_correct": 1
        },
        {
          "option_id": 4346,
          "label": "B",
          "content": "A database",
          "is_correct": 0
        }
      ]
    }
  ]
}
```

**Test Cases:**
1. ✅ Returns exactly `limit` questions (or less if not enough available)
2. ✅ Only returns MCQ and True/False questions (not essay)
3. ✅ Questions are randomized (ORDER BY NEWID())
4. ✅ Each question has options with is_correct flag
5. ✅ Requires authentication (401 without token)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch questions from Question Bank"
**Cause**: No questions exist for this MOOC  
**Solution**: Create questions in Question Bank first

### Issue 2: Backend 404 error on /random endpoint
**Cause**: Backend not restarted after code changes  
**Solution**: Restart backend server (npm run dev)

### Issue 3: Quiz shows old inline questions
**Cause**: Quiz has old format in database  
**Solution**: Edit Quiz and save again to upgrade to quiz_v2

### Issue 4: Timer not working
**Cause**: timeLimit not set in config  
**Solution**: Edit Quiz, set timeLimit value

### Issue 5: All attempts show same questions
**Cause**: Random endpoint not being called  
**Solution**: Check browser console for API calls, verify quiz_v2 format

---

## ✅ Success Criteria

### Instructor Side
- [x] Can select "Quiz (Bài kiểm tra)" as content type
- [x] Quiz config form appears with 3 inputs
- [x] Can create Quiz with config (not questions)
- [x] Can edit Quiz and modify config
- [x] content_url stores quiz_v2 JSON

### Learner Side
- [x] Quiz loads with spinner
- [x] Questions fetch from Question Bank API
- [x] Questions display correctly
- [x] Timer works
- [x] Can answer and submit
- [x] Score calculated correctly
- [x] Can retry Quiz

### Randomization
- [x] Each attempt gets different questions
- [x] Questions selected randomly from Question Bank
- [x] API endpoint returns random order

### Data Integrity
- [x] Questions stored in Question Bank (not lesson)
- [x] Quiz config stored in content_url
- [x] Old Quiz format still works
- [x] No breaking changes

---

## 📊 Test Report Template

```
# Quiz Question Bank Integration Test Report

**Date**: ________
**Tester**: ________
**Environment**: Dev/Staging/Prod

## Test Results

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| Create Quiz with Question Bank | ✅/❌ | |
| View Quiz as Learner | ✅/❌ | |
| Random Question Selection | ✅/❌ | |
| Edit Quiz Config | ✅/❌ | |
| Empty Question Bank | ✅/❌ | |
| Backward Compatibility | ✅/❌ | |
| API Endpoint Test | ✅/❌ | |

## Issues Found
1. 
2. 
3. 

## Screenshots
- [Attach screenshots here]

## Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🚀 Next Actions After Testing

If all tests pass:
1. Mark feature as COMPLETE ✅
2. Document in CHANGELOG
3. Deploy to production
4. Notify instructors of new feature

If tests fail:
1. Log issues in bug tracker
2. Debug and fix
3. Re-test

---

**Created by**: GitHub Copilot  
**Last Updated**: 2025
