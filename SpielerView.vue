<script setup>
import { computed } from 'vue'
import { state, hits, rated, ownedRated, openPlayer, stand, ctx } from './store.js'
import PlayerRow from './PlayerRow.vue'
const found = computed(() => hits.value.slice(0, 8).map((p) => rated.value.find((x) => x.p.id === p.id)))
function onInput() { if (hits.value.length === 1) openPlayer(hits.value[0].id) }
const mine = computed(() => ownedRated.value.slice().sort((a, b) => b.r.score - a.r.score))
</script>

<template>
  <section class="card">
    <h2>Spieler suchen</h2>
    <input id="q" type="search" autocomplete="off" placeholder="Name eingeben, z. B. Malgin" v-model="state.query" @input="onInput" aria-label="Spielername" />
    <p v-if="state.query.trim().length >= 2 && !hits.length" class="muted">Kein Spieler mit diesem Namen gefunden.</p>
    <div v-if="found.length" class="list"><PlayerRow v-for="x in found" :key="x.p.id" :x="x" price /></div>
    <p class="small muted">{{ ctx.players.length }} Spieler, Statistik vom {{ stand }}.</p>
  </section>
  <section v-if="!found.length">
    <h2>Mein Kader</h2>
    <p class="muted small head">Sortiert nach Note. Rechts der Höchstpreis, darunter der Preis im Spiel.</p>
    <div class="list"><PlayerRow v-for="x in mine" :key="x.p.id" :x="x" price /></div>
  </section>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 8px; }
.head { margin: 4px 0 10px; }
</style>
