import express from 'express';
import sql from 'mssql';
import { getPool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get all questions for a MOOC
 * GET /api/question-bank/mooc/:moocId
 */
router.get('/mooc/:moocId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { moocId } = req.params;

    // Get questions with options
    const questionsResult = await pool.request()
      .input('moocId', sql.BigInt, moocId)
      .query(`
        SELECT 
          q.question_id,
          q.mooc_id,
          q.stem,
          q.qtype,
          q.difficulty,
          q.max_score,
          q.created_by,
          q.created_at,
          u.full_name as creator_name
        FROM questions q
        LEFT JOIN users u ON q.created_by = u.user_id
        WHERE q.mooc_id = @moocId
        ORDER BY q.created_at DESC
      `);

    const questions = questionsResult.recordset;

    // Get options for all questions
    if (questions.length > 0) {
      const questionIds = questions.map(q => q.question_id);
      
      const optionsResult = await pool.request()
        .query(`
          SELECT 
            option_id,
            question_id,
            label,
            content,
            is_correct
          FROM question_options
          WHERE question_id IN (${questionIds.join(',')})
          ORDER BY label
        `);

      const optionsByQuestion = {};
      optionsResult.recordset.forEach(opt => {
        if (!optionsByQuestion[opt.question_id]) {
          optionsByQuestion[opt.question_id] = [];
        }
        optionsByQuestion[opt.question_id].push(opt);
      });

      // Attach options to questions
      questions.forEach(q => {
        q.options = optionsByQuestion[q.question_id] || [];
      });
    }

    res.json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * Get random questions from a MOOC (for Quiz)
 * GET /api/question-bank/mooc/:moocId/random?limit=5
 */
router.get('/mooc/:moocId/random', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { moocId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    // Get random questions with options
    const questionsResult = await pool.request()
      .input('moocId', sql.BigInt, moocId)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          q.question_id,
          q.mooc_id,
          q.stem,
          q.qtype,
          q.difficulty,
          q.max_score,
          q.created_at
        FROM questions q
        WHERE q.mooc_id = @moocId AND q.qtype IN ('mcq', 'tf')
        ORDER BY NEWID()
      `);

    const questions = questionsResult.recordset;

    if (questions.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No questions available for this MOOC'
      });
    }

    // Get options for all questions
    const questionIds = questions.map(q => q.question_id);
    
    const optionsResult = await pool.request()
      .query(`
        SELECT 
          option_id,
          question_id,
          label,
          content,
          is_correct
        FROM question_options
        WHERE question_id IN (${questionIds.join(',')})
        ORDER BY question_id, label
      `);

    // Group options by question
    const optionsMap = {};
    optionsResult.recordset.forEach(opt => {
      if (!optionsMap[opt.question_id]) {
        optionsMap[opt.question_id] = [];
      }
      optionsMap[opt.question_id].push({
        option_id: opt.option_id,
        label: opt.label,
        content: opt.content,
        is_correct: opt.is_correct ? 1 : 0  // Convert to number for consistency
      });
    });

    // Attach options to questions
    const questionsWithOptions = questions.map(q => ({
      ...q,
      options: optionsMap[q.question_id] || []
    }));

    res.json({
      success: true,
      data: questionsWithOptions
    });

  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random questions'
    });
  }
});

/**
 * Create a new question
 * POST /api/question-bank
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { mooc_id, stem, qtype, difficulty, max_score, options } = req.body;
    const createdBy = req.user.userId;

    // Validate required fields
    if (!mooc_id || !stem || !qtype) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: mooc_id, stem, qtype'
      });
    }

    // Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 options are required'
      });
    }

    const hasCorrectAnswer = options.some(opt => opt.is_correct);
    if (!hasCorrectAnswer) {
      return res.status(400).json({
        success: false,
        error: 'At least one correct answer is required'
      });
    }

    // Insert question
    const questionResult = await pool.request()
      .input('moocId', sql.BigInt, mooc_id)
      .input('stem', sql.NVarChar(sql.MAX), stem)
      .input('qtype', sql.NVarChar(50), qtype)
      .input('difficulty', sql.NVarChar(50), difficulty || 'medium')
      .input('maxScore', sql.Decimal(5, 2), max_score || 1.0)
      .input('createdBy', sql.BigInt, createdBy)
      .query(`
        INSERT INTO questions (mooc_id, stem, qtype, difficulty, max_score, created_by, created_at)
        OUTPUT INSERTED.question_id
        VALUES (@moocId, @stem, @qtype, @difficulty, @maxScore, @createdBy, GETDATE())
      `);

    const questionId = questionResult.recordset[0].question_id;

    // Insert options (only for mcq and tf questions)
    if (qtype === 'mcq' || qtype === 'tf') {
      for (const option of options) {
        await pool.request()
          .input('questionId', sql.Int, questionId)
          .input('label', sql.NVarChar(10), option.label)
          .input('content', sql.NVarChar(sql.MAX), option.content)
          .input('isCorrect', sql.Bit, option.is_correct ? 1 : 0)
          .query(`
            INSERT INTO question_options (question_id, label, content, is_correct)
            VALUES (@questionId, @label, @content, @isCorrect)
          `);
      }
    }

    console.log(`✅ Created question ${questionId} with ${options.length} options`);

    res.json({
      success: true,
      data: {
        question_id: questionId
      },
      message: 'Question created successfully'
    });

  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create question'
    });
  }
});

/**
 * Update a question
 * PUT /api/question-bank/:questionId
 */
router.put('/:questionId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { questionId } = req.params;
    const { stem, qtype, difficulty, max_score, options } = req.body;

    // Validate required fields
    if (!stem || !qtype) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: stem, qtype'
      });
    }

    // Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 options are required'
      });
    }

    const hasCorrectAnswer = options.some(opt => opt.is_correct);
    if (!hasCorrectAnswer) {
      return res.status(400).json({
        success: false,
        error: 'At least one correct answer is required'
      });
    }

    // Update question
    await pool.request()
      .input('questionId', sql.BigInt, questionId)
      .input('stem', sql.NVarChar(sql.MAX), stem)
      .input('qtype', sql.NVarChar(50), qtype)
      .input('difficulty', sql.NVarChar(50), difficulty || 'medium')
      .input('maxScore', sql.Decimal(5, 2), max_score || 1.0)
      .query(`
        UPDATE questions
        SET stem = @stem,
            qtype = @qtype,
            difficulty = @difficulty,
            max_score = @maxScore
        WHERE question_id = @questionId
      `);

    // Delete old options
    await pool.request()
      .input('questionId', sql.BigInt, questionId)
      .query('DELETE FROM question_options WHERE question_id = @questionId');

    // Insert new options
    for (const option of options) {
      await pool.request()
        .input('questionId', sql.BigInt, questionId)
        .input('label', sql.NVarChar(10), option.label)
        .input('content', sql.NVarChar(sql.MAX), option.content)
        .input('isCorrect', sql.Bit, option.is_correct ? 1 : 0)
        .query(`
          INSERT INTO question_options (question_id, label, content, is_correct)
          VALUES (@questionId, @label, @content, @isCorrect)
        `);
    }

    console.log(`✅ Updated question ${questionId}`);

    res.json({
      success: true,
      message: 'Question updated successfully'
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update question'
    });
  }
});

/**
 * Delete a question
 * DELETE /api/question-bank/:questionId
 */
router.delete('/:questionId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { questionId } = req.params;

    // Delete options first (foreign key constraint)
    await pool.request()
      .input('questionId', sql.BigInt, questionId)
      .query('DELETE FROM question_options WHERE question_id = @questionId');

    // Delete question
    await pool.request()
      .input('questionId', sql.BigInt, questionId)
      .query('DELETE FROM questions WHERE question_id = @questionId');

    console.log(`✅ Deleted question ${questionId}`);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete question'
    });
  }
});

/**
 * Get question statistics for a MOOC
 * GET /api/question-bank/mooc/:moocId/stats
 */
router.get('/mooc/:moocId/stats', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { moocId } = req.params;

    const statsResult = await pool.request()
      .input('moocId', sql.BigInt, moocId)
      .query(`
        SELECT 
          COUNT(*) as total_questions,
          SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy_count,
          SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium_count,
          SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard_count,
          SUM(CASE WHEN qtype = 'mcq' THEN 1 ELSE 0 END) as mcq_count,
          SUM(CASE WHEN qtype = 'tf' THEN 1 ELSE 0 END) as tf_count,
          SUM(CASE WHEN qtype = 'essay' THEN 1 ELSE 0 END) as essay_count
        FROM questions
        WHERE mooc_id = @moocId
      `);

    res.json({
      success: true,
      data: statsResult.recordset[0]
    });

  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;
