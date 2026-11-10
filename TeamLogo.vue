<script setup>
import { ref } from 'vue'
import { TEAMS } from './data.js'
defineProps({ team: String, size: { type: Number, default: 40 } })
const bad = ref(false)
</script>

<template>
  <img v-if="!bad" class="tl" :src="'logos/' + team + '.png'" :alt="TEAMS[team] ? TEAMS[team][0] : team" :width="size" :height="size" @error="bad = true" />
  <span v-else class="tl fb" :style="{ width: size + 'px', height: size + 'px' }">{{ team }}</span>
</template>

<style scoped>
.tl { display: inline-block; object-fit: contain; flex: 0 0 auto; }
.fb { display: inline-grid; place-items: center; border-radius: 50%; background: var(--soft); font-family: var(--head); font-weight: 800; font-size: .7rem; letter-spacing: .06em; }
</style>
