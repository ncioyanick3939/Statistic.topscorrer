<script setup>
import { computed, ref, watch } from 'vue'
import { state, ctx, week, days, activeDay, todayLineup, forceCount, ownedRated, plan, marketList, setCash, openPlayer, swapPlayers, resetForce } from './store.js'
import { gameOn } from './team.js'
import { dayLabel } from './model.js'
import { fmt, surname } from './format.js'
import Scoreboard from './Scoreboard.vue'
import Rink from './Rink.vue'
import Puck from './Puck.vue'
import ImportShot from './ImportShot.vue'

const L = computed(() => todayLineup.value)
const minus = computed(() => state.cash != null && state.cash < 0)
const missingN = computed(() => Object.values(L.value.missing).reduce((s, n) => s + Math.max(0, n), 0))
const cover = computed(() => (plan.value && minus.value ? Math.min(100, Math.round((plan.value.sum / -state.cash) * 100)) : 0))
const age = computed(() => Math.round((new Date(ctx.value.today) - new Date(state.data.date)) / 864e5))
const playN = (d) => ownedRated.value.filter((x) => !x.fc.inj && gameOn(x.p.team, d)).length
const POS = { G: 'Goalie', D: 'Verteidiger', F: 'Stürmer' }

// Wechsel per Tippen: erst einen Spieler wählen, dann einen gleicher Position von der anderen Seite
const selected = ref(null)
const note = ref('')
const lookup = computed(() => {
  const m = {}
  ;[...L.value.got.G, ...L.value.got.D, ...L.value.got.F].forEach((e) => { m[e.x.p.id] = { e, ice: true } })
  L.value.bench.forEach((e) => { m[e.x.p.id] = { e, ice: false } })
  return m
})
const sel = computed(() => (selected.value ? lookup.value[selected.value] : null))
const hintIds = computed(() => (sel.value ? Object.keys(lookup.value).filter((id) => lookup.value[id].e.x.p.pos === sel.value.e.x.p.pos && lookup.value[id].ice !== sel.value.ice) : []))
function pick(id) {
  note.value = ''
  if (selected.value === id) { selected.value = null; return }
  if (selected.value && hintIds.value.includes(id)) {
    const a = selected.value
    const r = sel.value.ice ? swapPlayers(a, id) : swapPlayers(id, a)
    if (!r.ok) note.value = r.msg
    selected.value = null
    return
  }
  selected.value = id
}
watch(activeDay, () => { selected.value = null; note.value = '' })

// Spielplan-Check
const weekGroups = computed(() => {
  const m = {}
  ownedRated.value.filter((x) => !x.fc.inj).forEach((x) => { const n = week.value[x.p.team] || 0; (m[n] = m[n] || []).push(surname(x.p.name)) })
  return Object.keys(m).map(Number).sort((a, b) => b - a).map((n) => ({ n, names: m[n].join(', ') }))
})
const weekTop = computed(() => Object.entries(week.value).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5))
const weekTone = (n) => (n >= 3 ? 'good' : n === 2 ? 'mid' : 'bad')

// Trainer-Notizen: die drei wichtigsten Aufgaben
const tasks = computed(() => {
  const t = []
  if (minus.value && !plan.value) t.push({ tone: 'bad', h: 'Verkauf reicht nicht', p: 'Mit höchstens 5 Verkäufen kommst du nicht ins Plus. Gib im Markt einen Gesperrten frei.', b: 'Zum Markt', to: 'markt' })
  if (missingN.value) t.push({ tone: 'bad', h: missingN.value + (missingN.value === 1 ? ' Position leer' : ' Positionen leer'), p: 'Jede leere Position kostet 50 Punkte.', b: 'Ersatz suchen', to: 'markt' })
  const hurt = ownedRated.value.filter((x) => x.fc.inj)
  if (hurt.length) t.push({ tone: 'mid', h: hurt.map((x) => surname(x.p.name)).join(', ') + (hurt.length === 1 ? ' ist verletzt' : ' sind verletzt'), p: 'Verletzte bringen keine Punkte.', b: 'Ersatz suchen', to: 'markt' })
  const buy = marketList.value.find((x) => x.w.max != null && x.w.max >= x.price && !x.fc.inj)
  if (buy) t.push({ tone: 'good', h: 'Kaufen: ' + buy.p.name, p: 'Preis ' + fmt(buy.price) + ', biete bis ' + fmt(buy.w.max) + '.', b: 'Zum Markt', to: 'markt' })
  else if (!marketList.value.length) t.push({ tone: '', h: 'Transfermarkt fehlt', p: 'Screenshot vom Transfermarkt hochladen, dann sage ich dir, wen du kaufen sollst.', b: 'Zum Markt', to: 'markt' })
  if (age.value > 7) t.push({ tone: 'mid', h: 'Statistik ist ' + age.value + ' Tage alt', p: 'Neuen Export von sihf.ch laden.', b: 'Daten laden', to: 'daten' })
  return t.slice(0, 3)
})
</script>

