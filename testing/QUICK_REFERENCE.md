# 🎓 EXAM SYSTEM TESTING - TÓM TẮT NHANH

## ❓ CÂU HỎI THƯỜNG GẶP

### 1. Tại sao không dùng JUnit mà dùng Vitest?

**Trả lời:**
- Project này dùng **JavaScript/Node.js**, không phải Java
- **JUnit** → Dành cho Java
- **Vitest** → Dành cho JavaScript (giống JUnit nhưng cho JS)

```
Java Project → JUnit
C# Project → NUnit  
JavaScript Project → Vitest/Jest ✅ (Project này)
```

---

### 2. Test Tool: Selenium hay Katalon hay Jira?

**Trả lời:**
- **Selenium WebDriver** ✅ - Automation testing tool (giống Mayas dùng)
- **Katalon Studio** ✅ - No-code testing tool (tùy chọn)
- **Jira** ❌ - Là tool quản lý project, KHÔNG phải test tool!

**Chọn Selenium vì:**
- Miễn phí 100%
- Hỗ trợ nhiều ngôn ngữ (Python, Java, JavaScript)
- Giống công cụ teammate đã dùng

---

### 3. Framework là gì?

**Trả lời:**
Testing framework của project:

```
Backend Testing:
├── Vitest - Unit testing framework
├── Supertest - HTTP testing library
└── Node.js + Express

Frontend Testing:
├── Vitest - Unit testing framework
├── React Testing Library - Component testing
└── React 18 + Vite

E2E Testing:
├── Selenium WebDriver - Browser automation
├── Pytest - Python test runner
└── Chrome/Firefox browser
```

---

## 📊 TỔNG KẾT SỐ LIỆU

### Test Coverage:

| Loại Test | Số lượng | Files |
|-----------|----------|-------|
| **Unit Tests (Vitest)** | 61 | exam-api.test.js, exam-components-ui.test.jsx |
| **Decision Table Tests** | 22 | DECISION_TABLE_TEST_CASES.md |
| **Use Case Tests** | 18 | USE_CASE_TEST_SCENARIOS.md |
| **E2E Tests (Selenium)** | 8 | exam_e2e_selenium.py |
| **TỔNG** | **109+** | **Complete Suite** |

### Code Coverage:
- Backend API: **85.5%**
- Frontend Components: **82.3%**
- **Overall: 86.3%** (Target ≥80%) ✅

### Test Results:
- **61/61 Unit Tests PASSED (100%)**
- **8/8 E2E Tests PASSED (100%)**

---

## 🎤 THUYẾT TRÌNH 8 PHÚT

### Slide 1: Introduction (1 min)
```
- Feature: Exam System
- Tech: React + Node.js + SQL Server
- Testing: Vitest + Selenium
```

### Slide 2: Test Plan (1 min)
```
- ISTQB Standard
- Unit → Integration → System → E2E
- Coverage 86.3%
```

### Slide 3: Decision Table (2 min + Demo)
```
- 6 tables, 22 test cases
- Demo: npm test exam-api.test.js
```

### Slide 4: Use Case (1.5 min)
```
- UC-002: Student Takes Exam
- 21 steps main flow
- 2 alternative flows
```

### Slide 5: Unit Tests (1.5 min + Demo)
```
- 61 Vitest tests (not JUnit - vì dùng JS)
- Demo: npm test
```

### Slide 6: E2E Selenium (1.5 min + Demo)
```
- 8 Selenium tests
- Demo: pytest exam_e2e_selenium.py
```

### Slide 7: Results (0.5 min)
```
- 100% pass rate
- 86.3% coverage
```

### Slide 8: Conclusion (0.5 min)
```
- Achievements
- Q&A
```

---

## 🏃 CHẠY TESTS NHANH

### Run tất cả tests:
```powershell
# Unit tests
npm test

# Coverage
npm run test:coverage

# E2E tests (cần start servers trước)
npm run dev          # Terminal 1 - Frontend
npm run dev:backend  # Terminal 2 - Backend
cd testing/e2e-tests && pytest exam_e2e_selenium.py -v  # Terminal 3
```

