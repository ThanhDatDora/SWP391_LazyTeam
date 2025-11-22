# Use Case Test Scenarios - Exam System

## Use Case 1: Student Views Exam Information

### UC-001: View Exam Info
**Actor:** Enrolled Student  
**Pre-conditions:** 
- Student is logged in
- Student enrolled in course
- Course has at least one MOOC with exam

**Main Flow:**
1. Student navigates to course learning page
2. System displays course content with MOOCs
3. Student scrolls to exam card section
4. System displays exam information:
   - Exam title (MOOC name)
   - Number of questions
   - Duration (20 minutes)
   - Passing score (70%)
   - Previous attempts (if any)
   - Best score (if attempted before)
5. Student reads exam details

**Post-conditions:** Student is informed about exam requirements

**Test Cases:**

#### TC-UC001-001: First Time Viewing Exam
**Test Steps:**
1. Login as: `huy484820@gmail.com` / `Learner@123`
2. Navigate to "Python Programming" course
3. Locate MOOC 1 exam card
4. Verify exam information displayed

**Expected Result:**
- ✅ Exam title: "MOOC 1 Exam"
- Total questions: 10
- Duration: 20 minutes
- Passing score: 70%
- Previous attempts: 0
- Best score: Not attempted

**Priority:** High

---

#### TC-UC001-002: Viewing Exam After Previous Attempt
**Test Steps:**
1. Login as student who took exam before
2. Navigate to course
3. View exam card

**Expected Result:**
- ✅ Previous attempts: 1 (or more)
- Best score: X% displayed
- Last attempt date shown

**Priority:** Medium

---

## Use Case 2: Student Takes Exam

### UC-002: Complete Exam Successfully
**Actor:** Enrolled Student  
**Pre-conditions:** 
- Student logged in
- All lessons in MOOC completed
- No recent attempt within 5 minutes
- Questions exist in database

**Main Flow:**
1. Student clicks "Take Exam" button
2. System validates eligibility:
   - Checks enrollment status
   - Verifies lesson completion
   - Validates cooldown period
3. System displays exam introduction screen:
   - Exam rules
   - Time limit warning
   - Number of questions
4. Student clicks "Start Exam" button
5. System creates exam attempt record
6. System randomizes 10 questions from question bank
7. System starts 20-minute countdown timer
8. System displays Question 1 with options
9. Student selects answer option
10. Student clicks "Next" button
11. System saves answer and displays Question 2
12. Student repeats steps 9-11 for all questions
13. Student clicks "Submit Exam" button
14. System shows confirmation dialog
15. Student confirms submission
16. System calculates score:
    - Compares selected answers with correct answers
    - Counts correct answers
    - Calculates percentage (correct/10 * 100)
17. System determines pass/fail (score ≥ 70%)
18. System updates enrollment record (if passed)
19. System unlocks next MOOC (if applicable)
20. System displays results screen:
    - Score percentage
    - Pass/fail status
    - Correct answer count
21. Student views results

**Post-conditions:** 
- Exam attempt recorded in database
- If passed: Next MOOC unlocked, progress updated
- Student can see results

**Alternative Flows:**

**AF-002a: Auto-Submit on Time Expiry**
- At step 12: Timer reaches 00:00
- System automatically submits exam
- Continue to step 16

**AF-002b: Student Changes Answer**
- At step 10: Student clicks "Previous"
- System shows previous question
- Student changes answer selection
- System updates saved answer

**AF-002c: Exam Failed**
- At step 17: Score < 70%
- System marks as FAIL
- Skip steps 18-19 (no progress update)
- Show results with encouragement message

**Test Cases:**

#### TC-UC002-001: Complete Exam and Pass (Happy Path)
**Test Steps:**
1. Login as `test.student@example.com` / `Student@123`
2. Navigate to enrolled course
3. Complete all lessons in MOOC 1 (if not done)
4. Click "Take Exam" button
5. Read exam intro
6. Click "Start Exam"
7. Verify timer starts at 20:00
8. Answer all 10 questions with correct answers
9. Click "Submit Exam"
10. Confirm submission
11. Wait for results

**Expected Result:**
- ✅ Score: 100%
- Status: PASSED
- Correct answers: 10/10
- Next MOOC unlocked
- Progress updated
- Success message displayed

