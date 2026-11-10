import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TEAMS, SCHEDULE, MY_SQUAD } from '../data.js'
import { buildContext, forecast, rate } from '../model.js'
import { lineup } from '../team.js'

const data = JSON.parse(readFileSync(new URL('../stats.json', import.meta.url), 'utf8'))
const now = new Date('2026-11-10T12:00:00')
const ctx = buildContext(data, now)

test('all scheduled team codes exist in the team catalogue', () => {
  for (const fixtures of Object.values(SCHEDULE)) {
    for (const fixture of fixtures.split(' ')) {
      const [home, away] = fixture.split('-')
      assert.ok(TEAMS[home], `unknown home team: ${home}`)
      assert.ok(TEAMS[away], `unknown away team: ${away}`)
    }
  }
})

test('statistics contain valid teams and player positions', () => {
  assert.ok(ctx.players.length > 100, 'expected a meaningful player dataset')
  for (const player of ctx.players) {
    assert.ok(TEAMS[player.team], `unknown team for ${player.name}`)
    assert.ok(['F', 'D', 'G'].includes(player.pos), `unknown position for ${player.name}`)
    assert.ok(Number.isFinite(player.gp) && player.gp >= 0, `invalid games played for ${player.name}`)
  }
})

test('ratings and forecasts stay finite for every imported player', () => {
  for (const player of ctx.players) {
    const rating = rate(player, ctx, {})
    const projection = forecast(player, ctx, {})
    assert.ok(Number.isFinite(rating.score), `invalid rating for ${player.name}`)
    assert.ok(rating.score >= 0 && rating.score <= 100, `rating outside 0–100 for ${player.name}`)
    if (projection.type === 'G') {
      assert.ok(Number.isFinite(projection.next.ga), `invalid goalie projection for ${player.name}`)
      assert.ok(Number.isFinite(projection.season.sv), `invalid goalie season projection for ${player.name}`)
    } else {
      assert.ok(Number.isFinite(projection.next.pts), `invalid skater projection for ${player.name}`)
      assert.ok(Number.isFinite(projection.season.pts), `invalid skater season projection for ${player.name}`)
    }
  }
})

test('lineup respects position slots and the import limit', () => {
  const squad = ctx.players
    .filter((player) => MY_SQUAD[player.id])
    .map((p) => ({ p, fc: forecast(p, ctx, {}), w: { avg: MY_SQUAD[p.id][0], mv: MY_SQUAD[p.id][1] } }))
  const result = lineup(squad)
  assert.ok(result.got.G.length <= 1)
  assert.ok(result.got.D.length <= 6)
  assert.ok(result.got.F.length <= 9)
  assert.ok(result.imports <= 6)
  assert.ok(Number.isFinite(result.total))
})
