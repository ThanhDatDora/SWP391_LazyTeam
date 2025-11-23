import examController from '../../backend/controllers/exam-controller.js';
import { getPool } from '../../backend/config/database.js';
import sql from 'mssql';

// This script inserts an unsubmitted attempt for the dev user and calls
// examController.submitExam directly with mocked req/res to test the
// controller logic (transactions, grading, enrollment updates) without
// needing the HTTP server to be running.

const MOOC_ID = Number(process.env.MOOC_ID || 53);
const USER_ID = Number(process.env.USER_ID || 16);

function makeMockRes() {
  let statusCode = 200;
  let body = null;
  return {
    status(code) { statusCode = code; return this; },
    json(obj) { body = obj; return this; },
    _get() { return { statusCode, body }; }
  };
}

async function run() {
  let pool;
  try {
    pool = await getPool();

    // pick a few questions and correct answers
    const qRes = await pool.request()
      .input('moocId', sql.BigInt, MOOC_ID)
      .query('SELECT TOP 5 question_id FROM questions WHERE mooc_id = @moocId ORDER BY NEWID()');

    if (!qRes.recordset.length) {
      console.error('No questions found for mooc', MOOC_ID);
      process.exit(1);
    }

    const questions = qRes.recordset.map(r => r.question_id);
    const answers = [];
    for (const qid of questions) {
      const oRes = await pool.request().input('qid', sql.BigInt, qid)
        .query('SELECT TOP 1 label FROM question_options WHERE question_id = @qid AND is_correct = 1');
      answers.push({ question_id: qid, selected_option: oRes.recordset[0]?.label || null });
    }

    // Insert attempt row with started_at = now to ensure positive time_taken
    const ins = await pool.request()
      .input('userId', sql.BigInt, USER_ID)
      .input('moocId', sql.BigInt, MOOC_ID)
      .input('totalQuestions', sql.Int, questions.length)
      // Insert started_at slightly in the past to avoid timezone-related future timestamps
      .query(`INSERT INTO exam_attempts (user_id, mooc_id, total_questions, started_at) OUTPUT INSERTED.attempt_id VALUES (@userId, @moocId, @totalQuestions, DATEADD(SECOND, -10, GETDATE()))`);

    const attemptId = ins.recordset[0].attempt_id;
    console.log('Inserted attempt', attemptId);

    // Build mock req/res and call controller
    const req = {
      body: { attempt_id: attemptId, answers },
      user: { userId: USER_ID }
    };
    const res = makeMockRes();

    await examController.submitExam(req, res);

    const result = res._get();
    console.log('Controller response status:', result.statusCode);
    console.log('Controller response body:', JSON.stringify(result.body, null, 2));

  } catch (err) {
    console.error('Error running controller submit:', err && err.stack ? err.stack : err);
    process.exit(1);
  } finally {
    try { await sql.close(); } catch (_) {}
  }
}

run();
