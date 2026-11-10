<script setup>
import { ref, computed } from 'vue'
import { TEAMS } from './data.js'
import { ctx, marketList, addMarket, removeMarket, clearMarket, openPlayer } from './store.js'
const q = ref('')
const picked = ref(null)
const price = ref('')
const k = (n) => (n ? Math.round(n / 1000) + 'k' : '–')
const hits = computed(() => {
  const v = q.value.trim().toLowerCase()
  if (v.length < 2 || picked.value) return []
  const w = v.split(/\s+/)
  return ctx.value.players.filter((p) => w.every((x) => p.name.toLowerCase().includes(x))).slice(0, 6)
})
function add() {
  if (!picked.value) return
  addMarket(picked.value.id, price.value)
  q.value = ''; price.value = ''; picked.value = null
}
function advice(x) {
  if (x.w.max == null) return { cls: 'mid', t: 'keine Schätzung' }
  if (!x.price) return { cls: 'mid', t: 'Preis eintragen' }
  const r = x.w.max / x.price
  return r >= 1.12 ? { cls: 'good', t: 'bieten bis ' + k(x.w.max) } : r >= 0.88 ? { cls: 'mid', t: 'knapp, bis ' + k(x.w.max) } : { cls: 'bad', t: 'zu teuer' }
}
</script>

<template>
  <section class="card">
    <h2>Transfermarkt heute</h2>
    <p class="small muted">Im Spiel sind täglich nur 14 Spieler kaufbar, und das Gebot muss mindestens dem Marktwert entsprechen. Trag sie hier ein, dann sage ich dir, wen du ersteigern solltest.</p>
    <div class="add">
      <div><label for="mq">Spieler</label>
        <input id="mq" type="search" autocomplete="off" placeholder="Name eingeben" v-model="q" @input="picked = null" />
      </div>
      <div class="sugg" v-if="hits.length"><button v-for="p in hits" :key="p.id" type="button" @click="picked = p; q = p.name">{{ p.name }} <small>{{ p.team }}</small></button></div>
      <div v-if="picked" class="two">
        <div><label for="mp">Marktwert im Spiel</label><input id="mp" type="number" min="0" step="1000" v-model="price" placeholder="z. B. 350000" /></div>
        <button type="button" class="btn go" @click="add">Hinzufügen</button>
      </div>
    </div>
    <ul v-if="marketList.length" class="m">
      <li v-for="x in marketList" :key="x.p.id">
        <button type="button" class="nm" @click="openPlayer(x.p.id)"><b>{{ x.p.name }}</b><span class="muted small">{{ TEAMS[x.p.team][0] }} · Preis {{ k(x.price) }} · Höchstpreis {{ k(x.w.max) }}</span></button>
        <span class="chip" :class="advice(x).cls">{{ advice(x).t }}</span>
        <button type="button" class="x" :aria-label="x.p.name + ' entfernen'" @click="removeMarket(x.p.id)">×</button>
      </li>
    </ul>
    <button v-if="marketList.length" type="button" class="link" @click="clearMarket">Liste leeren (neuer Tag)</button>
  </section>
</template>

<style scoped>
.add { display: flex; flex-direction: column; gap: 10px; }
.sugg { display: flex; flex-wrap: wrap; gap: 6px; }
.sugg button { border: 1.5px solid var(--line); background: var(--surface); border-radius: 999px; padding: 5px 12px; font-size: 0.9rem; }
.sugg small { color: var(--muted); }
.two { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: end; }
.m { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.m li { display: grid; grid-template-columns: 1fr auto 28px; gap: 8px; align-items: center; padding: 10px 0; border-top: 1px solid var(--line); }
.nm { background: none; border: 0; padding: 0; text-align: left; display: flex; flex-direction: column; min-width: 0; }
.x { background: none; border: 0; font-size: 1.4rem; color: var(--muted); }
.chip { white-space: nowrap; }
</style>
