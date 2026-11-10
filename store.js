// Gemeinsamer Zustand der App: Daten, Auswahl, Filter. Alle Komponenten lesen von hier.
import { reactive, computed } from 'vue'
import baseData from './stats.json'
import { MY_SQUAD } from './data.js'
import { buildContext, rate, forecast, buildValueModel, iso, chDate } from './model.js'
import { lineup, sellPlan, matchDays, weekGames } from './team.js'
import { matchName, money, parseRows as parseShotRows } from './shot.js'
import { readExport } from './importers.js'
import { mergeStatistics } from './statistics-merge.js'

const local = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch (e) { return fallback } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) { /* Speicher gesperrt */ } }
}

let first = baseData
{
  const saved = local.get('tc-stats', null)
  if (saved && saved.date > first.date && saved.sk && saved.go) first = saved
}

function applySquad(obj) {
  Object.keys(MY_SQUAD).forEach((k) => delete MY_SQUAD[k])
  Object.assign(MY_SQUAD, obj)
}
{
  const saved = local.get('tc-squad', null)
  if (saved && saved.squad) applySquad(saved.squad)
}

export const state = reactive({
  tab: 'heute', day: '', keep: local.get('tc-keep', { 'Schmid Sandro|FRI': 1, 'Kurashev Philipp|LHC': 1 }), query: '', current: null,
  data: first, user: local.get('tc-user', {}), cash: (local.get('tc-squad', null) || {}).cash ?? -1770000, market: local.get('tc-market', {}),
  pos: 'S', team: '', mine: false, sortKey: 'pts', sortDir: -1, shown: 25,
  message: '', messageKind: '', cloud: false, ai: false, aiMode: '', needsCode: false, hasCode: !!local.get('tc-code', '')
})

export const ctx = computed(() => buildContext(state.data))
const rated0 = computed(() => ctx.value.players.map((p) => ({ p, r: rate(p, ctx.value, state.user), fc: forecast(p, ctx.value, state.user) })))
export const rated = computed(() => { const vm = buildValueModel(rated0.value, ctx.value, state.user); return rated0.value.map((x) => ({ ...x, w: vm(x) })) })
const ratedById = computed(() => { const m = {}; rated.value.forEach((x) => (m[x.p.id] = x)); return m })
const byScore = computed(() => rated.value.slice().sort((a, b) => b.r.score - a.r.score))
export const mySquad = computed(() => byScore.value.filter((x) => MY_SQUAD[x.p.id]))
export const hotList = computed(() => rated.value.filter((x) => x.fc.type === 'S').sort((a, b) => b.fc.next.pts - a.fc.next.pts).slice(0, 10))
export const buyList = computed(() => rated.value.filter((x) => x.w.avg != null && !MY_SQUAD[x.p.id] && !x.fc.inj && x.p.gp >= 8 && x.p.pos !== 'G').sort((a, b) => b.w.avg - a.w.avg).slice(0, 10))
export const sellList = computed(() => rated.value.filter((x) => MY_SQUAD[x.p.id] && x.w.call === 'sell').sort((a, b) => (b.w.mv - b.w.max) - (a.w.mv - a.w.max)))
export const current = computed(() => (state.current && ratedById.value[state.current]) || null)
export const hits = computed(() => {
  const v = state.query.trim().toLowerCase()
  if (v.length < 2) return []
  const words = v.split(/\s+/)
  return ctx.value.players.filter((p) => { const n = p.name.toLowerCase(); return words.every((w) => n.includes(w)) })
})
export const stand = computed(() => chDate(state.data.date))

export function openPlayer(id) {
  state.current = id
  state.tab = 'spieler'
  state.query = ''
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' })
}
export function closePlayer() { state.current = null }

// Speichern: immer auf dem Gerät, zusätzlich in der Datenbank der Seite, wenn die App im Claude-Chat läuft.
let db = null
let writing = Promise.resolve()
function persist(doc, key, value) {
  local.set(key, value)
  if (!db) return Promise.resolve(false)
  writing = writing
    .then(() => db.doc('state/' + doc).set({ json: JSON.stringify(value), saved: new Date().toISOString() }))
    .then(() => true, () => false)
  return writing
}

let sample = null
async function connectAI() {
  try { sample = await (window.claude && window.claude.use ? window.claude.use('sample') : null) } catch (e) { sample = null }
  if (sample) { state.ai = true; state.aiMode = 'claude'; return }
  try {
    const r = await fetch('/api/status')
    const j = r.ok ? await r.json() : null
    if (j && j.ai) { state.ai = true; state.aiMode = 'server'; state.needsCode = !!j.needsCode }
  } catch (e) { /* kein Server dahinter, die KI bleibt versteckt */ }
}
export function setCode(c) { local.set('tc-code', c.trim()); state.hasCode = !!c.trim() }

