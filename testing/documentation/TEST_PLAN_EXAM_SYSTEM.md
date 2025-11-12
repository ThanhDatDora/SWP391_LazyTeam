# Test Plan - Exam System Module
**Project:** Mini Coursera - E-Learning Platform  
**Module:** Exam System  
**Version:** 1.0  
**Date:** November 12, 2025  
**Prepared by:** [Your Team Name]

---

## 1. Introduction

### 1.1 Purpose
This test plan describes the testing strategy, approach, resources, and schedule for testing the Exam System module of the Mini Coursera platform according to ISTQB standards.

### 1.2 Scope
**In Scope:**
- Exam viewing and information display
- Exam start functionality
- Question navigation and answer selection
- Timer functionality
- Exam submission and grading
- Results display
- Exam review functionality
- API integration testing
- Database operations testing
- Frontend component testing
- End-to-end user flows

**Out of Scope:**
- Performance testing
- Security penetration testing
- Load testing beyond basic scenarios
- Mobile app testing (web responsive only)

### 1.3 Quality Objectives
- **Functional Correctness:** 100% of critical features must work as specified
- **Defect Density:** < 5 defects per 1000 lines of code
- **Test Coverage:** Minimum 80% code coverage for unit tests
- **Pass Rate:** ≥ 95% test cases must pass before release

### 1.4 Test Deliverables
- Test Plan document (this document)
- Test Cases with Decision Tables
- Use Case Test Scenarios
- Unit Test Code (Jest)
- E2E Test Scripts (Selenium/Katalon)
- Test Execution Report
- Defect Report
- Test Summary Report

---

## 2. Test Strategy

### 2.1 Test Levels

#### 2.1.1 Unit Testing
- **Tool:** Jest + React Testing Library
- **Coverage:** Individual functions, components, and API endpoints
- **Responsibility:** Individual developers
- **Target:** 80% code coverage

#### 2.1.2 Integration Testing
- **Tool:** Jest + Supertest
- **Coverage:** API endpoints with database
- **Responsibility:** Backend developers
- **Target:** All API endpoints tested

#### 2.1.3 System Testing
- **Tool:** Selenium WebDriver / Katalon Studio
- **Coverage:** Complete user workflows
- **Responsibility:** QA Team
- **Target:** All critical paths tested

#### 2.1.4 Acceptance Testing
- **Tool:** Manual testing
- **Coverage:** Business requirements validation
- **Responsibility:** Product Owner + QA
- **Target:** All acceptance criteria met

### 2.2 Test Types

| Test Type | Description | Tool | Priority |
|-----------|-------------|------|----------|
| Functional Testing | Verify features work as specified | Jest, Selenium | High |
| Regression Testing | Ensure new changes don't break existing features | Jest, Katalon | High |
| Usability Testing | Evaluate user interface and experience | Manual | Medium |
| Compatibility Testing | Test across browsers (Chrome, Firefox, Edge) | Selenium | Medium |
| API Testing | Validate backend endpoints | Jest, Postman | High |
| Database Testing | Verify data integrity and queries | SQL Scripts | High |

### 2.3 Test Design Techniques

#### 2.3.1 Decision Table Testing
Used for testing exam eligibility, grading logic, and validation rules.

#### 2.3.2 Use Case Testing
Used for end-to-end user scenarios like "Student takes exam" and "Student reviews results".

#### 2.3.3 Boundary Value Analysis
Used for testing timer limits, score calculations, and attempt counts.

#### 2.3.4 Equivalence Partitioning
Used for testing different question types and answer formats.

---

## 3. Test Items

### 3.1 Frontend Components
- `ExamCard.jsx` - Exam information display
- `ExamIntro.jsx` - Pre-exam instructions
- `ExamSession.jsx` - Exam taking interface
- `ExamResult.jsx` - Results display
- `ExamReview.jsx` - Answer review

### 3.2 Backend API Endpoints
- `GET /api/learning/exams/mooc/:moocId` - Get exam info
- `POST /api/learning/exams/:examId/start` - Start exam
- `POST /api/learning/exams/:examId/submit` - Submit exam
- `GET /api/learning/exams/attempts/:attemptId/result` - Get result
- `GET /api/learning/course/:courseId/progress` - Get progress

### 3.3 Database Tables
- `exams` - Exam definitions
- `questions` - Question bank
- `question_options` - Answer choices
- `exam_attempts` - User exam sessions
- `enrollments` - User progress tracking

