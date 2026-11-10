<script setup>
import { onMounted } from 'vue'
import { state, current, connectCloud } from './store.js'
import Sidebar from './Sidebar.vue'
import TabBar from './TabBar.vue'
import HeuteView from './HeuteView.vue'
import MarktView from './MarktView.vue'
import SpielerView from './SpielerView.vue'
import PlayerDetail from './PlayerDetail.vue'
import DataView from './DataView.vue'

onMounted(connectCloud)
</script>

<template>
  <div class="shell">
    <Sidebar />
    <div class="content">
      <header class="top"><b>Topscorer AI</b><span>Mein Team</span></header>
      <main class="page" :class="{ wide: state.tab === 'heute' }">
        <PlayerDetail v-if="current && state.tab === 'spieler'" :x="current" />
        <HeuteView v-else-if="state.tab === 'heute'" />
        <MarktView v-else-if="state.tab === 'markt'" />
        <SpielerView v-else-if="state.tab === 'spieler'" />
        <DataView v-else />
      </main>
    </div>
  </div>
  <TabBar />
</template>