export async function connectCloud() {
  connectAI()
  try { db = await (window.claude && window.claude.use ? window.claude.use('db') : null) } catch (e) { db = null }
  if (!db) return
  state.cloud = true
  try {
    const [a, b] = await Promise.all([db.doc('state/stats').get(), db.doc('state/entries').get()])
    if (a.exists) { const d = JSON.parse(a.data().json); if (d && d.sk && d.go && d.date > state.data.date) state.data = d }
    const kp = await db.doc('state/keep').get()
    if (kp.exists) { const m = JSON.parse(kp.data().json); if (m && typeof m === 'object') state.keep = m }
    const mk = await db.doc('state/market').get()
    if (mk.exists) { const m = JSON.parse(mk.data().json); if (m && typeof m === 'object') state.market = m }
    const c = await db.doc('state/squad').get()
    if (c.exists) { const q = JSON.parse(c.data().json); if (q && q.squad) { applySquad(q.squad); state.cash = q.cash ?? state.cash } }
    if (b.exists) { const u = JSON.parse(b.data().json); if (u && typeof u === 'object') state.user = u }
  } catch (e) { /* ohne Datenbank läuft die App mit den Gerätedaten weiter */ }
}

export function saveOwnValues(id, values) {
  const next = Object.assign({}, state.user)
  if (Object.keys(values).length) next[id] = values
  else delete next[id]
  state.user = next
  persist('entries', 'tc-user', next)
}

export async function importFiles(files) {
  const say = (text, kind) => { state.message = text; state.messageKind = kind }
  say('Lese die Dateien ein …', '')
  try {
    let sk = []
    let go = []
    let date = iso(new Date())
    for (const f of files) {
      const r = await readExport(f)
      if (r.sk.length > sk.length) sk = r.sk
      if (r.go.length > go.length) go = r.go
      const m = /(20\d{2})(\d{2})(\d{2})\d{6}/.exec(f.name)
      if (m) date = m[1] + '-' + m[2] + '-' + m[3]
    }
    const okS = sk.length >= 200
    const okG = go.length >= 15
    if (!okS && !okG) { say('In diesen Dateien habe ich keine Statistik von sihf.ch gefunden. Bitte den Export der Spieler- oder Goaliestatistiken (Ansicht «Summary») wählen.', 'err'); return }
    state.data = mergeStatistics(state.data, { sk, go }, date)
    const saved = await persist('stats', 'tc-stats', state.data)
    say(
      (okS ? sk.length + ' Feldspieler' : '') + (okS && okG ? ' und ' : '') + (okG ? go.length + ' Torhüter' : '') + ' eingelesen, Stand ' + chDate(date) + '.' +
      (okS && okG ? '' : ' Die ' + (okS ? 'Torhüter' : 'Feldspieler') + ' bleiben auf dem alten Stand.') +
      (db && !saved ? ' Das Speichern in der App hat nicht geklappt, die Daten gelten nur auf diesem Gerät.' : ''),
      'ok'
    )
  } catch (e) {
    say('Die Datei liess sich nicht lesen. Bitte nochmals exportieren und erneut versuchen.', 'err')
  }
}

function saveSquad() { persist('squad', 'tc-squad', { squad: JSON.parse(JSON.stringify(MY_SQUAD)), cash: state.cash }) }
export function setCash(v) { state.cash = v === '' || v == null || isNaN(v) ? null : Math.round(+v); saveSquad() }
export function buyPlayer(id, price) {
  const x = ratedById.value[id]
  if (!x || MY_SQUAD[id]) return
  const known = x.r.f.avg
  MY_SQUAD[id] = [known ?? null, price, '', 1, 0]
  if (state.cash != null) state.cash -= price
  saveSquad()
}
export function sellPlayer(id) {
  const m = MY_SQUAD[id]
  if (!m) return
  if (state.cash != null) state.cash += m[1] || 0
  delete MY_SQUAD[id]
  saveSquad()
}
// Ersatz: gleiche Position, nicht im Kader, nicht verletzt, höchstens zum Preis des Spielers
export function replacementsFor(id) {
  const x = ratedById.value[id]
  if (!x) return []
  const cap = x.w.mv || x.w.max
  const ok = rated.value.filter((y) => y.p.pos === x.p.pos && y.p.id !== id && !MY_SQUAD[y.p.id] && !y.fc.inj && y.p.gp >= 8)
  if (x.p.pos === 'G') return ok.sort((a, b) => b.r.score - a.r.score).slice(0, 4)
  const cheap = ok.filter((y) => y.w.max != null && y.w.max <= cap * 1.05)
  return cheap.sort((a, b) => b.w.avg - a.w.avg).slice(0, 4)
}

