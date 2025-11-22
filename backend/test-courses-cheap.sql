-- =====================================================
-- Tạo 3 khóa học giá rẻ ($0.5, $0.75, $1) để test thanh toán
-- Mỗi khóa có: 6-8 lessons, cuối course có 1-2 assignments
-- STATUS: 'pending' - chờ admin duyệt/từ chối
-- =====================================================

USE MiniCoursera_Primary;
SET QUOTED_IDENTIFIER ON;
GO

-- Lấy instructor_id từ user có role_id = 2 (instructor)
DECLARE @InstructorId BIGINT;
SELECT TOP 1 @InstructorId = user_id FROM users WHERE role_id = 2;

-- Nếu không có instructor, tạo một instructor test
IF @InstructorId IS NULL
BEGIN
    INSERT INTO users (full_name, email, password_hash, role_id, status, created_at)
    VALUES (
        N'Nguyen Van Giang',
        'giang.test@minicourse.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEF', -- dummy hash
        2, -- instructor
        'active',
        GETDATE()
    );
    SET @InstructorId = SCOPE_IDENTITY();
END

PRINT N'Using Instructor ID: ' + CAST(@InstructorId AS NVARCHAR(10));

-- Lấy category_id cho Programming
DECLARE @CategoryIdProg INT = 1; -- Programming
DECLARE @CategoryIdWeb INT = 2;  -- Web Development  
DECLARE @CategoryIdDevOps INT = 3; -- DevOps/Tools

-- =====================================================
-- KHÓA HỌC 1: Lập trình Python cơ bản ($0.50)
-- =====================================================
DECLARE @Course1Id BIGINT;

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
) VALUES (
    @InstructorId,
    @CategoryIdProg,
    N'Python cho nguoi moi bat dau',
    N'Khoa hoc Python co ban danh cho nguoi chua co kinh nghiem lap trinh. Hoc cu phap, bien, vong lap, ham va xu ly du lieu. Hoan hao cho beginners!',
    'vi',
    'beginner',
    0.50,
    'pending',
    GETDATE(),
    GETDATE()
);

SET @Course1Id = SCOPE_IDENTITY();
PRINT N'Created Course 1 (Python): ' + CAST(@Course1Id AS NVARCHAR(10));

-- Lessons cho Python course
INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
VALUES 
-- Video lessons
(@Course1Id, N'Bai 1: Python la gi? Tai sao hoc Python?', 'video', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 1, 1),
(@Course1Id, N'Bai 2: Cai dat Python va VS Code', 'video', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 2, 0),
(@Course1Id, N'Bai 3: Chuong trinh Hello World dau tien', 'video', 'https://www.youtube.com/watch?v=KSiRzuSx120', 3, 0),
(@Course1Id, N'Bai 4: Bien va kieu du lieu', 'video', 'https://www.youtube.com/watch?v=cQT33yu9pY8', 4, 0),
(@Course1Id, N'Bai 5: Toan tu va bieu thuc', 'video', 'https://www.youtube.com/watch?v=v5MR5JnKcZI', 5, 0),
(@Course1Id, N'Bai 6: Vong lap for va while', 'video', 'https://www.youtube.com/watch?v=94UHCEmprCY', 6, 0),
-- Assignments
(@Course1Id, N'[Bai tap] Assignment 1: In ra man hinh va tinh toan', 'assignment', NULL, 7, 0),
(@Course1Id, N'[Bai tap] Assignment 2: Vong lap va dieu kien', 'assignment', NULL, 8, 0);

-- =====================================================
-- KHÓA HỌC 2: HTML/CSS cho Web Designer ($0.75)
-- =====================================================
DECLARE @Course2Id BIGINT;

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
) VALUES (
    @InstructorId,
    @CategoryIdWeb,
    N'HTML & CSS tu Zero den Hero',
    N'Hoc cach tao trang web tu dau voi HTML va CSS. Xay dung layout, styling, responsive design. Thuc hanh voi du an thuc te!',
    'vi',
    'beginner',
    0.75,
    'pending',
    GETDATE(),
    GETDATE()
);

