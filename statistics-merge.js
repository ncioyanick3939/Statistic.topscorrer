// Preserve provenance when only one SIHF statistics category is refreshed.
export function validIsoDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const parsed = new Date(date + 'T00:00:00Z')
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}

export function mergeStatistics(previous, incoming, date) {
  const sk = Array.isArray(incoming.sk) && incoming.sk.length >= 200 ? incoming.sk : null
  const go = Array.isArray(incoming.go) && incoming.go.length >= 15 ? incoming.go : null
  if (!sk && !go) throw new Error('no_valid_statistics')
  if (!validIsoDate(date)) throw new Error('invalid_date')
  const prevDates = previous?.dates || {}
  const dates = {
    sk: sk ? date : prevDates.sk || previous.date,
    go: go ? date : prevDates.go || previous.date
  }
  // Keep the global date conservative: it represents the oldest category.
  return { date: dates.sk < dates.go ? dates.sk : dates.go,
    sk: sk || previous.sk, go: go || previous.go, dates }
}

export function sectionFreshness(data, now = new Date()) {
  return ['sk', 'go'].map(key => {
    const date = data?.dates?.[key] || data?.date
    const parsed = validIsoDate(date) ? Date.parse(date + 'T00:00:00Z') : NaN
    const age = Number.isFinite(parsed) ? Math.floor((now.getTime() - parsed) / 86400000) : null
    return { key, date, ageDays: age, stale: age === null || age < 0 || age > 2 }
  })
}
