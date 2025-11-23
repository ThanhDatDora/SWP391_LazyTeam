import express from 'express';
import sql from 'mssql';
import { getPool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all enrollments for current user (for Progress Page)
router.get('/my-enrollments', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user.userId;

    console.log('📚 Fetching enrollments for user:', userId);

    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          e.enrollment_id,
          e.user_id,
          e.course_id,
          e.enrolled_at,
          e.completed_at,
          e.status,
          
          -- Course info
          c.title as course_title,
          c.description as course_description,
          c.price,
          c.level,
          c.language_code as language,
          
          -- Instructor info
          u.full_name as instructor_name,
          u.avatar_url as instructor_avatar,
          
          -- Progress statistics
          (SELECT COUNT(*) FROM lessons l 
           JOIN moocs m ON l.mooc_id = m.mooc_id 
           WHERE m.course_id = c.course_id) as total_lessons,
          
          (SELECT COUNT(DISTINCT p.lesson_id) 
           FROM progress p
           JOIN lessons l ON p.lesson_id = l.lesson_id
           JOIN moocs m ON l.mooc_id = m.mooc_id
           WHERE m.course_id = c.course_id AND p.user_id = e.user_id AND p.is_completed = 1) as completed_lessons,
          
          (SELECT COUNT(*) FROM moocs WHERE course_id = c.course_id) as total_moocs,
          
          (SELECT COUNT(DISTINCT m.mooc_id)
           FROM moocs m
           JOIN lessons l ON m.mooc_id = l.mooc_id
           JOIN progress p ON l.lesson_id = p.lesson_id
           WHERE m.course_id = c.course_id 
           AND p.user_id = e.user_id 
           AND p.is_completed = 1
           AND NOT EXISTS (
             SELECT 1 FROM lessons l2 
             WHERE l2.mooc_id = m.mooc_id 
             AND NOT EXISTS (
               SELECT 1 FROM progress p2 
               WHERE p2.lesson_id = l2.lesson_id 
               AND p2.user_id = e.user_id 
               AND p2.is_completed = 1
             )
           )) as completed_moocs,
          
          -- Last activity (most recent lesson progress)
          (SELECT TOP 1 p.updated_at
           FROM progress p
           JOIN lessons l ON p.lesson_id = l.lesson_id
           JOIN moocs m ON l.mooc_id = m.mooc_id
           WHERE m.course_id = c.course_id AND p.user_id = e.user_id
           ORDER BY p.updated_at DESC) as last_activity

        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        LEFT JOIN users u ON c.owner_instructor_id = u.user_id
        WHERE e.user_id = @userId AND e.status = 'active'
        ORDER BY e.enrolled_at DESC
      `);

    console.log(`✅ Found ${result.recordset.length} enrollments`);

    // Fetch exam scores for all enrollments in this course
    let examScoresMap = new Map();
    if (result.recordset.length > 0) {
      const courseIds = [...new Set(result.recordset.map(r => r.course_id))];
      
      const examScoresResult = await pool.request()
        .input('userId', sql.BigInt, userId)
        .query(`
          SELECT 
            c.course_id,
            e.exam_id,
            e.name as exam_name,
            s.score as best_score,
            s.max_score,
            s.submitted_at
          FROM exams e
          JOIN moocs m ON e.mooc_id = m.mooc_id
          JOIN courses c ON m.course_id = c.course_id
          LEFT JOIN submissions s ON e.exam_id = s.exam_id AND s.user_id = @userId AND s.is_best = 1
          WHERE c.course_id IN (${courseIds.join(',')})
          ORDER BY c.course_id, e.exam_id
        `);
      
      // Group exam scores by course_id
      examScoresResult.recordset.forEach(row => {
        if (!examScoresMap.has(row.course_id)) {
          examScoresMap.set(row.course_id, []);
        }
        
        // Only include exams that have submissions
        if (row.best_score !== null) {
          examScoresMap.get(row.course_id).push({
            exam_id: row.exam_id,
            exam_name: row.exam_name || 'Bài thi',
            best_score: parseFloat(row.best_score) || 0,
            max_score: parseFloat(row.max_score) || 0,
            submitted_at: row.submitted_at
          });
        }
      });
      
      console.log(`📝 Fetched exam scores for ${examScoresMap.size} courses`);
    }

    // Transform data to match frontend structure
    const transformedData = result.recordset.map(row => ({
      enrollment_id: row.enrollment_id,
      user_id: row.user_id,
      course_id: row.course_id,
      enrolled_at: row.enrolled_at,
      completed_at: row.completed_at, // Add completion date
      status: row.status,
      
      // Course object (nested structure)
      course: {
        course_id: row.course_id,
        title: row.course_title,
        description: row.course_description,
        thumbnail_url: row.thumbnail_url,
        price: row.price,
        level: row.level,
        language: row.language,
        total_moocs: row.total_moocs,
        instructor: {
          name: row.instructor_name,
          avatar: row.instructor_avatar
        }
      },
      
      // Progress object (nested structure)
      progress: {
        completed_moocs: row.completed_moocs || 0,
        total_moocs: row.total_moocs || 0,
        completed_lessons: row.completed_lessons || 0,
        total_lessons: row.total_lessons || 0,
        percentage: row.total_lessons > 0 ? Math.round((row.completed_lessons / row.total_lessons) * 100) : 0, // Calculate from lessons
        exam_scores: examScoresMap.get(row.course_id) || [], // Real exam scores from DB
        last_activity: row.last_activity || row.enrolled_at
      }
    }));

    console.log(`📊 Transformed ${transformedData.length} enrollments with nested structure`);

    res.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('❌ Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enrollments',
      message: error.message
    });
  }
});

// Get enrollment details with full course structure
router.get('/:enrollmentId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { enrollmentId } = req.params;
    const userId = req.user.userId;

    console.log('📖 Fetching enrollment details:', enrollmentId);

    // Get enrollment basic info
    const enrollment = await pool.request()
      .input('enrollmentId', sql.BigInt, enrollmentId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          e.*,
          c.title as course_title,
          c.description as course_description,
          c.thumbnail_url,
          c.level,
          u.full_name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        LEFT JOIN users u ON c.instructor_id = u.user_id
        WHERE e.enrollment_id = @enrollmentId AND e.user_id = @userId
      `);

    if (enrollment.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      data: enrollment.recordset[0]
    });

  } catch (error) {
    console.error('❌ Error fetching enrollment details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enrollment details'
    });
  }
});

