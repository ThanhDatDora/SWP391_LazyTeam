-- =====================================================
-- INSERT SAMPLE DATA FOR TESTING
-- 3 Pending Courses + Instructor Reports Data
-- =====================================================
-- Created: 2024
-- Purpose: Provide test data for CoursePendingPage and InstructorReportsPage
-- =====================================================

USE MiniCoursera_Primary;
GO

-- =====================================================
-- 1. INSERT 3 PENDING COURSES
-- =====================================================
-- Note: These courses use existing instructor (ID: 2) and categories
-- Status: 'pending' or 'draft' to show in pending courses list
-- =====================================================

PRINT '📚 Inserting 3 pending courses...';

-- Pending Course 1: Advanced JavaScript
INSERT INTO courses (
    owner_instructor_id,
    category_id,
    title,
    description,
    language_code,
    level,
    price,
    status,
    created_at,
    updated_at
)
VALUES (
    2, -- existing instructor
    (SELECT TOP 1 category_id FROM categories WHERE name = 'Web Development'), -- Web Development category
    N'Advanced JavaScript - Master ES6+ Features',
    N'Khóa học JavaScript nâng cao với ES6+, async/await, promises, modules, và các design patterns hiện đại. Học cách xây dựng ứng dụng web chuyên nghiệp với JavaScript thuần.',
    'vi',
    'Advanced',
    1299000, -- 1,299,000 VND
    'pending', -- PENDING status
    GETDATE(),
    GETDATE()
);

-- Pending Course 2: Full-Stack Web Development
INSERT INTO courses (
    owner_instructor_id,
    category_id,
    title,
    description,
    language_code,
    level,
    price,
    status,
    created_at,
    updated_at
)
VALUES (
    2, -- existing instructor
    (SELECT TOP 1 category_id FROM categories WHERE name = 'Web Development'),
    N'Full-Stack Web Development với MERN Stack',
    N'Khóa học toàn diện về phát triển web Full-Stack sử dụng MongoDB, Express.js, React, và Node.js. Xây dựng ứng dụng web từ đầu đến cuối với authentication, real-time features, và deployment.',
    'vi',
    'Intermediate',
    1899000, -- 1,899,000 VND
    'draft', -- DRAFT status (also counted as pending)
    GETDATE(),
    GETDATE()
);

-- Pending Course 3: UI/UX Design Fundamentals
INSERT INTO courses (
    owner_instructor_id,
    category_id,
    title,
    description,
    language_code,
    level,
    price,
    status,
    created_at,
    updated_at
)
VALUES (
    2, -- existing instructor
    (SELECT TOP 1 category_id FROM categories WHERE name = 'Design'), -- Design category
    N'UI/UX Design - Thiết kế giao diện người dùng chuyên nghiệp',
    N'Học các nguyên tắc thiết kế UI/UX từ cơ bản đến nâng cao. Thực hành với Figma, Adobe XD, tạo wireframes, prototypes, và design systems. Phù hợp cho người mới bắt đầu.',
    'vi',
    'Beginner',
    999000, -- 999,000 VND
    'pending', -- PENDING status
    GETDATE(),
    GETDATE()
);

PRINT '✅ Inserted 3 pending courses successfully!';
PRINT '';

-- =====================================================
-- 2. INSERT DATA FOR INSTRUCTOR REPORTS
-- =====================================================
-- Note: Instructor reports are dynamically computed from:
--   - instructors table (instructor data)
--   - users table (instructor personal info)
--   - courses table (course count)
--   - enrollments table (student count)
--   - invoices table (revenue)
-- 
-- To populate reports, we need to add enrollments and invoices
-- for existing courses owned by instructor_id = 2
-- =====================================================

PRINT '👨‍🏫 Inserting sample enrollments and invoices for instructor reports...';

-- First, get some course IDs owned by instructor 2
DECLARE @course1_id BIGINT, @course2_id BIGINT, @course3_id BIGINT;
DECLARE @learner1_id BIGINT, @learner2_id BIGINT, @learner3_id BIGINT;