SET @Course2Id = SCOPE_IDENTITY();
PRINT N'Created Course 2 (HTML/CSS): ' + CAST(@Course2Id AS NVARCHAR(10));

-- Lessons cho HTML/CSS course
INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
VALUES 
-- Video lessons
(@Course2Id, N'Bai 1: HTML la gi? Cau truc co ban', 'video', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 1, 1),
(@Course2Id, N'Bai 2: HTML Tags va Elements', 'video', 'https://www.youtube.com/watch?v=salY_Sm6mv4', 2, 0),
(@Course2Id, N'Bai 3: HTML Forms va Input', 'video', 'https://www.youtube.com/watch?v=fNcJuPIZ2WE', 3, 0),
(@Course2Id, N'Bai 4: CSS Selectors va Properties', 'video', 'https://www.youtube.com/watch?v=l1mER1bV0N0', 4, 0),
(@Course2Id, N'Bai 5: CSS Box Model', 'video', 'https://www.youtube.com/watch?v=rIO5326FgPE', 5, 0),
(@Course2Id, N'Bai 6: Flexbox Layout', 'video', 'https://www.youtube.com/watch?v=JJSoEo8JSnc', 6, 0),
(@Course2Id, N'Bai 7: Responsive Design voi Media Queries', 'video', 'https://www.youtube.com/watch?v=srvUrASNj0s', 7, 0),
-- Assignment
(@Course2Id, N'[Bai tap] Tao Landing Page Responsive', 'assignment', NULL, 8, 0);

-- =====================================================
-- KHÓA HỌC 3: Git & GitHub cho Developer ($1.00)
-- =====================================================
DECLARE @Course3Id BIGINT;

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
) VALUES (
    @InstructorId,
    @CategoryIdDevOps,
    N'Git & GitHub thuc chien',
    N'Quan ly ma nguon chuyen nghiep voi Git va GitHub. Pull request, merge conflicts, GitHub Actions. Lam viec nhom hieu qua!',
    'vi',
    'beginner',
    1.00,
    'pending',
    GETDATE(),
    GETDATE()
);

SET @Course3Id = SCOPE_IDENTITY();
PRINT N'Created Course 3 (Git/GitHub): ' + CAST(@Course3Id AS NVARCHAR(10));

-- Lessons cho Git/GitHub course
INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
VALUES 
-- Video lessons
(@Course3Id, N'Bai 1: Git la gi? Tai sao can Git?', 'video', 'https://www.youtube.com/watch?v=8JJ101D3knE', 1, 1),
(@Course3Id, N'Bai 2: Cai dat va cau hinh Git', 'video', 'https://www.youtube.com/watch?v=nbFwejIsHlY', 2, 0),
(@Course3Id, N'Bai 3: Git add, commit, push co ban', 'video', 'https://www.youtube.com/watch?v=HVsySz-h9r4', 3, 0),
(@Course3Id, N'Bai 4: Git Branch va Merge', 'video', 'https://www.youtube.com/watch?v=FyAAIHHClqI', 4, 0),
(@Course3Id, N'Bai 5: GitHub va Remote Repository', 'video', 'https://www.youtube.com/watch?v=nhNq2kIvi9s', 5, 0),
(@Course3Id, N'Bai 6: Fork va Pull Request', 'video', 'https://www.youtube.com/watch?v=8lGpZkjnkt4', 6, 0),
(@Course3Id, N'Bai 7: Xu ly Merge Conflicts', 'video', 'https://www.youtube.com/watch?v=xNVM5UxlFSA', 7, 0),
-- Assignment
(@Course3Id, N'[Bai tap] Tao Pull Request dau tien', 'assignment', NULL, 8, 0);

