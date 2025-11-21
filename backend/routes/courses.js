import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { getPool, sql } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all courses (public endpoint with filters)
router.get('/', [
  query('category').optional().isInt(),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { category, level, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const pool = await getPool();
    const whereConditions = [];
    const queryParams = [];

    // Build dynamic query
    if (category) {
      whereConditions.push('c.category_id = @category');
      queryParams.push({ name: 'category', type: sql.Int, value: category });
    }

    if (level) {
      whereConditions.push('c.level = @level');
      queryParams.push({ name: 'level', type: sql.NVarChar, value: level });
    }

    if (search) {
      whereConditions.push('(c.title LIKE @search OR c.description LIKE @search)');
      queryParams.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    // Only show active courses
    whereConditions.push("c.status = 'active'");

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countRequest = pool.request();
    queryParams.forEach(param => {
      countRequest.input(param.name, param.type, param.value);
    });

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get courses with pagination
    const coursesRequest = pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

    queryParams.forEach(param => {
      coursesRequest.input(param.name, param.type, param.value);
    });

    const coursesResult = await coursesRequest.query(`
      SELECT 
        c.course_id as id, 
        c.title, 
        c.description, 
        c.price,
        c.level, 
        c.language_code as language,
        c.created_at as createdAt, 
        c.updated_at as updatedAt,
        c.status,
        c.owner_instructor_id as instructorId,
        'Instructor' as instructorName,
        cat.name as categoryName,
        cat.category_id as categoryId,
        'https://via.placeholder.com/300x200' as thumbnail,
        '10 hours' as duration,
        ISNULL(COUNT(DISTINCT e.enrollment_id), 0) as enrollmentCount,
        4.5 as rating,
        0 as reviewCount
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.category_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      ${whereClause}
      GROUP BY 
        c.course_id,
        c.title,
        c.description,
        c.price,
        c.level,
        c.language_code,
        c.created_at,
        c.updated_at,
        c.status,
        c.owner_instructor_id,
        cat.name,
        cat.category_id
      ORDER BY c.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    res.json({
      courses: coursesResult.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get my enrolled courses (MUST be before /:id route!)
router.get('/my-enrolled', authenticateToken, authorizeRoles('learner'), async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user.userId;
    
    console.log('📚 [my-enrolled] Fetching courses for userId:', userId);
    
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          c.course_id as id,
          c.title,
          c.description,
          c.price,
          c.level,
          'https://via.placeholder.com/400x250' as thumbnail,
          '10 hours' as duration,
          u.full_name as instructor,
          e.enrolled_at as enrolledAt,
          e.status as enrollmentStatus,
          e.completed_at as completedAt,
          cat.name as category,
          
          -- Calculate real progress
          ISNULL((
            SELECT COUNT(DISTINCT p.lesson_id)
            FROM progress p
            INNER JOIN lessons l ON p.lesson_id = l.lesson_id
            INNER JOIN moocs m ON l.mooc_id = m.mooc_id
            WHERE m.course_id = c.course_id 
              AND p.user_id = e.user_id
              AND p.is_completed = 1
          ), 0) as completedLessons,
          
          ISNULL((
            SELECT COUNT(*)
            FROM lessons l
            INNER JOIN moocs m ON l.mooc_id = m.mooc_id
            WHERE m.course_id = c.course_id
          ), 0) as totalLessons,
          
          -- Calculate progress percentage
          CASE 
            WHEN (SELECT COUNT(*) FROM lessons l INNER JOIN moocs m ON l.mooc_id = m.mooc_id WHERE m.course_id = c.course_id) = 0 
            THEN 0
            ELSE CAST(
              (SELECT COUNT(DISTINCT p.lesson_id) FROM progress p INNER JOIN lessons l ON p.lesson_id = l.lesson_id INNER JOIN moocs m ON l.mooc_id = m.mooc_id WHERE m.course_id = c.course_id AND p.user_id = e.user_id AND p.is_completed = 1) 
              * 100.0 / 
              (SELECT COUNT(*) FROM lessons l INNER JOIN moocs m ON l.mooc_id = m.mooc_id WHERE m.course_id = c.course_id)
              AS INT
            )
          END as progress,
          
          -- Determine status based on completion
          CASE 
            WHEN e.completed_at IS NOT NULL THEN 'completed'
            WHEN EXISTS (
              SELECT 1 FROM progress p 
              INNER JOIN lessons l ON p.lesson_id = l.lesson_id 
              INNER JOIN moocs m ON l.mooc_id = m.mooc_id 
              WHERE m.course_id = c.course_id AND p.user_id = e.user_id
            ) THEN 'in-progress'
            ELSE 'not-started'
          END as status,
          
          e.enrolled_at as lastAccessed,
          'Continue Learning' as nextLesson,
          CASE WHEN e.completed_at IS NOT NULL THEN 1 ELSE 0 END as certificate
          
        FROM enrollments e
        INNER JOIN courses c ON e.course_id = c.course_id
        INNER JOIN users u ON c.owner_instructor_id = u.user_id
        LEFT JOIN categories cat ON c.category_id = cat.category_id
        WHERE e.user_id = @userId AND e.status = 'active'
        ORDER BY e.enrolled_at DESC
      `);

    console.log('✅ [my-enrolled] Found', result.recordset.length, 'enrolled courses');
    
    res.json({ 
      success: true,
      data: result.recordset 
    });

  } catch (error) {
    console.error('❌ [my-enrolled] Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get instructor's courses
router.get('/instructor/my-courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = await getPool();

    console.log('🎓 [instructor/my-courses] Fetching courses for instructor userId:', userId);

    // Get courses created by this instructor
    const result = await pool.request()
      .input('instructorId', sql.BigInt, userId)
      .query(`
        SELECT 
          c.course_id as id,
          c.title,
          c.description,
          c.thumbnail_url,
          c.price,
          c.level,
          c.created_at,
          COUNT(DISTINCT e.enrollment_id) as enrollmentCount,
          COUNT(DISTINCT m.mooc_id) as totalLessons
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN moocs m ON c.course_id = m.course_id
        WHERE c.owner_instructor_id = @instructorId
        GROUP BY c.course_id, c.title, c.description, c.thumbnail_url, 
                 c.price, c.level, c.created_at
        ORDER BY c.created_at DESC
      `);

    console.log('✅ [instructor/my-courses] Found', result.recordset.length, 'courses');

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('❌ [instructor/my-courses] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch instructor courses'
    });
  }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Get course details with instructor info
    const result = await pool.request()
      .input('courseId', sql.BigInt, id)
      .query(`
        SELECT 
          c.course_id as id,
          c.title, 
          c.description, 
          c.price,
          c.level, 
          c.language_code as language,
          c.created_at as createdAt, 
          c.updated_at as updatedAt,
          c.status,
          c.owner_instructor_id as instructorId,
          COALESCE(u.full_name, u.email, 'Instructor') as instructorName,
          u.avatar_url as instructorAvatar,
          u.bio as instructorBio,
          cat.name as categoryName,
          cat.category_id as categoryId,
          'https://via.placeholder.com/800x450' as thumbnail,
          (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) as enrollmentCount,
          (SELECT AVG(CAST(rating as FLOAT)) FROM reviews WHERE course_id = c.course_id) as rating,
          (SELECT COUNT(*) FROM reviews WHERE course_id = c.course_id) as reviewCount,
          (SELECT COUNT(*) FROM lessons l 
           INNER JOIN moocs m ON l.mooc_id = m.mooc_id 
           WHERE m.course_id = c.course_id) as totalLessons
        FROM courses c
        LEFT JOIN users u ON c.owner_instructor_id = u.user_id
        LEFT JOIN categories cat ON c.category_id = cat.category_id
        WHERE c.course_id = @courseId AND c.status = 'active'
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = result.recordset[0];
    
    // Calculate duration based on lesson count (assume 15 min per lesson)
    const totalLessons = course.totalLessons || 0;
    const durationMinutes = totalLessons * 15; // 15 minutes per lesson average
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    course.duration = `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`.trim();

    // Get course curriculum (moocs and lessons)
    const moocsResult = await pool.request()
      .input('courseId', sql.BigInt, id)
      .query(`
        SELECT 
          m.mooc_id as id,
          m.title,
          m.order_no as orderIndex,
          (SELECT COUNT(*) FROM lessons WHERE mooc_id = m.mooc_id) as lessonCount
        FROM moocs m
        WHERE m.course_id = @courseId
        ORDER BY m.order_no
      `);

    // Get lessons for each mooc
    const lessonsResult = await pool.request()
      .input('courseId', sql.BigInt, id)
      .query(`
        SELECT 
          l.lesson_id as id, 
          l.title, 
          l.content_type as contentType,
          l.content_url as contentUrl,
          '00:15:00' as duration,
          l.order_no as orderIndex,
          l.mooc_id as moocId,
          ISNULL(l.is_preview, 0) as isPreview
        FROM lessons l
        INNER JOIN moocs m ON l.mooc_id = m.mooc_id
        WHERE m.course_id = @courseId
        ORDER BY l.order_no
      `);

    // Build curriculum structure
    course.curriculum = moocsResult.recordset.map(mooc => ({
      id: mooc.id,
      title: mooc.title,
      lessonCount: mooc.lessonCount,
      lessons: lessonsResult.recordset
        .filter(lesson => lesson.moocId === mooc.id)
        .map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          contentType: lesson.contentType,
          contentUrl: lesson.contentUrl,
          isPreview: lesson.isPreview
        }))
    }));

    // Get course reviews
    const reviewsResult = await pool.request()
      .input('courseId', sql.BigInt, id)
      .query(`
        SELECT TOP 5
          r.review_id as id,
          r.rating,
          r.comment,
          r.created_at as createdAt,
          COALESCE(u.full_name, u.email, 'Student') as studentName,
          u.avatar_url as studentAvatar
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.course_id = @courseId
        ORDER BY r.created_at DESC
      `);

    course.reviews = reviewsResult.recordset;

    // Get what you'll learn points (if stored in database)
    // For now, use structured data if available
    course.whatYouWillLearn = [
      'Master the fundamentals and advanced concepts',
      'Build real-world projects from scratch',
      'Best practices and industry standards',
      'Problem-solving and critical thinking skills'
    ];

    course.requirements = [
      'Basic computer skills',
      'Willingness to learn',
      'No prior experience required'
    ];

    res.json({ 
      success: true,
      course 
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Create new course (Instructor/Admin only)
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 500 }),
  body('description').trim().isLength({ min: 10 }),
  body('shortDescription').optional().trim().isLength({ max: 1000 }),
  body('category').optional().trim(),
  body('categoryId').optional().isInt(),
  body('price').optional(),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced', 'beginner', 'intermediate', 'advanced']),
  body('duration').optional(),
  body('language').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const {
      title, description, shortDescription, category, categoryId, price = 0,
      originalPrice, level = 'Beginner', duration, language = 'vi',
      requirements, whatYouWillLearn, what_you_will_learn, is_free, thumbnail_url
    } = req.body;

    const pool = await getPool();

    // Map category string to categoryId if not provided
    let finalCategoryId = categoryId;
    if (!finalCategoryId && category) {
      const categoryMap = {
        'programming': 1,
        'web-development': 2,
        'mobile-development': 3,
        'data-science': 4,
        'machine-learning': 5,
        'design': 6,
        'business': 7,
        'marketing': 8,
        'language': 9,
        'other': 10
      };
      finalCategoryId = categoryMap[category] || 1;
    }

    // Default to category 1 if still not found
    if (!finalCategoryId) {
      finalCategoryId = 1;
    }

    // Normalize level
    const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

    // Parse price
    const finalPrice = is_free ? 0 : parseFloat(price) || 0;

    // Get instructor_id from user_id
    console.log('🔍 Looking for instructor with userId:', req.user.userId);
    
    // First check if table exists and what columns it has
    try {
      const schemaCheck = await pool.request().query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'instructors'
      `);
      console.log('📋 Instructors table columns:', schemaCheck.recordset.map(r => r.COLUMN_NAME));
    } catch (err) {
      console.error('⚠️ Could not check schema:', err.message);
    }
    
    const instructorResult = await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .query('SELECT instructor_id FROM instructors WHERE user_id = @userId');
    
    console.log('📊 Instructor query result:', instructorResult.recordset);

    let instructorId;
    if (instructorResult.recordset.length === 0) {
      // Auto-create instructor if not exists
      const createInstructor = await pool.request()
        .input('userId', sql.BigInt, req.user.userId)
        .query(`
          INSERT INTO instructors (user_id, bio, expertise, rating)
          OUTPUT INSERTED.instructor_id
          VALUES (@userId, N'Giảng viên mới', N'Chưa cập nhật', 0)
        `);
      instructorId = createInstructor.recordset[0].instructor_id;
    } else {
      instructorId = instructorResult.recordset[0].instructor_id;
    }

    // Prepare data for insertion
        const _finalWhatYouWillLearn = Array.isArray(req.body.whatYouWillLearn) ? req.body.whatYouWillLearn : [];
    const finalDuration = duration ? duration.toString() : '0';

    // Create course
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NText, description)
      .input('instructorId', sql.BigInt, instructorId)
      .input('categoryId', sql.Int, finalCategoryId)
      .input('price', sql.Decimal(10, 2), finalPrice)
      .input('level', sql.NVarChar, normalizedLevel)
      .input('languageCode', sql.NVarChar(10), language || 'vi')
      .query(`
        INSERT INTO courses (
          title, description, instructor_id, category_id, price,
          level, language_code, status, is_approved, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @title, @description, @instructorId, @categoryId, @price,
          @level, @languageCode, 'active', 0, GETDATE(), GETDATE()
        )
      `);

    const newCourse = result.recordset[0];

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course_id: newCourse.course_id,
        title: newCourse.title,
        description: newCourse.description,
        price: newCourse.price,
        level: newCourse.level
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT 
        c.category_id as id,
        c.name, 
        COUNT(co.course_id) as courseCount
      FROM categories c
      LEFT JOIN courses co ON c.category_id = co.category_id AND co.status = 'active'
      GROUP BY c.category_id, c.name
      ORDER BY c.name
    `);

    res.json({ categories: result.recordset });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, authorizeRoles('learner'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Check if course exists and is published
    const courseResult = await pool.request()
      .input('courseId', sql.Int, id)
      .query('SELECT id, title, price FROM Courses WHERE id = @courseId');

    if (courseResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Course not found or not available' });
    }

    // Check if already enrolled
    const enrollmentResult = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('courseId', sql.Int, id)
      .query('SELECT id FROM Enrollments WHERE userId = @userId AND courseId = @courseId');

    if (enrollmentResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const newEnrollment = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('courseId', sql.Int, id)
      .query(`
        INSERT INTO Enrollments (userId, courseId)
        OUTPUT INSERTED.*
        VALUES (@userId, @courseId)
      `);

    // Update enrollment count
    await pool.request()
      .input('courseId', sql.Int, id)
      .query('UPDATE Courses SET enrollmentCount = enrollmentCount + 1 WHERE id = @courseId');

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment: newEnrollment.recordset[0]
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get MOOCs for a course (public)
router.get('/:courseId/moocs', async (req, res) => {
  try {
    const { courseId } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .query(`
        SELECT 
          mooc_id,
          course_id,
          title as name,
          description,
          order_no as order_index,
          created_at
        FROM moocs
        WHERE course_id = @courseId
        ORDER BY order_no
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error getting MOOCs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get MOOCs'
    });
  }
});

// Get lessons for a course (public)
router.get('/:courseId/lessons', async (req, res) => {
  try {
    const { courseId } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .query(`
        SELECT 
          l.lesson_id,
          l.mooc_id,
          l.title,
          l.content_type,
          l.content_url,
          l.description,
          l.order_no,
          l.duration,
          l.is_preview,
          m.title as mooc_title,
          m.order_no as mooc_order
        FROM lessons l
        JOIN moocs m ON l.mooc_id = m.mooc_id
        WHERE m.course_id = @courseId
        ORDER BY m.order_no, l.order_no
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error getting lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get lessons'
    });
  }
});

export default router;