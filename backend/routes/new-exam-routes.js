import express from 'express';
import { getPool } from '../config/database.js';
import sql from 'mssql';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes (DISABLED FOR TESTING)
// router.use(authenticateToken);

// Mock user middleware for testing
router.use((req, res, next) => {
  if (!req.user) {
    req.user = { userId: 1 }; // Mock user ID for testing
  }
  next();
});

/**
 * Get exam info by MOOC ID
 * GET /api/learning/exams/mooc/:moocId
 */
router.get('/mooc/:moocId', async (req, res) => {
  try {
    const { moocId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();

    // Get MOOC info
    const moocResult = await pool.request()
      .input('moocId', sql.BigInt, moocId)
      .query('SELECT m.mooc_id, m.title as mooc_name, m.course_id FROM moocs m WHERE m.mooc_id = @moocId');

    if (moocResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'MOOC not found' });
    }

    const mooc = moocResult.recordset[0];

    // Count questions for this MOOC
    const questionCount = await pool.request()
      .input('moocId', sql.BigInt, moocId)
      .query('SELECT COUNT(*) as total FROM questions WHERE mooc_id = @moocId');

    const totalQuestions = questionCount.recordset[0].total;

    // Get previous attempts
    const attemptsResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('moocId', sql.BigInt, moocId)
      .query(`
        SELECT attempt_id, score, passed, submitted_at, time_taken
        FROM exam_attempts
        WHERE user_id = @userId AND mooc_id = @moocId
        ORDER BY submitted_at DESC
      `);

    const previousAttempts = attemptsResult.recordset.length;
    const bestScore = previousAttempts > 0 
      ? Math.max(...attemptsResult.recordset.map(a => a.score || 0))
      : null;
    const lastAttemptDate = previousAttempts > 0
      ? attemptsResult.recordset[0].submitted_at
      : null;

    // Check if can take exam (all lessons completed)
    const lessonProgress = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('moocId', sql.BigInt, moocId)
      .query(`
        SELECT 
          COUNT(*) as total_lessons,
          SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
        FROM lessons l
        LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = @userId
        WHERE l.mooc_id = @moocId
      `);

    const progress = lessonProgress.recordset[0];
    const canTakeExam = progress.total_lessons > 0 && 
                        progress.completed_lessons === progress.total_lessons;

    res.json({
      success: true,
      data: {
        exam_id: mooc.mooc_id,
        mooc_id: mooc.mooc_id,
        mooc_name: mooc.mooc_name,
        course_id: mooc.course_id,
        total_questions: Math.min(totalQuestions, 10),
        duration_minutes: 20,
        passing_score: 70,
        can_take_exam: canTakeExam,
        lessons_completed: progress.completed_lessons || 0,
        total_lessons: progress.total_lessons || 0,
        previous_attempts: previousAttempts,
        best_score: bestScore,
        last_attempt_date: lastAttemptDate
      }
    });

  } catch (error) {
    console.error('Error getting exam by MOOC:', error);
    res.status(500).json({ success: false, error: 'Failed to get exam information' });
  }
});

/**
 * Start exam - Get random questions
 * POST /api/learning/exams/:examId/start
 */
