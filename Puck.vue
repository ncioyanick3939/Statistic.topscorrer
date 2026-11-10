<script setup>
import { computed } from 'vue'
import { TEAMS, MY_SQUAD } from './data.js'
import { gameOn } from './team.js'
import { surname } from './format.js'
import { numberOf } from './store.js'
import TeamLogo from './TeamLogo.vue'
const props = defineProps({ e: Object, day: String, selected: Boolean, hint: Boolean })
defineEmits(['pick'])
const x = computed(() => props.e.x)
const t = computed(() => TEAMS[x.value.p.team])
const imp = computed(() => MY_SQUAD[x.value.p.id] && MY_SQUAD[x.value.p.id][4] === 1)
const no = computed(() => numberOf(x.value.p.id))
const tone = computed(() => (props.e.v >= 80 ? 'good' : props.e.v >= 50 ? 'mid' : props.e.v > 0 ? 'low' : 'off'))
const info = computed(() => { if (x.value.fc.inj) return 'verletzt'; const g = gameOn(x.value.p.team, props.day); return g ? (g.home ? 'vs ' : '@ ') + g.opp : 'spielfrei' })
</script>

<template>
  <button type="button" class="puck" :class="[tone, { sel: selected, hint }]" :aria-pressed="selected" :aria-label="x.p.name + ', ' + info + ', ' + (e.v || 0) + ' Punkte'" @click="$emit('pick', x.p.id)">
    <span class="disc" :style="{ '--tc': t[1], '--tx': t[2] }">
      <TeamLogo :team="x.p.team" :size="44" />
      <i class="v led">{{ e.v || '–' }}</i>
      <span v-if="x.fc.inj" class="flag inj">+</span>
      <span v-else-if="imp" class="flag imp">IMP</span>
    </span>
    <b class="nm">{{ surname(x.p.name) }}</b>
    <small><template v-if="no">#{{ no }} · </template>{{ info }}</small>
  </button>
</template>

<style scoped>
.puck { width: 92px; border: 0; background: none; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; transition: transform .18s ease; }
.disc { position: relative; width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; background: #fff; border: 3px solid var(--ring, #fff); box-shadow: 0 6px 14px rgba(0, 0, 0, .45); }
.v { position: absolute; right: -12px; bottom: -6px; min-width: 28px; text-align: center; font-style: normal; font-size: .95rem; line-height: 1.25; padding: 0 6px; border-radius: 999px; background: var(--ring); color: #07101c; border: 2px solid var(--bg); text-shadow: none; }
.good { --ring: var(--good); }
.mid { --ring: var(--mid); }
.low { --ring: var(--bad); }
.off { --ring: #51607d; }
.off .disc { opacity: .55; }
.off .nm { color: var(--muted); }
.nm { font-size: .98rem; font-weight: 800; letter-spacing: .02em; text-transform: uppercase; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
small { font-size: .74rem; color: var(--muted); }
.flag { position: absolute; left: -10px; top: 4px; padding: 1px 6px; border-radius: 3px; font-weight: 800; font-size: .66rem; letter-spacing: .03em; background: var(--accent); color: var(--accent-ink); }
.flag.inj { background: var(--lamp); color: #fff; font-size: .95rem; line-height: 1.1; padding: 0 7px; border-radius: 999px; left: auto; right: -7px; top: -6px; }
.puck:hover .disc { transform: translateY(-2px); }
.sel { transform: scale(1.1); }
.sel .disc { box-shadow: 0 0 0 4px rgba(247, 201, 72, .35), 0 0 22px rgba(247, 201, 72, .8); border-color: var(--accent); }
.hint .disc { animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 50% { box-shadow: 0 0 0 5px rgba(247, 201, 72, .4), 0 0 18px rgba(247, 201, 72, .6); } }
@media (prefers-reduced-motion: reduce) { .hint .disc { animation: none; box-shadow: 0 0 0 4px rgba(247, 201, 72, .5); } }
</style>
