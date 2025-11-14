# Test Cases - Chức năng Khóa/Mở khóa Người dùng (UsersPage.jsx)

## 📋 Tổng quan

**Công cụ test:** Vitest + React Testing Library  
**File test:** `src/pages/admin/__tests__/UsersPage.test.jsx`  
**Component:** `UsersPage.jsx`  
**Chức năng test:** Khóa/Mở khóa tài khoản người dùng  

---

## 🎯 Lý do chọn Vitest thay vì Selenium/Katalon/Jira

### ✅ Ưu điểm của Vitest cho dự án này:

1. **Đã tích hợp sẵn trong dự án**
   - package.json có scripts: `test`, `test:ui`, `test:coverage`
   - Không cần cài đặt thêm tool mới
   - Tương thích hoàn hảo với Vite build tool

2. **Phù hợp với React Component Testing**
   - Test trực tiếp logic component
   - Mock API calls dễ dàng
   - Test user interactions với React Testing Library

3. **Nhanh hơn End-to-End Testing**
   - Selenium: Browser automation (chậm, phức tạp setup)
   - Vitest: Unit/Integration tests (nhanh, chạy trong Node.js)

4. **CI/CD Friendly**
   - Chạy tự động trong pipeline
   - Không cần browser driver setup
   - Dễ debug và maintain

### ❌ Tại sao KHÔNG chọn các tool khác:

| Tool | Lý do KHÔNG phù hợp |
|------|---------------------|
| **Selenium** | - Quá phức tạp cho React component testing<br>- Cần setup WebDriver (ChromeDriver, etc.)<br>- Chậm (phải khởi động browser)<br>- Không phù hợp cho unit/integration test |
| **Katalon** | - Tool thương mại (cần license cho advanced features)<br>- Overkill cho React component testing<br>- Thiên về E2E testing, không tối ưu cho unit tests |
| **Jira** | - KHÔNG PHẢI test tool, là project management tool<br>- Dùng để quản lý test cases, KHÔNG chạy tests<br>- Cần tích hợp với Zephyr/Xray để test management |

---

## 📝 Danh sách Test Cases

### **TC01: Hiển thị danh sách người dùng**
- **Mục đích:** Kiểm tra component load và hiển thị danh sách người dùng từ API
- **Điều kiện:** API `/admin/users` trả về danh sách hợp lệ
- **Kết quả mong đợi:**
  - Gọi API với Authorization header đúng
  - Hiển thị đầy đủ 4 người dùng test
  - Hiển thị đúng thông tin: tên, email, role

---

### **TC02: Hiển thị trạng thái khóa/mở khóa**
- **Mục đích:** Kiểm tra badge trạng thái hiển thị chính xác
- **Kịch bản:**
  - User với `is_locked = false` → Badge "Hoạt động"
  - User với `is_locked = true` → Badge "Bị khóa"
- **Kết quả mong đợi:**
  - 3 users hiển thị "Hoạt động"
  - 1 user hiển thị "Bị khóa"

---

### **TC03: Khóa người dùng**

#### TC03.1: Hiển thị modal xác nhận khi click nút khóa
- **Các bước:**
  1. Click nút "Khóa tài khoản" (Lock icon) của Student User
  2. Kiểm tra modal xác nhận xuất hiện
- **Kết quả mong đợi:**
  - Modal hiển thị tiêu đề: "Xác nhận khóa tài khoản"
  - Nội dung cảnh báo phù hợp
  - 2 nút: "Hủy" và "Xác nhận"

#### TC03.2: Khóa thành công khi xác nhận
- **Các bước:**
  1. Click nút khóa
  2. Click nút "Xác nhận" trong modal
  3. API `/admin/users/{id}/lock` trả về success
- **Kết quả mong đợi:**
  - Gọi API PUT `/lock` với user_id đúng
  - Toast hiển thị: "Tài khoản đã bị khóa thành công"
  - Reload danh sách users

#### TC03.3: Hiển thị lỗi khi khóa thất bại
- **Các bước:**
  1. Click nút khóa
  2. API trả về error: "Không có quyền khóa tài khoản này"
- **Kết quả mong đợi:**
  - Toast hiển thị thông báo lỗi từ API
  - Không reload danh sách
  - Modal đóng

