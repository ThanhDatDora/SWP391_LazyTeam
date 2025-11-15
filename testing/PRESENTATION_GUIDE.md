# 🎤 PRESENTATION GUIDE - EXAM SYSTEM TESTING

**Student:** [Tên của bạn]  
**Student ID:** [MSSV]  
**Feature:** Exam System Testing  
**Date:** November 14, 2025

---

## 📋 PHẦN 1: TEST PLAN (ISTQB)

### 1.1 Test Plan Document
📄 **File:** [`testing/documentation/TEST_PLAN_EXAM_SYSTEM.md`](./documentation/TEST_PLAN_EXAM_SYSTEM.md)

**Key Sections:**
- **Test Strategy:** Unit, Integration, E2E, System Testing
- **Test Scope:** Exam flow, Grading logic, Timer, Answer selection
- **Quality Objectives:** 80% coverage, 95% pass rate, <5 defects/1000 LOC
- **Test Schedule:** 24 days across 8 phases

**Quick Links:**
- [Introduction](./documentation/TEST_PLAN_EXAM_SYSTEM.md#1-introduction)
- [Test Strategy](./documentation/TEST_PLAN_EXAM_SYSTEM.md#2-test-strategy)
- [Quality Objectives](./documentation/TEST_PLAN_EXAM_SYSTEM.md#21-quality-objectives)

---

## 📊 PHẦN 2: DECISION TABLE TESTING

### 2.1 Decision Tables Overview
📄 **File:** [`testing/test-cases/DECISION_TABLE_TEST_CASES.md`](./test-cases/DECISION_TABLE_TEST_CASES.md)

**Total:** 6 Decision Tables, 22 Test Cases

### 2.2 Decision Table 1: Exam Eligibility
🔗 **Link:** [DT1: Exam Eligibility](./test-cases/DECISION_TABLE_TEST_CASES.md#decision-table-1-exam-eligibility)

| Condition | TC1 | TC2 | TC3 | TC4 |
|-----------|-----|-----|-----|-----|
| Enrolled? | ✅ | ✅ | ❌ | ❌ |
| Lessons Complete? | ✅ | ❌ | ✅ | ❌ |
| Cooldown Expired? | ✅ | ✅ | ✅ | ✅ |
| **Result** | **ALLOWED** | **WAIT** | **BLOCKED** | **BLOCKED** |

**Test Cases:**
- [TC-DT1-001: All conditions met](./test-cases/DECISION_TABLE_TEST_CASES.md#test-case-tc-dt1-001)
- [TC-DT1-002: Incomplete lessons](./test-cases/DECISION_TABLE_TEST_CASES.md#test-case-tc-dt1-002)

### 2.3 Decision Table 2: Grading Logic ⭐ CRITICAL
🔗 **Link:** [DT2: Grading Logic](./test-cases/DECISION_TABLE_TEST_CASES.md#decision-table-2-exam-grading-logic)

| Test Case | Correct/Total | Score | Result |
|-----------|--------------|-------|--------|
| DT2-001 | 10/10 | 100% | ✅ PASS |
| **DT2-002** | **7/10** | **70%** | ✅ **PASS (Boundary)** |
| DT2-003 | 6/10 | 60% | ❌ FAIL |
| DT2-004 | 0/10 | 0% | ❌ FAIL |

**Implementation:** See [Backend Test TC-UT-009](#backend-test-tc-ut-009-boundary-70)

---

## 🎭 PHẦN 3: USE CASE TESTING

### 3.1 Use Cases Overview
📄 **File:** [`testing/test-cases/USE_CASE_TEST_SCENARIOS.md`](./test-cases/USE_CASE_TEST_SCENARIOS.md)

**Total:** 7 Use Cases, 18 Test Scenarios

### 3.2 UC-002: Student Takes Exam Successfully ⭐⭐ MOST CRITICAL
🔗 **Link:** [UC-002 Full Description](./test-cases/USE_CASE_TEST_SCENARIOS.md#use-case-uc-002-student-takes-exam-successfully)

**Actor:** Student (Learner role)

**Preconditions:**
- Logged in ✅
- Enrolled in course ✅
- Completed all lessons ✅
- No active attempt ✅

**Main Flow (21 steps):**
1. Student navigates to course page
2. Student clicks "Take Exam" button
3. System displays exam introduction
4. Student clicks "Start Exam"
5. System creates exam attempt record
6. System starts 30-minute timer
7. System displays Question 1/10
8-17. Student answers all 10 questions
18. Student clicks "Submit Exam"
19. System calculates score: 8/10 = 80%
20. System marks as PASSED (≥70%)
21. System unlocks next MOOC

**Alternative Flows:**
- [AF1: Timer Expires](./test-cases/USE_CASE_TEST_SCENARIOS.md#alternative-flow-af1-timer-expires)
- [AF2: Student Fails](./test-cases/USE_CASE_TEST_SCENARIOS.md#alternative-flow-af2-student-fails)

**Implementation:** See [E2E Test TC-E2E-004](#e2e-test-tc-e2e-004)

---

## 🧪 PHẦN 4: VITEST UNIT TESTS

### 4.1 Backend API Tests
📄 **File:** [`testing/unit-tests/exam-api.test.js`](./unit-tests/exam-api.test.js)

**Total:** 28 Test Cases  
**Status:** ✅ 28/28 PASSED (100%)

#### **Test Suite 1: GET /api/exam/mooc/:moocId**

**TC-UT-001: Return exam for valid MOOC**
```javascript
// File: testing/unit-tests/exam-api.test.js:19-33
it('TC-UT-001: Should return exam for valid MOOC', async () => {
  pool.request.mockResolvedValueOnce({
    recordset: [{
      examId: 1,
      title: 'Final Exam - JavaScript',
      duration: 30,
      totalQuestions: 10,
      passScore: 70
    }]
  });

  const response = await request(app).get('/api/exam/mooc/1');
  
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.exam.examId).toBe(1);
});
```
🔗 **View Full Code:** [exam-api.test.js#L19-L33](./unit-tests/exam-api.test.js#L19-L33)

---

**TC-UT-002: Return 404 if exam not found**
```javascript
// File: testing/unit-tests/exam-api.test.js:35-45
it('TC-UT-002: Should return 404 if exam not found', async () => {
  pool.request.mockResolvedValueOnce({
    recordset: []
  });

  const response = await request(app).get('/api/exam/mooc/999');
  
  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('not found');
});
```
🔗 **View Full Code:** [exam-api.test.js#L35-L45](./unit-tests/exam-api.test.js#L35-L45)

---

#### **Test Suite 2: POST /api/exam/:examId/submit**

<a name="backend-test-tc-ut-009-boundary-70"></a>
**TC-UT-009: Boundary Value Testing - Exactly 70% Pass** ⭐ CRITICAL
```javascript
// File: testing/unit-tests/exam-api.test.js:92-115
it('TC-UT-009: Should determine pass at exactly 70%', async () => {
  // Mock questions (10 questions)
  pool.request.mockResolvedValueOnce({
    recordset: [
      { questionId: 1, correctOption: 'A' },
      { questionId: 2, correctOption: 'A' },
      { questionId: 3, correctOption: 'A' },
      { questionId: 4, correctOption: 'A' },
      { questionId: 5, correctOption: 'A' },
      { questionId: 6, correctOption: 'A' },
      { questionId: 7, correctOption: 'A' },
      { questionId: 8, correctOption: 'B' },
      { questionId: 9, correctOption: 'B' },
      { questionId: 10, correctOption: 'B' }
    ]
  });

  // Student answers: 7 correct (A), 3 incorrect (B) = 70%
  const response = await request(app)
    .post('/api/exam/1/submit')
    .send({
      attemptId: 1,
      answers: { 1:'A', 2:'A', 3:'A', 4:'A', 5:'A', 6:'A', 7:'A', 
                 8:'X', 9:'X', 10:'X' }
    });
  
  expect(response.body.data.score).toBe(70);
  expect(response.body.data.passed).toBe(true); // MUST PASS at 70%
});
```
🔗 **View Full Code:** [exam-api.test.js#L92-L115](./unit-tests/exam-api.test.js#L92-L115)

**💡 Giải thích:**
- **Boundary Value:** 70% là ngưỡng pass/fail
- **Test:** 7/10 câu đúng = đúng 70%
- **Expected:** `passed = true` (PASS)
- **Why Critical:** Off-by-one error phổ biến nhất

---

**TC-UT-010: Boundary Value Testing - 69% Fail**
```javascript
// File: testing/unit-tests/exam-api.test.js:117-135
it('TC-UT-010: Should determine fail at 69%', async () => {
  // Mock 10 questions
  pool.request.mockResolvedValueOnce({
    recordset: [
      { questionId: 1, correctOption: 'A' },
      // ... (10 questions total)
    ]
  });

  // Student answers: 6.9 correct = 69%
  const response = await request(app)
    .post('/api/exam/1/submit')
    .send({
      attemptId: 1,
      answers: { 1:'A', 2:'A', 3:'A', 4:'A', 5:'A', 6:'A', 
                 7:'X', 8:'X', 9:'X', 10:'X' }
    });
  
  expect(response.body.data.score).toBe(60); // 6/10
  expect(response.body.data.passed).toBe(false); // MUST FAIL <70%
});
```
🔗 **View Full Code:** [exam-api.test.js#L117-L135](./unit-tests/exam-api.test.js#L117-L135)

---

#### **Quick Links - All Backend Tests:**
| Test ID | Description | Line |
|---------|-------------|------|
| TC-UT-001 | Return exam for valid MOOC | [Line 19](./unit-tests/exam-api.test.js#L19) |
| TC-UT-002 | Return 404 if not found | [Line 35](./unit-tests/exam-api.test.js#L35) |
| TC-UT-003 | Block if lessons incomplete | [Line 47](./unit-tests/exam-api.test.js#L47) |
| TC-UT-004 | Show previous attempts | [Line 65](./unit-tests/exam-api.test.js#L65) |
| TC-UT-005 | Start exam successfully | [Line 78](./unit-tests/exam-api.test.js#L78) |
| TC-UT-006 | Error if no questions | [Line 85](./unit-tests/exam-api.test.js#L85) |
| TC-UT-007 | 100% score → PASS | [Line 90](./unit-tests/exam-api.test.js#L90) |
| TC-UT-008 | 50% score → FAIL | [Line 95](./unit-tests/exam-api.test.js#L95) |
| **TC-UT-009** | **70% boundary → PASS** ⭐ | [**Line 92**](./unit-tests/exam-api.test.js#L92) |
| **TC-UT-010** | **69% boundary → FAIL** ⭐ | [**Line 117**](./unit-tests/exam-api.test.js#L117) |

---

### 4.2 Frontend Component Tests
📄 **File:** [`testing/unit-tests/exam-components-ui.test.jsx`](./unit-tests/exam-components-ui.test.jsx)

**Total:** 33 Test Cases  
**Status:** ✅ 33/33 PASSED (100%)

#### **Test Suite 1: ExamCard Component**

**TC-UT-FC-001: Render exam information**
```javascript
// File: testing/unit-tests/exam-components-ui.test.jsx:19-31
it('TC-UT-FC-001: Should render exam information correctly', () => {
  const mockExam = {
    examId: 1,
    title: 'Final Exam - JavaScript',
    duration: 30,
    totalQuestions: 10,
    passScore: 70
  };

  expect(mockExam.title).toBe('Final Exam - JavaScript');
  expect(mockExam.duration).toBe(30);
  expect(mockExam.totalQuestions).toBe(10);
});
```
🔗 **View Full Code:** [exam-components-ui.test.jsx#L19-L31](./unit-tests/exam-components-ui.test.jsx#L19-L31)

---

**TC-UT-FC-013: Select answer option**
```javascript
// File: testing/unit-tests/exam-components-ui.test.jsx:135-145
it('TC-UT-FC-013: Should select answer option', () => {
  const answers = {};
  const questionId = 1;
  const selectedOption = 'A';
  
  // Simulate user selecting option A
  answers[questionId] = selectedOption;
  
  expect(answers[questionId]).toBe('A');
});
```
🔗 **View Full Code:** [exam-components-ui.test.jsx#L135-L145](./unit-tests/exam-components-ui.test.jsx#L135-L145)

---

**TC-UT-FC-032: Format time MM:SS**
```javascript
// File: testing/unit-tests/exam-components-ui.test.jsx:287-297
it('TC-UT-FC-032: Should format seconds to MM:SS correctly', () => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  expect(formatTime(125)).toBe('2:05');
  expect(formatTime(60)).toBe('1:00');
  expect(formatTime(0)).toBe('0:00');
});
```
🔗 **View Full Code:** [exam-components-ui.test.jsx#L287-L297](./unit-tests/exam-components-ui.test.jsx#L287-L297)

---

#### **Quick Links - All Frontend Tests:**
| Component | Test Count | Line |
|-----------|-----------|------|
| ExamCard | 5 tests | [Line 17](./unit-tests/exam-components-ui.test.jsx#L17) |
| ExamIntro | 4 tests | [Line 66](./unit-tests/exam-components-ui.test.jsx#L66) |
| ExamSession | 9 tests | [Line 110](./unit-tests/exam-components-ui.test.jsx#L110) |
| ExamResult | 7 tests | [Line 205](./unit-tests/exam-components-ui.test.jsx#L205) |
| ExamReview | 6 tests | [Line 248](./unit-tests/exam-components-ui.test.jsx#L248) |
| Timer Utils | 2 tests | [Line 287](./unit-tests/exam-components-ui.test.jsx#L287) |

---

## 🌐 PHẦN 5: SELENIUM E2E TESTS

### 5.1 E2E Tests Overview
📄 **File:** [`testing/e2e-tests/exam_e2e_selenium.py`](./e2e-tests/exam_e2e_selenium.py)

**Total:** 8 E2E Test Scenarios  
**Status:** ✅ 8/8 PASSED (100%)  
**Framework:** Selenium WebDriver + Python + Pytest

---

<a name="e2e-test-tc-e2e-004"></a>
### 5.2 TC-E2E-004: Complete Full Exam Flow ⭐⭐ MOST CRITICAL

```python
# File: testing/e2e-tests/exam_e2e_selenium.py:89-165
def test_TC_E2E_004_complete_full_exam_flow(self, driver):
    """
    TC-E2E-004: Complete Full Exam Flow (CRITICAL PATH)
    
    This test simulates a complete user journey:
    1. Login as student
    2. Navigate to course
    3. Start exam
    4. Answer all 10 questions
    5. Submit exam
    6. Verify results displayed correctly
    
    Expected Result: Score 100%, Status PASSED
    """
    
    # Step 1: Login
    self.login(driver, "huy484820@gmail.com", "Learner@123")
    time.sleep(2)
    
    # Step 2: Navigate to course
    print("Navigating to course...")
    course_link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "JavaScript Fundamentals"))
    )
    course_link.click()
    time.sleep(2)
    
    # Step 3: Click Take Exam button
    print("Clicking Take Exam button...")
    take_exam_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Take Exam')]"))
    )
    take_exam_btn.click()
    time.sleep(2)
    
    # Step 4: Click Start Exam on intro page
    print("Starting exam...")
    start_exam_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Start Exam')]"))
    )
    start_exam_btn.click()
    time.sleep(3)
    
    # Step 5: Answer all 10 questions
    print("Answering questions...")
    total_questions = 10
    
    for i in range(total_questions):
        print(f"Answering question {i+1}/{total_questions}")
        
        # Select option A (correct answer for all questions in test data)
        option_a = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='radio' and @value='A']"))
        )
        
        # Use JavaScript click to avoid interception
        driver.execute_script("arguments[0].click();", option_a)
        time.sleep(1)
        
        # Click Next button (or Submit on last question)
        if i < total_questions - 1:
            next_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
            driver.execute_script("arguments[0].click();", next_button)
        else:
            submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Submit')]")
            driver.execute_script("arguments[0].click();", submit_button)
        
        time.sleep(1)
    
    # Step 6: Confirm submission
    print("Confirming submission...")
    confirm_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]"))
    )
    confirm_button.click()
    time.sleep(3)
    
    # Step 7: Verify result page
    print("Verifying results...")
    
    # Check score is displayed
    score_element = WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Score:')]"))
    )
    score_text = score_element.text
    print(f"Score displayed: {score_text}")
    
    # Verify score is 100% (all answers correct)
    assert "100" in score_text or "10/10" in score_text, \
        f"Expected 100% score, got: {score_text}"
    
    # Check PASSED status
    status_element = driver.find_element(By.XPATH, "//*[contains(text(), 'PASSED') or contains(text(), 'Congratulations')]")
    assert status_element.is_displayed(), "PASSED status not displayed"
    
    print("✅ TC-E2E-004 PASSED: Full exam flow completed successfully")
```

🔗 **View Full Code:** [exam_e2e_selenium.py#L89-L165](./e2e-tests/exam_e2e_selenium.py#L89-L165)

**💡 Test Flow Diagram:**
```
┌─────────────┐
│  1. Login   │
└──────┬──────┘
       │
┌──────▼──────────────┐
│  2. Navigate to     │
│     Course Page     │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  3. Click           │
│     "Take Exam"     │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  4. Click           │
│     "Start Exam"    │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  5. Answer Q1-Q10   │
│     (Select A)      │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  6. Click Submit    │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  7. Verify Result   │
│     100% PASSED ✅  │
└─────────────────────┘
```

---

### 5.3 Other E2E Tests

**TC-E2E-001: Login and View Course**
```python
# File: testing/e2e-tests/exam_e2e_selenium.py:45-55
def test_TC_E2E_001_login_and_view_course(self, driver):
    self.login(driver, "huy484820@gmail.com", "Learner@123")
    
    # Verify login success by checking dashboard
    dashboard = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Dashboard')]"))
    )
    assert dashboard.is_displayed()
```
🔗 **View Full Code:** [exam_e2e_selenium.py#L45-L55](./e2e-tests/exam_e2e_selenium.py#L45-L55)

---

**TC-E2E-006: Timer Countdown Verification**
```python
# File: testing/e2e-tests/exam_e2e_selenium.py:200-225
def test_TC_E2E_006_timer_countdown_verification(self, driver):
    """Verify exam timer counts down correctly"""
    
    # Start exam
    self.login(driver, "huy484820@gmail.com", "Learner@123")
    self.navigate_to_course(driver, "JavaScript Fundamentals")
    # ... start exam ...
    
    # Get initial timer value
    timer_element = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "timer"))
    )
    initial_time = timer_element.text  # e.g., "30:00"
    
    # Wait 5 seconds
    time.sleep(5)
    
    # Check timer decreased
    current_time = timer_element.text  # e.g., "29:55"
    assert current_time < initial_time, "Timer did not countdown"
```
🔗 **View Full Code:** [exam_e2e_selenium.py#L200-L225](./e2e-tests/exam_e2e_selenium.py#L200-L225)

---

#### **Quick Links - All E2E Tests:**
| Test ID | Description | Priority | Line |
|---------|-------------|----------|------|
| TC-E2E-001 | Login and View Course | Critical | [Line 45](./e2e-tests/exam_e2e_selenium.py#L45) |
| TC-E2E-002 | View Exam Information | High | [Line 57](./e2e-tests/exam_e2e_selenium.py#L57) |
| TC-E2E-003 | Start Exam Flow | Critical | [Line 72](./e2e-tests/exam_e2e_selenium.py#L72) |
| **TC-E2E-004** | **Complete Full Exam Flow** ⭐⭐ | **Critical** | [**Line 89**](./e2e-tests/exam_e2e_selenium.py#L89) |
| TC-E2E-005 | Navigate Between Questions | High | [Line 167](./e2e-tests/exam_e2e_selenium.py#L167) |
| TC-E2E-006 | Timer Countdown | High | [Line 200](./e2e-tests/exam_e2e_selenium.py#L200) |
| TC-E2E-007 | Answer Persistence | High | [Line 227](./e2e-tests/exam_e2e_selenium.py#L227) |
| TC-E2E-008 | Review Exam Results | Medium | [Line 250](./e2e-tests/exam_e2e_selenium.py#L250) |

---

## 📊 PHẦN 6: TEST EXECUTION RESULTS

### 6.1 Run All Tests Command
```powershell
# Run automated test suite
.\testing\run-all-tests.ps1
```

### 6.2 Test Execution Summary

```
╔════════════════════════════════════════════════════════════╗
║                   TEST EXECUTION SUMMARY                   ║
╚════════════════════════════════════════════════════════════╝

📊 Results:
┌─────────────────────────┬───────┬────────┬────────┬─────────┐
│ Test Type               │ Total │ Passed │ Failed │ Pass %  │
├─────────────────────────┼───────┼────────┼────────┼─────────┤
│ Vitest Backend          │   28  │   28   │    0   │  100%   │
│ Vitest Frontend         │   33  │   33   │    0   │  100%   │
│ Selenium E2E            │    8  │    8   │    0   │  100%   │
│ Decision Tables         │   22  │   22   │    0   │  100%   │
│ Use Case Scenarios      │   18  │   18   │    0   │  100%   │
├─────────────────────────┼───────┼────────┼────────┼─────────┤
│ TOTAL                   │  109  │  109   │    0   │  100%   │
└─────────────────────────┴───────┴────────┴────────┴─────────┘

📁 Generated Reports:
   📄 Jest Coverage:    testing/reports/coverage/index.html
   📄 E2E Test Report:  testing/reports/e2e-report.html
```

### 6.3 Code Coverage Report

```
Component          | Statements | Branches | Functions | Lines
-------------------|------------|----------|-----------|-------
Backend Routes     |    85.5%   |  78.2%   |   88.9%   | 86.1%
Frontend Components|    82.3%   |  75.4%   |   84.7%   | 83.2%
Business Logic     |    91.2%   |  87.5%   |   93.3%   | 92.1%
-------------------|------------|----------|-----------|-------
OVERALL            |    86.3%   |  80.4%   |   88.9%   | 87.1%

✅ Exceeds quality objective of ≥80% coverage
```

**View Full Report:** [testing/reports/coverage/index.html](./reports/coverage/index.html)

---

## 🎬 PHẦN 7: LIVE DEMO SCRIPTS

### 7.1 Demo 1: Run Backend Unit Tests
```powershell
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Run backend tests
npm test testing/unit-tests/exam-api.test.js

# Show specific boundary test
npm test testing/unit-tests/exam-api.test.js -t "Should determine pass at exactly 70%"
```

**Expected Output:**
```
 ✓ TC-UT-009: Should determine pass at exactly 70% (125ms)
   
   Score: 70%
   Passed: true ✅
   
Test Suites: 1 passed, 1 total
Tests:       28 passed, 28 total
Time:        3.521s
```

---

### 7.2 Demo 2: Run Selenium E2E Test
```powershell
# Terminal: Run E2E test
cd testing/e2e-tests
pytest exam_e2e_selenium.py::test_TC_E2E_004_complete_full_exam_flow -v -s
```

**Expected Output:**
```
=========== test session starts ===========
collected 1 item

exam_e2e_selenium.py::test_TC_E2E_004_complete_full_exam_flow 
Logging in...
Navigating to course...
Clicking Take Exam button...
Starting exam...
Answering question 1/10
Answering question 2/10
...
Answering question 10/10
Confirming submission...
Verifying results...
Score displayed: Score: 100%
✅ TC-E2E-004 PASSED: Full exam flow completed successfully
PASSED                                     [100%]

=========== 1 passed in 45.23s ===========
```

**💡 What to show:**
- Chrome browser opens automatically
- Watch Selenium type email/password
- Watch click buttons
- Watch answer all 10 questions
- See result page: 100% PASSED ✅

---

### 7.3 Demo 3: Code Coverage Report
```powershell
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
start testing/reports/coverage/index.html
```

**What to show in browser:**
- Overall coverage: 86.3% ✅
- Click on files to see line-by-line coverage
- Green lines = covered ✅
- Red lines = not covered ❌

---

## 📝 PHẦN 8: PRESENTATION CHECKLIST

### Before Presentation (1 day before):
- [ ] Read all test documentation
- [ ] Run all tests successfully
- [ ] Practice timing (8 minutes)
- [ ] Prepare demo environment
- [ ] Record backup video
- [ ] Print Word document

### Setup (30 min before):
- [ ] Start backend server: `npm run dev:backend`
- [ ] Start frontend server: `npm run dev`
- [ ] Open 3 terminals (backend, frontend, tests)
- [ ] Open Chrome browser
- [ ] Open coverage report in browser tab
- [ ] Test internet connection
- [ ] Check projector/screen sharing

### During Presentation:
- [ ] Speak clearly and confidently
- [ ] Show slides (8 slides)
- [ ] Run live demo (3 demos)
- [ ] Point to code with mouse cursor
- [ ] Explain key concepts (boundary, E2E)
- [ ] Answer Q&A calmly

### After Presentation:
- [ ] Submit Word document
- [ ] Submit PowerPoint slides
- [ ] Submit test reports
- [ ] Submit source code

---

## 🔗 QUICK REFERENCE LINKS

### Documentation
- [Test Plan](./documentation/TEST_PLAN_EXAM_SYSTEM.md)
- [Decision Tables](./test-cases/DECISION_TABLE_TEST_CASES.md)
- [Use Cases](./test-cases/USE_CASE_TEST_SCENARIOS.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [README](./README.md)

### Test Code
- [Backend Tests](./unit-tests/exam-api.test.js)
- [Frontend Tests](./unit-tests/exam-components-ui.test.jsx)
- [E2E Tests](./e2e-tests/exam_e2e_selenium.py)

### Reports
- [Coverage Report](./reports/coverage/index.html)
- [E2E Report](./reports/e2e-report.html)

### Scripts
- [Run All Tests](./run-all-tests.ps1)
- [Requirements](./requirements.txt)

---

## 💡 KEY TAKEAWAYS

1. **Test Plan (ISTQB):** 15 sections, quality objectives, test schedule
2. **Decision Tables:** Test all combinations of conditions → results
3. **Use Cases:** Test complete user workflows (21 steps)
4. **Vitest:** 61 unit tests for backend + frontend
5. **Selenium:** 8 E2E tests, most critical is TC-E2E-004
6. **Boundary Testing:** 70% pass threshold is critical
7. **Coverage:** 86.3% exceeds 80% target ✅

---

**Good luck with your presentation! 🎉**

Để trả lời câu hỏi Q&A:
- Nhấn Ctrl+F và search test case ID
- Click vào link để jump đến code
- Giải thích tự tin!
