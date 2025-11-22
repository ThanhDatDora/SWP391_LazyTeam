# Decision Table Test Cases - Exam System

## Decision Table 1: Exam Eligibility

### Business Rules
- User must be enrolled in the course
- All lessons in the MOOC must be completed
- User cannot take exam if time limit not expired from last attempt (5 minutes)
- Exam questions must exist in database

### Decision Table

| Condition | Test Case 1 | Test Case 2 | Test Case 3 | Test Case 4 | Test Case 5 | Test Case 6 | Test Case 7 | Test Case 8 |
|-----------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|
| **Enrolled in Course** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **All Lessons Completed** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Cooldown Expired** | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Questions Exist** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Expected Result** | ✅ **ALLOWED** | ⏳ **WAIT** | ❌ **BLOCKED** | ❌ **BLOCKED** | ❌ **NOT ENROLLED** | ❌ **NOT ENROLLED** | ❌ **NOT ENROLLED** | ❌ **NOT ENROLLED** |
| **Error Message** | - | "Wait X seconds" | "Complete lessons" | "Complete lessons" | "Not enrolled" | "Not enrolled" | "Not enrolled" | "Not enrolled" |

### Test Cases

#### TC-DT1-001: Fully Eligible User Can Start Exam
**Pre-conditions:**
- User enrolled in course
- All lessons completed
- No recent attempt (>5 minutes)
- Questions exist in database

**Test Steps:**
1. Login as enrolled student
2. Navigate to course learning page
3. Click "Take Exam" button

**Expected Result:** ✅ Exam session starts, questions loaded

**Priority:** Critical

---

#### TC-DT1-002: User Must Wait for Cooldown
**Pre-conditions:**
- User enrolled in course
- All lessons completed
- Recent attempt within 5 minutes
- Questions exist

**Test Steps:**
1. Take an exam
2. Immediately try to take exam again

**Expected Result:** ⏳ Error message "Please wait X seconds before retrying"

**Priority:** High

---

#### TC-DT1-003: User Must Complete Lessons First
**Pre-conditions:**
- User enrolled in course
- Only 3 out of 5 lessons completed
- No recent attempt

**Test Steps:**
1. Login as student
2. Navigate to course
3. Click "Take Exam" button

**Expected Result:** ❌ Error message "Must complete all lessons before taking exam"

**Priority:** Critical

---

#### TC-DT1-004: Non-Enrolled User Cannot Take Exam
**Pre-conditions:**
- User NOT enrolled in course
- Course exists and has exam

**Test Steps:**
1. Login as student
2. Try to access exam URL directly: `/learn/:courseId/exam`

**Expected Result:** ❌ Redirect to enrollment page or error message

**Priority:** Critical

---

## Decision Table 2: Exam Grading Logic

### Business Rules
- Each question worth 10 points (10 questions total = 100 points)
- Passing score = 70% (7 out of 10 correct)
- Score rounded to 2 decimal places
- Pass if score ≥ 70%

### Decision Table

| Condition | TC 1 | TC 2 | TC 3 | TC 4 | TC 5 | TC 6 | TC 7 |
|-----------|------|------|------|------|------|------|------|
| **Correct Answers** | 10 | 9 | 8 | 7 | 6 | 5 | 0 |
| **Total Questions** | 10 | 10 | 10 | 10 | 10 | 10 | 10 |
| **Expected Score** | 100% | 90% | 80% | 70% | 60% | 50% | 0% |
| **Expected Status** | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ FAIL |
| **Next MOOC Unlocked** | Yes | Yes | Yes | Yes | No | No | No |

### Test Cases

#### TC-DT2-001: Perfect Score (100%)
**Input:** 10 correct answers out of 10 questions

**Expected Output:**
- Score: 100.00%
- Status: PASS
- Correct answers: 10
- Next MOOC unlocked: Yes

**Test Data:**
```json
{
  "answers": [
    {"question_id": 1, "selected_option": "A"}, // Correct
    {"question_id": 2, "selected_option": "B"}, // Correct
    // ... all 10 correct
  ]
}
```

**Priority:** High

---

#### TC-DT2-002: Exact Passing Score (70%)
**Input:** 7 correct answers out of 10 questions

**Expected Output:**
- Score: 70.00%
- Status: PASS (boundary case)
- Correct answers: 7
- Next MOOC unlocked: Yes

**Priority:** Critical (boundary value)

---

#### TC-DT2-003: Just Below Passing (69%)
**Input:** 6 correct answers, 1 partially correct (if applicable), 3 wrong

**Expected Output:**
- Score: 60.00% (or 69% depending on partial credit)
- Status: FAIL
- Next MOOC unlocked: No

**Priority:** Critical (boundary value)

