import express from 'express';
import sql from 'mssql';
import { getPool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get quiz by ID with questions and options
router.get('/:quizId', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();

    // Get quiz details
    const quizResult = await pool.request()
      .input('quizId', sql.BigInt, quizId)
      .query(`
        SELECT q.quiz_id, q.mooc_id, q.title, q.description, 
               q.time_limit, q.passing_score, q.max_attempts,
               m.course_id
        FROM quizzes q
        JOIN moocs m ON q.mooc_id = m.mooc_id
        WHERE q.quiz_id = @quizId
      `);

    if (quizResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = quizResult.recordset[0];

    // Check if user is enrolled in the course
    const enrollmentCheck = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('courseId', sql.BigInt, quiz.course_id)
      .query(`
        SELECT enrollment_id 
        FROM enrollments 
        WHERE user_id = @userId AND course_id = @courseId AND status = 'active'
      `);

    if (enrollmentCheck.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access the quiz'
      });
    }

    // Get quiz questions
    const questionsResult = await pool.request()
      .input('quizId', sql.BigInt, quizId)
      .query(`
        SELECT question_id, question_text, question_type, 
               points, order_index
        FROM questions
        WHERE quiz_id = @quizId
        ORDER BY order_index
      `);

    const questions = questionsResult.recordset;

    // Get answer options for each question
    for (let question of questions) {
      const optionsResult = await pool.request()
        .input('questionId', sql.BigInt, question.question_id)
        .query(`
          SELECT option_id, option_text
          FROM answer_options
          WHERE question_id = @questionId
          ORDER BY option_id
        `);

      question.options = optionsResult.recordset;
    }

    // Get user's previous attempts
    const attemptsResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('quizId', sql.BigInt, quizId)
      .query(`
        SELECT COUNT(*) as attempt_count
        FROM quiz_attempts
        WHERE user_id = @userId AND quiz_id = @quizId
      `);

    const attemptCount = attemptsResult.recordset[0].attempt_count;

    // Check if user has attempts remaining
    if (quiz.max_attempts && attemptCount >= quiz.max_attempts) {
      return res.status(403).json({
        success: false,
        message: `Maximum attempts (${quiz.max_attempts}) reached for this quiz`
      });
    }

    res.json({
      success: true,
      data: {
        quiz: {
          ...quiz,
          attempts_used: attemptCount,
          attempts_remaining: quiz.max_attempts ? quiz.max_attempts - attemptCount : null
        },
        questions
      }
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
});

// Submit quiz answers
router.post('/:quizId/submit', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // { questionId: answerId or text }
    const userId = req.user.userId;
    
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    // Get quiz details
    const quizResult = await transaction.request()
      .input('quizId', sql.BigInt, quizId)
      .query(`
        SELECT q.quiz_id, q.passing_score, q.max_attempts,
               m.course_id
        FROM quizzes q
        JOIN moocs m ON q.mooc_id = m.mooc_id
        WHERE q.quiz_id = @quizId
      `);

    if (quizResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = quizResult.recordset[0];

    // Check enrollment
    const enrollmentCheck = await transaction.request()
      .input('userId', sql.BigInt, userId)
      .input('courseId', sql.BigInt, quiz.course_id)
      .query(`
        SELECT enrollment_id 
        FROM enrollments 
        WHERE user_id = @userId AND course_id = @courseId AND status = 'active'
      `);

    if (enrollmentCheck.recordset.length === 0) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course'
      });
    }

    // Get all questions with correct answers
    const questionsResult = await transaction.request()
      .input('quizId', sql.BigInt, quizId)
      .query(`
        SELECT q.question_id, q.question_text, q.question_type, q.points,
               ao.option_id, ao.option_text, ao.is_correct, ao.explanation
        FROM questions q
        LEFT JOIN answer_options ao ON q.question_id = ao.question_id
        WHERE q.quiz_id = @quizId
        ORDER BY q.question_id, ao.option_id
      `);

    // Group questions and options
    const questionsMap = {};
    questionsResult.recordset.forEach(row => {
      if (!questionsMap[row.question_id]) {
        questionsMap[row.question_id] = {
          question_id: row.question_id,
          question_text: row.question_text,
          question_type: row.question_type,
          points: row.points,
          options: []
        };
      }
      if (row.option_id) {
        questionsMap[row.question_id].options.push({
          option_id: row.option_id,
          option_text: row.option_text,
          is_correct: row.is_correct,
          explanation: row.explanation
        });
      }
    });

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const detailedResults = [];

    for (const questionId in questionsMap) {
      const question = questionsMap[questionId];
      totalPoints += question.points;

      const userAnswer = answers[questionId];
      let isCorrect = false;
      let correctAnswer = null;
      let explanation = null;

      if (!userAnswer) {
        unansweredCount++;
      } else {
        if (question.question_type === 'multiple_choice') {
          const correctOption = question.options.find(opt => opt.is_correct);
          correctAnswer = correctOption?.option_text;
          explanation = correctOption?.explanation;

          if (correctOption && userAnswer === correctOption.option_id) {
            isCorrect = true;
            earnedPoints += question.points;
            correctCount++;
          } else {
            incorrectCount++;
            const userOption = question.options.find(opt => opt.option_id === userAnswer);
            explanation = userOption?.explanation || correctOption?.explanation;
          }
        } else if (question.question_type === 'essay') {
          // Essay questions need manual grading - give partial credit for now
          earnedPoints += question.points * 0.5; // 50% auto-credit, needs manual review
          isCorrect = null; // Pending review
        }
      }

      detailedResults.push({
        question_id: questionId,
        question_text: question.question_text,
        question_type: question.question_type,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0,
        explanation: explanation
      });
    }

    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercentage >= quiz.passing_score;

    // Create quiz attempt record
    const attemptResult = await transaction.request()
      .input('userId', sql.BigInt, userId)
      .input('quizId', sql.BigInt, quizId)
      .input('score', sql.Int, scorePercentage)
      .input('passed', sql.Bit, passed)
      .query(`
        INSERT INTO quiz_attempts (user_id, quiz_id, score, passed, submitted_at)
        OUTPUT INSERTED.attempt_id
        VALUES (@userId, @quizId, @score, @passed, GETDATE())
      `);

    const attemptId = attemptResult.recordset[0].attempt_id;

    // Save user answers
    for (const questionId in answers) {
      const userAnswer = answers[questionId];
      const question = questionsMap[questionId];
      
      let isCorrect = null;
      if (question.question_type === 'multiple_choice') {
        const correctOption = question.options.find(opt => opt.is_correct);
        isCorrect = correctOption && userAnswer === correctOption.option_id;
      }

      await transaction.request()
        .input('attemptId', sql.BigInt, attemptId)
        .input('questionId', sql.BigInt, questionId)
        .input('selectedOptionId', question.question_type === 'multiple_choice' ? sql.BigInt : sql.BigInt, 
               question.question_type === 'multiple_choice' ? userAnswer : null)
        .input('answerText', question.question_type === 'essay' ? sql.NVarChar : sql.NVarChar, 
               question.question_type === 'essay' ? userAnswer : null)
        .input('isCorrect', sql.Bit, isCorrect)
        .query(`
          INSERT INTO user_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct)
          VALUES (@attemptId, @questionId, @selectedOptionId, @answerText, @isCorrect)
        `);
    }

    await transaction.commit();

    res.json({
      success: true,
      data: {
        attempt_id: attemptId,
        score: scorePercentage,
        passed: passed,
        passing_score: quiz.passing_score,
        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: unansweredCount,
        total_points: totalPoints,
        earned_points: earnedPoints,
        questions: detailedResults
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
});

// Get user's quiz history
router.get('/:quizId/attempts', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();

    const attemptsResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('quizId', sql.BigInt, quizId)
      .query(`
        SELECT attempt_id, score, passed, submitted_at
        FROM quiz_attempts
        WHERE user_id = @userId AND quiz_id = @quizId
        ORDER BY submitted_at DESC
      `);

    res.json({
      success: true,
      data: attemptsResult.recordset
    });

  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts',
      error: error.message
    });
  }
});

export default router;
