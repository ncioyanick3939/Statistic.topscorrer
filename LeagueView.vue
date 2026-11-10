<script setup>
import { computed } from 'vue'
import { TEAMS, MY_SQUAD } from './data.js'
import { state, rated, openPlayer } from './store.js'

const COLS = {
  S: [['fcn', 'Prognose'], ['note', 'Note'], ['gp', 'GP'], ['g', 'G'], ['a', 'A'], ['pts', 'PTS'], ['pgp', 'P/GP'], ['pm', '+/-']],
  G: [['fcn', 'GA erw.'], ['note', 'Note'], ['gp', 'GP'], ['sv', 'SVS%'], ['gaa', 'GAA']]
}
const cols = computed(() => COLS[state.pos === 'G' ? 'G' : 'S'])
const sortKey = computed(() => (cols.value.some((c) => c[0] === state.sortKey) ? state.sortKey : state.pos === 'G' ? 'sv' : 'pts'))
const val = (x, k) => {
  const p = x.p
  if (k === 'fcn') return x.fc.type === 'G' ? x.fc.next.ga : x.fc.next.pts
  if (k === 'note') return x.r.score
  if (k === 'pts') return p.g + p.a
  if (k === 'pgp') return (p.g + p.a) / Math.max(1, p.gp)
  return p[k] ?? -1
}
const text = (x, k) => {
  const v = val(x, k)
  return k === 'pgp' || k === 'gaa' || k === 'sv' ? v.toFixed(2) : k === 'fcn' ? v.toFixed(1) : v
}
const rows = computed(() => {
  const k = sortKey.value
  const d = state.sortDir
  return rated.value
    .filter((x) => (state.pos === 'S' ? x.p.pos !== 'G' : x.p.pos === state.pos) && (!state.team || x.p.team === state.team) && (!state.mine || MY_SQUAD[x.p.id]))
    .sort((a, b) => d * (val(a, k) - val(b, k)) || b.r.score - a.r.score)
})
const teamList = Object.keys(TEAMS).sort((a, b) => TEAMS[a][0].localeCompare(TEAMS[b][0]))
function sortBy(k) {
  if (sortKey.value === k) state.sortDir = -state.sortDir
  else { state.sortKey = k; state.sortDir = k === 'gaa' || k === 'fcn' && state.pos === 'G' ? 1 : -1 }
  state.shown = 25
}
</script>

<template>
  <header>
    <h1>Liga</h1>
    <p class="muted small">Alle Spieler mit Prognose. Spaltentitel sortiert, Name öffnet den Spieler.</p>
  </header>
  <div class="filters">
    <div><label for="f-pos">Position</label><select id="f-pos" v-model="state.pos" @change="state.shown = 25"><option value="S">Alle Feldspieler</option><option value="F">Stürmer</option><option value="D">Verteidiger</option><option value="G">Torhüter</option></select></div>
    <div><label for="f-team">Team</label><select id="f-team" v-model="state.team" @change="state.shown = 25"><option value="">Alle</option><option v-for="t in teamList" :key="t" :value="t">{{ TEAMS[t][0] }}</option></select></div>
    <label class="check" for="f-mine"><input id="f-mine" type="checkbox" v-model="state.mine" /> Nur mein Kader</label>
  </div>
  <div class="wrap">
    <table>
      <thead><tr><th class="n">#</th><th class="name">Spieler</th><th v-for="c in cols" :key="c[0]"><button type="button" :class="{ on: sortKey === c[0] }" @click="sortBy(c[0])">{{ c[1] }}{{ sortKey === c[0] ? (state.sortDir < 0 ? ' ↓' : ' ↑') : '' }}</button></th></tr></thead>
      <tbody>
        <tr v-for="(x, i) in rows.slice(0, state.shown)" :key="x.p.id">
          <td class="n">{{ i + 1 }}</td>
          <td class="name"><button type="button" @click="openPlayer(x.p.id)">{{ x.p.name }}<small>{{ TEAMS[x.p.team][0] }}</small></button></td>
          <td v-for="c in cols" :key="c[0]" :class="{ strong: c[0] === 'fcn' || c[0] === 'pts' }"><span v-if="c[0] === 'note'" class="chip" :class="x.r.cls">{{ x.r.score }}</span><template v-else>{{ text(x, c[0]) }}</template></td>
        </tr>
        <tr v-if="!rows.length"><td :colspan="cols.length + 2" class="name">Kein Spieler passt zu diesem Filter.</td></tr>
      </tbody>
    </table>
  </div>
  <button v-if="rows.length > state.shown" type="button" class="btn ghost" @click="state.shown += 25">Mehr anzeigen</button>
</template>

<style scoped>
.filters { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.check { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; color: var(--ink); font-size: 0.95rem; margin: 0; }
.check input { width: 20px; height: 20px; padding: 0; flex: none; }
.wrap { overflow-x: auto; border: 1.5px solid var(--line); border-radius: 16px; background: var(--surface); }
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; font-size: 0.92rem; }
th, td { padding: 9px 10px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line); }
tbody tr:last-child td { border-bottom: 0; }
th { font-size: 0.72rem; color: var(--muted); font-weight: 700; }
th button { background: none; border: 0; padding: 0; font: inherit; color: inherit; }
th button.on { color: var(--accent); }
.n { color: var(--muted); text-align: left; }
.name { text-align: left; position: sticky; left: 0; background: var(--surface); min-width: 130px; max-width: 150px; white-space: normal; }
td.name button { background: none; border: 0; padding: 0; text-align: left; font-weight: 700; }
td.name small { display: block; color: var(--muted); font-weight: 400; }
.strong { font-weight: 800; }
.chip { padding: 2px 9px; }
</style>
