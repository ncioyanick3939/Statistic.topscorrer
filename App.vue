<script setup>
import { computed, onMounted } from 'vue'
import { state, current, connectCloud } from './store.js'
import TopNav from './TopNav.vue'
import TabBar from './TabBar.vue'
import HeuteView from './HeuteView.vue'
import MarktView from './MarktView.vue'
import SpielerView from './SpielerView.vue'
import PlayerDetail from './PlayerDetail.vue'
import DataView from './DataView.vue'

onMounted(connectCloud)
const wide = computed(() => state.tab === 'heute' || state.tab === 'markt' || (state.tab === 'spieler' && !current.value))
</script>

<template>
  <TopNav />
  <main class="page" :class="{ wide }">
    <PlayerDetail v-if="current && state.tab === 'spieler'" :x="current" />
    <HeuteView v-else-if="state.tab === 'heute'" />
    <MarktView v-else-if="state.tab === 'markt'" />
    <SpielerView v-else-if="state.tab === 'spieler'" />
    <DataView v-else />
  </main>
  <TabBar />
</template>

