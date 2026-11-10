// Die ganze Rechnung: aus der Statistik werden Note, Urteil und Prognose.
// Keine Anzeige in dieser Datei, nur Zahlen rein und Ergebnis raus.
import { TEAMS, SCHEDULE, SCHEDULE_END, SEASON_GAMES, MY_SQUAD, INJURED, NOTES } from './data.js'

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))
const num = (v) => (v === '' || v == null || isNaN(v) ? null : +v)
export const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
export const chDate = (s) => s.slice(8, 10) + '.' + s.slice(5, 7) + '.' + s.slice(0, 4)
const WEEKDAY = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const dayLabel = (s) => WEEKDAY[new Date(s + 'T12:00:00').getDay()] + ' ' + s.slice(8, 10) + '.' + s.slice(5, 7) + '.'

// Bereitet die Rohdaten auf: Spieler, Teamwerte, Liga-Durchschnitte, kommende Spiele.
export function buildContext(data, now = new Date()) {
  const players = data.sk
    .map((a) => ({ id: a[0] + '|' + a[1], name: a[0], team: a[1], pos: a[2], gp: a[3], g: a[4], a: a[5], pm: a[6], pim: a[7] ?? 0 }))
    .concat(data.go.map((a) => ({ id: a[0] + '|' + a[1], name: a[0], team: a[1], pos: 'G', gp: a[3], gaa: a[4], sv: a[5], ga: a[6] || 0 })))
  const today = iso(now)
  const windowEnd = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 11))

  const teams = {}
  Object.keys(TEAMS).forEach((k) => (teams[k] = { gp: 1, gf: 0, ga: 0, games: 0, fixtures: [] }))
  const league = { F: { g: 0, a: 0, gp: 0 }, D: { g: 0, a: 0, gp: 0 }, saves: 0, shots: 0 }
  players.forEach((p) => {
    const t = teams[p.team]
    if (!t) return
    if (p.pos === 'G') {
      t.ga += p.ga
      const shots = p.sv < 100 ? p.ga / (1 - p.sv / 100) : 0
      p.shots = shots
      league.shots += shots
      league.saves += shots - p.ga
    } else {
      t.gf += p.g
      if (p.gp > t.gp) t.gp = p.gp
      const l = league[p.pos]
      l.g += p.g; l.a += p.a; l.gp += p.gp
    }
  })
  Object.keys(SCHEDULE).sort().forEach((d) => {
    if (d < today) return
    SCHEDULE[d].split(' ').forEach((m) => {
      const [home, away] = m.split('-')
      if (teams[home]) teams[home].fixtures.push({ date: d, opp: away, home: true })
      if (teams[away]) teams[away].fixtures.push({ date: d, opp: home, home: false })
      if (d <= windowEnd) { if (teams[home]) teams[home].games++; if (teams[away]) teams[away].games++ }
    })
  })
  const list = Object.values(teams)
  list.forEach((t) => { t.gd = (t.gf - t.ga) / t.gp; t.gfPg = t.gf / t.gp; t.gaPg = t.ga / t.gp })
  league.gfPg = list.reduce((s, t) => s + t.gfPg, 0) / list.length
  league.gaPg = list.reduce((s, t) => s + t.gaPg, 0) / list.length
  league.sv = league.shots ? league.saves / league.shots : 0.905
  ;['F', 'D'].forEach((k) => { const l = league[k]; l.gRate = l.gp ? l.g / l.gp : 0; l.aRate = l.gp ? l.a / l.gp : 0 })

  const by = {}
  players.forEach((p) => (by[p.id] = p))
  return {
    players, by, teams, league, today, windowEnd,
    scheduleOk: windowEnd <= SCHEDULE_END,
    till: windowEnd.slice(8, 10) + '.' + windowEnd.slice(5, 7) + '.'
  }
}

