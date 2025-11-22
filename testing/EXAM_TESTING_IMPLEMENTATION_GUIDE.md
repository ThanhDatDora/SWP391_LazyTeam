# EXAM SYSTEM - TESTING IMPLEMENTATION GUIDE
## Complete Testing Documentation for SWP391 Project
### Mini Coursera Platform | November 2025

---

## 📋 OVERVIEW

Tài liệu này tổng hợp toàn bộ testing cho **Exam System Module** theo yêu cầu môn SWP391:
1. ✅ Test Plan theo chuẩn ISTQB
2. ✅ NUnit/JUnit test cases (Unit Testing với Vitest)
3. ✅ Selenium/Katalon automation scripts
4. ✅ Decision Table Testing
5. ✅ Use Case Testing

---

## 🎯 YÊU CẦU MÔN HỌC

### Yêu cầu Team
- **Test Plan**: Viết theo chuẩn ISTQB (toàn team)
- **Test Tool**: Sử dụng Selenium hoặc Katalon (team/cá nhân)
- **Techniques**: Decision Table Testing, Use Case Testing

### Yêu cầu Cá nhân
- **Minimum**: Thực hiện tối thiểu 1 feature
- **Test Cases**: Viết test cases cho feature đó
- **Documentation**: Trình bày trong file Word
- **Presentation**: Thuyết trình bằng slides

---

## 📁 CẤU TRÚC TÀI LIỆU

### 1. Test Plan (ISTQB Standard)
**File**: `EXAM_TEST_PLAN_ISTQB.md`

**Nội dung**:
- Test objectives và scope
- Test items (components, APIs, database)
- Features to test / not to test
- Test approach (Unit, Integration, System, UAT)
- Test environment setup
- Roles & responsibilities
- Schedule & milestones
- Risks & mitigation
- Approval signatures

**Sử dụng**: 
- Team review chung trong meeting
- Test Manager approve
- Làm cơ sở cho toàn bộ testing activities

---

### 2. Test Cases - Decision Table & Use Cases
**File**: `EXAM_TEST_CASES_DECISION_TABLE.md`

**Nội dung**:

#### A. Decision Table Test Cases
- **DT-TC-001**: Exam Eligibility Logic (8 combinations)
- **DT-TC-002**: Exam Scoring Logic (7 score boundaries)
- **DT-TC-003**: Timer Auto-Submit Logic (6 scenarios)

**Example Decision Table**:
```
| Lessons Done | Attempts < Max | Previous Pass | Result |
|--------------|----------------|---------------|--------|
| ✅ Yes       | ✅ Yes         | ❌ No         | ✅ Can Take |
| ✅ Yes       | ✅ Yes         | ✅ Yes        | ❌ Cannot (Already passed) |
| ❌ No        | ✅ Yes         | ❌ No         | ❌ Cannot (Prerequisites) |
```

#### B. Use Case Test Cases
- **UC-TC-001**: First-Time Exam Taker (Happy Path)
  - 18 steps từ login → take exam → submit → review → verify status
- **UC-TC-002**: Learner Retakes Failed Exam
  - Verify score improvement, question randomization
- **UC-TC-003**: Auto-Submit on Timer Expiry
  - Test timer logic, partial answers handling

#### C. Boundary Value Test Cases
- Score boundaries: 69%, 70%, 71%, 0%, 100%
- Attempt limits: 0/3, 1/3, 2/3, 3/3
- Timer boundaries: 20:00, 10:00, 05:00, 01:00, 00:00

**Sử dụng**:
- Mỗi thành viên chọn 1 nhóm test cases
- Execute manually hoặc automated
- Record results trong Jira hoặc Excel

---

### 3. Selenium/Katalon Automation Scripts
**File**: `EXAM_SELENIUM_TEST_SCRIPTS.md`

**Nội dung**:

#### A. Selenium WebDriver Tests (JavaScript/Node.js)
- **SE-TC-001**: Complete Exam Flow (Happy Path)
  - Full automation từ login đến verify result
  - Code sample với assertions
- **SE-TC-002**: Timer Auto-Submit Test
  - Fast-forward timer hoặc wait real-time
- **SE-TC-003**: Keyboard Navigation Test
  - Arrow keys, number keys (1-4 or A-D)

#### B. Katalon Studio Tests (Groovy)
- Test cases với visual UI recording
- Object Repository structure
- Reusable keywords