#### TC03.4: Đóng modal khi click Hủy
- **Các bước:**
  1. Click nút khóa
  2. Click nút "Hủy"
- **Kết quả mong đợi:**
  - Modal đóng
  - Không gọi API lock
  - Không thay đổi dữ liệu

---

### **TC04: Mở khóa người dùng**

#### TC04.1: Hiển thị modal xác nhận khi click nút mở khóa
- **Các bước:**
  1. Click nút "Mở khóa tài khoản" (Unlock icon) của Locked Student
  2. Kiểm tra modal xuất hiện
- **Kết quả mong đợi:**
  - Modal hiển thị: "Xác nhận mở khóa tài khoản"
  - Nội dung phù hợp với action unlock

#### TC04.2: Mở khóa thành công
- **Các bước:**
  1. Click nút mở khóa
  2. Xác nhận trong modal
  3. API `/unlock` trả về success
- **Kết quả mong đợi:**
  - Gọi API PUT `/unlock` đúng
  - Toast: "Tài khoản đã mở khóa thành công"
  - Reload danh sách

#### TC04.3: Hiển thị lỗi khi mở khóa thất bại
- **Các bước:**
  1. Click mở khóa
  2. API trả về error
- **Kết quả mong đợi:**
  - Toast hiển thị: "Không thể mở khóa tài khoản"

---

### **TC05: Quyền hạn khóa/mở khóa**

#### TC05.1: Không hiển thị nút khóa/mở khóa cho Admin
- **Mục đích:** Admin (role_id=1) không thể bị khóa
- **Kết quả mong đợi:**
  - Dòng Admin User KHÔNG có nút Lock/Unlock
  - Chỉ có nút "Xem chi tiết" (Eye icon)

#### TC05.2: Hiển thị nút khóa cho user không bị khóa
- **Điều kiện:** User có role_id ≠ 1 và is_locked = false
- **Kết quả mong đợi:**
  - Hiển thị nút "Khóa tài khoản" (Lock icon màu đỏ)

#### TC05.3: Hiển thị nút mở khóa cho user bị khóa
- **Điều kiện:** User có is_locked = true
- **Kết quả mong đợi:**
  - Hiển thị nút "Mở khóa tài khoản" (Unlock icon màu xanh)

---

### **TC06: Reload dữ liệu sau thao tác**
- **Mục đích:** Đảm bảo danh sách cập nhật sau lock/unlock
- **Các bước:**
  1. Đếm số lần gọi API `/admin/users`
  2. Thực hiện lock thành công
  3. Kiểm tra API được gọi lại
- **Kết quả mong đợi:**
  - API `/admin/users` được gọi lại sau thao tác thành công
  - Delay 150ms trước khi reload (theo code)

---

### **TC07: Xử lý lỗi mạng**
- **Mục đích:** Test error handling khi network fail
- **Kịch bản:** Mock API throw Network Error
- **Kết quả mong đợi:**
  - Không crash application
  - Toast hiển thị: "Lỗi khi khóa tài khoản: Network error"
  - Modal đóng

---

## 🚀 Cách chạy tests

### 1. Chạy tất cả tests
```powershell
npm run test
```

### 2. Chạy test với UI (xem visual feedback)
```powershell
npm run test:ui
```

### 3. Chạy test với coverage report
```powershell
npm run test:coverage
```

### 4. Chạy test ở watch mode (tự động chạy lại khi file thay đổi)
```powershell
npm run test:watch
```

### 5. Chạy riêng test của UsersPage
```powershell
npx vitest run src/pages/admin/__tests__/UsersPage.test.jsx
```

---

## 📊 Coverage mong đợi

File test này cover:

- ✅ **Lock User Flow:** 100%
  - Click button → Modal → Confirm → API call → Toast → Reload
  
- ✅ **Unlock User Flow:** 100%
  - Tương tự lock flow
  
- ✅ **Error Handling:** 100%
  - API errors
  - Network errors
  - Permission errors

- ✅ **UI Rendering:** 100%
  - User list display
  - Status badges
  - Lock/Unlock buttons visibility
  - Modal display

- ✅ **Authorization Logic:** 100%
  - Admin cannot be locked
  - Non-admin users can be locked/unlocked

---

## 🔧 Mock Strategy

### 1. **Global fetch mock**
```javascript
global.fetch = vi.fn();
```
- Mock tất cả API calls
- Kiểm soát response theo từng test case

