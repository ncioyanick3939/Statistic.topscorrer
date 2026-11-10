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
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
  background: var(--top); border-top: 1px solid var(--line);
  padding: 8px max(10px, env(safe-area-inset-right, 0px)) calc(8px + env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left, 0px));
}
button { border: 0; background: transparent; border-radius: 12px; padding: 8px 4px; font-weight: 700; font-size: 0.78rem; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 3px; min-height: 52px; }
button.on { background: var(--accent); color: var(--accent-ink); }
@media (min-width: 768px) { .bar { display: none; } }
</style>
