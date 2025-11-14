# Selenium WebDriver E2E Testing Guide

## 📋 Overview
Selenium WebDriver tests for Lock/Unlock User functionality in UsersPage

## 🛠️ Installation

```bash
# Install Selenium WebDriver và ChromeDriver
npm install --save-dev selenium-webdriver chromedriver
```

## ✅ Prerequisites

1. **Chrome Browser** installed
2. **Backend server** running on `http://localhost:3001`
3. **Frontend server** running on `http://localhost:5173`
4. **Admin account** với credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

## 🚀 Running Tests

### Run Full Test Suite
```bash
node tests/e2e/selenium/UsersPage.selenium.test.js
```

### Run with Headless Mode
Uncomment line 26 in test file:
```javascript
options.addArguments('--headless');
```

## 🧪 Test Cases

| # | Test Name | Description |
|---|-----------|-------------|
| 1 | **Users Page Loads** | Verify page loads, table displays, users loaded |
| 2 | **Lock User** | Click lock button → Confirm → Verify user locked |
| 3 | **Unlock User** | Click unlock button → Confirm → Verify user unlocked |
| 4 | **Cancel Lock** | Click lock → Cancel → Verify status unchanged |
| 5 | **Search Functionality** | Search user by email → Verify results |

## 📊 Expected Output

```
🚀 Setting up Selenium WebDriver...
✅ WebDriver initialized

🔐 Logging in as Admin...
✅ Login successful

🧪 TEST 1: Verify Users Page Loads
📄 Navigating to Users Page...
✅ Users page loaded
   ✓ Page title: "Quản lý người dùng"
   ✓ Table displayed
   ✓ Users loaded: 15
✅ PASSED

🧪 TEST 2: Lock User Functionality
   Locking user: student@example.com
   ✓ Lock confirmation modal displayed
   ✓ Toast notification: "Khóa người dùng thành công"
   ✓ User status changed to locked
✅ PASSED

🧪 TEST 3: Unlock User Functionality
   Unlocking user: testuser@example.com
   ✓ Unlock confirmation modal displayed
   ✓ Toast notification: "Mở khóa người dùng thành công"
   ✓ User status changed to active
✅ PASSED

🧪 TEST 4: Cancel Lock Operation
   ✓ Modal closed after cancel
   ✓ User status unchanged
✅ PASSED

🧪 TEST 5: Search Functionality
   Searching for: admin@example.com
   ✓ Found email: true
   ✓ Results: 1
✅ PASSED

============================================================
📊 TEST RESULTS SUMMARY
============================================================

1. Users Page Loads: ✅ PASS
   Details: Title: true, Table: true, Users: 15

2. Lock User: ✅ PASS
   Details: User: student@example.com, Toast: true, Locked: true

3. Unlock User: ✅ PASS
   Details: User: testuser@example.com, Toast: true, Unlocked: true

4. Cancel Lock: ✅ PASS
   Details: Modal closed: true, Status unchanged: true

5. Search Functionality: ✅ PASS
   Details: Found email: true, Results: 1

============================================================
Total Tests: 5
✅ Passed: 5
❌ Failed: 0
Success Rate: 100.00%
============================================================
```

## 🎯 Test Features

### 1. **Selenium Locators**
- CSS Selectors: `By.css('table')`
- XPath: `By.xpath('//*[contains(text(), "Khóa")]')`
- Dynamic element finding

### 2. **Wait Strategies**
- Explicit waits: `until.elementLocated()`
- Implicit waits: `setTimeouts({ implicit: 10000 })`
- Sleep for animations: `driver.sleep(1000)`

### 3. **User Interactions**
- Click buttons: `element.click()`
- Type text: `element.sendKeys()`
- Clear input: `element.clear()`

### 4. **Assertions**
- Element visibility: `element.isDisplayed()`
- Text verification: `element.getText()`
- URL validation: `until.urlContains()`

## 🔍 Troubleshooting

### Chrome version mismatch
```bash
# Update ChromeDriver to match your Chrome version
npm install chromedriver@latest
```

### Timeout errors
Increase timeout in test file:
```javascript
const TIMEOUT = 20000; // 20 seconds
```

### Element not found
Add wait before finding element:
```javascript
await driver.sleep(2000);
await driver.wait(until.elementLocated(By.css('.my-element')), TIMEOUT);
```

## 📁 File Structure
```
tests/
  e2e/
    selenium/
      UsersPage.selenium.test.js  # Main test file
```

## 🆚 Comparison: Selenium vs Vitest

| Feature | Selenium | Vitest |
|---------|----------|--------|
| **Type** | E2E (Browser automation) | Unit/Integration |
| **Speed** | Slower (launches browser) | Faster (jsdom) |
| **Real Browser** | ✅ Yes (Chrome, Firefox) | ❌ No (simulated) |
| **UI Testing** | ✅ Visual verification | ⚠️ Limited |
| **API Testing** | ⚠️ Indirect | ✅ Direct mock |
| **Setup** | Complex (ChromeDriver) | Simple (npm) |
| **CI/CD** | Needs browser | ✅ Lightweight |
| **Use Case** | End-to-end flows | Unit logic testing |

## ✅ Best Practices

1. **Always clean up**: Use `teardown()` to close browser
2. **Use explicit waits**: Better than `sleep()`
3. **Unique selectors**: Use data-testid attributes
4. **Error handling**: Try-catch for robust tests
5. **Headless mode**: For CI/CD pipelines

## 📝 Test Report

Tests can be integrated with reporting tools:
- Mocha/Jest reporters
- Allure reporting
- Custom HTML reports

## 🔗 Related Files
- Unit Tests: `tests/unit/UsersPage.unit.test.jsx`
- Integration Tests: `tests/integration/UsersPage.test.jsx`
- Component: `src/pages/admin/UsersPage.jsx`
