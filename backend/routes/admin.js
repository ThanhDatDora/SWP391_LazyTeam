import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware check admin role
const requireAdmin = (req, res, next) => {
  // req.user.role is role_id (number: 1=admin, 2=instructor, 3=learner)
  // req.user.roleName is role_name (string: "admin", "instructor", "learner")
  console.log('🔐 requireAdmin check:', {
    userId: req.user.userId,
    email: req.user.email,
    role: req.user.role,
    roleName: req.user.roleName,
    roleType: typeof req.user.role,
    roleNameType: typeof req.user.roleName
  });
  
  // Support both role_id (number) and role_name (string) for backward compatibility
  const isAdmin = req.user.role === 1 || req.user.role === 'admin' || req.user.roleName === 'admin';
  
  if (!isAdmin) {
    console.log('❌ Access denied - user is not admin');
    return res.status(403).json({ 
      success: false,
      error: 'Admin access required',
      debug: {
        currentRole: req.user.role,
        currentRoleName: req.user.roleName,
        expectedRole: 1,
        expectedRoleName: 'admin'
      }
    });
  }
  
  console.log('✅ Admin access granted');
  next();
};

// ==================== STATS ENDPOINTS ====================

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    // Total users by role
    const usersResult = await pool.request().query(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as totalAdmins,
        SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as totalInstructors,
        SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as totalLearners,
        SUM(CASE WHEN created_at >= DATEADD(MONTH, -1, GETDATE()) THEN 1 ELSE 0 END) as newUsersThisMonth
      FROM users
      WHERE status = 'active'
    `);

    // Total courses
    const coursesResult = await pool.request().query(`
      SELECT 
        COUNT(*) as totalCourses,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCourses,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as publishedCourses,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftCourses,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archivedCourses
      FROM courses
    `);

    // Total revenue
    const revenueResult = await pool.request().query(`
      SELECT 
        ISNULL(SUM(amount_cents), 0) as totalRevenue,
        ISNULL(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END), 0) as completedRevenue
      FROM payments
    `);

    // Active enrollments
    const enrollmentsResult = await pool.request().query(`
      SELECT COUNT(*) as totalEnrollments
      FROM enrollments
    `);

    const stats = usersResult.recordset[0];
    const courses = coursesResult.recordset[0];
    const revenue = revenueResult.recordset[0];
    const enrollments = enrollmentsResult.recordset[0];

    res.json({
      success: true,
      data: {
        totalUsers: stats.totalUsers || 0,
        totalAdmins: stats.totalAdmins || 0,
        totalInstructors: stats.totalInstructors || 0,
        totalLearners: stats.totalLearners || 0,
        newUsersThisMonth: stats.newUsersThisMonth || 0,
        totalCourses: courses.totalCourses || 0,
        activeCourses: courses.activeCourses || 0,
        publishedCourses: courses.publishedCourses || 0,
        draftCourses: courses.draftCourses || 0,
        archivedCourses: courses.archivedCourses || 0,
        totalRevenue: revenue.totalRevenue || 0,
        completedRevenue: revenue.completedRevenue || 0,
        totalEnrollments: enrollments.totalEnrollments || 0
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get statistics' 
    });
  }
});

// ==================== USERS ENDPOINTS ====================

// Get all users with pagination and filters
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      role, 
      search,
      status 
    } = req.query;

    const pool = await getPool();
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    
    if (role) {
      whereClause += ` AND u.role_id = ${parseInt(role)}`;
    }
    
    if (status) {
      whereClause += ` AND u.status = '${status}'`;
    }
    
    if (search) {
      whereClause += ` AND (u.full_name LIKE '%${search}%' OR u.email LIKE '%${search}%')`;
    }

    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.full_name,
        u.role_id,
        r.role_name,
        u.status,
        u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ${whereClause}
      ORDER BY u.created_at DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      pool.request().query(query),
      pool.request().query(countQuery)
    ]);

    res.json({
      success: true,
      data: {
        users: usersResult.recordset,
        total: countResult.recordset[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get users' 
    });
  }
});

// ==================== LEARNERS ENDPOINTS ====================

// Get all learners
router.get('/learners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.role_id = 3';
    
    if (search) {
      whereClause += ` AND (u.full_name LIKE '%${search}%' OR u.email LIKE '%${search}%')`;
    }

    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.full_name,
        u.status,
        u.created_at,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = u.user_id) as enrolled_courses,
        (SELECT COUNT(*) FROM certificates WHERE user_id = u.user_id) as certificates_earned
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;

    const [learnersResult, countResult] = await Promise.all([
      pool.request().query(query),
      pool.request().query(countQuery)
    ]);

    res.json({
      success: true,
      data: {
        learners: learnersResult.recordset,
        total: countResult.recordset[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get learners error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get learners' 
    });
  }
});

// ==================== INSTRUCTORS ENDPOINTS ====================

// Get all instructors
router.get('/instructors', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.role_id = 2';
    
    if (search) {
      whereClause += ` AND (u.full_name LIKE '%${search}%' OR u.email LIKE '%${search}%')`;
    }

    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.full_name,
        u.status,
        u.created_at,
        (SELECT COUNT(*) FROM courses WHERE owner_instructor_id = u.user_id) as total_courses,
        (SELECT COUNT(*) FROM courses WHERE owner_instructor_id = u.user_id AND status IN ('active', 'published')) as published_courses,
        (SELECT COUNT(DISTINCT e.user_id) FROM courses c 
         INNER JOIN enrollments e ON c.course_id = e.course_id 
         WHERE c.owner_instructor_id = u.user_id) as total_students
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;

    const [instructorsResult, countResult] = await Promise.all([
      pool.request().query(query),
      pool.request().query(countQuery)
    ]);

    res.json({
      success: true,
      data: {
        instructors: instructorsResult.recordset,
        total: countResult.recordset[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get instructors' 
    });
  }
});

// ==================== COURSES ENDPOINTS ====================

// Get all courses
router.get('/courses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    
    if (status) {
      whereClause += ` AND c.status = '${status}'`;
    }
    
    if (search) {
      whereClause += ` AND (c.title LIKE '%${search}%' OR c.description LIKE '%${search}%')`;
    }

    const query = `
      SELECT 
        c.course_id,
        c.title,
        c.description,
        c.price,
        c.status,
        c.created_at,
        c.updated_at,
        u.full_name as instructor_name,
        u.email as instructor_email,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) as total_enrollments,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.course_id) as total_lessons
      FROM courses c
      LEFT JOIN users u ON c.owner_instructor_id = u.user_id
      ${whereClause}
      ORDER BY c.created_at DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `;

    const [coursesResult, countResult] = await Promise.all([
      pool.request().query(query),
      pool.request().query(countQuery)
    ]);

    res.json({
      success: true,
      data: {
        courses: coursesResult.recordset,
        total: countResult.recordset[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get courses' 
    });
  }
});

// Get pending courses (draft courses waiting to be published)
router.get('/courses/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const query = `
      SELECT 
        c.course_id,
        c.title,
        c.description,
        c.price,
        c.status,
        c.created_at,
        u.user_id as instructor_id,
        u.full_name as instructor_name,
        u.email as instructor_email,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.course_id) as total_lessons
      FROM courses c
      LEFT JOIN users u ON c.owner_instructor_id = u.user_id
      WHERE c.status IN ('draft', 'pending')
      ORDER BY c.created_at DESC
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: {
        courses: result.recordset
      }
    });

  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get pending courses' 
    });
  }
});



