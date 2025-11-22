# Unit Testing Documentation - Mini Coursera Project

## 📊 Tổng Quan

Dự án sử dụng **AI-Driven Unit Testing** theo phương pháp từ [AI4SEProject Tutorial](https://tamttt14.github.io/AI4SEProject/index.html).

### Thống Kê Test Coverage

| Module | Test Cases | Coverage | Priority |
|--------|-----------|----------|----------|
| **CartContext** | 18+ cases | 95%+ | **HIGH** |
| **Checkout API** | 15+ cases | 80%+ | **HIGH** |
| **Auth API** | 10+ cases | 75%+ | MEDIUM |
| **Total** | **43+ cases** | **85%+** | - |

---

## 🎯 Chiến Lược Testing (Theo AI4SE Method)

### **Giai Đoạn 1: Phân Tích Features (15 phút)**

#### Features được chọn:
1. **CartContext** (Priority 1)
   - **Lý do**: Core business logic, nhiều edge cases, critical cho checkout flow
   - **Functions**: `addToCart`, `removeFromCart`, `clearCart`, `isInCart`, `getTotalPrice`, `getItemCount`

2. **Checkout API** (Priority 1)
   - **Lý do**: Backend critical path, transaction integrity, payment processing
   - **Endpoints**: `/create-order`, `/enroll-now`, `/complete-payment`, `/invoices`

3. **Auth API** (Priority 2)
   - **Lý do**: Security critical, user management
   - **Endpoints**: `/login`, `/register`, `/avatar`

### **Giai Đoạn 2: Thiết Kế Test Cases (20 phút)**

Sử dụng **Given-When-Then pattern** và **Test Matrix**

---

## 🧪 Test Cases Chi Tiết

### 1. CartContext Tests (18 Test Cases)

#### **Test Matrix**

| Category | Test Case | Input | Expected Output | Priority |
|----------|-----------|-------|----------------|----------|
| **Initialization** | Empty cart on mount | - | `cartItems = []` | HIGH |
| | Load from localStorage | `savedCart = [item1]` | `cartItems.length = 1` | HIGH |
| | Handle corrupted data | `invalid-json` | `cartItems = []` | MEDIUM |
| **addToCart()** | Add new course | `course1` | `length = 1` | HIGH |
| | Add multiple courses | `course1, course2` | `length = 2` | HIGH |
| | Prevent duplicate | `course1 x2` | `length = 1` | HIGH |
| | Save to localStorage | `course1` | `localStorage updated` | HIGH |
| **removeFromCart()** | Remove existing | `courseId = 1` | Item removed | HIGH |
| | Remove non-existing | `courseId = 999` | No change | MEDIUM |
| | Update localStorage | `remove(1)` | localStorage updated | HIGH |
| **clearCart()** | Clear all items | `2 items` | `length = 0` | HIGH |
| | Remove from localStorage | `clear()` | `localStorage.getItem() = null` | HIGH |
| | Clear empty cart | `empty cart` | No error | LOW |
| **isInCart()** | Check existing | `courseId = 1` | `true` | HIGH |
| | Check non-existing | `courseId = 999` | `false` | HIGH |
| | Check empty cart | `empty` | `false` | MEDIUM |
| **getTotalPrice()** | Empty cart | `[]` | `0` | HIGH |
| | Single item | `[100000]` | `100000` | HIGH |
| | Multiple items | `[100k, 200k, 150k]` | `450000` | HIGH |
| | Decimal prices | `[99999.99]` | `99999.99` | MEDIUM |
| | After removal | `remove item` | Updated total | HIGH |
| **getItemCount()** | Empty cart | `[]` | `0` | HIGH |
| | Multiple items | `[c1, c2, c3]` | `3` | HIGH |
| | After removal | `remove 1` | Count - 1 | HIGH |
| **Edge Cases** | Large number (50 items) | `50 courses` | Handles correctly | MEDIUM |
| | Very large prices | `99999999` | No overflow | LOW |
| | Zero price | `price = 0` | Accepts | LOW |
| **Error Handling** | Use without provider | Outside provider | Throws error | HIGH |

#### **AI Prompts Sử Dụng**

##### Prompt 1: Analyze CartContext
```
Analyze this CartContext implementation and identify all functions that need unit testing:

[CartContext.jsx code]

For each function, identify:
1. Main functionality
2. Input parameters and types
3. Expected return values
4. Potential edge cases
5. Dependencies that need mocking (localStorage, useToast)
```

##### Prompt 2: Generate Test Cases
```
Generate comprehensive unit test cases for CartContext's addToCart() function:

function addToCart(course) {
  setCartItems(prevItems => {
    const existingItem = prevItems.find(item => item.id === course.id);
    if (existingItem) {
      toast.info('Khóa học đã có trong giỏ hàng');
      return prevItems;
    }
    toast.success('Đã thêm vào giỏ hàng');
    return [...prevItems, {
      id: course.id,
      title: course.title,
      price: course.price,
      instructor: course.instructorName,
      thumbnail: course.thumbnail,
      level: course.level,
      duration: course.duration
    }];
  });
}

Include:
- Happy path scenarios
- Edge cases (boundary values)
- Error scenarios
- localStorage integration
```

##### Prompt 3: Generate Jest Test Code
```
Create Jest unit tests for CartContext with React Testing Library:

Requirements:
- Use @testing-library/react
- Mock useToast hook
- Mock localStorage
- Test all 7 functions
- Include setup/teardown
- Use proper assertions (toHaveLength, toBe, toEqual)
- Add descriptive test names
- Group tests by describe blocks
```

---

### 2. Checkout API Tests (15 Test Cases)

#### **Test Matrix**

| Endpoint | Test Case | Input | Expected | Priority |
|----------|-----------|-------|----------|----------|
| **POST /create-order** | Valid order | 2 courses + billing | `200, paymentId, invoiceIds` | HIGH |
| | Empty courses | `courses = []` | `400, validation error` | HIGH |
| | Missing billing | Incomplete billing | `400, error` | HIGH |
| | Invalid email | `invalid-email` | `400, error` | MEDIUM |
| | Course not found | `courseId = 999` | `500, rollback` | HIGH |
| | DB transaction error | Connection fail | `500, rollback` | MEDIUM |
| **POST /enroll-now** | Successful enrollment | Valid data | `200, enrollmentId, txnRef` | HIGH |
| | Missing courseId | `courseId = undefined` | `400, error` | HIGH |
| | Non-existent course | `courseId = 999` | `500, rollback` | HIGH |
| | Duplicate enrollment | Enroll twice | `500, rollback` | MEDIUM |
| **POST /complete-payment** | Successful payment | Valid paymentId | `200, txnRef, enrollments` | HIGH |
| | Missing paymentId | `paymentId = undefined` | `400, error` | HIGH |
| | No pending invoices | Invalid paymentId | `500, error` | HIGH |
| | Enrollment fails | DB error | `500, rollback` | HIGH |
| **GET /invoices** | User has invoices | userId = 1 | `200, invoices array` | HIGH |
| | No invoices | New user | `200, empty array` | MEDIUM |
| | DB error | Connection fail | `500, error` | LOW |
| **Authentication** | No auth token | Missing token | `401, Unauthorized` | HIGH |
| **Edge Cases** | Large order (10 courses) | 10 courses | Handles correctly | MEDIUM |
| | Unique txn refs | 2 enrollments | Different refs | HIGH |

#### **AI Prompts Sử Dụng**

##### Prompt 1: Analyze Checkout Routes
```
Analyze this Express.js checkout API routes and identify:

[checkout.js code]

For each endpoint:
1. Request validation requirements
2. Business logic flow
3. Database transactions
4. Error scenarios
5. Response structure
```

##### Prompt 2: Generate API Test Cases
```
Generate integration test cases for POST /create-order endpoint:

Endpoint: POST /api/checkout/create-order
Authentication: Required (JWT)
Input:
- courses: Array<{courseId: number}>
- billingInfo: Object (firstName, lastName, email, address, city, country, zipCode)
- paymentMethod: string

Include test cases for:
- Valid multi-course order
- Validation errors (empty array, missing fields, invalid email)
- Database errors (course not found, transaction failure)
- Transaction rollback scenarios
```

##### Prompt 3: Generate Supertest Code
```
Create supertest integration tests for Checkout API:

Requirements:
- Use supertest + jest
- Mock database (getPool, sql)
- Mock authentication middleware
- Test all 4 endpoints
- Include transaction mocking
- Test rollback scenarios
- Verify HTTP status codes
- Check response structure
```

---

## 🛠️ Setup & Installation

### Frontend Tests (Jest + React Testing Library)

```bash
# Cài đặt dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @babel/preset-react identity-obj-proxy

# Tạo jest.config.js
# Tạo babel.config.test.js
# Tạo src/test/setupTests.js
```

### Backend Tests (Jest + Supertest)

```bash
cd backend

# Cài đặt dependencies
npm install --save-dev jest supertest @babel/preset-env babel-jest

# Tạo jest.config.js
# Tạo babel.config.js
```

---

## 🚀 Chạy Tests

### Frontend
```bash
# Chạy tất cả tests
npm run test:jest

# Watch mode
npm run test:jest:watch

# Coverage report
npm run test:jest:coverage
```

### Backend
```bash
cd backend

# Chạy tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Chạy tất cả
```bash
# Root directory
npm run test:all
```

---

## 📈 Coverage Reports

### Xem Coverage

```bash
# Frontend
npm run test:jest:coverage
# Mở: coverage/lcov-report/index.html

# Backend
cd backend && npm test -- --coverage
# Mở: backend/coverage/lcov-report/index.html
```

### Coverage Thresholds

**Frontend (jest.config.js)**:
```javascript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

**Backend (jest.config.js)**:
```javascript
coverageThresholds: {
  global: {
    branches: 60,
    functions: 60,
    lines: 60,
    statements: 60
  }
}
```

---

## 🧩 Mocking Strategies

### Frontend Mocks

#### localStorage
```javascript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

#### useToast Hook
```javascript
jest.mock('../hooks/useToast', () => ({
  useToast: () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    }
  })
}));
```

### Backend Mocks

#### Database Pool
```javascript
const mockPool = {
  request: jest.fn().mockReturnValue(mockRequest),
  transaction: jest.fn().mockReturnValue(mockTransaction)
};
getPool.mockResolvedValue(mockPool);
```

#### Authentication Middleware
```javascript
authenticateToken.mockImplementation((req, res, next) => {
  req.user = { userId: 1, email: 'test@example.com' };
  next();
});
```

---

## 📝 Best Practices

### 1. Test Naming Convention
```javascript
describe('Module/Function Name', () => {
  describe('Happy Path', () => {
    test('should do X when Y', () => {});
  });
  
  describe('Edge Cases', () => {
    test('should handle Z edge case', () => {});
  });
  
  describe('Error Handling', () => {
    test('should throw error when invalid input', () => {});
  });
});
```

### 2. AAA Pattern (Arrange-Act-Assert)
```javascript
test('should add item to cart', () => {
  // Arrange
  const course = { id: 1, title: 'Test', price: 100000 };
  
  // Act
  act(() => {
    cart.addToCart(course);
  });
  
  // Assert
  expect(cart.cartItems).toHaveLength(1);
});
```

### 3. Isolation
- Mỗi test độc lập, không phụ thuộc nhau
- Use `beforeEach` để reset state
- Clear mocks sau mỗi test

### 4. Coverage Goals
- Critical paths: 90%+
- Business logic: 80%+
- UI components: 70%+
- Utilities: 85%+

---

## 🐛 Debugging Tips

### Test Failures
```bash
# Chạy 1 test file
npm test CartContext.test.jsx