router.post('/:examId/start', async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.userId;
    const moocId = examId;
    const pool = await getPool();

    // Check lesson completion eligibility
    const lessonProgress = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('moocId', sql.BigInt, moocId)
      .query(`
        SELECT 
          COUNT(*) as total_lessons,
          SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
        FROM lessons l
        LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = @userId
        WHERE l.mooc_id = @moocId
      `);

    const progress = lessonProgress.recordset[0];
    if (progress.total_lessons === 0 || progress.completed_lessons < progress.total_lessons) {
      return res.status(400).json({
        success: false,
        error: 'Must complete all lessons before taking exam'
      });
    }

    // Check for recent attempts (5 minute cooldown)
    const recentAttempt = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('moocId', sql.BigInt, moocId)
      .query(`
        SELECT TOP 1 started_at
        FROM exam_attempts
        WHERE user_id = @userId AND mooc_id = @moocId
        ORDER BY started_at DESC
      `);

    if (recentAttempt.recordset.length > 0) {
      const lastAttempt = new Date(recentAttempt.recordset[0].started_at);
      const timeSince = (Date.now() - lastAttempt.getTime()) / 1000;
      if (timeSince < 300) {
        return res.status(400).json({
          success: false,
          error: `Please wait ${Math.ceil(300 - timeSince)} seconds before retrying`
        });
      }
    }

    // Get random 10 questions for this MOOC
    const questionsResult = await pool.request()
      .input('moocId', sql.BigInt, moocId)
      .query(`
        SELECT TOP 10 q.question_id, q.stem, q.qtype, q.difficulty
        FROM questions q
        WHERE q.mooc_id = @moocId
        ORDER BY NEWID()
      `);

    if (questionsResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No questions available for this exam'
      });
    }

    // Get options for each question
    const questions = await Promise.all(
      questionsResult.recordset.map(async (q) => {
        const optionsResult = await pool.request()
          .input('questionId', sql.BigInt, q.question_id)
          .query(`
            SELECT option_id, label, content
            FROM question_options
            WHERE question_id = @questionId
            ORDER BY NEWID()
          `);

        return {
          question_id: q.question_id,
          stem: q.stem,
          qtype: q.qtype,
          difficulty: q.difficulty,
          options: optionsResult.recordset.map(opt => ({
            option_id: opt.option_id,
            label: opt.label,
            content: opt.content
          }))
        };
      })
    );

    // Create exam attempt record
    const attemptResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('moocId', sql.BigInt, moocId)
      .input('totalQuestions', sql.Int, questions.length)
      .query(`
        INSERT INTO exam_attempts (user_id, mooc_id, total_questions)
        OUTPUT INSERTED.attempt_id, INSERTED.started_at
        VALUES (@userId, @moocId, @totalQuestions)
      `);

    const attempt = attemptResult.recordset[0];
    const expiresAt = new Date(attempt.started_at);
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    res.json({
      success: true,
      data: {
        attempt_id: attempt.attempt_id,
        started_at: attempt.started_at,
        expires_at: expiresAt,
        duration_minutes: 20,
        total_questions: questions.length,
        questions: questions
      }
    });

  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ success: false, error: 'Failed to start exam' });
  }
});

/**
 * Submit exam and calculate score
 * POST /api/learning/exams/:examId/submit
 */
