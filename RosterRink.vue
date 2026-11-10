<script setup>
import { TEAMS, MY_SQUAD } from './data.js'
import { openPlayer } from './store.js'
import { gameOn } from './team.js'
import { surname } from './format.js'
const props = defineProps({ got: Object, missing: Object, day: String })
const rows = [['Stürmer', 'F'], ['Verteidiger', 'D'], ['Torhüter', 'G']]
const info = (x) => { if (x.fc.inj) return 'verletzt'; const g = gameOn(x.p.team, props.day); return g ? (g.home ? 'vs ' : '@ ') + g.opp : 'spielfrei' }
const tone = (v) => (v >= 80 ? 'good' : v >= 50 ? 'mid' : v > 0 ? 'low' : 'off')
const isImp = (x) => MY_SQUAD[x.p.id] && MY_SQUAD[x.p.id][4] === 1
</script>

<template>
  <div class="rink">
    <div v-for="r in rows" :key="r[1]" class="line">
      <p class="tag">{{ r[0] }} <span class="num">{{ got[r[1]].length }}</span></p>
      <div class="players">
        <button v-for="e in got[r[1]]" :key="e.x.p.id" type="button" class="tk" :class="tone(e.v)" @click="openPlayer(e.x.p.id)">
          <span class="jr" :style="{ background: TEAMS[e.x.p.team][1], color: TEAMS[e.x.p.team][2] }">{{ e.x.p.team }}<i class="bd num">{{ e.v || '–' }}</i></span>
          <b>{{ surname(e.x.p.name) }}</b>
          <small>{{ info(e.x) }}<template v-if="isImp(e.x)"> · Imp.</template></small>
        </button>
        <span v-for="n in Math.max(0, missing[r[1]])" :key="'m' + n" class="tk empty"><span class="jr">?</span><b>leer</b><small>−50 Pkt.</small></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rink { background: radial-gradient(120% 90% at 50% 0%, #17304f 0%, #0d1b30 70%); border: 1px solid var(--line); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden; }
.rink::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: rgba(255, 90, 90, 0.18); }
.line { position: relative; padding: 8px 0; }
.tag { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.players { display: flex; flex-wrap: wrap; gap: 10px 8px; }
.tk { width: 84px; border: 0; background: none; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
.tk b { font-size: 0.82rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tk small { font-size: 0.72rem; color: var(--muted); }
.jr { position: relative; width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-size: 0.72rem; font-weight: 800; border: 2px solid rgba(255, 255, 255, 0.25); }
.bd { position: absolute; right: -8px; top: -6px; font-style: normal; font-size: 0.74rem; font-weight: 800; padding: 2px 6px; border-radius: 999px; background: var(--soft); color: var(--ink); border: 1px solid var(--line); }
.good .bd { background: var(--good); color: #04210f; border-color: var(--good); }
.mid .bd { background: var(--mid); color: #2b1d02; border-color: var(--mid); }
.low .bd { background: var(--bad); color: #2d0509; border-color: var(--bad); }
.off { opacity: 0.55; }
.empty .jr { background: transparent; border: 2px dashed var(--bad); color: var(--bad); font-size: 1.2rem; }
.empty { opacity: 0.9; }
</style>
