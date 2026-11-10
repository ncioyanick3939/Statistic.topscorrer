<script setup>
import { mySquad, state, setCash, importsInLineup } from './store.js'
const fmt = (n) => (n < 0 ? '−' : '') + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
import PlayerRow from './PlayerRow.vue'
</script>

<template>
  <header>
    <h1>Mein Kader</h1>
    <p class="muted small">Sortiert nach Note. Rechts der Höchstpreis, darunter der Preis im Spiel.</p>
  </header>
  <section class="card">
    <label for="cash">Kontostand im Spiel</label>
    <input id="cash" type="number" step="1000" :value="state.cash" placeholder="z. B. -1770000" @change="setCash($event.target.value)" />
    <p class="small" :class="state.cash != null && state.cash < 0 ? 'bad' : 'muted'" style="padding: 0 2px">{{ state.cash == null ? 'Trag ihn einmal ein. Kauf und Verkauf in der App rechnen ihn dann mit.' : (state.cash < 0 ? 'Im Minus: ' : 'Guthaben: ') + fmt(state.cash) }}</p>
    <p v-if="state.cash != null && state.cash < 0" class="small bad warn">Bei Spielbeginn darf das Konto nicht im Minus sein, sonst gibt es an dem Spieltag keine Punkte. Das Minus darf zwischen den Spieltagen höchstens 33 % deines Kaderwerts betragen.</p>
    <p class="small muted" style="padding: 0 2px">Imports in der Aufstellung: {{ importsInLineup }} von höchstens 6.</p>
  </section>
  <div class="list"><PlayerRow v-for="x in mySquad" :key="x.p.id" :x="x" price /></div>
</template>

<style scoped>
.warn { padding: 8px 12px; border-radius: 10px; }
.list { display: flex; flex-direction: column; gap: 8px; }
</style>
