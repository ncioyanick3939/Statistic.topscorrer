// Gemeinsamer Zustand der App: Daten, Auswahl, Filter. Alle Komponenten lesen von hier.
import { reactive, computed } from 'vue'
import baseData from './stats.json'
import { MY_SQUAD } from './data.js'
import { buildContext, rate, forecast, iso, chDate } from './model.js'
import { readExport } from './importers.js'

const local = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch (e) { return fallback } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) { /* Speicher gesperrt */ } }
}

let first = baseData
{
  const saved = local.get('tc-stats', null)
  if (saved && saved.date > first.date && saved.sk && saved.go) first = saved
}

export const state = reactive({
  tab: 'spieler', query: '', current: null,
  data: first, user: local.get('tc-user', {}),
  pos: 'S', team: '', mine: false, sortKey: 'pts', sortDir: -1, shown: 25,
  message: '', messageKind: '', cloud: false
})

export const ctx = computed(() => buildContext(state.data))
export const rated = computed(() => ctx.value.players.map((p) => ({ p, r: rate(p, ctx.value, state.user), fc: forecast(p, ctx.value, state.user) })))
const ratedById = computed(() => { const m = {}; rated.value.forEach((x) => (m[x.p.id] = x)); return m })
const byScore = computed(() => rated.value.slice().sort((a, b) => b.r.score - a.r.score))
export const mySquad = computed(() => byScore.value.filter((x) => MY_SQUAD[x.p.id]))
export const hotList = computed(() => rated.value.filter((x) => x.fc.type === 'S').sort((a, b) => b.fc.next.pts - a.fc.next.pts).slice(0, 10))
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

export async function connectCloud() {
  try { db = await (window.claude && window.claude.use ? window.claude.use('db') : null) } catch (e) { db = null }
  if (!db) return
  state.cloud = true
  try {
    const [a, b] = await Promise.all([db.doc('state/stats').get(), db.doc('state/entries').get()])
    if (a.exists) { const d = JSON.parse(a.data().json); if (d && d.sk && d.go && d.date > state.data.date) state.data = d }
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
    state.data = { date, sk: okS ? sk : state.data.sk, go: okG ? go : state.data.go }
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
