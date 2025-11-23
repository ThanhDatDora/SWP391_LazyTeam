import { getPool } from '../config/database.js';
import sql from 'mssql';

// Simple integration helper:
// 1) Insert an unsubmitted attempt for the dev mock user (user_id=16)
// 2) Build answers using correct options for a couple of questions
// 3) POST to the HTTP submit endpoint and print the response

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const MOOC_ID = Number(process.env.MOOC_ID || 53);
const USER_ID = Number(process.env.USER_ID || 16);

async function run() {
  try {
    const pool = await getPool();

    // pick up to 5 questions for the mooc
    const qReq = pool.request();
    qReq.input('moocId', sql.BigInt, MOOC_ID);
    const qRes = await qReq.query(`
      SELECT TOP 5 q.question_id
      FROM questions q
      WHERE q.mooc_id = @moocId
      ORDER BY NEWID()
    `);

    if (!qRes.recordset.length) {
      console.error('No questions found for mooc', MOOC_ID);
      process.exit(1);
    }

    const questions = qRes.recordset.map(r => r.question_id);

    // For each question, get the correct label
    const answers = [];
    for (const qid of questions) {
      const oReq = pool.request();
      oReq.input('qid', sql.BigInt, qid);
      const oRes = await oReq.query(`SELECT label FROM question_options WHERE question_id = @qid AND is_correct = 1`);
      const correct = oRes.recordset[0]?.label || null;
      answers.push({ question_id: qid, selected_option: correct });
    }

    // Insert attempt
    const insReq = pool.request();
    insReq.input('userId', sql.BigInt, USER_ID);
    insReq.input('moocId', sql.BigInt, MOOC_ID);
    insReq.input('totalQuestions', sql.Int, questions.length);
    const insertRes = await insReq.query(`
      INSERT INTO exam_attempts (user_id, mooc_id, total_questions, started_at)
      OUTPUT INSERTED.attempt_id
      VALUES (@userId, @moocId, @totalQuestions, DATEADD(SECOND, -10, GETDATE()))
    `);

    const attempt = insertRes.recordset[0];
    console.log('Created attempt:', attempt.attempt_id);

    // Submit via HTTP
    const submitUrl = `${BASE_URL}/api/learning/exams/${MOOC_ID}/submit`;
    console.log('Submitting attempt', attempt.attempt_id, 'to', submitUrl);

    const resp = await fetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempt_id: attempt.attempt_id, answers })
    });

    console.log('Status:', resp.status);
    const body = await resp.text();
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (e) {
      console.log(body);
    }

  } catch (err) {
    console.error('Error running integration helper:', err && err.stack ? err.stack : err);
    process.exit(1);
  } finally {
    try { await sql.close(); } catch (_) {}
  }
}

run();