// Werte aus dem Topscorer-Spiel: eigene Eingabe geht vor Screenshot.
export function fantasy(p, user) {
  const m = MY_SQUAD[p.id]
  const u = user[p.id] || {}
  return {
    avg: num(u.avg) ?? (m ? m[0] : null), mv: num(u.mv) ?? (m ? m[1] : null), trend: u.trend || (m ? m[2] : ''),
    toi: num(u.toi), mine: !!m, lineup: m ? m[3] : null, imp: m ? m[4] : 0
  }
}

export function injury(p, ctx) {
  const i = INJURED[p.id]
  return i && ctx.today <= i[1] ? i[0] : null
}

// Prognose: nächste Spiele und Hochrechnung bis Saisonende.
export function forecast(p, ctx, user) {
  const t = ctx.teams[p.team]
  const f = fantasy(p, user)
  const inj = injury(p, ctx)
  const fixtures = t.fixtures.slice(0, 5)
  const remaining = Math.max(0, SEASON_GAMES - t.gp)
  // Einsatzquote, leicht zur Mitte gezogen, damit wenige Spiele nicht alles bestimmen
  const share = clamp((p.gp + 3) / (t.gp + 3))
  const missed = inj ? Math.min(remaining, 8) : 0

  if (p.pos === 'G') {
    const PRIOR = 400 // Schüsse zum Liga-Schnitt, die jedem Goalie "vorgegeben" werden
    const sv = (p.shots - p.ga + PRIOR * ctx.league.sv) / (p.shots + PRIOR)
    const shotsPg = p.gp ? p.shots / p.gp : 28
    const games = fixtures.map((x) => {
      const k = clamp(ctx.teams[x.opp].gfPg / ctx.league.gfPg, 0.75, 1.3)
      return { ...x, label: dayLabel(x.date), factor: k, ga: shotsPg * (1 - sv) * k, start: inj ? 0 : share }
    })
    const starts = games.reduce((s, x) => s + x.start, 0)
    const gaAvg = games.length ? games.reduce((s, x) => s + x.ga, 0) / games.length : shotsPg * (1 - sv)
    const seasonGp = p.gp + share * (remaining - missed)
    return {
      type: 'G', games, n: games.length, inj,
      next: { starts, ga: gaAvg, sv: sv * 100 },
      season: { gp: Math.round(seasonGp), sv: sv * 100, gaa: shotsPg * (1 - sv) },
      fantasyNext: f.avg != null ? f.avg * starts : null
    }
  }

  const PRIOR = 8 // Spiele zum Liga-Schnitt der Position, gegen Zufall bei wenigen Spielen
  const l = ctx.league[p.pos]
  const gRate = (p.g + PRIOR * l.gRate) / (p.gp + PRIOR)
  const aRate = (p.a + PRIOR * l.aRate) / (p.gp + PRIOR)
  const games = fixtures.map((x) => {
    // Gegner mit vielen Gegentoren und Heimspiele heben die Erwartung
    const k = (inj ? 0 : 1) * clamp(ctx.teams[x.opp].gaPg / ctx.league.gaPg, 0.75, 1.3) * (x.home ? 1.05 : 0.95)
    return { ...x, label: dayLabel(x.date), factor: k, g: gRate * k, a: aRate * k, pts: (gRate + aRate) * k, fp: gRate * k * (p.pos === 'D' ? 70 : 60) + aRate * k * 40, pGoal: 1 - Math.exp(-gRate * k), pPoint: 1 - Math.exp(-(gRate + aRate) * k) }
  })
  const sum = (key) => games.reduce((s, x) => s + x[key], 0)
  const playGames = share * (remaining - missed)
  const addPts = (gRate + aRate) * playGames
  const spread = 1.28 * Math.sqrt(addPts) // rund 80 Prozent der Fälle liegen in diesem Bereich
  const pts = p.g + p.a
  return {
    type: 'S', games, n: games.length, inj, gRate, aRate,
    next: { g: sum('g'), a: sum('a'), pts: sum('pts'), fp: sum('fp') },
    rawPg: p.gp ? (p.g + p.a) / p.gp : 0, expPg: gRate + aRate,
    season: {
      g: Math.round(p.g + gRate * playGames), a: Math.round(p.a + aRate * playGames), pts: Math.round(pts + addPts),
      lo: Math.round(pts + Math.max(0, addPts - spread)), hi: Math.round(pts + addPts + spread),
      gp: Math.round(p.gp + playGames), pim: Math.round(p.pim + (p.gp ? p.pim / p.gp : 0) * playGames)
    },
    fantasyNext: f.avg != null ? f.avg * sum('factor') : null
  }
}