// Approve course (change status from draft/pending to active)
// Support both POST and PUT methods
router.post('/courses/:courseId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .query(`
        UPDATE courses 
        SET status = 'active', updated_at = GETDATE()
        WHERE course_id = @courseId
      `);

    res.json({
      success: true,
      message: 'Course approved and activated successfully'
    });

  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve course' 
    });
  }
});

router.put('/courses/:courseId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .query(`
        UPDATE courses 
        SET status = 'active', updated_at = GETDATE()
        WHERE course_id = @courseId
      `);

    res.json({
      success: true,
      message: 'Course approved and activated successfully'
    });

  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve course' 
    });
  }
});

// Reject course (archive it)
// Support both POST and PUT methods
router.post('/courses/:courseId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;
    const pool = await getPool();

    // Note: 'rejection_reason' column may not exist in courses table
    // So we'll just change status to 'archived'
    await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .query(`
        UPDATE courses 
        SET status = 'archived', 
            updated_at = GETDATE()
        WHERE course_id = @courseId
      `);

    res.json({
      success: true,
      message: 'Course rejected and archived successfully'
    });

  } catch (error) {
    console.error('Reject course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reject course' 
    });
  }
});

router.put('/courses/:courseId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;
    const pool = await getPool();

    // Note: 'rejection_reason' column may not exist in courses table
    // So we'll just change status to 'archived'
    await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .query(`
        UPDATE courses 
        SET status = 'archived', 
            updated_at = GETDATE()
        WHERE course_id = @courseId
      `);

    res.json({
      success: true,
      message: 'Course rejected and archived successfully'
    });

  } catch (error) {
    console.error('Reject course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reject course' 
    });
  }
});

// ==================== USER MANAGEMENT ====================

// Toggle user active status
router.post('/users/:userId/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE users 
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
        OUTPUT INSERTED.is_active
        WHERE user_id = @userId
      `);

    res.json({
      success: true,
      message: 'User status updated',
      data: {
        is_active: result.recordset[0].is_active
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update user status' 
    });
  }
});

