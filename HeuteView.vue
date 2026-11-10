<script setup>
import { computed, ref } from 'vue'
import { TEAMS, MY_SQUAD, SCHEDULE } from './data.js'
import { state, ctx, stand, days, activeDay, todayLineup, ownedRated, plan, marketList, setCash, openPlayer } from './store.js'
import { gameOn } from './team.js'
import { dayLabel } from './model.js'
import { fmt, mio, k, surname } from './format.js'
import RosterRink from './RosterRink.vue'
import ImportShot from './ImportShot.vue'

const L = computed(() => todayLineup.value)
const minus = computed(() => state.cash != null && state.cash < 0)
const missingN = computed(() => Object.values(L.value.missing).reduce((s, n) => s + Math.max(0, n), 0))
const teamValue = computed(() => ownedRated.value.reduce((s, x) => s + (x.w.mv || 0), 0))
const age = computed(() => Math.round((new Date(ctx.value.today) - new Date(state.data.date)) / 864e5))
const view = ref(typeof window !== 'undefined' && window.innerWidth >= 768 ? 'rink' : 'list')
const groups = computed(() => [['Goalie', 'G'], ['Verteidiger', 'D'], ['Stürmer', 'F']].map(([t, key]) => ({ t, key, rows: L.value.got[key] })))
const info = (x) => { if (x.fc.inj) return 'verletzt'; const g = gameOn(x.p.team, activeDay.value); return g ? (g.home ? 'gegen ' : 'bei ') + TEAMS[g.opp][0] : 'spielt nicht' }
const playN = (d) => ownedRated.value.filter((x) => !x.fc.inj && gameOn(x.p.team, d)).length

// Spiele des gewählten Tages mit der Zahl deiner Spieler pro Spiel
const games = computed(() => (SCHEDULE[activeDay.value] || '').split(' ').filter(Boolean).map((g) => {
  const [h, a] = g.split('-')
  const mine = (t) => ownedRated.value.filter((x) => x.p.team === t).length
  return { h, a, n: mine(h) + mine(a) }
}))

// Die wichtigsten Aufgaben für heute, höchstens fünf, wichtigste zuerst
const tasks = computed(() => {
  const t = []
  if (minus.value) {
    if (plan.value) t.push({ tone: 'bad', h: 'Verkaufen: ' + plan.value.sold.map((x) => surname(x.p.name)).join(', '), p: 'Bringt ' + fmt(plan.value.sum) + ' und holt dich ins Plus. Du verlierst dabei am wenigsten Punkte.', b: 'Plan ansehen', to: 'markt' })
    else t.push({ tone: 'bad', h: 'Konto im Minus', p: 'Mit höchstens 5 Verkäufen reicht es nicht. Gib im Markt einen Gesperrten frei.', b: 'Zum Markt', to: 'markt' })
  }
  if (missingN.value) t.push({ tone: 'bad', h: missingN.value + (missingN.value === 1 ? ' Position leer' : ' Positionen leer'), p: 'Jede leere Position kostet 50 Punkte.', b: 'Ersatz suchen', to: 'markt' })
  const hurt = ownedRated.value.filter((x) => x.fc.inj)
  if (hurt.length) t.push({ tone: 'mid', h: hurt.map((x) => surname(x.p.name)).join(', ') + (hurt.length === 1 ? ' ist verletzt' : ' sind verletzt'), p: 'Verletzte Spieler bringen keine Punkte. Ersatz im Markt prüfen.', b: 'Ersatz suchen', to: 'markt' })
  const idle = [...L.value.got.G, ...L.value.got.D, ...L.value.got.F].filter((e) => e.v === 0 && !e.x.fc.inj)
  if (idle.length) t.push({ tone: 'mid', h: idle.length + (idle.length === 1 ? ' Spieler spielt' : ' Spieler spielen') + ' am ' + dayLabel(activeDay.value) + ' nicht', p: (idle.length <= 3 ? idle.map((e) => surname(e.x.p.name)).join(', ') + '. ' : '') + 'Wähle unter «Spieltag» einen anderen Tag, wenn du für später planst.' })
  const buy = marketList.value.find((x) => x.w.max != null && x.w.max >= x.price && !x.fc.inj)
  if (buy) t.push({ tone: 'good', h: 'Kaufen: ' + buy.p.name, p: 'Preis ' + fmt(buy.price) + ', du kannst bis ' + fmt(buy.w.max) + ' bieten.', b: 'Zum Markt', to: 'markt' })
  else if (!marketList.value.length) t.push({ tone: '', h: 'Transfermarkt fehlt', p: 'Mach einen Screenshot vom Transfermarkt und lade ihn im Markt hoch, dann sage ich dir, wen du kaufen sollst.', b: 'Zum Markt', to: 'markt' })
  if (age.value > 7) t.push({ tone: 'mid', h: 'Statistik ist ' + age.value + ' Tage alt', p: 'Lade den neuen Export von sihf.ch hoch, damit die Prognose stimmt.', b: 'Daten laden', to: 'daten' })
  return t.slice(0, 5)
})
</script>

