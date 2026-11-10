import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(new URL('../server.js', import.meta.url)))

async function freePort() {
  const s = createServer()
  await new Promise((resolve, reject) => s.once('error', reject).listen(0, '127.0.0.1', resolve))
  const port = s.address().port
  await new Promise(resolve => s.close(resolve))
  return port
}

test('server serves correct MIME types and protects read-only API', { timeout: 20000 }, async () => {
  const port = await freePort()
  // No dist modification: exercise API routes, which do not depend on a built frontend.
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root, env: { ...process.env, PORT: String(port), ANTHROPIC_API_KEY: '', APP_CODE: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  try {
    const base = 'http://127.0.0.1:' + port
    let ready = false
    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) throw new Error('Server exited before becoming ready')
      try { const r = await fetch(base + '/api/status'); if (r.ok) { ready = true; break } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    assert.ok(ready, 'server did not start')
    const status = await fetch(base + '/api/status')
    assert.deepEqual(await status.json(), { ai: false, needsCode: false })
    const data = await fetch(base + '/api/data-status')
    assert.equal(data.status, 200)
    const j = await data.json()
    assert.equal(j.source, 'bundled_snapshot')
    assert.equal(j.date, '2026-11-10')
    assert.ok(j.skaters > 100)
    const invalid = await fetch(base + '/api/data-status', { method: 'POST' })
    assert.equal(invalid.status, 405)
    const ask = await fetch(base + '/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'test' }) })
    assert.equal(ask.status, 503)
    const traversal = await fetch(base + '/%5csecret', { redirect: 'manual' })
    assert.equal(traversal.status, 400)
    const missingAsset = await fetch(base + '/missing.js')
    assert.equal(missingAsset.status, 404)
    assert.match(missingAsset.headers.get('content-type') || '', /json/)
  } finally {
    child.kill('SIGTERM')
    await new Promise(resolve => { if (child.exitCode !== null) resolve(); else child.once('exit', resolve) })
  }
})
