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
        0 as enrollmentCount,
        4.5 as rating,
        0 as reviewCount
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.category_id
      ${whereClause}
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

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

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
          'Instructor' as instructorName,
          cat.name as categoryName,
          'https://via.placeholder.com/300x200' as thumbnail,
          '10 hours' as duration,
          0 as enrollmentCount,
          4.5 as rating,
          0 as reviewCount
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.category_id
        WHERE c.course_id = @courseId AND c.status = 'active'
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get course lessons from moocs and lessons tables
    const lessonsResult = await pool.request()
      .input('courseId', sql.BigInt, id)
      .query(`
        SELECT 
          l.lesson_id as id, 
          l.title, 
          l.content_type as contentType,
          l.content_url as contentUrl,
          '15 mins' as duration,
          l.order_no as orderIndex,
          m.title as moocTitle,
          l.is_preview as isPreview
        FROM lessons l
        INNER JOIN moocs m ON l.mooc_id = m.mooc_id
        WHERE m.course_id = @courseId
        ORDER BY m.order_no, l.order_no
      `);

    const course = result.recordset[0];
    course.lessons = lessonsResult.recordset;

    res.json({ course });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new course (Instructor/Admin only)
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 500 }),
  body('description').trim().isLength({ min: 10 }),
  body('shortDescription').optional().trim().isLength({ max: 1000 }),
  body('categoryId').isInt(),
  body('price').optional().isFloat({ min: 0 }),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('duration').optional().trim(),
  body('language').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const {
      title, description, shortDescription, categoryId, price = 0,
      originalPrice, level, duration, language = 'Vietnamese',
      requirements, whatYouWillLearn
    } = req.body;

    const pool = await getPool();

    // Verify category exists
    const categoryResult = await pool.request()
      .input('categoryId', sql.Int, categoryId)
      .query('SELECT id FROM Categories WHERE id = @categoryId');

    if (categoryResult.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Create course
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NText, description)
      .input('shortDescription', sql.NVarChar, shortDescription)
      .input('instructorId', sql.Int, req.user.id)
      .input('categoryId', sql.Int, categoryId)
      .input('price', sql.Decimal(10, 2), price)
      .input('originalPrice', sql.Decimal(10, 2), originalPrice)
      .input('level', sql.NVarChar, level)
      .input('duration', sql.NVarChar, duration)
      .input('language', sql.NVarChar, language)
      .input('requirements', sql.NText, requirements)
      .input('whatYouWillLearn', sql.NText, whatYouWillLearn)
      .query(`
        INSERT INTO Courses (
          title, description, shortDescription, instructorId, categoryId, price, originalPrice,
          level, duration, language, requirements, whatYouWillLearn
        )
        OUTPUT INSERTED.*
        VALUES (
          @title, @description, @shortDescription, @instructorId, @categoryId, @price, @originalPrice,
          @level, @duration, @language, @requirements, @whatYouWillLearn
        )
      `);

    res.status(201).json({
      message: 'Course created successfully',
      course: result.recordset[0]
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Internal server error' });
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

export default router;