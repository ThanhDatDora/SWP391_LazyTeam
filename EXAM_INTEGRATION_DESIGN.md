# Exam Integration Design Document

## 📋 Overview
This document outlines the complete design for integrating the exam system into the learning flow.

## 🎯 Learning Flow with Exam

```
Enroll Course → MOOC 1 → Lessons → Exam → Pass → MOOC 2 → ... → Certificate
                  ↓                    ↓
                Learn               Fail → Retry
```

## 🔄 Detailed User Journey

### Step 1: Course Enrollment
- Student enrolls in a course
- First MOOC is automatically unlocked
- Subsequent MOOCs are locked until previous exam is passed

### Step 2: Learning Phase
- Student accesses lessons within the MOOC
- Completes lessons (videos, assignments, quizzes)
- System tracks lesson completion progress

### Step 3: Exam Eligibility
**Unlock Criteria:**
- ✅ All lessons in current MOOC marked complete
- ✅ All assignments submitted (if any)
- ✅ All quizzes passed (if any)

**UI Changes:**
- "Take Exam" button becomes enabled
- Display exam info: questions count, duration, passing score

### Step 4: Exam Introduction
**Exam Intro Screen shows:**
- Exam title (MOOC name)
- Number of questions (10 questions per MOOC)
- Time limit (20 minutes)
- Passing score (70% = 7/10 correct)
- Rules: No pausing, no going back
- "Start Exam" button

### Step 5: Exam Session
**During Exam:**
- Timer countdown (20:00 → 0:00)
- Question counter (1/10, 2/10, ...)
- Question display with 4 options (A, B, C, D)
- "Next" button to move forward
- "Submit Exam" button on last question
- **Warning**: Cannot go back to previous questions
- **Auto-submit**: When timer reaches 0:00

### Step 6: Exam Submission
**On Submit:**
- Confirm dialog: "Are you sure?"
- Save all answers to database
- Calculate score immediately
- Record attempt details (time taken, score, timestamp)

### Step 7: Exam Results
**Result Screen shows:**
- Score: X/10 (XX%)
- Pass/Fail status
- Time taken
- **If PASS (≥70%):**
  - ✅ Success message
  - 🎉 Unlock next MOOC button
  - View detailed results option
- **If FAIL (<70%):**
  - ❌ Encouragement message
  - 📚 Retry exam button (no limit on attempts)
  - Review incorrect answers option

### Step 8: Progress Tracking
**System updates:**
- Mark exam as completed
- Update MOOC completion status
- Unlock next MOOC (if passed)
- Update overall course progress %
- Record in student transcript

### Step 9: Course Completion
**When all MOOCs passed:**
- Mark course as completed
- Calculate overall score (average of all exams)
- Generate completion certificate
- Send congratulations email
- Add certificate to student profile

---

## 🗄️ Database Schema Updates

### New Table: `exam_attempts`
```sql
CREATE TABLE exam_attempts (
  attempt_id INT PRIMARY KEY IDENTITY,
  user_id INT NOT NULL,
  mooc_id INT NOT NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME,
  time_taken INT, -- seconds
  total_questions INT NOT NULL,
  correct_answers INT,
  score DECIMAL(5,2), -- percentage
  passed BIT NOT NULL DEFAULT 0,
  answers NVARCHAR(MAX), -- JSON: [{question_id: 1, selected_option: 'A'}, ...]
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (mooc_id) REFERENCES moocs(mooc_id)
);
```

### Update Table: `enrollments`
```sql
ALTER TABLE enrollments ADD current_mooc_id INT;
ALTER TABLE enrollments ADD moocs_completed INT DEFAULT 0;
ALTER TABLE enrollments ADD overall_score DECIMAL(5,2);
```

---

## 🔌 Backend API Endpoints

### 1. Get Exam by MOOC
```
GET /api/exams/mooc/:moocId
Response: {
  success: true,
  data: {
    exam_id: 1,
    mooc_id: 3,
    mooc_name: "Introduction & Setup",
    total_questions: 10,
    duration_minutes: 20,
    passing_score: 70,
    can_take_exam: true, // based on lesson completion
    previous_attempts: 2,
    best_score: 65,
    last_attempt_date: "2025-11-03"
  }
}
```

