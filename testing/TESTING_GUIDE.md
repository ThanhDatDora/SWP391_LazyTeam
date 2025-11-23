# Testing Guide - Exam System
## Complete Testing Documentation for SWP391 Project

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Test Framework & Tools](#test-framework--tools)
3. [Installation & Setup](#installation--setup)
4. [Running Tests](#running-tests)
5. [Test Structure](#test-structure)
6. [Test Results & Reporting](#test-results--reporting)
7. [Troubleshooting](#troubleshooting)
8. [Individual Presentation Guide](#individual-presentation-guide)

---

## Overview

### Testing Scope
This testing suite covers the **Exam System** module of the Mini Coursera platform, including:

- ✅ Unit tests (Jest) - Frontend & Backend
- ✅ Integration tests (API testing)
- ✅ E2E tests (Selenium WebDriver)
- ✅ Decision Table test cases
- ✅ Use Case test scenarios
- ✅ ISTQB-compliant Test Plan

### Technology Stack Summary

| Component | Technology | Test Framework |
|-----------|-----------|----------------|
| **Backend** | Node.js + Express | **Jest + Supertest** |
| **Frontend** | React + Vite | **Jest + React Testing Library** |
| **E2E Testing** | Web Application | **Selenium WebDriver (Python)** OR **Katalon Studio** |
| **Database** | SQL Server | SQL Scripts |

## 1. Test Framework & Tools

### Why Vitest for JavaScript?

Vì project của bạn là **JavaScript/Node.js** với **Vite** build tool, nên tôi dùng **Vitest** thay vì JUnit.

- **JUnit** = Test framework cho **Java**
- **Vitest** = Test framework cho **JavaScript** với Vite (tương đương JUnit, nhanh hơn Jest)
- **React Testing Library** = Test React components

Đây là các công cụ phù hợp với technology stack của project bạn (React + Vite + Node.js).

**Framework Comparison:**
| Java Project | JavaScript Project (Vite) |
|-------------|--------------------------|
| JUnit | **Vitest** (recommended) hoặc Jest |
| TestNG | Vitest / Jest |
| Mockito | Vitest vi.mock() / Jest mock |

### Test Tool Options

---

## Test Framework & Tools

### 1. Jest (Thay thế JUnit cho JavaScript)

**Jest** là framework testing phổ biến nhất cho JavaScript, tương đương với JUnit trong Java.

**Features:**
- Unit testing cho functions và components
- Mocking và stubbing
- Coverage reports
- Snapshot testing
- Async testing support

**Installation:**
```bash
# Already in package.json
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### 2. Selenium WebDriver (Python)

**Selenium** là tool automation testing cho web apps (giống Mayas).

**Installation:**
```bash
# Install Python packages
pip install selenium pytest pytest-html

# Download ChromeDriver
# Visit: https://chromedriver.chromium.org/downloads
# Add to PATH or place in project folder
```

**Alternative:** Katalon Studio (No-code option)
- Download từ: https://katalon.com/download
- Import test cases từ Selenium scripts
- Record & playback features

### 3. Supertest (API Testing)

**Supertest** dùng để test REST API endpoints.

```bash
npm install --save-dev supertest
```

---

## Installation & Setup

### Prerequisites

1. **Node.js 18+** - `node --version`
2. **Python 3.8+** - `python --version` (for Selenium)
3. **SQL Server** - Database must be running
4. **Chrome Browser** - For Selenium tests

### Step 1: Install Frontend Dependencies

```powershell
cd e:\mini-coursera-ui-tailwind
npm install
```

### Step 2: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 3: Install Python Dependencies (for Selenium)

```powershell
# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate

# Install Selenium and pytest
pip install selenium pytest pytest-html
```

### Step 4: Download ChromeDriver

1. Check Chrome version: `chrome://version/`
2. Download matching ChromeDriver: https://chromedriver.chromium.org/downloads
3. Extract and add to PATH, or place in `testing/e2e-tests/` folder

### Step 5: Configure Test Database

```sql
-- Create test database (optional)
CREATE DATABASE MiniCoursera_Test;
GO

-- Or use existing database
USE MiniCoursera_Primary;
GO
```

### Step 6: Update Test Configuration

Create `.env.test` file in backend folder:

```env
DB_SERVER=localhost
DB_NAME=MiniCoursera_Primary
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3001
```

---

## Running Tests

### Unit Tests (Jest)

#### Backend API Tests

```powershell
# Navigate to backend folder
cd backend

# Run all unit tests
npm test

# Run specific test file
npm test exam-routes.test.js

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on file changes)
npm test -- --watch
```

#### Frontend Component Tests

```powershell
# Navigate to project root
cd e:\mini-coursera-ui-tailwind

# Run all frontend tests
npm test

# Run specific test file
npm test exam-components.test.jsx

# Run with coverage
npm run test:coverage

# Generate coverage report
npm test -- --coverage --coverageDirectory=testing/reports/coverage
```

### Integration Tests (API)

```powershell
# Run integration tests (API + Database)
npm run test:integration

# Or run specific API test suite
npm test -- --testPathPattern=exam-routes.test.js
```

### E2E Tests (Selenium)

```powershell
# Activate Python virtual environment
.\venv\Scripts\activate

# Navigate to e2e tests folder
cd testing\e2e-tests

# Run all E2E tests
pytest exam_e2e_selenium.py -v

# Run specific test
pytest exam_e2e_selenium.py::TestExamSystemE2E::test_TC_E2E_004_complete_full_exam_flow -v

# Generate HTML report
pytest exam_e2e_selenium.py -v --html=../reports/e2e-report.html --self-contained-html

# Run in headless mode (faster, no browser window)
# Edit exam_e2e_selenium.py to uncomment headless option first
pytest exam_e2e_selenium.py -v
```

### E2E Tests (Katalon Studio - Alternative)

If using Katalon Studio instead of Selenium:

1. Open Katalon Studio
2. Create new project
3. Import test cases:
   - File > Import > From Selenium scripts
   - Or manually create test cases using Record feature
4. Run test suite

---

## Test Structure

```
testing/
├── documentation/
│   └── TEST_PLAN_EXAM_SYSTEM.md      # ISTQB Test Plan
│
├── test-cases/
│   ├── DECISION_TABLE_TEST_CASES.md  # Decision table tests
│   └── USE_CASE_TEST_SCENARIOS.md    # Use case tests
│
├── unit-tests/
│   ├── exam-routes.test.js           # Backend API unit tests (Jest)
│   └── exam-components.test.jsx      # Frontend component tests (Jest + RTL)
│
├── e2e-tests/
│   ├── exam_e2e_selenium.py          # Selenium WebDriver tests (Python)
│   └── exam_e2e_katalon/             # Katalon Studio tests (optional)
│
└── reports/
    ├── coverage/                      # Code coverage reports
    ├── e2e-report.html               # Selenium test report
    └── jest-report.html              # Jest test report
```

---

## Test Coverage Summary

### Unit Tests (Jest)

| Test File | Test Cases | Coverage |
|-----------|-----------|----------|
| `exam-routes.test.js` | 28 | Backend API endpoints, business logic |
| `exam-components.test.jsx` | 33 | Frontend React components |
| **Total** | **61** | ~80% code coverage target |

### Decision Table Tests

| Decision Table | Test Cases | Priority |
|----------------|-----------|----------|
| DT1: Exam Eligibility | 4 | Critical |
| DT2: Grading Logic | 4 | Critical |
| DT3: Timer Behavior | 3 | High |
| DT4: Answer Selection | 4 | High |
| DT5: Progress Update | 3 | Critical |
| DT6: Attempt Validation | 4 | Medium |
| **Total** | **22** | Manual execution |

### Use Case Tests

| Use Case | Test Cases | Priority |
|----------|-----------|----------|
| UC-001: View Exam Info | 2 | High |
| UC-002: Take Exam | 5 | Critical |
| UC-003: Review Results | 2 | High |
| UC-004: Retake Exam | 3 | High |
| UC-005: Instructor View | 1 | Medium |
| UC-006: Unlock MOOC | 2 | Critical |
| UC-007: Error Handling | 3 | Medium |
| **Total** | **18** | E2E execution |

### E2E Tests (Selenium)

| Test Case | Description | Priority |
|-----------|-------------|----------|
| TC-E2E-001 | Login and view course | Critical |
| TC-E2E-002 | View exam information | High |
| TC-E2E-003 | Start exam flow | Critical |
| TC-E2E-004 | **Complete full exam flow** | **Critical** |
| TC-E2E-005 | Navigate between questions | High |
| TC-E2E-006 | Timer countdown | High |
| TC-E2E-007 | Answer persistence | High |
| TC-E2E-008 | Review exam results | Medium |
| **Total** | **8** | Automated |

---

## Test Results & Reporting

### Generate Coverage Report

```powershell
# Frontend coverage
npm run test:coverage

# Open coverage report
start testing\reports\coverage\index.html
```

### Generate HTML Test Report

```powershell
# Jest HTML reporter (install first)
npm install --save-dev jest-html-reporter

# Add to package.json:
# "jest": {
#   "reporters": [
#     "default",
#     ["jest-html-reporter", {
#       "pageTitle": "Exam System Test Report",
#       "outputPath": "testing/reports/jest-report.html"
#     }]
#   ]
# }

# Run tests and generate report
npm test
```

### Selenium HTML Report

```powershell
# Already generated by pytest-html
pytest exam_e2e_selenium.py --html=../reports/e2e-report.html --self-contained-html

# Open report
start ..\reports\e2e-report.html
```

---

## Test Execution Checklist

### Before Running Tests

- [ ] Database is running and accessible
- [ ] Backend server is running on port 3001
- [ ] Frontend dev server is running on port 5173
- [ ] Test user accounts exist in database
- [ ] Sample exam data (questions) populated
- [ ] ChromeDriver installed (for Selenium)

### Test Execution Order

1. **Unit Tests** (Fast) - Run first
   ```powershell
   npm test
   ```

2. **Integration Tests** (Medium) - After unit tests pass
   ```powershell
   npm run test:integration
   ```

3. **E2E Tests** (Slow) - Last, requires servers running
   ```powershell
   pytest exam_e2e_selenium.py -v
   ```

4. **Manual Tests** - Decision tables & use cases
   - Execute manually following test case documents
   - Record results in Excel/Word template

---

## Troubleshooting

### Jest Tests Failing

**Problem:** `Cannot find module 'xxx'`

**Solution:**
```powershell
# Clear cache
npm run test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** `ReferenceError: document is not defined`

**Solution:** Add jest-environment-jsdom
```powershell
npm install --save-dev jest-environment-jsdom

# In test file, add:
/**
 * @jest-environment jsdom
 */
```

### Selenium Tests Failing

**Problem:** `selenium.common.exceptions.WebDriverException: chromedriver executable needs to be in PATH`

**Solution:**
```powershell
# Download ChromeDriver and add to PATH
# Or specify path in test:
from selenium import webdriver
driver = webdriver.Chrome(executable_path='path/to/chromedriver.exe')
```

**Problem:** `TimeoutException: Message: timeout`

**Solution:** Increase timeout or wait for elements
```python
# Increase implicit wait
driver.implicitly_wait(20)

# Or use explicit wait
from selenium.webdriver.support.ui import WebDriverWait
WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.ID, "element-id"))
)
```

**Problem:** `Element not clickable` or `ElementClickInterceptedException`

**Solution:** Use JavaScript click
```python
element = driver.find_element(By.ID, "button-id")
driver.execute_script("arguments[0].click();", element)
```

### Database Connection Issues

**Problem:** `ConnectionError: Login failed for user`

**Solution:** Check connection string in `.env` file
```env
DB_SERVER=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=MiniCoursera_Primary
```

---

## Individual Presentation Guide (8 minutes)

### Presentation Structure (Recommended)

#### Slide 1: Introduction (1 minute)
- Feature: Exam System module
- Your responsibility: [e.g., "Exam submission and grading logic"]
- Testing approach overview

#### Slide 2: Test Plan (1 minute)
- Show test plan document (ISTQB standard)
- Highlight: Entry/exit criteria, test types, schedule

#### Slide 3: Decision Table Testing (2 minutes)
- **Show 1-2 decision tables** (e.g., Grading Logic table)
- Explain conditions and test cases
- **Demo:** Run test case TC-DT2-002 (Exact passing score 70%)

#### Slide 4: Use Case Testing (1.5 minutes)
- **Show 1 use case** (e.g., UC-002: Complete Exam)
- Explain main flow and alternative flows
- Map to actual test cases

#### Slide 5: Jest Unit Tests (1.5 minutes)
- **Live demo:** Run `npm test exam-routes.test.js`
- Show test results (pass/fail)
- Explain 1-2 critical tests (e.g., score calculation)
- **Show code:**
```javascript
test('Should calculate 70% for boundary pass', () => {
  expect(calculateScore(7, 10)).toBe(70);
});
```

#### Slide 6: Selenium E2E Test (1.5 minutes)
- **Live demo:** Run TC-E2E-004 (Complete full exam flow)
- Show browser automation
- Show test report (pass/fail)

#### Slide 7: Test Results & Coverage (0.5 minutes)
- Coverage report screenshot
- Summary: Total tests, pass rate, issues found
- Defect tracking (if any bugs found)

#### Slide 8: Conclusion & Q&A (0.5 minutes)
- Key achievements
- Lessons learned
- Thank you + Questions

### Demo Preparation Tips

1. **Pre-run all tests** before presentation to ensure they work
2. **Record video** as backup (in case live demo fails)
3. **Prepare test data** - Ensure database has sample questions
4. **Open all necessary terminals** beforehand:
   - Terminal 1: Backend server
   - Terminal 2: Frontend server
   - Terminal 3: Jest tests
   - Terminal 4: Selenium tests
5. **Bookmark pages** in browser for quick access
6. **Practice timing** - 8 minutes goes fast!

---

## Word Document Template

Create `TESTING_REPORT_EXAM_SYSTEM.docx` with these sections:

### 1. Cover Page
- Project: Mini Coursera - Exam System Testing
- Student Name: [Your Name]
- Student ID: [Your ID]
- Date: November 12, 2025

### 2. Test Plan Summary (2 pages)
- Copy from TEST_PLAN_EXAM_SYSTEM.md
- Include test strategy, schedule, resources

### 3. Decision Table Test Cases (3-4 pages)
- Include 2-3 decision tables with full test cases
- Test execution results (pass/fail)
- Screenshots of execution

### 4. Use Case Test Scenarios (3-4 pages)
- Include 2-3 use cases with test cases
- Step-by-step execution screenshots
- Results verification

### 5. Jest Unit Tests (2-3 pages)
- Code snippets of test cases
- Test execution screenshots
- Coverage report

### 6. Selenium E2E Tests (2-3 pages)
- Test script code
- Browser automation screenshots
- HTML report screenshot

### 7. Test Summary Report (1-2 pages)
- Total tests executed
- Pass/Fail statistics
- Defects found (if any)
- Conclusion

**Total:** ~15-20 pages

---

## Quick Start Commands

```powershell
# 1. Install all dependencies
npm install
cd backend && npm install
cd ..
pip install selenium pytest pytest-html

# 2. Start servers
npm run dev          # Frontend (port 5173)
npm run dev:backend  # Backend (port 3001)

# 3. Run all tests
npm test                                    # Jest unit tests
pytest testing/e2e-tests/exam_e2e_selenium.py -v  # Selenium E2E

# 4. Generate reports
npm run test:coverage
pytest testing/e2e-tests/exam_e2e_selenium.py --html=testing/reports/e2e-report.html
```

---

## Summary

**Framework cho JavaScript project:**
- ✅ **Jest** = JUnit (cho JavaScript)
- ✅ **Selenium WebDriver** = Tool tương tự Mayas (automated UI testing)
- ✅ **React Testing Library** = Component testing
- ✅ **Supertest** = API testing

**Test Tools Available:**
1. **Selenium WebDriver** (Python/Java) - Automated, code-based
2. **Katalon Studio** - Record & playback, less coding
3. **Jira** - Project management (không phải test tool automation)

**Recommended for your presentation:**
- Use **Jest** for unit tests (show code + live demo)
- Use **Selenium** for E2E tests (show browser automation)
- Document **Decision Tables** and **Use Cases** in Word

Good luck with your SWP391 presentation! 🚀
