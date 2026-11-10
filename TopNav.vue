<script setup>
import { stand } from './store.js'
</script>

<template>
  <header class="tn">
    <div class="in">
      <span class="season">Saison 26/27 <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
      <svg class="star" viewBox="0 0 48 48" width="40" height="40" aria-label="Topscorer"><path d="M20 4l5.2 12.2 13.3.9-10.2 8.6 3.3 13-11.6-7.1-11.5 7.1 3.2-13L3.5 17.1l13.3-.9z" fill="#1a2238" /><ellipse cx="34" cy="17" rx="10" ry="7" transform="rotate(-24 34 17)" fill="#1a2238" /><path d="M27 18c4-5 11-6 15-3" fill="none" stroke="#f7c948" stroke-width="2" stroke-linecap="round" /></svg>
      <span class="stand">{{ stand }}</span>
    </div>
  </header>
</template>

<style scoped>
.tn { position: sticky; top: 0; z-index: 6; background: var(--top); padding-top: env(safe-area-inset-top, 0px); color: var(--accent-ink); }
.in { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; padding: 10px max(16px, env(safe-area-inset-right, 0px)) 12px max(16px, env(safe-area-inset-left, 0px)); }
.season { justify-self: start; display: inline-flex; align-items: center; gap: 10px; padding: 11px 18px; border-radius: 999px; background: #e4b631; box-shadow: inset 0 -2px 4px rgba(0,0,0,.12); font-weight: 800; font-size: .95rem; white-space: nowrap; }
.star { justify-self: center; }
.stand { justify-self: end; display: grid; place-items: center; min-width: 46px; padding: 0 14px; height: 44px; border-radius: 999px; background: #e4b631; font-size: .8rem; font-weight: 800; box-shadow: inset 0 -2px 4px rgba(0,0,0,.12); }
@media (max-width: 480px) { .stand { padding: 0; width: 44px; font-size: 0; } .stand::before { content: '⟳'; font-size: 1.3rem; } }
</style>