PRINT N'';
PRINT N'Successfully created 3 cheap test courses!';
PRINT N'';
PRINT N'Course Summary:';
PRINT N'1. Python cho nguoi moi bat dau - $0.50 (ID: ' + CAST(@Course1Id AS NVARCHAR(10)) + N') - 8 lessons - STATUS: pending';
PRINT N'2. HTML & CSS tu Zero den Hero - $0.75 (ID: ' + CAST(@Course2Id AS NVARCHAR(10)) + N') - 8 lessons - STATUS: pending';
PRINT N'3. Git & GitHub thuc chien - $1.00 (ID: ' + CAST(@Course3Id AS NVARCHAR(10)) + N') - 8 lessons - STATUS: pending';
PRINT N'';
PRINT N'Each course has:';
PRINT N'- 6-7 video lessons';
PRINT N'- 1-2 assignments at the end';
PRINT N'- STATUS: pending (waiting for admin approval/rejection)';
PRINT N'';
PRINT N'Admin can:';
PRINT N'- Approve: change status to active';
PRINT N'- Reject: change status to inactive';

GO

-- Nếu không có instructor, tạo một instructor test
IF @InstructorId IS NULL
BEGIN
    INSERT INTO users (full_name, email, password_hash, role_id, status, created_at)
    VALUES (
        N'Nguyễn Văn Giảng',
        'giang.test@minicourse.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEF', -- dummy hash
        2, -- instructor
        'active',
        GETDATE()
    );
    SET @InstructorId = SCOPE_IDENTITY();
END

PRINT N'Using Instructor ID: ' + CAST(@InstructorId AS NVARCHAR(10));

-- Lấy category_id cho Programming
DECLARE @CategoryIdProg INT = 1; -- Programming
DECLARE @CategoryIdWeb INT = 2;  -- Web Development  
DECLARE @CategoryIdDevOps INT = 3; -- DevOps/Tools

-- =====================================================
-- KHÓA HỌC 1: Lập trình Python cơ bản ($0.50)
-- =====================================================
DECLARE @Course1Id BIGINT;

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
) VALUES (
    @InstructorId,
    @CategoryIdProg,
    N'Python cho người mới bắt đầu',
    N'Khóa học Python cơ bản dành cho người chưa có kinh nghiệm lập trình. Học cú pháp, biến, vòng lặp, hàm và xử lý dữ liệu. Hoàn hảo cho beginners!',
    'vi',
    'beginner',
    0.50,
    'approved',
    GETDATE(),
    GETDATE()
);

SET @Course1Id = SCOPE_IDENTITY();
PRINT N'Created Course 1 (Python): ' + CAST(@Course1Id AS NVARCHAR(10));

-- Lessons cho Python course
INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
VALUES 
-- Video lessons
(@Course1Id, N'Bài 1: Python là gì? Tại sao học Python?', 'video', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 1, 1),
(@Course1Id, N'Bài 2: Cài đặt Python và VS Code', 'video', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 2, 0),
(@Course1Id, N'Bài 3: Chương trình Hello World đầu tiên', 'video', 'https://www.youtube.com/watch?v=KSiRzuSx120', 3, 0),
(@Course1Id, N'Bài 4: Biến và kiểu dữ liệu', 'video', 'https://www.youtube.com/watch?v=cQT33yu9pY8', 4, 0),
(@Course1Id, N'Bài 5: Toán tử và biểu thức', 'video', 'https://www.youtube.com/watch?v=v5MR5JnKcZI', 5, 0),
(@Course1Id, N'Bài 6: Vòng lặp for và while', 'video', 'https://www.youtube.com/watch?v=94UHCEmprCY', 6, 0),
-- Assignments
(@Course1Id, N'[Bài tập] Assignment 1: In ra màn hình và tính toán', 'assignment', NULL, 7, 0),
(@Course1Id, N'[Bài tập] Assignment 2: Vòng lặp và điều kiện', 'assignment', NULL, 8, 0);

-- =====================================================
-- KHÓA HỌC 2: HTML/CSS cho Web Designer ($0.75)
-- =====================================================
DECLARE @Course2Id BIGINT;

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
) VALUES (
    @InstructorId,
    @CategoryIdWeb,
    N'HTML & CSS từ Zero đến Hero',
    N'Học cách tạo trang web từ đầu với HTML và CSS. Xây dựng layout, styling, responsive design. Thực hành với dự án thực tế!',
    'vi',
    'beginner',
    0.75,
    'approved',
    GETDATE(),
    GETDATE()
);