### 2. Start Exam
```
POST /api/exams/:examId/start
Body: { mooc_id: 3 }
Response: {
  success: true,
  data: {
    attempt_id: 123,
    started_at: "2025-11-04T13:45:00",
    expires_at: "2025-11-04T14:05:00",
    questions: [
      {
        question_id: 45,
        stem: "What is React?",
        options: [
          { label: "A", content: "JavaScript library", is_correct: false },
          { label: "B", content: "Framework", is_correct: false },
          { label: "C", content: "Database", is_correct: false },
          { label: "D", content: "Server", is_correct: false }
        ]
      },
      // ... 9 more questions (correct answers NOT sent)
    ]
  }
}
```

### 3. Submit Exam
```
POST /api/exams/:examId/submit
Body: {
  attempt_id: 123,
  answers: [
    { question_id: 45, selected_option: "A" },
    { question_id: 46, selected_option: "B" },
    // ... all 10 answers
  ]
}
Response: {
  success: true,
  data: {
    attempt_id: 123,
    score: 80,
    correct_answers: 8,
    total_questions: 10,
    passed: true,
    time_taken: 1140, // seconds
    next_mooc_unlocked: true
  }
}
```

### 4. Get Exam Result
```
GET /api/exams/attempts/:attemptId/result
Response: {
  success: true,
  data: {
    attempt_id: 123,
    score: 80,
    passed: true,
    submitted_at: "2025-11-04T14:04:00",
    time_taken: 1140,
    detailed_results: [
      {
        question_id: 45,
        stem: "What is React?",
        selected_option: "A",
        correct_option: "A",
        is_correct: true
      },
      // ... all 10 with correct/incorrect
    ]
  }
}
```

### 5. Get Student Progress
```
GET /api/learning/course/:courseId/progress
Response: {
  success: true,
  data: {
    course_id: 2,
    current_mooc: {
      mooc_id: 3,
      name: "Introduction & Setup",
      lessons_completed: 5,
      total_lessons: 5,
      exam_status: "not_taken" // "not_taken" | "failed" | "passed"
    },
    all_moocs: [
      {
        mooc_id: 3,
        name: "Introduction & Setup",
        status: "completed",
        exam_passed: true,
        exam_score: 80
      },
      {
        mooc_id: 4,
        name: "Advanced Concepts",
        status: "locked",
        exam_passed: false,
        exam_score: null
      }
    ],
    overall_progress: 45, // percentage
    certificate_available: false
  }
}
```

---

## 🎨 Frontend Components

### 1. ExamCard Component
**Location**: `src/components/learning/ExamCard.jsx`
**Purpose**: Display exam info and "Take Exam" button

```jsx
<ExamCard
  moocId={3}
  questionsCount={10}
  duration={20}
  passingScore={70}
  canTakeExam={true}
  previousAttempts={2}
  bestScore={65}
  onStartExam={handleStartExam}
/>
```

### 2. ExamIntro Component
**Location**: `src/components/exam/ExamIntro.jsx`
**Purpose**: Show exam rules and start button

### 3. ExamSession Component
**Location**: `src/components/exam/ExamSession.jsx`
**Purpose**: Handle exam taking flow
- Timer
- Question navigation
- Answer selection
- Submit

### 4. ExamResult Component
**Location**: `src/components/exam/ExamResult.jsx`
**Purpose**: Display results
- Score
- Pass/Fail
- Next steps

### 5. ExamReview Component
**Location**: `src/components/exam/ExamReview.jsx`
**Purpose**: Show detailed answers
- Correct/Incorrect
- Explanations

---

## 🔐 Business Rules

### Exam Eligibility
- ✅ All lessons in MOOC must be completed
- ✅ All assignments must be submitted
- ✅ Student must be enrolled in course

### Exam Attempts
- ✅ **Unlimited attempts** allowed
- ✅ Best score is recorded
- ✅ Must wait 5 minutes between attempts