// Lock user account
router.put('/users/:userId/lock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔒 PUT /users/:userId/lock - Locking user account...');
    const { userId } = req.params;
    const pool = await getPool();

    // Get user info before locking
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT full_name FROM users WHERE user_id = @userId');

    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE users 
        SET status = 'locked'
        WHERE user_id = @userId
      `);

    console.log('✅ User locked successfully:', userId);

    // Emit WebSocket event to notify user in real-time
    const wsService = req.app.locals.wsService;
    if (wsService && userResult.recordset.length > 0) {
      const fullName = userResult.recordset[0].full_name;
      wsService.emitAccountLocked(parseInt(userId), fullName);
    }

    res.json({
      success: true,
      message: 'Tài khoản đã được khóa thành công'
    });

  } catch (error) {
    console.error('❌ Lock user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to lock user account' 
    });
  }
});

// Unlock user account
router.put('/users/:userId/unlock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔓 PUT /users/:userId/unlock - Unlocking user account...');
    const { userId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE users 
        SET status = 'active'
        WHERE user_id = @userId
      `);

    console.log('✅ User unlocked successfully:', userId);
    res.json({
      success: true,
      message: 'Tài khoản đã được mở khóa thành công'
    });

  } catch (error) {
    console.error('❌ Unlock user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to unlock user account' 
    });
  }
});