// Get course learning content (MOOCs, Lessons, Quizzes)
router.get('/course/:courseId/content', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { courseId } = req.params;
    const userId = req.user.userId;

    console.log('📚 Fetching course content for courseId:', courseId, 'userId:', userId);

    // Check if user is enrolled
    const enrollment = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT enrollment_id, status 
        FROM enrollments 
        WHERE course_id = @courseId AND user_id = @userId
      `);

    if (enrollment.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'User not enrolled in this course'
      });
    }

    // Get course structure with MOOCs and Lessons
    const moocs = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          m.mooc_id,
          m.title as mooc_title,
          m.order_no as mooc_order,
          
          -- Lessons in this MOOC
          l.lesson_id,
          l.title as lesson_title,
          l.content_type,
          l.content_url,
          l.order_no as lesson_order,
          l.is_preview,
          
          -- User progress
          ISNULL(lp.is_completed, 0) as completed,
          lp.updated_at as completed_at,
          lp.last_position_sec
          
        FROM moocs m
        LEFT JOIN lessons l ON m.mooc_id = l.mooc_id
        LEFT JOIN progress lp ON l.lesson_id = lp.lesson_id AND lp.user_id = @userId
        WHERE m.course_id = @courseId
        ORDER BY m.order_no, l.order_no
      `);

    // Get exams for this course (using submissions table)
    const exams = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          e.exam_id,
          e.mooc_id,
          e.name as exam_title,
          e.duration_minutes,
          e.attempts_allowed,
          e.show_answers_after,
          
          -- User attempts from submissions
          COUNT(s.submission_id) as attempts,
          MAX(s.score) as best_score,
          MAX(s.max_score) as max_score
          
        FROM exams e
        LEFT JOIN submissions s ON e.exam_id = s.exam_id AND s.user_id = @userId
        WHERE e.mooc_id IN (SELECT mooc_id FROM moocs WHERE course_id = @courseId)
        GROUP BY e.exam_id, e.mooc_id, e.name, e.duration_minutes, e.attempts_allowed, e.show_answers_after
        ORDER BY e.mooc_id
      `);

    // Group lessons by MOOC
    const moocsStructure = [];
    const moocsMap = new Map();

    moocs.recordset.forEach(row => {
      if (!moocsMap.has(row.mooc_id)) {
        moocsMap.set(row.mooc_id, {
          mooc_id: row.mooc_id,
          title: row.mooc_title,
          order: row.mooc_order,
          lessons: [],
          exams: []
        });
        moocsStructure.push(moocsMap.get(row.mooc_id));
      }

      if (row.lesson_id) {
        moocsMap.get(row.mooc_id).lessons.push({
          lesson_id: row.lesson_id,
          title: row.lesson_title,
          content_type: row.content_type,
          content_url: row.content_url,
          order: row.lesson_order,
          is_preview: row.is_preview,
          completed: row.completed,
          completed_at: row.completed_at,
          last_position_sec: row.last_position_sec
        });
      }
    });

    // Add exams to MOOCs (if any)
    exams.recordset.forEach(exam => {
      const mooc = moocsMap.get(exam.mooc_id);
      if (mooc) {
        if (!mooc.exams) mooc.exams = [];
        mooc.exams.push({
          exam_id: exam.exam_id,
          title: exam.exam_title,
          duration_minutes: exam.duration_minutes,
          attempts_allowed: exam.attempts_allowed,
          show_answers_after: exam.show_answers_after,
          attempts: exam.attempts,
          best_score: exam.best_score,
          max_score: exam.max_score
        });
      }
    });

    console.log(`✅ Loaded ${moocsStructure.length} MOOCs with lessons and exams`);

    res.json({
      success: true,
      data: {
        enrollment_id: enrollment.recordset[0].enrollment_id,
        moocs: moocsStructure
      }
    });

  } catch (error) {
    console.error('❌ Error fetching course content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course content',
      message: error.message
    });
  }
});

// Mark lesson as completed
router.post('/lesson/:lessonId/complete', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { lessonId } = req.params;
    const userId = req.user.userId;
    const { lastPositionSec } = req.body;

    console.log('✅ Marking lesson as completed:', lessonId, 'for user:', userId);

    // Check if progress record exists
    const existing = await pool.request()
      .input('lessonId', sql.BigInt, lessonId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT user_id, lesson_id FROM progress 
        WHERE lesson_id = @lessonId AND user_id = @userId
      `);

    if (existing.recordset.length > 0) {
      // Update existing
      await pool.request()
        .input('lessonId', sql.BigInt, lessonId)
        .input('userId', sql.BigInt, userId)
        .input('lastPosition', sql.Int, lastPositionSec || 0)
        .query(`
          UPDATE progress 
          SET is_completed = 1, 
              updated_at = GETDATE(),
              last_position_sec = @lastPosition
          WHERE lesson_id = @lessonId AND user_id = @userId
        `);
    } else {
      // Insert new
      await pool.request()
        .input('lessonId', sql.BigInt, lessonId)
        .input('userId', sql.BigInt, userId)
        .input('lastPosition', sql.Int, lastPositionSec || 0)
        .query(`
          INSERT INTO progress (lesson_id, user_id, is_completed, last_position_sec, updated_at)
          VALUES (@lessonId, @userId, 1, @lastPosition, GETDATE())
        `);
    }

    console.log('✅ Lesson marked as completed successfully');

    res.json({
      success: true,
      message: 'Lesson marked as completed'
    });

  } catch (error) {
    console.error('❌ Error marking lesson complete:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark lesson as completed',
      message: error.message
    });
  }
});