# Chạy với verbose
npm test -- --verbose

# Debug với Node
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Common Issues

1. **"Cannot find module"**
   - Check `moduleNameMapper` in jest.config.js
   - Verify import paths

2. **"localStorage is not defined"**
   - Ensure setupTests.js mocks localStorage
   - Check `setupFilesAfterEnv` in config

3. **"Cannot read property of undefined"**
   - Verify mock setup in beforeEach
   - Check async/await usage

---

## 📚 References

- [AI4SE Unit Testing Tutorial](https://tamttt14.github.io/AI4SEProject/index.html)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

## 👥 Contributors

**Testing Strategy**: AI-Driven (ChatGPT/Claude)
**Implementation**: Development Team
**Method**: AI4SE Project Tutorial

---

## 📅 Test Maintenance

### Khi nào cập nhật tests?

1. **Thêm feature mới** → Viết tests trước (TDD)
2. **Sửa bug** → Thêm test case cho bug đó
3. **Refactor code** → Đảm bảo tests vẫn pass
4. **API changes** → Cập nhật integration tests

### Review Checklist

- [ ] All tests pass
- [ ] Coverage > thresholds
- [ ] No console errors/warnings
- [ ] Tests độc lập
- [ ] Descriptive test names
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Mocks properly cleaned up
