/**
 * SELENIUM WEBDRIVER E2E TESTS
 * Testing Lock/Unlock User Functionality
 * 
 * Installation Required:
 * npm install --save-dev selenium-webdriver chromedriver
 * 
 * Run: node tests/e2e/selenium/UsersPage.selenium.test.js
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Test Configuration
const BASE_URL = 'http://localhost:5173'; // Vite dev server
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const TIMEOUT = 10000;

// Test Data
const TEST_USER = {
  email: 'testuser@example.com',
  username: 'testuser'
};

class UsersPageSeleniumTests {
  constructor() {
    this.driver = null;
    this.testResults = [];
  }

  /**
   * Setup - Khởi tạo WebDriver
   */
  async setup() {
    console.log('🚀 Setting up Selenium WebDriver...');
    
    const options = new chrome.Options();
    // Uncomment để chạy headless
    // options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--window-size=1920,1080');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({ implicit: TIMEOUT });
    console.log('✅ WebDriver initialized');
  }

  /**
   * Teardown - Đóng browser
   */
  async teardown() {
    if (this.driver) {
      await this.driver.quit();
      console.log('🔚 WebDriver closed');
    }
  }

  /**
   * Helper: Login as Admin
   */
  async loginAsAdmin() {
    console.log('\n🔐 Logging in as Admin...');
    
    await this.driver.get(`${BASE_URL}/login`);
    
    // Wait for login form
    await this.driver.wait(until.elementLocated(By.css('input[type="email"]')), TIMEOUT);
    
    // Enter credentials
    const emailInput = await this.driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await this.driver.findElement(By.css('input[type="password"]'));
    
    await emailInput.sendKeys(ADMIN_EMAIL);
    await passwordInput.sendKeys(ADMIN_PASSWORD);
    
    // Click login button
    const loginButton = await this.driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();
    
    // Wait for redirect to admin panel
    await this.driver.wait(until.urlContains('/admin'), TIMEOUT);
    console.log('✅ Login successful');
  }

  /**
   * Helper: Navigate to Users Page
   */
  async navigateToUsersPage() {
    console.log('\n📄 Navigating to Users Page...');
    
    await this.driver.get(`${BASE_URL}/admin/users`);
    
    // Wait for users table to load
    await this.driver.wait(until.elementLocated(By.css('table')), TIMEOUT);
    
    // Wait for users data to load
    await this.driver.sleep(2000);
    console.log('✅ Users page loaded');
  }

  /**
   * Helper: Find user row by email
   */
  async findUserRowByEmail(email) {
    const rows = await this.driver.findElements(By.css('tbody tr'));
    
    for (let row of rows) {
      const emailCell = await row.findElement(By.xpath('.//td[contains(text(), "' + email + '")]')).catch(() => null);
      if (emailCell) {
        return row;
      }
    }
    return null;
  }

  /**
   * Helper: Check if user is locked
   */
  async isUserLocked(userRow) {
    const statusCell = await userRow.findElement(By.xpath('.//td[contains(@class, "px-6") and position()=5]'));
    const statusText = await statusCell.getText();
    return statusText.includes('Đã khóa') || statusText.includes('Bị khóa');
  }

  /**
   * Helper: Wait for toast notification
   */
  async waitForToast(expectedText) {
    try {
      const toast = await this.driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(), "${expectedText}")]`)),
        5000
      );
      return await toast.getText();
    } catch (error) {
      return null;
    }
  }

  /**
   * Test 1: Verify Users Page Loads
   */
  async testUsersPageLoads() {
    console.log('\n🧪 TEST 1: Verify Users Page Loads');
    
    try {
      await this.navigateToUsersPage();
      
      // Verify page title
      const pageTitle = await this.driver.findElement(By.css('h1')).getText();
      const hasCorrectTitle = pageTitle.includes('Quản lý người dùng');
      
      // Verify table exists
      const table = await this.driver.findElement(By.css('table'));
      const tableExists = await table.isDisplayed();
      
      // Verify users loaded
      const rows = await this.driver.findElements(By.css('tbody tr'));
      const hasUsers = rows.length > 0;
      
      const passed = hasCorrectTitle && tableExists && hasUsers;
      
      this.testResults.push({
        test: 'Users Page Loads',
        passed,
        details: `Title: ${hasCorrectTitle}, Table: ${tableExists}, Users: ${rows.length}`
      });
      
      console.log(passed ? '✅ PASSED' : '❌ FAILED');
      return passed;
      
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      this.testResults.push({ test: 'Users Page Loads', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test 2: Lock User Functionality
   */
  async testLockUser() {
    console.log('\n🧪 TEST 2: Lock User Functionality');
    
    try {
      await this.navigateToUsersPage();
      
      // Find an active user (not locked)
      const rows = await this.driver.findElements(By.css('tbody tr'));
      let targetRow = null;
      
      for (let row of rows) {
        const isLocked = await this.isUserLocked(row);
        if (!isLocked) {
          targetRow = row;
          break;
        }
      }
      
      if (!targetRow) {
        console.log('⚠️ No active users found to test lock');
        this.testResults.push({ test: 'Lock User', passed: false, details: 'No active users' });
        return false;
      }
      
      // Get user email before locking
      const emailCell = await targetRow.findElement(By.xpath('.//td[3]'));
      const userEmail = await emailCell.getText();
      console.log(`   Locking user: ${userEmail}`);
      
      // Click lock button
      const lockButton = await targetRow.findElement(By.css('button[title*="Khóa"]'));
      await lockButton.click();
      
      // Wait for confirmation modal
      await this.driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Xác nhận khóa")]')), TIMEOUT);
      console.log('   ✓ Lock confirmation modal displayed');
      
      // Click confirm button
      const confirmButton = await this.driver.findElement(By.xpath('//button[contains(text(), "Xác nhận")]'));
      await confirmButton.click();
      
      // Wait for success toast
      const toastText = await this.waitForToast('khóa thành công');
      const toastAppeared = toastText !== null;
      console.log(`   ✓ Toast notification: ${toastText || 'Not found'}`);
      
      // Wait for page reload
      await this.driver.sleep(1000);
      
      // Verify user is now locked
      const updatedRow = await this.findUserRowByEmail(userEmail);
      const nowLocked = updatedRow ? await this.isUserLocked(updatedRow) : false;
      
      const passed = toastAppeared && nowLocked;
      
      this.testResults.push({
        test: 'Lock User',
        passed,
        details: `User: ${userEmail}, Toast: ${toastAppeared}, Locked: ${nowLocked}`
      });
      
      console.log(passed ? '✅ PASSED' : '❌ FAILED');
      return passed;
      
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      this.testResults.push({ test: 'Lock User', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test 3: Unlock User Functionality
   */
  async testUnlockUser() {
    console.log('\n🧪 TEST 3: Unlock User Functionality');
    
    try {
      await this.navigateToUsersPage();
      
      // Find a locked user
      const rows = await this.driver.findElements(By.css('tbody tr'));
      let targetRow = null;
      
      for (let row of rows) {
        const isLocked = await this.isUserLocked(row);
        if (isLocked) {
          targetRow = row;
          break;
        }
      }
      
      if (!targetRow) {
        console.log('⚠️ No locked users found to test unlock');
        this.testResults.push({ test: 'Unlock User', passed: false, details: 'No locked users' });
        return false;
      }
      
      // Get user email before unlocking
      const emailCell = await targetRow.findElement(By.xpath('.//td[3]'));
      const userEmail = await emailCell.getText();
      console.log(`   Unlocking user: ${userEmail}`);
      
      // Click unlock button
      const unlockButton = await targetRow.findElement(By.css('button[title*="Mở khóa"]'));
      await unlockButton.click();
      
      // Wait for confirmation modal
      await this.driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Xác nhận mở khóa")]')), TIMEOUT);
      console.log('   ✓ Unlock confirmation modal displayed');
      
      // Click confirm button
      const confirmButton = await this.driver.findElement(By.xpath('//button[contains(text(), "Xác nhận")]'));
      await confirmButton.click();
      
      // Wait for success toast
      const toastText = await this.waitForToast('mở khóa thành công');
      const toastAppeared = toastText !== null;
      console.log(`   ✓ Toast notification: ${toastText || 'Not found'}`);
      
      // Wait for page reload
      await this.driver.sleep(1000);
      
      // Verify user is now unlocked
      const updatedRow = await this.findUserRowByEmail(userEmail);
      const nowUnlocked = updatedRow ? !(await this.isUserLocked(updatedRow)) : false;
      
      const passed = toastAppeared && nowUnlocked;
      
      this.testResults.push({
        test: 'Unlock User',
        passed,
        details: `User: ${userEmail}, Toast: ${toastAppeared}, Unlocked: ${nowUnlocked}`
      });
      
      console.log(passed ? '✅ PASSED' : '❌ FAILED');
      return passed;
      
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      this.testResults.push({ test: 'Unlock User', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test 4: Cancel Lock Operation
   */
  async testCancelLockOperation() {
    console.log('\n🧪 TEST 4: Cancel Lock Operation');
    
    try {
      await this.navigateToUsersPage();
      
      // Find an active user
      const rows = await this.driver.findElements(By.css('tbody tr'));
      let targetRow = null;
      
      for (let row of rows) {
        const isLocked = await this.isUserLocked(row);
        if (!isLocked) {
          targetRow = row;
          break;
        }
      }
      
      if (!targetRow) {
        console.log('⚠️ No active users found');
        this.testResults.push({ test: 'Cancel Lock', passed: false, details: 'No active users' });
        return false;
      }
      
      // Get user email
      const emailCell = await targetRow.findElement(By.xpath('.//td[3]'));
      const userEmail = await emailCell.getText();
      
      // Get initial lock status
      const initialLocked = await this.isUserLocked(targetRow);
      
      // Click lock button
      const lockButton = await targetRow.findElement(By.css('button[title*="Khóa"]'));
      await lockButton.click();
      
      // Wait for modal
      await this.driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Xác nhận khóa")]')), TIMEOUT);
      
      // Click cancel button
      const cancelButton = await this.driver.findElement(By.xpath('//button[contains(text(), "Hủy")]'));
      await cancelButton.click();
      
      // Wait for modal to close
      await this.driver.sleep(500);
      
      // Verify modal closed
      const modals = await this.driver.findElements(By.xpath('//*[contains(text(), "Xác nhận khóa")]'));
      const modalClosed = modals.length === 0;
      
      // Verify user status unchanged
      const currentRow = await this.findUserRowByEmail(userEmail);
      const currentLocked = await this.isUserLocked(currentRow);
      const statusUnchanged = initialLocked === currentLocked;
      
      const passed = modalClosed && statusUnchanged;
      
      this.testResults.push({
        test: 'Cancel Lock',
        passed,
        details: `Modal closed: ${modalClosed}, Status unchanged: ${statusUnchanged}`
      });
      
      console.log(passed ? '✅ PASSED' : '❌ FAILED');
      return passed;
      
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      this.testResults.push({ test: 'Cancel Lock', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test 5: Search Functionality
   */
  async testSearchFunctionality() {
    console.log('\n🧪 TEST 5: Search Functionality');
    
    try {
      await this.navigateToUsersPage();
      
      // Get first user email
      const firstRow = await this.driver.findElement(By.css('tbody tr:first-child'));
      const emailCell = await firstRow.findElement(By.xpath('.//td[3]'));
      const searchEmail = await emailCell.getText();
      
      console.log(`   Searching for: ${searchEmail}`);
      
      // Find search input
      const searchInput = await this.driver.findElement(By.css('input[placeholder*="Tìm kiếm"]'));
      
      // Enter search term
      await searchInput.clear();
      await searchInput.sendKeys(searchEmail);
      
      // Wait for search results
      await this.driver.sleep(1000);
      
      // Count visible rows
      const visibleRows = await this.driver.findElements(By.css('tbody tr'));
      
      // Verify search results contain the email
      let foundEmail = false;
      for (let row of visibleRows) {
        const text = await row.getText();
        if (text.includes(searchEmail)) {
          foundEmail = true;
          break;
        }
      }
      
      const passed = foundEmail && visibleRows.length > 0;
      
      this.testResults.push({
        test: 'Search Functionality',
        passed,
        details: `Found email: ${foundEmail}, Results: ${visibleRows.length}`
      });
      
      console.log(passed ? '✅ PASSED' : '❌ FAILED');
      return passed;
      
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      this.testResults.push({ test: 'Search Functionality', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Print Test Results Summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${index + 1}. ${result.test}: ${status}`);
      console.log(`   Details: ${result.details || result.error || 'N/A'}`);
      
      if (result.passed) passed++;
      else failed++;
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(2)}%`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Run All Tests
   */
  async runAllTests() {
    try {
      await this.setup();
      await this.loginAsAdmin();
      
      // Run tests
      await this.testUsersPageLoads();
      await this.testLockUser();
      await this.testUnlockUser();
      await this.testCancelLockOperation();
      await this.testSearchFunctionality();
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.teardown();
    }
  }
}

// Run tests
(async () => {
  const tests = new UsersPageSeleniumTests();
  await tests.runAllTests();
})();