---

#### TC-DT2-004: Complete Failure (0%)
**Input:** 0 correct answers out of 10 questions

**Expected Output:**
- Score: 0.00%
- Status: FAIL
- Correct answers: 0
- Next MOOC unlocked: No

**Priority:** Medium

---

## Decision Table 3: Timer Behavior

### Business Rules
- Exam has 20-minute time limit (1200 seconds)
- Timer starts when exam begins
- Auto-submit when time expires
- User can submit before time expires

### Decision Table

| Condition | TC 1 | TC 2 | TC 3 | TC 4 |
|-----------|------|------|------|------|
| **Time Remaining** | > 0 | > 0 | = 0 | < 0 (expired) |
| **User Clicks Submit** | Yes | No | N/A | N/A |
| **All Questions Answered** | Yes | No | - | - |
| **Expected Action** | Submit Exam | Warning | Auto-Submit | Auto-Submit |
| **Score Calculated** | Yes | Yes | Yes | Yes |

### Test Cases

#### TC-DT3-001: User Submits Before Time Expires
**Pre-conditions:**
- Exam started
- Timer showing 10 minutes remaining
- All questions answered

**Test Steps:**
1. Start exam
2. Answer all 10 questions
3. Click "Submit Exam" button
4. Confirm submission

**Expected Result:** ✅ Exam submitted, score calculated, results displayed

**Priority:** Critical

---

#### TC-DT3-002: Auto-Submit at Time Expiry
**Pre-conditions:**
- Exam started
- Only 5 questions answered

**Test Steps:**
1. Start exam
2. Answer 5 questions
3. Wait until timer reaches 00:00

**Expected Result:** ⏰ Exam auto-submits, score calculated for answered questions only

**Priority:** Critical

---

#### TC-DT3-003: Timer Countdown Accuracy
**Pre-conditions:**
- Exam started with 20-minute limit

**Test Steps:**
1. Start exam
2. Observe timer for 1 minute
3. Check timer value after 60 seconds

**Expected Result:** Timer shows 19:00 (accurate countdown)

**Priority:** High

---

## Decision Table 4: Answer Selection Validation

### Business Rules
- User can select one answer per question (single choice)
- User can change answer before submission
- Unanswered questions receive 0 points
- Selected answers must be valid option IDs

### Decision Table

| Condition | TC 1 | TC 2 | TC 3 | TC 4 |
|-----------|------|------|------|------|
| **Answer Selected** | Yes | Yes | No | Yes |
| **Valid Option** | Yes | Yes | N/A | No (invalid ID) |
| **Changed Before Submit** | No | Yes | N/A | N/A |
| **Expected Behavior** | Save Answer | Save New Answer | Score = 0 | Reject Invalid |

### Test Cases

#### TC-DT4-001: Select Valid Answer
**Test Steps:**
1. Start exam
2. Click option "A" for question 1

**Expected Result:** ✅ Option A highlighted, answer saved in state

**Priority:** Critical

---

#### TC-DT4-002: Change Answer Before Submit
**Test Steps:**
1. Select option "A" for question 1
2. Change to option "B"
3. Verify selection

**Expected Result:** ✅ Option B now highlighted, option A deselected

**Priority:** High

---

#### TC-DT4-003: Submit with Unanswered Questions
**Test Steps:**
1. Answer only 7 out of 10 questions
2. Click Submit
3. Confirm submission

**Expected Result:** ⚠️ Warning shown "3 questions unanswered", but submission allowed

**Priority:** Medium

---

#### TC-DT4-004: Invalid Option ID Rejection
**Test Steps:**
1. Programmatically inject invalid option_id via API
2. Submit exam

**Expected Result:** ❌ API returns 400 Bad Request, invalid option rejected

**Priority:** Medium (security)

---

## Decision Table 5: Progress Update After Exam

### Business Rules
- Pass exam → Update enrollments table
- Unlock next MOOC if exists
- Increment moocs_completed counter
- Update overall_score (average of passed exams)
- If last MOOC → Mark course complete (progress = 100%)

### Decision Table

| Condition | TC 1 | TC 2 | TC 3 | TC 4 |
|-----------|------|------|------|------|
| **Exam Passed** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Is Last MOOC** | No | Yes | No | Yes |
| **Next MOOC Exists** | Yes | No | Yes | No |
| **Current MOOC Updates** | ✅ | ✅ | ❌ | ✅ |
| **Next MOOC Unlocked** | ✅ | ❌ | ❌ | ❌ |
| **Course Completed** | ❌ | ✅ | ❌ | ✅ |
| **Progress** | +10% | 100% | No change | 100% |

### Test Cases

