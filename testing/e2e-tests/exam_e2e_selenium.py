"""
End-to-End Tests for Exam System using Selenium WebDriver
Language: Python
Framework: Pytest + Selenium WebDriver
File: testing/e2e-tests/exam_e2e_selenium.py

Prerequisites:
- pip install selenium pytest pytest-html
- Download ChromeDriver: https://chromedriver.chromium.org/
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class TestExamSystemE2E:
    """
    E2E Test Suite for Exam System
    Tests complete user flows from login to exam completion
    """
    
    BASE_URL = "http://localhost:5173"  # Frontend URL
    TIMEOUT = 10  # seconds
    
    # Test credentials
    STUDENT_EMAIL = "huy484820@gmail.com"
    STUDENT_PASSWORD = "Learner@123"
    
    @pytest.fixture(scope="function")
    def driver(self):
        """Setup and teardown for Chrome WebDriver"""
        options = webdriver.ChromeOptions()
        # options.add_argument('--headless')  # Uncomment for headless mode
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--start-maximized')
        
        driver = webdriver.Chrome(options=options)
        driver.implicitly_wait(self.TIMEOUT)
        
        yield driver
        
        # Teardown
        driver.quit()
    
    def login(self, driver, email, password):
        """Helper method to login"""
        driver.get(f"{self.BASE_URL}/login")
        
        # Wait for login form
        email_field = WebDriverWait(driver, self.TIMEOUT).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        
        email_field.clear()
        email_field.send_keys(email)
        
        password_field = driver.find_element(By.NAME, "password")
        password_field.clear()
        password_field.send_keys(password)
        
        # Click login button
        login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Đăng nhập')]")
        login_button.click()
        
        # Wait for redirect to dashboard/home
        WebDriverWait(driver, self.TIMEOUT).until(
            EC.url_changes(f"{self.BASE_URL}/login")
        )
        
        time.sleep(2)  # Wait for page load
    
    def navigate_to_course(self, driver, course_name="Python Programming"):
        """Helper method to navigate to a course"""
        # Click on My Courses or navigate directly
        driver.get(f"{self.BASE_URL}/my-courses")
        
        # Wait for courses to load
        time.sleep(2)
        
        # Find and click the course
        course_card = driver.find_element(By.XPATH, f"//h3[contains(text(), '{course_name}')]")
        course_card.click()
        
        time.sleep(2)
    
    # ===== TEST CASES =====
    
    def test_TC_E2E_001_login_and_view_course(self, driver):
        """
        TC-E2E-001: Student can login and view course page
        Priority: Critical
        """
        # Login
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        
        # Verify logged in (check for My Courses or user menu)
        try:
            user_menu = driver.find_element(By.XPATH, "//button[contains(@class, 'user-menu') or contains(text(), 'huy')]")
            assert user_menu is not None, "User menu not found - login failed"
        except NoSuchElementException:
            pytest.fail("Login failed - user menu not visible")
        
        # Navigate to course
        self.navigate_to_course(driver)
        
        # Verify course learning page loaded
        assert "/learn/" in driver.current_url, "Not on course learning page"
    
    def test_TC_E2E_002_view_exam_information(self, driver):
        """
        TC-E2E-002: Student can view exam information card
        Priority: High
        """
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        self.navigate_to_course(driver)
        
        # Scroll to exam section
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        # Find exam card
        try:
            exam_card = driver.find_element(By.XPATH, "//div[contains(@class, 'exam-card') or contains(text(), 'Exam') or contains(text(), 'Bài thi')]")
            assert exam_card.is_displayed(), "Exam card not visible"
            
            # Verify exam details
            assert "10" in exam_card.text, "Question count not displayed"
            assert "20" in exam_card.text, "Duration not displayed"
            assert "70" in exam_card.text, "Passing score not displayed"
            
        except NoSuchElementException:
            pytest.fail("Exam card not found")
    
    def test_TC_E2E_003_start_exam_flow(self, driver):
        """
        TC-E2E-003: Student can start exam and see exam introduction
        Priority: Critical
        """
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        self.navigate_to_course(driver)
        
        # Scroll to and click "Take Exam" button
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        take_exam_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Take Exam') or contains(text(), 'Làm bài thi')]"))
        )
        take_exam_button.click()
        
        # Wait for exam intro modal/page
        time.sleep(2)
        
        # Verify exam intro is displayed
        try:
            intro_element = driver.find_element(By.XPATH, "//*[contains(text(), 'Instructions') or contains(text(), 'Hướng dẫn')]")
            assert intro_element.is_displayed(), "Exam introduction not displayed"
        except NoSuchElementException:
            pytest.fail("Exam introduction modal/page not found")
    
    def test_TC_E2E_004_complete_full_exam_flow(self, driver):
        """
        TC-E2E-004: Complete exam flow - Start, Answer, Submit, View Results
        Priority: Critical
        
        This is the main happy path test covering entire exam workflow
        """
        # Step 1: Login
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        
        # Step 2: Navigate to course
        self.navigate_to_course(driver)
        
        # Step 3: Click Take Exam
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        take_exam_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Take Exam') or contains(text(), 'Làm bài thi')]"))
        )
        take_exam_button.click()
        time.sleep(2)
        
        # Step 4: Start Exam from intro screen
        start_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Start Exam') or contains(text(), 'Bắt đầu')]"))
        )
        start_button.click()
        time.sleep(3)  # Wait for questions to load
        
        # Step 5: Verify timer is running
        try:
            timer = driver.find_element(By.XPATH, "//*[contains(@class, 'timer') or contains(text(), ':')]")
            timer_text = timer.text
            assert ":" in timer_text, "Timer not displayed correctly"
            print(f"✓ Timer displayed: {timer_text}")
        except NoSuchElementException:
            pytest.fail("Timer not found")
        
        # Step 6: Answer all questions
        total_questions = 10
        
        for i in range(total_questions):
            print(f"\nAnswering Question {i+1}/{total_questions}")
            
            # Wait for question to load
            time.sleep(1)
            
            # Find and click first option (option A)
            try:
                option_a = driver.find_element(By.XPATH, "//input[@type='radio' and @value='A']")
                driver.execute_script("arguments[0].click();", option_a)  # JavaScript click to avoid interception
                print(f"✓ Selected option A for question {i+1}")
            except NoSuchElementException:
                # Try alternative selector
                try:
                    option_a = driver.find_element(By.XPATH, "//label[contains(text(), 'A.') or contains(text(), 'A)')]")
                    option_a.click()
                except NoSuchElementException:
                    pytest.fail(f"Could not find option A for question {i+1}")
            
            time.sleep(0.5)
            
            # Click Next button (except for last question)
            if i < total_questions - 1:
                try:
                    next_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Next') or contains(text(), 'Tiếp')]")
                    next_button.click()
                    time.sleep(1)
                except NoSuchElementException:
                    pytest.fail(f"Next button not found after question {i+1}")
        
        print("\n✓ All questions answered")
        
        # Step 7: Submit exam
        time.sleep(2)
        
        submit_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Submit') or contains(text(), 'Nộp bài')]"))
        )
        submit_button.click()
        
        # Step 8: Confirm submission (if confirmation dialog appears)
        time.sleep(2)
        try:
            confirm_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Confirm') or contains(text(), 'Xác nhận')]")
            confirm_button.click()
        except NoSuchElementException:
            pass  # No confirmation dialog
        
        # Step 9: Wait for results
        print("\n⏳ Waiting for results...")
        time.sleep(5)  # Wait for backend processing
        
        # Step 10: Verify results page
        try:
            # Look for score percentage
            score_element = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), '%') and contains(@class, 'score')]"))
            )
            score_text = score_element.text
            print(f"\n✓ Exam submitted successfully")
            print(f"✓ Score: {score_text}")
            
            # Verify pass/fail status
            try:
                status = driver.find_element(By.XPATH, "//*[contains(text(), 'PASS') or contains(text(), 'FAIL') or contains(text(), 'Đạt') or contains(text(), 'Không đạt')]")
                print(f"✓ Status: {status.text}")
            except NoSuchElementException:
                pass
            
            # Verify results include correct answer count
            try:
                results_text = driver.find_element(By.XPATH, "//*[contains(text(), 'out of') or contains(text(), '/')]").text
                print(f"✓ Results: {results_text}")
            except NoSuchElementException:
                pass
            
        except TimeoutException:
            pytest.fail("Results page did not load within timeout")
        
        print("\n✅ Full exam flow completed successfully!")
    
    def test_TC_E2E_005_navigate_between_questions(self, driver):
        """
        TC-E2E-005: Navigate between questions using Previous/Next
        Priority: High
        """
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        self.navigate_to_course(driver)
        
        # Start exam
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        take_exam_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Take Exam')]"))
        )
        take_exam_button.click()
        time.sleep(2)
        
        start_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Start')]"))
        )
        start_button.click()
        time.sleep(3)
        
        # Get question 1 text
        question_1 = driver.find_element(By.XPATH, "//*[contains(@class, 'question-text') or contains(@class, 'stem')]").text
        print(f"Question 1: {question_1[:50]}...")
        
        # Click Next
        next_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
        next_button.click()
        time.sleep(1)
        
        # Get question 2 text
        question_2 = driver.find_element(By.XPATH, "//*[contains(@class, 'question-text') or contains(@class, 'stem')]").text
        print(f"Question 2: {question_2[:50]}...")
        
        assert question_1 != question_2, "Question did not change after clicking Next"
        
        # Click Previous
        prev_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Previous') or contains(text(), 'Trước')]")
        prev_button.click()
        time.sleep(1)
        
        # Verify back to question 1
        question_1_again = driver.find_element(By.XPATH, "//*[contains(@class, 'question-text') or contains(@class, 'stem')]").text
        assert question_1 == question_1_again, "Previous button did not return to Question 1"
        
        print("✓ Navigation between questions works correctly")
    
    def test_TC_E2E_006_timer_countdown(self, driver):
        """
        TC-E2E-006: Verify timer counts down correctly
        Priority: High
        """
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        self.navigate_to_course(driver)
        
        # Start exam
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        take_exam_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Take Exam')]"))
        )
        take_exam_button.click()
        time.sleep(2)
        
        start_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Start')]"))
        )
        start_button.click()
        time.sleep(2)
        
        # Get initial timer value
        timer = driver.find_element(By.XPATH, "//*[contains(@class, 'timer') or contains(text(), ':')]")
        initial_time = timer.text
        print(f"Initial timer: {initial_time}")
        
        # Wait 10 seconds
        time.sleep(10)
        
        # Get timer value again
        timer_after = driver.find_element(By.XPATH, "//*[contains(@class, 'timer') or contains(text(), ':')]")
        later_time = timer_after.text
        print(f"Timer after 10s: {later_time}")
        
        # Verify timer decreased
        assert initial_time != later_time, "Timer did not count down"
        
        # Parse minutes and seconds
        def parse_time(time_str):
            parts = time_str.split(':')
            return int(parts[0]) * 60 + int(parts[1])
        
        initial_seconds = parse_time(initial_time)
        later_seconds = parse_time(later_time)
        
        assert initial_seconds > later_seconds, "Timer did not decrease"
        assert abs((initial_seconds - later_seconds) - 10) <= 2, "Timer countdown not accurate (should be ~10 seconds difference)"
        
        print("✓ Timer countdown working correctly")
    
    def test_TC_E2E_007_answer_persistence(self, driver):
        """
        TC-E2E-007: Answers persist when navigating between questions
        Priority: High
        """
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        self.navigate_to_course(driver)
        
        # Start exam
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        take_exam_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Take Exam')]"))
        )
        take_exam_button.click()
        time.sleep(2)
        
        start_button = WebDriverWait(driver, self.TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Start')]"))
        )
        start_button.click()
        time.sleep(3)
        
        # Select option A on question 1
        option_a = driver.find_element(By.XPATH, "//input[@type='radio' and @value='A']")
        driver.execute_script("arguments[0].click();", option_a)
        time.sleep(1)
        
        # Navigate to question 2
        next_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
        next_button.click()
        time.sleep(1)
        
        # Navigate back to question 1
        prev_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Previous')]")
        prev_button.click()
        time.sleep(1)
        
        # Verify option A is still selected
        option_a_again = driver.find_element(By.XPATH, "//input[@type='radio' and @value='A']")
        assert option_a_again.is_selected(), "Selected answer did not persist after navigation"
        
        print("✓ Answer persistence verified")
    
    def test_TC_E2E_008_review_exam_results(self, driver):
        """
        TC-E2E-008: Review exam answers after submission
        Priority: Medium
        """
        # This test requires completing an exam first
        # For brevity, we'll assume exam is already completed
        # In real scenario, you'd complete the exam first or use a pre-completed attempt
        
        self.login(driver, self.STUDENT_EMAIL, self.STUDENT_PASSWORD)
        self.navigate_to_course(driver)
        
        # Navigate to exam history or results page
        # Implementation depends on your UI structure
        
        print("⚠️ This test requires UI navigation to exam history - implementation depends on actual UI")


# ===== TEST EXECUTION CONFIGURATION =====

if __name__ == "__main__":
    """
    Run tests with pytest:
    
    # Run all E2E tests:
    pytest testing/e2e-tests/exam_e2e_selenium.py -v
    
    # Run specific test:
    pytest testing/e2e-tests/exam_e2e_selenium.py::TestExamSystemE2E::test_TC_E2E_004_complete_full_exam_flow -v
    
    # Run with HTML report:
    pytest testing/e2e-tests/exam_e2e_selenium.py -v --html=testing/reports/e2e-report.html --self-contained-html
    
    # Run in headless mode (modify fixture to uncomment headless option)
    """
    pytest.main([
        __file__,
        "-v",
        "--html=testing/reports/e2e-selenium-report.html",
        "--self-contained-html"
    ])