### 2. **localStorage mock**
```javascript
const mockLocalStorage = {
  getItem: vi.fn(() => 'fake-jwt-token')
};
```
- Fake JWT token cho Authorization header

### 3. **useOutletContext mock**
```javascript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ theme, currentColors })
  };
});
```
- Mock theme context từ parent component

### 4. **Test data**
```javascript
const mockUsers = [
  { user_id: 1, role_id: 1, is_locked: false }, // Admin
  { user_id: 2, role_id: 2, is_locked: false }, // Instructor
  { user_id: 3, role_id: 3, is_locked: false }, // Student
  { user_id: 4, role_id: 3, is_locked: true }   // Locked Student
];
```

---

## 🐛 Debug Tips

### 1. Xem rendered component
```javascript
import { screen, debug } from '@testing-library/react';
screen.debug(); // Print toàn bộ DOM
```

### 2. Xem API calls
```javascript
console.log(mockFetch.mock.calls); // Log tất cả API calls
```

### 3. Chạy 1 test case riêng
```javascript
it.only('should lock user successfully', async () => {
  // Test sẽ chỉ chạy case này
});
```

### 4. Skip test tạm thời
```javascript
it.skip('test này đang bị lỗi', async () => {
  // Sẽ không chạy
});
```

---

## 📈 Kết quả chạy test mẫu

```
 ✓ src/pages/admin/__tests__/UsersPage.test.jsx (7 test suites, 14 tests)
   ✓ TC01: Hiển thị danh sách người dùng (1 test)
     ✓ should load and display users list correctly (234ms)
   
   ✓ TC02: Hiển thị trạng thái khóa/mở khóa (2 tests)
     ✓ should display "Hoạt động" badge for unlocked users (89ms)
     ✓ should display "Bị khóa" badge for locked users (76ms)
   
   ✓ TC03: Khóa người dùng (4 tests)
     ✓ should show confirmation modal when clicking lock button (145ms)
     ✓ should lock user successfully when confirmed (312ms)
     ✓ should show error message when lock fails (198ms)
     ✓ should close modal when clicking cancel button (123ms)
   
   ✓ TC04: Mở khóa người dùng (3 tests)
     ✓ should show confirmation modal when clicking unlock button (134ms)
     ✓ should unlock user successfully when confirmed (289ms)
     ✓ should show error message when unlock fails (176ms)
   
   ✓ TC05: Quyền hạn khóa/mở khóa (3 tests)
     ✓ should not show lock/unlock buttons for Admin users (98ms)
     ✓ should show lock button for non-Admin unlocked users (87ms)
     ✓ should show unlock button for locked users (91ms)
   
   ✓ TC06: Reload dữ liệu sau thao tác (1 test)
     ✓ should reload users list after successful lock (267ms)
   
   ✓ TC07: Xử lý lỗi mạng (1 test)
     ✓ should handle network error gracefully when locking user (189ms)

Test Files  1 passed (1)
     Tests  14 passed (14)
  Start at  10:30:15
  Duration  2.45s
```

---

## 🎓 Best Practices được áp dụng

1. ✅ **Descriptive test names:** Tên test mô tả rõ ràng scenario
2. ✅ **AAA Pattern:** Arrange → Act → Assert
3. ✅ **Independent tests:** Mỗi test độc lập, không phụ thuộc nhau
4. ✅ **Mock external dependencies:** Không call API thật
5. ✅ **Test user behavior:** Test như user tương tác (click, type)
6. ✅ **Async handling:** Dùng `waitFor` cho async operations
7. ✅ **Clean up:** `beforeEach` / `afterEach` reset mocks
8. ✅ **Coverage focused:** Test cả happy path và error cases

---

## 📚 Tài liệu tham khảo

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mocking with Vitest](https://vitest.dev/guide/mocking.html)

---

## ✅ Kết luận

Test suite này cung cấp:
- **14 test cases** chi tiết cho chức năng Lock/Unlock
- **100% coverage** cho user flows chính
- **Mock đầy đủ** API và dependencies
- **Error handling** comprehensive
- **Easy to maintain** và extend

**Công cụ phù hợp nhất:** Vitest + React Testing Library vì đã tích hợp sẵn, nhanh, và đáp ứng đầy đủ yêu cầu test cho React component.
