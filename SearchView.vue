<script setup>
import { state, hits, hotList, openPlayer, stand, ctx } from './store.js'
import PlayerRow from './PlayerRow.vue'
import { rated } from './store.js'
import { computed } from 'vue'
const found = computed(() => hits.value.slice(0, 8).map((p) => rated.value.find((x) => x.p.id === p.id)))
function onInput() { if (hits.value.length === 1) openPlayer(hits.value[0].id) }
</script>

<template>
  <header>
    <h1>Topscorer-Check</h1>
    <p class="muted small">{{ ctx.players.length }} Spieler der National League · Stand {{ stand }}</p>
  </header>
  <section class="card">
    <label for="q">Welcher Spieler?</label>
    <input id="q" type="search" autocomplete="off" placeholder="Name eingeben, z. B. Malgin" v-model="state.query" @input="onInput" />
    <p v-if="state.query.trim().length >= 2 && !hits.length" class="muted">Kein Spieler mit diesem Namen gefunden.</p>
    <div v-if="found.length" class="list"><PlayerRow v-for="x in found" :key="x.p.id" :x="x" /></div>
  </section>
  <section v-if="!found.length">
    <h2>Die heissesten Zehn</h2>
    <p class="muted small head">Meiste erwartete Punkte in den nächsten Spielen</p>
    <div class="list"><PlayerRow v-for="x in hotList" :key="x.p.id" :x="x" /></div>
  </section>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 8px; }
.head { margin: 4px 0 10px; }
</style>
