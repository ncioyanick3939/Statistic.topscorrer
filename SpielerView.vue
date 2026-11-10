<script setup>
import { computed, ref } from 'vue'
import { state, hits, rated, ownedRated, openPlayer, ctx } from './store.js'
import PlayerCard from './PlayerCard.vue'
const found = computed(() => hits.value.slice(0, 12).map((p) => rated.value.find((x) => x.p.id === p.id)).filter(Boolean))
function onInput() { if (hits.value.length === 1) openPlayer(hits.value[0].id) }
const filter = ref('all')
const FILTERS = [['all', 'Alle'], ['F', 'Stürmer'], ['D', 'Verteidiger'], ['G', 'Goalies'], ['sell', 'Verkaufen']]
const mine = computed(() => ownedRated.value.filter((x) => filter.value === 'all' || (filter.value === 'sell' ? x.w.call === 'sell' : x.p.pos === filter.value)).sort((a, b) => b.r.score - a.r.score))
</script>

<template>
  <header class="hd"><h1>Karten</h1><p class="muted">Dein Team als Sammlung. Gold ab Note 80, Silber ab 60.</p></header>

  <div class="search">
    <input id="q" type="search" autocomplete="off" :placeholder="'Spieler suchen, z. B. Malgin (' + ctx.players.length + ' in der Liga)'" v-model="state.query" @input="onInput" aria-label="Spielername" />
  </div>
  <p v-if="state.query.trim().length >= 2 && !hits.length" class="muted">Kein Spieler mit diesem Namen gefunden.</p>
  <section v-if="found.length" aria-label="Suchergebnisse"><div class="grid"><PlayerCard v-for="x in found" :key="x.p.id" :x="x" /></div></section>

  <template v-else>
    <div class="chips" role="group" aria-label="Filter">
      <button v-for="f in FILTERS" :key="f[0]" type="button" :class="{ on: filter === f[0] }" @click="filter = f[0]">{{ f[1] }}</button>
    </div>
    <div class="grid"><PlayerCard v-for="x in mine" :key="x.p.id" :x="x" /></div>
    <p v-if="!mine.length" class="muted">Keine Spieler in diesem Filter.</p>
  </template>
</template>

<style scoped>
.hd { display: flex; flex-direction: column; gap: 4px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.chips button { flex: 0 0 auto; border: 1px solid var(--line); background: var(--surface); border-radius: 10px; padding: 8px 16px; font-family: var(--head); font-size: 1.05rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.chips button.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; } }
</style>
