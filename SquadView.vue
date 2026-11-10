<script setup>
import { mySquad } from './store.js'
import PlayerRow from './PlayerRow.vue'
</script>

<template>
  <header>
    <h1>Mein Kader</h1>
    <p class="muted small">Sortiert nach Note. Rechts der Höchstpreis, darunter der Preis im Spiel.</p>
  </header>
  <div class="list"><PlayerRow v-for="x in mySquad" :key="x.p.id" :x="x" price /></div>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 8px; }
</style>
