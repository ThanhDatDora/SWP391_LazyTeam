# 🧪 EXAM SYSTEM TESTING GUIDE

## ✅ PRE-TESTING CHECKLIST

- [x] Backend server running on http://localhost:3001
- [x] Frontend dev server running on http://localhost:5173
- [x] Database has 477 exam questions (courses 2-8)
- [x] Exam components integrated into CourseLearningPage
- [ ] Test user logged in
- [ ] Test user enrolled in course with MOOCs

---

## 🎯 TEST SCENARIO 1: COMPLETE EXAM FLOW (HAPPY PATH)

### Objective: Test full exam flow from start to finish with passing score

### Pre-conditions:
- User must be enrolled in a course (e.g., Course 2: React Development)
- Course must have MOOCs with lessons
- User has NOT completed all lessons yet

### Steps:

#### 1. Login & Navigate to Course
```
Action: Login with test credentials
Expected: Successfully logged in, redirected to dashboard
```

#### 2. Go to Learning Page
```
Action: Navigate to /learning/:courseId
Expected: See course content with MOOCs and lessons in sidebar
```

#### 3. Complete All Lessons in MOOC 1
```
Action: Click on each lesson, mark as complete
Expected: 
- Each lesson shows green checkmark when completed
- Progress bar increases
- ExamCard appears at bottom of MOOC 1 lessons
```

#### 4. Verify ExamCard Display (LOCKED STATE)
```
When: Not all lessons complete
Expected:
- ExamCard shows GRAY border-left
- Lock icon displayed
- Text: "Complete X/Y lessons to unlock"
- Button: "Take Exam" (DISABLED)
```

#### 5. Verify ExamCard Display (UNLOCKED STATE)
```
When: All lessons in MOOC 1 completed
Expected:
- ExamCard shows BLUE border-left
- FileCheck icon displayed
- Text: "10 questions • 20 minutes • 70% to pass"
- Shows "0 attempts" if first time
- Button: "Take Exam" (ENABLED)
```

#### 6. Click "Take Exam" → ExamIntro Modal Opens
```
Action: Click "Take Exam" button
Expected:
- Full-screen modal appears (fixed overlay)
- Shows MOOC name as title
- Shows 3 stat cards:
  * 10 Questions (HelpCircle icon)
  * 20 Minutes (Clock icon)
  * 70% Passing Score (Award icon)
- Shows exam rules (5 bullet points)
- Previous attempts section is HIDDEN (first attempt)
- Two buttons: "Cancel" (outline) + "Start Exam" (blue, enabled)
```

#### 7. Click "Start Exam" → ExamSession Starts
```
Action: Click "Start Exam" button in ExamIntro
Expected:
- Modal closes, loading state briefly
- ExamSession component appears (full screen)
- Header shows:
  * Exam title
  * Question counter: "1 / 10"
  * Timer: "20:00" (green color, >50%)
- First question displays:
  * Question number badge (blue)
  * Question text (stem)
  * Difficulty badge (Easy/Medium/Hard)
  * 4 option buttons (A/B/C/D with circle badges)
- Right sidebar shows:
  * "Questions" heading
  * Grid of 10 question buttons (5 cols on mobile, 4 on desktop)
  * Current question highlighted BLUE
  * Unanswered questions are GRAY
- Navigation: Only "Next" button enabled
```

#### 8. Answer Questions (Test Various Actions)
```
Action 1: Select an option for Question 1
Expected:
- Option button gets blue-500 border
- CheckCircle2 icon appears
- Question 1 button in grid turns GREEN

Action 2: Click "Next" button
Expected:
- Moves to Question 2
- Question 2 button in grid now BLUE (current)
- Question 1 button stays GREEN (answered)
- "Previous" button now enabled

Action 3: Click Question 5 in sidebar grid
Expected:
- Jump directly to Question 5
- Question counter shows "5 / 10"
- Grid updates: Q5 is blue (current)

Action 4: Wait for timer to change color
Expected:
- At 10:00 remaining (50%): Timer stays GREEN
- At 05:00 remaining (25%): Timer turns YELLOW
- At 02:00 remaining (<10%): Timer turns RED with pulse animation

Action 5: Answer more questions until Question 10
Expected:
- On Question 10, "Next" button changes to "Submit Exam" (blue)
```

#### 9. Submit Exam (With Confirmation)
```
Action: Click "Submit Exam" button on last question
Expected:
- Confirm modal appears
- Shows "You have answered X out of 10 questions"
- If X < 10: Yellow warning "You have N unanswered questions"
- Two buttons: "Review Answers" + "Yes, Submit Exam" (blue)

Action: Click "Yes, Submit Exam"
Expected:
- Loading state appears
- Modal closes
- API call to submit exam
- ExamResult component appears
```

