# 🚀 QUICK START - EXAM SYSTEM TESTING

## ✅ SYSTEM STATUS: READY FOR TESTING!

### Current Status:
- ✅ Backend: Running on http://localhost:3001
- ✅ Frontend: Running on http://localhost:5173  
- ✅ Database: Connected & Ready
- ✅ Exam Questions: 415 total (50 in exam_items)
- ✅ Testable MOOCs: 5 ready

---

## 🎯 QUICK TEST (5-10 minutes)

### 1. Open Browser
- URL: http://localhost:5173
- Should already be open in Simple Browser

### 2. Login
- Email: `test-learner@exam.com`
- Password: [Use the password from your system]

### 3. Navigate to Course
- Go to: **Course 3: Python for Data Science**
- Or any of these testable courses:
  * Course 3: Python for Data Science (MOOC 4, 7 lessons)
  * Course 4: Flutter Mobile App Development (MOOC 9, 4 lessons) ← FASTEST
  * Course 5: Machine Learning Fundamentals (MOOC 15, 5 lessons)
  * Course 6: Digital Marketing Mastery (MOOC 20, 5 lessons)
  * Course 8: JavaScript ES6+ (MOOC 31, 7 lessons)

### 4. Go to Learning Page
- Click "Continue Learning" or "Start Learning"
- You should see the course content sidebar

### 5. Complete Lessons
- Click through each lesson in MOOC 1 (first MOOC)
- Mark each as complete
- **IMPORTANT**: Complete ALL lessons in the MOOC

### 6. Take Exam
- After completing all lessons, scroll down in sidebar
- You should see **ExamCard** appear below lessons
- Check that it shows:
  * ✅ Blue border (unlocked)
  * ✅ "Take Exam" button (enabled)
  * ✅ "10 questions • 45 minutes • 70% to pass"
- Click **"Take Exam"**

### 7. ExamIntro Modal
- Full-screen modal should appear
- Check displays:
  * ✅ MOOC name
  * ✅ 3 stat cards (Questions/Time/Passing Score)
  * ✅ Exam rules list
  * ✅ "Start Exam" button (blue, enabled)
- Click **"Start Exam"**

### 8. ExamSession - Answer Questions
- Timer should start counting down from 45:00
- Answer at least 8 questions correctly (for 80% pass)
- Test navigation:
  * ✅ Click question numbers in sidebar grid
  * ✅ Use Previous/Next buttons
  * ✅ See selected answers highlighted
- Click **"Submit Exam"** on last question

### 9. Confirm Submit
- Confirmation modal appears
- Shows answered count
- Click **"Yes, Submit Exam"**

### 10. ExamResult (PASS)
- Should show:
  * ✅ Trophy icon with bounce animation
  * ✅ Score in large text (e.g., "80")
  * ✅ Green "Congratulations!" message
  * ✅ Achievement card: "You have unlocked MOOC 2!"
  * ✅ Correct/Incorrect counts
  * ✅ "Review Answers" and "Continue Learning" buttons

### 11. Review Answers (Optional)
- Click "Review Answers"
- Check:
  * ✅ Question-by-question navigation
  * ✅ Correct answers in GREEN
  * ✅ Incorrect in RED (if any)
  * ✅ Explanation cards (if available)
- Close review

### 12. Verify Progress
- Return to learning page
- Check sidebar:
  * ✅ MOOC 1 ExamCard shows "You passed with 80%"
  * ✅ MOOC 2 is now visible (unlocked)
  * ✅ Progress bar updated

---

## 🐛 COMMON ISSUES TO WATCH FOR

### Issue 1: ExamCard Not Showing
**Symptom**: No ExamCard appears after completing lessons
**Check**: 
- Console for errors
- Verify all lessons marked complete
- Check MOOC data in sidebar

### Issue 2: "Take Exam" Button Disabled
**Symptom**: Button is grayed out even after completing lessons
**Cause**: `canTakeExam` prop may be false
**Fix**: Check lesson completion logic

### Issue 3: Exam Doesn't Start
**Symptom**: Click "Start Exam" but nothing happens
**Check**:
- Network tab for API call to `/learning/exams/{exam_id}/start`
- Console for errors
- Backend logs

### Issue 4: Questions Don't Display
**Symptom**: ExamSession shows but no questions
**Cause**: Questions array empty or undefined
**Check**: Start exam API response format

### Issue 5: Timer Not Working
**Symptom**: Timer stays at 45:00 or doesn't count down
**Check**: Console for useEffect errors, timer state updates

### Issue 6: Submit Fails
**Symptom**: Click submit but nothing happens or error
**Check**:
- Answers format: should be `[{question_id, selected_option}]`
- Backend logs for validation errors
- Network tab for 400/500 errors

### Issue 7: Progress Not Updated
**Symptom**: Pass exam but MOOC 2 doesn't unlock
**Check**:
- Database: `enrollments` table `current_mooc_id`
- Submit API response
- `loadCourseContent()` called after submit

---

## 📊 DATABASE VERIFICATION

After completing test, check database:

```sql
-- Check exam attempt
SELECT TOP 1 * 
FROM exam_attempts 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'test-learner@exam.com')
ORDER BY started_at DESC;

-- Check enrollment progress
SELECT current_mooc_id, moocs_completed, overall_score
FROM enrollments
WHERE user_id = (SELECT user_id FROM users WHERE email = 'test-learner@exam.com')
AND course_id = 3; -- Python course
```

Expected:
- ✅ exam_attempts: 1 row, score 80%, passed = 1
- ✅ enrollments: current_mooc_id = 5 (next MOOC), moocs_completed = 1

---

## ✅ SUCCESS CRITERIA

Test PASSES if:
1. ✅ All exam components render without crashes
2. ✅ Timer counts down correctly
3. ✅ Questions display with options
4. ✅ Answer selection works
5. ✅ Submit creates exam attempt in database
6. ✅ Result shows correct score
7. ✅ Review displays all questions correctly
8. ✅ Progress updates (MOOC unlocks)
9. ✅ No console errors (warnings OK)
10. ✅ Database records match UI display

---

## 📝 REPORT BUGS

If you find bugs, note:
1. **What you did** (steps to reproduce)
2. **What you expected** (correct behavior)
3. **What happened** (actual behavior)
4. **Console errors** (screenshot or copy)
5. **Network requests** (check DevTools Network tab)

Then we'll fix them one by one! 🔧

---

## 🎉 AFTER TESTING

Once basic flow works:
1. ✅ Test fail scenario (answer <7 questions correctly)
2. ✅ Test retake functionality
3. ✅ Test timer auto-submit (wait 45 min or modify duration)
4. ✅ Test cancel/close flows
5. ✅ Then move to UI polish & edge cases

---

**Ready? Let's test!** 🚀

Open http://localhost:5173 and follow the steps above!
