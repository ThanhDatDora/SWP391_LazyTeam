-- =====================================================
-- INSTRUCTOR SAMPLE DATA SCRIPT
-- =====================================================
-- This script creates sample data for testing instructor features:
-- - Instructor user accounts
-- - Courses with MOOCs and lessons
-- - Student enrollments
-- - Invoices and payments (revenue data)
-- - Assignment submissions
-- =====================================================

USE MiniCoursera_Primary;
GO

-- =====================================================
-- 1. CREATE INSTRUCTOR USERS
-- =====================================================

PRINT 'Creating instructor users...';

-- Check if instructor role exists (role_id = 2)
IF NOT EXISTS (SELECT 1 FROM roles WHERE role_id = 2)
BEGIN
    PRINT 'ERROR: Instructor role (role_id = 2) not found!';
    RETURN;
END

-- Insert instructor users if they don't exist
-- Password for all: "Instructor@123" (hashed)
DECLARE @instructorPassword NVARCHAR(255) = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; -- hash of "Instructor@123"

-- Instructor 1: John Doe (Programming courses)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.instructor@minicourse.com')
BEGIN
    INSERT INTO users (email, password_hash, full_name, role_id, is_verified, created_at)
    VALUES ('john.instructor@minicourse.com', @instructorPassword, 'John Doe', 2, 1, GETDATE());
    
    DECLARE @johnUserId BIGINT = SCOPE_IDENTITY();
    
    -- Create instructor profile
    INSERT INTO instructors (user_id, bio, expertise, created_at)
    VALUES (@johnUserId, 'Senior Software Engineer with 10+ years experience in web development', 'Web Development, JavaScript, React', GETDATE());
    
    PRINT 'Created instructor: John Doe (ID: ' + CAST(@johnUserId AS NVARCHAR) + ')';
END

-- Instructor 2: Jane Smith (Data Science courses)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane.instructor@minicourse.com')
BEGIN
    INSERT INTO users (email, password_hash, full_name, role_id, is_verified, created_at)
    VALUES ('jane.instructor@minicourse.com', @instructorPassword, 'Jane Smith', 2, 1, GETDATE());
    
    DECLARE @janeUserId BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO instructors (user_id, bio, expertise, created_at)
    VALUES (@janeUserId, 'Data Scientist specializing in Machine Learning and AI', 'Python, Machine Learning, Data Analysis', GETDATE());
    
    PRINT 'Created instructor: Jane Smith (ID: ' + CAST(@janeUserId AS NVARCHAR) + ')';
END

-- Instructor 3: Mike Johnson (Design courses)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mike.instructor@minicourse.com')
BEGIN
    INSERT INTO users (email, password_hash, full_name, role_id, is_verified, created_at)
    VALUES ('mike.instructor@minicourse.com', @instructorPassword, 'Mike Johnson', 2, 1, GETDATE());
    
    DECLARE @mikeUserId BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO instructors (user_id, bio, expertise, created_at)
    VALUES (@mikeUserId, 'UI/UX Designer with passion for creating beautiful interfaces', 'UI/UX Design, Figma, Adobe XD', GETDATE());
    
    PRINT 'Created instructor: Mike Johnson (ID: ' + CAST(@mikeUserId AS NVARCHAR) + ')';
END

-- =====================================================
-- 2. CREATE SAMPLE COURSES
-- =====================================================

PRINT 'Creating sample courses...';

-- Get instructor IDs
DECLARE @johnInstructorId BIGINT = (SELECT instructor_id FROM instructors WHERE user_id = (SELECT user_id FROM users WHERE email = 'john.instructor@minicourse.com'));
DECLARE @janeInstructorId BIGINT = (SELECT instructor_id FROM instructors WHERE user_id = (SELECT user_id FROM users WHERE email = 'jane.instructor@minicourse.com'));
DECLARE @mikeInstructorId BIGINT = (SELECT instructor_id FROM instructors WHERE user_id = (SELECT user_id FROM users WHERE email = 'mike.instructor@minicourse.com'));

