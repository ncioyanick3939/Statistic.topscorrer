<script setup>
import { computed } from 'vue'
import { TEAMS, MY_SQUAD } from './data.js'
import { state, days, activeDay, todayLineup, setCash, openPlayer, stand } from './store.js'
import { gameOn } from './team.js'
import { ownedRated } from './store.js'
import ImportShot from './ImportShot.vue'
const playN = (d) => ownedRated.value.filter((x) => !x.fc.inj && gameOn(x.p.team, d)).length
import { dayLabel } from './model.js'
const fmt = (n) => (n < 0 ? '−' : '') + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
const L = computed(() => todayLineup.value)
const groups = computed(() => [['Goalie', 'G'], ['Verteidiger', 'D'], ['Stürmer', 'F']].map(([t, k]) => ({ t, k, rows: L.value.got[k] })))
const missingN = computed(() => Object.values(L.value.missing).reduce((s, n) => s + Math.max(0, n), 0))
const minus = computed(() => state.cash != null && state.cash < 0)
const info = (x) => { const g = gameOn(x.p.team, activeDay.value); return g ? (g.home ? 'gegen ' : 'bei ') + TEAMS[g.opp][0] : 'spielt nicht' }
</script>

<template>
  <header class="view-heading">
    <div>
      <p class="eyebrow">DEIN TEAM · ÜBERSICHT</p>
      <h1>Team-Cockpit</h1>
      <p class="small muted">Statistikstand {{ stand }}<span v-if="state.ai"> · KI-Coach bereit</span></p>
    </div>
    <span class="heading-mark" aria-hidden="true">🏒</span>
  </header>

  <section class="card status" :class="minus ? 'bad' : 'good'">
    <div class="row">
      <div>
        <p class="small lbl">Kontostand</p>
        <b class="big num">{{ state.cash == null ? '–' : fmt(state.cash) }}</b>
      </div>
      <button v-if="minus" type="button" class="btn" @click="state.tab = 'markt'">Was verkaufen?</button>
    </div>
    <p v-if="minus">Du bekommst an Spieltagen <b>keine Punkte</b>, solange das Konto im Minus ist.</p>
    <p v-else-if="state.cash != null">Dein Konto ist im Plus. Du bekommst Punkte.</p>
    <ImportShot v-if="state.ai" mode="squad" />
    <div class="edit"><label for="cash">Kontostand ändern</label><input id="cash" type="number" step="1000" :value="state.cash" @change="setCash($event.target.value)" /></div>
  </section>

  <section class="schedule-heading">
    <div>
      <p class="eyebrow">SPIELPLAN</p>
      <h2>Aufstellung</h2>
    </div>
    <p class="small muted">Spieler mit Match</p>
  </section>
  <div class="chips" role="tablist" aria-label="Spieltag auswählen">
    <button v-for="d in days" :key="d" type="button" :class="{ on: activeDay === d }" :aria-selected="activeDay === d" @click="state.day = d">{{ dayLabel(d) }} <small>{{ playN(d) }}</small></button>
  </div>

  <section class="card lineup-card">
    <div class="lineup-summary">
      <div>
        <p class="eyebrow">PUNKTE-PROGNOSE</p>
        <b class="forecast-total num">{{ Math.round(L.total) }}</b>
        <p class="small muted">{{ L.playing }} von 16 Spielern mit Spiel</p>
      </div>
      <div class="forecast-ring" :style="{ '--progress': (L.playing / 16 * 100) + '%' }"><span>{{ Math.round(L.playing / 16 * 100) }}%</span><small>im Einsatz</small></div>
    </div>
    <p v-if="missingN" class="bad warn"><b>Es fehlen {{ missingN }} Spieler</b> in der Aufstellung. Jede leere Position kostet 50 Punkte.</p>
    <p v-if="L.imports >= 6" class="small muted">Die Import-Grenze von 6 ist erreicht.</p>
    <template v-for="g in groups" :key="g.k">
      <h3 class="position-title">{{ g.t }} <span>{{ g.rows.length }} / {{ g.k === 'G' ? 1 : g.k === 'D' ? 6 : 9 }}</span></h3>
      <ul class="list">
        <li v-for="e in g.rows" :key="e.x.p.id" :class="{ off: e.v === 0 }">
          <button type="button" @click="openPlayer(e.x.p.id)">
            <span class="nm"><b>{{ e.x.p.name }}</b><span class="muted small">{{ e.x.fc.inj ? 'verletzt' : info(e.x) }}<template v-if="MY_SQUAD[e.x.p.id] && MY_SQUAD[e.x.p.id][4] === 1"> · Import</template></span></span>
            <span class="v num">{{ e.v ? e.v : '–' }}</span>
          </button>
        </li>
      </ul>
    </template>
    <template v-if="L.bench.length">
      <h3 class="position-title">Auf der Bank <span>{{ L.bench.length }}</span></h3>
      <ul class="list">
        <li v-for="e in L.bench" :key="e.x.p.id" class="off">
          <button type="button" @click="openPlayer(e.x.p.id)"><span class="nm"><b>{{ e.x.p.name }}</b><span class="muted small">{{ e.x.fc.inj ? 'verletzt' : info(e.x) }}</span></span><span class="v num">{{ e.v ? e.v : '–' }}</span></button>
        </li>
      </ul>
    </template>
    <p class="small muted">Die Prognose basiert auf deinem Punkteschnitt, der Form und dem Spielplan. Wer nicht spielt, bekommt 0. Es handelt sich um eine Schätzung, keine Garantie.</p>
  </section>