SET @Course2Id = SCOPE_IDENTITY();
PRINT N'Created Course 2 (HTML/CSS): ' + CAST(@Course2Id AS NVARCHAR(10));

-- Lessons cho HTML/CSS course
INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
VALUES 
-- Video lessons
(@Course2Id, N'Bài 1: HTML là gì? Cấu trúc cơ bản', 'video', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 1, 1),
(@Course2Id, N'Bài 2: HTML Tags và Elements', 'video', 'https://www.youtube.com/watch?v=salY_Sm6mv4', 2, 0),
(@Course2Id, N'Bài 3: HTML Forms và Input', 'video', 'https://www.youtube.com/watch?v=fNcJuPIZ2WE', 3, 0),
(@Course2Id, N'Bài 4: CSS Selectors và Properties', 'video', 'https://www.youtube.com/watch?v=l1mER1bV0N0', 4, 0),
(@Course2Id, N'Bài 5: CSS Box Model', 'video', 'https://www.youtube.com/watch?v=rIO5326FgPE', 5, 0),
(@Course2Id, N'Bài 6: Flexbox Layout', 'video', 'https://www.youtube.com/watch?v=JJSoEo8JSnc', 6, 0),
(@Course2Id, N'Bài 7: Responsive Design với Media Queries', 'video', 'https://www.youtube.com/watch?v=srvUrASNj0s', 7, 0),
-- Assignment
(@Course2Id, N'[Bài tập] Tạo Landing Page Responsive', 'assignment', NULL, 8, 0);

-- =====================================================
-- KHÓA HỌC 3: Git & GitHub cho Developer ($1.00)
-- =====================================================
DECLARE @Course3Id BIGINT;

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
) VALUES (
    @InstructorId,
    @CategoryIdDevOps,
    N'Git & GitHub thực chiến',
    N'Quản lý mã nguồn chuyên nghiệp với Git và GitHub. Pull request, merge conflicts, GitHub Actions. Làm việc nhóm hiệu quả!',
    'vi',
    'beginner',
    1.00,
    'approved',
    GETDATE(),
    GETDATE()
);

SET @Course3Id = SCOPE_IDENTITY();
PRINT N'Created Course 3 (Git/GitHub): ' + CAST(@Course3Id AS NVARCHAR(10));

-- Lessons cho Git/GitHub course
INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
VALUES 
-- Video lessons
(@Course3Id, N'Bài 1: Git là gì? Tại sao cần Git?', 'video', 'https://www.youtube.com/watch?v=8JJ101D3knE', 1, 1),
(@Course3Id, N'Bài 2: Cài đặt và cấu hình Git', 'video', 'https://www.youtube.com/watch?v=nbFwejIsHlY', 2, 0),
(@Course3Id, N'Bài 3: Git add, commit, push cơ bản', 'video', 'https://www.youtube.com/watch?v=HVsySz-h9r4', 3, 0),
(@Course3Id, N'Bài 4: Git Branch và Merge', 'video', 'https://www.youtube.com/watch?v=FyAAIHHClqI', 4, 0),
(@Course3Id, N'Bài 5: GitHub và Remote Repository', 'video', 'https://www.youtube.com/watch?v=nhNq2kIvi9s', 5, 0),
(@Course3Id, N'Bài 6: Fork và Pull Request', 'video', 'https://www.youtube.com/watch?v=8lGpZkjnkt4', 6, 0),
(@Course3Id, N'Bài 7: Xử lý Merge Conflicts', 'video', 'https://www.youtube.com/watch?v=xNVM5UxlFSA', 7, 0),
-- Assignment
(@Course3Id, N'[Bài tập] Tạo Pull Request đầu tiên', 'assignment', NULL, 8, 0);

PRINT N'';
PRINT N'✅ Successfully created 3 cheap test courses!';
PRINT N'';
PRINT N'📚 Course Summary:';
PRINT N'1. Python cho người mới bắt đầu - $0.50 (ID: ' + CAST(@Course1Id AS NVARCHAR(10)) + N') - 8 lessons';
PRINT N'2. HTML & CSS từ Zero đến Hero - $0.75 (ID: ' + CAST(@Course2Id AS NVARCHAR(10)) + N') - 8 lessons';
PRINT N'3. Git & GitHub thực chiến - $1.00 (ID: ' + CAST(@Course3Id AS NVARCHAR(10)) + N') - 8 lessons';
PRINT N'';
PRINT N'Each course has:';
PRINT N'- 6-7 video lessons';
PRINT N'- 1-2 assignments at the end';
PRINT N'- All approved and ready to purchase';

