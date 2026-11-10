<script setup>
import { onMounted } from 'vue'
import { state, current, connectCloud } from './store.js'
import TabBar from './TabBar.vue'
import SearchView from './SearchView.vue'
import PlayerDetail from './PlayerDetail.vue'
import TippsView from './TippsView.vue'
import SquadView from './SquadView.vue'
import LeagueView from './LeagueView.vue'
import DataView from './DataView.vue'

onMounted(connectCloud)
</script>

<template>
  <main class="page">
    <PlayerDetail v-if="current && state.tab === 'spieler'" :x="current" />
    <SearchView v-else-if="state.tab === 'spieler'" />
    <TippsView v-else-if="state.tab === 'tipps'" />
    <SquadView v-else-if="state.tab === 'kader'" />
    <LeagueView v-else-if="state.tab === 'liga'" />
    <DataView v-else />
  </main>
  <TabBar />
</template>