-- Course 1: React Complete Guide (John)
IF NOT EXISTS (SELECT 1 FROM courses WHERE title = 'React Complete Guide - Build Modern Web Apps')
BEGIN
    INSERT INTO courses (title, description, price, instructor_id, category, level, duration, is_approved, is_free, rating, created_at)
    VALUES (
        'React Complete Guide - Build Modern Web Apps',
        'Learn React from scratch and build amazing web applications. Covers React hooks, Redux, routing, and more.',
        49.99,
        @johnInstructorId,
        'web-development',
        'intermediate',
        40,
        1,
        0,
        4.8,
        DATEADD(MONTH, -6, GETDATE())
    );
    PRINT 'Created course: React Complete Guide';
END

-- Course 2: JavaScript Mastery (John)
IF NOT EXISTS (SELECT 1 FROM courses WHERE title = 'JavaScript Mastery: From Beginner to Expert')
BEGIN
    INSERT INTO courses (title, description, price, instructor_id, category, level, duration, is_approved, is_free, rating, created_at)
    VALUES (
        'JavaScript Mastery: From Beginner to Expert',
        'Master JavaScript fundamentals and advanced concepts. ES6+, async programming, and real projects.',
        39.99,
        @johnInstructorId,
        'programming',
        'beginner',
        35,
        1,
        0,
        4.7,
        DATEADD(MONTH, -5, GETDATE())
    );
    PRINT 'Created course: JavaScript Mastery';
END

-- Course 3: Python for Data Science (Jane)
IF NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Python for Data Science and Machine Learning')
BEGIN
    INSERT INTO courses (title, description, price, instructor_id, category, level, duration, is_approved, is_free, rating, created_at)
    VALUES (
        'Python for Data Science and Machine Learning',
        'Complete data science bootcamp. NumPy, Pandas, Matplotlib, Scikit-learn, and TensorFlow.',
        59.99,
        @janeInstructorId,
        'data-science',
        'intermediate',
        50,
        1,
        0,
        4.9,
        DATEADD(MONTH, -4, GETDATE())
    );
    PRINT 'Created course: Python for Data Science';
END

-- Course 4: UI/UX Design Fundamentals (Mike)
IF NOT EXISTS (SELECT 1 FROM courses WHERE title = 'UI/UX Design Fundamentals with Figma')
BEGIN
    INSERT INTO courses (title, description, price, instructor_id, category, level, duration, is_approved, is_free, rating, created_at)
    VALUES (
        'UI/UX Design Fundamentals with Figma',
        'Learn user interface and user experience design principles. Design beautiful interfaces with Figma.',
        44.99,
        @mikeInstructorId,
        'design',
        'beginner',
        30,
        1,
        0,
        4.6,
        DATEADD(MONTH, -3, GETDATE())
    );
    PRINT 'Created course: UI/UX Design Fundamentals';
END

-- Course 5: Free HTML/CSS Course (John)
IF NOT EXISTS (SELECT 1 FROM courses WHERE title = 'HTML & CSS for Beginners - Free Course')
BEGIN
    INSERT INTO courses (title, description, price, instructor_id, category, level, duration, is_approved, is_free, rating, created_at)
    VALUES (
        'HTML & CSS for Beginners - Free Course',
        'Start your web development journey. Learn HTML5 and CSS3 basics.',
        0,
        @johnInstructorId,
        'web-development',
        'beginner',
        15,
        1,
        1,
        4.5,
        DATEADD(MONTH, -2, GETDATE())
    );
    PRINT 'Created course: HTML & CSS for Beginners';
END

-- =====================================================
-- 3. CREATE STUDENT ENROLLMENTS
-- =====================================================

PRINT 'Creating student enrollments...';