#### 10. Verify ExamResult Display (PASSING SCORE ≥70%)
```
Assumption: User answered 8+ questions correctly (≥80%)
Expected:
- Large Trophy icon with bounce animation (green circle, 64px)
- Score display: "80" in text-6xl (green color)
- Status text: "Congratulations!" (green)
- Statistics grid shows:
  * Correct Answers: 8 (with CheckCircle2 icon)
  * Incorrect Answers: 2 (with XCircle icon)
  * Time Taken: e.g., "15m 30s" (with Clock icon)
- Achievement card (green gradient background):
  * "Achievement Unlocked! 🎉"
  * "You have passed this exam and unlocked MOOC 2!"
- Performance breakdown:
  * Progress bar filled to 80% (green)
  * "Passing threshold" badge at 70% mark (above)
- Action buttons:
  * "Review Answers" (outline, full width)
  * "Continue Learning" (green, full width)
- Encouragement message: "🎉 Great job! Keep up the excellent work!"
```

#### 11. Click "Review Answers" → ExamReview Opens
```
Action: Click "Review Answers" button
Expected:
- ExamReview component appears (full screen)
- Header shows:
  * "Exam Review" title with close X button
  * Score summary (80%)
  * Correct: 8 (green), Incorrect: 2 (red)
- Main content (left side):
  * Current question card (border-left green if correct, red if incorrect)
  * Large status badge at top: "Correct Answer" (green) or "Incorrect Answer" (red)
  * Question text
  * All 4 options displayed with color coding:
    - GREEN border + checkmark: Correct answer
    - RED border + X: User's wrong answer
    - GRAY: Other options
  * Labels: "Your answer", "Correct answer", or "Your answer (Correct!)"
  * Blue explanation card (if available)
- Right sidebar:
  * Score summary card (sticky)
  * Question grid (green/red colored, 5x cols mobile, 4x desktop)
  * Legend showing color meanings
- Navigation: Previous/Next buttons, "1 / 10" counter
```

#### 12. Navigate Through Review
```
Action: Click different questions in grid
Expected:
- Jump to selected question
- Card border color changes (green correct, red incorrect)
- Option styling updates correctly
- Explanation shows if available

Action: Click "Next" through all 10 questions
Expected:
- Can review all questions sequentially
- Correct/incorrect highlighting consistent
```

#### 13. Close Review & Verify Progress Update
```
Action: Click X button to close ExamReview
Expected:
- Returns to CourseLearningPage
- Sidebar now shows MOOC 2 (previously locked)
- MOOC 1 ExamCard shows:
  * Green border-left (PASSED)
  * CheckCircle icon
  * "You passed with 80%"
  * "1 attempt • Best: 80%"
  * Button: "Retake Exam" (outline variant)
```

---

## 🎯 TEST SCENARIO 2: FAILING EXAM FLOW

### Objective: Test exam failure and retake functionality

### Steps:

#### 1. Take MOOC 2 Exam (Answer Incorrectly)
```
Action: Complete all lessons in MOOC 2, take exam
Action: Intentionally answer ≤6 questions correctly (≤60%, below 70%)
Expected: Submit successfully
```

#### 2. Verify ExamResult Display (FAILING SCORE <70%)
```
Expected:
- Large XCircle icon (red circle, 64px, NO animation)
- Score display: e.g., "60" in text-6xl (RED color)
- Status text: "Not Passed" (red)
- Statistics grid shows correct/incorrect counts
- NO Achievement card (not passed)
- Performance breakdown:
  * Progress bar filled to 60% (RED)
  * "Passing threshold" badge at 70% mark (below)
- Action buttons:
  * "Review Answers" (outline, full width)
  * "Retake Exam" (outline, flex-1) ← NEW BUTTON
  * "Continue Learning" (default, flex-1)
- Encouragement message: "😔 Don't give up! Review the material and try again."
```

#### 3. Click "Retake Exam"
```
Action: Click "Retake Exam" button
Expected:
- ExamResult closes
- ExamIntro modal opens again
- Previous attempts section NOW VISIBLE:
  * "You have taken this exam 1 time"
  * Badge shows attempt count: "1"
  * Shows best score: "60%" (red destructive badge)
  * Shows last attempt date
- "Start Exam" button enabled
```

#### 4. Retake Exam (Pass This Time)
```
Action: Click "Start Exam", answer ≥8 correctly
Expected:
- Complete exam flow again
- Pass with ≥70%
- ExamCard updates to show:
  * "2 attempts • Best: 80%" (shows new best score)
  * "You passed with 80%"
  * Green passed state
```

---

## 🎯 TEST SCENARIO 3: TIMER AUTO-SUBMIT

### Objective: Verify automatic submission when timer expires

### Steps:

#### 1. Start Exam, Wait for Timer to Expire
```
Action: Start exam, answer 5 questions, wait 20 minutes
Expected:
- Timer counts down from 20:00 to 00:00
- Color changes: Green → Yellow → Red with pulse
- When timer reaches 00:00:
  * Auto-submit triggers immediately
  * No confirmation modal
  * Goes directly to ExamResult
  * Shows actual score based on answered questions (5/10)
```

#### 2. Verify Partial Submission
```
Expected:
- ExamResult shows:
  * Score based on 5 correct out of 10 total (50%)
  * Incorrect count includes 5 unanswered (treated as wrong)
  * Fail state (50% < 70%)
```

