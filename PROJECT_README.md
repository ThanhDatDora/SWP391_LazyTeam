# 🎓 MINI COURSERA - SWP391 PROJECT

## 📚 Hệ thống E-Learning hoàn chỉnh

### ✨ Tính năng chính

#### 👥 Phân quyền người dùng
- **Learner**: Học viên - Xem khóa học, làm bài tập, thi exam
- **Instructor**: Giảng viên - Tạo khóa học, quản lý nội dung, chấm bài
- **Admin**: Quản trị viên - Quản lý toàn hệ thống

#### 📖 Quản lý khóa học
- MOOC (Massive Open Online Courses) với lessons
- Video lectures, tài liệu học
- Quizzes, Assignments, Exams
- Certificate khi hoàn thành

#### 💳 Thanh toán (MỚI!)
- ✅ **SePay QR Code** - Tự động 100% (KHUYẾN NGHỊ)
- ✅ VNPay - ATM/Visa/QR
- ✅ Chuyển khoản thủ công

#### 🧪 Testing System (Exam Module)
- ✅ Test Plan (ISTQB Standard)
- ✅ Unit Tests (Vitest) - 61 test cases
- ✅ E2E Tests (Selenium) - 8 scenarios
- ✅ Decision Table Testing - 22 test cases
- ✅ Use Case Testing - 18 scenarios

---

## 📁 Cấu trúc Project

```
mini-coursera-ui-tailwind/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   ├── database.js         # SQL Server connection
│   │   └── sepay.config.js     # SePay payment config
│   ├── routes/
│   │   ├── auth.js             # Authentication
│   │   ├── courses.js          # Course management
│   │   ├── exams.js            # Exam system
│   │   ├── sepay.routes.js     # SePay payment
│   │   └── ...
│   ├── services/
│   │   └── sepay.service.js    # SePay integration
│   └── server.js               # Main server
│
├── src/                        # React Frontend
│   ├── pages/
│   │   ├── CourseDetail.jsx    # Course info
│   │   ├── ExamSession.jsx     # Take exam
│   │   ├── Checkout.jsx        # Payment checkout
│   │   └── SepayPaymentPage.jsx # SePay QR payment
│   ├── components/
│   │   ├── layout/             # Layouts
│   │   └── ui/                 # UI components
│   ├── contexts/               # React Context
│   └── router/                 # React Router
│
├── testing/                    # Testing Infrastructure
│   ├── documentation/
│   │   └── TEST_PLAN_EXAM_SYSTEM.md
│   ├── test-cases/
│   │   ├── DECISION_TABLE_TEST_CASES.md
│   │   └── USE_CASE_TEST_SCENARIOS.md
│   ├── unit-tests/
│   │   ├── exam-api.test.js    # Backend tests (Vitest)
│   │   └── exam-components-ui.test.jsx # Frontend tests
│   ├── e2e-tests/
│   │   └── exam_e2e_selenium.py # Selenium tests
│   ├── README.md               # Testing overview
│   ├── TESTING_GUIDE.md        # Detailed guide
│   └── run-all-tests.ps1       # Auto-run all tests
│
├── SEPAY_INTEGRATION_GUIDE.md  # SePay developer guide
├── SEPAY_QUICK_START.md        # SePay 3-step setup
├── SEPAY_USER_GUIDE.md         # SePay user manual
└── SEPAY_COMPLETE_SUMMARY.md   # SePay summary
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/ThanhDatDora/SWP391_LazyTeam.git
cd SWP391_LazyTeam

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Setup Database

```sql
-- Tạo database trong SQL Server
CREATE DATABASE MiniCourseraDB;

-- Import schema (nếu có file .sql)
-- Hoặc chạy migrations
```

### 3. Configure Environment

```bash
# Backend .env
cd backend
cp .env.example .env

# Sửa file .env:
DB_USER=your_sql_user
DB_PASSWORD=your_sql_password
DB_SERVER=localhost
DB_DATABASE=MiniCourseraDB

# SePay (optional, xem SEPAY_QUICK_START.md)
BANK_ACCOUNT_NUMBER=your_account_number
BANK_ACCOUNT_NAME=YOUR NAME
```

### 4. Run Development

```bash
# Terminal 1: Backend
cd backend
npm run dev          # Port 3001

# Terminal 2: Frontend
npm run dev          # Port 5173
```

Mở browser: http://localhost:5173

---

## 🧪 Running Tests

### Test Exam Module (SWP391 Requirement)

```bash
# Run all tests automatically
.\testing\run-all-tests.ps1

# Or run individually:

# Unit tests (Vitest)
npm test

# E2E tests (Selenium)
cd testing/e2e-tests
pytest exam_e2e_selenium.py -v

# Coverage report
npm run test:coverage
```

**Chi tiết:** Xem `testing/TESTING_GUIDE.md`

---

## 💳 Payment Integration (SePay)

### Setup trong 3 bước:

#### Bước 1: Cấu hình
```bash
cd backend
# Sửa .env:
BANK_ACCOUNT_NUMBER=0123456789    # Số TK của bạn
BANK_ACCOUNT_NAME=MINI COURSERA   # Tên (IN HOA)
```

#### Bước 2: Thêm vào Frontend
File `src/pages/Checkout.jsx`:
```jsx
// Thêm SePay option
{ id: 'sepay', name: 'SePay QR (Tự động)', icon: '🚀', recommended: true },
```

#### Bước 3: Test
```bash
# Start servers → Checkout → Chọn "SePay QR"
```

**Chi tiết:** Xem `SEPAY_QUICK_START.md`

---

## 📊 Tech Stack

### Frontend
- **Framework**: React 18 + Vite 5
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Context API
- **Router**: React Router v6
- **HTTP**: Axios
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: Microsoft SQL Server 2019+
- **Authentication**: JWT + bcrypt
- **Payment**: SePay + VNPay
- **Testing**: Vitest + Supertest

### Testing
- **Unit**: Vitest
- **E2E**: Selenium WebDriver + Pytest
- **Standards**: ISTQB, Decision Table, Use Case

---

## 📝 Documentation

### Developer Guides
- `README.md` - Project overview (this file)
- `SEPAY_INTEGRATION_GUIDE.md` - SePay technical guide
- `SEPAY_QUICK_START.md` - SePay quick setup

### Testing Documentation (SWP391)
- `testing/README.md` - Testing overview
- `testing/TESTING_GUIDE.md` - How to run tests + Presentation guide
- `testing/documentation/TEST_PLAN_EXAM_SYSTEM.md` - ISTQB test plan
- `testing/test-cases/DECISION_TABLE_TEST_CASES.md` - Decision tables
- `testing/test-cases/USE_CASE_TEST_SCENARIOS.md` - Use cases

### User Guides
- `SEPAY_USER_GUIDE.md` - How learners use SePay payment

---

## 👥 Team

**Lazy Team** - SWP391 Project

- **Huy**: Exam System + Testing + SePay Integration
- **[Member 2]**: [Feature]
- **[Member 3]**: [Feature]

---

## 📞 Support

- **Email**: support@minicoursera.com
- **Issues**: [GitHub Issues](https://github.com/ThanhDatDora/SWP391_LazyTeam/issues)

---

## 📄 License

This project is created for educational purposes (SWP391 - FPT University).

---

✅ **Status**: Development Complete | Testing Complete | Ready for Presentation

*Last updated: November 15, 2025*