**Database Verification:**
```sql
SELECT * FROM exam_attempts 
WHERE user_id = @userId 
ORDER BY started_at DESC;

SELECT current_mooc_id, moocs_completed, progress 
FROM enrollments 
WHERE user_id = @userId AND course_id = @courseId;
```

**Priority:** Critical

---

#### TC-UC002-002: Complete Exam and Fail
**Test Steps:**
1. Login as student
2. Start exam
3. Answer only 5 questions correctly (5 wrong)
4. Submit exam

**Expected Result:**
- ✅ Score: 50%
- Status: FAILED
- Correct answers: 5/10
- Next MOOC still locked
- Progress unchanged
- Encouragement message: "Try again! Review the lessons."

**Priority:** Critical

---

#### TC-UC002-003: Auto-Submit When Time Expires
**Test Steps:**
1. Start exam
2. Answer 7 questions
3. Wait until timer reaches 00:00
4. Observe behavior

**Expected Result:**
- ✅ Exam auto-submits
- Modal closes automatically
- Results calculated for 7 answered questions
- 3 unanswered questions = 0 points
- Score: 70% (if 7 correct) or less

**Priority:** Critical

---

#### TC-UC002-004: Change Answer Before Submitting
**Test Steps:**
1. Start exam
2. Question 1: Select option "A"
3. Click "Next"
4. Click "Previous" to return to Question 1
5. Change answer to option "B"
6. Click "Next" again
7. Complete exam
8. Submit

**Expected Result:**
- ✅ Option "B" is saved (not "A")
- Grading uses latest answer

**Priority:** High

---

#### TC-UC002-005: Navigate Between Questions
**Test Steps:**
1. Start exam
2. Answer Question 1
3. Click "Next" → See Question 2
4. Click "Next" → See Question 3
5. Click "Previous" → See Question 2
6. Click "Previous" → See Question 1

**Expected Result:**
- ✅ Navigation works smoothly
- Answers persist when navigating
- Current question number displayed

**Priority:** High

---

## Use Case 3: Student Reviews Exam Results

### UC-003: Review Exam Answers
**Actor:** Student  
**Pre-conditions:** 
- Student has completed exam
- Exam results available

**Main Flow:**
1. Student submits exam (from UC-002)
2. System displays results screen
3. Student clicks "Review Answers" button
4. System retrieves:
   - All questions from exam attempt
   - Student's selected answers
   - Correct answers
   - Explanations (if available)
5. System displays review screen:
   - Question-by-question breakdown
   - Student's answer highlighted
   - Correct answer shown
   - Correct/incorrect indicator
6. Student scrolls through all questions
7. Student reviews mistakes
8. Student clicks "Close" button
9. System returns to results screen

**Post-conditions:** Student understands their mistakes

**Test Cases:**

#### TC-UC003-001: Review All Answers
**Test Steps:**
1. Complete exam with mixed results (7 correct, 3 wrong)
2. View results screen
3. Click "Review Answers"
4. Scroll through all 10 questions
5. Verify display

**Expected Result:**
- ✅ All 10 questions shown
- Correct answers marked with ✓ (green)
- Incorrect answers marked with ✗ (red)
- Student's selected option highlighted
- Correct answer clearly indicated
- Question text displayed

**Priority:** High

---

#### TC-UC003-002: Close Review and Return
**Test Steps:**
1. Open review screen
2. Click "Close" or "Back to Results"

**Expected Result:**
- ✅ Returns to results screen
- Results still displayed

**Priority:** Medium

---

## Use Case 4: Student Retakes Exam

### UC-004: Attempt Exam Multiple Times
**Actor:** Student  
**Pre-conditions:** 
- Student has attempted exam before
- At least 5 minutes passed since last attempt

**Main Flow:**
1. Student views exam results (failed or wants to improve)
2. Student clicks "Retake Exam" button
3. System validates cooldown period
4. System allows new attempt
5. Exam flow proceeds as UC-002
6. After submission:
   - System compares new score with best score
   - Updates best_score if new score is higher
   - Keeps previous best_score if new score is lower
7. System displays results with best score comparison

**Post-conditions:** 
- New attempt recorded
- Best score updated (if improved)

**Test Cases:**

