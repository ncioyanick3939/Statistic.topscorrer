// Dein Team: Wer wird für einen Spieltag aufgestellt, und wen verkaufst du am besten?
import { SCHEDULE, MY_SQUAD } from './data.js'

export const SLOTS = { G: 1, D: 6, F: 9 }

export function matchDays(today, n = 4) {
  return Object.keys(SCHEDULE).sort().filter((d) => d >= today).slice(0, n)
}
export function gameOn(team, date) {
  const games = (SCHEDULE[date] || '').split(' ').filter(Boolean)
  for (const g of games) {
    const [home, away] = g.split('-')
    if (home === team) return { opp: away, home: true }
    if (away === team) return { opp: home, home: false }
  }
  return null
}
const isImport = (x) => MY_SQUAD[x.p.id] && MY_SQUAD[x.p.id][4] === 1

// Erwartete Punkte pro Spiel. Ohne Datum: allgemeine Stärke. Mit Datum: null Punkte, wenn sein Team nicht spielt.
export function value(x, date = null) {
  if (x.fc.inj) return 0
  const base = x.w.avg ?? (x.p.pos === 'G' ? 60 : 30)
  return date && !gameOn(x.p.team, date) ? 0 : base
}

// Beste Aufstellung: 1 Goalie, 6 Verteidiger, 9 Stürmer, höchstens 6 Imports.
export function lineup(list, date = null) {
  const got = { G: [], D: [], F: [] }
  const bench = []
  let imports = 0
  list.map((x) => ({ x, v: value(x, date) })).sort((a, b) => b.v - a.v || (isImport(a.x) ? 1 : 0) - (isImport(b.x) ? 1 : 0)).forEach((e) => {
    const pos = e.x.p.pos
    const imp = isImport(e.x)
    if (got[pos].length < SLOTS[pos] && !(imp && imports >= 6)) { got[pos].push(e); if (imp) imports++ } else bench.push(e)
  })
  const total = Object.values(got).flat().reduce((s, e) => s + e.v, 0)
  const missing = { G: SLOTS.G - got.G.length, D: SLOTS.D - got.D.length, F: SLOTS.F - got.F.length }
  return { got, bench, total, missing, imports, playing: Object.values(got).flat().filter((e) => e.v > 0).length }
}

// Verkaufsplan: Wer muss gehen, damit das Konto wieder im Plus ist und möglichst wenig Punkte verloren gehen?
export function sellPlan(list, keep, need) {
  const base = lineup(list).total
  const cand = list.filter((x) => !keep[x.p.id] && x.w.mv)
  let best = null
  const enough = (rest) => ['G', 'D', 'F'].every((p) => rest.filter((x) => x.p.pos === p).length >= SLOTS[p])
  function rec(i, chosen, sum) {
    if (sum >= need) {
      const rest = list.filter((x) => !chosen.includes(x))
      if (!enough(rest)) return
      const loss = base - lineup(rest).total
      const better = !best || loss < best.loss - 1e-9 || (Math.abs(loss - best.loss) < 1e-9 && (chosen.length < best.sold.length || (chosen.length === best.sold.length && sum > best.sum)))
      if (better) best = { sold: chosen.slice(), sum, loss }
      return
    }
    if (chosen.length >= 5) return
    for (let j = i; j < cand.length; j++) { chosen.push(cand[j]); rec(j + 1, chosen, sum + cand[j].w.mv); chosen.pop() }
  }
  rec(0, [], 0)
  return best
}
