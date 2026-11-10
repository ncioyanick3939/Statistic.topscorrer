<script setup>
import { computed, ref } from 'vue'
import { state, plan, ownedRated, baseLineup, toggleKeep, executePlan } from './store.js'
import MarketView from './MarketView.vue'
import AskAI from './AskAI.vue'
import { fmt } from './format.js'
const marketN = computed(() => Object.keys(state.market).length)
const confirm = ref(false)
const minus = computed(() => state.cash != null && state.cash < 0)
const left = computed(() => (plan.value ? ownedRated.value.length - plan.value.sold.length : 0))
function run() { executePlan(); confirm.value = false }
</script>

<template>
  <header class="pagehead">
    <div><h1>Markt</h1><p class="muted">Verkaufen, kaufen und das Konto im Plus halten</p></div>
    <span class="chip" :class="minus ? 'bad' : 'good'">{{ minus ? 'Konto im Minus' : 'Konto im Plus' }}</span>
  </header>

  <section class="kpis" aria-label="Kennzahlen">
    <div class="card kpi" :class="minus ? 'bad-b' : 'good-b'"><p class="lbl">Kontostand</p><b class="val num" :class="minus ? 'neg' : 'pos'">{{ state.cash == null ? '–' : fmt(state.cash) }}</b><p class="small">{{ minus ? 'Keine Punkte, solange im Minus' : 'Du bekommst Punkte' }}</p></div>
    <div class="card kpi"><p class="lbl">Verkauf bringt</p><b class="val num">{{ plan ? fmt(plan.sum) : '–' }}</b><p class="small">{{ plan ? plan.sold.length + ' Spieler laut Plan' : minus ? 'Mit 5 Verkäufen nicht möglich' : 'Nichts zu verkaufen' }}</p></div>
    <div class="card kpi"><p class="lbl">Punkte-Verlust</p><b class="val num">{{ plan ? '−' + Math.round(plan.loss) : '0' }}</b><p class="small">pro Spiel, von {{ Math.round(baseLineup.total) }}</p></div>
  </section>
  <div class="dash">
  <div class="dcol-side">
  <section class="card">
    <h2>Verkaufen</h2>
    <template v-if="!minus">
      <p>Dein Konto ist im Plus. Du musst nichts verkaufen.</p>
    </template>
    <template v-else-if="plan">
      <p>Du bist <b>{{ fmt(-state.cash) }}</b> im Minus. Verkaufe diese {{ plan.sold.length }} Spieler, dann bist du wieder im Plus und verlierst am wenigsten Punkte:</p>
      <ul class="sell">
        <li v-for="x in plan.sold" :key="x.p.id"><span class="nm"><b>{{ x.p.name }}</b><span class="muted small">{{ x.p.pos === 'G' ? 'Goalie' : x.p.pos === 'D' ? 'Verteidiger' : 'Stürmer' }}<template v-if="x.fc.inj"> · verletzt</template></span></span><b class="num">{{ fmt(x.w.mv) }}</b></li>
      </ul>
      <p>Das bringt <b>{{ fmt(plan.sum) }}</b>. Danach hast du <b>{{ fmt(state.cash + plan.sum) }}</b> auf dem Konto.</p>
      <p class="small muted">Danach hast du {{ left }} Spieler<template v-if="left <= 17"> und kaum Reserve</template>.</p>
      <template v-if="!confirm"><button type="button" class="btn" @click="confirm = true">Als verkauft eintragen</button></template>
      <template v-else>
        <p><b>Stimmt das? Hast du sie im Spiel verkauft?</b></p>
        <div class="two"><button type="button" class="btn" @click="run">Ja, eintragen</button><button type="button" class="btn ghost" @click="confirm = false">Abbrechen</button></div>
      </template>
    </template>
    <p v-else class="bad warn">Mit höchstens 5 Verkäufen reicht es nicht, solange du die Gesperrten behältst. Gib unten einen frei.</p>
    <details>
      <summary>Wen willst du auf jeden Fall behalten?</summary>
      <div class="keep">
        <button v-for="x in ownedRated.slice().sort((a, b) => a.p.name.localeCompare(b.p.name))" :key="x.p.id" type="button" :class="{ on: state.keep[x.p.id] }" @click="toggleKeep(x.p.id)">{{ x.p.name.split(' ')[0] }}</button>
      </div>
      <p class="small muted">Markierte Spieler verkaufe ich nie vor.</p>
    </details>
  </section>
  <AskAI v-if="state.ai" />
  </div>
  <div class="dcol-main"><MarketView /></div>
  </div>
</template>

<style scoped>
.sell { list-style: none; margin: 0; padding: 0; }
.nm { display: flex; flex-direction: column; min-width: 0; }
.sell li { display: flex; justify-content: space-between; gap: 10px; padding: 10px 0; border-top: 1px solid var(--line); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.warn { padding: 10px 12px; border-radius: 12px; }
summary { cursor: pointer; font-weight: 700; color: var(--accent); }
.keep { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
.keep button { border: 1px solid var(--line); background: var(--bg); border-radius: 999px; padding: 7px 13px; min-height: 40px; }
.keep button.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
</style>
