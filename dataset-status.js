import fs from 'node:fs'
import path from 'node:path'

export function summarizeDataset(dataset, now = new Date()) {
  const date = dataset?.date
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid dataset date')
  const midnight = new Date(date + 'T00:00:00Z')
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== date) throw new Error('Invalid calendar date')
  const ageDays = Math.floor((now.getTime() - midnight.getTime()) / 86400000)
  const skaters = Array.isArray(dataset.sk) ? dataset.sk.length : 0
  const goalies = Array.isArray(dataset.go) ? dataset.go.length : 0
  return { date, ageDays, stale: ageDays > 2, futureDated: ageDays < 0, skaters, goalies }
}

export function readDatasetStatus(root, now = new Date()) {
  const file = path.join(root, 'stats.json')
  const dataset = JSON.parse(fs.readFileSync(file, 'utf8'))
  return summarizeDataset(dataset, now)
}
