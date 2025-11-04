const sql = require('mssql');

/**
 * Get exam info by MOOC ID
 * GET /api/exams/mooc/:moocId
 */
exports.getExamByMooc = async (req, res) => {
  try {
    const { moocId } = req.params;
    const userId = req.user.userId;

    // Get MOOC info
    const moocResult = await sql.query`
      SELECT m.mooc_id, m.name as mooc_name, m.course_id
      FROM moocs m
      WHERE m.mooc_id = ${moocId}
    `;

    if (moocResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'MOOC not found'
      });
    }

    const mooc = moocResult.recordset[0];

    // Count questions for this MOOC
    const questionCount = await sql.query`
      SELECT COUNT(*) as total
      FROM questions
      WHERE mooc_id = ${moocId}
    `;

    const totalQuestions = questionCount.recordset[0].total;

    // Get previous attempts
    const attemptsResult = await sql.query`
      SELECT 
        attempt_id,
        score,
        passed,
        submitted_at,
        time_taken
      FROM exam_attempts
      WHERE user_id = ${userId} AND mooc_id = ${moocId}
      ORDER BY submitted_at DESC
    `;

    const previousAttempts = attemptsResult.recordset.length;
    const bestScore = previousAttempts > 0 
      ? Math.max(...attemptsResult.recordset.map(a => a.score || 0))
      : null;
    const lastAttemptDate = previousAttempts > 0
      ? attemptsResult.recordset[0].submitted_at
      : null;

    // Check if can take exam (all lessons completed)
    const lessonProgress = await sql.query`
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN lp.completed = 1 THEN 1 ELSE 0 END) as completed_lessons
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.lesson_id = lp.lesson_id AND lp.user_id = ${userId}
      WHERE l.mooc_id = ${moocId}
    `;

    const progress = lessonProgress.recordset[0];
    const canTakeExam = progress.total_lessons > 0 && 
                        progress.completed_lessons === progress.total_lessons;

    res.json({
      success: true,
      data: {
        exam_id: mooc.mooc_id, // Using mooc_id as exam_id
        mooc_id: mooc.mooc_id,
        mooc_name: mooc.mooc_name,
        course_id: mooc.course_id,
        total_questions: Math.min(totalQuestions, 10), // Max 10 questions per exam
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
    res.status(500).json({
      success: false,
      error: 'Failed to get exam information'
    });
  }
};

/**
 * Start exam - Get random questions
 * POST /api/exams/:examId/start
 */
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.params; // examId is mooc_id
    const userId = req.user.userId;
    const moocId = examId;

    // Check if user can take exam
    const lessonProgress = await sql.query`
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN lp.completed = 1 THEN 1 ELSE 0 END) as completed_lessons
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.lesson_id = lp.lesson_id AND lp.user_id = ${userId}
      WHERE l.mooc_id = ${moocId}
    `;

    const progress = lessonProgress.recordset[0];
    if (progress.total_lessons === 0 || progress.completed_lessons < progress.total_lessons) {
      return res.status(400).json({
        success: false,
        error: 'Must complete all lessons before taking exam'
      });
    }

    // Check for recent attempts (5 minute cooldown)
    const recentAttempt = await sql.query`
      SELECT TOP 1 started_at
      FROM exam_attempts
      WHERE user_id = ${userId} AND mooc_id = ${moocId}
      ORDER BY started_at DESC
    `;

    if (recentAttempt.recordset.length > 0) {
      const lastAttempt = new Date(recentAttempt.recordset[0].started_at);
      const timeSince = (Date.now() - lastAttempt.getTime()) / 1000; // seconds
      if (timeSince < 300) { // 5 minutes = 300 seconds
        return res.status(400).json({
          success: false,
          error: `Please wait ${Math.ceil(300 - timeSince)} seconds before retrying`
        });
      }
    }

    // Get random 10 questions for this MOOC
    const questionsResult = await sql.query`
      SELECT TOP 10
        q.question_id,
        q.stem,
        q.qtype,
        q.difficulty
      FROM questions q
      WHERE q.mooc_id = ${moocId}
      ORDER BY NEWID() -- Random order
    `;

    if (questionsResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No questions available for this exam'
      });
    }

    // Get options for each question (randomize order, but DON'T send is_correct)
    const questions = await Promise.all(
      questionsResult.recordset.map(async (q) => {
        const optionsResult = await sql.query`
          SELECT 
            option_id,
            label,
            content
          FROM question_options
          WHERE question_id = ${q.question_id}
          ORDER BY NEWID() -- Randomize option order
        `;

        return {
          question_id: q.question_id,
          stem: q.stem,
          qtype: q.qtype,
          difficulty: q.difficulty,
          options: optionsResult.recordset.map(opt => ({
            option_id: opt.option_id,
            label: opt.label,
            content: opt.content
            // is_correct is NOT sent to frontend!
          }))
        };
      })
    );

    // Create exam attempt record
    const attemptResult = await sql.query`
      INSERT INTO exam_attempts (user_id, mooc_id, total_questions)
      OUTPUT INSERTED.attempt_id, INSERTED.started_at
      VALUES (${userId}, ${moocId}, ${questions.length})
    `;

    const attempt = attemptResult.recordset[0];
    const expiresAt = new Date(attempt.started_at);
    expiresAt.setMinutes(expiresAt.getMinutes() + 20); // 20 minutes

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
    res.status(500).json({
      success: false,
      error: 'Failed to start exam'
    });
  }
};

