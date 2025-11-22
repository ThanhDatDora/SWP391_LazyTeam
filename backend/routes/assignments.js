import express from 'express';
import sql from 'mssql';
import { authenticateToken } from '../middleware/auth.js';
import { getPool } from '../config/database.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|zip|rar|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, ZIP, RAR, JPG, PNG files are allowed!'));
    }
  }
});

// Submit assignment (essay submission)
router.post('/submit', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const pool = await getPool();
    const { lesson_id, content_text } = req.body;
    const userId = req.user.userId;
    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    console.log('📝 Submitting assignment:', {
      lesson_id,
      userId,
      has_text: !!content_text,
      has_file: !!fileUrl
    });

    // Check if already submitted
    const existing = await pool.request()
      .input('taskId', sql.BigInt, lesson_id)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT essay_submission_id, status 
        FROM essay_submissions 
        WHERE task_id = @taskId AND user_id = @userId
      `);

    let submissionId;

    if (existing.recordset.length > 0) {
      // Update existing submission and RESET grading data
      submissionId = existing.recordset[0].essay_submission_id;
      
      await pool.request()
        .input('submissionId', sql.BigInt, submissionId)
        .input('contentText', sql.NVarChar(sql.MAX), content_text || null)
        .input('fileUrl', sql.NVarChar(500), fileUrl)
        .query(`
          UPDATE essay_submissions 
          SET content_text = @contentText,
              file_url = COALESCE(@fileUrl, file_url),
              status = 'submitted',
              submitted_at = GETDATE(),
              score = NULL,
              feedback = NULL,
              graded_at = NULL,
              graded_by = NULL
          WHERE essay_submission_id = @submissionId
        `);

      console.log('✅ Updated existing submission:', submissionId);
    } else {
      // Create new submission
      const result = await pool.request()
        .input('taskId', sql.BigInt, lesson_id)
        .input('userId', sql.BigInt, userId)
        .input('contentText', sql.NVarChar(sql.MAX), content_text || null)
        .input('fileUrl', sql.NVarChar(500), fileUrl)
        .query(`
          INSERT INTO essay_submissions (task_id, user_id, content_text, file_url, status, submitted_at)
          OUTPUT INSERTED.essay_submission_id
          VALUES (@taskId, @userId, @contentText, @fileUrl, 'submitted', GETDATE())
        `);

      submissionId = result.recordset[0].essay_submission_id;
      console.log('✅ Created new submission:', submissionId);
    }

    // Mark lesson as in-progress (not completed until graded)
    const progressCheck = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('lessonId', sql.BigInt, lesson_id)
      .query(`
        SELECT user_id, lesson_id 
        FROM progress 
        WHERE user_id = @userId AND lesson_id = @lessonId
      `);

    if (progressCheck.recordset.length === 0) {
      await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('lessonId', sql.BigInt, lesson_id)
        .query(`
          INSERT INTO progress (user_id, lesson_id, is_completed, updated_at)
          VALUES (@userId, @lessonId, 0, GETDATE())
        `);
    } else {
      // Reset to incomplete when resubmitting (wait for new grading)
      await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('lessonId', sql.BigInt, lesson_id)
        .query(`
          UPDATE progress 
          SET is_completed = 0, updated_at = GETDATE()
          WHERE user_id = @userId AND lesson_id = @lessonId
        `);
    }
    // Don't update to completed - wait for instructor grading

    res.json({
      success: true,
      message: 'Nộp bài thành công',
      data: {
        submission_id: submissionId,
        status: 'submitted'
      }
    });

  } catch (error) {
    console.error('❌ Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit assignment',
      message: error.message
    });
  }
});

// Get assignment submission status
router.get('/submission/:lessonId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { lessonId } = req.params;
    const userId = req.user.userId;

    const result = await pool.request()
      .input('taskId', sql.BigInt, lessonId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          es.essay_submission_id,
          es.content_text,
          es.file_url,
          es.score,
          es.feedback,
          es.status,
          es.submitted_at,
          es.graded_at,
          u.full_name as grader_name
        FROM essay_submissions es
        LEFT JOIN users u ON es.graded_by = u.user_id
        WHERE es.task_id = @taskId AND es.user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Error fetching submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission'
    });
  }
});

// Grade assignment (for instructors)
router.post('/grade', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { submission_id, score, feedback } = req.body;
    const graderId = req.user.userId;

    // TODO: Check if user is instructor/admin

    // Get submission to find user_id and task_id
    const submissionResult = await pool.request()
      .input('submissionId', sql.BigInt, submission_id)
      .query(`
        SELECT user_id, task_id 
        FROM essay_submissions 
        WHERE essay_submission_id = @submissionId
      `);

    if (submissionResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const { user_id, task_id } = submissionResult.recordset[0];

    // Update submission with grade
    await pool.request()
      .input('submissionId', sql.BigInt, submission_id)
      .input('score', sql.Decimal(5, 2), score)
      .input('feedback', sql.NVarChar(sql.MAX), feedback)
      .input('graderId', sql.BigInt, graderId)
      .query(`
        UPDATE essay_submissions 
        SET score = @score,
            feedback = @feedback,
            graded_by = @graderId,
            graded_at = GETDATE(),
            status = 'graded'
        WHERE essay_submission_id = @submissionId
      `);

    // Get pass_mark from mooc to determine if assignment is completed
    const moocResult = await pool.request()
      .input('lessonId', sql.BigInt, task_id)
      .query(`
        SELECT m.pass_mark
        FROM lessons l
        JOIN moocs m ON l.mooc_id = m.mooc_id
        WHERE l.lesson_id = @lessonId
      `);

    const passMark = moocResult.recordset[0]?.pass_mark || 50; // Default 50 if not found
    const isPassed = score >= passMark;

    // Only mark lesson as completed if score >= pass_mark
    await pool.request()
      .input('userId', sql.BigInt, user_id)
      .input('lessonId', sql.BigInt, task_id)
      .input('isCompleted', sql.Bit, isPassed ? 1 : 0)
      .query(`
        UPDATE progress 
        SET is_completed = @isCompleted, updated_at = GETDATE()
        WHERE user_id = @userId AND lesson_id = @lessonId
      `);

    console.log(`✅ Graded submission: ${submission_id}, score: ${score}, pass_mark: ${passMark}, completed: ${isPassed}`);

    res.json({
      success: true,
      message: 'Chấm điểm thành công'
    });

  } catch (error) {
    console.error('❌ Error grading assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grade assignment'
    });
  }
});

// Get all submissions for a lesson (for instructors)
router.get('/lesson/:lessonId/submissions', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { lessonId } = req.params;

    // TODO: Check if user is instructor

    const result = await pool.request()
      .input('taskId', sql.BigInt, lessonId)
      .query(`
        SELECT 
          es.essay_submission_id,
          es.content_text,
          es.file_url,
          es.score,
          es.feedback,
          es.status,
          es.submitted_at,
          es.graded_at,
          u.user_id,
          u.full_name as student_name,
          u.email as student_email
        FROM essay_submissions es
        JOIN users u ON es.user_id = u.user_id
        WHERE es.task_id = @taskId
        ORDER BY es.submitted_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('❌ Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions'
    });
  }
});

