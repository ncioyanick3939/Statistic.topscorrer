import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeStatistics, sectionFreshness, validIsoDate } from '../statistics-merge.js'

const previous = { date: '2026-11-01', sk: ['old skater'], go: ['old goalie'] }
test('skater-only update does not mark old goalies as fresh', () => {
  const result = mergeStatistics(previous, { sk: Array(201).fill('skater'), go: [] }, '2026-11-10')
  assert.equal(result.date, '2026-11-01')
  assert.deepEqual(result.dates, { sk: '2026-11-10', go: '2026-11-01' })
  assert.equal(result.go[0], 'old goalie')
  const sections = sectionFreshness(result, new Date('2026-11-10T12:00:00Z'))
  assert.equal(sections[0].stale, false)
  assert.equal(sections[1].stale, true)
})
test('both valid categories refresh together', () => {
  const result = mergeStatistics(previous, { sk: Array(200).fill('s'), go: Array(15).fill('g') }, '2026-11-10')
  assert.equal(result.date, '2026-11-10')
  assert.equal(sectionFreshness(result, new Date('2026-11-10T12:00:00Z')).every(x => !x.stale), true)
})
test('invalid imports are rejected', () => {
  assert.throws(() => mergeStatistics(previous, { sk: [], go: [] }, '2026-11-10'))
  assert.throws(() => mergeStatistics(previous, { sk: Array(200).fill('s') }, 'bad-date'))
})

test('date validation rejects calendar rollover and accepts leap day', () => {
  assert.equal(validIsoDate('2026-02-29'), false)
  assert.equal(validIsoDate('2026-13-01'), false)
  assert.equal(validIsoDate('2026-11-31'), false)
  assert.equal(validIsoDate('2024-02-29'), true)
  assert.equal(validIsoDate('2026-11-10'), true)
  assert.throws(() => mergeStatistics(previous, { sk: Array(200).fill('s') }, '2026-02-29'))
})
