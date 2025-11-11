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
      // Update existing submission
      submissionId = existing.recordset[0].essay_submission_id;
      
      await pool.request()
        .input('submissionId', sql.BigInt, submissionId)
        .input('contentText', sql.NVarChar(sql.MAX), content_text || null)
        .input('fileUrl', sql.NVarChar(500), fileUrl)
        .query(`
          UPDATE essay_submissions 
          SET content_text = @contentText,
              file_url = COALESCE(@fileUrl, file_url),
              status = 'pending',
              submitted_at = GETDATE()
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
          VALUES (@taskId, @userId, @contentText, @fileUrl, 'pending', GETDATE())
        `);

      submissionId = result.recordset[0].essay_submission_id;
      console.log('✅ Created new submission:', submissionId);
    }

    // Mark lesson as completed in progress table
    const progressCheck = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('lessonId', sql.BigInt, lesson_id)
      .query(`
        SELECT progress_id 
        FROM progress 
        WHERE user_id = @userId AND lesson_id = @lessonId
      `);

    if (progressCheck.recordset.length === 0) {
      await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('lessonId', sql.BigInt, lesson_id)
        .query(`
          INSERT INTO progress (user_id, lesson_id, is_completed, updated_at)
          VALUES (@userId, @lessonId, 1, GETDATE())
        `);
    } else {
      await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('lessonId', sql.BigInt, lesson_id)
        .query(`
          UPDATE progress 
          SET is_completed = 1, updated_at = GETDATE()
          WHERE user_id = @userId AND lesson_id = @lessonId
        `);
    }

    res.json({
      success: true,
      message: 'Nộp bài thành công',
      data: {
        submission_id: submissionId,
        status: 'pending'
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

    console.log('✅ Graded submission:', submission_id);

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

export default router;
