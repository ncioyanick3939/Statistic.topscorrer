<script setup>
import { TEAMS } from './data.js'
defineProps({ games: Array, goalie: Boolean })
</script>

<template>
  <ol class="games">
    <li v-for="g in games" :key="g.date + g.opp">
      <span class="day">{{ g.label }}</span>
      <span class="opp"><b>{{ g.home ? 'gegen' : 'bei' }} {{ TEAMS[g.opp][0] }}</b></span>
      <span class="meter" aria-hidden="true"><i :style="{ width: Math.round((goalie ? g.start : g.pPoint) * 100) + '%' }"></i></span>
      <span class="val num">{{ goalie ? g.ga.toFixed(1) : Math.round(g.pPoint * 100) + ' %' }}</span>
    </li>
  </ol>
  <p class="small muted">{{ goalie ? 'Balken: Einsatzchance. Zahl: erwartete Gegentore, falls er im Tor steht.' : 'Chance auf mindestens einen Skorerpunkt pro Spiel.' }}</p>
</template>

<style scoped>
.games { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { display: grid; grid-template-columns: 62px 1fr 64px 52px; gap: 10px; align-items: center; font-size: 0.92rem; }
.day { color: var(--muted); font-weight: 700; font-size: 0.82rem; }
.opp { min-width: 0; overflow-wrap: anywhere; }
.meter { height: 8px; background: var(--soft); border-radius: 4px; overflow: hidden; }
.meter i { display: block; height: 100%; background: var(--accent); border-radius: 4px; }
.val { text-align: right; font-weight: 700; }
@media (max-width: 420px) { li { grid-template-columns: 54px 1fr 44px 48px; gap: 8px; } }
</style>
