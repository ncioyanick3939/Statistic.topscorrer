<script setup>
import { computed } from 'vue'
import { TEAMS } from './data.js'
import { openPlayer } from './store.js'
import { k } from './format.js'
const props = defineProps({ x: Object })
const t = computed(() => TEAMS[props.x.p.team])
const tier = computed(() => (props.x.r.score >= 80 ? 'gold' : props.x.r.score >= 60 ? 'silver' : 'bronze'))
const POS = { G: 'Goalie', D: 'Verteidiger', F: 'Stürmer' }
const CALL = { sell: ['überbezahlt', 'bad'], cheap: ['günstig', 'good'], fair: ['fairer Preis', 'mid'] }
const call = computed(() => CALL[props.x.w.call])
</script>

<template>
  <button type="button" class="pc" :class="tier" @click="openPlayer(x.p.id)">
    <span class="top" :style="{ background: t[1], color: t[2] }"><b>{{ x.p.team }}</b><span>{{ POS[x.p.pos] }}</span></span>
    <span class="score led">{{ x.r.score }}</span>
    <span class="nm">{{ x.p.name }}</span>
    <span class="row"><span>Höchstpreis</span><b class="num">{{ k(x.w.max) }}</b></span>
    <span class="row"><span>Preis im Spiel</span><b class="num">{{ k(x.w.mv) }}</b></span>
    <span v-if="call" class="chip" :class="call[1]">{{ call[0] }}</span>
  </button>
</template>

<style scoped>
.pc { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 7px; text-align: left; padding: 0 0 12px; border-radius: 16px; background: linear-gradient(170deg, #1a2742, #0e1627); border: 2px solid var(--edge, var(--line)); box-shadow: 0 10px 24px rgba(0, 0, 0, .35); transition: transform .2s ease, box-shadow .2s ease; }
.pc:hover { transform: translateY(-5px) rotate(-.8deg); box-shadow: 0 18px 34px rgba(0, 0, 0, .5); }
.pc > :not(.top) { margin-inline: 14px; }
.top { display: flex; justify-content: space-between; align-items: center; padding: 7px 14px; font-family: var(--head); font-weight: 800; letter-spacing: .1em; text-transform: uppercase; font-size: .95rem; }
.top span { opacity: .85; font-weight: 600; letter-spacing: .06em; }
.score { font-size: 3.1rem; line-height: 1; margin-top: 4px; color: var(--tier); text-shadow: 0 0 14px color-mix(in srgb, var(--tier) 55%, transparent); }
.nm { font-family: var(--head); font-size: 1.35rem; font-weight: 700; line-height: 1.1; text-transform: uppercase; letter-spacing: .02em; min-height: 2.2em; display: flex; align-items: flex-end; }
.row { display: flex; justify-content: space-between; gap: 8px; font-size: .88rem; color: var(--muted); border-top: 1px solid var(--line); padding-top: 6px; }
.row b { color: var(--ink); }
.chip { margin-top: 2px; }
.gold { --tier: #ffd35c; --edge: #c99a2e; }
.gold::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(115deg, transparent 30%, rgba(255, 236, 170, .22) 48%, transparent 66%); background-size: 250% 100%; animation: foil 4.5s ease-in-out infinite; }
.silver { --tier: #d5e3f5; --edge: #7c8ca6; }
.bronze { --tier: #e0996a; --edge: #8a5a3c; }
@keyframes foil { from { background-position: 130% 0; } to { background-position: -60% 0; } }
@media (prefers-reduced-motion: reduce) { .gold::after { animation: none; } .pc:hover { transform: none; } }
</style>