GO

-- Nếu không có instructor, tạo một instructor test
IF @InstructorId IS NULL
BEGIN
    INSERT INTO users (full_name, email, password_hash, role_id, status, created_at)
    VALUES (
        N'Nguyễn Văn Giảng',
        'giang.test@minicourse.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEF', -- dummy hash
        2, -- instructor
        'active',
        GETDATE()
    );
    SET @InstructorId = SCOPE_IDENTITY();
END

PRINT N'Using Instructor ID: ' + CAST(@InstructorId AS NVARCHAR(10));

-- =====================================================
-- KHÓA HỌC 1: Lập trình Python cơ bản ($0.50)
-- =====================================================
DECLARE @Course1Id BIGINT;

INSERT INTO courses (
    title, 
    description, 
    category, 
    level, 
    language, 
    price, 
    original_price,
    thumbnail,
    instructor_id,
    status,
    is_published,
    created_at
) VALUES (
    N'Python cho người mới bắt đầu',
    N'Khóa học Python cơ bản dành cho người chưa có kinh nghiệm lập trình. Học cú pháp, biến, vòng lặp, hàm và xử lý dữ liệu.',
    N'Programming',
    N'Beginner',
    N'Vietnamese',
    0.50,
    2.99,
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop',
    @InstructorId,
    'approved',
    1,
    GETDATE()
);

SET @Course1Id = SCOPE_IDENTITY();
PRINT N'Created Course 1 (Python): ' + CAST(@Course1Id AS NVARCHAR(10));

-- Week 1: Python Basics
DECLARE @Week1_C1 BIGINT;
INSERT INTO weeks (course_id, week_number, title, description, created_at)
VALUES (
    @Course1Id, 
    1, 
    N'Tuần 1: Giới thiệu Python',
    N'Làm quen với Python, cài đặt môi trường và viết chương trình đầu tiên',
    GETDATE()
);
SET @Week1_C1 = SCOPE_IDENTITY();

-- Lessons cho Week 1
DECLARE @Lesson1_W1_C1 BIGINT, @Lesson2_W1_C1 BIGINT, @Lesson3_W1_C1 BIGINT;

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C1, 1, N'Python là gì?', 'video', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 15, GETDATE());
SET @Lesson1_W1_C1 = SCOPE_IDENTITY();

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C1, 2, N'Cài đặt Python và IDE', 'video', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 20, GETDATE());
SET @Lesson2_W1_C1 = SCOPE_IDENTITY();

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C1, 3, N'Chương trình Hello World', 'video', 'https://www.youtube.com/watch?v=KSiRzuSx120', 12, GETDATE());
SET @Lesson3_W1_C1 = SCOPE_IDENTITY();

-- Assignment cuối Week 1
INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C1, 4, N'[Bài tập] In ra màn hình', 'assignment', NULL, 30, GETDATE());

-- Week 2: Variables and Data Types
DECLARE @Week2_C1 BIGINT;
INSERT INTO weeks (course_id, week_number, title, description, created_at)
VALUES (
    @Course1Id, 
    2, 
    N'Tuần 2: Biến và kiểu dữ liệu',
    N'Tìm hiểu về biến, kiểu dữ liệu và toán tử trong Python',
    GETDATE()
);
SET @Week2_C1 = SCOPE_IDENTITY();

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week2_C1, 1, N'Biến trong Python', 'video', 'https://www.youtube.com/watch?v=cQT33yu9pY8', 18, GETDATE()),
(@Week2_C1, 2, N'Các kiểu dữ liệu cơ bản', 'video', 'https://www.youtube.com/watch?v=gCCVsvgR2KU', 22, GETDATE()),
(@Week2_C1, 3, N'Toán tử và biểu thức', 'video', 'https://www.youtube.com/watch?v=v5MR5JnKcZI', 16, GETDATE());

