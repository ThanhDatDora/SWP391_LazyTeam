import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 1 && req.user.roleId !== 1) {
    return res.status(403).json({ 
      success: false,
      error: 'Admin access required' 
    });
  }
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
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedCourses,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCourses,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedCourses
      FROM courses
    `);

    // Total revenue
    const revenueResult = await pool.request().query(`
      SELECT 
        ISNULL(SUM(amount_cents), 0) as totalRevenue,
        ISNULL(SUM(CASE WHEN status = 'completed' THEN amount_cents ELSE 0 END), 0) as completedRevenue
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
        approvedCourses: courses.approvedCourses || 0,
        pendingCourses: courses.pendingCourses || 0,
        rejectedCourses: courses.rejectedCourses || 0,
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
        u.created_at
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
        u.created_at
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

// Get pending courses
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
      WHERE c.status = 'pending'
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

// Approve course
router.post('/courses/:courseId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('courseId', sql.Int, courseId)
      .query(`
        UPDATE courses 
        SET status = 'approved', updated_at = GETDATE()
        WHERE course_id = @courseId
      `);

    res.json({
      success: true,
      message: 'Course approved successfully'
    });

  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve course' 
    });
  }
});

// Reject course
router.post('/courses/:courseId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('courseId', sql.Int, courseId)
      .input('reason', sql.NVarChar, reason || 'Not specified')
      .query(`
        UPDATE courses 
        SET status = 'rejected', 
            rejection_reason = @reason,
            updated_at = GETDATE()
        WHERE course_id = @courseId
      `);

    res.json({
      success: true,
      message: 'Course rejected successfully'
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

// Get instructor revenue
router.get('/instructor-revenue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📡 GET /instructor-revenue - Starting...');
    const pool = await getPool();

    const query = `
      SELECT 
        u.user_id,
        u.full_name as instructor_name,
        u.email,
        u.created_at
      FROM users u
      WHERE u.role_id = 2
      ORDER BY u.created_at DESC
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

export default router;
