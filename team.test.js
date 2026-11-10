// Regeltests: Aufstellung (1 G, 6 D, 9 F, höchstens 6 Imports) und Verkaufsplan
import test from 'node:test'
import assert from 'node:assert/strict'
import { MY_SQUAD } from './data.js'
import { lineup, sellPlan, SLOTS, weekGames } from './team.js'

const mk = (id, pos, avg, mv, imp = 0) => { MY_SQUAD[id] = [avg, mv, '', 1, imp]; return { p: { id, pos, team: 'ZSC' }, fc: {}, w: { avg, mv } } }
const squad = () => {
  Object.keys(MY_SQUAD).forEach((k) => delete MY_SQUAD[k])
  return [mk('g1', 'G', 80, 500000), ...Array.from({ length: 7 }, (_, i) => mk('d' + i, 'D', 60 - i, 200000 + i)), ...Array.from({ length: 10 }, (_, i) => mk('f' + i, 'F', 70 - i, 300000 + i))]
}

test('Aufstellung füllt 1 G, 6 D, 9 F', () => {
  const l = lineup(squad())
  assert.equal(l.got.G.length, SLOTS.G); assert.equal(l.got.D.length, SLOTS.D); assert.equal(l.got.F.length, SLOTS.F)
  assert.equal(l.bench.length, 2)
})
test('höchstens 6 Importspieler', () => {
  Object.keys(MY_SQUAD).forEach((k) => delete MY_SQUAD[k])
  const list = Array.from({ length: 9 }, (_, i) => mk('f' + i, 'F', 90 - i, 300000, 1))
  assert.equal(lineup(list).imports, 6)
})
test('leere Position wird gemeldet', () => {
  const l = lineup(squad().filter((x) => x.p.pos !== 'G'))
  assert.equal(l.missing.G, 1)
})
test('Verkaufsplan deckt das Minus und lässt Mindestbesetzung stehen', () => {
  const list = squad()
  const plan = sellPlan(list, {}, 250000)
  assert.ok(plan.sum >= 250000)
  const rest = list.filter((x) => !plan.sold.includes(x))
  assert.ok(rest.filter((x) => x.p.pos === 'G').length >= 1 && rest.filter((x) => x.p.pos === 'D').length >= 6 && rest.filter((x) => x.p.pos === 'F').length >= 9)
})
test('Spiele pro Team in 7 Tagen laut Spielplan', () => {
  const w = weekGames('2026-11-11')
  assert.equal(w.EVZ, 3)
  assert.equal(w.HCL, 3)
  assert.equal(w.ZSC, 2)
})
test('Wechsel von Hand: erzwungene Bank und erzwungenes Eis', () => {
  const list = squad()
  const best = lineup(list).got.F[0].x
  const weakest = list.filter((x) => x.p.pos === 'F').sort((a, b) => a.w.avg - b.w.avg)[0]
  const l = lineup(list, null, { [best.p.id]: 'bench', [weakest.p.id]: 'ice' })
  assert.ok(l.bench.some((e) => e.x === best))
  assert.ok(l.got.F.some((e) => e.x === weakest))
  assert.equal(l.got.F.length, 9)
})
