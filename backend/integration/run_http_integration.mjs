import { spawn } from 'child_process';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const serverEntry = path.join(backendRoot, 'server.js');
const integrationScript = path.join(__dirname, 'http_submit_with_insert.mjs');

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
const HEALTH_URL = `${BASE_URL}/api/health`;

function spawnServer() {
  console.log('Spawning backend server:', serverEntry);
  const proc = spawn(process.execPath, [serverEntry], {
    cwd: backendRoot,
    env: { ...process.env, PORT: process.env.PORT || '3001' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  proc.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`[server-err] ${d}`));

  proc.on('exit', (code, signal) => {
    console.log(`Backend server exited (code=${code}, signal=${signal})`);
  });

  return proc;
}

async function waitForHealth(url, timeoutMs = 30000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { timeout: 3000 });
      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        console.log('Health check OK:', body && body.data ? body.data.message : 'ok');
        return true;
      }
    } catch (e) {
      // ignore and retry
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
}

async function runIntegration() {
  const serverProc = spawnServer();
  try {
    const healthy = await waitForHealth(HEALTH_URL, 30000, 500);
    if (!healthy) {
      throw new Error(`Server did not become healthy at ${HEALTH_URL} within timeout`);
    }

    console.log('Running HTTP integration script:', integrationScript);
    const runner = spawn(process.execPath, [integrationScript], {
      cwd: __dirname,
      env: { ...process.env, BASE_URL: BASE_URL }
    });

    runner.stdout.on('data', (d) => process.stdout.write(`[integration] ${d}`));
    runner.stderr.on('data', (d) => process.stderr.write(`[integration-err] ${d}`));

    const exitCode = await new Promise((resolve) => {
      runner.on('close', resolve);
      runner.on('exit', resolve);
    });

    console.log('Integration helper exited with code', exitCode);
    return exitCode;
  } finally {
    // Try to gracefully shutdown server
    if (serverProc && !serverProc.killed) {
      console.log('Stopping backend server...');
      serverProc.kill('SIGTERM');
      // force kill after short delay if still alive
      setTimeout(() => {
        try { if (!serverProc.killed) serverProc.kill('SIGKILL'); } catch (_) {}
      }, 2000);
    }
  }
}

runIntegration().then((code) => process.exit(typeof code === 'number' ? code : 0)).catch((err) => {
  console.error('HTTP integration runner failed:', err && err.stack ? err.stack : err);
  process.exit(1);
});