<template>
  <header class="hd"><h1>Arena</h1><p class="muted">Dein Team. Dein Spieltag. Tippe einen Spieler, um zu wechseln.</p></header>

  <Scoreboard :points="Math.round(L.total)" :cash="state.cash" :day="dayLabel(activeDay)" :playing="L.playing" />

  <section v-if="minus" class="pen">
    <div class="pen-h"><b>Strafbank</b><span class="led">{{ fmt(-state.cash) }}</span></div>
    <p v-if="plan">Solange das Konto im Minus ist, gibt es keine Punkte. Verkaufe <b>{{ plan.sold.map((x) => surname(x.p.name)).join(', ') }}</b> und du bist wieder auf dem Eis.</p>
    <p v-else>Solange das Konto im Minus ist, gibt es keine Punkte. Mit 5 Verkäufen reicht es nicht, gib im Markt einen Gesperrten frei.</p>
    <div v-if="plan" class="bar" role="img" :aria-label="'Der Plan deckt ' + cover + ' Prozent der Strafe'"><span :style="{ width: cover + '%' }"></span></div>
    <div class="pen-f"><span v-if="plan" class="small">Plan deckt {{ cover }} % · bringt {{ fmt(plan.sum) }}</span><button type="button" class="btn" @click="state.tab = 'markt'">Plan ansehen</button></div>
  </section>

  <div class="tape" role="group" aria-label="Spieltag wählen">
    <button v-for="d in days" :key="d" type="button" :class="{ on: activeDay === d }" @click="state.day = d"><b>{{ dayLabel(d) }}</b><small>{{ playN(d) }} spielen</small></button>
  </div>

  <div class="arena">
    <div class="icecol">
      <Rink :got="L.got" :day="activeDay" :selected-id="selected" :hint-ids="hintIds" @pick="pick" />
      <p class="hintline" role="status">
        <template v-if="sel">
          <b>{{ sel.e.x.p.name }}</b> gewählt. Tippe {{ POS[sel.e.x.p.pos] === 'Goalie' ? 'den Goalie' : 'einen ' + POS[sel.e.x.p.pos] }} {{ sel.ice ? 'von der Bank' : 'vom Eis' }}, um zu tauschen.
          <button type="button" class="link" @click="openPlayer(sel.e.x.p.id)">Details →</button>
        </template>
        <template v-else-if="note">{{ note }}</template>
        <template v-else>Zahl = erwartete Punkte pro Spiel. Grün ab 80, gelb ab 50.</template>
      </p>
      <section class="bench">
        <div class="bench-h"><h3>Bank</h3><button v-if="forceCount" type="button" class="link" @click="resetForce(); selected = null">Auto-Aufstellung</button></div>
        <div class="bench-r"><Puck v-for="e in L.bench" :key="e.x.p.id" :e="e" :day="activeDay" :selected="selected === e.x.p.id" :hint="hintIds.includes(e.x.p.id)" @pick="pick" /></div>
      </section>
    </div>

    <aside class="notes">
      <section class="card">
        <h2>Trainer-Notizen</h2>
        <ul v-if="tasks.length" class="tasks">
          <li v-for="(t, i) in tasks" :key="i" :class="t.tone"><b>{{ t.h }}</b><span class="small">{{ t.p }}</span><button v-if="t.b" type="button" class="link" @click="state.tab = t.to">{{ t.b }} →</button></li>
        </ul>
        <p v-else class="muted">Nichts zu tun. Dein Team ist bereit.</p>
      </section>

      <section class="card">
        <h2>Wochenradar</h2>
        <p class="small muted">Spiele deiner Teams in den nächsten 7 Tagen. Mehr Spiele, mehr Punkte.</p>
        <ul class="wk">
          <li v-for="g in weekGroups" :key="g.n"><span class="chip" :class="weekTone(g.n)">{{ g.n }} {{ g.n === 1 ? 'Spiel' : 'Spiele' }}</span><span class="small">{{ g.names }}</span></li>
        </ul>
        <p class="small"><b>Meiste Spiele:</b> <span v-for="(t, i) in weekTop" :key="t[0]">{{ i ? ' · ' : '' }}{{ t[0] }} {{ t[1] }}</span></p>
      </section>

      <details class="card more">
        <summary>Konto und Kader aktualisieren</summary>
        <div class="acc">
          <ImportShot v-if="state.ai" mode="squad" />
          <div class="edit"><label for="cash">Kontostand</label><input id="cash" type="number" step="1000" :value="state.cash" @change="setCash($event.target.value)" /></div>
        </div>
      </details>
    </aside>
  </div>