-- Get 3 courses owned by instructor 2 (including newly created pending courses)
SELECT TOP 3 
    @course1_id = MIN(course_id),
    @course2_id = (SELECT MIN(course_id) FROM courses WHERE owner_instructor_id = 2 AND course_id > (SELECT MIN(course_id) FROM courses WHERE owner_instructor_id = 2)),
    @course3_id = MAX(course_id)
FROM courses 
WHERE owner_instructor_id = 2;

-- Get 3 learner user IDs (role_id = 3 for learners)
-- If no learners exist, we'll need to create some
IF NOT EXISTS (SELECT 1 FROM users WHERE role_id = 3)
BEGIN
    PRINT '⚠️ No learners found. Creating sample learner accounts...';
    
    -- Create 3 sample learners
    INSERT INTO users (username, email, password_hash, full_name, role_id, status, created_at, updated_at)
    VALUES 
        ('learner1', 'learner1@test.com', '$2b$10$SAMPLE_HASH_123456789', N'Nguyễn Văn A', 3, 'active', GETDATE(), GETDATE()),
        ('learner2', 'learner2@test.com', '$2b$10$SAMPLE_HASH_123456789', N'Trần Thị B', 3, 'active', GETDATE(), GETDATE()),
        ('learner3', 'learner3@test.com', '$2b$10$SAMPLE_HASH_123456789', N'Lê Văn C', 3, 'active', GETDATE(), GETDATE());
    
    PRINT '✅ Created 3 sample learners';
END

-- Get learner IDs
SELECT TOP 3
    @learner1_id = MIN(user_id),
    @learner2_id = (SELECT MIN(user_id) FROM users WHERE role_id = 3 AND user_id > (SELECT MIN(user_id) FROM users WHERE role_id = 3)),
    @learner3_id = MAX(user_id)
FROM users 
WHERE role_id = 3;

PRINT '📊 Course IDs: ' + CAST(@course1_id AS VARCHAR) + ', ' + CAST(@course2_id AS VARCHAR) + ', ' + CAST(@course3_id AS VARCHAR);
PRINT '👤 Learner IDs: ' + CAST(@learner1_id AS VARCHAR) + ', ' + CAST(@learner2_id AS VARCHAR) + ', ' + CAST(@learner3_id AS VARCHAR);

-- Insert enrollments for course 1 (3 students)
IF @course1_id IS NOT NULL AND @learner1_id IS NOT NULL
BEGIN
    INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
    VALUES 
        (@learner1_id, @course1_id, DATEADD(DAY, -30, GETDATE()), 0, 'active'),
        (@learner2_id, @course1_id, DATEADD(DAY, -25, GETDATE()), 0, 'active'),
        (@learner3_id, @course1_id, DATEADD(DAY, -20, GETDATE()), 0, 'active');
    
    PRINT '✅ Created 3 enrollments for course ' + CAST(@course1_id AS VARCHAR);
END

-- Insert enrollments for course 2 (2 students)
IF @course2_id IS NOT NULL AND @learner1_id IS NOT NULL
BEGIN
    INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
    VALUES 
        (@learner1_id, @course2_id, DATEADD(DAY, -15, GETDATE()), 0, 'active'),
        (@learner2_id, @course2_id, DATEADD(DAY, -10, GETDATE()), 0, 'active');
    
    PRINT '✅ Created 2 enrollments for course ' + CAST(@course2_id AS VARCHAR);
END

-- Insert enrollments for course 3 (4 students)
IF @course3_id IS NOT NULL AND @learner1_id IS NOT NULL
BEGIN
    INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
    VALUES 
        (@learner1_id, @course3_id, DATEADD(DAY, -12, GETDATE()), 0, 'active'),
        (@learner2_id, @course3_id, DATEADD(DAY, -8, GETDATE()), 0, 'active'),
        (@learner3_id, @course3_id, DATEADD(DAY, -5, GETDATE()), 0, 'active');
    
    PRINT '✅ Created 3 enrollments for course ' + CAST(@course3_id AS VARCHAR);
END

-- Insert invoices for revenue calculation (paid invoices)
-- Invoice structure: invoice_id, user_id, course_id, amount, status, created_at
PRINT '';
PRINT '💰 Creating paid invoices for revenue tracking...';