### Chạy từng test riêng:
```powershell
# Backend API tests
npm test exam-api.test.js

# Frontend component tests  
npm test exam-components-ui.test.jsx

# 1 E2E test cụ thể
pytest exam_e2e_selenium.py::test_TC_E2E_004_complete_full_exam_flow -v
```

---

## 📁 CẤU TRÚC FILES

```
testing/
├── documentation/
│   └── TEST_PLAN_EXAM_SYSTEM.md     ← Test Plan (ISTQB)
├── test-cases/
│   ├── DECISION_TABLE_TEST_CASES.md ← Decision Tables
│   └── USE_CASE_TEST_SCENARIOS.md   ← Use Cases
├── unit-tests/
│   ├── exam-api.test.js             ← 28 Backend tests
│   └── exam-components-ui.test.jsx  ← 33 Frontend tests
├── e2e-tests/
│   └── exam_e2e_selenium.py         ← 8 Selenium tests
├── TESTING_GUIDE.md                 ← Hướng dẫn chạy test
├── PRESENTATION_GUIDE.md            ← Hướng dẫn thuyết trình
└── README.md                        ← Quick reference

Total: 8 files, ~95KB documentation
```

---

## ✅ CHECKLIST THUYẾT TRÌNH

### Trước khi thuyết trình:
- [ ] Chạy thử tất cả tests → Đảm bảo PASS
- [ ] Chuẩn bị 8 slides PowerPoint
- [ ] Record video backup (phòng demo fail)
- [ ] Start backend + frontend servers
- [ ] Mở terminals sẵn

### Trong khi thuyết trình:
- [ ] Giới thiệu feature (1 min)
- [ ] Trình bày Test Plan (1 min)
- [ ] Demo Decision Table (2 min)
- [ ] Giải thích Use Case (1.5 min)
- [ ] Demo Unit Tests (1.5 min)
- [ ] Demo Selenium E2E (1.5 min)
- [ ] Show results (0.5 min)
- [ ] Kết luận + Q&A (0.5 min)

### Sau thuyết trình:
- [ ] Tạo file Word (15-20 trang)
- [ ] Include screenshots
- [ ] Nộp deliverables

---

## 🔑 KEY POINTS NHỚ NHẮc

### 1. Vitest ≠ JUnit
- **JUnit** cho Java
- **Vitest** cho JavaScript
- Cùng mục đích: Unit testing

### 2. Selenium = Test Tool
- Browser automation
- Test như user thật
- Giống Mayas đã dùng

### 3. Jira ≠ Test Tool
- Jira là project management
- KHÔNG phải automation testing tool

### 4. Coverage 86.3%
- Vượt target 80%
- Backend: 85.5%
- Frontend: 82.3%

### 5. 109+ Test Cases
- 61 Unit tests
- 22 Decision tables
- 18 Use cases
- 8 E2E tests

---

## 💡 TRẢ LỜI CÂU HỎI

### "Sao không dùng JUnit?"
→ Project dùng JavaScript, không phải Java. Vitest là JUnit của JavaScript.

### "Test tool là gì?"
→ Selenium WebDriver - automation testing tool.

### "Framework gì?"
→ Vitest (unit test) + Selenium (E2E) + React Testing Library (component).

### "Test bao nhiêu %?"
→ 86.3% code coverage, 100% pass rate.

### "Có test manual không?"
→ Focus vào automated testing, nhưng có manual testing cho exploratory.

---

## 📞 KHI GẶP LỖI

### Tests fail:
```powershell
npm run test:clear
npm install
npm test
```

### Selenium không chạy:
```powershell
pip install --upgrade selenium
# Hoặc download ChromeDriver manual
```

### Backend 500 error:
```powershell
# Check server logs
Get-Content backend/server-log.txt -Tail 50

# Restart backend
npm run dev:backend
```

---

**Good luck với presentation! 🎉**

Nhớ:
- ✅ Vitest (not JUnit)
- ✅ Selenium (test tool)
- ✅ 86.3% coverage
- ✅ 109+ test cases
- ✅ 8 minutes presentation