// ---- KI: bekommt deinen Kader und die Zahlen dieser App als Grundlage ----
const k = (n) => (n == null ? '?' : Math.round(n / 1000) + 'k')
const line = (x) => {
  const p = x.p
  const stat = p.pos === 'G' ? p.gp + ' Einsätze, ' + p.sv.toFixed(1) + '% Fangquote, ' + p.gaa.toFixed(2) + ' GA/Spiel' : p.gp + ' Spiele, ' + p.g + ' Tore, ' + p.a + ' Assists, ' + p.pm + ' +/-'
  const fc = x.fc.inj ? 'verletzt: ' + x.fc.inj : x.fc.type === 'G' ? 'erwartet ' + x.fc.next.ga.toFixed(1) + ' Gegentore/Einsatz' : x.fc.next.pts.toFixed(1) + ' Punkte in ' + x.fc.n + ' Spielen erwartet'
  const w = x.w.max != null ? 'Höchstpreis ' + k(x.w.max) + (x.w.mv ? ', Preis im Spiel ' + k(x.w.mv) : '') + ', Ø ' + x.w.avg + (x.w.est ? ' (geschätzt)' : '') : 'ohne Preis-Schätzung'
  return '- ' + p.name + ' (' + p.pos + ', ' + p.team + '): ' + stat + '; Note ' + x.r.score + '; ' + fc + '; ' + w
}
function aiData(playerId) {
  const mine = mySquad.value.map(line).join('\n')
  const pool = rated.value.filter((x) => x.w.avg != null && !MY_SQUAD[x.p.id] && !x.fc.inj && x.p.gp >= 8 && x.p.pos !== 'G').sort((a, b) => b.w.avg - a.w.avg).slice(0, 25).map(line).join('\n')
  const goalies = rated.value.filter((x) => x.p.pos === 'G' && !MY_SQUAD[x.p.id] && x.p.gp >= 6).sort((a, b) => b.r.score - a.r.score).slice(0, 5).map(line).join('\n')
  let focus = ''
  if (playerId && ratedById.value[playerId]) {
    const x = ratedById.value[playerId]
    focus = '\nDer Spieler, um den es geht:\n' + line(x) + '\nPlus: ' + x.r.plus.join('; ') + '\nMinus: ' + x.r.minus.join('; ') + '\nErsatz-Kandidaten:\n' + replacementsFor(playerId).map(line).join('\n')
  }
  const mk = marketList.value.length ? '\nHEUTE AUF DEM TRANSFERMARKT (nur diese sind kaufbar):\n' + marketList.value.map((x) => line(x) + '; Marktwert ' + k(x.price)).join('\n') : ''
  return 'Statistik-Stand: ' + chDate(state.data.date) + '. Kontostand im Spiel: ' + (state.cash == null ? 'unbekannt' : state.cash) + '.\nDEIN KADER:\n' + mine + '\nBESTE FELDSPIELER ZUM KAUFEN (nicht im Kader):\n' + pool + '\nGOALIES ZUM KAUFEN:\n' + goalies + mk + focus
}
async function serverAsk(prompt, images) {
  const r = await fetch('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, images, code: local.get('tc-code', '') }) })
  if (r.status === 401) { state.hasCode = false; throw { code: 'bad_code' } }
  if (r.status === 429) throw { code: 'rate_limited' }
  if (!r.ok) throw new Error('api')
  return (await r.json()).text
}
async function shrink(file) {
  const bmp = await createImageBitmap(file)
  const f = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * f); c.height = Math.round(bmp.height * f)
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
  return { type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.82).split(',')[1] }
}
export async function askAI(question, playerId, onText) {
  const prompt = RULES + '\n\n' + 'Du hilfst einem Schweizer Fan beim Fantasy-Spiel «Topscorer» zur National League 2026/27. Antworte auf Deutsch (Schweizer Rechtschreibung, kein ß), kurz (höchstens 150 Wörter), ohne Markdown-Zeichen, mit klaren Namen und Zahlen. Stütze dich nur auf die Daten unten. Der Höchstpreis ist eine Schätzung aus dem Spiel-Schnitt. Wenn etwas fehlt oder unsicher ist, sag es offen. Gib keine Garantien.\n\n' + aiData(playerId) + '\n\nFRAGE: ' + question
  if (state.aiMode === 'server') return serverAsk(prompt)
  const r = await sample(prompt, { onText: ({ text }) => onText && onText(text), modelTier: 'default', cache: false })
  return r.text
}