#### TC-UC004-001: Retake and Improve Score
**Test Steps:**
1. Complete first attempt: Score 50% (fail)
2. Wait 5 minutes
3. Click "Retake Exam"
4. Complete second attempt: Score 80% (pass)
5. Check results

**Expected Result:**
- ✅ Best score: 80% (updated)
- Status: PASSED
- Attempt count: 2
- Next MOOC unlocked

**Database Check:**
```sql
SELECT attempt_id, score, passed, submitted_at
FROM exam_attempts
WHERE user_id = @userId AND mooc_id = @moocId
ORDER BY submitted_at DESC;
```

**Priority:** High

---

#### TC-UC004-002: Retake But Score Lower
**Test Steps:**
1. First attempt: 90% (pass)
2. Wait 5 minutes
3. Retake exam
4. Second attempt: 70% (pass but lower)

**Expected Result:**
- ✅ Best score: 90% (unchanged)
- Current attempt: 70%
- Both attempts visible in history

**Priority:** Medium

---

#### TC-UC004-003: Attempt Retake Too Soon (Cooldown)
**Test Steps:**
1. Complete exam
2. Immediately click "Retake Exam" (< 5 minutes)

**Expected Result:**
- ❌ Error message: "Please wait X seconds before retrying"
- Button disabled or redirected

**Priority:** High

---

## Use Case 5: Instructor Views Student Exam Results

### UC-005: View Student Exam Performance
**Actor:** Instructor  
**Pre-conditions:** 
- Instructor logged in
- Instructor owns the course
- Students have taken exams

**Main Flow:**
1. Instructor navigates to course dashboard
2. Instructor clicks "Student Results" or "Gradebook"
3. System displays list of enrolled students
4. Instructor selects a student
5. System displays student's exam attempts:
   - Course name
   - MOOC name
   - Attempt date/time
   - Score
   - Pass/fail status
6. Instructor clicks on specific attempt
7. System shows detailed answers:
   - Questions asked
   - Student's answers
   - Correct answers
   - Time taken
8. Instructor reviews performance
9. Instructor can export results (optional)

**Post-conditions:** Instructor has visibility into student performance

**Test Cases:**

#### TC-UC005-001: View All Student Attempts
**Test Steps:**
1. Login as `instructor@example.com` / `Instr@123`
2. Navigate to course dashboard
3. Click "Student Results"
4. Select student: `huy484820@gmail.com`
5. View exam attempts

**Expected Result:**
- ✅ All attempts listed
- Scores displayed
- Pass/fail status clear
- Sortable by date

**Priority:** Medium (not critical for student flow)

---

## Use Case 6: System Unlocks Next MOOC

### UC-006: Progress to Next Module
**Actor:** System (automated)  
**Trigger:** Student passes exam  
**Pre-conditions:** 
- Student passed current MOOC exam
- Next MOOC exists in course

**Main Flow:**
1. Student submits exam
2. System calculates score: ≥70% (pass)
3. System queries current MOOC order
4. System finds next MOOC (order_no + 1)
5. System updates enrollments table:
   ```sql
   UPDATE enrollments
   SET current_mooc_id = @nextMoocId,
       moocs_completed = moocs_completed + 1,
       progress = (moocs_completed + 1) * 100.0 / @totalMoocs
   WHERE user_id = @userId AND course_id = @courseId
   ```
6. System refreshes course content display
7. Student now sees next MOOC as "Current"

**Post-conditions:** 
- Next MOOC accessible
- Progress bar updated

**Test Cases:**

#### TC-UC006-001: Unlock MOOC 2 After Passing MOOC 1
**Test Steps:**
1. Enroll in course with 5 MOOCs
2. Complete MOOC 1 exam with 80%
3. Navigate back to course learning page
4. Observe MOOC 2 status

**Expected Result:**
- ✅ MOOC 2 now unlocked
- Progress: 20% (1 of 5 completed)
- MOOC 2 marked as "Current"
- MOOC 3-5 still locked

**Database Verification:**
```sql
SELECT current_mooc_id, moocs_completed, progress
FROM enrollments
WHERE user_id = @userId AND course_id = @courseId;
```

**Priority:** Critical

---