</template>

<style scoped>
.view-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.eyebrow { color: var(--accent); font-size: .68rem; font-weight: 850; letter-spacing: .14em; margin-bottom: 5px; }
.heading-mark { width: 52px; height: 52px; flex: 0 0 52px; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 16px; background: var(--surface-raised); font-size: 1.5rem; }
.schedule-heading { display: flex; justify-content: space-between; align-items: end; gap: 12px; }
.schedule-heading .small { text-align: right; }
.status { gap: 10px; }
.status.good { border-color: color-mix(in srgb, var(--good) 55%, var(--line)); background: var(--surface); }
.status.bad { border-color: color-mix(in srgb, var(--bad) 55%, var(--line)); background: var(--surface); }
.status .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.big { font-family: var(--head); font-size: 2.4rem; font-weight: 800; line-height: 1; display: block; }
.status.bad .big { color: var(--bad); }
.status.good .big { color: var(--good); }
.lbl { color: var(--muted); font-weight: 700; }
.edit { max-width: 220px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chips button { border: 1px solid var(--line); background: var(--surface-raised); border-radius: 12px; padding: 9px 12px; font-size: .86rem; font-weight: 750; }
.chips small { opacity: .72; margin-left: 4px; }
.chips button.on { background: rgba(101,213,232,.13); color: var(--accent); border-color: rgba(101,213,232,.42); }
.lineup-card { gap: 16px; }
.lineup-summary { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.forecast-total { display: block; color: var(--accent); font-family: var(--head); font-size: 3rem; line-height: 1; letter-spacing: -.05em; }
.forecast-ring { position: relative; width: 76px; height: 76px; flex: 0 0 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; background: conic-gradient(var(--accent) var(--progress), rgba(101,213,232,.18) var(--progress)); }\n.forecast-ring::before { content: ''; position: absolute; inset: 5px; border-radius: 50%; background: var(--surface); }\n.forecast-ring span,.forecast-ring small { position: relative; z-index: 1; }
.forecast-ring span { font-family: var(--head); font-weight: 850; font-size: 1.1rem; }
.forecast-ring small { color: var(--muted); font-size: .62rem; }
.position-title { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.position-title span { color: var(--muted); font-family: var(--body); font-size: .75rem; font-weight: 700; letter-spacing: 0; }
.warn { padding: 10px 12px; border-radius: 12px; }
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.list li { border-top: 1px solid var(--line); }
.list button { width: 100%; background: none; border: 0; padding: 11px 0; display: flex; justify-content: space-between; align-items: center; gap: 10px; text-align: left; }
.nm { display: flex; flex-direction: column; min-width: 0; }
.v { color: var(--accent); font-family: var(--head); font-size: 1.25rem; font-weight: 850; }
li.off .nm b, li.off .v { opacity: .42; }
</style>