router.post('/:examId/submit', async (req, res) => {
  try {
    const { attempt_id, answers } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();

    if (!attempt_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: attempt_id, answers'
      });
    }

    // Verify attempt belongs to user
    const attemptResult = await pool.request()
      .input('attemptId', sql.BigInt, attempt_id)
      .query(`
        SELECT attempt_id, user_id, mooc_id, started_at, total_questions, submitted_at
        FROM exam_attempts
        WHERE attempt_id = @attemptId
      `);

    if (attemptResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Exam attempt not found' });
    }

    const attempt = attemptResult.recordset[0];

    if (Number(attempt.user_id) !== Number(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (attempt.submitted_at) {
      return res.status(400).json({ success: false, error: 'Exam already submitted' });
    }

    // Check time limit
    const timeTaken = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
    if (timeTaken > 1200) {
      return res.status(400).json({ success: false, error: 'Time limit exceeded' });
    }

    // Calculate score
    let correctAnswers = 0;

    for (const answer of answers) {
      const { question_id, selected_option } = answer;

      const correctResult = await pool.request()
        .input('questionId', sql.BigInt, question_id)
        .query(`
          SELECT option_id, label
          FROM question_options
          WHERE question_id = @questionId AND is_correct = 1
        `);

      if (correctResult.recordset.length > 0) {
        const correctLabel = correctResult.recordset[0].label;
        if (selected_option === correctLabel) {
          correctAnswers++;
        }
      }
    }

    const totalQuestions = answers.length;
    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= 70;

    // Update attempt record
    await pool.request()
      .input('attemptId', sql.BigInt, attempt_id)
      .input('timeTaken', sql.Int, timeTaken)
      .input('correctAnswers', sql.Int, correctAnswers)
      .input('score', sql.Decimal(5, 2), score)
      .input('passed', sql.Bit, passed ? 1 : 0)
      .input('answers', sql.NVarChar, JSON.stringify(answers))
      .query(`
        UPDATE exam_attempts
        SET 
          submitted_at = GETDATE(),
          time_taken = @timeTaken,
          correct_answers = @correctAnswers,
          score = @score,
          passed = @passed,
          answers = @answers
        WHERE attempt_id = @attemptId
      `);

    // If passed, check if should unlock next MOOC
    let nextMoocUnlocked = false;
    if (passed) {
      const moocInfo = await pool.request()
        .input('moocId', sql.BigInt, attempt.mooc_id)
        .query('SELECT course_id, order_no FROM moocs WHERE mooc_id = @moocId');

      if (moocInfo.recordset.length > 0) {
        const currentMooc = moocInfo.recordset[0];
        
        const nextMoocResult = await pool.request()
          .input('courseId', sql.BigInt, currentMooc.course_id)
          .input('orderNo', sql.Int, currentMooc.order_no)
          .query(`
            SELECT TOP 1 mooc_id
            FROM moocs
            WHERE course_id = @courseId AND order_no > @orderNo
            ORDER BY order_no ASC
          `);

        if (nextMoocResult.recordset.length > 0) {
          nextMoocUnlocked = true;
          
          await pool.request()
            .input('userId', sql.BigInt, userId)
            .input('courseId', sql.BigInt, currentMooc.course_id)
            .input('nextMoocId', sql.BigInt, nextMoocResult.recordset[0].mooc_id)
            .query(`
              UPDATE enrollments
              SET 
                current_mooc_id = @nextMoocId,
                moocs_completed = moocs_completed + 1,
                progress = (moocs_completed + 1) * 100.0 / (
                  SELECT COUNT(*) FROM moocs WHERE course_id = @courseId
                )
              WHERE user_id = @userId AND course_id = @courseId
            `);
        } else {
          await pool.request()
            .input('userId', sql.BigInt, userId)
            .input('courseId', sql.BigInt, currentMooc.course_id)
            .query(`
              UPDATE enrollments
              SET 
                moocs_completed = moocs_completed + 1,
                progress = 100,
                overall_score = (
                  SELECT AVG(score) 
                  FROM exam_attempts ea
                  JOIN moocs m ON ea.mooc_id = m.mooc_id
                  WHERE ea.user_id = @userId 
                    AND m.course_id = @courseId
                    AND ea.passed = 1
                )
              WHERE user_id = @userId AND course_id = @courseId
            `);
        }
      }
    }

    res.json({
      success: true,
      data: {
        attempt_id: attempt_id,
        score: Math.round(score * 100) / 100,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        passed: passed,
        time_taken: timeTaken,
        next_mooc_unlocked: nextMoocUnlocked
      }
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ success: false, error: 'Failed to submit exam' });
  }
});

/**
 * Get exam result with detailed answers
 * GET /api/learning/exams/attempts/:attemptId/result
 */
router.get('/attempts/:attemptId/result', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();

    // Get attempt details
    const attemptResult = await pool.request()
      .input('attemptId', sql.BigInt, attemptId)
      .query(`
        SELECT 
          ea.attempt_id, ea.user_id, ea.mooc_id,
          ea.started_at, ea.submitted_at, ea.time_taken,
          ea.total_questions, ea.correct_answers, ea.score, ea.passed,
          ea.answers, m.name as mooc_name
        FROM exam_attempts ea
        JOIN moocs m ON ea.mooc_id = m.mooc_id
        WHERE ea.attempt_id = @attemptId
      `);

    if (attemptResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Exam attempt not found' });
    }

    const attempt = attemptResult.recordset[0];

    if (Number(attempt.user_id) !== Number(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (!attempt.submitted_at) {
      return res.status(400).json({ success: false, error: 'Exam not yet submitted' });
    }

    // Parse answers
    const answers = JSON.parse(attempt.answers || '[]');

    // Get detailed results
    const detailedResults = await Promise.all(
      answers.map(async (answer) => {
        const { question_id, selected_option } = answer;

        const questionResult = await pool.request()
          .input('questionId', sql.BigInt, question_id)
          .query('SELECT question_id, stem, difficulty FROM questions WHERE question_id = @questionId');

        const optionsResult = await pool.request()
          .input('questionId', sql.BigInt, question_id)
          .query(`
            SELECT option_id, label, content, is_correct
            FROM question_options
            WHERE question_id = @questionId
            ORDER BY label
          `);

        const correctOption = optionsResult.recordset.find(opt => opt.is_correct);
        const isCorrect = selected_option === correctOption?.label;

        return {
          question_id: question_id,
          stem: questionResult.recordset[0]?.stem || '',
          difficulty: questionResult.recordset[0]?.difficulty || '',
          selected_option: selected_option,
          correct_option: correctOption?.label || '',
          is_correct: isCorrect,
          options: optionsResult.recordset.map(opt => ({
            label: opt.label,
            content: opt.content,
            is_correct: opt.is_correct
          }))
        };
      })
    );

    res.json({
      success: true,
      data: {
        attempt_id: attempt.attempt_id,
        mooc_id: attempt.mooc_id,
        mooc_name: attempt.mooc_name,
        score: attempt.score,
        correct_answers: attempt.correct_answers,
        total_questions: attempt.total_questions,
        passed: attempt.passed,
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        time_taken: attempt.time_taken,
        detailed_results: detailedResults
      }
    });

  } catch (error) {
    console.error('Error getting exam result:', error);
    res.status(500).json({ success: false, error: 'Failed to get exam result' });
  }
});

