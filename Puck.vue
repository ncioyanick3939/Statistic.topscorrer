<script setup>
import { computed } from 'vue'
import { TEAMS, MY_SQUAD } from './data.js'
import { gameOn } from './team.js'
import { surname } from './format.js'
const props = defineProps({ e: Object, day: String, selected: Boolean, hint: Boolean })
defineEmits(['pick'])
const x = computed(() => props.e.x)
const t = computed(() => TEAMS[x.value.p.team])
const imp = computed(() => MY_SQUAD[x.value.p.id] && MY_SQUAD[x.value.p.id][4] === 1)
const tone = computed(() => (props.e.v >= 80 ? 'good' : props.e.v >= 50 ? 'mid' : props.e.v > 0 ? 'low' : 'off'))
const info = computed(() => { if (x.value.fc.inj) return 'verletzt'; const g = gameOn(x.value.p.team, props.day); return g ? (g.home ? 'vs ' : '@ ') + g.opp : 'spielfrei' })
</script>

<template>
  <button type="button" class="puck" :class="[tone, { sel: selected, hint }]" :aria-pressed="selected" :aria-label="x.p.name + ', ' + info + ', ' + (e.v || 0) + ' Punkte'" @click="$emit('pick', x.p.id)">
    <span class="disc" :style="{ '--tc': t[1], '--tx': t[2] }">
      <em class="tm">{{ x.p.team }}</em>
      <i class="v led">{{ e.v || '–' }}</i>
      <span v-if="x.fc.inj" class="flag inj">+</span>
      <span v-else-if="imp" class="flag imp">IMP</span>
    </span>
    <b class="nm">{{ surname(x.p.name) }}</b>
    <small>{{ info }}</small>
  </button>
</template>

<style scoped>
.puck { width: 92px; border: 0; background: none; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; transition: transform .18s ease; }
.disc { position: relative; width: 58px; height: 58px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; color: #fff; background: radial-gradient(circle at 30% 22%, rgba(255, 255, 255, .38), transparent 42%), var(--tc); border: 3px solid var(--ring, var(--ice)); box-shadow: 0 6px 14px rgba(0, 0, 0, .45), 0 0 0 1px rgba(0, 0, 0, .4); }
.tm { font-style: normal; font-family: var(--head); font-size: .68rem; font-weight: 800; letter-spacing: .08em; color: var(--tx); opacity: .92; }
.v { font-style: normal; font-size: 1.3rem; text-shadow: 0 2px 4px rgba(0, 0, 0, .7); }
.good { --ring: var(--good); }
.mid { --ring: var(--mid); }
.low { --ring: var(--bad); }
.off { --ring: #51607d; }
.off .disc { filter: saturate(.35) brightness(.7); }
.off .nm { color: var(--muted); }
.nm { font-family: var(--head); font-size: 1.02rem; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
small { font-size: .74rem; color: var(--muted); }
.flag { position: absolute; right: -7px; top: -6px; padding: 1px 6px; border-radius: 999px; font-family: var(--head); font-weight: 800; font-size: .72rem; letter-spacing: .05em; background: var(--ink); color: #0b1322; }
.flag.inj { background: var(--lamp); color: #fff; font-size: .95rem; line-height: 1.1; padding: 0 7px; }
.puck:hover .disc { transform: translateY(-2px); }
.sel { transform: scale(1.1); }
.sel .disc { box-shadow: 0 0 0 4px rgba(127, 227, 255, .35), 0 0 22px rgba(127, 227, 255, .8); border-color: var(--accent); }
.hint .disc { animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 50% { box-shadow: 0 0 0 5px rgba(127, 227, 255, .4), 0 0 18px rgba(127, 227, 255, .6); } }
@media (prefers-reduced-motion: reduce) { .hint .disc { animation: none; box-shadow: 0 0 0 4px rgba(127, 227, 255, .5); } }
</style>