#### TC-DT5-001: Pass MOOC 1 of 5 → Unlock MOOC 2
**Pre-conditions:**
- Student enrolled in course with 5 MOOCs
- Currently on MOOC 1

**Test Steps:**
1. Take exam for MOOC 1
2. Score 80% (pass)
3. Check enrollment record

**Expected Result:**
- ✅ current_mooc_id updated to MOOC 2
- moocs_completed = 1
- progress = 20%
- MOOC 2 now accessible

**SQL Verification:**
```sql
SELECT current_mooc_id, moocs_completed, progress
FROM enrollments
WHERE user_id = @userId AND course_id = @courseId
```

**Priority:** Critical

---

#### TC-DT5-002: Pass Last MOOC → Complete Course
**Pre-conditions:**
- Student on MOOC 5 of 5

**Test Steps:**
1. Take exam for MOOC 5
2. Score 75% (pass)
3. Check enrollment

**Expected Result:**
- ✅ moocs_completed = 5
- progress = 100%
- Course marked complete
- Certificate available

**Priority:** Critical

---

#### TC-DT5-003: Fail Exam → No Progress Update
**Pre-conditions:**
- Student on MOOC 2

**Test Steps:**
1. Take exam
2. Score 50% (fail)
3. Check enrollment

**Expected Result:**
- ❌ current_mooc_id unchanged
- moocs_completed unchanged
- progress unchanged
- MOOC 3 still locked

**Priority:** High

---

## Decision Table 6: Exam Attempt Validation

### Business Rules
- Unlimited attempts allowed
- Must wait 5 minutes between attempts (cooldown)
- Best score recorded
- All attempts tracked

### Decision Table

| Condition | TC 1 | TC 2 | TC 3 | TC 4 |
|-----------|------|------|------|------|
| **Previous Attempt Exists** | No | Yes | Yes | Yes |
| **Time Since Last Attempt** | N/A | < 5 min | ≥ 5 min | ≥ 5 min |
| **Previous Score** | N/A | 50% | 80% | 90% |
| **New Score** | 70% | 60% | 85% | 75% |
| **Best Score Updated** | ✅ 70% | ❌ 50% | ✅ 85% | ❌ 90% |
| **Can Start Exam** | ✅ Yes | ❌ Wait | ✅ Yes | ✅ Yes |

### Test Cases

#### TC-DT6-001: First Attempt
**Test Steps:**
1. User with no previous attempts
2. Click "Take Exam"

**Expected Result:** ✅ Exam starts immediately

**Priority:** High

---

#### TC-DT6-002: Second Attempt Within Cooldown
**Test Steps:**
1. Complete first attempt
2. Immediately click "Take Exam" again

**Expected Result:** ❌ Error "Please wait X seconds before retrying"

**Priority:** High

---

#### TC-DT6-003: Improve Best Score
**Pre-conditions:**
- Previous attempt: 50%

**Test Steps:**
1. Wait 5 minutes
2. Take exam again
3. Score 80%

**Expected Result:** ✅ Best score updated to 80%, attempt tracked

**Priority:** Medium

---

#### TC-DT6-004: Lower Score Doesn't Replace Best
**Pre-conditions:**
- Previous best: 90%

**Test Steps:**
1. Take exam again
2. Score 70%

**Expected Result:** ✅ Attempt recorded, but best_score remains 90%

**Priority:** Medium

---

## Summary Statistics

| Decision Table | Total Conditions | Total Test Cases | Priority Critical | Priority High | Priority Medium |
|----------------|------------------|------------------|-------------------|---------------|-----------------|
| DT1: Eligibility | 4 | 4 | 3 | 1 | 0 |
| DT2: Grading | 3 | 4 | 2 | 1 | 1 |
| DT3: Timer | 3 | 3 | 2 | 1 | 0 |
| DT4: Answer Selection | 4 | 4 | 1 | 1 | 2 |
| DT5: Progress Update | 4 | 3 | 2 | 1 | 0 |
| DT6: Attempt Validation | 4 | 4 | 0 | 2 | 2 |
| **TOTAL** | **22** | **22** | **10** | **7** | **5** |

---

## Test Execution Template

For each test case:

```
Test Case ID: TC-DT#-###
Date Executed: __________
Tester Name: __________
Environment: [ ] Dev [ ] Test [ ] Staging
Browser: [ ] Chrome [ ] Firefox [ ] Edge

Result: [ ] Pass [ ] Fail [ ] Blocked

Actual Result (if different from expected):
_________________________________________________

Defects Found:
- Defect ID: _______ | Severity: _______ | Description: _______

Notes:
_________________________________________________
```

---

**Document Version:** 1.0  
**Last Updated:** November 12, 2025  
**Created by:** QA Team
