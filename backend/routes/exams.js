import express from 'express';
import { getPool } from '../config/database.js';
import sql from 'mssql';

const router = express.Router();

// POST /api/exams/:examId/start
router.post('/:examId/start', async (req, res) => {
  try {
    const { examId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'userId required' });

    const pool = await getPool();
    const exam = await pool.request().input('examId', sql.BigInt, examId).query('SELECT * FROM exams WHERE exam_id = @examId');
    if (exam.recordset.length === 0) return res.status(404).json({ success: false, error: 'Exam not found' });

    const examData = exam.recordset[0];
    const attempts = await pool.request().input('examId', sql.BigInt, examId).input('userId', sql.BigInt, userId).query('SELECT COUNT(*) as cnt FROM exam_instances WHERE exam_id = @examId AND user_id = @userId');
    if (attempts.recordset[0].cnt >= examData.attempts_allowed) return res.status(403).json({ success: false, error: 'Max attempts reached' });

    const questions = await pool.request().input('examId', sql.BigInt, examId).query('SELECT q.question_id, q.difficulty FROM questions q JOIN exam_items ei ON q.question_id = ei.question_id WHERE ei.exam_id = @examId');
    const easy = questions.recordset.filter(q => q.difficulty === 'easy');
    const medium = questions.recordset.filter(q => q.difficulty === 'medium');
    const hard = questions.recordset.filter(q => q.difficulty === 'hard');

    const selected = [...randomSelect(easy, 10), ...randomSelect(medium, 15), ...randomSelect(hard, 5)];
    shuffle(selected);

    const instance = await pool.request()
      .input('examId', sql.BigInt, examId).input('userId', sql.BigInt, userId).input('attempt', sql.Int, attempts.recordset[0].cnt + 1)
      .input('questions', sql.NVarChar, JSON.stringify(selected.map(q => q.question_id))).input('time', sql.Int, examData.duration_minutes * 60)
      .query("INSERT INTO exam_instances (exam_id, user_id, attempt_number, selected_questions, time_remaining_sec, status, start_time) OUTPUT INSERTED.instance_id, INSERTED.start_time VALUES (@examId, @userId, @attempt, @questions, @time, 'in_progress', GETDATE())");

    res.json({ success: true, instanceId: instance.recordset[0].instance_id, questions: selected.map(q => q.question_id), startTime: instance.recordset[0].start_time });
  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/exams/instances/:instanceId
router.get('/instances/:instanceId', async (req, res) => {
  try {
    const pool = await getPool();
    const instance = await pool.request().input('id', sql.BigInt, req.params.instanceId).query('SELECT ei.*, e.name, e.duration_minutes FROM exam_instances ei JOIN exams e ON ei.exam_id = e.exam_id WHERE ei.instance_id = @id');
    if (instance.recordset.length === 0) return res.status(404).json({ success: false, error: 'Instance not found' });

    const data = instance.recordset[0];
    const qIds = JSON.parse(data.selected_questions);
    const questions = await pool.request().query('SELECT q.question_id, q.stem, q.qtype, q.difficulty, q.max_score FROM questions q WHERE q.question_id IN (' + qIds.join(',') + ')');
    const options = await pool.request().query('SELECT option_id, question_id, label, content FROM question_options WHERE question_id IN (' + qIds.join(',') + ') ORDER BY question_id, label');

    const questionsMap = {};
    questions.recordset.forEach(q => { questionsMap[q.question_id] = { ...q, options: [] }; });
    options.recordset.forEach(opt => { if (questionsMap[opt.question_id]) questionsMap[opt.question_id].options.push(opt); });

    res.json({ success: true, instance: data, questions: qIds.map(id => questionsMap[id]) });
  } catch (error) {
    console.error('Error fetching instance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/exams/instances/:instanceId/answer
router.post('/instances/:instanceId/answer', async (req, res) => {
  try {
    const { questionId, selectedOptions, timeRemainingSeconds } = req.body;
    const pool = await getPool();
    const instance = await pool.request().input('id', sql.BigInt, req.params.instanceId).query('SELECT * FROM exam_instances WHERE instance_id = @id');
    if (instance.recordset.length === 0 || instance.recordset[0].status !== 'in_progress') return res.status(400).json({ success: false, error: 'Cannot save' });

    let subId = instance.recordset[0].submission_id;
    if (!subId) {
      const sub = await pool.request().input('examId', sql.BigInt, instance.recordset[0].exam_id).input('userId', sql.BigInt, instance.recordset[0].user_id).query('INSERT INTO submissions (exam_id, user_id, attempt_no, score, max_score) OUTPUT INSERTED.submission_id VALUES (@examId, @userId, 0, 0, 0)');
      subId = sub.recordset[0].submission_id;
      await pool.request().input('id', sql.BigInt, req.params.instanceId).input('subId', sql.BigInt, subId).query('UPDATE exam_instances SET submission_id = @subId WHERE instance_id = @id');
    }

    await pool.request().input('subId', sql.BigInt, subId).input('qId', sql.BigInt, questionId).query('DELETE FROM exam_answers WHERE submission_id = @subId AND question_id = @qId');
    await pool.request().input('subId', sql.BigInt, subId).input('qId', sql.BigInt, questionId).input('opts', sql.NVarChar, JSON.stringify(selectedOptions)).query('INSERT INTO exam_answers (submission_id, question_id, selected_options) VALUES (@subId, @qId, @opts)');
    if (timeRemainingSeconds !== undefined) await pool.request().input('id', sql.BigInt, req.params.instanceId).input('time', sql.Int, timeRemainingSeconds).query('UPDATE exam_instances SET time_remaining_sec = @time WHERE instance_id = @id');

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/exams/instances/:instanceId/submit
router.post('/instances/:instanceId/submit', async (req, res) => {
  try {
    const pool = await getPool();
    const instance = await pool.request().input('id', sql.BigInt, req.params.instanceId).query('SELECT * FROM exam_instances WHERE instance_id = @id');
    if (instance.recordset.length === 0) return res.status(404).json({ success: false });

    const data = instance.recordset[0];
    const qIds = JSON.parse(data.selected_questions);
    const answers = await pool.request().input('subId', sql.BigInt, data.submission_id).query('SELECT * FROM exam_answers WHERE submission_id = @subId');
    const userAnswers = {};
    answers.recordset.forEach(a => { userAnswers[a.question_id] = JSON.parse(a.selected_options); });

    const correct = await pool.request().query('SELECT question_id, option_id FROM question_options WHERE question_id IN (' + qIds.join(',') + ') AND is_correct = 1');
    const correctMap = {};
    correct.recordset.forEach(c => { if (!correctMap[c.question_id]) correctMap[c.question_id] = []; correctMap[c.question_id].push(c.option_id); });

    const points = await pool.request().query('SELECT question_id, points FROM exam_items WHERE question_id IN (' + qIds.join(',') + ')');
    const pointsMap = {};
    points.recordset.forEach(p => { pointsMap[p.question_id] = p.points; });

    let totalScore = 0, maxScore = 0, correctCount = 0;
    for (const qId of qIds) {
      maxScore += pointsMap[qId] || 0;
      const userAns = userAnswers[qId] || [];
      const correctAns = correctMap[qId] || [];
      const isCorrect = arraysEqual(userAns.sort(), correctAns.sort());
      if (isCorrect) { totalScore += pointsMap[qId] || 0; correctCount++; }
      await pool.request().input('subId', sql.BigInt, data.submission_id).input('qId', sql.BigInt, qId).input('correct', sql.Bit, isCorrect ? 1 : 0).input('pts', sql.Decimal, isCorrect ? (pointsMap[qId] || 0) : 0).query('UPDATE exam_answers SET is_correct = @correct, points_earned = @pts WHERE submission_id = @subId AND question_id = @qId');
    }

    await pool.request().input('subId', sql.BigInt, data.submission_id).input('attempt', sql.TinyInt, data.attempt_number).input('score', sql.Decimal, totalScore).input('max', sql.Decimal, maxScore).query('UPDATE submissions SET attempt_no = @attempt, score = @score, max_score = @max, submitted_at = GETDATE() WHERE submission_id = @subId');
    await pool.request().input('id', sql.BigInt, req.params.instanceId).query("UPDATE exam_instances SET status = 'completed', end_time = GETDATE() WHERE instance_id = @id");

    res.json({ success: true, score: totalScore, maxScore, percentage: Math.round((totalScore / maxScore) * 100), correctCount });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/exams/instances/:instanceId/results
router.get('/instances/:instanceId/results', async (req, res) => {
  try {
    const pool = await getPool();
    const instance = await pool.request().input('id', sql.BigInt, req.params.instanceId).query('SELECT ei.*, e.name, e.show_answers_after, s.score, s.max_score FROM exam_instances ei JOIN exams e ON ei.exam_id = e.exam_id LEFT JOIN submissions s ON ei.submission_id = s.submission_id WHERE ei.instance_id = @id');
    if (instance.recordset.length === 0) return res.status(404).json({ success: false });

    const data = instance.recordset[0];
    if (data.status !== 'completed') return res.status(400).json({ success: false, error: 'Not submitted' });

    const qIds = JSON.parse(data.selected_questions);
    const answers = await pool.request().input('subId', sql.BigInt, data.submission_id).query('SELECT ea.*, q.stem, q.difficulty FROM exam_answers ea JOIN questions q ON ea.question_id = q.question_id WHERE ea.submission_id = @subId');
    const options = await pool.request().query('SELECT option_id, question_id, label, content, is_correct FROM question_options WHERE question_id IN (' + qIds.join(',') + ')');

    const optionsMap = {};
    options.recordset.forEach(opt => { if (!optionsMap[opt.question_id]) optionsMap[opt.question_id] = []; optionsMap[opt.question_id].push({ ...opt, isCorrect: data.show_answers_after ? opt.is_correct : undefined }); });

    const results = answers.recordset.map(a => ({ questionId: a.question_id, stem: a.stem, difficulty: a.difficulty, userAnswer: JSON.parse(a.selected_options), isCorrect: a.is_correct, pointsEarned: a.points_earned, options: optionsMap[a.question_id] || [] }));

    res.json({ success: true, score: data.score, maxScore: data.max_score, percentage: Math.round((data.score / data.max_score) * 100), questions: results });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function randomSelect(arr, count) { return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(count, arr.length)); }
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } }
function arraysEqual(a, b) { return a.length === b.length && a.every((val, idx) => val === b[idx]); }

export default router;
