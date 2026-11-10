<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { fmt } from './format.js'
const props = defineProps({ points: Number, cash: Number, day: String, playing: Number })
const shown = ref(0)
let raf = 0
function run(to) {
  cancelAnimationFrame(raf)
  const from = shown.value
  const t0 = performance.now()
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 800)
    shown.value = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}
onMounted(() => run(props.points))
watch(() => props.points, run)
const minus = computed(() => props.cash != null && props.cash < 0)
</script>

<template>
  <section class="board" aria-label="Anzeigetafel">
    <div class="cell">
      <span class="cap">Erwartet · {{ day }}</span>
      <b class="led big">{{ shown }}</b>
      <span class="cap">Punkte · {{ playing }} von 16 spielen</span>
    </div>
    <div class="cell mid">
      <span class="cap">Wert in Franken</span>
      <b class="led">{{ fmt(shown * 50) }}</b>
      <span class="cap">1 Punkt = 50 CHF</span>
    </div>
    <div class="cell" :class="{ pen: minus }">
      <span class="cap"><i class="lamp" :class="{ on: minus }" aria-hidden="true"></i>Konto</span>
      <b class="led">{{ cash == null ? '–' : fmt(cash) }}</b>
      <span class="cap">{{ minus ? 'Strafbank: keine Punkte' : 'Frei: du punktest' }}</span>
    </div>
  </section>
</template>

<style scoped>
.board { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; overflow: hidden; border-radius: 16px; background: var(--line); }
.cell { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 4px; padding: 16px 18px; background: var(--surface); min-width: 0; }
.cell:first-child { grid-column: 1 / -1; align-items: center; text-align: center; }
.cap { font-family: var(--head); font-size: .82rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 7px; }
.led { color: var(--ink); font-size: 1.9rem; line-height: 1.1; font-weight: 800; font-variant-numeric: tabular-nums; }
.led.big { font-size: 4rem; color: var(--led); }
.pen .led { color: var(--lamp);  }
.lamp { width: 9px; height: 9px; border-radius: 50%; background: #5a3a48; }
.lamp.on { background: var(--lamp); box-shadow: 0 0 10px var(--lamp); animation: blink 1.1s steps(2, jump-none) infinite; }
@keyframes blink { 50% { opacity: .25; } }
@media (max-width: 480px) { .led { font-size: 1.45rem; } .led.big { font-size: 3.6rem; } }
@media (min-width: 768px) {
  .board { grid-template-columns: 1.2fr 1fr 1fr; }
  .cell:first-child { grid-column: auto; align-items: flex-start; text-align: left; }
  .led { font-size: 2.2rem; }
  .led.big { font-size: 5rem; }
}
@media (prefers-reduced-motion: reduce) { .lamp.on { animation: none; } }
</style>
