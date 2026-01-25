#!/usr/bin/env node
/**
 * Local dev sanity checks. Run with: node scripts/test-local.mjs
 * Dev server must be running: pnpm dev
 */

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function fetchOk(url, opts = {}) {
  const res = await fetch(url, { ...opts, redirect: 'follow' });
  const ct = res.headers.get('content-type') || '';
  let body = await res.text();
  if (ct.includes('application/json')) {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  console.log('Testing base URL:', BASE);
  const results = [];

  // 1. Health
  try {
    const { ok, status, body } = await fetchOk(`${BASE}/api/health`);
    results.push({ name: 'GET /api/health', ok, status, note: ok ? 'OK' : String(body).slice(0, 80) });
  } catch (e) {
    results.push({ name: 'GET /api/health', ok: false, status: '-', note: e.message });
  }

  // 2. SPA routes (HTML)
  for (const path of ['/', '/get-reports', '/dashboard', '/credit-analysis', '/preview-results']) {
    try {
      const { ok, status } = await fetchOk(`${BASE}${path}`);
      results.push({ name: `GET ${path}`, ok, status, note: ok ? 'HTML' : '-' });
    } catch (e) {
      results.push({ name: `GET ${path}`, ok: false, status: '-', note: e.message });
    }
  }

  // 3. Upload API (no files -> 400)
  try {
    const form = new FormData();
    const { ok, status, body } = await fetchOk(`${BASE}/api/credit-reports/upload-and-analyze`, {
      method: 'POST',
      body: form,
    });
    const expectValidation = status === 400 || status === 413 || status === 422;
    const note = typeof body === 'object' && body?.error ? body.error : (status === 400 ? 'validation OK' : String(body).slice(0, 60));
    results.push({
      name: 'POST /api/credit-reports/upload-and-analyze (no files)',
      ok: expectValidation,
      status,
      note,
    });
  } catch (e) {
    results.push({ name: 'POST /api/credit-reports/upload-and-analyze', ok: false, status: '-', note: e.message });
  }

  // 4. Files route (404 for missing key is fine)
  try {
    const { status } = await fetchOk(`${BASE}/api/files/missing-key`);
    results.push({
      name: 'GET /api/files/:key (missing)',
      ok: status === 404,
      status,
      note: status === 404 ? '404 expected' : '-',
    });
  } catch (e) {
    results.push({ name: 'GET /api/files/:key', ok: false, status: '-', note: e.message });
  }

  // Print
  console.log('');
  let passed = 0;
  for (const r of results) {
    const badge = r.ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    if (r.ok) passed++;
    console.log(`${badge} ${r.name} ${r.status} ${r.note ? `- ${r.note}` : ''}`);
  }
  console.log('');
  console.log(`Local checks: ${passed}/${results.length} passed.`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
