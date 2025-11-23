# TEST CASES - EXAM SYSTEM
## Decision Table Testing & Use Case Testing
### Mini Coursera Platform | November 2025

---

## 📋 TABLE OF CONTENTS
1. [Decision Table Test Cases](#1-decision-table-test-cases)
2. [Use Case Test Cases](#2-use-case-test-cases)
3. [Boundary Value Test Cases](#3-boundary-value-test-cases)
4. [Test Execution Guide](#4-test-execution-guide)

---

## 1. DECISION TABLE TEST CASES

### 1.1 DT-TC-001: Exam Eligibility Logic

**Purpose**: Verify exam eligibility based on multiple conditions  
**Technique**: Decision Table Testing  
**Test Object**: `ExamCard.jsx`, Backend eligibility logic

#### Decision Table

| # | Lessons Completed | Attempts < Max | Previous Pass | Expected Result | Test Case ID |
|---|-------------------|----------------|---------------|-----------------|--------------|
| 1 | ✅ Yes | ✅ Yes | ❌ No | **Can Take Exam** ✅ | DT-TC-001-1 |
| 2 | ✅ Yes | ✅ Yes | ✅ Yes | **Cannot Take** (Already passed) ❌ | DT-TC-001-2 |
| 3 | ✅ Yes | ❌ No | ❌ No | **Cannot Take** (Max attempts) ❌ | DT-TC-001-3 |
| 4 | ✅ Yes | ❌ No | ✅ Yes | **Cannot Take** (Already passed) ❌ | DT-TC-001-4 |
| 5 | ❌ No | ✅ Yes | ❌ No | **Cannot Take** (Prerequisites) ❌ | DT-TC-001-5 |
| 6 | ❌ No | ✅ Yes | ✅ Yes | **Cannot Take** (Impossible state) ❌ | DT-TC-001-6 |
| 7 | ❌ No | ❌ No | ❌ No | **Cannot Take** (Multiple fails) ❌ | DT-TC-001-7 |
| 8 | ❌ No | ❌ No | ✅ Yes | **Cannot Take** (Impossible state) ❌ | DT-TC-001-8 |

#### Detailed Test Cases

**DT-TC-001-1: First Time Taker - Eligible**
```
Preconditions:
- User enrolled in course
- All lessons completed (5/5)
- No previous exam attempts (0)
- Exam allows 3 attempts

Test Steps:
1. Navigate to course learning page
2. Scroll to exam section in sidebar
3. Observe "Take Exam" button

Expected Result:
- Button is enabled and clickable
- Shows "Take Exam" text
- No warning messages displayed

Test Data:
- User ID: 5 (Tom - learner)
- Course ID: 1
- MOOC ID: 52 (Python Basics Exam)
```

**DT-TC-001-2: Already Passed - Ineligible**
```
Preconditions:
- User enrolled in course
- All lessons completed (5/5)
- Previous attempt: Score 85% (passed)
- Exam passing score: 70%

Test Steps:
1. Navigate to course learning page
2. Scroll to exam section in sidebar
3. Check exam card status

Expected Result:
- Shows "You passed with 85%" message
- "Take Exam" button is disabled
- Green checkmark icon displayed
- Best score highlighted

Test Data:
- User ID: 5
- Previous attempt ID: 101
- Score: 85/100
```

**DT-TC-001-3: Max Attempts Reached - Ineligible**
```
Preconditions:
- All lessons completed
- 3 previous attempts (all failed)
- Exam allows max 3 attempts
- Highest score: 65% (below 70%)

Test Steps:
1. Navigate to exam section
2. Check attempt counter
3. Observe button state

Expected Result:
- Shows "Attempts: 3/3"
- "Take Exam" button is disabled
- Message: "Maximum attempts reached"
- Best score shown: 65%

Test Data:
- Previous attempts: [55%, 60%, 65%]
```

**DT-TC-001-5: Incomplete Lessons - Ineligible**
```
Preconditions:
- Lessons completed: 3/5
- No previous attempts
- Exam requires all lessons complete

Test Steps:
1. Navigate to exam section
2. Check lock icon
3. Hover over "Take Exam" button

Expected Result:
- Lock icon displayed
- Button is disabled
- Tooltip: "Complete all lessons first"
- Progress bar shows 3/5 lessons

Test Data:
- Completed lessons: [1, 2, 3]
- Remaining: [4, 5]
```

---

### 1.2 DT-TC-002: Exam Scoring Logic

**Purpose**: Verify pass/fail determination based on score  
**Technique**: Decision Table Testing

#### Decision Table

| # | Score | Passing Threshold | Previous Best | Expected Result | Test Case ID |
|---|-------|-------------------|---------------|-----------------|--------------|
| 1 | 100% | 70% | None | **Pass** ✅ Perfect score | DT-TC-002-1 |
| 2 | 90% | 70% | 60% | **Pass** ✅ Improved | DT-TC-002-2 |
| 3 | 70% | 70% | None | **Pass** ✅ Exact threshold | DT-TC-002-3 |
| 4 | 69% | 70% | None | **Fail** ❌ Below threshold | DT-TC-002-4 |
| 5 | 50% | 70% | 65% | **Fail** ❌ Declined | DT-TC-002-5 |
| 6 | 0% | 70% | None | **Fail** ❌ No correct answers | DT-TC-002-6 |
| 7 | 80% | 70% | 90% | **Pass** ✅ But not best | DT-TC-002-7 |

#### Detailed Test Cases

**DT-TC-002-1: Perfect Score**
```
Test Steps:
1. Start exam with 10 questions
2. Answer all 10 questions correctly
3. Submit exam
4. View result

Expected Result:
- Score: 100% (10/10)
- Status: "Pass" with green background
- Message: "Congratulations! Perfect score!"
- Confetti animation shown

API Validation:
POST /api/exams/:examId/submit
Response:
{
  "success": true,
  "data": {
    "score": 100,
    "total_questions": 10,
    "correct_answers": 10,
    "passed": true
  }
}
```

**DT-TC-002-3: Exact Passing Threshold (Boundary)**
```
Test Steps:
1. Start exam with 10 questions
2. Answer exactly 7 correctly, 3 wrong
3. Submit exam

Expected Result:
- Score: 70% (7/10)
- Status: "Pass" (border case)
- Message: "Congratulations! You passed!"
- No confetti (not perfect)

Database Validation:
SELECT score, passed FROM exam_attempts WHERE attempt_id = ?
Expected: score = 70, passed = 1 (true)
```

**DT-TC-002-4: Just Below Passing (Boundary)**
```
Test Steps:
1. Start exam with 10 questions
2. Answer 6 correctly, 4 wrong
3. Submit exam

Expected Result:
- Score: 60% (6/10)
- Status: "Failed" with red background
- Message: "You need 70% to pass. Keep learning!"
- Retry button enabled (if attempts remain)

Expected Calculation:
6 correct / 10 total = 0.60 = 60% < 70% → FAIL
```

**DT-TC-002-6: Zero Score**
```
Test Steps:
1. Start exam
2. Answer all questions incorrectly
3. Submit exam

Expected Result:
- Score: 0% (0/10)
- Status: "Failed"
- Message: "Review the course materials and try again"
- All answers marked red in review
```

---

### 1.3 DT-TC-003: Timer Auto-Submit Logic

**Purpose**: Verify auto-submit behavior based on time and answers  
**Technique**: Decision Table Testing

#### Decision Table

| # | Time Left | Answers Given | Submit Clicked | Expected Action | Test Case ID |
|---|-----------|---------------|----------------|-----------------|--------------|
| 1 | 0:00 | 10/10 | No | **Auto-submit all** | DT-TC-003-1 |
| 2 | 0:00 | 5/10 | No | **Auto-submit partial** | DT-TC-003-2 |
| 3 | 0:00 | 0/10 | No | **Auto-submit empty** | DT-TC-003-3 |
| 4 | 10:00 | 10/10 | Yes | **Manual submit** | DT-TC-003-4 |
| 5 | 10:00 | 5/10 | Yes | **Submit with warning** | DT-TC-003-5 |
| 6 | 0:01 | 9/10 | Yes | **Submit normally** | DT-TC-003-6 |

#### Detailed Test Cases

**DT-TC-003-1: Auto-Submit All Answered**
```
Test Steps:
1. Start exam (20 minute timer)
2. Answer all 10 questions
3. Wait until timer reaches 0:00 (or fast-forward in test)
4. Do NOT click submit

Expected Result:
- When timer hits 0:00, exam auto-submits
- Alert shown: "Time's up! Exam submitted automatically"
- Navigate to result page
- All 10 answers counted in scoring

Console Log Check:
"⏰ Time expired - Auto-submitting exam"
```

**DT-TC-003-2: Auto-Submit Partial Answers**
```
Test Steps:
1. Start exam
2. Answer only questions 1-5 (leave 6-10 blank)
3. Let timer expire

Expected Result:
- Auto-submits at 0:00
- Only 5 answered questions scored
- Questions 6-10 marked as incorrect (no answer = wrong)
- Score calculation: X/10 where X ≤ 5

Database Check:
SELECT COUNT(*) FROM exam_answers 
WHERE attempt_id = ? AND selected_option IS NOT NULL
Expected: 5 rows
```

**DT-TC-003-3: Auto-Submit No Answers**
```
Test Steps:
1. Start exam
2. Do not select any answers
3. Let timer expire

Expected Result:
- Auto-submits with all blank answers
- Score: 0% (0/10)
- Status: "Failed"
- Message: "No answers submitted"

Edge Case Validation:
Ensure no database errors when answers array is empty
```

**DT-TC-003-5: Manual Submit with Unanswered Questions**
```
Test Steps:
1. Start exam
2. Answer only 5/10 questions
3. Click "Submit Exam" button

Expected Result:
- Warning modal shown:
  "You have 5 unanswered questions. Submit anyway?"
- Two buttons: "Go Back" and "Submit Anyway"
- Clicking "Submit Anyway" proceeds to scoring
- Clicking "Go Back" returns to exam

UI Check:
Modal contains:
- Answered: 5/10 (green)
- Unanswered: 5/10 (orange)
```

---

## 2. USE CASE TEST CASES

### 2.1 UC-TC-001: First-Time Exam Taker (Happy Path)

**Use Case ID**: UC-001  
**Actor**: Learner  
**Precondition**: Enrolled in course, completed all lessons, no previous attempts  
**Trigger**: User clicks "Take Exam" button

#### Main Success Scenario

| Step | Action | Expected Result |
|------|--------|-----------------|
| **1** | User navigates to course learning page | Course content loads with sidebar |
| **2** | User scrolls to exam section | Exam card shows "Take Exam" button (enabled) |
| **3** | User clicks "Take Exam" | `ExamIntro` modal opens with instructions |
| **4** | User reads exam rules | Shows: 10 questions, 20 minutes, 70% to pass |
| **5** | User clicks "Start Exam" | API call: `POST /api/exams/:examId/start` |
| **6** | System creates exam attempt | New `attempt_id` generated in database |
| **7** | System loads 10 random questions | Questions displayed in `ExamSession` |
| **8** | Timer starts counting down | Timer shows 20:00 and decrements |
| **9** | User answers question 1 | Selected option highlighted |
| **10** | User clicks "Next" | Question 2 displayed |
| **11** | User answers questions 2-10 | Progress shows 10/10 answered |
| **12** | User clicks "Submit Exam" | Confirmation modal appears |
| **13** | User confirms submission | API call: `POST /api/exams/:examId/submit` |
| **14** | System calculates score | Score: 8/10 = 80% |
| **15** | System saves result to database | `exam_attempts` updated with score |
| **16** | `ExamResult` modal shown | Shows "Pass" with 80% score |
| **17** | User clicks "Review Answers" | `ExamReview` shows all Q&A with correct answers |
| **18** | User clicks "Continue Learning" | Returns to course learning page |

#### Test Case: UC-TC-001

```
Test Case ID: UC-TC-001
Title: First-Time Learner Takes and Passes Exam
Priority: High
Type: Functional, End-to-End

Preconditions:
- User: Tom (user_id: 5, role: learner)
- Course: "Python Basics" (course_id: 1)
- Enrollment status: Active
- Lessons completed: 5/5
- Previous exam attempts: 0

Test Data:
- Exam ID: 52
- MOOC ID: 52
- Total questions: 10
- Duration: 20 minutes
- Passing score: 70%
- Attempts allowed: 3

Test Steps:
1. Login as Tom (learner)
2. Navigate to "Python Basics" course learning page
3. Verify exam card shows:
   - Title: "Python Basics Exam"
   - Questions: 10
   - Duration: 20 min
   - Prerequisites: ✅ Complete (5/5 lessons)
   - Attempts: 0/3
   - Take Exam button: Enabled

4. Click "Take Exam" button
5. Verify ExamIntro modal displays:
   - Exam title
   - Instructions
   - Duration and question count
   - "Start Exam" button enabled

6. Click "Start Exam"
7. Verify API request sent:
   POST http://localhost:3001/api/exams/52/start
   Headers: Authorization: Bearer <token>

8. Verify API response:
   {
     "success": true,
     "data": {
       "attempt_id": 201,
       "questions": [10 questions array],
       "duration_minutes": 20
     }
   }

9. Verify ExamSession displays:
   - Timer: 20:00 (counting down)
   - Question 1 of 10
   - 4 answer options (A, B, C, D)
   - Navigation: Next button enabled
   - Progress: 0/10 answered

10. Answer questions as follows:
    Q1: A (Correct)
    Q2: B (Correct)
    Q3: C (Wrong)
    Q4: A (Correct)
    Q5: D (Correct)
    Q6: B (Correct)
    Q7: A (Correct)
    Q8: C (Wrong)
    Q9: D (Correct)
    Q10: B (Correct)

11. After answering all 10, click "Submit Exam"
12. Verify confirmation modal:
    "Are you sure you want to submit? This cannot be undone."
    Buttons: "Go Back" | "Submit"

13. Click "Submit"
14. Verify API request:
    POST http://localhost:3001/api/exams/52/submit
    Body: {
      "attempt_id": 201,
      "answers": [
        {"question_id": 1, "selected_option": "A"},
        ...
      ]
    }

15. Verify API response:
    {
      "success": true,
      "data": {
        "score": 80,
        "total_questions": 10,
        "correct_answers": 8,
        "passed": true,
        "time_taken": "15:30"
      }
    }

16. Verify ExamResult displays:
    - Title: "Exam Completed!"
    - Score: 80% (8/10)
    - Status: "Pass" (green background)
    - Message: "Congratulations! You passed!"
    - Time taken: 15 minutes 30 seconds
    - Buttons: "Review Answers" | "Continue Learning"

17. Click "Review Answers"
18. Verify ExamReview shows:
    - All 10 questions
    - User's selected answers (8 green checkmarks, 2 red X)
    - Correct answers for all questions
    - Scroll to see all

19. Click "Close" on review modal
20. Verify returned to course learning page
21. Verify exam card now shows:
    - "You passed with 80%"
    - Green checkmark icon
    - Attempts: 1/3
    - Best score: 80%
    - "Take Exam" button: Disabled (already passed)

Expected Result:
✅ All steps complete successfully
✅ Score calculated correctly (8/10 = 80%)
✅ Pass status determined correctly (80% ≥ 70%)
✅ Database updated with attempt and answers
✅ UI reflects passed status

Database Validation Queries:
-- Check attempt created
SELECT * FROM exam_attempts 
WHERE user_id = 5 AND exam_id = 52 
ORDER BY created_at DESC LIMIT 1;

Expected:
| attempt_id | user_id | exam_id | score | passed | time_taken |
|------------|---------|---------|-------|--------|------------|
| 201        | 5       | 52      | 80    | 1      | 15:30      |

-- Check answers saved
SELECT COUNT(*) FROM exam_answers WHERE attempt_id = 201;
Expected: 10 rows

-- Check correct answers
SELECT COUNT(*) FROM exam_answers ea
JOIN questions q ON ea.question_id = q.question_id
WHERE ea.attempt_id = 201 AND ea.selected_option = q.correct_option;
Expected: 8 rows
```

---

### 2.2 UC-TC-002: Learner Retakes Failed Exam

**Use Case ID**: UC-002  
**Actor**: Learner  
**Precondition**: Previously failed exam (score < 70%), attempts remaining  
**Trigger**: User clicks "Retake Exam" button

#### Test Case: UC-TC-002

```
Test Case ID: UC-TC-002
Title: Learner Retakes Failed Exam and Improves Score
Priority: High
Type: Functional, Retake Workflow

Preconditions:
- User: Tom (user_id: 5)
- Course: "Python Basics" (course_id: 1)
- Previous attempt: Score 60% (failed)
- Attempts used: 1/3
- Status: Failed (60% < 70%)

Test Data:
- Previous attempt_id: 201
- Previous score: 60%
- Previous answers: 6 correct, 4 wrong

Test Steps:
1. Login as Tom
2. Navigate to course learning page
3. Verify exam card shows:
   - "You scored 60% - Try again!"
   - Red X icon
   - Attempts: 1/3
   - Best score: 60%
   - "Retake Exam" button: Enabled

4. Click "Retake Exam"
5. Verify ExamIntro modal shows:
   - "Previous attempt: 60%"
   - "You need 70% to pass"
   - "Attempts remaining: 2"

6. Click "Start Exam"
7. Verify NEW attempt created (attempt_id: 202)
8. Verify questions are DIFFERENT (randomized)
   Compare question IDs with previous attempt

9. Answer 9 out of 10 correctly this time
10. Submit exam
11. Verify new score: 90% (9/10)
12. Verify status: "Pass"
13. Verify ExamResult shows:
    - Current score: 90%
    - Previous best: 60%
    - "Improved by 30%!" message

14. Return to course
15. Verify exam card updated:
    - "You passed with 90%"
    - Green checkmark
    - Attempts: 2/3
    - Best score: 90% (updated)
    - "Retake" button: Disabled (passed)

Expected Result:
✅ New attempt created (not overwriting previous)
✅ Questions randomized
✅ Score improved
✅ Best score updated in UI
✅ Pass status prevents further retakes

Database Validation:
-- Both attempts should exist
SELECT * FROM exam_attempts WHERE user_id = 5 AND exam_id = 52;
Expected: 2 rows (attempt 201: 60%, attempt 202: 90%)

-- Best score tracked
Expected: UI shows 90% as best
```

---

### 2.3 UC-TC-003: Auto-Submit on Timer Expiry

**Use Case ID**: UC-003  
**Actor**: System (automated)  
**Precondition**: Exam in progress, timer running  
**Trigger**: Timer reaches 0:00

#### Test Case: UC-TC-003

```
Test Case ID: UC-TC-003
Title: Exam Auto-Submits When Time Expires
Priority: Critical
Type: Functional, Timer Logic

Test Steps:
1. Start exam (20 minute timer)
2. Answer only 5 out of 10 questions
3. Do NOT click submit
4. Fast-forward timer to 0:01 (using browser dev tools or test mock)
   OR wait 20 minutes in real-time test

5. Observe at 0:00:
   - Alert shown: "Time's up! Submitting exam..."
   - Auto-submit triggered
   - Navigate to result page

6. Verify scoring:
   - Only 5 answered questions scored
   - Questions 6-10 marked wrong (no answer = incorrect)
   - Score: (correct in 5) / 10

7. Verify result modal shows:
   - Time taken: "20:00" (full duration)
   - Auto-submit indicator shown

Expected Result:
✅ Timer countdown accurate
✅ Auto-submit fires at 0:00
✅ No answers lost
✅ Unanswered = incorrect
✅ User notified of auto-submit

Code Validation:
// In ExamSession.jsx
useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        handleAutoSubmit(); // ← This should fire
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}, []);
```

---

## 3. BOUNDARY VALUE TEST CASES

### 3.1 BV-TC-001: Score Boundaries

| Test Case | Score | Passing % | Expected | Description |
|-----------|-------|-----------|----------|-------------|
| BV-TC-001-1 | 69% | 70% | **Fail** ❌ | Just below pass (min fail) |
| BV-TC-001-2 | 70% | 70% | **Pass** ✅ | Exact passing threshold |
| BV-TC-001-3 | 71% | 70% | **Pass** ✅ | Just above pass |
| BV-TC-001-4 | 0% | 70% | **Fail** ❌ | Minimum possible score |
| BV-TC-001-5 | 100% | 70% | **Pass** ✅ | Maximum possible score |

### 3.2 BV-TC-002: Attempt Limits

| Test Case | Attempts Used | Max Attempts | Expected | Description |
|-----------|---------------|--------------|----------|-------------|
| BV-TC-002-1 | 0 | 3 | Can take | No attempts yet |
| BV-TC-002-2 | 1 | 3 | Can take | 1 attempt used |
| BV-TC-002-3 | 2 | 3 | Can take | Last attempt available |
| BV-TC-002-4 | 3 | 3 | Cannot take | Max reached (boundary) |
| BV-TC-002-5 | 3 | 3 + Passed | Cannot take | Passed, no more retakes |

### 3.3 BV-TC-003: Timer Boundaries

| Test Case | Time | Expected Behavior |
|-----------|------|-------------------|
| BV-TC-003-1 | 20:00 | Exam starts, timer begins countdown |
| BV-TC-003-2 | 10:00 | Normal operation, halfway |
| BV-TC-003-3 | 05:00 | Yellow warning shown |
| BV-TC-003-4 | 01:00 | Red warning shown |
| BV-TC-003-5 | 00:01 | Final second, still can submit manually |
| BV-TC-003-6 | 00:00 | Auto-submit triggered |

---

## 4. TEST EXECUTION GUIDE

### 4.1 How to Execute Tests

#### Unit Tests (Vitest)
```bash
# Run all exam tests
npm test -- exam

# Run specific test file
npm test testing/unit-tests/exam-api.test.js

# Run with coverage
npm test -- --coverage
```

#### API Tests (Postman/cURL)
```bash
# Test GET exam info
curl -X GET http://localhost:3001/api/exams/mooc/52 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test start exam
curl -X POST http://localhost:3001/api/exams/52/start \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test submit exam
curl -X POST http://localhost:3001/api/exams/52/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attempt_id": 201,
    "answers": [
      {"question_id": 1, "selected_option": "A"}
    ]
  }'
```

#### E2E Tests (Selenium - see next file)

### 4.2 Test Data Setup

```sql
-- Create test user
INSERT INTO users (user_id, email, full_name, role_id, status)
VALUES (999, 'test@exam.com', 'Test User', 3, 'active');

-- Create test exam
INSERT INTO exams (exam_id, mooc_id, duration_minutes, passing_score, attempts_allowed)
VALUES (99, 52, 20, 70, 3);

-- Create test questions (10)
INSERT INTO questions (question_id, mooc_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
VALUES 
(1001, 52, 'What is Python?', 'Language', 'Snake', 'Tool', 'IDE', 'A', 'easy'),
(1002, 52, 'What is a variable?', 'Storage', 'Loop', 'Function', 'Class', 'A', 'easy');
-- ... add 8 more questions
```

### 4.3 Test Execution Checklist

**Pre-Testing**:
- [ ] Backend server running (http://localhost:3001)
- [ ] Frontend server running (http://localhost:5173)
- [ ] Database connected and seeded
- [ ] Test user created and enrolled
- [ ] Browser cleared (cookies, cache)

**During Testing**:
- [ ] Record screen for critical tests
- [ ] Take screenshots at each step
- [ ] Log API requests/responses
- [ ] Note any unexpected behavior

**Post-Testing**:
- [ ] Update test results in Jira
- [ ] Log defects with screenshots
- [ ] Clean up test data
- [ ] Update test case status

---

## 📊 TEST METRICS

### Coverage Goals
- **Decision Table Coverage**: 100% (all combinations tested)
- **Use Case Coverage**: 100% (all main + alternative flows)
- **Boundary Value Coverage**: 100% (all boundaries tested)
- **Code Coverage**: ≥80% (unit tests)

### Pass/Fail Criteria
- **Critical Test Cases**: 100% pass required
- **High Priority**: ≥95% pass required
- **Medium Priority**: ≥90% pass required
- **Low Priority**: ≥85% pass required

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Total Test Cases**: 25+ (Decision Table + Use Cases + Boundary)  
**Estimated Execution Time**: 8 hours (manual) + 2 hours (automated)
