<script setup>
import { state } from './store.js'
import { TABS, go } from './nav.js'
</script>

<template>
  <nav class="bar" aria-label="Bereiche">
    <button v-for="t in TABS" :key="t.id" type="button" :class="{ on: state.tab === t.id }" :aria-current="state.tab === t.id ? 'page' : null" @click="go(t.id)">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="t.icon" /></svg>
      <span>{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bar { position: fixed; z-index: 7; left: max(14px, env(safe-area-inset-left, 0px)); right: max(14px, env(safe-area-inset-right, 0px)); bottom: calc(12px + env(safe-area-inset-bottom, 0px)); max-width: 560px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; padding: 6px; border-radius: 999px; background: rgba(62, 78, 118, .82); backdrop-filter: blur(18px); box-shadow: 0 10px 30px rgba(0, 0, 0, .45), inset 0 0 0 1px rgba(255, 255, 255, .1); }
button { min-height: 58px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border: 0; border-radius: 999px; background: transparent; color: #e4e9f5; font-size: .95rem; font-weight: 600; }
button.on { background: #1b2a4c; color: var(--accent); }
</style>