</template>

<style scoped>
.hd { display: flex; flex-direction: column; gap: 4px; }
.pen { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 10px; padding: 16px 16px 16px 20px; border-radius: 16px; background: linear-gradient(135deg, #2a0f18, #1a0b13); border: 1px solid #6b2230; }
.pen::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 8px; background: repeating-linear-gradient(45deg, var(--lamp) 0 8px, #1a0b13 8px 16px); }
.pen-h { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.pen-h b { font-family: var(--head); font-size: 1.7rem; font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: .05em; color: var(--lamp); }
.pen-h .led { color: var(--lamp); font-size: 1.4rem; }
.bar { height: 10px; border-radius: 99px; background: #3a1a22; overflow: hidden; }
.bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--lamp), var(--mid)); transition: width .6s ease; }
.pen-f { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.tape { display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 6px; scrollbar-width: thin; }
.tape button { flex: 0 0 auto; min-width: 104px; display: flex; flex-direction: column; align-items: flex-start; gap: 0; border: 1px solid var(--line); background: var(--surface); border-radius: 12px; padding: 8px 14px; }
.tape b { font-family: var(--head); font-size: 1.2rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.tape small { color: var(--muted); }
.tape button.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.tape button.on small { color: #0a3b4a; }
.arena { display: flex; flex-direction: column; gap: 16px; }
.icecol, .notes { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.notes { gap: 16px; }
.hintline { min-height: 2.6em; color: var(--muted); font-size: .92rem; text-align: center; }
.hintline b { color: var(--ink); }
.bench { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 12px 8px 10px; }
.bench-h { display: flex; justify-content: space-between; align-items: center; padding: 0 8px 4px; }
.bench-r { display: flex; gap: 4px; overflow-x: auto; padding: 8px 4px 6px; }
.bench .puck { flex: 0 0 auto; width: 84px; }
.tasks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.tasks li { display: flex; flex-direction: column; gap: 3px; padding: 11px 14px; border-radius: 12px; background: var(--soft); border-left: 4px solid var(--line); }
.tasks li.bad { border-left-color: var(--bad); background: var(--bad-soft); }
.tasks li.mid { border-left-color: var(--mid); background: var(--mid-soft); }
.tasks li.good { border-left-color: var(--good); background: var(--good-soft); }
.tasks b { font-size: 1.02rem; }
.tasks .small { color: var(--muted); }
.wk { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.wk li { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.more summary { cursor: pointer; font-family: var(--head); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); }
.acc { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
.edit { max-width: 240px; }
@media (min-width: 900px) {
  .arena { display: grid; grid-template-columns: minmax(0, 540px) minmax(0, 1fr); align-items: start; gap: 24px; }
}
</style>
