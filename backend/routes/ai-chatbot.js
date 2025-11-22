/**
 * AI Chatbot Routes
 * API endpoints để AI chatbot lấy dữ liệu courses từ database
 */

import express from 'express';
import { connectDB } from '../config/database.js';
import sql from 'mssql';

const router = express.Router();

/**
 * GET /api/ai-chatbot/courses-context
 * Lấy thông tin courses để AI tư vấn
 */
router.get('/courses-context', async (req, res) => {
  try {
    const pool = await connectDB();
    
    const result = await pool.request().query`
      SELECT 
        c.course_id,
        c.title,
        c.description,
        c.price,
        c.category,
        c.level,
        c.language,
        c.duration_weeks,
        u.full_name as instructor_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) as total_students,
        (SELECT AVG(CAST(rating AS FLOAT)) FROM course_reviews cr WHERE cr.course_id = c.course_id) as avg_rating
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.user_id
      WHERE c.is_published = 1
      ORDER BY c.created_at DESC
    `;

    const courses = result.recordset;

    // Format data cho AI
    const coursesContext = courses.map(course => ({
      id: course.course_id,
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      level: course.level,
      language: course.language,
      duration: course.duration_weeks,
      instructor: course.instructor_name,
      students: course.total_students || 0,
      rating: course.avg_rating ? parseFloat(course.avg_rating).toFixed(1) : 'Chưa có'
    }));

    res.json({
      success: true,
      data: coursesContext,
      summary: {
        total: coursesContext.length,
        categories: [...new Set(courses.map(c => c.category))],
        levels: [...new Set(courses.map(c => c.level))]
      }
    });

  } catch (error) {
    console.error('❌ Error fetching courses context:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy dữ liệu khóa học'
    });
  }
});

/**
 * GET /api/ai-chatbot/course/:id
 * Lấy chi tiết 1 khóa học
 */
router.get('/course/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    const result = await pool.request()
      .input('courseId', sql.Int, id)
      .query`
        SELECT 
          c.*,
          u.full_name as instructor_name,
          u.email as instructor_email,
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) as total_students,
          (SELECT AVG(CAST(rating AS FLOAT)) FROM course_reviews cr WHERE cr.course_id = c.course_id) as avg_rating,
          (SELECT COUNT(*) FROM course_reviews cr WHERE cr.course_id = c.course_id) as total_reviews
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.user_id
        WHERE c.course_id = @courseId AND c.is_published = 1
      `;

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Error fetching course detail:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy chi tiết khóa học'
    });
  }
});

/**
 * POST /api/ai-chatbot/search-courses
 * Tìm kiếm khóa học theo tiêu chí
 */
router.post('/search-courses', async (req, res) => {
  try {
    const { category, level, priceMax, keyword } = req.body;
    const pool = await connectDB();

    let query = `
      SELECT 
        c.course_id,
        c.title,
        c.description,
        c.price,
        c.category,
        c.level,
        c.language,
        c.duration_weeks,
        u.full_name as instructor_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) as total_students,
        (SELECT AVG(CAST(rating AS FLOAT)) FROM course_reviews cr WHERE cr.course_id = c.course_id) as avg_rating
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.user_id
      WHERE c.is_published = 1
    `;

    const request = pool.request();

    if (category) {
      query += ` AND c.category = @category`;
      request.input('category', sql.NVarChar, category);
    }

    if (level) {
      query += ` AND c.level = @level`;
      request.input('level', sql.NVarChar, level);
    }

    if (priceMax) {
      query += ` AND c.price <= @priceMax`;
      request.input('priceMax', sql.Decimal(10, 2), priceMax);
    }

    if (keyword) {
      query += ` AND (c.title LIKE @keyword OR c.description LIKE @keyword)`;
      request.input('keyword', sql.NVarChar, `%${keyword}%`);
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await request.query(query);
    const courses = result.recordset;

    res.json({
      success: true,
      data: courses,
      total: courses.length
    });

  } catch (error) {
    console.error('❌ Error searching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tìm kiếm khóa học'
    });
  }
});

export default router;