-- Get sample learner users (assuming they exist)
DECLARE @learnerIds TABLE (user_id BIGINT);
INSERT INTO @learnerIds
SELECT TOP 20 user_id FROM users WHERE role_id = 3 ORDER BY created_at DESC; -- role_id 3 = learner

-- Get course IDs
DECLARE @reactCourseId BIGINT = (SELECT course_id FROM courses WHERE title = 'React Complete Guide - Build Modern Web Apps');
DECLARE @jsCourseId BIGINT = (SELECT course_id FROM courses WHERE title = 'JavaScript Mastery: From Beginner to Expert');
DECLARE @pythonCourseId BIGINT = (SELECT course_id FROM courses WHERE title = 'Python for Data Science and Machine Learning');
DECLARE @designCourseId BIGINT = (SELECT course_id FROM courses WHERE title = 'UI/UX Design Fundamentals with Figma');
DECLARE @htmlCourseId BIGINT = (SELECT course_id FROM courses WHERE title = 'HTML & CSS for Beginners - Free Course');

-- Enroll learners in courses (50+ enrollments total)
DECLARE @learnerId BIGINT;
DECLARE @enrollCount INT = 0;

DECLARE learner_cursor CURSOR FOR SELECT user_id FROM @learnerIds;
OPEN learner_cursor;
FETCH NEXT FROM learner_cursor INTO @learnerId;

WHILE @@FETCH_STATUS = 0 AND @enrollCount < 60
BEGIN
    -- Enroll in React course (15 students)
    IF @reactCourseId IS NOT NULL AND @enrollCount < 15
        AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = @learnerId AND course_id = @reactCourseId)
    BEGIN
        INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
        VALUES (@learnerId, @reactCourseId, DATEADD(DAY, -RAND()*180, GETDATE()), RAND()*100, 'active');
        SET @enrollCount = @enrollCount + 1;
    END
    
    -- Enroll in JavaScript course (12 students)
    IF @jsCourseId IS NOT NULL AND @enrollCount >= 15 AND @enrollCount < 27
        AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = @learnerId AND course_id = @jsCourseId)
    BEGIN
        INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
        VALUES (@learnerId, @jsCourseId, DATEADD(DAY, -RAND()*150, GETDATE()), RAND()*100, 'active');
        SET @enrollCount = @enrollCount + 1;
    END
    
    -- Enroll in Python course (18 students)
    IF @pythonCourseId IS NOT NULL AND @enrollCount >= 27 AND @enrollCount < 45
        AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = @learnerId AND course_id = @pythonCourseId)
    BEGIN
        INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
        VALUES (@learnerId, @pythonCourseId, DATEADD(DAY, -RAND()*120, GETDATE()), RAND()*100, 'active');
        SET @enrollCount = @enrollCount + 1;
    END
    
    -- Enroll in Design course (10 students)
    IF @designCourseId IS NOT NULL AND @enrollCount >= 45 AND @enrollCount < 55
        AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = @learnerId AND course_id = @designCourseId)
    BEGIN
        INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
        VALUES (@learnerId, @designCourseId, DATEADD(DAY, -RAND()*90, GETDATE()), RAND()*100, 'active');
        SET @enrollCount = @enrollCount + 1;
    END
    
    -- Enroll in HTML course (free - 25 students)
    IF @htmlCourseId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = @learnerId AND course_id = @htmlCourseId)
    BEGIN
        INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
        VALUES (@learnerId, @htmlCourseId, DATEADD(DAY, -RAND()*60, GETDATE()), RAND()*100, 'active');
    END
    
    FETCH NEXT FROM learner_cursor INTO @learnerId;
END

CLOSE learner_cursor;
DEALLOCATE learner_cursor;

PRINT 'Created ' + CAST(@enrollCount AS NVARCHAR) + ' paid enrollments';

-- =====================================================
-- 4. CREATE INVOICES AND PAYMENTS (REVENUE DATA)
-- =====================================================

PRINT 'Creating revenue data (invoices and payments)...';