#### TC-UC006-002: Complete Last MOOC
**Test Steps:**
1. Student on MOOC 5 of 5
2. Pass exam with 75%
3. Check enrollment

**Expected Result:**
- ✅ moocs_completed: 5
- progress: 100%
- Certificate available
- No "Next MOOC" (course complete)

**Priority:** Critical

---

## Use Case 7: Handle Exam Errors

### UC-007: Error Recovery
**Actor:** Student  
**Various Error Scenarios**

**Test Cases:**

#### TC-UC007-001: No Questions Available
**Test Steps:**
1. Create exam with 0 questions in database
2. Try to start exam

**Expected Result:**
- ❌ Error: "No questions available for this exam"
- Exam doesn't start
- User redirected back

**Priority:** Medium

---

#### TC-UC007-002: Network Error During Submission
**Test Steps:**
1. Start exam
2. Answer questions
3. Disconnect internet
4. Click "Submit"

**Expected Result:**
- ❌ Error message: "Network error. Please check connection."
- Answers saved locally (if possible)
- Retry option available

**Priority:** Medium

---

#### TC-UC007-003: Session Expired
**Test Steps:**
1. Start exam
2. Wait for JWT token to expire (30+ minutes)
3. Try to submit exam

**Expected Result:**
- ❌ Redirect to login
- Session state should be recoverable (nice to have)

**Priority:** Low

---

## Use Case Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EXAM SYSTEM USE CASES                     │
└─────────────────────────────────────────────────────────────┘

Student Journey:
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌─────────────┐
│ View Course │ ◄── UC-001: View Exam Info
└────┬────────┘
     │
     ▼
┌──────────────┐
│  Take Exam   │ ◄── UC-002: Complete Exam
└────┬────┬────┘
     │    │
PASS │    │ FAIL
     │    │
     ▼    ▼
┌─────────────┐
│View Results │ ◄── UC-003: Review Answers
└────┬────────┘
     │
     ├──► UC-004: Retake Exam (if failed)
     │
     └──► UC-006: Unlock Next MOOC (if passed)

Instructor Journey:
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌────────────────────┐
│ View Student Results│ ◄── UC-005: Instructor Review
└─────────────────────┘

System Processes:
- UC-006: Auto-unlock next MOOC
- UC-007: Error handling
```

---

## Test Execution Summary Template

| Use Case | Total Test Cases | Critical | High | Medium | Low |
|----------|------------------|----------|------|--------|-----|
| UC-001: View Exam Info | 2 | 0 | 1 | 1 | 0 |
| UC-002: Take Exam | 5 | 3 | 2 | 0 | 0 |
| UC-003: Review Results | 2 | 0 | 1 | 1 | 0 |
| UC-004: Retake Exam | 3 | 0 | 2 | 1 | 0 |
| UC-005: Instructor View | 1 | 0 | 0 | 1 | 0 |
| UC-006: Unlock MOOC | 2 | 2 | 0 | 0 | 0 |
| UC-007: Error Handling | 3 | 0 | 0 | 2 | 1 |
| **TOTAL** | **18** | **5** | **6** | **6** | **1** |

---

## Traceability Matrix

| Requirement | Use Case | Test Cases |
|-------------|----------|------------|
| REQ-001: Student can view exam info | UC-001 | TC-UC001-001, TC-UC001-002 |
| REQ-002: Student can take exam | UC-002 | TC-UC002-001 to TC-UC002-005 |
| REQ-003: Exam has timer | UC-002 | TC-UC002-003 |
| REQ-004: Auto-submit on expiry | UC-002 | TC-UC002-003 |
| REQ-005: Calculate score correctly | UC-002 | TC-UC002-001, TC-UC002-002 |
| REQ-006: Student can review answers | UC-003 | TC-UC003-001, TC-UC003-002 |
| REQ-007: Unlimited retakes allowed | UC-004 | TC-UC004-001, TC-UC004-002 |
| REQ-008: 5-minute cooldown | UC-004 | TC-UC004-003 |
| REQ-009: Unlock next MOOC on pass | UC-006 | TC-UC006-001, TC-UC006-002 |
| REQ-010: Error handling | UC-007 | TC-UC007-001 to TC-UC007-003 |

---

**Document Version:** 1.0  
**Last Updated:** November 12, 2025  
**Created by:** QA Team
