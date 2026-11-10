<script setup>
import { mySquad, state, setCash } from './store.js'
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
  </section>
  <div class="list"><PlayerRow v-for="x in mySquad" :key="x.p.id" :x="x" price /></div>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 8px; }
</style>