-- Assignment cuối Week 2
INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week2_C1, 4, N'[Bài tập] Tính toán với biến', 'assignment', NULL, 45, GETDATE());

-- =====================================================
-- KHÓA HỌC 2: HTML/CSS cho Web Designer ($0.75)
-- =====================================================
DECLARE @Course2Id BIGINT;

INSERT INTO courses (
    title, 
    description, 
    category, 
    level, 
    language, 
    price, 
    original_price,
    thumbnail,
    instructor_id,
    status,
    is_published,
    created_at
) VALUES (
    N'HTML & CSS cơ bản',
    N'Học cách tạo trang web từ đầu với HTML và CSS. Xây dựng layout, styling và responsive design.',
    N'Web Development',
    N'Beginner',
    N'Vietnamese',
    0.75,
    4.99,
    'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&auto=format&fit=crop',
    @InstructorId,
    'approved',
    1,
    GETDATE()
);

SET @Course2Id = SCOPE_IDENTITY();
PRINT N'Created Course 2 (HTML/CSS): ' + CAST(@Course2Id AS NVARCHAR(10));

-- Week 1: HTML Fundamentals
DECLARE @Week1_C2 BIGINT;
INSERT INTO weeks (course_id, week_number, title, description, created_at)
VALUES (
    @Course2Id, 
    1, 
    N'Tuần 1: HTML cơ bản',
    N'Cấu trúc HTML, tags, elements và thuộc tính',
    GETDATE()
);
SET @Week1_C2 = SCOPE_IDENTITY();

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C2, 1, N'Giới thiệu HTML', 'video', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 14, GETDATE()),
(@Week1_C2, 2, N'HTML Tags và Elements', 'video', 'https://www.youtube.com/watch?v=salY_Sm6mv4', 20, GETDATE()),
(@Week1_C2, 3, N'Forms và Input', 'video', 'https://www.youtube.com/watch?v=fNcJuPIZ2WE', 25, GETDATE());

-- Assignment cuối Week 1
INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C2, 4, N'[Bài tập] Tạo form đăng ký', 'assignment', NULL, 40, GETDATE());

-- Week 2: CSS Styling
DECLARE @Week2_C2 BIGINT;
INSERT INTO weeks (course_id, week_number, title, description, created_at)
VALUES (
    @Course2Id, 
    2, 
    N'Tuần 2: CSS Styling',
    N'Selectors, properties, box model và flexbox',
    GETDATE()
);
SET @Week2_C2 = SCOPE_IDENTITY();

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week2_C2, 1, N'CSS Selectors', 'video', 'https://www.youtube.com/watch?v=l1mER1bV0N0', 18, GETDATE()),
(@Week2_C2, 2, N'Box Model', 'video', 'https://www.youtube.com/watch?v=rIO5326FgPE', 22, GETDATE()),
(@Week2_C2, 3, N'Flexbox Layout', 'video', 'https://www.youtube.com/watch?v=JJSoEo8JSnc', 28, GETDATE()),
(@Week2_C2, 4, N'Responsive Design', 'video', 'https://www.youtube.com/watch?v=srvUrASNj0s', 24, GETDATE());

-- Assignment cuối Week 2
INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week2_C2, 5, N'[Bài tập] Tạo landing page responsive', 'assignment', NULL, 60, GETDATE());

-- =====================================================
-- KHÓA HỌC 3: Git & GitHub cho Developer ($1.00)
-- =====================================================
DECLARE @Course3Id BIGINT;

INSERT INTO courses (
    title, 
    description, 
    category, 
    level, 
    language, 
    price, 
    original_price,
    thumbnail,
    instructor_id,
    status,
    is_published,
    created_at
) VALUES (
    N'Git & GitHub thực chiến',
    N'Quản lý mã nguồn với Git, làm việc nhóm với GitHub, pull request, merge conflicts và GitHub Actions.',
    N'DevOps',
    N'Beginner',
    N'Vietnamese',
    1.00,
    5.99,
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop',
    @InstructorId,
    'approved',
    1,
    GETDATE()
);

