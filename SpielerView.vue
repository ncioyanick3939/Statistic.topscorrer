<script setup>
import { computed } from 'vue'
import { state, hits, rated, ownedRated, openPlayer, stand, ctx } from './store.js'
import { mio } from './format.js'
import PlayerRow from './PlayerRow.vue'
const found = computed(() => hits.value.slice(0, 8).map((p) => rated.value.find((x) => x.p.id === p.id)))
function onInput() { if (hits.value.length === 1) openPlayer(hits.value[0].id) }
const mine = computed(() => ownedRated.value.slice().sort((a, b) => b.r.score - a.r.score))
const teamValue = computed(() => ownedRated.value.reduce((s, x) => s + (x.w.mv || 0), 0))
const count = (call) => ownedRated.value.filter((x) => x.w.call === call).length
</script>

<template>
  <header class="pagehead">
    <div><h1>Kader</h1><p class="muted">Dein Team im Vergleich: Leistung, Form und Preis</p></div>
    <span class="chip good">Statistik vom {{ stand }}</span>
  </header>

  <section class="kpis" aria-label="Kennzahlen">
    <div class="card kpi"><p class="lbl">Spieler im Kader</p><b class="val num">{{ ownedRated.length }}</b><p class="small">höchstens 26 erlaubt</p></div>
    <div class="card kpi"><p class="lbl">Teamwert</p><b class="val num">{{ mio(teamValue) }}</b><p class="small">Preis im Spiel</p></div>
    <div class="card kpi"><p class="lbl">Überbezahlt</p><b class="val num neg">{{ count('sell') }}</b><p class="small">Verkaufskandidaten</p></div>
    <div class="card kpi"><p class="lbl">Günstig</p><b class="val num pos">{{ count('cheap') }}</b><p class="small">Behalten lohnt sich</p></div>
  </section>

  <div class="dash">
    <div class="dcol-side">
      <section class="card">
        <h2>Spieler suchen</h2>
        <input id="q" type="search" autocomplete="off" placeholder="Name eingeben, z. B. Malgin" v-model="state.query" @input="onInput" aria-label="Spielername" />
        <p v-if="state.query.trim().length >= 2 && !hits.length" class="muted">Kein Spieler mit diesem Namen gefunden.</p>
        <div v-if="found.length" class="list"><PlayerRow v-for="x in found" :key="x.p.id" :x="x" price /></div>
        <p class="small muted">{{ ctx.players.length }} Spieler in der Liga, Statistik vom {{ stand }}.</p>
      </section>
    </div>
    <div class="dcol-main">
      <section class="card">
        <h2>Mein Kader <span class="muted small">({{ mine.length }})</span></h2>
        <p class="muted small">Sortiert nach Note. Rechts der Höchstpreis, darunter der Preis im Spiel.</p>
        <div class="list2"><PlayerRow v-for="x in mine" :key="x.p.id" :x="x" price /></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 8px; }
</style>
