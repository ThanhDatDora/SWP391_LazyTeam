import fetch from 'node-fetch';

const BASE = 'http://localhost:3001';
const MOOC_ID = 53; // route param, not used to find attempt
const ATTEMPT_ID = 25; // attempt created earlier

async function run() {
  try {
    console.log('Submitting attempt', ATTEMPT_ID);
    const res = await fetch(`${BASE}/api/learning/exams/${MOOC_ID}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempt_id: ATTEMPT_ID, answers: [] })
    });
    const j = await res.json();
    console.log('Status:', res.status);
    console.log(JSON.stringify(j, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