/**
 * Submit exam and calculate score
 * POST /api/exams/:examId/submit
 */
exports.submitExam = async (req, res) => {
  try {
    const { attempt_id, answers } = req.body;
    const userId = req.user.userId;

    if (!attempt_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: attempt_id, answers'
      });
    }

    // Verify attempt belongs to user
    const attemptResult = await sql.query`
      SELECT 
        attempt_id,
        user_id,
        mooc_id,
        started_at,
        total_questions,
        submitted_at
      FROM exam_attempts
      WHERE attempt_id = ${attempt_id}
    `;

    if (attemptResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exam attempt not found'
      });
    }

    const attempt = attemptResult.recordset[0];

    if (attempt.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (attempt.submitted_at) {
      return res.status(400).json({
        success: false,
        error: 'Exam already submitted'
      });
    }

    // Check time limit (20 minutes)
    const timeTaken = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
    if (timeTaken > 1200) { // 20 minutes = 1200 seconds
      return res.status(400).json({
        success: false,
        error: 'Time limit exceeded'
      });
    }

    // Calculate score
    let correctAnswers = 0;

    for (const answer of answers) {
      const { question_id, selected_option } = answer;

      // Get correct answer
      const correctResult = await sql.query`
        SELECT option_id, label
        FROM question_options
        WHERE question_id = ${question_id} AND is_correct = 1
      `;

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
    await sql.query`
      UPDATE exam_attempts
      SET 
        submitted_at = GETDATE(),
        time_taken = ${timeTaken},
        correct_answers = ${correctAnswers},
        score = ${score},
        passed = ${passed ? 1 : 0},
        answers = ${JSON.stringify(answers)}
      WHERE attempt_id = ${attempt_id}
    `;

    // If passed, check if should unlock next MOOC
    let nextMoocUnlocked = false;
    if (passed) {
      // Get current MOOC order and course_id
      const moocInfo = await sql.query`
        SELECT course_id, order_index
        FROM moocs
        WHERE mooc_id = ${attempt.mooc_id}
      `;

      if (moocInfo.recordset.length > 0) {
        const currentMooc = moocInfo.recordset[0];
        
        // Get next MOOC
        const nextMoocResult = await sql.query`
          SELECT TOP 1 mooc_id
          FROM moocs
          WHERE course_id = ${currentMooc.course_id} 
            AND order_index > ${currentMooc.order_index}
          ORDER BY order_index ASC
        `;

        if (nextMoocResult.recordset.length > 0) {
          nextMoocUnlocked = true;
          
          // Update enrollment progress
          await sql.query`
            UPDATE enrollments
            SET 
              current_mooc_id = ${nextMoocResult.recordset[0].mooc_id},
              moocs_completed = moocs_completed + 1,
              progress = (moocs_completed + 1) * 100.0 / (
                SELECT COUNT(*) FROM moocs WHERE course_id = ${currentMooc.course_id}
              )
            WHERE user_id = ${userId} 
              AND course_id = ${currentMooc.course_id}
          `;
        } else {
          // This was the last MOOC - mark course as complete
          await sql.query`
            UPDATE enrollments
            SET 
              moocs_completed = moocs_completed + 1,
              progress = 100,
              overall_score = (
                SELECT AVG(score) 
                FROM exam_attempts ea
                JOIN moocs m ON ea.mooc_id = m.mooc_id
                WHERE ea.user_id = ${userId} 
                  AND m.course_id = ${currentMooc.course_id}
                  AND ea.passed = 1
              )
            WHERE user_id = ${userId} 
              AND course_id = ${currentMooc.course_id}
          `;
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
    res.status(500).json({
      success: false,
      error: 'Failed to submit exam'
    });
  }
};

/**
 * Get exam result with detailed answers
 * GET /api/exams/attempts/:attemptId/result
 */
exports.getExamResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.userId;

    // Get attempt details
    const attemptResult = await sql.query`
      SELECT 
        ea.attempt_id,
        ea.user_id,
        ea.mooc_id,
        ea.started_at,
        ea.submitted_at,
        ea.time_taken,
        ea.total_questions,
        ea.correct_answers,
        ea.score,
        ea.passed,
        ea.answers,
        m.name as mooc_name
      FROM exam_attempts ea
      JOIN moocs m ON ea.mooc_id = m.mooc_id
      WHERE ea.attempt_id = ${attemptId}
    `;

    if (attemptResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exam attempt not found'
      });
    }

    const attempt = attemptResult.recordset[0];

    if (attempt.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (!attempt.submitted_at) {
      return res.status(400).json({
        success: false,
        error: 'Exam not yet submitted'
      });
    }

    // Parse answers
    const answers = JSON.parse(attempt.answers || '[]');

    // Get detailed results for each question
    const detailedResults = await Promise.all(
      answers.map(async (answer) => {
        const { question_id, selected_option } = answer;

        // Get question and correct answer
        const questionResult = await sql.query`
          SELECT 
            q.question_id,
            q.stem,
            q.difficulty
          FROM questions q
          WHERE q.question_id = ${question_id}
        `;

        const optionsResult = await sql.query`
          SELECT 
            option_id,
            label,
            content,
            is_correct
          FROM question_options
          WHERE question_id = ${question_id}
          ORDER BY label
        `;

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
    res.status(500).json({
      success: false,
      error: 'Failed to get exam result'
    });
  }
};

/**
 * Get course progress with all MOOCs and exams
 * GET /api/learning/course/:courseId/progress
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Get enrollment info
    const enrollmentResult = await sql.query`
      SELECT 
        enrollment_id,
        current_mooc_id,
        moocs_completed,
        progress,
        overall_score
      FROM enrollments
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `;

    if (enrollmentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not enrolled in this course'
      });
    }

    const enrollment = enrollmentResult.recordset[0];

    // Get all MOOCs for this course
    const moocsResult = await sql.query`
      SELECT 
        m.mooc_id,
        m.name,
        m.order_index,
        (SELECT COUNT(*) FROM lessons WHERE mooc_id = m.mooc_id) as total_lessons,
        (SELECT COUNT(*) FROM lessons l 
         JOIN lesson_progress lp ON l.lesson_id = lp.lesson_id 
         WHERE l.mooc_id = m.mooc_id AND lp.user_id = ${userId} AND lp.completed = 1
        ) as lessons_completed
      FROM moocs m
      WHERE m.course_id = ${courseId}
      ORDER BY m.order_index ASC
    `;

    // Get exam status for each MOOC
    const allMoocs = await Promise.all(
      moocsResult.recordset.map(async (mooc) => {
        const examResult = await sql.query`
          SELECT TOP 1
            attempt_id,
            score,
            passed,
            submitted_at
          FROM exam_attempts
          WHERE user_id = ${userId} AND mooc_id = ${mooc.mooc_id} AND passed = 1
          ORDER BY submitted_at DESC
        `;

        const examPassed = examResult.recordset.length > 0;
        const examScore = examPassed ? examResult.recordset[0].score : null;

        // Determine MOOC status
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

    // Find current MOOC
    const currentMooc = allMoocs.find(m => 
      m.status === 'in_progress' || m.status === 'exam_available'
    ) || allMoocs[0];

    // Check if certificate is available
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
    res.status(500).json({
      success: false,
      error: 'Failed to get course progress'
    });
  }
};
