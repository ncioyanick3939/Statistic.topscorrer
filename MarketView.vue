<script setup>
import { ref, computed, reactive } from 'vue'
import { TEAMS } from './data.js'
import ImportShot from './ImportShot.vue'
import { state, ctx, marketList, baseLineup, addMarket, removeMarket, clearMarket, openPlayer } from './store.js'
import { fmt } from './format.js'
// Gebotsrechner: Schieber zwischen Marktwert und etwas über dem Höchstpreis
const bids = reactive({})
const top = (x) => Math.round((x.w.max != null ? Math.max(x.w.max * 1.25, x.price * 1.2) : x.price * 1.5) / 1000) * 1000
const bidOf = (x) => bids[x.p.id] ?? x.price
const verdict = (x) => { const b = bidOf(x); if (x.w.max == null) return ['mid', 'unklar']; return b <= x.w.max * 0.92 ? ['good', 'Schnäppchen'] : b <= x.w.max ? ['mid', 'fair'] : ['bad', 'zu teuer'] }
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
// Bringt er mehr als mein schwächster Stammspieler auf seiner Position?
function advice(x) {
  if (x.w.max == null) return { cls: 'mid', t: 'unklar', sub: 'Für Goalies ausserhalb deines Kaders kann ich den Wert nicht schätzen.' }
  const group = baseLineup.value.got[x.p.pos]
  const worst = group.length ? group.reduce((m, e) => (e.v < m.v ? e : m)) : null
  const gain = worst ? Math.round(x.w.avg - worst.v) : 0
  const ok = !x.price || x.price <= x.w.max * 1.1
  const vs = worst ? ' als ' + worst.x.p.name.split(' ')[0] : ''
  if (gain >= 10 && ok) return { cls: 'good', t: 'bieten', sub: 'Etwa ' + gain + ' Punkte besser' + vs + '. Gebot bis ' + k(x.w.max) + '.' }
  if (gain >= 0 && ok) return { cls: 'mid', t: 'knapp', sub: 'Nur wenig besser' + vs + '. Nur bieten, wenn du Platz hast.' }
  if (!ok) return { cls: 'bad', t: 'zu teuer', sub: 'Zahle höchstens ' + k(x.w.max) + '.' }
  return { cls: 'bad', t: 'nein', sub: 'Er hilft dir nicht weiter, du hast schon Bessere.' }
}
</script>

<template>
  <section class="card">
    <h2>Transfermarkt heute</h2>
    <p class="small muted">Im Spiel stehen täglich 14 Spieler zur Auswahl. Trag hier die ein, die dich interessieren, mit ihrem Marktwert.</p>
    <ImportShot v-if="state.ai" mode="market" />
    <div class="add">
      <div><label for="mq">Spieler</label><input id="mq" type="search" autocomplete="off" placeholder="Name eingeben" v-model="q" @input="picked = null" /></div>
      <div class="sugg" v-if="hits.length"><button v-for="p in hits" :key="p.id" type="button" @click="picked = p; q = p.name">{{ p.name }} <small>{{ p.team }}</small></button></div>
      <div v-if="picked" class="two">
        <div><label for="mp">Marktwert im Spiel</label><input id="mp" type="number" min="0" step="1000" v-model="price" placeholder="z. B. 350000" /></div>
        <button type="button" class="btn go" @click="add">Hinzufügen</button>
      </div>
    </div>
    <ul v-if="marketList.length" class="m">
      <li v-for="x in marketList" :key="x.p.id">
        <div class="head">
          <button type="button" class="nm" @click="openPlayer(x.p.id)"><b>{{ x.p.name }}</b><span class="muted small">{{ TEAMS[x.p.team][0] }} · Preis {{ k(x.price) }}</span></button>
          <span class="chip" :class="advice(x).cls">{{ advice(x).t }}</span>
          <button type="button" class="x" :aria-label="x.p.name + ' entfernen'" @click="removeMarket(x.p.id)">×</button>
        </div>
        <p class="small muted">{{ advice(x).sub }}</p>
        <div v-if="x.price" class="bid">
          <div class="bid-h"><span class="small muted">Dein Gebot</span><b class="led">{{ fmt(bidOf(x)) }}</b><span class="chip" :class="verdict(x)[0]">{{ verdict(x)[1] }}</span></div>
          <input type="range" :min="x.price" :max="top(x)" step="1000" :value="bidOf(x)" :aria-label="'Gebot für ' + x.p.name" @input="bids[x.p.id] = +$event.target.value" />
          <p class="small muted">Konto danach: <b>{{ state.cash == null ? '–' : fmt(state.cash - bidOf(x)) }}</b><template v-if="x.w.max != null"> · Höchstpreis {{ fmt(x.w.max) }}</template></p>
        </div>
      </li>
    </ul>
    <button v-if="marketList.length" type="button" class="link" @click="clearMarket">Liste leeren (neuer Tag)</button>
  </section>
</template>

<style scoped>
.add { display: flex; flex-direction: column; gap: 10px; }
.sugg { display: flex; flex-wrap: wrap; gap: 6px; }
.sugg button { border: 2px solid var(--line); background: var(--surface); border-radius: 999px; padding: 6px 12px; font-size: 0.92rem; }
.sugg small { color: var(--muted); }
.two { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: end; }
.m { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.m li { padding: 12px 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 4px; }
.head { display: grid; grid-template-columns: 1fr auto 28px; gap: 8px; align-items: center; }
.nm { background: none; border: 0; padding: 0; text-align: left; display: flex; flex-direction: column; min-width: 0; }
.x { background: none; border: 0; font-size: 1.5rem; color: var(--muted); }
.chip { white-space: nowrap; }
.bid { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border-radius: 12px; background: #0a1120; border: 1px solid var(--line); }
.bid-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.bid .led { color: var(--led); font-size: 1.2rem; }
.bid input[type=range] { padding: 0; accent-color: var(--accent); }
</style>
