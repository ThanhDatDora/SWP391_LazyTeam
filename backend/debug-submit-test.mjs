import fetch from 'node-fetch';

const BASE = 'http://localhost:3001';
const MOOC_ID = 53; // adjust if needed

async function waitForServer(retries = 10, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return true;
    } catch {
      // ignore
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}

async function run() {
  try {
    console.log('Waiting for server...');
    const up = await waitForServer(20, 500);
    if (!up) {
      throw new Error('Server did not respond to health check');
    }

    console.log('Starting exam (create attempt)...');
    const startRes = await fetch(`${BASE}/api/learning/exams/${MOOC_ID}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const startJson = await startRes.json();
    console.log('Start response status:', startRes.status);
    console.log(JSON.stringify(startJson, null, 2));

    if (!startJson.success) {
      console.error('Failed to start exam, aborting submit test');
      return;
    }

    const attemptId = startJson.data.attempt_id;
    const questions = startJson.data.questions || [];

    const answers = questions.map((q) => ({
      question_id: q.question_id,
      selected_option: q.options && q.options[0] ? q.options[0].label : null
    })).filter(a => a.selected_option);

    console.log('Submitting answers for attempt', attemptId);

    const submitRes = await fetch(`${BASE}/api/learning/exams/${MOOC_ID}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempt_id: attemptId, answers })
    });

    const submitJson = await submitRes.json();
    console.log('Submit response status:', submitRes.status);
    console.log(JSON.stringify(submitJson, null, 2));
  } catch (err) {
    console.error('Error running debug submit test:', err);
  }
}

run();