// Delete user (soft delete)
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE users 
        SET is_deleted = 1, updated_at = GETDATE()
        WHERE user_id = @userId
      `);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete user' 
    });
  }
});

// ==================== REVENUE ENDPOINTS ====================

// Get instructor revenue with platform commission (10%)
router.get('/instructor-revenue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📡 GET /instructor-revenue - Starting...');
    const pool = await getPool();

    const query = `
      SELECT 
        u.user_id,
        u.full_name as instructor_name,
        u.email,
        u.created_at,
        (SELECT COUNT(*) FROM courses WHERE owner_instructor_id = u.user_id) as total_courses,
        (SELECT COUNT(DISTINCT e.user_id) 
         FROM courses c2 
         INNER JOIN enrollments e ON c2.course_id = e.course_id 
         WHERE c2.owner_instructor_id = u.user_id) as total_students,
        (SELECT ISNULL(SUM(inv.amount), 0) 
         FROM courses c3
         INNER JOIN invoices inv ON inv.course_id = c3.course_id AND inv.status = 'paid'
         WHERE c3.owner_instructor_id = u.user_id) as total_revenue,
        NULL as average_rating
      FROM users u
      WHERE u.role_id = 2
      ORDER BY total_revenue DESC
    `;

    console.log('📝 Revenue query:', query);
    const result = await pool.request().query(query);
    console.log('✅ Revenue loaded:', result.recordset.length, 'instructors');

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('❌ Get instructor revenue error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get instructor revenue'
    });
  }
});

// ==================== CHANGE USER ROLE ====================

/**
 * Change user role (Instructor ↔ Learner only)
 * PUT /api/admin/users/:id/role
 * Body: { role_id: 2 | 3 }
 */
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role_id } = req.body;

    console.log('🔄 Change role request:', { userId, role_id });

    // Validate input
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    if (![2, 3].includes(role_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'role_id must be 2 (Instructor) or 3 (Learner)' 
      });
    }

    const pool = await getPool();

    // Get current user
    const userResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query('SELECT user_id, role_id, full_name FROM dbo.users WHERE user_id = @user_id');

    if (!userResult.recordset || userResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const currentUser = userResult.recordset[0];

    // Block Admin role changes
    if (currentUser.role_id === 1 || role_id === 1) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot change Admin role' 
      });
    }

    // Check if role is already the same
    if (currentUser.role_id === role_id) {
      return res.status(200).json({ 
        success: true, 
        message: 'Role is already set to this value' 
      });
    }

    // Update role
    await pool.request()
      .input('role_id', sql.Int, role_id)
      .input('user_id', sql.Int, userId)
      .query('UPDATE dbo.users SET role_id = @role_id WHERE user_id = @user_id');

    const roleNames = { 2: 'Instructor', 3: 'Learner' };
    console.log(`✅ Role updated: ${currentUser.full_name} (${userId}) → ${roleNames[role_id]}`);

    return res.status(200).json({ 
      success: true,
      message: `Role updated to ${roleNames[role_id]}` 
    });

  } catch (error) {
    console.error('❌ Change role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to change user role',
      details: error.message
    });
  }
});

// ==================== LEARNING STATS ENDPOINT ====================

// Get learning statistics
router.get('/learning-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    // 1. Get overall enrollment and completion stats
    const completionResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(DISTINCT user_id) as total_learners,
        SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as excellent,
        0 as good,
        SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as needs_improvement,
        50.0 as avg_progress,
        CAST(SUM(CASE WHEN completed_at IS NOT NULL THEN 100.0 ELSE 0 END) / NULLIF(COUNT(*), 0) as DECIMAL(5,2)) as completion_rate
      FROM enrollments
      WHERE status = 'active'
    `);

    // 2. Get top courses by enrollment
    const topCoursesResult = await pool.request().query(`
      SELECT TOP 5
        c.course_id,
        c.title,
        NULL as thumbnail_url,
        u.full_name as instructor_name,
        COUNT(e.enrollment_id) as enrolled_count,
        CAST(SUM(CASE WHEN e.completed_at IS NOT NULL THEN 100.0 ELSE 0 END) / NULLIF(COUNT(e.enrollment_id), 0) as DECIMAL(5,2)) as completion_rate,
        50.0 as avg_progress
      FROM courses c
      LEFT JOIN users u ON c.owner_instructor_id = u.user_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      WHERE c.status = 'active'
      GROUP BY c.course_id, c.title, u.full_name
      ORDER BY enrolled_count DESC
    `);

    // 3. Calculate study stats from progress table (simplified - no time tracking yet)
    const avgTimeResult = await pool.request().query(`
      SELECT 
        0.0 as avg_lesson_time_minutes,
        0 as total_study_time_minutes,
        COUNT(DISTINCT user_id) as active_learners,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as total_completed_lessons,
        COUNT(*) as total_lesson_attempts
      FROM progress
    `);

    // 4. Get quiz/exam performance stats (placeholder - exam_attempts table doesn't exist)
    const examStatsResult = {
      recordset: [{
        students_took_exams: 0,
        total_exam_attempts: 0,
        passed_attempts: 0,
        avg_exam_score: 0,
        pass_rate: 0
      }]
    };

    // 5. Get recent activity (last 30 days)
    const recentActivityResult = await pool.request().query(`
      SELECT 
        COUNT(DISTINCT e.user_id) as active_users_last_30days,
        COUNT(DISTINCT CASE WHEN e.enrolled_at >= DATEADD(day, -30, GETDATE()) THEN e.user_id END) as new_enrollments_last_30days,
        COUNT(DISTINCT CASE WHEN e.completed_at >= DATEADD(day, -30, GETDATE()) THEN e.user_id END) as completions_last_30days
      FROM enrollments e
      WHERE e.enrolled_at >= DATEADD(day, -30, GETDATE())
         OR e.completed_at >= DATEADD(day, -30, GETDATE())
    `);

    // 6. Get most active learners (top 10)
    const topLearnersResult = await pool.request().query(`
      SELECT TOP 10
        u.user_id,
        u.full_name,
        u.email,
        COUNT(e.enrollment_id) as courses_enrolled,
        SUM(CASE WHEN e.completed_at IS NOT NULL THEN 1 ELSE 0 END) as courses_completed,
        50.0 as avg_progress
      FROM users u
      INNER JOIN enrollments e ON u.user_id = e.user_id
      WHERE u.role_id = 3 AND e.status = 'active'
      GROUP BY u.user_id, u.full_name, u.email
      ORDER BY courses_completed DESC, courses_enrolled DESC
    `);

    const completion = completionResult.recordset[0];
    const avgTime = avgTimeResult.recordset[0];
    const examStats = examStatsResult.recordset[0];
    const recentActivity = recentActivityResult.recordset[0];

    res.json({
      success: true,
      data: {
        overview: {
          total_enrollments: completion.total_enrollments || 0,
          total_learners: completion.total_learners || 0,
          avg_progress: parseFloat((completion.avg_progress || 0).toFixed(2)),
          completion_rate: Math.round(completion.completion_rate || 0)
        },
        completion: {
          not_started: completion.not_started || 0,
          in_progress: completion.in_progress || 0,
          completed: completion.completed || 0,
          excellent: completion.excellent || 0,
          good: completion.good || 0,
          needs_improvement: completion.needs_improvement || 0
        },
        studyTime: {
          avg_lesson_time_minutes: parseFloat((avgTime.avg_lesson_time_minutes || 0).toFixed(2)),
          total_study_time_hours: parseFloat(((avgTime.total_study_time_minutes || 0) / 60).toFixed(2)),
          active_learners: avgTime.active_learners || 0,
          total_completed_lessons: avgTime.total_completed_lessons || 0,
          total_lesson_attempts: avgTime.total_lesson_attempts || 0
        },
        examPerformance: {
          students_took_exams: examStats.students_took_exams || 0,
          total_exam_attempts: examStats.total_exam_attempts || 0,
          passed_attempts: examStats.passed_attempts || 0,
          avg_exam_score: parseFloat((examStats.avg_exam_score || 0).toFixed(2)),
          pass_rate: Math.round(examStats.pass_rate || 0)
        },
        recentActivity: {
          active_users_last_30days: recentActivity.active_users_last_30days || 0,
          new_enrollments_last_30days: recentActivity.new_enrollments_last_30days || 0,
          completions_last_30days: recentActivity.completions_last_30days || 0
        },
        topCourses: topCoursesResult.recordset.map(course => ({
          course_id: course.course_id,
          title: course.title,
          thumbnail_url: course.thumbnail_url,
          instructor_name: course.instructor_name,
          enrolled_count: course.enrolled_count,
          completion_rate: Math.round(course.completion_rate || 0),
          avg_progress: parseFloat((course.avg_progress || 0).toFixed(2))
        })),
        topLearners: topLearnersResult.recordset.map(learner => ({
          user_id: learner.user_id,
          full_name: learner.full_name,
          email: learner.email,
          courses_enrolled: learner.courses_enrolled,
          courses_completed: learner.courses_completed,
          avg_progress: parseFloat((learner.avg_progress || 0).toFixed(2))
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get learning stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch learning statistics',
      details: error.message
    });
  }
});

// ==================== CATEGORY MANAGEMENT ENDPOINTS ====================

// Get all categories with course details
router.get('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    
    // Get categories with course count
    const categoriesResult = await pool.request().query(`
      SELECT 
        c.category_id as id,
        c.name,
        COUNT(co.course_id) as courseCount
      FROM categories c
      LEFT JOIN courses co ON c.category_id = co.category_id AND co.status = 'active'
      GROUP BY c.category_id, c.name
      ORDER BY c.name
    `);

    // Get courses for each category
    const coursesResult = await pool.request().query(`
      SELECT 
        co.course_id as id,
        co.title,
        co.category_id as categoryId
      FROM courses co
      WHERE co.status = 'active'
      ORDER BY co.title
    `);

    // Map courses to categories
    const categories = categoriesResult.recordset.map(cat => ({
      id: cat.id,
      name: cat.name,
      courseCount: cat.courseCount || 0,
      courses: coursesResult.recordset
        .filter(c => c.categoryId === cat.id)
        .map(c => ({ id: c.id, title: c.title }))
    }));

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
});

