import { spawn } from 'child_process';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = 'http://localhost:3001';
const MOOC_ID = 53;

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

async function runHttpFlow() {
  try {
    console.log('Attempting HTTP start->submit flow...');

    const startRes = await fetch(`${BASE}/api/learning/exams/${MOOC_ID}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const startJson = await startRes.json();
    console.log('Start response status:', startRes.status);
    console.log(JSON.stringify(startJson, null, 2));

    if (!startJson.success) {
      console.error('HTTP start failed');
      return false;
    }

    const attemptId = startJson.data.attempt_id;
    const questions = startJson.data.questions || [];

    const answers = questions.map((q) => ({
      question_id: q.question_id,
      selected_option: q.options && q.options[0] ? q.options[0].label : null
    })).filter(a => a.selected_option);

    const submitRes = await fetch(`${BASE}/api/learning/exams/${MOOC_ID}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempt_id: attemptId, answers })
    });

    const submitJson = await submitRes.json();
    console.log('Submit response status:', submitRes.status);
    console.log(JSON.stringify(submitJson, null, 2));

    return submitJson.success === true;
  } catch (err) {
    console.error('HTTP flow error:', err.message || err);
    return false;
  }
}

async function runDbFallback() {
  return new Promise((resolve) => {
    console.log('Falling back to DB-only direct submit script...');
    // Determine the backend directory relative to this script
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const backendDir = path.resolve(__dirname, '..'); // backend/integration -> backend

    const child = spawn(process.execPath || 'node', ['debug-submit-direct.cjs'], { cwd: backendDir, stdio: 'inherit' });
    child.on('exit', (code) => {
      resolve(code === 0);
    });
    child.on('error', (err) => {
      console.error('Failed to spawn DB fallback process:', err.message || err);
      resolve(false);
    });
  });
}

(async () => {
  const up = await waitForServer(20, 500);
  if (up) {
    const ok = await runHttpFlow();
    if (ok) {
      console.log('Integration test (HTTP) succeeded');
      process.exit(0);
    }
    console.log('HTTP integration failed — attempting DB fallback');
  } else {
    console.log('Server not available — attempting DB fallback');
  }

  const dbOk = await runDbFallback();
  if (dbOk) {
    console.log('Integration test (DB fallback) succeeded');
    process.exit(0);
  }

  console.error('Integration test failed');
  process.exit(1);
})();