#### C. Page Object Model
- ExamPage class với reusable methods
- Locators centralized
- Clean test code

**Sử dụng**:
- QA Engineer run automation tests
- Integrate vào CI/CD pipeline
- Generate test reports (HTML/JSON)

---

### 4. Unit Tests (Vitest - đã có sẵn)
**Files**:
- `testing/unit-tests/exam-api.test.js` - 28 backend API tests
- `testing/unit-tests/exam-components-ui.test.jsx` - 33 frontend component tests

**Running**:
```bash
# Run all tests
npm test

# Run exam tests only
npm test -- exam

# Run with coverage
npm test -- --coverage
```

**Results**: 61/61 tests passing ✅

---

## 🔧 HƯỚNG DẪN THỰC HIỆN

### Bước 1: Setup Environment (Team)

#### Backend Setup
```bash
cd backend
npm install
node server.js
# Server should run on http://localhost:3001
```

#### Frontend Setup
```bash
npm install
npm run dev
# Frontend should run on http://localhost:5173
```

#### Database Setup
```sql
-- Verify exam data exists
SELECT COUNT(*) FROM exams;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM exam_attempts;

-- Should have test data seeded
```

#### Test Tools Installation
```bash
# Selenium
npm install --save-dev selenium-webdriver chromedriver

# Or download Katalon Studio
# Visit: https://www.katalon.com/download/
```

---

### Bước 2: Phân Công Công Việc (Team)

#### Team Tasks
- [ ] Review Test Plan together (30 minutes)
- [ ] Approve test scope và approach
- [ ] Setup shared Jira project for test management
- [ ] Create test data in database

#### Individual Tasks (Example for 4 members)

**Member 1: Test Plan + Decision Table**
- [ ] Finalize Test Plan document
- [ ] Execute DT-TC-001: Eligibility Logic (8 test cases)
- [ ] Document results in Word file
- [ ] Create slides for presentation

**Member 2: Use Case Testing**
- [ ] Execute UC-TC-001: First-Time Taker (manual)
- [ ] Execute UC-TC-002: Retake Exam (manual)
- [ ] Record screen for demo
- [ ] Document results + slides

**Member 3: Selenium Automation**
- [ ] Write SE-TC-001: Complete Flow script
- [ ] Write SE-TC-002: Timer Auto-Submit
- [ ] Run tests and capture results
- [ ] Document automation approach + slides

**Member 4: Boundary Value + Reporting**
- [ ] Execute BV-TC-001: Score Boundaries
- [ ] Execute BV-TC-002: Attempt Limits
- [ ] Compile Test Summary Report
- [ ] Create final presentation slides

---

### Bước 3: Execute Test Cases (Individual)

#### Manual Testing Example

**Test Case**: DT-TC-001-1 (First Time Taker - Eligible)

**Execution Steps**:
1. Login as learner (huy484820@gmail.com / 123456)
2. Navigate to course: http://localhost:5173/learn/1
3. Scroll to exam section
4. **Verify**:
   - [ ] "Take Exam" button is enabled ✅
   - [ ] Shows "10 questions, 20 minutes"
   - [ ] Prerequisites: 5/5 lessons complete
   - [ ] Attempts: 0/3
5. Take screenshot for evidence
6. Record result: **PASS** ✅

**Document in Word**:
```
Test Case ID: DT-TC-001-1
Title: First Time Taker - Eligible
Date: November 13, 2025
Tester: [Your Name]
Result: PASS ✅

Evidence:
- Screenshot: exam-card-enabled.png
- Expected: Button enabled
- Actual: Button enabled ✅
- Notes: All prerequisites met
```

---

#### Automated Testing Example

**Run Selenium Test**:
```bash
# Navigate to test folder
cd testing/selenium

# Run test
node SE-TC-001-complete-exam-flow.test.js

# View console output
# Should see: "✅ All steps passed"
```

**Document Results**:
```
Test Case ID: SE-TC-001
Title: Complete Exam Flow - Automated
Tool: Selenium WebDriver
Date: November 13, 2025
Result: PASS ✅

Test Steps Automated:
1. Login ✅
2. Navigate to course ✅
3. Click Take Exam ✅
4. Start exam ✅
5. Answer 10 questions ✅
6. Submit exam ✅
7. Verify 80% score ✅
8. Review answers ✅
9. Verify status updated ✅

Execution Time: 45 seconds
Screenshots: /test-results/screenshots/
```

---

### Bước 4: Sử Dụng Jira (Team)