-- Create invoices for paid enrollments
DECLARE @enrollmentId BIGINT, @courseId BIGINT, @userId BIGINT, @coursePrice DECIMAL(10,2);

DECLARE enrollment_cursor CURSOR FOR 
    SELECT e.enrollment_id, e.course_id, e.user_id, c.price
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    WHERE c.price > 0 AND c.instructor_id IN (@johnInstructorId, @janeInstructorId, @mikeInstructorId);

OPEN enrollment_cursor;
FETCH NEXT FROM enrollment_cursor INTO @enrollmentId, @courseId, @userId, @coursePrice;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Check if invoice already exists
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE enrollment_id = @enrollmentId)
    BEGIN
        -- Create payment record
        INSERT INTO payments (user_id, provider, amount_cents, currency, status, paid_at, created_at)
        VALUES (@userId, 'bank_transfer', CAST(@coursePrice * 100 AS INT), 'USD', 'completed', DATEADD(DAY, -RAND()*180, GETDATE()), DATEADD(DAY, -RAND()*180, GETDATE()));
        
        DECLARE @paymentId BIGINT = SCOPE_IDENTITY();
        
        -- Create invoice
        INSERT INTO invoices (user_id, course_id, enrollment_id, payment_id, amount, status, paid_at, created_at)
        VALUES (@userId, @courseId, @enrollmentId, @paymentId, @coursePrice, 'paid', DATEADD(DAY, -RAND()*180, GETDATE()), DATEADD(DAY, -RAND()*180, GETDATE()));
    END
    
    FETCH NEXT FROM enrollment_cursor INTO @enrollmentId, @courseId, @userId, @coursePrice;
END

CLOSE enrollment_cursor;
DEALLOCATE enrollment_cursor;

PRINT 'Revenue data created successfully!';

-- =====================================================
-- 5. UPDATE COURSE STATISTICS
-- =====================================================

PRINT 'Updating course statistics...';

-- Update enrolled_count for each course
UPDATE c
SET c.enrolled_count = (
    SELECT COUNT(*) 
    FROM enrollments e 
    WHERE e.course_id = c.course_id
)
FROM courses c
WHERE c.instructor_id IN (@johnInstructorId, @janeInstructorId, @mikeInstructorId);

PRINT 'Course statistics updated!';

-- =====================================================
-- 6. SUMMARY REPORT
-- =====================================================

PRINT '';
PRINT '=====================================================';
PRINT 'SAMPLE DATA CREATION COMPLETED!';
PRINT '=====================================================';
PRINT '';

-- Show instructor summary
SELECT 
    u.full_name AS 'Instructor Name',
    u.email AS 'Email',
    COUNT(DISTINCT c.course_id) AS 'Total Courses',
    SUM(c.enrolled_count) AS 'Total Enrollments',
    SUM(CASE WHEN inv.status = 'paid' THEN inv.amount ELSE 0 END) AS 'Total Revenue',
    SUM(CASE WHEN inv.status = 'paid' THEN inv.amount * 0.8 ELSE 0 END) AS 'Instructor Share (80%)'
FROM users u
JOIN instructors i ON u.user_id = i.user_id
LEFT JOIN courses c ON i.instructor_id = c.instructor_id
LEFT JOIN invoices inv ON c.course_id = inv.course_id
WHERE u.email IN ('john.instructor@minicourse.com', 'jane.instructor@minicourse.com', 'mike.instructor@minicourse.com')
GROUP BY u.full_name, u.email
ORDER BY u.full_name;

PRINT '';
PRINT 'Login credentials for testing:';
PRINT '  Email: john.instructor@minicourse.com | Password: Instructor@123';
PRINT '  Email: jane.instructor@minicourse.com | Password: Instructor@123';
PRINT '  Email: mike.instructor@minicourse.com | Password: Instructor@123';
PRINT '';
PRINT 'Navigate to: http://localhost:5173/instructor/dashboard';
PRINT '=====================================================';

GO