### Scoring
- ✅ Each question worth 10 points (10 questions = 100 points)
- ✅ Passing score: 70% (7/10 correct)
- ✅ Score rounded to 2 decimal places

### Time Limits
- ✅ 20 minutes per exam
- ✅ Timer cannot be paused
- ✅ Auto-submit when time expires
- ✅ Warning at 5 minutes remaining

### Progression
- ✅ Must pass exam to unlock next MOOC
- ✅ Cannot skip exams
- ✅ Can review previous exam results anytime

### Cheating Prevention
- ✅ Cannot go back to previous questions
- ✅ Tab switching logged (warning only, no penalty)
- ✅ Questions randomized per attempt
- ✅ Option order randomized

---

## 📱 UI/UX Considerations

### Exam Button States
- **Locked**: Gray, disabled, "Complete all lessons first"
- **Available**: Green, enabled, "Take Exam"
- **Failed**: Orange, enabled, "Retry Exam"
- **Passed**: Blue, disabled, "Exam Passed ✓"

### Visual Feedback
- ✅ Progress bar during exam
- ✅ Timer color changes (green → yellow → red)
- ✅ Question counter (3/10)
- ✅ Selected answer highlighted
- ✅ Success/fail animations

### Accessibility
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Font size adjustments

### Mobile Responsive
- ✅ Touch-friendly buttons
- ✅ Readable timer
- ✅ Easy answer selection
- ✅ Portrait/landscape support

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Exam eligibility logic
- [ ] Score calculation
- [ ] Timer countdown
- [ ] Auto-submit on timeout

### Integration Tests
- [ ] Start exam API
- [ ] Submit exam API
- [ ] Progress update
- [ ] MOOC unlock

### E2E Tests
- [ ] Complete learning flow
- [ ] Pass exam → unlock next MOOC
- [ ] Fail exam → retry
- [ ] Complete course → certificate

### Edge Cases
- [ ] Browser refresh during exam
- [ ] Network disconnection
- [ ] Concurrent attempts
- [ ] Timer edge cases

---

## 📊 Success Metrics

### Performance
- Exam load time: < 2 seconds
- Submit response time: < 1 second
- No errors during submission

### User Experience
- Exam completion rate: > 80%
- Average time to complete: 15-18 minutes
- Retry rate: < 30%

### Quality
- Question accuracy: 100%
- Correct answer validation: 100%
- Progress tracking accuracy: 100%

---

## 🚀 Implementation Priority

### Phase 2.1: Design (Current) ✅
- [x] Define user flow
- [x] Design database schema
- [x] Plan API endpoints
- [x] Sketch UI components

### Phase 2.2: Backend APIs
- [ ] Create exam_attempts table
- [ ] Implement GET /exams/mooc/:moocId
- [ ] Implement POST /exams/:examId/start
- [ ] Implement POST /exams/:examId/submit
- [ ] Implement GET /exams/attempts/:attemptId/result
- [ ] Add progress tracking logic

### Phase 2.3: Frontend Components
- [ ] Create ExamCard component
- [ ] Create ExamIntro component
- [ ] Create ExamSession component
- [ ] Create ExamResult component
- [ ] Integrate into LearningPage

### Phase 2.4: Progress Tracking
- [ ] Update enrollment progress
- [ ] Implement MOOC unlock logic
- [ ] Track exam attempts
- [ ] Calculate overall score

### Phase 2.5: UI/UX Polish
- [ ] Add animations
- [ ] Implement timer
- [ ] Add sound effects (optional)
- [ ] Mobile optimization
- [ ] Accessibility features

---

## 📝 Notes

- Keep questions randomized to prevent memorization
- Store all attempts for analytics
- Consider adding exam analytics dashboard for instructors
- Future: Add essay questions, code challenges
- Future: Proctoring features for high-stakes exams

---

**Created**: November 4, 2025  
**Last Updated**: November 4, 2025  
**Status**: Phase 2.1 Complete - Ready for Phase 2.2