// Note von 0 bis 100 mit Begründung.
export function rate(p, ctx, user) {
  const t = ctx.teams[p.team]
  const f = fantasy(p, user)
  const parts = []
  const plus = []
  const minus = []
  const share = p.gp / t.gp
  const till = ctx.till
  const add = (name, weight, x, shown = '') => parts.push([name, weight, clamp(x), shown])
  let level
  if (p.pos === 'G') {
    add('Fangquote', 45, (p.sv - 87) / 6.3, p.sv.toFixed(1) + ' %')
    add('Gegentore pro Spiel', 15, (3.6 - p.gaa) / 1.7, p.gaa.toFixed(2))
    add('Einsätze', 10, share / 0.7, p.gp + ' von ' + t.gp + ' Spielen')
    level = clamp((p.sv - 87) / 6.3)
    if (p.sv >= 92) plus.push('Starke Fangquote (' + p.sv.toFixed(1) + '%)')
    else if (p.sv <= 89) minus.push('Schwache Fangquote (' + p.sv.toFixed(1) + '%)')
    if (share >= 0.6) plus.push('Stammgoalie (' + p.gp + ' von ' + t.gp + ' Spielen)')
    else if (share <= 0.4) minus.push('Selten im Einsatz (' + p.gp + ' von ' + t.gp + ' Spielen)')
  } else {
    const gp = Math.max(1, p.gp)
    const pg = (p.g + p.a) / gp
    const gg = p.g / gp
    const pmg = p.pm / gp
    const F = p.pos === 'F'
    add('Punkte pro Spiel', 40, pg / (F ? 1.1 : 0.75), pg.toFixed(2) + ' (' + (p.g + p.a) + ' in ' + p.gp + ')')
    add('Tore pro Spiel', 12, gg / (F ? 0.5 : 0.2), gg.toFixed(2) + ' (' + p.g + ' Tore)')
    add('Plus/Minus', 8, pmg + 0.5, (p.pm > 0 ? '+' : '') + p.pm)
    add('Einsätze', 8, share, p.gp + ' von ' + t.gp + ' Spielen')
    level = clamp(pg / (F ? 1.1 : 0.75))
    if (pg >= (F ? 0.9 : 0.6)) plus.push(pg.toFixed(2) + ' Skorerpunkte pro Spiel')
    else if (pg <= (F ? 0.3 : 0.15)) minus.push('Skort kaum (' + (p.g + p.a) + ' Punkte in ' + p.gp + ' Spielen)')
    if (gg >= (F ? 0.4 : 0.2)) plus.push('Torgefährlich (' + p.g + ' Tore in ' + p.gp + ' Spielen)')
    if (pmg >= 0.4) plus.push('Starke Plus/Minus-Bilanz (+' + p.pm + ')')
    else if (pmg <= -0.4) minus.push('Schwache Plus/Minus-Bilanz (' + p.pm + ')')
    if (share < 0.6) minus.push('Nur ' + p.gp + ' von ' + t.gp + ' Spielen bestritten')
  }
  add('Teamstärke', 10, (t.gd + 1.4) / 3.2, 'Tordifferenz ' + (t.gd > 0 ? '+' : '') + t.gd.toFixed(1) + ' pro Spiel')
  if (t.gd >= 0.8) plus.push('Starkes Team')
  else if (t.gd <= -0.5) minus.push('Schwaches Team')
  if (ctx.scheduleOk) {
    add('Spielplan', 10, (t.games - 2) / 4, t.games + ' Spiele bis ' + till)
    if (t.games >= 5) plus.push(t.games + ' Spiele bis ' + till)
    else if (t.games <= 3) minus.push('Nur ' + t.games + ' Spiele bis ' + till)
  }
  let ratio = null
  if (f.avg != null) {
    add('Topscorer-Schnitt', 20, f.avg / 110, 'Ø ' + f.avg)
    if (f.avg >= 90) plus.push('Starker Topscorer-Schnitt (' + f.avg + ')')
    else if (f.avg <= 50) minus.push('Schwacher Topscorer-Schnitt (' + f.avg + ')')
  }
  if (f.avg != null && f.mv) {
    ratio = f.avg / (f.mv / 100000)
    add('Preis-Leistung', 12, (ratio - 10) / 18, ratio.toFixed(1) + ' Punkte pro 100’000')
    if (ratio >= 22) plus.push('Viele Punkte fürs Geld')
    else if (ratio <= 15) minus.push('Teuer für seine Punkte')
  }
  if (f.trend) {
    add('Marktwert-Trend', 5, f.trend === 'up' ? 1 : f.trend === 'down' ? 0 : 0.5, f.trend === 'up' ? 'steigt' : f.trend === 'down' ? 'fällt' : 'gleich')
    if (f.trend === 'up') plus.push('Marktwert steigt')
    if (f.trend === 'down') minus.push('Marktwert fällt')
  }
  if (f.toi != null && p.pos !== 'G') {
    const D = p.pos === 'D'
    add('Eiszeit', 10, D ? (f.toi - 14) / 9 : (f.toi - 10) / 9, f.toi + ' Min.')
    if (f.toi >= (D ? 20 : 16)) plus.push('Viel Eiszeit (' + f.toi + ' Min.)')
    else if (f.toi <= (D ? 16 : 12)) minus.push('Wenig Eiszeit (' + f.toi + ' Min.)')
  }
  const inj = injury(p, ctx)
  if (inj) minus.push('Verletzt')
  if (f.lineup === 0) minus.push('Sitzt bei dir auf der Bank')
  if (p.gp < 8) minus.push('Wenige Spiele, die Note ist unsicher')

  let score = Math.round((100 * parts.reduce((s, x) => s + x[1] * x[2], 0)) / parts.reduce((s, x) => s + x[1], 0))
  if (inj) score = Math.min(score, 25)

  let out
  if (inj) out = inj + ' In dieser Zeit holt er keine Punkte, und sein Marktwert dürfte fallen.'
  else if (p.pos === 'G') out = level >= 0.7 ? 'Er hält stark.' : level >= 0.4 ? 'Durchschnittliche Werte. Ob er sich lohnt, hängt davon ab, wie oft er spielt.' : 'Er kassiert viel. Ohne Besserung ist wenig zu erwarten.'
  else if (level >= 0.7) out = 'Er punktet regelmässig.'
  else if (level >= 0.35) out = 'Solide, aber kein Punktegarant.'
  else out = 'Er skort kaum. Ohne neue Rolle im Team ist wenig zu erwarten.'
  if (!inj && f.trend === 'up') out += ' Sein Marktwert steigt.'
  if (!inj && f.trend === 'down') out += ' Sein Marktwert fällt.'
  if (NOTES[p.id]) out += ' ' + NOTES[p.id]

  const cls = score >= 65 ? 'good' : score >= 45 ? 'mid' : 'bad'
  const verdict = score >= 65 ? 'Lohnt sich' : score >= 45 ? 'Beobachten' : 'Lohnt sich weniger'
  return { score, parts, plus, minus, out, cls, verdict, ratio, f }
}
