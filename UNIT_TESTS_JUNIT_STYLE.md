# 📋 NUnit/JUnit Style Unit Tests - UsersPage

## 📚 Tổng quan

File này chứa **Unit Tests** theo chuẩn **JUnit/NUnit** cho chức năng Lock/Unlock người dùng trong UsersPage.

### 🔄 Mapping Vitest ↔ JUnit/NUnit

| Vitest (JavaScript) | JUnit (Java) | NUnit (C#) | Mục đích |
|---------------------|--------------|------------|----------|
| `describe()` | `@TestClass` | `[TestFixture]` | Nhóm test cases |
| `test()` / `it()` | `@Test` | `[Test]` | Một test case |
| `beforeEach()` | `@BeforeEach` | `[SetUp]` | Setup trước mỗi test |
| `afterEach()` | `@AfterEach` | `[TearDown]` | Cleanup sau mỗi test |
| `expect().toBe()` | `assertEquals()` | `Assert.AreEqual()` | So sánh giá trị |
| `expect().toBeGreaterThan()` | `assertTrue()` | `Assert.IsTrue()` | Kiểm tra điều kiện |

---

## 📂 Cấu trúc Test Suites

### **Suite 1: Data Normalization Tests** (4 tests)
Kiểm tra normalize dữ liệu từ SQL Server (BIT → string "0"/"1" → boolean)

```javascript
✅ testNormalizeStringZeroToFalse()
✅ testNormalizeStringOneToTrue()
✅ testNormalizeTrueBooleanRemainTrue()
✅ testNormalizeFalseBooleanRemainFalse()
```

### **Suite 2: Lock User Functionality Tests** (5 tests)
Kiểm tra chức năng khóa người dùng

```javascript
✅ testLockUserModalDisplaysCorrectMessage()
✅ testLockUserApiCallWithCorrectPayload()
✅ testLockUserSuccessShowsToast()
✅ testLockUserFailureShowsErrorToast()
✅ testLockUserReloadsDataAfterSuccess()
```

### **Suite 3: Unlock User Functionality Tests** (3 tests)
Kiểm tra chức năng mở khóa người dùng

```javascript
✅ testUnlockUserModalDisplaysCorrectMessage()
✅ testUnlockUserApiCallWithCorrectEndpoint()
✅ testUnlockUserSuccessReloadsData()
```

### **Suite 4: Authorization & Security Tests** (3 tests)
Kiểm tra bảo mật và authorization

```javascript
✅ testLockRequestIncludesAuthToken()
✅ testUnlockRequestIncludesAuthToken()
✅ testTokenRetrievedFromLocalStorage()
```

### **Suite 5: Modal Behavior Tests** (3 tests)
Kiểm tra hành vi của confirmation modal

```javascript
✅ testCancelLockClosesModal()
✅ testCancelUnlockClosesModal()
✅ testCancelDoesNotCallApi()
```

### **Suite 6: Error Handling Tests** (2 tests)
Kiểm tra xử lý lỗi

```javascript
✅ testNetworkErrorHandling()
✅ test401UnauthorizedHandling()
```

---

## 🚀 Cách chạy tests

### Chạy tất cả unit tests:
```bash
npm test tests/unit/UsersPage.unit.test.jsx
```

### Chạy một test suite cụ thể:
```bash
npx vitest tests/unit/UsersPage.unit.test.jsx -t "Data Normalization"
```

### Chạy một test case cụ thể:
```bash
npx vitest tests/unit/UsersPage.unit.test.jsx -t "should normalize string 0"
```

### Chạy với coverage report:
```bash
npm run test:coverage -- tests/unit/UsersPage.unit.test.jsx
```

### Chạy watch mode (tự động re-run khi file thay đổi):
```bash
npx vitest tests/unit/UsersPage.unit.test.jsx --watch
```

---

## 📊 Test Coverage

**Total Tests**: 20 tests  
**Expected Pass Rate**: 100%

### Coverage by Functionality:
- ✅ Data Normalization: 4/4 tests
- ✅ Lock User: 5/5 tests
- ✅ Unlock User: 3/3 tests
- ✅ Authorization: 3/3 tests
- ✅ Modal Behavior: 3/3 tests
- ✅ Error Handling: 2/2 tests

---

## 🧪 Test Patterns

### 1. AAA Pattern (Arrange-Act-Assert)
Tất cả tests tuân theo pattern:
```javascript
test('should do something', async () => {
  // ARRANGE - Setup mock data và environment
  fetch.mockImplementation(...);
  
  // ACT - Thực hiện action
  renderUsersPage();
  fireEvent.click(button);
  
  // ASSERT - Kiểm tra kết quả
  expect(result).toBe(expected);
});
```

### 2. Test Fixtures
Sử dụng factory functions để tạo test data:
```javascript
const createMockUser = (id, username, email, roleId, isLocked) => ({
  user_id: id,
  username,
  email,
  fullname: `${username} User`,
  role_id: roleId,
  is_locked: isLocked,
  created_at: new Date().toISOString()
});
```

### 3. Mock Strategy
- **Global mocks**: `fetch`, `localStorage`
- **Module mocks**: `useOutletContext` (React Router)
- **Function mocks**: API responses

---

## 📝 Test Naming Convention

Format: `should[ExpectedBehavior]When[StateUnderTest]`

**Examples**:
- ✅ `should normalize string "0" to false boolean`
- ✅ `should display correct confirmation message when locking user`
- ✅ `should include Bearer token in lock request headers`

---

## 🔍 Assertions Used

| Assertion | Usage | Example |
|-----------|-------|---------|
| `expect().toBe()` | So sánh giá trị chính xác | `expect(value).toBe(true)` |
| `expect().toBeGreaterThan()` | So sánh số lớn hơn | `expect(count).toBeGreaterThan(0)` |
| `expect().toBeInTheDocument()` | Kiểm tra element trong DOM | `expect(element).toBeInTheDocument()` |
| `expect().toHaveBeenCalledWith()` | Kiểm tra function call | `expect(fn).toHaveBeenCalledWith(args)` |
| `expect().toBeDefined()` | Kiểm tra không undefined | `expect(value).toBeDefined()` |

---

## 🐛 Common Issues & Solutions

### Issue 1: "React is not defined"
**Solution**: Import React ở đầu file
```javascript
import React from 'react';
```

### Issue 2: "useOutletContext is not defined"
**Solution**: Mock React Router DOM
```javascript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ theme: 'light', currentColors: {...} })
  };
});
```

### Issue 3: "fetch is not defined"
**Solution**: Mock global fetch
```javascript
global.fetch = vi.fn();
```

---

## 📖 References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [NUnit Documentation](https://docs.nunit.org/)

---

## ✅ Best Practices

1. ✅ **Mỗi test case test MỘT behavior duy nhất**
2. ✅ **Sử dụng descriptive test names**
3. ✅ **Mock tất cả external dependencies**
4. ✅ **Cleanup sau mỗi test (afterEach)**
5. ✅ **Sử dụng waitFor cho async operations**
6. ✅ **Tránh hardcode values, dùng constants**
7. ✅ **Test cả success và error cases**
8. ✅ **Verify API calls với đúng parameters**

---

**Created**: November 14, 2025  
**Framework**: Vitest v3.2.4 + React Testing Library  
**Total Tests**: 20 unit tests  
**Coverage**: Lock/Unlock user functionality
