// Zahlen so schreiben, wie man sie in der Schweiz liest: 1'234'567
export const fmt = (n) => (n < 0 ? '−' : '') + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
export const k = (n) => (n == null ? '–' : Math.round(n / 1000) + 'k')
export const mio = (n) => (Math.abs(n) >= 1e6 ? (n < 0 ? '−' : '') + (Math.abs(n) / 1e6).toFixed(2) + ' Mio.' : fmt(n))
export const surname = (name) => name.split(' ')[0]
