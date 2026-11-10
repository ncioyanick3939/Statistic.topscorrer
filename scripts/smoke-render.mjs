#!/usr/bin/env node
// Read-only smoke test for a deployed Topscorer AI service.
// Usage: node scripts/smoke-render.mjs https://statistic-topscorrer-ki.onrender.com
const base = (process.argv[2] || process.env.TOPSCORER_BASE_URL || '').trim().replace(/\/+$/, '')
if (!base) {
  console.error('Usage: node scripts/smoke-render.mjs https://your-service.onrender.com')
  process.exit(2)
}
let origin
try {
  const url = new URL(base)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('invalid origin')
  origin = url.origin
} catch {
  console.error('Expected a plain http(s) service origin without credentials, path, query or fragment.')
  process.exit(2)
}
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 30000)
if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) {
  console.error('SMOKE_TIMEOUT_MS must be an integer between 1000 and 120000')
  process.exit(2)
}
async function check(path, validate) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(origin + path, { signal: controller.signal, redirect: 'error', headers: { accept: path === '/' ? 'text/html' : 'application/json' } })
    if (!response.ok) throw new Error('HTTP ' + response.status)
    await validate(response)
    console.log('PASS ' + path)
  } finally {
    clearTimeout(timer)
  }
}
try {
  await check('/', async response => {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) throw new Error('Unexpected homepage content-type: ' + contentType)
    const html = await response.text()
    if (!/<html[\s>]/i.test(html) || !/<title[\s>]/i.test(html)) throw new Error('Homepage is not a complete HTML document')
  })
  await check('/api/status', async response => {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) throw new Error('Unexpected API content-type: ' + contentType)
    const data = await response.json()
    if (typeof data?.ai !== 'boolean' || typeof data?.needsCode !== 'boolean') throw new Error('Unexpected /api/status response shape')
    // Never print secrets or access codes. Both true and false are valid configurations.
  })
  console.log('Smoke test passed: ' + origin)
} catch (error) {
  console.error('FAIL ' + (error?.message || String(error)))
  process.exitCode = 1
}