// Create new category
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    const pool = await getPool();

    // Check if category already exists
    const existingCategory = await pool.request()
      .input('name', sql.NVarChar, name.trim())
      .query('SELECT category_id FROM categories WHERE name = @name');

    if (existingCategory.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Insert new category
    const result = await pool.request()
      .input('name', sql.NVarChar, name.trim())
      .query(`
        INSERT INTO categories (name)
        OUTPUT INSERTED.category_id as id, INSERTED.name
        VALUES (@name)
      `);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: {
        id: result.recordset[0].id,
        name: result.recordset[0].name,
        courseCount: 0,
        courses: []
      }
    });

  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create category',
      details: error.message
    });
  }
});

// Update category
router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    const pool = await getPool();

    // Check if category exists
    const categoryCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT category_id FROM categories WHERE category_id = @id');

    if (categoryCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if new name already exists (excluding current category)
    const existingCategory = await pool.request()
      .input('name', sql.NVarChar, name.trim())
      .input('id', sql.Int, id)
      .query('SELECT category_id FROM categories WHERE name = @name AND category_id != @id');

    if (existingCategory.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Update category
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name.trim())
      .query('UPDATE categories SET name = @name WHERE category_id = @id');

    res.json({
      success: true,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update category',
      details: error.message
    });
  }
});

// Delete category
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Check if category exists
    const categoryCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT category_id FROM categories WHERE category_id = @id');

    if (categoryCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has courses
    const coursesCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as count FROM courses WHERE category_id = @id');

    if (coursesCheck.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with associated courses'
      });
    }

    // Delete category
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM categories WHERE category_id = @id');

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete category',
      details: error.message
    });
  }
});

export default router;