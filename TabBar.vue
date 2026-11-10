<script setup>
import { state } from './store.js'
import { TABS, go } from './nav.js'
</script>

<template>
  <nav class="bar" aria-label="Bereiche">
    <button v-for="t in TABS" :key="t.id" type="button" :class="{ on: state.tab === t.id }" :aria-current="state.tab === t.id ? 'page' : null" @click="go(t.id)">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="t.icon" /></svg>
      <span>{{ t.label }}</span>
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
  min-width: 0; min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  border: 1px solid transparent; background: transparent; border-radius: 13px; padding: 5px 4px;
  color: var(--muted); font-size: .78rem; font-weight: 750;
}
button.on { color: var(--accent); background: rgba(101,213,232,.12); border-color: rgba(101,213,232,.2); }
@media (min-width: 768px) { .bar { display: none; } }
</style>