/**
 * Get course progress with all MOOCs and exams
 * GET /api/learning/course/:courseId/progress
 */
router.get('/course/:courseId/progress', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();

    // Get enrollment info
    const enrollmentResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('courseId', sql.BigInt, courseId)
      .query(`
        SELECT enrollment_id, current_mooc_id, moocs_completed, progress, overall_score
        FROM enrollments
        WHERE user_id = @userId AND course_id = @courseId
      `);

    if (enrollmentResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Not enrolled in this course' });
    }

    const enrollment = enrollmentResult.recordset[0];

    // Get all MOOCs for this course
    const moocsResult = await pool.request()
      .input('courseId', sql.BigInt, courseId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          m.mooc_id, m.name, m.order_index,
          (SELECT COUNT(*) FROM lessons WHERE mooc_id = m.mooc_id) as total_lessons,
          (SELECT COUNT(*) FROM lessons l 
           JOIN progress p ON l.lesson_id = p.lesson_id 
           WHERE l.mooc_id = m.mooc_id AND lp.user_id = @userId AND lp.completed = 1
          ) as lessons_completed
        FROM moocs m
        WHERE m.course_id = @courseId
        ORDER BY m.order_index ASC
      `);

    // Get exam status for each MOOC
    const allMoocs = await Promise.all(
      moocsResult.recordset.map(async (mooc) => {
        const examResult = await pool.request()
          .input('userId', sql.BigInt, userId)
          .input('moocId', sql.BigInt, mooc.mooc_id)
          .query(`
            SELECT TOP 1 attempt_id, score, passed, submitted_at
            FROM exam_attempts
            WHERE user_id = @userId AND mooc_id = @moocId AND passed = 1
            ORDER BY submitted_at DESC
          `);

        const examPassed = examResult.recordset.length > 0;
        const examScore = examPassed ? examResult.recordset[0].score : null;

        let status = 'locked';
        if (mooc.order_index === 1 || enrollment.moocs_completed >= mooc.order_index - 1) {
          if (examPassed) {
            status = 'completed';
          } else if (mooc.lessons_completed === mooc.total_lessons) {
            status = 'exam_available';
          } else {
            status = 'in_progress';
          }
        }

        return {
          mooc_id: mooc.mooc_id,
          name: mooc.name,
          order_index: mooc.order_index,
          status: status,
          lessons_completed: mooc.lessons_completed,
          total_lessons: mooc.total_lessons,
          exam_passed: examPassed,
          exam_score: examScore
        };
      })
    );

    const currentMooc = allMoocs.find(m => 
      m.status === 'in_progress' || m.status === 'exam_available'
    ) || allMoocs[0];

    const certificateAvailable = allMoocs.every(m => m.exam_passed);

    res.json({
      success: true,
      data: {
        course_id: parseInt(courseId),
        enrollment_id: enrollment.enrollment_id,
        current_mooc: currentMooc ? {
          mooc_id: currentMooc.mooc_id,
          name: currentMooc.name,
          lessons_completed: currentMooc.lessons_completed,
          total_lessons: currentMooc.total_lessons,
          exam_status: currentMooc.exam_passed ? 'passed' : 
                       currentMooc.status === 'exam_available' ? 'available' : 'not_available'
        } : null,
        all_moocs: allMoocs,
        overall_progress: Math.round(enrollment.progress || 0),
        moocs_completed: enrollment.moocs_completed || 0,
        overall_score: enrollment.overall_score,
        certificate_available: certificateAvailable
      }
    });

  } catch (error) {
    console.error('Error getting course progress:', error);
    res.status(500).json({ success: false, error: 'Failed to get course progress' });
  }
});

export default router;
