-- =====================================================
-- SIMPLE INSERT: 3 Pending Courses
-- =====================================================
-- Simpler version without complex T-SQL logic
-- Works with mssql Node.js driver
-- =====================================================

USE MiniCoursera_Primary;

-- =====================================================
-- INSERT 3 PENDING COURSES
-- =====================================================

-- Course 1: Advanced JavaScript
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
    2,
    1, -- Web Development category
    N'Advanced JavaScript - Master ES6+ Features',
    N'Khóa học JavaScript nâng cao với ES6+, async/await, promises, modules, và các design patterns hiện đại. Học cách xây dựng ứng dụng web chuyên nghiệp với JavaScript thuần.',
    'vi',
    'Advanced',
    1299000,
    'pending',
    GETDATE(),
    GETDATE()
);

-- Course 2: Full-Stack Web Development
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
    2,
    1, -- Web Development category
    N'Full-Stack Web Development với MERN Stack',
    N'Khóa học toàn diện về phát triển web Full-Stack sử dụng MongoDB, Express.js, React, và Node.js. Xây dựng ứng dụng web từ đầu đến cuối với authentication, real-time features, và deployment.',
    'vi',
    'Intermediate',
    1899000,
    'draft',
    GETDATE(),
    GETDATE()
);

-- Course 3: UI/UX Design Fundamentals
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
    2,
    2, -- Design category
    N'UI/UX Design - Thiết kế giao diện người dùng chuyên nghiệp',
    N'Học các nguyên tắc thiết kế UI/UX từ cơ bản đến nâng cao. Thực hành với Figma, Adobe XD, tạo wireframes, prototypes, và design systems. Phù hợp cho người mới bắt đầu.',
    'vi',
    'Beginner',
    999000,
    'pending',
    GETDATE(),
    GETDATE()
);
