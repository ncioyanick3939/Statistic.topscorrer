// Liest den Export von sihf.ch ein (CSV oder PDF, Ansicht «Summary»).
import { EXPORT_TEAM } from './data.js'

export function parseCsv(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  const sk = []
  const go = []
  if (!lines.length) return { sk, go }
  const sep = lines[0].split(';').length >= lines[0].split(',').length ? ';' : ','
  const head = lines[0].split(sep).map((h) => h.trim().toLowerCase())
  const ix = (n) => head.indexOf(n)
  const iN = ix('spieler'), iT = ix('team'), iP = ix('pos'), iGP = ix('gp'), iG = ix('g'), iA = ix('a'), iPM = ix('+/-'), iPIM = ix('pim total')
  const iGPI = ix('gpi'), iGA = ix('ga'), iGAA = ix('gaa'), iSV = ix('svs%')
  lines.slice(1).forEach((l) => {
    const c = l.split(sep).map((x) => x.trim())
    const team = EXPORT_TEAM[c[iT]]
    if (!team || iN < 0) return
    if (iSV >= 0 && iGAA >= 0) go.push([c[iN], team, 'G', +c[iGPI >= 0 ? iGPI : iGP], +c[iGAA], +c[iSV], +c[iGA] || 0])
    else if (iP >= 0 && iG >= 0 && iA >= 0 && iPM >= 0) sk.push([c[iN], team, c[iP] === 'Stürmer' ? 'F' : 'D', +c[iGP], +c[iG], +c[iA], +c[iPM], iPIM >= 0 ? +c[iPIM] : 0])
  })
  const clean = (rows) => rows.filter((r) => r.slice(3).every((n) => !isNaN(n)))
  return { sk: clean(sk), go: clean(go) }
}

// Setzt die Textstücke einer PDF-Seite wieder zu Zeilen zusammen.
export function rowsFromItems(items) {
  const its = items
    .filter((i) => i.str && i.str.trim())
    .map((i) => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5] }))
    .sort((a, b) => b.y - a.y || a.x - b.x)
  const rows = []
  let cur = null
  its.forEach((i) => {
    if (!cur || Math.abs(cur.y - i.y) > 3) { cur = { y: i.y, c: [] }; rows.push(cur) }
    cur.c.push(i)
  })
  return rows.map((r) => r.c.sort((a, b) => a.x - b.x).map((c) => c.s).join(' ').replace(/[−–]/g, '-').replace(/\s+/g, ' '))
}

const TEAM_RE = Object.keys(EXPORT_TEAM).sort((a, b) => b.length - a.length).map((s) => s.replace(/[-]/g, '\\-')).join('|')
const RX_SKATER = new RegExp('^(?:\\d+ )?(.+?) (' + TEAM_RE + ') (Stürmer|Verteidiger) (\\d+) (\\d+) (\\d+) (\\d+) ([\\d.]+) (\\d+) (-?\\d+)$')
const RX_GOALIE = new RegExp('^(?:\\d+ )?(.+?) (' + TEAM_RE + ') (\\d+) (\\d+) (\\d+) ([\\d.]+) (\\d+) (\\d+) ([\\d.]+) [\\d:]+ \\d+ \\d+ \\d+$')

export function parseRows(rows) {
  const sk = []
  const go = []
  rows.forEach((l) => {
    let m = RX_SKATER.exec(l)
    if (m) { sk.push([m[1], EXPORT_TEAM[m[2]], m[3] === 'Stürmer' ? 'F' : 'D', +m[4], +m[5], +m[6], +m[10], +m[9]]); return }
    m = RX_GOALIE.exec(l)
    if (m) go.push([m[1], EXPORT_TEAM[m[2]], 'G', +m[4], +m[6], +m[9], +m[5]])
  })
  return { sk, go }
}

// Der PDF-Leser wird erst geladen, wenn wirklich ein PDF kommt.
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/'
const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script')
  s.src = src
  s.onload = resolve
  s.onerror = () => reject(new Error('load'))
  document.head.appendChild(s)
})

async function pdfRows(file) {
  if (!window.pdfjsLib) {
    await loadScript(CDN + 'pdf.min.js')
    await loadScript(CDN + 'pdf.worker.min.js')
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN + 'pdf.worker.min.js'
  }
  const doc = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const rows = []
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent()
    rows.push(...rowsFromItems(tc.items))
  }
  return rows
}

export async function readExport(file) {
  const isCsv = /\.csv$/i.test(file.name) || /csv|text\/plain/.test(file.type)
  return isCsv ? parseCsv(await file.text()) : parseRows(await pdfRows(file))
}
