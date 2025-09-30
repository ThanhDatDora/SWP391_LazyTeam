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
    let whereConditions = ['c.isPublished = 1'];
    let queryParams = [];

    // Build dynamic query
    if (category) {
      whereConditions.push('c.categoryId = @category');
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

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    let countRequest = pool.request();
    queryParams.forEach(param => {
      countRequest.input(param.name, param.type, param.value);
    });

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM Courses c
      WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get courses with pagination
    let coursesRequest = pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

    queryParams.forEach(param => {
      coursesRequest.input(param.name, param.type, param.value);
    });

    const coursesResult = await coursesRequest.query(`
      SELECT 
        c.id, c.title, c.description, c.shortDescription, c.price, c.originalPrice,
        c.thumbnail, c.level, c.duration, c.language, c.enrollmentCount, c.rating, c.reviewCount,
        c.createdAt, c.updatedAt,
        u.fullName as instructorName,
        cat.name as categoryName
      FROM Courses c
      INNER JOIN Users u ON c.instructorId = u.id
      INNER JOIN Categories cat ON c.categoryId = cat.id
      WHERE ${whereClause}
      ORDER BY c.createdAt DESC
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
      .input('courseId', sql.Int, id)
      .query(`
        SELECT 
          c.*, 
          u.fullName as instructorName, u.bio as instructorBio,
          cat.name as categoryName
        FROM Courses c
        INNER JOIN Users u ON c.instructorId = u.id
        INNER JOIN Categories cat ON c.categoryId = cat.id
        WHERE c.id = @courseId AND c.isPublished = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get course lessons
    const lessonsResult = await pool.request()
      .input('courseId', sql.Int, id)
      .query(`
        SELECT id, title, description, duration, orderIndex
        FROM CourseLessons
        WHERE courseId = @courseId AND isPublished = 1
        ORDER BY orderIndex
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
      SELECT c.*, COUNT(co.id) as courseCount
      FROM Categories c
      LEFT JOIN Courses co ON c.id = co.categoryId AND co.isPublished = 1
      GROUP BY c.id, c.name, c.description, c.createdAt
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
      .query('SELECT id, title, price FROM Courses WHERE id = @courseId AND isPublished = 1');

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