SET @Course3Id = SCOPE_IDENTITY();
PRINT N'Created Course 3 (Git/GitHub): ' + CAST(@Course3Id AS NVARCHAR(10));

-- Week 1: Git Basics
DECLARE @Week1_C3 BIGINT;
INSERT INTO weeks (course_id, week_number, title, description, created_at)
VALUES (
    @Course3Id, 
    1, 
    N'Tuần 1: Git cơ bản',
    N'Cài đặt Git, repository, commit, branch và merge',
    GETDATE()
);
SET @Week1_C3 = SCOPE_IDENTITY();

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C3, 1, N'Git là gì?', 'video', 'https://www.youtube.com/watch?v=8JJ101D3knE', 12, GETDATE()),
(@Week1_C3, 2, N'Cài đặt và cấu hình Git', 'video', 'https://www.youtube.com/watch?v=nbFwejIsHlY', 15, GETDATE()),
(@Week1_C3, 3, N'Git add, commit, push', 'video', 'https://www.youtube.com/watch?v=HVsySz-h9r4', 20, GETDATE()),
(@Week1_C3, 4, N'Git Branch và Merge', 'video', 'https://www.youtube.com/watch?v=FyAAIHHClqI', 25, GETDATE());

-- Assignment cuối Week 1
INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week1_C3, 5, N'[Bài tập] Tạo repository và commit đầu tiên', 'assignment', NULL, 35, GETDATE());

-- Week 2: GitHub Collaboration
DECLARE @Week2_C3 BIGINT;
INSERT INTO weeks (course_id, week_number, title, description, created_at)
VALUES (
    @Course3Id, 
    2, 
    N'Tuần 2: GitHub và làm việc nhóm',
    N'Pull request, code review, issues và GitHub Actions',
    GETDATE()
);
SET @Week2_C3 = SCOPE_IDENTITY();

INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week2_C3, 1, N'GitHub là gì?', 'video', 'https://www.youtube.com/watch?v=nhNq2kIvi9s', 16, GETDATE()),
(@Week2_C3, 2, N'Fork và Pull Request', 'video', 'https://www.youtube.com/watch?v=8lGpZkjnkt4', 22, GETDATE()),
(@Week2_C3, 3, N'Xử lý Merge Conflicts', 'video', 'https://www.youtube.com/watch?v=xNVM5UxlFSA', 20, GETDATE());

-- Assignment cuối Week 2
INSERT INTO lessons (week_id, lesson_number, title, content_type, video_url, duration, created_at)
VALUES 
(@Week2_C3, 4, N'[Bài tập] Tạo Pull Request và review code', 'assignment', NULL, 50, GETDATE());

-- =====================================================
-- Update course statistics
-- =====================================================
UPDATE courses 
SET 
    total_lessons = (
        SELECT COUNT(*) 
        FROM lessons l 
        INNER JOIN weeks w ON l.week_id = w.week_id 
        WHERE w.course_id = courses.course_id
    ),
    total_duration = (
        SELECT ISNULL(SUM(l.duration), 0)
        FROM lessons l 
        INNER JOIN weeks w ON l.week_id = w.week_id 
        WHERE w.course_id = courses.course_id
    )
WHERE course_id IN (@Course1Id, @Course2Id, @Course3Id);

PRINT N'✅ Successfully created 3 cheap test courses!';
PRINT N'';
PRINT N'📚 Course Summary:';
PRINT N'1. Python cho người mới bắt đầu - $0.50 (ID: ' + CAST(@Course1Id AS NVARCHAR(10)) + N')';
PRINT N'2. HTML & CSS cơ bản - $0.75 (ID: ' + CAST(@Course2Id AS NVARCHAR(10)) + N')';
PRINT N'3. Git & GitHub thực chiến - $1.00 (ID: ' + CAST(@Course3Id AS NVARCHAR(10)) + N')';
PRINT N'';
PRINT N'Each course has:';
PRINT N'- 2 weeks';
PRINT N'- 3-5 lessons per week';
PRINT N'- 1 assignment at the end of each week';
PRINT N'- Total: ~100-150 minutes duration';

GO
