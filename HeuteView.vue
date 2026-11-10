<script setup>
import { computed } from 'vue'
import { TEAMS, MY_SQUAD } from './data.js'
import { state, days, activeDay, todayLineup, setCash, openPlayer } from './store.js'
import { gameOn } from './team.js'
import { ownedRated } from './store.js'
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
    <div class="edit"><label for="cash">Kontostand ändern</label><input id="cash" type="number" step="1000" :value="state.cash" @change="setCash($event.target.value)" /></div>
  </section>

  <section>
    <h2>Aufstellung</h2>
    <p class="small muted">Die Zahl neben dem Datum zeigt, wie viele deiner Spieler an dem Tag spielen.</p>
    <div class="chips" role="tablist">
      <button v-for="d in days" :key="d" type="button" :class="{ on: activeDay === d }" @click="state.day = d">{{ dayLabel(d) }} <small>{{ playN(d) }}</small></button>
    </div>
  </section>

  <section class="card">
    <p><b>{{ L.playing }} von 16</b> Spielern haben am {{ dayLabel(activeDay) }} ein Spiel. Erwartet: rund <b class="num">{{ Math.round(L.total) }}</b> Punkte, das sind etwa {{ fmt(L.total * 50) }} Franken.</p>
    <p v-if="missingN" class="bad warn"><b>Es fehlen {{ missingN }} Spieler</b> in der Aufstellung. Jede leere Position kostet 50 Punkte.</p>
    <p v-if="L.imports >= 6" class="small muted">Die Import-Grenze von 6 ist erreicht.</p>
    <template v-for="g in groups" :key="g.k">
      <h3>{{ g.t }}</h3>
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
      <h3>Auf der Bank</h3>
      <ul class="list">
        <li v-for="e in L.bench" :key="e.x.p.id" class="off">
          <button type="button" @click="openPlayer(e.x.p.id)"><span class="nm"><b>{{ e.x.p.name }}</b><span class="muted small">{{ e.x.fc.inj ? 'verletzt' : info(e.x) }}</span></span><span class="v num">{{ e.v ? e.v : '–' }}</span></button>
        </li>
      </ul>
    </template>
    <p class="small muted">Die Zahl rechts ist der Punkteschnitt pro Spiel aus dem Topscorer-Spiel, bei Formschwäche oder Verletzung angepasst. Wer nicht spielt, bekommt 0.</p>
  </section>
</template>

<style scoped>
.status { gap: 10px; }
.status.good { border-color: var(--good); background: var(--surface); }
.status.bad { border-color: var(--bad); background: var(--surface); }
.status .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.big { font-family: var(--head); font-size: 2.4rem; font-weight: 800; line-height: 1; display: block; }
.status.bad .big { color: var(--bad); }
.status.good .big { color: var(--good); }
.lbl { color: var(--muted); font-weight: 700; }
.status p.small { margin-bottom: 2px; }
.status.good, .status.bad { color: var(--ink); }
.edit { max-width: 220px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.chips button { border: 2px solid var(--line); background: var(--surface); border-radius: 12px; padding: 9px 14px; font-weight: 700; }
.chips small { opacity: 0.7; margin-left: 4px; }
.chips button.on { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.warn { padding: 10px 12px; border-radius: 12px; }
h3 { font-size: 1.05rem; margin-top: 4px; }
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.list li { border-top: 1px solid var(--line); }
.list button { width: 100%; background: none; border: 0; padding: 11px 0; display: flex; justify-content: space-between; align-items: center; gap: 10px; text-align: left; }
.nm { display: flex; flex-direction: column; min-width: 0; }
.v { font-family: var(--head); font-size: 1.3rem; font-weight: 800; }
li.off .nm b, li.off .v { opacity: 0.45; }
</style>