#### Setup Jira Project
1. Create project: "Mini Coursera Testing"
2. Create Test Plan epic
3. Add test cases as stories
4. Link test executions to stories

#### Example Jira Structure
```
📁 Epic: Exam System Test Plan
  ├── 📝 Story: DT-TC-001 - Eligibility Logic
  │   ├── Sub-task: DT-TC-001-1 [DONE] ✅
  │   ├── Sub-task: DT-TC-001-2 [DONE] ✅
  │   └── Sub-task: DT-TC-001-3 [IN PROGRESS] ⏳
  │
  ├── 📝 Story: UC-TC-001 - First Time Taker
  │   └── Sub-task: Manual execution [DONE] ✅
  │
  ├── 📝 Story: SE-TC-001 - Selenium Automation
  │   └── Sub-task: Script development [DONE] ✅
  │
  └── 📊 Story: Test Summary Report
      └── Sub-task: Compile results [TODO] 📋
```

#### Jira Test Execution
1. Move story to "In Progress"
2. Add comment with test results
3. Attach screenshots/logs
4. Update status: Pass/Fail
5. Link bugs if found

---

### Bước 5: Document Results (Individual)

#### Word Document Structure

**File Name**: `[Your_Name]_Exam_Testing_Report.docx`

**Template**:
```
MINI COURSERA - EXAM SYSTEM TESTING REPORT
Student: [Your Name]
Student ID: [ID]
Date: November 13, 2025

1. INTRODUCTION
   - Feature tested: Exam System
   - Testing techniques: Decision Table, Use Case
   - Tools: Selenium WebDriver, Vitest

2. TEST PLAN SUMMARY
   - Objectives
   - Scope
   - Test approach

3. TEST CASES EXECUTED
   3.1 Decision Table Test Cases
       - DT-TC-001-1: Eligibility - First Time (PASS ✅)
         • Screenshots
         • Expected vs Actual
       - DT-TC-001-2: Eligibility - Already Passed (PASS ✅)

   3.2 Use Case Test Cases
       - UC-TC-001: Complete Exam Flow (PASS ✅)
         • Step-by-step results
         • API request/response logs

4. AUTOMATED TESTS
   - Selenium scripts developed
   - Execution results
   - Code snippets

5. DEFECTS FOUND
   - Bug ID: BUG-001
   - Title: Timer shows incorrect format
   - Severity: Low
   - Status: Fixed

6. TEST METRICS
   - Total test cases: 15
   - Passed: 14 (93%)
   - Failed: 1 (7%)
   - Blocked: 0

7. CONCLUSION
   - Summary of findings
   - Recommendations

8. APPENDIX
   - Screenshots
   - Code listings
   - API logs
```

---

#### PowerPoint Slides Structure

**File Name**: `[Your_Name]_Exam_Testing_Presentation.pptx`

**Slide Outline**:
```
Slide 1: Title
- Mini Coursera - Exam System Testing
- Your Name
- November 2025

Slide 2: Testing Objectives
- Test exam functionality
- Validate business logic
- Ensure data integrity

Slide 3: Testing Approach
- Decision Table Testing
- Use Case Testing
- Automated Testing (Selenium)

Slide 4: Decision Table Example
- Table showing all combinations
- Highlight test cases executed

Slide 5: Use Case Flow
- Flowchart of exam workflow
- Screenshots of each step

Slide 6: Automated Testing
- Selenium script snippet
- Execution screenshot
- Video demo (optional)

Slide 7: Test Results
- Pie chart: Pass/Fail ratio
- Bar chart: Test execution time

Slide 8: Defects Found
- List of bugs with severity
- Screenshots of issues

Slide 9: Challenges & Lessons Learned
- Timer auto-submit was complex
- Learned Selenium WebDriver
- Improved understanding of testing

Slide 10: Conclusion
- 93% pass rate achieved
- Feature ready for production
- Thank you!
```

---

### Bước 6: Demo & Presentation (Individual)

#### Chuẩn Bị Demo
1. **Video Recording**: 
   - Record screen executing test cases
   - Show manual + automated tests
   - Duration: 3-5 minutes

2. **Live Demo**:
   - Practice run before presentation
   - Have backup screenshots if demo fails
   - Prepare Q&A answers

#### Presentation Tips
- **Time**: 10-15 minutes per person
- **Focus**: Show testing techniques, not just results
- **Evidence**: Screenshots, code, videos
- **Explain**: Why this test is important
- **Metrics**: Numbers make it professional