-- Invoices for course 1 (3 purchases)
IF @course1_id IS NOT NULL
BEGIN
    DECLARE @course1_price DECIMAL(10,2);
    SELECT @course1_price = price FROM courses WHERE course_id = @course1_id;
    
    INSERT INTO invoices (user_id, course_id, amount, status, payment_method, transaction_id, created_at, updated_at)
    VALUES 
        (@learner1_id, @course1_id, @course1_price, 'paid', 'vnpay', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, -30, GETDATE())),
        (@learner2_id, @course1_id, @course1_price, 'paid', 'momo', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -25, GETDATE()), DATEADD(DAY, -25, GETDATE())),
        (@learner3_id, @course1_id, @course1_price, 'paid', 'vnpay', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -20, GETDATE()), DATEADD(DAY, -20, GETDATE()));
    
    PRINT '✅ Created 3 paid invoices for course ' + CAST(@course1_id AS VARCHAR) + ' (Revenue: ' + CAST(@course1_price * 3 AS VARCHAR) + ' VND)';
END

-- Invoices for course 2 (2 purchases)
IF @course2_id IS NOT NULL
BEGIN
    DECLARE @course2_price DECIMAL(10,2);
    SELECT @course2_price = price FROM courses WHERE course_id = @course2_id;
    
    INSERT INTO invoices (user_id, course_id, amount, status, payment_method, transaction_id, created_at, updated_at)
    VALUES 
        (@learner1_id, @course2_id, @course2_price, 'paid', 'vnpay', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -15, GETDATE())),
        (@learner2_id, @course2_id, @course2_price, 'paid', 'momo', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, -10, GETDATE()));
    
    PRINT '✅ Created 2 paid invoices for course ' + CAST(@course2_id AS VARCHAR) + ' (Revenue: ' + CAST(@course2_price * 2 AS VARCHAR) + ' VND)';
END

-- Invoices for course 3 (3 purchases)
IF @course3_id IS NOT NULL
BEGIN
    DECLARE @course3_price DECIMAL(10,2);
    SELECT @course3_price = price FROM courses WHERE course_id = @course3_id;
    
    INSERT INTO invoices (user_id, course_id, amount, status, payment_method, transaction_id, created_at, updated_at)
    VALUES 
        (@learner1_id, @course3_id, @course3_price, 'paid', 'vnpay', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -12, GETDATE()), DATEADD(DAY, -12, GETDATE())),
        (@learner2_id, @course3_id, @course3_price, 'paid', 'momo', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -8, GETDATE()), DATEADD(DAY, -8, GETDATE())),
        (@learner3_id, @course3_id, @course3_price, 'paid', 'vnpay', 'TXN_' + CAST(NEWID() AS VARCHAR(50)), DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -5, GETDATE()));
    
    PRINT '✅ Created 3 paid invoices for course ' + CAST(@course3_id AS VARCHAR) + ' (Revenue: ' + CAST(@course3_price * 3 AS VARCHAR) + ' VND)';
END

PRINT '';
PRINT '═══════════════════════════════════════════════════════';
PRINT '✅ ALL SAMPLE DATA INSERTED SUCCESSFULLY!';
PRINT '═══════════════════════════════════════════════════════';
PRINT '';
PRINT '📋 SUMMARY:';
PRINT '  ✓ 3 pending courses created (pending/draft status)';
PRINT '  ✓ Sample enrollments added (8 total)';
PRINT '  ✓ Sample paid invoices added (8 total)';
PRINT '  ✓ Instructor reports will now show aggregated data';
PRINT '';
PRINT '🔍 TO VERIFY:';
PRINT '  • CoursePendingPage: Should show 3 new pending courses';
PRINT '  • InstructorReportsPage: Should show instructor with updated stats';
PRINT '  • Revenue calculation: Total from paid invoices';
PRINT '  • Student count: Total enrollments per course';
PRINT '';
PRINT '📊 NEXT STEPS:';
PRINT '  1. Refresh admin panel';
PRINT '  2. Navigate to "Khóa học chờ duyệt" to see pending courses';
PRINT '  3. Navigate to "Báo cáo giảng viên" to see updated reports';
PRINT '';
GO
