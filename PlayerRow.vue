<script setup>
import { computed } from 'vue'
import { TEAMS } from './data.js'
import { openPlayer } from './store.js'
const props = defineProps({ x: Object })
const t = computed(() => TEAMS[props.x.p.team])
const next = computed(() => {
  const fc = props.x.fc
  if (fc.inj) return ['out', 'verletzt']
  return fc.type === 'G' ? [fc.next.ga.toFixed(1), 'Gegentore/Sp.'] : [fc.next.pts.toFixed(1), 'Punkte']
})
</script>

<template>
  <button type="button" class="row" @click="openPlayer(x.p.id)">
    <span class="dot" :style="{ background: t[1], color: t[2] }">{{ x.p.team.slice(0, 3) }}</span>
    <span class="who"><b>{{ x.p.name }}</b><span class="muted small">{{ t[0] }} · {{ x.p.pos === 'F' ? 'Stürmer' : x.p.pos === 'D' ? 'Verteidiger' : 'Torhüter' }}</span></span>
    <span class="fc num"><b>{{ next[0] }}</b><span class="small muted">{{ next[1] }}</span></span>
    <span class="chip" :class="x.r.cls">{{ x.r.score }}</span>
  </button>
</template>

<style scoped>
.row { width: 100%; display: grid; grid-template-columns: 42px 1fr auto 46px; gap: 12px; align-items: center; text-align: left; background: var(--surface); border: 1.5px solid var(--line); border-radius: 14px; padding: 10px 12px; }
.dot { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.03em; }
.who { min-width: 0; display: flex; flex-direction: column; }
.who b { overflow-wrap: anywhere; }
.fc { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.fc b { font-family: var(--head); font-size: 1.15rem; }
.chip { text-align: center; padding-inline: 0; }
</style>