// Get lesson info (for grading page)
router.get('/lesson-info/:lessonId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { lessonId } = req.params;

    const result = await pool.request()
      .input('lessonId', sql.BigInt, lessonId)
      .query(`
        SELECT 
          l.lesson_id,
          l.title,
          l.content_type,
          l.mooc_id,
          m.title as mooc_title,
          m.course_id
        FROM lessons l
        JOIN moocs m ON l.mooc_id = m.mooc_id
        WHERE l.lesson_id = @lessonId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lesson'
    });
  }
});

// Get all submissions for instructor's courses
router.get('/instructor/submissions', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const instructorId = req.user.userId;

    const result = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        SELECT 
          es.essay_submission_id,
          es.content_text,
          es.file_url,
          es.score,
          es.feedback,
          es.status,
          es.submitted_at,
          es.graded_at,
          es.task_id,
          l.lesson_id,
          l.title as lesson_title,
          m.mooc_id,
          m.title as mooc_title,
          c.course_id,
          c.title as course_title,
          u.user_id,
          u.full_name as student_name,
          u.email as student_email
        FROM essay_submissions es
        JOIN users u ON es.user_id = u.user_id
        JOIN lessons l ON es.task_id = l.lesson_id
        JOIN moocs m ON l.mooc_id = m.mooc_id
        JOIN courses c ON m.course_id = c.course_id
        WHERE c.owner_instructor_id = @instructorId
        ORDER BY es.submitted_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('❌ Error fetching instructor submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions',
      message: error.message
    });
  }
});

// Get single submission detail (for instructor grading page)
router.get('/submissions/:submissionId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { submissionId } = req.params;
    const instructorId = req.user.userId;

    const result = await pool.request()
      .input('submissionId', sql.BigInt, submissionId)
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        SELECT 
          es.essay_submission_id,
          es.content_text as submission_text,
          es.file_url,
          es.score,
          es.feedback,
          es.status,
          es.submitted_at,
          es.graded_at,
          es.task_id,
          l.lesson_id,
          l.title as lesson_title,
          l.content_url as lesson_content,
          m.mooc_id,
          m.title as mooc_title,
          c.course_id,
          c.title as course_title,
          u.user_id,
          u.full_name as student_name,
          u.email as student_email,
          grader.full_name as grader_name
        FROM essay_submissions es
        JOIN users u ON es.user_id = u.user_id
        JOIN lessons l ON es.task_id = l.lesson_id
        JOIN moocs m ON l.mooc_id = m.mooc_id
        JOIN courses c ON m.course_id = c.course_id
        LEFT JOIN users grader ON es.graded_by = grader.user_id
        WHERE es.essay_submission_id = @submissionId
          AND c.owner_instructor_id = @instructorId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found or you do not have permission'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Error fetching submission detail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission detail',
      message: error.message
    });
  }
});

// Grade/update submission (for instructor)
router.post('/submissions/:submissionId/grade', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { submissionId } = req.params;
    const { score, feedback, status } = req.body;
    const graderId = req.user.userId;

    console.log('📝 Grading submission:', { submissionId, score, feedback, status });

    // Verify submission exists and instructor owns the course
    const submissionCheck = await pool.request()
      .input('submissionId', sql.BigInt, submissionId)
      .input('instructorId', sql.BigInt, graderId)
      .query(`
        SELECT es.user_id, es.task_id, c.owner_instructor_id
        FROM essay_submissions es
        JOIN lessons l ON es.task_id = l.lesson_id
        JOIN moocs m ON l.mooc_id = m.mooc_id
        JOIN courses c ON m.course_id = c.course_id
        WHERE es.essay_submission_id = @submissionId
      `);

    if (submissionCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const { user_id, task_id, owner_instructor_id } = submissionCheck.recordset[0];

    if (owner_instructor_id !== graderId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to grade this submission'
      });
    }

    // Update submission
    await pool.request()
      .input('submissionId', sql.BigInt, submissionId)
      .input('score', score !== null && score !== undefined ? sql.Decimal(5, 2) : null, score)
      .input('feedback', sql.NVarChar(sql.MAX), feedback || null)
      .input('graderId', sql.BigInt, graderId)
      .input('status', sql.NVarChar(50), status || 'graded')
      .query(`
        UPDATE essay_submissions 
        SET score = ${score !== null && score !== undefined ? '@score' : 'score'},
            feedback = COALESCE(@feedback, feedback),
            graded_by = @graderId,
            graded_at = ${status === 'graded' || score !== null ? 'GETDATE()' : 'graded_at'},
            status = @status
        WHERE essay_submission_id = @submissionId
      `);

    // Only mark lesson as completed if score >= 50 (passing grade)
    // Students with score < 50 can resubmit to improve their grade
    if (status === 'graded' && score !== null && score >= 50) {
      await pool.request()
        .input('userId', sql.BigInt, user_id)
        .input('lessonId', sql.BigInt, task_id)
        .query(`
          UPDATE progress 
          SET is_completed = 1, updated_at = GETDATE()
          WHERE user_id = @userId AND lesson_id = @lessonId
        `);
    }

    // Create notification for learner about grading result
    const isPassing = score !== null && score >= 50;
    const notificationTitle = isPassing 
      ? '🎉 Bài tập đã được chấm - ĐẠT' 
      : '📝 Bài tập đã được chấm';
    const notificationMessage = isPassing
      ? `Bạn đã hoàn thành bài tập với điểm ${score}/100. Xuất sắc!`
      : `Bài tập của bạn đã được chấm: ${score}/100. ${score < 50 ? 'Bạn có thể nộp lại để cải thiện điểm.' : ''}`;

    await pool.request()
      .input('userId', sql.BigInt, user_id)
      .input('title', sql.NVarChar(255), notificationTitle)
      .input('message', sql.NVarChar(sql.MAX), notificationMessage)
      .input('type', sql.NVarChar(50), isPassing ? 'success' : 'info')
      .input('link', sql.NVarChar(500), `/learning/${task_id}`)
      .input('icon', sql.NVarChar(50), isPassing ? 'CheckCircle' : 'AlertCircle')
      .query(`
        INSERT INTO notifications (user_id, title, message, type, link, icon, is_read, created_at)
        VALUES (@userId, @title, @message, @type, @link, @icon, 0, GETDATE())
      `);

    console.log('✅ Submission graded successfully');

    res.json({
      success: true,
      message: status === 'graded' ? 'Chấm điểm thành công' : 'Đã lưu'
    });

  } catch (error) {
    console.error('❌ Error grading submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grade submission',
      message: error.message
    });
  }
});

export default router;
