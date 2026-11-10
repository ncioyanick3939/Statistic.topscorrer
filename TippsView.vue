<script setup>
import { buyList, sellList, state } from './store.js'
import AskAI from './AskAI.vue'
import PlayerRow from './PlayerRow.vue'
</script>

<template>
  <header>
    <h1>Tipps</h1>
    <p class="muted small">Rechts steht der Höchstpreis: Darüber lohnt sich der Spieler im Topscorer-Spiel nicht mehr.</p>
  </header>

  <AskAI v-if="state.ai" />

  <section>
    <h2>Kaufen, wenn er weniger kostet</h2>
    <p class="muted small head">Die zehn Spieler mit dem besten erwarteten Spiel-Schnitt. Vergleiche den Höchstpreis mit dem Preis im Spiel.</p>
    <div class="list"><PlayerRow v-for="x in buyList" :key="x.p.id" :x="x" price /></div>
    <p class="small muted foot">Ø Punkte kenne ich nur von deinen Spielern. Bei allen anderen sind sie aus der Statistik geschätzt und können um rund 20 Punkte danebenliegen.</p>
  </section>

  <section>
    <h2>Verkaufen</h2>
    <p class="muted small head">Spieler aus deinem Kader, die im Spiel mehr kosten, als sie wert sind.</p>
    <div v-if="sellList.length" class="list"><PlayerRow v-for="x in sellList" :key="x.p.id" :x="x" price /></div>
    <p v-else class="muted">Zurzeit ist keiner deiner Spieler überbezahlt.</p>
  </section>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 8px; }
.head { margin: 4px 0 10px; }
.foot { margin-top: 10px; }
</style>
