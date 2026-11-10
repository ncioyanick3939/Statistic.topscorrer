<script setup>
import { state, stand } from './store.js'
import { TABS, go } from './nav.js'
</script>

<template>
  <aside class="side" aria-label="Hauptnavigation">
    <div class="brand"><span class="logo" aria-hidden="true">T</span><div><b>Topscorer AI</b><small>Mein Team</small></div></div>
    <nav>
      <button v-for="t in TABS" :key="t.id" type="button" :class="{ on: state.tab === t.id }" :aria-current="state.tab === t.id ? 'page' : null" @click="go(t.id)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="t.icon" /></svg>
        {{ t.label }}
      </button>
    </nav>
    <p class="stand small">Statistik vom {{ stand }}</p>
  </aside>
</template>

<style scoped>
.side { display: none; }
@media (min-width: 768px) {
  .side { display: flex; flex-direction: column; gap: 22px; position: sticky; top: 0; height: 100vh; padding: 22px 14px; background: var(--top); border-right: 1px solid var(--line); }
}
.brand { display: flex; align-items: center; gap: 11px; padding: 0 8px; }
.brand b { display: block; font-family: var(--head); font-size: 1.1rem; font-weight: 800; }
.brand small { color: var(--muted); font-size: 0.78rem; }
.logo { width: 38px; height: 38px; border-radius: 11px; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; font-family: var(--head); font-weight: 800; font-size: 1.3rem; }
nav { display: flex; flex-direction: column; gap: 4px; }
nav button { display: flex; align-items: center; gap: 12px; border: 0; background: transparent; color: var(--muted); font-weight: 700; font-size: 1rem; padding: 12px 14px; border-radius: 12px; text-align: left; }
nav button:hover { background: var(--soft); color: var(--ink); }
nav button.on { background: var(--accent); color: var(--accent-ink); }
.stand { margin-top: auto; color: var(--muted); padding: 0 8px; }
</style>
