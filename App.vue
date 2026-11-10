<script setup>
import { onMounted } from 'vue'
import { state, current, connectCloud } from './store.js'
import TabBar from './TabBar.vue'
import HeuteView from './HeuteView.vue'
import MarktView from './MarktView.vue'
import SpielerView from './SpielerView.vue'
import PlayerDetail from './PlayerDetail.vue'
import DataView from './DataView.vue'

onMounted(connectCloud)
</script>

<template>
  <header class="top"><b>Mein Topscorer-Team</b><span>Aufstellen, verkaufen, ersteigern</span></header>
  <main class="page">
    <PlayerDetail v-if="current && state.tab === 'spieler'" :x="current" />
    <HeuteView v-else-if="state.tab === 'heute'" />
    <MarktView v-else-if="state.tab === 'markt'" />
    <SpielerView v-else-if="state.tab === 'spieler'" />
    <DataView v-else />
  </main>
  <TabBar />
</template>
