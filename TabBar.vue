<script setup>
import { state, closePlayer } from './store.js'
const tabs = [
  ['heute', 'Heute', '⌂'],
  ['markt', 'Markt', '⇄'],
  ['spieler', 'Kader', '◎'],
  ['daten', 'Daten', '▤']
]
function go(id) { state.tab = id; if (id === 'spieler') closePlayer() }
</script>

<template>
  <nav class="bar" aria-label="Hauptnavigation">
    <button v-for="t in tabs" :key="t[0]" type="button" :class="{ on: state.tab === t[0] }" :aria-current="state.tab === t[0] ? 'page' : null" @click="go(t[0])">
      <span class="nav-icon" aria-hidden="true">{{ t[2] }}</span>
      <span>{{ t[1] }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 5;
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border-top: 1px solid var(--line); box-shadow: 0 -8px 28px rgba(0,0,0,.16);
  backdrop-filter: blur(18px);
  padding: 8px max(10px, env(safe-area-inset-right, 0px)) calc(8px + env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left, 0px));
}
button {
  min-width: 0; min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
  border: 1px solid transparent; background: transparent; border-radius: 13px; padding: 5px 4px;
  color: var(--muted); font-size: .78rem; font-weight: 750;
}
.nav-icon { font-size: 1.2rem; line-height: 1.15; }
button.on { color: var(--accent); background: rgba(101,213,232,.12); border-color: rgba(101,213,232,.2); }
</style>
