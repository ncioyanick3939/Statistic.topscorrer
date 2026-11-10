<script setup>
import { mySquad } from './store.js'
import PlayerRow from './PlayerRow.vue'
</script>

<template>
  <header>
    <h1>Mein Kader</h1>
    <p class="muted small">Sortiert nach Note. Rechts die erwarteten Punkte der nächsten Spiele.</p>
  </header>
  <div class="list"><PlayerRow v-for="x in mySquad" :key="x.p.id" :x="x" /></div>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 8px; }
</style>
