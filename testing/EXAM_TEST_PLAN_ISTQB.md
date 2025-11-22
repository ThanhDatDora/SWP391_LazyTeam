# TEST PLAN - EXAM SYSTEM MODULE
## Mini Coursera Platform
### Version 1.0 | November 2025

---

## 📋 TABLE OF CONTENTS
1. [Introduction](#1-introduction)
2. [Test Items](#2-test-items)
3. [Features to be Tested](#3-features-to-be-tested)
4. [Features NOT to be Tested](#4-features-not-to-be-tested)
5. [Test Approach](#5-test-approach)
6. [Test Deliverables](#6-test-deliverables)
7. [Test Environment](#7-test-environment)
8. [Roles and Responsibilities](#8-roles-and-responsibilities)
9. [Test Schedule](#9-test-schedule)
10. [Risks and Mitigation](#10-risks-and-mitigation)
11. [Approval](#11-approval)

---

## 1. INTRODUCTION

### 1.1 Purpose
This test plan document outlines the testing strategy, approach, resources, and schedule for testing the **Exam System Module** of the Mini Coursera e-learning platform. The document is prepared according to **ISTQB (International Software Testing Qualifications Board)** standards.

### 1.2 Scope
The Exam System Module allows learners to:
- View exam information and requirements
- Take timed multiple-choice exams
- Submit answers and receive instant results
- Review correct/incorrect answers
- Retake exams (if allowed)

### 1.3 Objectives
- Ensure exam functionality works correctly across all user flows
- Validate business logic (scoring, time limits, attempt limits)
- Verify data integrity and security
- Confirm UI/UX meets usability standards
- Achieve minimum 80% test coverage

### 1.4 References
- SRS (Software Requirements Specification) - Exam Module
- ISTQB Foundation Level Syllabus
- Project Architecture Documentation
- API Documentation

---

## 2. TEST ITEMS

### 2.1 Frontend Components (React)
| Component | File Path | Description |
|-----------|-----------|-------------|
| **ExamCard** | `src/components/exam/ExamCard.jsx` | Displays exam info in course sidebar |
| **ExamIntro** | `src/components/exam/ExamIntro.jsx` | Shows exam instructions before start |
| **ExamSession** | `src/components/exam/ExamSession.jsx` | Main exam interface with timer & questions |
| **ExamResult** | `src/components/exam/ExamResult.jsx` | Shows score and pass/fail status |
| **ExamReview** | `src/components/exam/ExamReview.jsx` | Displays correct answers for review |

### 2.2 Backend API Endpoints (Node.js/Express)
| Endpoint | Method | Controller | Description |
|----------|--------|------------|-------------|
| `/api/exams/mooc/:moocId` | GET | `examController.getExamByMooc` | Get exam information |
| `/api/exams/:examId/start` | POST | `examController.startExam` | Start exam & get questions |
| `/api/exams/:examId/submit` | POST | `examController.submitExam` | Submit answers & calculate score |
| `/api/exams/attempts/:attemptId/result` | GET | `examController.getExamResult` | Get exam results |
| `/api/learning/course/:courseId/progress` | GET | `examController.getCourseProgress` | Get course progress with exams |

### 2.3 Database Tables (SQL Server)
- `exams` - Exam metadata (duration, passing score, attempts allowed)
- `exam_questions` - Questions linked to exams
- `questions` - Question bank (text, options, correct answer)
- `exam_attempts` - User exam attempts (start time, end time, score)
- `exam_answers` - User answers for each question

---

## 3. FEATURES TO BE TESTED

### 3.1 Functional Features

#### 3.1.1 Exam Information Display (ExamCard)
- **F-001**: Display exam title, duration, question count
- **F-002**: Show prerequisites (lessons completed)
- **F-003**: Display previous attempt history
- **F-004**: Show best score and pass/fail status
- **F-005**: Enable/disable "Take Exam" button based on eligibility

#### 3.1.2 Exam Start (ExamIntro)
- **F-006**: Display exam instructions and rules
- **F-007**: Show exam duration and question count
- **F-008**: Warn about attempt limits
- **F-009**: Create new exam attempt on start
- **F-010**: Load randomized questions

#### 3.1.3 Taking Exam (ExamSession)
- **F-011**: Display questions one by one
- **F-012**: Show countdown timer (20 minutes)
- **F-013**: Allow answer selection (A/B/C/D)
- **F-014**: Navigate between questions (previous/next)
- **F-015**: Track answered vs unanswered questions
- **F-016**: Auto-submit when time expires
- **F-017**: Manual submit with confirmation
- **F-018**: Prevent page refresh during exam
- **F-019**: Save answers in real-time (optional)

#### 3.1.4 Exam Results (ExamResult)
- **F-020**: Calculate total score correctly
- **F-021**: Determine pass/fail (≥70% = pass)
- **F-022**: Show number of correct/incorrect answers
- **F-023**: Display time taken
- **F-024**: Allow review of answers
- **F-025**: Allow retake (if attempts remaining)

#### 3.1.5 Answer Review (ExamReview)
- **F-026**: Show all questions with user's answers
- **F-027**: Highlight correct/incorrect answers
- **F-028**: Display correct answer for each question
- **F-029**: Show explanation (if available)

### 3.2 Non-Functional Features

#### 3.2.1 Performance
- **NF-001**: Exam loads within 2 seconds
- **NF-002**: Answer submission responds within 1 second
- **NF-003**: Timer updates every second accurately

#### 3.2.2 Security
- **NF-004**: Authentication required for all exam APIs
- **NF-005**: User can only access their own exam attempts
- **NF-006**: Questions randomized per attempt
- **NF-007**: Correct answers not exposed in frontend code

#### 3.2.3 Usability
- **NF-008**: Clear instructions and UI labels
- **NF-009**: Responsive design (mobile/tablet/desktop)
- **NF-010**: Keyboard shortcuts supported (arrow keys, 1-4 for answers)

---

## 4. FEATURES NOT TO BE TESTED

### 4.1 Out of Scope
- Payment processing (tested separately)
- Course enrollment system (tested separately)
- User authentication/login (tested separately)
- Admin exam management UI (future feature)
- Essay/subjective questions (not implemented)
- Exam proctoring/cheating detection (future feature)

### 4.2 Deferred Testing
- Multi-language support for exams
- Accessibility compliance (WCAG)
- Browser compatibility (IE11 - not supported)

---

## 5. TEST APPROACH

### 5.1 Test Strategy - ISTQB Aligned

#### 5.1.1 Test Levels
1. **Unit Testing** (Individual functions/components)
   - Tools: Vitest, Jest, React Testing Library
   - Coverage target: 80%
   - Responsibility: Developers

2. **Integration Testing** (API + Database)
   - Tools: Postman, Supertest
   - Focus: API endpoints + database transactions
   - Responsibility: QA Team

3. **System Testing** (End-to-End)
   - Tools: Selenium WebDriver, Katalon Studio
   - Focus: Complete user workflows
   - Responsibility: QA Team

4. **Acceptance Testing** (UAT)
   - Tools: Manual testing + Jira
   - Focus: Business requirements validation
   - Responsibility: Product Owner + QA

#### 5.1.2 Test Design Techniques

**a) Decision Table Testing**
Used for: Exam eligibility, Pass/Fail logic

Example - Exam Eligibility Decision Table:
| Condition | TC1 | TC2 | TC3 | TC4 | TC5 | TC6 | TC7 | TC8 |
|-----------|-----|-----|-----|-----|-----|-----|-----|-----|
| Lessons Completed | Yes | Yes | Yes | Yes | No | No | No | No |
| Attempts < Max | Yes | Yes | No | No | Yes | Yes | No | No |
| Previous Pass | No | Yes | No | Yes | No | Yes | No | Yes |
| **Can Take Exam** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**b) Use Case Testing**
Used for: Complete exam workflows

UC-001: Learner Takes Exam First Time
- Precondition: Enrolled in course, completed all lessons
- Steps: View exam → Read instructions → Start → Answer questions → Submit
- Expected: Score calculated, result shown, attempt recorded

UC-002: Learner Retakes Failed Exam
- Precondition: Previously failed (score < 70%), attempts remaining
- Steps: View previous score → Click retake → Take exam → Submit
- Expected: New attempt created, questions randomized

UC-003: Auto-submit When Time Expires
- Precondition: Exam in progress, timer running
- Steps: Answer some questions → Wait for timer to reach 0:00
- Expected: Exam auto-submitted, score calculated with current answers

### 5.2 Test Execution Approach

#### 5.2.1 Test Cycles
- **Cycle 1**: Unit tests (developers) - Week 1
- **Cycle 2**: API integration tests - Week 2
- **Cycle 3**: UI automated tests (Selenium) - Week 3
- **Cycle 4**: Regression + UAT - Week 4

#### 5.2.2 Entry Criteria
- Code development complete and deployed to test environment
- Unit tests passing (≥80% coverage)
- Test environment ready (database seeded with test data)
- Test cases reviewed and approved

#### 5.2.3 Exit Criteria
- All critical and high-priority bugs fixed
- Test execution ≥95% complete
- Test pass rate ≥90%
- No open severity 1 (critical) bugs
- Regression tests passed

---

## 6. TEST DELIVERABLES

### 6.1 Before Testing
- ✅ Test Plan (this document)
- ✅ Test Case Specifications (Decision Table + Use Cases)
- ✅ Test Data (sample questions, users, courses)
- ✅ Test Environment Setup Guide

### 6.2 During Testing
- Test Execution Logs (Jira Test Execution)
- Bug Reports (Jira Issues)
- Daily Test Status Reports
- Test Coverage Reports (Vitest/Jest)

### 6.3 After Testing
- Test Summary Report
- Defect Summary Report
- Test Metrics (pass/fail rate, defect density)
- Lesson Learned Document

---

## 7. TEST ENVIRONMENT

### 7.1 Hardware
- **Client**: Windows 10/11, macOS, Android, iOS devices
- **Server**: AWS/Azure VM (4 vCPU, 8GB RAM)

### 7.2 Software
| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18.x | Backend runtime |
| React | 18.2 | Frontend framework |
| SQL Server | 2019/2022 | Database |
| Vitest | 1.x | Unit testing |
| Selenium | 4.x | E2E testing |
| Katalon Studio | 9.x | Test automation |
| Postman | Latest | API testing |
| Jira | Cloud | Test management |

### 7.3 Test Data
- 10 test courses with exams
- 50 sample questions (10 Easy, 30 Medium, 10 Hard)
- 5 test users (learner role)
- Previous exam attempts with various scores

---

## 8. ROLES AND RESPONSIBILITIES

| Role | Name | Responsibilities |
|------|------|------------------|
| **Test Manager** | [Name] | Overall test planning, coordination, reporting |
| **Test Lead** | [Name] | Test case design, execution tracking, defect triage |
| **Test Engineer 1** | [Name] | Unit tests (Vitest), API tests (Postman) |
| **Test Engineer 2** | [Name] | Selenium/Katalon automation |
| **Test Engineer 3** | [Name] | Manual testing, UAT support |
| **Developer** | [Name] | Unit tests, bug fixes, code reviews |
| **Product Owner** | [Name] | Requirements clarification, UAT approval |

---

## 9. TEST SCHEDULE

| Phase | Duration | Start Date | End Date | Deliverables |
|-------|----------|------------|----------|--------------|
| **Test Planning** | 2 days | Nov 11 | Nov 12 | Test Plan approved |
| **Test Design** | 3 days | Nov 13 | Nov 15 | Test Cases ready |
| **Test Execution - Cycle 1** | 5 days | Nov 16 | Nov 20 | Unit tests complete |
| **Test Execution - Cycle 2** | 5 days | Nov 21 | Nov 25 | API tests complete |
| **Test Execution - Cycle 3** | 5 days | Nov 26 | Nov 30 | E2E tests complete |
| **UAT + Regression** | 3 days | Dec 1 | Dec 3 | UAT sign-off |
| **Test Closure** | 1 day | Dec 4 | Dec 4 | Test Summary Report |

---

## 10. RISKS AND MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Test environment unstable** | Medium | High | Daily health checks, backup environment ready |
| **Incomplete test data** | Low | Medium | Automated data seeding scripts prepared |
| **Resource unavailability** | Medium | Medium | Cross-training team members |
| **Scope creep** | High | High | Strict change control process |
| **Automated tests brittle** | Medium | Medium | Page Object Model pattern, robust selectors |
| **Time constraints** | High | High | Prioritize critical features, parallel execution |

---

## 11. APPROVAL

This test plan is approved by:

| Name | Role | Signature | Date |
|------|------|-----------|------|
| [Name] | Test Manager | _________ | _______ |
| [Name] | Development Lead | _________ | _______ |
| [Name] | Product Owner | _________ | _______ |
| [Name] | Project Manager | _________ | _______ |

---

## 📌 APPENDICES

### Appendix A: Test Case Summary
- Total Test Cases: 60+
  - Unit Tests (Vitest): 28 backend + 33 frontend
  - Integration Tests: 15 API tests
  - E2E Tests (Selenium): 10 workflows
  - Manual Tests: 5 exploratory scenarios

### Appendix B: Defect Severity Classification
- **Severity 1 (Critical)**: System crash, data loss, security breach
- **Severity 2 (High)**: Major feature broken, no workaround
- **Severity 3 (Medium)**: Feature partially working, workaround exists
- **Severity 4 (Low)**: Cosmetic issues, minor inconvenience

### Appendix C: Test Metrics
- Defect Detection Rate (DDR)
- Test Case Pass/Fail Rate
- Defect Density (defects per KLOC)
- Test Coverage (code + requirements)

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Status**: Draft / Under Review  
**Next Review Date**: November 20, 2025
