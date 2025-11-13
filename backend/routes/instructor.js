import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import sql from 'mssql';
import { getPool } from '../config/database.js';

const router = express.Router();

// ==================== MOOC MANAGEMENT ====================

/**
 * GET /api/instructor/courses/:courseId/moocs
 * Get all MOOCs for a course
 */
router.get('/courses/:courseId/moocs', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { courseId } = req.params;

    const pool = await getPool();
    const result = await pool.request()
      .input('course_id', sql.Int, courseId)
      .query(`
        SELECT 
          mooc_id,
          course_id,
          title,
          description,
          order_no,
          created_at
        FROM moocs
        WHERE course_id = @course_id
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
      message: 'Không thể lấy danh sách MOOC'
    });
  }
});

/**
 * POST /api/instructor/courses/:courseId/moocs
 * Create a new MOOC
 */
router.post('/courses/:courseId/moocs', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order_no } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên MOOC'
      });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('course_id', sql.Int, courseId)
      .input('title', sql.NVarChar(255), title.trim())
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('order_no', sql.Int, order_no || 1)
      .query(`
        INSERT INTO moocs (course_id, title, description, order_no)
        OUTPUT INSERTED.*
        VALUES (@course_id, @title, @description, @order_no)
      `);

    res.status(201).json({
      success: true,
      message: 'Tạo MOOC thành công',
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error creating MOOC:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo MOOC'
    });
  }
});

/**
 * PUT /api/instructor/moocs/:moocId
 * Update a MOOC
 */
router.put('/moocs/:moocId', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { moocId } = req.params;
    const { title, description, order_no } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên MOOC'
      });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('mooc_id', sql.Int, moocId)
      .input('title', sql.NVarChar(255), title.trim())
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('order_no', sql.Int, order_no || 1)
      .query(`
        UPDATE moocs
        SET 
          title = @title,
          description = @description,
          order_no = @order_no
        OUTPUT INSERTED.*
        WHERE mooc_id = @mooc_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy MOOC'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật MOOC thành công',
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error updating MOOC:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật MOOC'
    });
  }
});

/**
 * DELETE /api/instructor/moocs/:moocId
 * Delete a MOOC (will cascade delete lessons if configured)
 */
router.delete('/moocs/:moocId', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { moocId } = req.params;

    const pool = await getPool();
    
    // Check if MOOC exists and has lessons
    const checkResult = await pool.request()
      .input('mooc_id', sql.Int, moocId)
      .query(`
        SELECT 
          m.mooc_id,
          m.title,
          COUNT(l.lesson_id) as lesson_count
        FROM moocs m
        LEFT JOIN lessons l ON m.mooc_id = l.mooc_id
        WHERE m.mooc_id = @mooc_id
        GROUP BY m.mooc_id, m.title
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy MOOC'
      });
    }

    const mooc = checkResult.recordset[0];
    
    // Delete all lessons first
    if (mooc.lesson_count > 0) {
      await pool.request()
        .input('mooc_id', sql.Int, moocId)
        .query('DELETE FROM lessons WHERE mooc_id = @mooc_id');
    }

    // Delete the MOOC
    await pool.request()
      .input('mooc_id', sql.Int, moocId)
      .query('DELETE FROM moocs WHERE mooc_id = @mooc_id');

    res.json({
      success: true,
      message: 'Xóa MOOC thành công'
    });

  } catch (error) {
    console.error('Error deleting MOOC:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa MOOC'
    });
  }
});

// ==================== LESSON MANAGEMENT ====================

/**
 * GET /api/instructor/courses/:courseId/lessons
 * Get all lessons for a course
 */
router.get('/courses/:courseId/lessons', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { courseId } = req.params;

    const pool = await getPool();
    const result = await pool.request()
      .input('course_id', sql.Int, courseId)
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
          l.created_at,
          m.title as mooc_title,
          m.order_no as mooc_order
        FROM lessons l
        JOIN moocs m ON l.mooc_id = m.mooc_id
        WHERE m.course_id = @course_id
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
      message: 'Không thể lấy danh sách bài học'
    });
  }
});

/**
 * POST /api/instructor/lessons
 * Create a new lesson
 */
router.post('/lessons', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { 
      mooc_id, 
      title, 
      content_type, 
      content_url, 
      description, 
      order_no, 
      duration,
      is_preview 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên bài học'
      });
    }

    if (!mooc_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn MOOC'
      });
    }

    if (!['video', 'assignment', 'reading'].includes(content_type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại nội dung không hợp lệ'
      });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('mooc_id', sql.Int, mooc_id)
      .input('title', sql.NVarChar(255), title.trim())
      .input('content_type', sql.NVarChar(50), content_type)
      .input('content_url', sql.NVarChar(sql.MAX), content_url || '')
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('order_no', sql.Int, order_no || 1)
      .input('duration', sql.Int, duration || 0)
      .input('is_preview', sql.Bit, is_preview || false)
      .query(`
        INSERT INTO lessons (
          mooc_id, 
          title, 
          content_type, 
          content_url, 
          description, 
          order_no, 
          duration,
          is_preview
        )
        OUTPUT INSERTED.*
        VALUES (
          @mooc_id, 
          @title, 
          @content_type, 
          @content_url, 
          @description, 
          @order_no, 
          @duration,
          @is_preview
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Tạo bài học thành công',
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo bài học'
    });
  }
});