---

## 🎯 TEST SCENARIO 4: NAVIGATION & STATE MANAGEMENT

### Objective: Test question navigation and answer persistence

#### 1. Test Question Navigation
```
Action: Start exam, answer Q1, Q3, Q5 (skip Q2, Q4)
Expected:
- Grid shows: Q1, Q3, Q5 are GREEN
- Q2, Q4 are GRAY (unanswered)
- Current question is BLUE

Action: Click Q2 in grid
Expected:
- Jump to Q2
- No answer selected (all options default state)

Action: Select an option for Q2
Expected:
- Q2 button in grid turns GREEN
```

#### 2. Test Previous/Next Navigation
```
Action: Use Previous/Next buttons to navigate
Expected:
- Can move through questions sequentially
- Selected answers persist when returning to question
- Grid updates current question highlight
- Previous disabled on Q1, Next changes to Submit on Q10
```

---

## 🎯 TEST SCENARIO 5: EDGE CASES

### Objective: Test error handling and edge cases

#### 1. Click Cancel in ExamIntro
```
Action: Click "Cancel" button before starting
Expected:
- Modal closes
- Returns to CourseLearningPage
- No exam attempt created
- ExamCard still shows "Take Exam" button
```

#### 2. Close ExamIntro with X Button
```
Action: Click X button in top right
Expected:
- Same behavior as Cancel
- Modal closes, no attempt created
```

#### 3. Network Error Handling (Manual Test)
```
Action: Disconnect network, try to submit exam
Expected:
- Error toast appears
- Exam session remains open
- User can retry submission
```

#### 4. Multiple Tabs (If Time Permits)
```
Action: Open exam in two tabs simultaneously
Expected:
- Should handle gracefully (current implementation: both work independently)
- Note: May need duplicate submission prevention in future
```

---

## 📊 VERIFICATION CHECKLIST

After testing above scenarios, verify in DATABASE:

### Check `exam_attempts` table:
```sql
SELECT TOP 10 
    attempt_id,
    user_id,
    exam_id,
    score,
    correct_answers,
    total_questions,
    passed,
    started_at,
    submitted_at
FROM exam_attempts
ORDER BY started_at DESC;
```

Expected:
- Multiple attempts recorded
- Scores match what was shown in UI
- `passed` boolean correct (1 if ≥70%, 0 otherwise)
- Timestamps valid

### Check `enrollments` table:
```sql
SELECT 
    enrollment_id,
    user_id,
    course_id,
    current_mooc_id,
    moocs_completed,
    overall_score,
    is_completed
FROM enrollments
WHERE user_id = [YOUR_TEST_USER_ID];
```

Expected:
- `current_mooc_id` updated to next MOOC after pass
- `moocs_completed` incremented when exam passed
- `overall_score` updated (average of all exams?)

---

## 🐛 KNOWN ISSUES TO WATCH FOR

### Potential Bugs:
1. ❌ **MOOC data missing exam fields**: `exam_attempts`, `exam_best_score`, `exam_passed` may be undefined
   - **Fix**: Update `getCourseContent` API to join with exam_attempts
   
2. ❌ **ExamCard props mismatch**: Frontend expects certain fields, backend may not provide
   - **Symptom**: ExamCard shows undefined or crashes
   
3. ❌ **Timer precision**: Timer may drift or not sync perfectly
   - **Acceptable**: 1-2 second drift is okay
   
4. ❌ **Question order**: Questions may not be properly randomized
   - **Check**: Same questions appear in different order on retake
   
5. ❌ **Answer submission format**: Backend expects `[{question_id, selected_option}]`
   - **Verify**: Console logs show correct format

### Console Logs to Monitor:
```
🎓 Starting exam for MOOC: [mooc_id]
📋 Exam info response: [response]
🚀 Starting exam session for exam_id: [exam_id]
📝 Start exam response: [response]
📤 Submitting exam: {exam_id, attempt_id, answers_count}
✅ Submit response: [response]
```

---

## ✅ SUCCESS CRITERIA

Test is SUCCESSFUL if:
- ✅ User can complete full exam flow without crashes
- ✅ Timer works correctly and auto-submits
- ✅ Pass/fail states display correctly
- ✅ Review shows correct answers accurately
- ✅ Retake functionality works
- ✅ Progress updates after exam pass
- ✅ Next MOOC unlocks after exam pass
- ✅ Database records all attempts correctly
- ✅ No console errors (warnings are okay)

---

## 📝 TESTING NOTES

### Date: [TODAY'S DATE]
### Tester: [YOUR NAME]

#### Test Results:
- [ ] Scenario 1: Complete Flow (Pass) - Status: ___
- [ ] Scenario 2: Fail & Retake - Status: ___
- [ ] Scenario 3: Timer Auto-Submit - Status: ___
- [ ] Scenario 4: Navigation - Status: ___
- [ ] Scenario 5: Edge Cases - Status: ___

#### Bugs Found:
1. 
2. 
3. 

#### Notes:

