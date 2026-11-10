<script setup>
import { computed } from 'vue'
import Puck from './Puck.vue'
const props = defineProps({ got: Object, day: String, selectedId: String, hintIds: Array })
defineEmits(['pick'])
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
const fill = (arr, n) => { const a = arr.map((e) => ({ e })); while (a.length < n) a.push({ empty: true }); return a }
const F = computed(() => chunk(fill(props.got.F, 9), 3))
const D = computed(() => chunk(fill(props.got.D, 6), 2))
const G = computed(() => fill(props.got.G, 1))
</script>

<template>
  <div class="rink">
    <div class="zone">
      <span class="zl">Sturm</span>
      <div v-for="(line, i) in F" :key="'f' + i" class="line">
        <template v-for="(c, j) in line" :key="j">
          <Puck v-if="c.e" :e="c.e" :day="day" :selected="selectedId === c.e.x.p.id" :hint="hintIds.includes(c.e.x.p.id)" @pick="$emit('pick', $event)" />
          <span v-else class="empty"><span class="disc">?</span><b>leer</b><small>−50 Pkt.</small></span>
        </template>
      </div>
    </div>
    <div class="blue" aria-hidden="true"></div>
    <div class="zone">
      <span class="zl">Verteidigung</span>
      <div v-for="(line, i) in D" :key="'d' + i" class="line pair">
        <template v-for="(c, j) in line" :key="j">
          <Puck v-if="c.e" :e="c.e" :day="day" :selected="selectedId === c.e.x.p.id" :hint="hintIds.includes(c.e.x.p.id)" @pick="$emit('pick', $event)" />
          <span v-else class="empty"><span class="disc">?</span><b>leer</b><small>−50 Pkt.</small></span>
        </template>
      </div>
    </div>
    <div class="goalline" aria-hidden="true"></div>
    <div class="zone goal">
      <span class="crease" aria-hidden="true"></span>
      <span class="zl">Tor</span>
      <div class="line">
        <template v-for="(c, j) in G" :key="j">
          <Puck v-if="c.e" :e="c.e" :day="day" :selected="selectedId === c.e.x.p.id" :hint="hintIds.includes(c.e.x.p.id)" @pick="$emit('pick', $event)" />
          <span v-else class="empty"><span class="disc">?</span><b>leer</b><small>−50 Pkt.</small></span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rink { position: relative; overflow: hidden; border-radius: 20px; padding: 6px 8px 14px; background: #1c2848; }
.zone { position: relative; padding: 14px 0 4px; }
.zl { position: absolute; left: 6px; top: 6px; font-family: var(--head); font-size: .78rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(255, 255, 255, .4); }
.line { position: relative; display: flex; justify-content: space-around; align-items: flex-start; padding: 8px 0; }
.line.pair { justify-content: center; gap: clamp(30px, 14vw, 90px); }
.blue { height: 7px; margin: 4px -8px; background: #2c4a86; opacity: .8; }
.goalline { height: 3px; margin: 2px -8px 0; background: #7a3550; opacity: .8; }
.goal .line { justify-content: center; padding-top: 14px; }
.crease { position: absolute; left: 50%; top: 4px; width: 170px; height: 100px; transform: translateX(-50%); border-radius: 0 0 100px 100px; background: rgba(255, 255, 255, .04); border: 2px solid rgba(255, 255, 255, .12); border-top: 0; }
.empty { width: 92px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.empty .disc { width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; border: 3px dashed var(--bad); color: var(--bad); font-family: var(--head); font-size: 1.5rem; font-weight: 800; }
.empty b { font-family: var(--head); text-transform: uppercase; letter-spacing: .04em; color: var(--bad); }
.empty small { color: var(--muted); font-size: .74rem; }
</style>
