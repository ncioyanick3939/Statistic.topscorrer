<script setup>
import { state, stand } from './store.js'
import { TABS, go } from './nav.js'
</script>

<template>
  <header class="tn">
    <div class="in">
      <div class="brand"><span class="logo" aria-hidden="true">T</span><b>Topscorer <i>AI</i></b></div>
      <nav class="tabs" aria-label="Hauptnavigation">
        <button v-for="t in TABS" :key="t.id" type="button" :class="{ on: state.tab === t.id }" :aria-current="state.tab === t.id ? 'page' : null" @click="go(t.id)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="t.icon" /></svg>{{ t.label }}
        </button>
      </nav>
      <span class="stand small">Stand {{ stand }}</span>
    </div>
  </header>
</template>

<style scoped>
.tn { position: sticky; top: 0; z-index: 6; background: color-mix(in srgb, var(--top) 94%, transparent); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); padding-top: env(safe-area-inset-top, 0px); }
.in { max-width: 1180px; margin: 0 auto; display: flex; align-items: center; gap: 18px; padding: 10px max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px)); }
.brand { display: flex; align-items: center; gap: 10px; }
.brand b { font-family: var(--head); font-size: 1.35rem; font-weight: 800; font-style: italic; letter-spacing: .04em; text-transform: uppercase; }
.brand i { color: var(--accent); }
.logo { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; background: linear-gradient(135deg, var(--accent), #3aa7d6); color: var(--accent-ink); font-family: var(--head); font-weight: 800; font-size: 1.25rem; transform: skewX(-8deg); }
.tabs { display: none; gap: 4px; margin-left: 10px; }
.tabs button { display: flex; align-items: center; gap: 8px; border: 0; background: transparent; color: var(--muted); font-family: var(--head); font-size: 1.1rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 9px 16px; border-radius: 10px; }
.tabs button:hover { color: var(--ink); background: var(--soft); }
.tabs button.on { color: var(--accent-ink); background: var(--accent); }
.stand { margin-left: auto; color: var(--muted); }
@media (min-width: 768px) { .tabs { display: flex; } }
</style>
