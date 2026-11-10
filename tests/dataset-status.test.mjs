import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeDataset, readDatasetStatus } from '../dataset-status.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

test('data freshness flags stale snapshots without changing data', () => {
  const snapshot = { date: '2026-11-10', sk: [[1], [2]], go: [[3]] }
  assert.deepEqual(summarizeDataset(snapshot, new Date('2026-11-10T12:00:00Z')), {
    date: '2026-11-10', ageDays: 0, stale: false, futureDated: false, skaters: 2, goalies: 1
  })
  assert.equal(summarizeDataset(snapshot, new Date('2026-11-14T12:00:00Z')).stale, true)
  assert.equal(summarizeDataset(snapshot, new Date('2026-11-09T12:00:00Z')).futureDated, true)
})
test('invalid calendar dates are rejected', () => {
  assert.throws(() => summarizeDataset({ date: '2026-02-30' }), /Invalid/)
  assert.throws(() => summarizeDataset({ date: 'unknown' }), /Invalid/)
})
test('bundled snapshot has valid date and player counts', () => {
  const root = path.dirname(fileURLToPath(new URL('../server.js', import.meta.url)))
  const status = readDatasetStatus(root, new Date('2026-11-10T12:00:00Z'))
  assert.ok(status.skaters > 100)
  assert.equal(status.date, '2026-11-10')
})