---

## 📊 TEST SUMMARY TEMPLATE

### Test Execution Summary Report

**Project**: Mini Coursera - Exam System  
**Test Phase**: System Testing  
**Date**: November 13-20, 2025

#### Test Statistics
| Metric | Value |
|--------|-------|
| **Total Test Cases** | 60 |
| **Executed** | 58 (97%) |
| **Passed** | 55 (95%) |
| **Failed** | 3 (5%) |
| **Blocked** | 0 (0%) |
| **Not Executed** | 2 (3%) |

#### Test Coverage
| Feature | Test Cases | Pass | Fail |
|---------|------------|------|------|
| Exam Eligibility | 8 | 8 | 0 |
| Exam Taking | 15 | 14 | 1 |
| Scoring Logic | 7 | 7 | 0 |
| Timer Function | 6 | 5 | 1 |
| Answer Review | 5 | 5 | 0 |

#### Defect Summary
| Severity | Open | Fixed | Total |
|----------|------|-------|-------|
| Critical | 0 | 1 | 1 |
| High | 0 | 2 | 2 |
| Medium | 1 | 4 | 5 |
| Low | 2 | 8 | 10 |

#### Test Environment
- Backend: Node.js 18.x, SQL Server 2022
- Frontend: React 18.2, Vite 5.4
- Browser: Chrome 119, Firefox 120
- OS: Windows 11, macOS 14

#### Conclusion
- Feature is **READY FOR PRODUCTION** ✅
- All critical bugs fixed
- 95% pass rate exceeds target (90%)
- No blocking issues

#### Recommendations
1. Fix remaining medium severity bugs
2. Add more timer edge case tests
3. Automate all manual tests
4. Integrate with CI/CD pipeline

---

## 🎓 GRADING RUBRIC

### Scoring Criteria (Example)

| Criteria | Points | Your Score |
|----------|--------|------------|
| **Test Plan Quality** | 20 | ___ |
| - ISTQB compliance | 10 | ___ |
| - Completeness | 10 | ___ |
| **Test Cases Design** | 30 | ___ |
| - Decision Table | 10 | ___ |
| - Use Case Testing | 10 | ___ |
| - Coverage | 10 | ___ |
| **Test Execution** | 20 | ___ |
| - Manual tests | 10 | ___ |
| - Automated tests | 10 | ___ |
| **Documentation** | 15 | ___ |
| - Word report | 7 | ___ |
| - Slides | 8 | ___ |
| **Presentation** | 15 | ___ |
| - Clarity | 5 | ___ |
| - Demo | 5 | ___ |
| - Q&A | 5 | ___ |
| **TOTAL** | **100** | ___ |

---

## 📞 SUPPORT & REFERENCES

### Tài Liệu Tham Khảo
1. **ISTQB Foundation Syllabus**: https://www.istqb.org/
2. **Selenium Documentation**: https://www.selenium.dev/documentation/
3. **Katalon Studio Docs**: https://docs.katalon.com/
4. **Vitest Documentation**: https://vitest.dev/
5. **Jira Test Management**: https://www.atlassian.com/software/jira

### Code Repository
- **GitHub**: https://github.com/ThanhDatDora/SWP391_LazyTeam
- **Branch**: `huy`
- **Test Folder**: `/testing/`

### Contact
- **Test Lead**: [Name]
- **Email**: [email@domain.com]
- **Slack**: #testing-channel

---

## ✅ CHECKLIST

### Before Submission
- [ ] Test Plan document complete và approved
- [ ] All test cases executed và documented
- [ ] Screenshots/videos captured
- [ ] Word report written (15+ pages)
- [ ] PowerPoint slides created (10+ slides)
- [ ] Code committed to GitHub
- [ ] Jira test results updated
- [ ] Demo prepared và tested
- [ ] Presentation rehearsed

### During Presentation
- [ ] Introduce yourself và feature
- [ ] Explain testing approach
- [ ] Show test plan highlights
- [ ] Demo test execution (manual + auto)
- [ ] Present results và metrics
- [ ] Discuss challenges
- [ ] Answer questions confidently

### After Submission
- [ ] Upload all files to LMS
- [ ] Backup files locally
- [ ] Thank team members
- [ ] Celebrate! 🎉

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Status**: Ready for Team Review  
**Next Steps**: Execute tests và document results

---

**Good luck với testing! 🚀**