// ---- Transfermarkt: nur diese Spieler kannst du heute wirklich ersteigern ----
export function addMarket(id, price) { state.market = { ...state.market, [id]: Math.round(+price) || 0 }; persist('market', 'tc-market', state.market) }
export function removeMarket(id) { const m = { ...state.market }; delete m[id]; state.market = m; persist('market', 'tc-market', m) }
export function clearMarket() { state.market = {}; persist('market', 'tc-market', {}) }
export const marketList = computed(() => Object.keys(state.market).map((id) => ratedById.value[id] && { ...ratedById.value[id], price: state.market[id] || ratedById.value[id].w.mv || 0 }).filter(Boolean)
  .sort((a, b) => ((b.w.max ?? 0) - (b.price || 0)) - ((a.w.max ?? 0) - (a.price || 0))))
export const importsInLineup = computed(() => Object.values(MY_SQUAD).filter((m) => m[3] === 1 && m[4] === 1).length)

const RULES = 'Regeln: Pro Spiel zählen Tor (Stürmer 60, Verteidiger 70, Goalie 100), Assist (40/50/55), Schuss aufs Tor 5, geblockter Schuss 10, Plus/Minus ±5, Strafen minus, Goalie-Paraden 4, Shutout 40, Eiszeit 1 pro Minute. Jeder Punkt bringt 50 Franken. Gebote auf dem Transfermarkt müssen mindestens dem Marktwert entsprechen, der Höchstbietende gewinnt, täglich sind nur 14 Spieler verfügbar. Das Konto darf bei Spielbeginn nicht im Minus sein, sonst gibt es an dem Spieltag keine Punkte. Aufstellung: 1 Goalie, 6 Verteidiger, 9 Stürmer, höchstens 6 Imports.'

// ---- Ansicht «Heute» und «Markt» ----
export const ownedRated = computed(() => rated.value.filter((x) => MY_SQUAD[x.p.id]))
export const week = computed(() => weekGames(ctx.value.today))
export const days = computed(() => matchDays(ctx.value.today))
export const activeDay = computed(() => (days.value.includes(state.day) ? state.day : days.value[0] || ''))
export const todayLineup = computed(() => lineup(ownedRated.value, activeDay.value || null))
export const baseLineup = computed(() => lineup(ownedRated.value))
export const plan = computed(() => (state.cash != null && state.cash < 0 ? sellPlan(ownedRated.value, state.keep, -state.cash) : null))
export function toggleKeep(id) { const m = { ...state.keep }; if (m[id]) delete m[id]; else m[id] = 1; state.keep = m; persist('keep', 'tc-keep', m) }
export function executePlan() { if (plan.value) plan.value.sold.map((x) => x.p.id).forEach((id) => sellPlayer(id)) }

// ---- Screenshot lesen (nur in der Claude-Version) ----
function shotPrompt(mode) {
  const what = mode === 'market'
    ? 'Das Bild zeigt den Transfermarkt der Fantasy-App Topscorer. Lies jeden Spieler mit Vorname Nachname und Marktwert in Franken ab.'
    : 'Das Bild zeigt den Kader der Fantasy-App Topscorer. Lies jeden Spieler mit Vorname Nachname, Marktwert in Franken und Punkteschnitt (Ø) ab.'
  return what + ' Antworte NUR mit einem JSON-Array, ohne Text davor oder danach, in der Form [{"name":"Vorname Nachname","value":123456,"avg":85}]. value ist eine ganze Zahl in Franken ohne Hochkomma. avg weglassen, wenn nicht sichtbar. Erfinde nichts, lass unlesbare Spieler weg.'
}
export async function readShot(file, mode) {
  if (!sample && state.aiMode !== 'server') throw { code: 'no_ai' }
  if (state.aiMode === 'server') {
    return parseShotRows(await serverAsk(shotPrompt(mode), [await shrink(file)]))
  }
  try { const lim = sample.limits ? await sample.limits() : null; if (lim && lim.images === false) throw { code: 'no_images' } } catch (e) { if (e && e.code === 'no_images') throw e }
  const prompt = shotPrompt(mode)
  const r = await sample(prompt, { images: [file], modelTier: 'default', cache: false })
  return parseShotRows(r.text)
}
export function applyShot(mode, rows) {
  const done = []
  const miss = []
  rows.forEach((row) => {
    const p = matchName(row.name, ctx.value.players)
    const v = money(row.value)
    if (!p || !v) { miss.push(row.name); return }
    if (mode === 'market') { state.market = { ...state.market, [p.id]: v }; done.push(p.name); return }
    if (!MY_SQUAD[p.id]) { miss.push(row.name + ' (nicht in deinem Kader)'); return }
    const old = state.user[p.id] || {}
    const vals = { ...old, mv: v }
    if (row.avg != null && !isNaN(row.avg)) vals.avg = Math.round(+row.avg)
    state.user = { ...state.user, [p.id]: vals }
    done.push(p.name)
  })
  if (mode === 'market') persist('market', 'tc-market', state.market)
  else persist('entries', 'tc-user', state.user)
  return { done, miss }
}
