<script setup>
import { computed, ref } from 'vue'
import { TEAMS, MY_SQUAD } from './data.js'
import { rated, week, openPlayer, state, numberOf } from './store.js'
import { k } from './format.js'
import TeamLogo from './TeamLogo.vue'

const q = ref('')
const pos = ref('all')
const team = ref('all')
const free = ref(false)
const sort = ref('score')
const POS = [['all', 'Alle'], ['F', 'Stürmer'], ['D', 'Verteidiger'], ['G', 'Goalies']]
const COLS = [['score', 'Note'], ['avg', 'Ø Pkt'], ['max', 'Höchstpreis'], ['wk', 'Woche']]
const teams = computed(() => Object.keys(TEAMS).sort())
const val = (x, s) => (s === 'score' ? x.r.score : s === 'avg' ? (x.w.avg ?? -1) : s === 'max' ? (x.w.max ?? -1) : (week.value[x.p.team] || 0))
const rows = computed(() => {
  const v = q.value.trim().toLowerCase()
  return rated.value
    .filter((x) => (pos.value === 'all' || x.p.pos === pos.value) && (team.value === 'all' || x.p.team === team.value) && (!free.value || !MY_SQUAD[x.p.id]) && (!v || x.p.name.toLowerCase().includes(v)))
    .sort((a, b) => val(b, sort.value) - val(a, sort.value) || b.r.score - a.r.score)
})
const tier = (s) => (s >= 80 ? 'gold' : s >= 60 ? 'silver' : 'bronze')
</script>

<template>
  <header class="pagehead"><div><h1>Liga</h1><p class="muted">Alle {{ rated.length }} Spieler. Tippe auf einen Spieler für Details.</p></div></header>

  <section class="card filters">
    <input type="search" autocomplete="off" placeholder="Name suchen" v-model="q" aria-label="Spieler suchen" />
    <div class="chips" role="group" aria-label="Position">
      <button v-for="f in POS" :key="f[0]" type="button" :class="{ on: pos === f[0] }" @click="pos = f[0]">{{ f[1] }}</button>
    </div>
    <div class="two">
      <select v-model="team" aria-label="Team"><option value="all">Alle Teams</option><option v-for="t in teams" :key="t" :value="t">{{ TEAMS[t][0] }}</option></select>
      <label class="chk"><input type="checkbox" v-model="free" /> ohne meinen Kader</label>
    </div>
    <div class="chips" role="group" aria-label="Sortieren">
      <span class="muted small">Sortieren:</span>
      <button v-for="c in COLS" :key="c[0]" type="button" :class="{ on: sort === c[0] }" @click="sort = c[0]">{{ c[1] }}</button>
    </div>
  </section>

  <p class="muted small cnt">{{ rows.length }} Spieler · Ø Pkt und Höchstpreis sind bei Spielern ohne Topscorer-Daten geschätzt (~).</p>
  <ul class="list">
    <li v-for="(x, i) in rows" :key="x.p.id">
      <button type="button" class="r" :class="{ mine: MY_SQUAD[x.p.id] }" @click="openPlayer(x.p.id)">
        <span class="rk">{{ i + 1 }}</span>
        <TeamLogo :team="x.p.team" :size="34" />
        <span class="who">
          <b>{{ x.p.name }}<i v-if="x.fc.inj" class="inj">+</i><i v-if="MY_SQUAD[x.p.id]" class="own">Kader</i></b>
          <small><template v-if="numberOf(x.p.id)">#{{ numberOf(x.p.id) }} · </template>{{ x.p.team }} · {{ x.p.pos === 'G' ? 'Goalie' : x.p.pos === 'D' ? 'Verteidiger' : 'Stürmer' }} · {{ x.p.gp }} Sp.</small>
        </span>
        <span class="n sc" :class="tier(x.r.score)">{{ x.r.score }}<small>Note</small></span>
        <span class="n">{{ x.w.avg == null ? '–' : (x.w.est ? '~' : '') + x.w.avg }}<small>Ø Pkt</small></span>
        <span class="n hide">{{ x.w.max == null ? '–' : (x.w.est ? '~' : '') + k(x.w.max) }}<small>Höchstpreis</small></span>
        <span class="n hide">{{ week[x.p.team] || 0 }}<small>Spiele 7 T.</small></span>
      </button>
    </li>
  </ul>
  <p v-if="!rows.length" class="muted">Keine Spieler mit diesem Filter.</p>
</template>

<style scoped>
.filters { gap: 12px; }
.chips { display: flex; gap: 8px; align-items: center; overflow-x: auto; padding-bottom: 2px; }
.chips button { flex: 0 0 auto; border: 0; background: var(--surface-raised); border-radius: 999px; padding: 8px 16px; font-weight: 700; color: var(--muted); }
.chips button.on { background: var(--accent); color: var(--accent-ink); }
.two { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }
.chk { display: flex; align-items: center; gap: 8px; margin: 0; text-transform: none; letter-spacing: 0; font-size: .9rem; color: var(--ink); white-space: nowrap; }
.chk input { width: 20px; height: 20px; padding: 0; accent-color: var(--accent); }
.cnt { margin: 0; }
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.r { width: 100%; display: grid; grid-template-columns: 26px 34px minmax(0, 1fr) repeat(2, 50px); gap: 10px; align-items: center; padding: 9px 12px; border: 0; border-radius: 14px; background: var(--surface); text-align: left; }
.r:hover { background: var(--surface-raised); }
.r.mine { box-shadow: inset 3px 0 0 var(--accent); }
.rk { color: var(--muted); font-size: .8rem; text-align: right; }
.who { display: flex; flex-direction: column; min-width: 0; }
.who b { font-weight: 800; text-transform: uppercase; letter-spacing: .01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.who small { color: var(--muted); font-size: .76rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.n { display: flex; flex-direction: column; align-items: center; font-weight: 800; font-size: 1.1rem; line-height: 1.1; font-variant-numeric: tabular-nums; }
.n small { font-size: .6rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
.sc.gold { color: var(--accent); }
.sc.silver { color: #d9e2f2; }
.sc.bronze { color: #e0a070; }
.hide { display: none; }
.inj { margin-left: 6px; color: #fff; background: var(--lamp); border-radius: 999px; padding: 0 6px; font-style: normal; font-size: .75rem; }
.own { margin-left: 6px; color: var(--accent-ink); background: var(--accent); border-radius: 3px; padding: 0 5px; font-style: normal; font-size: .62rem; letter-spacing: .03em; text-transform: uppercase; }
@media (min-width: 640px) { .r { grid-template-columns: 30px 34px minmax(0, 1fr) repeat(4, 76px); } .hide { display: flex; } }
</style>
