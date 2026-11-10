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
      <header class="top">
        <b><span class="brand-kicker">TEAM MANAGEMENT · HOCKEY</span>Mein Topscorer-Team</b>
        <span>Dein Kader. Deine Strategie. Dein nächster Spieltag.</span>
      </header>
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

<style>
.top b .brand-kicker { display: block; margin-bottom: 7px; color: #79d9e9; font-family: var(--body); font-size: .66rem; font-weight: 850; letter-spacing: .16em; }
</style>
