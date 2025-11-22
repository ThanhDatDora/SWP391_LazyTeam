const path = require('path');

// This script simulates the start -> submit flow directly against the database
// without going through the HTTP server. It is useful when the local server
// process isn't reliably reachable from this environment.

async function run() {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;

    // Connect and get the ConnectionPool instance
    pool = await getPool();
    console.log('Connected to DB');

    const MOOC_ID = 53;
    const USER_ID = 16; // matches fallback user in routes/new-exam-routes.js

    // 1) Select random questions (like start endpoint)
    const questionsResult = await pool.request().query(`
      SELECT TOP 10 q.question_id, q.stem, q.qtype, q.difficulty
      FROM questions q
      WHERE q.mooc_id = ${MOOC_ID}
      ORDER BY NEWID()
    `);

    if (!questionsResult.recordset.length) {
      console.error('No questions found for mooc', MOOC_ID);
      return;
    }

    const questions = await Promise.all(
      questionsResult.recordset.map(async (q) => {
        const req = pool.request();
        req.input('questionId', sqlLib.BigInt, q.question_id);
        const optionsResult = await req.query(`
            SELECT option_id, label, content
            FROM question_options
            WHERE question_id = @questionId
            ORDER BY NEWID()
          `);

        return {
          question_id: q.question_id,
          options: optionsResult.recordset.map(opt => ({ label: opt.label }))
        };
      })
    );

    // 2) Create attempt
    const insertReq = pool.request();
    insertReq.input('userId', sqlLib.BigInt, USER_ID);
    insertReq.input('moocId', sqlLib.BigInt, MOOC_ID);
    insertReq.input('totalQuestions', sqlLib.Int, questions.length);
    const attemptInsert = await insertReq.query(`
        INSERT INTO exam_attempts (user_id, mooc_id, total_questions)
        OUTPUT INSERTED.attempt_id, INSERTED.started_at
        VALUES (@userId, @moocId, @totalQuestions)
      `);

    const attempt = attemptInsert.recordset[0];
    console.log('Created attempt:', attempt.attempt_id, 'started_at', attempt.started_at);

    // 3) Build answers by choosing the first option for each question
    const answers = questions.map(q => ({ question_id: q.question_id, selected_option: q.options[0]?.label }));

    // 4) Grade and update inside transaction, similar to server logic
    const transaction = new sqlLib.Transaction(pool);
    try {
      await transaction.begin();
      const tr = transaction.request();

      // Calculate timeTaken
      const timeTaken = 60; // simulate 1 minute

      // Grade
      let correctAnswers = 0;
      for (const a of answers) {
        const qReq = transaction.request();
        qReq.input('questionId', sqlLib.BigInt, a.question_id);
        const qRes = await qReq.query(`SELECT label FROM question_options WHERE question_id = @questionId AND is_correct = 1`);
        if (qRes.recordset.length > 0) {
          const correctLabel = qRes.recordset[0].label;
          if (a.selected_option === correctLabel) correctAnswers++;
        }
      }

      const totalQuestions = questions.length || 1;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const passed = score >= 70;

      // Update attempt
      await tr
        .input('timeTaken', sqlLib.Int, timeTaken)
        .input('correctAnswers', sqlLib.Int, correctAnswers)
        .input('score', sqlLib.Decimal(5,2), score)
        .input('passed', sqlLib.Bit, passed ? 1 : 0)
        .input('answers', sqlLib.NVarChar(sqlLib.MAX), JSON.stringify(answers))
        .input('attemptId', sqlLib.BigInt, attempt.attempt_id)
        .query(`
          UPDATE exam_attempts
          SET submitted_at = GETDATE(), time_taken = @timeTaken, correct_answers = @correctAnswers,
              score = @score, passed = @passed, answers = @answers
          WHERE attempt_id = @attemptId
        `);

      let nextMoocUnlocked = false;
      if (passed) {
        // find current mooc info
        const moocInfoReq = transaction.request();
        moocInfoReq.input('moocId', sqlLib.BigInt, MOOC_ID);
        const moocInfo = await moocInfoReq.query('SELECT course_id, order_no FROM moocs WHERE mooc_id = @moocId');
        if (moocInfo.recordset.length > 0) {
          const currentMooc = moocInfo.recordset[0];
          const nextReq = transaction.request();
          nextReq.input('courseId', sql.BigInt, currentMooc.course_id);
          nextReq.input('orderNo', sql.Int, currentMooc.order_no);
          const nextRes = await nextReq.query(`SELECT TOP 1 mooc_id FROM moocs WHERE course_id = @courseId AND order_no > @orderNo ORDER BY order_no ASC`);

            if (nextRes.recordset.length > 0) {
            const nextMoocId = nextRes.recordset[0].mooc_id;
              const upReq = transaction.request();
              upReq.input('nextMoocId', sqlLib.BigInt, nextMoocId);
              upReq.input('userId', sqlLib.BigInt, USER_ID);
              upReq.input('courseId', sqlLib.BigInt, currentMooc.course_id);
            await upReq.query(`
                UPDATE enrollments
                SET current_mooc_id = @nextMoocId,
                    moocs_completed = ISNULL(moocs_completed, 0) + 1
                WHERE user_id = @userId AND course_id = @courseId
              `);
            nextMoocUnlocked = true;
          } else {
            const upReq2 = transaction.request();
            upReq2.input('userId', sqlLib.BigInt, USER_ID);
            upReq2.input('courseId', sqlLib.BigInt, currentMooc.course_id);
            await upReq2.query(`
                UPDATE enrollments
                SET moocs_completed = ISNULL(moocs_completed, 0) + 1,
                    overall_score = (
                      SELECT AVG(score)
                      FROM exam_attempts ea
                      JOIN moocs m ON ea.mooc_id = m.mooc_id
                      WHERE ea.user_id = @userId AND m.course_id = @courseId AND ea.passed = 1
                    ),
                    is_completed = 1,
                    completed_at = GETDATE()
                WHERE user_id = @userId AND course_id = @courseId
              `);
          }
        }
      }

      await transaction.commit();
      console.log('Submission committed. score=', score, 'correct=', correctAnswers, 'passed=', passed, 'next_unlocked=', nextMoocUnlocked);
    } catch (txErr) {
      try { await transaction.rollback(); } catch (_) {}
      console.error('Transaction failed:', txErr);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch (_) {}
  }
}

run();