### 3.4 Business Logic
- Exam eligibility validation
- Timer countdown logic
- Score calculation algorithm
- Pass/fail determination
- Progress unlocking logic

---

## 4. Features to be Tested

### 4.1 Critical Features (Priority 1)
| Feature | Description | Test Approach |
|---------|-------------|---------------|
| Start Exam | User can initiate an exam session | Functional, E2E |
| Answer Questions | User can select and change answers | Functional, E2E |
| Timer Countdown | Timer counts down correctly | Unit, E2E |
| Submit Exam | User can submit completed exam | Functional, E2E |
| Auto-Submit | Exam submits automatically at time expiry | Integration, E2E |
| Score Calculation | Correct score computed based on answers | Unit, Decision Table |
| Pass/Fail Logic | Pass status determined correctly (≥70%) | Unit, Boundary Value |
| Results Display | Accurate results shown to user | Functional, E2E |

### 4.2 High Priority Features (Priority 2)
| Feature | Description | Test Approach |
|---------|-------------|---------------|
| Exam Eligibility | Only eligible students can start exam | Decision Table |
| Question Navigation | Previous/Next buttons work correctly | Functional |
| Answer Review | User can review answers after submission | Functional, E2E |
| Progress Update | Course progress updates after passing | Integration |
| MOOC Unlocking | Next MOOC unlocks after passing exam | Integration |
| Attempt History | Previous attempts tracked correctly | Database |

### 4.3 Medium Priority Features (Priority 3)
| Feature | Description | Test Approach |
|---------|-------------|---------------|
| Exam Info Display | Correct exam details shown | Functional |
| Question Randomization | Questions shuffled randomly | Unit |
| Option Randomization | Answer options shuffled | Unit |
| Time Limit Warning | User warned when time running out | Functional |
| Unsaved Warning | Warning when leaving exam | Functional |

---

## 5. Features NOT to be Tested
- Third-party authentication services (Google OAuth)
- Payment processing (Stripe integration)
- Email notification services
- Video streaming infrastructure
- Content Management System (CMS)

---

## 6. Test Approach

### 6.1 Unit Testing Approach
```javascript
// Example: Test score calculation
describe('Exam Score Calculation', () => {
  test('should calculate 100% for all correct answers', () => {
    const answers = generateAllCorrectAnswers(10);
    const score = calculateScore(answers);
    expect(score).toBe(100);
  });
  
  test('should calculate 70% for 7 correct answers', () => {
    const answers = generate7CorrectAnswers(10);
    const score = calculateScore(answers);
    expect(score).toBe(70);
  });
});
```

### 6.2 Integration Testing Approach
```javascript
// Example: Test exam submission API
describe('POST /api/learning/exams/:examId/submit', () => {
  test('should accept valid submission and return score', async () => {
    const response = await request(app)
      .post('/api/learning/exams/123/submit')
      .send({ attempt_id: 456, answers: [...] })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.score).toBeDefined();
  });
});
```

### 6.3 E2E Testing Approach (Selenium/Katalon)
1. Login as student
2. Navigate to course
3. Click "Take Exam" button
4. Answer all questions
5. Submit exam
6. Verify results page displays
7. Verify score is correct

---

## 7. Test Environment

### 7.1 Hardware Requirements
- **Development PC:** Windows 10/11, 8GB RAM, i5 processor
- **Test Server:** Windows Server 2019/2022, 16GB RAM
- **Database Server:** SQL Server 2019/2022

### 7.2 Software Requirements
- **Frontend:** React 18.2, Vite 5.4, Node.js 18+
- **Backend:** Node.js 18+, Express 4.18
- **Database:** Microsoft SQL Server 2019+
- **Browsers:** Chrome 120+, Firefox 120+, Edge 120+
- **Testing Tools:**
  - Jest 30.2.0
  - React Testing Library 16.3.0
  - Selenium WebDriver 4.x OR Katalon Studio 9.x
  - Supertest 7.1.4

### 7.3 Test Data
- **Test Users:**
  - Student 1: `huy484820@gmail.com` / `Learner@123`
  - Student 2: `test.student@example.com` / `Student@123`
  - Instructor: `instructor@example.com` / `Instr@123`
  - Admin: `admin@example.com` / `123456`
  
- **Test Courses:** Minimum 3 courses with exam data
- **Test Questions:** Minimum 50 questions across 5 MOOCs
- **Test Database:** Separate test database (MiniCoursera_Test)

---

## 8. Test Schedule