<template>
  <header class="head">
    <div><h1>Heute</h1><p class="muted">Dein Team für {{ dayLabel(activeDay) }}<span v-if="state.ai"> · KI-Coach bereit</span></p></div>
    <span class="chip" :class="age > 7 ? 'mid' : 'good'">Statistik vom {{ stand }}</span>
  </header>

  <section class="kpis" aria-label="Kennzahlen">
    <div class="card kpi" :class="minus ? 'bad-b' : 'good-b'">
      <p class="lbl">Kontostand</p>
      <b class="val num" :class="minus ? 'neg' : 'pos'">{{ state.cash == null ? '–' : fmt(state.cash) }}</b>
      <p class="small">{{ minus ? 'Keine Punkte, solange im Minus' : state.cash == null ? 'Kontostand eintragen' : 'Im Plus, du bekommst Punkte' }}</p>
    </div>
    <div class="card kpi"><p class="lbl">Teamwert</p><b class="val num">{{ mio(teamValue) }}</b><p class="small">{{ ownedRated.length }} Spieler im Kader</p></div>
    <div class="card kpi"><p class="lbl">Erwartete Punkte</p><b class="val num">{{ Math.round(L.total) }}</b><p class="small">≈ {{ fmt(L.total * 50) }} Franken am {{ dayLabel(activeDay) }}</p></div>
    <div class="card kpi"><p class="lbl">Spielen am Tag</p><b class="val num">{{ L.playing }} <small>von 16</small></b><p class="small">{{ L.imports }} von 6 Imports</p></div>
  </section>

  <div class="grid">
    <div class="side">
      <section class="card">
        <h2>Heute zu tun</h2>
        <ul v-if="tasks.length" class="tasks">
          <li v-for="(t, i) in tasks" :key="i" :class="t.tone">
            <b>{{ t.h }}</b><span class="small">{{ t.p }}</span>
            <button v-if="t.b" type="button" class="link" @click="state.tab = t.to">{{ t.b }} →</button>
          </li>
        </ul>
        <p v-else class="muted">Nichts zu tun. Dein Team ist bereit.</p>
      </section>

      <section class="card">
        <h2>Spieltag</h2>
        <div class="chips" role="group" aria-label="Spieltag wählen">
          <button v-for="d in days" :key="d" type="button" :class="{ on: activeDay === d }" @click="state.day = d">{{ dayLabel(d) }} <small>{{ playN(d) }}</small></button>
        </div>
        <p class="small muted">Die Zahl zeigt, wie viele deiner Spieler an dem Tag spielen.</p>
        <ul v-if="games.length" class="games">
          <li v-for="g in games" :key="g.h + g.a"><span><b>{{ g.h }}</b> – <b>{{ g.a }}</b></span><span class="chip" :class="g.n ? 'good' : ''">{{ g.n ? g.n + ' von dir' : '–' }}</span></li>
        </ul>
        <p v-else class="muted">Spielplan nicht verfügbar.</p>
      </section>
    </div>

    <div class="main">
      <section class="card">
        <div class="kh">
          <h2>Mein Kader <span class="muted small">({{ ownedRated.length }})</span></h2>
          <div class="seg" role="group" aria-label="Ansicht">
            <button type="button" :class="{ on: view === 'rink' }" @click="view = 'rink'">Eisfeld</button>
            <button type="button" :class="{ on: view === 'list' }" @click="view = 'list'">Liste</button>
          </div>
        </div>
        <RosterRink v-if="view === 'rink'" :got="L.got" :missing="L.missing" :day="activeDay" />
        <template v-else>
          <template v-for="g in groups" :key="g.key">
            <h3>{{ g.t }}</h3>
            <ul class="list">
              <li v-for="e in g.rows" :key="e.x.p.id" :class="{ off: e.v === 0 }">
                <button type="button" @click="openPlayer(e.x.p.id)">
                  <span class="nm"><b>{{ e.x.p.name }}</b><span class="muted small">{{ info(e.x) }}<template v-if="MY_SQUAD[e.x.p.id] && MY_SQUAD[e.x.p.id][4] === 1"> · Import</template></span></span>
                  <span class="v num">{{ e.v ? e.v : '–' }}</span>
                </button>
              </li>
            </ul>
          </template>
        </template>
        <template v-if="L.bench.length">
          <h3>Auf der Bank</h3>
          <ul class="list">
            <li v-for="e in L.bench" :key="e.x.p.id" class="off">
              <button type="button" @click="openPlayer(e.x.p.id)"><span class="nm"><b>{{ e.x.p.name }}</b><span class="muted small">{{ info(e.x) }}</span></span><span class="v num">{{ e.v ? e.v : '–' }}</span></button>
            </li>
          </ul>
        </template>
        <p class="small muted">Die Zahl ist der Punkteschnitt pro Spiel aus dem Topscorer-Spiel, bei Formschwäche oder Verletzung angepasst. Wer nicht spielt, bekommt 0.</p>
      </section>

      <details class="card acc">
        <summary>Konto und Kader aktualisieren</summary>
        <div class="acc-in">
          <ImportShot v-if="state.ai" mode="squad" />
          <p v-else class="small muted">Screenshot-Import braucht die KI. Du kannst den Kontostand hier von Hand eintragen.</p>
          <div class="edit"><label for="cash">Kontostand ändern</label><input id="cash" type="number" step="1000" :value="state.cash" @change="setCash($event.target.value)" /></div>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 900px) { .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.kpi { gap: 4px; padding: 14px 16px; }
.kpi .lbl { color: var(--muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.val { font-family: var(--head); font-size: 1.7rem; font-weight: 800; line-height: 1.1; }
.val small { font-size: 0.9rem; font-weight: 500; color: var(--muted); }
.val.neg { color: var(--bad); }
.val.pos { color: var(--good); }
.kpi.bad-b { border-color: var(--bad); }
.kpi.good-b { border-color: var(--good); }
.kpi .small { color: var(--muted); }
.grid { display: flex; flex-direction: column; gap: 16px; }
.side, .main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
@media (min-width: 1200px) {
  .grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); grid-template-areas: 'main side'; align-items: start; }
  .main { grid-area: main; }
  .side { grid-area: side; }
}
.tasks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.tasks li { display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: 12px; background: var(--soft); border-left: 4px solid var(--line); }
.tasks li.bad { border-left-color: var(--bad); background: var(--bad-soft); color: var(--ink); }
.tasks li.mid { border-left-color: var(--mid); background: var(--mid-soft); color: var(--ink); }
.tasks li.good { border-left-color: var(--good); background: var(--good-soft); color: var(--ink); }
.tasks .small { color: var(--muted); }
.tasks .link { margin-top: 4px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chips button { border: 1px solid var(--line); background: var(--bg); border-radius: 12px; padding: 9px 14px; font-weight: 700; min-height: 44px; }
.chips small { opacity: 0.7; margin-left: 4px; }
.chips button.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.games { list-style: none; margin: 0; padding: 0; }
.games li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid var(--line); }
.kh { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.seg { display: flex; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.seg button { border: 0; background: transparent; padding: 9px 16px; font-weight: 700; color: var(--muted); min-height: 40px; }
.seg button.on { background: var(--accent); color: var(--accent-ink); }
h3 { font-size: 1.02rem; margin-top: 4px; }
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.list li { border-top: 1px solid var(--line); }
.list button { width: 100%; background: none; border: 0; padding: 11px 0; display: flex; justify-content: space-between; align-items: center; gap: 10px; text-align: left; }
.nm { display: flex; flex-direction: column; min-width: 0; }
.v { font-family: var(--head); font-size: 1.3rem; font-weight: 800; }
li.off .nm b, li.off .v { opacity: 0.45; }
.acc summary { cursor: pointer; font-weight: 700; color: var(--accent); }
.acc-in { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
.edit { max-width: 240px; }
</style>
