// Namen und Werte aus einem Screenshot den Spielern der Statistik zuordnen.
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z\s-]/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean)

export function matchName(name, players) {
  const t = norm(name)
  if (!t.length) return null
  const fits = players.filter((p) => {
    const pt = norm(p.name)
    return t.every((x) => pt.some((y) => y === x || (x.length === 1 && y.startsWith(x))))
  })
  if (fits.length === 1) return fits[0]
  const exact = fits.filter((p) => norm(p.name).length === t.length)
  return exact.length === 1 ? exact[0] : null
}

export function money(v) {
  if (typeof v === 'number') return Math.round(v)
  const s = String(v).toLowerCase().replace(/[’'\s]/g, '').replace(',', '.')
  const m = /([\d.]+)(k|mio|m)?/.exec(s)
  if (!m) return null
  const n = parseFloat(m[1])
  return Math.round(m[2] === 'k' ? n * 1000 : m[2] ? n * 1e6 : n)
}

export function parseRows(text) {
  const a = text.indexOf('[')
  const b = text.lastIndexOf(']')
  if (a < 0 || b < a) return []
  try { return JSON.parse(text.slice(a, b + 1)).filter((r) => r && typeof r.name === 'string') } catch (e) { return [] }
}