/**
 * PUT /api/instructor/lessons/:lessonId
 * Update a lesson
 */
router.put('/lessons/:lessonId', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { 
      mooc_id,
      title, 
      content_type, 
      content_url, 
      description, 
      order_no, 
      duration,
      is_preview 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên bài học'
      });
    }

    if (!mooc_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn MOOC'
      });
    }

    if (!['video', 'assignment', 'reading'].includes(content_type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại nội dung không hợp lệ'
      });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('lesson_id', sql.Int, lessonId)
      .input('mooc_id', sql.Int, mooc_id)
      .input('title', sql.NVarChar(255), title.trim())
      .input('content_type', sql.NVarChar(50), content_type)
      .input('content_url', sql.NVarChar(sql.MAX), content_url || '')
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('order_no', sql.Int, order_no || 1)
      .input('duration', sql.Int, duration || 0)
      .input('is_preview', sql.Bit, is_preview || false)
      .query(`
        UPDATE lessons
        SET 
          mooc_id = @mooc_id,
          title = @title,
          content_type = @content_type,
          content_url = @content_url,
          description = @description,
          order_no = @order_no,
          duration = @duration,
          is_preview = @is_preview
        OUTPUT INSERTED.*
        WHERE lesson_id = @lesson_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật bài học thành công',
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật bài học'
    });
  }
});

/**
 * DELETE /api/instructor/lessons/:lessonId
 * Delete a lesson
 */
router.delete('/lessons/:lessonId', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { lessonId } = req.params;

    const pool = await getPool();
    
    // Check if lesson exists
    const checkResult = await pool.request()
      .input('lesson_id', sql.Int, lessonId)
      .query('SELECT lesson_id, title FROM lessons WHERE lesson_id = @lesson_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học'
      });
    }

    // Delete related data first
    // Delete progress records
    await pool.request()
      .input('lesson_id', sql.Int, lessonId)
      .query('DELETE FROM progress WHERE lesson_id = @lesson_id');

    // Delete essay submissions if assignment
    await pool.request()
      .input('task_id', sql.Int, lessonId)
      .query('DELETE FROM essay_submissions WHERE task_id = @task_id');

    // Delete the lesson
    await pool.request()
      .input('lesson_id', sql.Int, lessonId)
      .query('DELETE FROM lessons WHERE lesson_id = @lesson_id');

    res.json({
      success: true,
      message: 'Xóa bài học thành công'
    });

  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài học'
    });
  }
});

// ==================== COURSE STUDENTS ====================

/**
 * GET /api/instructor/courses/:courseId/students
 * Get all enrolled students for a course
 */
router.get('/courses/:courseId/students', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { courseId } = req.params;

    const pool = await getPool();
    const result = await pool.request()
      .input('course_id', sql.Int, courseId)
      .query(`
        SELECT 
          e.enrollment_id,
          e.user_id,
          e.enrolled_at,
          e.is_completed,
          e.completion_date,
          u.full_name,
          u.email,
          u.avatar,
          COUNT(DISTINCT p.progress_id) as completed_lessons,
          COUNT(DISTINCT l.lesson_id) as total_lessons
        FROM enrollments e
        JOIN users u ON e.user_id = u.user_id
        LEFT JOIN moocs m ON e.course_id = m.course_id
        LEFT JOIN lessons l ON m.mooc_id = l.mooc_id
        LEFT JOIN progress p ON u.user_id = p.user_id AND l.lesson_id = p.lesson_id AND p.is_completed = 1
        WHERE e.course_id = @course_id
        GROUP BY 
          e.enrollment_id,
          e.user_id,
          e.enrolled_at,
          e.is_completed,
          e.completion_date,
          u.full_name,
          u.email,
          u.avatar
        ORDER BY e.enrolled_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách học viên'
    });
  }
});

