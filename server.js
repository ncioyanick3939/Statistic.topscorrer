// Kleiner Server für Render: liefert die App aus und beantwortet KI-Fragen über die Anthropic-API.
// Der Schlüssel steht nur hier auf dem Server (Umgebungsvariable), nie in der Seite.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const KEY = process.env.ANTHROPIC_API_KEY || ''
const CODE = process.env.APP_CODE || ''
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'
const URL_API = process.env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages'
const PORT = process.env.PORT || 3000
const LIMIT = +(process.env.ASK_LIMIT_PER_HOUR || 20)
const hits = new Map()

function limited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < 3600e3)
  list.push(now)
  hits.set(ip, list)
  return list.length > LIMIT
}
const send = (res, status, obj) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)) }

async function ask(req, res) {
  if (!KEY) return send(res, 503, { error: 'ai_not_configured' })
  let body = ''
  for await (const c of req) { body += c; if (body.length > 6e6) return send(res, 413, { error: 'zu gross' }) }
  let data
  try { data = JSON.parse(body) } catch (e) { return send(res, 400, { error: 'ungültig' }) }
  if (CODE && data.code !== CODE) return send(res, 401, { error: 'bad_code' })
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
  if (limited(ip)) return send(res, 429, { error: 'rate_limited' })
  if (typeof data.prompt !== 'string' || !data.prompt.trim() || data.prompt.length > 60000) return send(res, 400, { error: 'leer' })
  const img = Array.isArray(data.images) ? data.images[0] : null
  const content = img && typeof img.data === 'string' && /^image\/(jpeg|png|webp)$/.test(img.type)
    ? [{ type: 'image', source: { type: 'base64', media_type: img.type, data: img.data } }, { type: 'text', text: data.prompt }]
    : data.prompt
  try {
    const r = await fetch(URL_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, messages: [{ role: 'user', content }] })
    })
    const j = await r.json()
    if (!r.ok) { console.error('API', r.status, JSON.stringify(j).slice(0, 300)); return send(res, 502, { error: 'api' }) }
    send(res, 200, { text: (j.content || []).map((b) => b.text || '').join('') })
  } catch (e) { console.error(e); send(res, 502, { error: 'api' }) }
}

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0]
  if (url === '/api/status') return send(res, 200, { ai: !!KEY, needsCode: !!CODE })
  if (url === '/api/ask' && req.method === 'POST') return ask(req, res)
  const TYPES = { '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.html': 'text/html; charset=utf-8' }
  const clean = path.normalize(url).replace(/^(\.\.[/\\])+/, '')
  let file = path.join(dir, clean)
  if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html')
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(500); return res.end('Noch nicht gebaut. Bitte zuerst npm run build ausführen.') }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'text/html; charset=utf-8' })
    res.end(buf)
  })
}).listen(PORT, () => console.log('läuft auf Port ' + PORT))