| Phase | Activities | Duration | Responsible |
|-------|-----------|----------|-------------|
| Test Planning | Create test plan, review | 2 days | QA Lead |
| Test Design | Write test cases, decision tables | 3 days | QA Team |
| Unit Test Development | Write Jest tests | 4 days | Developers |
| E2E Test Development | Create Selenium/Katalon scripts | 3 days | QA Team |
| Test Execution | Run all tests, log defects | 5 days | QA Team |
| Defect Fixing | Fix bugs, retest | 4 days | Developers |
| Regression Testing | Rerun all tests | 2 days | QA Team |
| Test Reporting | Create test summary | 1 day | QA Lead |
| **Total** | | **24 days** | |

---

## 9. Entry and Exit Criteria

### 9.1 Entry Criteria
- [ ] All exam system code committed to repository
- [ ] Development environment set up and accessible
- [ ] Test database created with sample data
- [ ] Test plan reviewed and approved
- [ ] Test cases designed and reviewed
- [ ] Testing tools installed and configured

### 9.2 Exit Criteria
- [ ] 100% of critical test cases executed
- [ ] ≥95% of all test cases passed
- [ ] All Priority 1 defects fixed and retested
- [ ] ≥80% code coverage achieved for unit tests
- [ ] All E2E critical paths validated
- [ ] Test summary report approved by stakeholders
- [ ] No open blocker or critical defects

---

## 10. Suspension and Resumption Criteria

### 10.1 Suspension Criteria
Testing will be suspended if:
- Critical defects block > 50% of test cases
- Test environment becomes unavailable for > 24 hours
- Database corruption prevents test execution
- Major code changes require test case redesign

### 10.2 Resumption Criteria
Testing will resume when:
- Critical defects are fixed and deployed
- Test environment is restored and validated
- Database is repaired and verified
- Updated test cases are reviewed and approved

---

## 11. Test Deliverables Schedule

| Deliverable | Due Date | Responsible |
|-------------|----------|-------------|
| Test Plan (this document) | Week 1, Day 2 | QA Lead |
| Test Cases with Decision Tables | Week 1, Day 5 | QA Team |
| Use Case Test Scenarios | Week 1, Day 5 | QA Team |
| Unit Tests (Jest) | Week 2, Day 4 | Developers |
| E2E Tests (Selenium/Katalon) | Week 2, Day 7 | QA Team |
| Test Execution Report | Week 3, Day 5 | QA Team |
| Defect Report | Week 4, Day 2 | QA Team |
| Test Summary Report | Week 4, Day 5 | QA Lead |

---

## 12. Roles and Responsibilities

| Role | Name | Responsibilities |
|------|------|------------------|
| Test Manager | [Team Lead] | Overall test planning, resource allocation, reporting |
| QA Lead | [QA Member 1] | Test case design, review, execution coordination |
| Test Engineer | [QA Member 2] | Write test cases, execute tests, log defects |
| Automation Engineer | [QA Member 3] | Create Selenium/Katalon scripts, maintain automation |
| Developer 1 | [Dev Member 1] | Write unit tests for frontend components |
| Developer 2 | [Dev Member 2] | Write unit tests for backend APIs |
| Developer 3 | [Dev Member 3] | Fix defects, support testing |

---

## 13. Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Database connection issues | High | Medium | Set up backup database, document connection procedures |
| Time limit for testing | High | High | Prioritize critical features, automate regression tests |
| Lack of test data | Medium | Low | Create data generation scripts, use SQL seed files |
| Selenium/Katalon learning curve | Medium | Medium | Provide training, pair programming, documentation |
| Environment instability | High | Medium | Create Docker containers, document setup steps |
| Scope creep | Medium | High | Strict change control, focus on defined scope |

---

## 14. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| QA Lead | | | |
| Development Lead | | | |
| Product Owner | | | |

---

## 15. References

- ISTQB Foundation Level Syllabus 2018
- IEEE 829-2008 Standard for Software Test Documentation
- Project Requirements Document
- Exam System Design Document (`EXAM_SYSTEM_DESIGN.md`)
- API Documentation
- Database Schema Document

---

## Appendix A: Glossary

- **MOOC:** Massive Open Online Course (module within a course)
- **Attempt:** A single exam session
- **Passing Score:** Minimum 70% to pass
- **Critical Path:** Essential user flow that must work
- **Code Coverage:** Percentage of code executed during tests
- **E2E:** End-to-End testing
- **SUT:** System Under Test

---

**Document Control**
- Version: 1.0
- Last Updated: November 12, 2025
- Next Review: Before each test cycle
- Document Owner: QA Lead
