<script setup>
import { state, closePlayer } from './store.js'
const tabs = [['spieler', 'Suche'], ['kader', 'Mein Kader'], ['liga', 'Liga'], ['daten', 'Daten']]
function go(id) { state.tab = id; if (id === 'spieler') closePlayer() }
</script>

<template>
  <nav class="bar" aria-label="Bereiche">
    <button v-for="t in tabs" :key="t[0]" type="button" :class="{ on: state.tab === t[0] }" :aria-current="state.tab === t[0] ? 'page' : null" @click="go(t[0])">{{ t[1] }}</button>
  </nav>
</template>

<style scoped>
.bar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
  background: var(--surface); border-top: 1.5px solid var(--line);
  padding: 8px max(10px, env(safe-area-inset-right, 0px)) calc(8px + env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left, 0px));
}
button { border: 0; background: transparent; border-radius: 12px; padding: 11px 4px; font-weight: 700; font-size: 0.88rem; color: var(--muted); }
button.on { background: var(--ink); color: var(--bg); }
</style>