// ==================== REVENUE & ANALYTICS ====================

/**
 * GET /api/instructor/revenue/summary
 * Get revenue summary for instructor
 */
router.get('/revenue/summary', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const instructorId = req.user.userId;
    const pool = await getPool();

    // Get total revenue from paid enrollments (80% instructor share)
    const revenueQuery = await pool.request()
      .input('instructor_id', sql.Int, instructorId)
      .query(`
        SELECT 
          COUNT(DISTINCT e.enrollment_id) as total_sales,
          COUNT(DISTINCT e.enrollment_id) as total_students,
          ISNULL(SUM(p.amount), 0) as total_revenue,
          ISNULL(SUM(p.amount * 0.8), 0) as instructor_share
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN invoices i ON e.enrollment_id = i.enrollment_id
        LEFT JOIN payments p ON i.invoice_id = p.invoice_id AND p.status = 'paid'
        WHERE c.owner_instructor_id = @instructor_id
      `);

    // Get monthly revenue for last 6 months
    const monthlyQuery = await pool.request()
      .input('instructor_id', sql.Int, instructorId)
      .query(`
        SELECT 
          FORMAT(p.payment_date, 'yyyy-MM') as month,
          COUNT(DISTINCT e.enrollment_id) as sales,
          ISNULL(SUM(p.amount), 0) as revenue,
          ISNULL(SUM(p.amount * 0.8), 0) as instructor_share
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN invoices i ON e.enrollment_id = i.enrollment_id
        LEFT JOIN payments p ON i.invoice_id = p.invoice_id AND p.status = 'paid'
        WHERE c.owner_instructor_id = @instructor_id
          AND p.payment_date >= DATEADD(MONTH, -6, GETDATE())
        GROUP BY FORMAT(p.payment_date, 'yyyy-MM')
        ORDER BY month DESC
      `);

    // Get top courses by revenue
    const topCoursesQuery = await pool.request()
      .input('instructor_id', sql.Int, instructorId)
      .query(`
        SELECT TOP 5
          c.course_id,
          c.title,
          COUNT(DISTINCT e.enrollment_id) as enrollments,
          ISNULL(SUM(p.amount), 0) as revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        LEFT JOIN invoices i ON e.enrollment_id = i.enrollment_id
        LEFT JOIN payments p ON i.invoice_id = p.invoice_id AND p.status = 'paid'
        WHERE c.owner_instructor_id = @instructor_id
        GROUP BY c.course_id, c.title
        ORDER BY revenue DESC
      `);

    const summary = revenueQuery.recordset[0] || {
      total_sales: 0,
      total_students: 0,
      total_revenue: 0,
      instructor_share: 0
    };

    res.json({
      success: true,
      data: {
        summary: {
          totalSales: summary.total_sales,
          totalStudents: summary.total_students,
          totalRevenue: summary.total_revenue,
          instructorShare: summary.instructor_share
        },
        monthlyRevenue: monthlyQuery.recordset,
        topCourses: topCoursesQuery.recordset
      }
    });

  } catch (error) {
    console.error('Error getting revenue summary:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê doanh thu'
    });
  }
});

export default router;


// Trigger restart