// Get course progress summary
router.get('/course/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { courseId } = req.params;
    const userId = req.user.userId;

    const result = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          e.progress_percentage,
          e.last_accessed,
          
          (SELECT COUNT(*) FROM lessons l 
           JOIN moocs m ON l.mooc_id = m.mooc_id 
           WHERE m.course_id = @courseId) as total_lessons,
          
          (SELECT COUNT(DISTINCT lp.lesson_id) 
           FROM lesson_progress lp
           JOIN lessons l ON lp.lesson_id = l.lesson_id
           JOIN moocs m ON l.mooc_id = m.mooc_id
           WHERE m.course_id = @courseId AND lp.user_id = @userId AND lp.completed = 1) as completed_lessons,
          
          (SELECT SUM(lp.time_spent_minutes)
           FROM lesson_progress lp
           JOIN lessons l ON lp.lesson_id = l.lesson_id
           JOIN moocs m ON l.mooc_id = m.mooc_id
           WHERE m.course_id = @courseId AND lp.user_id = @userId) as total_time_spent

        FROM enrollments e
        WHERE e.course_id = @courseId AND e.user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

// Check and award course completion certificate
router.post('/course/:courseId/check-completion', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { courseId } = req.params;
    const userId = req.user.userId;

    console.log(`🎓 Checking completion for courseId: ${courseId}, userId: ${userId}`);

    // 1. Get total lessons and moocs in course
    const courseStats = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .query(`
        SELECT 
          COUNT(DISTINCT l.lesson_id) as total_lessons,
          COUNT(DISTINCT m.mooc_id) as total_moocs
        FROM moocs m
        LEFT JOIN lessons l ON m.mooc_id = l.mooc_id
        WHERE m.course_id = @courseId
      `);

    const { total_lessons, total_moocs } = courseStats.recordset[0];
    console.log(`📊 Course stats: ${total_lessons} lessons, ${total_moocs} moocs`);

    // 2. Get user's completed lessons
    const completedLessons = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT COUNT(DISTINCT p.lesson_id) as completed_count
        FROM progress p
        JOIN lessons l ON p.lesson_id = l.lesson_id
        JOIN moocs m ON l.mooc_id = m.mooc_id
        WHERE m.course_id = @courseId 
          AND p.user_id = @userId 
          AND p.is_completed = 1
      `);

    const completed_lessons = completedLessons.recordset[0].completed_count;
    console.log(`✅ Completed lessons: ${completed_lessons}/${total_lessons}`);

    // 3. Get user's passed exams (each mooc should have passed exam)
    const passedExams = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT COUNT(DISTINCT m.mooc_id) as passed_moocs
        FROM moocs m
        WHERE m.course_id = @courseId
          AND EXISTS (
            SELECT 1 FROM exam_attempts ea
            WHERE ea.mooc_id = m.mooc_id
              AND ea.user_id = @userId
              AND ea.passed = 1
          )
      `);

    const passed_moocs = passedExams.recordset[0].passed_moocs;
    console.log(`📝 Passed exams: ${passed_moocs}/${total_moocs} moocs`);

    // 4. Check if all requirements met
    const all_lessons_completed = completed_lessons >= total_lessons && total_lessons > 0;
    const all_exams_passed = passed_moocs >= total_moocs && total_moocs > 0;
    const is_completed = all_lessons_completed && all_exams_passed;

    console.log(`🎯 Completion status: lessons=${all_lessons_completed}, exams=${all_exams_passed}, overall=${is_completed}`);

    if (is_completed) {
      // 5. Check if already awarded
      const enrollment = await pool.request()
        .input('courseId', sql.BigInt, courseId)
        .input('userId', sql.BigInt, userId)
        .query(`
          SELECT enrollment_id, completed_at
          FROM enrollments
          WHERE course_id = @courseId AND user_id = @userId
        `);

      if (enrollment.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Enrollment not found' });
      }

      const enrollmentData = enrollment.recordset[0];

      if (!enrollmentData.completed_at) {
        // 6. Award certificate - Update enrollment
        await pool.request()
          .input('enrollmentId', sql.BigInt, enrollmentData.enrollment_id)
          .query(`
            UPDATE enrollments
            SET completed_at = GETDATE(),
                progress = 100
            WHERE enrollment_id = @enrollmentId
          `);

        // 7. Get course and user info for certificate
        const certInfo = await pool.request()
          .input('courseId', sql.BigInt, courseId)
          .input('userId', sql.BigInt, userId)
          .query(`
            SELECT 
              u.full_name as student_name,
              u.email as student_email,
              c.title as course_title,
              c.course_id,
              i.instructor_id,
              iu.full_name as instructor_name,
              GETDATE() as completion_date
            FROM users u
            CROSS JOIN courses c
            LEFT JOIN instructors i ON c.owner_instructor_id = i.instructor_id
            LEFT JOIN users iu ON i.user_id = iu.user_id
            WHERE u.user_id = @userId AND c.course_id = @courseId
          `);

        const cert = certInfo.recordset[0];

        console.log('🎉 Certificate awarded!');

        // TODO: Send email notification with certificate
        // await emailService.sendCertificate(cert);

        return res.json({
          success: true,
          completed: true,
          newly_awarded: true,
          message: 'Chúc mừng! Bạn đã hoàn thành khóa học và nhận được chứng chỉ',
          certificate: {
            student_name: cert.student_name,
            course_title: cert.course_title,
            instructor_name: cert.instructor_name,
            completion_date: cert.completion_date,
            course_id: cert.course_id
          }
        });
      } else {
        // Already completed
        const certInfo = await pool.request()
          .input('courseId', sql.BigInt, courseId)
          .input('userId', sql.BigInt, userId)
          .query(`
            SELECT 
              u.full_name as student_name,
              c.title as course_title,
              iu.full_name as instructor_name,
              e.completed_at as completion_date,
              c.course_id
            FROM enrollments e
            JOIN users u ON e.user_id = u.user_id
            JOIN courses c ON e.course_id = c.course_id
            LEFT JOIN instructors i ON c.owner_instructor_id = i.instructor_id
            LEFT JOIN users iu ON i.user_id = iu.user_id
            WHERE e.user_id = @userId AND e.course_id = @courseId
          `);

        const cert = certInfo.recordset[0];

        return res.json({
          success: true,
          completed: true,
          newly_awarded: false,
          message: 'Bạn đã hoàn thành khóa học trước đó',
          certificate: {
            student_name: cert.student_name,
            course_title: cert.course_title,
            instructor_name: cert.instructor_name,
            completion_date: cert.completion_date,
            course_id: cert.course_id
          }
        });
      }
    } else {
      // Not completed yet
      return res.json({
        success: true,
        completed: false,
        message: 'Bạn chưa hoàn thành khóa học',
        requirements: {
          total_lessons,
          completed_lessons,
          lessons_completed: all_lessons_completed,
          total_moocs,
          passed_moocs,
          exams_passed: all_exams_passed
        }
      });
    }

  } catch (error) {
    console.error('❌ Error checking completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check completion',
      message: error.message
    });
  }
});

export default router;
