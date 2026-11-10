<script setup>
import { computed, ref } from 'vue'
import { state, plan, ownedRated, baseLineup, toggleKeep, executePlan } from './store.js'
import { fmt, surname } from './format.js'
import MarketView from './MarketView.vue'
import AskAI from './AskAI.vue'
const confirm = ref(false)
const minus = computed(() => state.cash != null && state.cash < 0)
const left = computed(() => (plan.value ? ownedRated.value.length - plan.value.sold.length : 0))
const cover = computed(() => (plan.value && minus.value ? Math.min(100, Math.round((plan.value.sum / -state.cash) * 100)) : 0))
const POS = { G: 'Goalie', D: 'Verteidiger', F: 'Stürmer' }
function run() { executePlan(); confirm.value = false }
</script>

<template>
  <header class="hd"><h1>Markt</h1><p class="muted">Raus aus der Strafbank, rein in die Auktion.</p></header>

  <div class="cols">
    <div class="col">
      <section class="pen" :class="{ free: !minus }">
        <div class="pen-h"><b>{{ minus ? 'Strafbank' : 'Freie Fahrt' }}</b><span class="led">{{ state.cash == null ? '–' : fmt(state.cash) }}</span></div>
        <template v-if="!minus"><p>Dein Konto ist im Plus. Du bekommst Punkte und musst nichts verkaufen.</p></template>
        <template v-else-if="plan">
          <p>Verkaufe diese {{ plan.sold.length }} Spieler und du bist wieder im Plus. Du verlierst dabei am wenigsten Punkte.</p>
          <ul class="sell">
            <li v-for="x in plan.sold" :key="x.p.id"><span class="nm"><b>{{ x.p.name }}</b><span class="muted small">{{ POS[x.p.pos] }}<template v-if="x.fc.inj"> · verletzt</template></span></span><b class="led">{{ fmt(x.w.mv) }}</b></li>
          </ul>
          <div class="bar" role="img" :aria-label="'Plan deckt ' + cover + ' Prozent'"><span :style="{ width: cover + '%' }"></span></div>
          <p class="small">Der Plan bringt <b>{{ fmt(plan.sum) }}</b>. Danach hast du <b>{{ fmt(state.cash + plan.sum) }}</b> auf dem Konto, rund {{ Math.round(plan.loss) }} Punkte pro Spiel weniger (von {{ Math.round(baseLineup.total) }}), und {{ left }} Spieler<template v-if="left <= 17"> ohne viel Reserve</template>.</p>
          <button v-if="!confirm" type="button" class="btn" @click="confirm = true">Als verkauft eintragen</button>
          <template v-else>
            <p><b>Hast du sie im Spiel wirklich verkauft?</b></p>
            <div class="two"><button type="button" class="btn" @click="run">Ja, eintragen</button><button type="button" class="btn ghost" @click="confirm = false">Abbrechen</button></div>
          </template>
        </template>
        <p v-else class="warnbox">Mit höchstens 5 Verkäufen reicht es nicht, solange du die Gesperrten behältst. Gib unten einen frei.</p>
        <details class="more">
          <summary>Wen willst du auf jeden Fall behalten?</summary>
          <div class="keep">
            <button v-for="x in ownedRated.slice().sort((a, b) => a.p.name.localeCompare(b.p.name))" :key="x.p.id" type="button" :class="{ on: state.keep[x.p.id] }" @click="toggleKeep(x.p.id)">{{ surname(x.p.name) }}</button>
          </div>
          <p class="small muted">Markierte Spieler verkaufe ich nie vor.</p>
        </details>
      </section>
      <AskAI v-if="state.ai" />
    </div>
    <div class="col"><MarketView /></div>
  </div>
</template>

<style scoped>
.hd { display: flex; flex-direction: column; gap: 4px; }
.cols { display: flex; flex-direction: column; gap: 16px; }
.col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
@media (min-width: 900px) { .cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 24px; align-items: start; } }
.pen { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 12px; padding: 18px 18px 18px 24px; border-radius: 16px; background: linear-gradient(135deg, #2a0f18, #1a0b13); border: 1px solid #6b2230; }
.pen::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 8px; background: repeating-linear-gradient(45deg, var(--lamp) 0 8px, #1a0b13 8px 16px); }
.pen.free { background: linear-gradient(135deg, #0b2a1f, #0a1a17); border-color: #1d6b4c; }
.pen.free::before { background: var(--good); }
.pen-h { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.pen-h b { font-family: var(--head); font-size: 1.7rem; font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: .05em; color: var(--lamp); }
.free .pen-h b, .free .pen-h .led { color: var(--good); }
.pen-h .led { color: var(--lamp); font-size: 1.4rem; }
.sell { list-style: none; margin: 0; padding: 0; }
.sell li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, .1); }
.sell .led { color: var(--led); font-size: 1.1rem; }
.nm { display: flex; flex-direction: column; min-width: 0; }
.bar { height: 10px; border-radius: 99px; background: #3a1a22; overflow: hidden; }
.bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--lamp), var(--good)); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.warnbox { padding: 10px 12px; border-radius: 12px; background: var(--bad-soft); color: var(--bad); }
.more summary { cursor: pointer; font-family: var(--head); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); }
.keep { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
.keep button { border: 1px solid var(--line); background: #0a1120; border-radius: 999px; padding: 7px 13px; min-height: 40px; }
.keep button.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
</style>
