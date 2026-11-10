<script setup>
import { state } from './store.js'
import { TABS, go } from './nav.js'
</script>

<template>
  <nav class="bar" aria-label="Bereiche">
    <button v-for="t in TABS" :key="t.id" type="button" :class="{ on: state.tab === t.id }" :aria-current="state.tab === t.id ? 'page' : null" @click="go(t.id)">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="t.icon" /></svg>
      <span>{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 7; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); background: color-mix(in srgb, var(--top) 94%, transparent); backdrop-filter: blur(16px); border-top: 1px solid var(--line); padding: 6px max(8px, env(safe-area-inset-right, 0px)) calc(6px + env(safe-area-inset-bottom, 0px)) max(8px, env(safe-area-inset-left, 0px)); }
button { position: relative; min-height: 54px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border: 0; background: transparent; color: var(--muted); font-family: var(--head); font-size: .95rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
button.on { color: var(--accent); }
button.on::before { content: ''; position: absolute; top: -7px; left: 28%; right: 28%; height: 3px; border-radius: 0 0 4px 4px; background: var(--lamp); box-shadow: 0 0 12px var(--lamp); }
@media (min-width: 768px) { .bar { display: none; } }
</style>
