<script setup>
import { computed, reactive, ref } from 'vue'
import { TEAMS, MY_SQUAD, POSITION } from './data.js'
import { state, closePlayer, saveOwnValues, ctx, buyPlayer, sellPlayer, replacementsFor, plan } from './store.js'
import PlayerRow from './PlayerRow.vue'
import AskAI from './AskAI.vue'
import ForecastGames from './ForecastGames.vue'

const props = defineProps({ x: Object })
const p = computed(() => props.x.p)
const r = computed(() => props.x.r)
const fc = computed(() => props.x.fc)
const w = computed(() => props.x.w)
const team = computed(() => TEAMS[p.value.team])
const goalie = computed(() => p.value.pos === 'G')
const owned = computed(() => !!MY_SQUAD[p.value.id])
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'")

const decision = computed(() => {
  const x = props.x
  if (owned.value) {
    if (fc.value.inj) return { t: 'Verkaufen', cls: 'bad', s: 'Er ist verletzt und bringt dir zurzeit keine Punkte.' }
    if (plan.value && plan.value.sold.some((y) => y.p.id === p.value.id)) return { t: 'Verkaufen', cls: 'bad', s: 'Er gehört zu den Spielern, die du am besten verkaufst, um wieder im Plus zu sein.' }
    if (w.value.call === 'sell') return { t: 'Eher verkaufen', cls: 'mid', s: 'Er kostet im Spiel mehr, als er nach meiner Rechnung bringt.' }
    return { t: 'Behalten', cls: 'good', s: 'Er bringt dir für seinen Preis genug Punkte.' }
  }
  if (fc.value.inj) return { t: 'Nicht kaufen', cls: 'bad', s: 'Er ist verletzt: ' + fc.value.inj }
  if (r.value.score >= 70) return { t: 'Interessant', cls: 'good', s: w.value.max ? 'Bieten lohnt sich bis ' + fmt(w.value.max) + '. Darüber ist er zu teuer.' : 'Starke Werte. Schau auf den Preis im Spiel.' }
  if (r.value.score >= 50) return { t: 'Beobachten', cls: 'mid', s: 'Solide, aber kein Muss. Nur bei einem guten Preis.' }
  return { t: 'Nicht kaufen', cls: 'bad', s: 'Seine Werte sind zu schwach.' }
})
const reasons = computed(() => [...r.value.plus.slice(0, 2).map((t) => ['+', 'good', t]), ...r.value.minus.slice(0, 2).map((t) => ['−', 'bad', t])])
const line = computed(() => {
  const q = p.value
  return goalie.value ? q.gp + ' Einsätze · ' + q.sv.toFixed(1) + ' % Fangquote · ' + q.gaa.toFixed(2) + ' Gegentore pro Spiel' : q.gp + ' Spiele · ' + q.g + ' Tore · ' + q.a + ' Assists · ' + (q.pm > 0 ? '+' : '') + q.pm
})

const showOwn = ref(false)
const confirm = ref('')
const buyPrice = ref('')
const ersatz = computed(() => (owned.value ? replacementsFor(p.value.id) : []))
function doBuy() {
  const v = parseFloat(buyPrice.value)
  buyPlayer(p.value.id, !isNaN(v) && v > 0 ? Math.round(v) : w.value.max || 0)
  confirm.value = ''; buyPrice.value = ''
}
function doSell() { sellPlayer(p.value.id); confirm.value = '' }
const u = state.user[p.value.id] || {}
const form2 = reactive({ avg: u.avg ?? '', mv: u.mv ?? '', trend: u.trend || '', toi: u.toi ?? '' })
function save() {
  const o = {}
  ;['avg', 'mv', 'toi'].forEach((k) => { const v = form2[k]; if (v !== '' && v != null && !isNaN(v)) o[k] = parseFloat(v) })
  if (form2.trend) o.trend = form2.trend
  saveOwnValues(p.value.id, o)
  showOwn.value = false
}
</script>

<template>
  <button type="button" class="link back" @click="closePlayer">← Zurück</button>

  <section class="hero" :style="{ '--tb': team[1], '--tf': team[2] }">
    <div class="tag">{{ team[0] }}<template v-if="r.f.imp"> · Import</template><template v-if="owned"> · in deinem Kader</template></div>
    <h1>{{ p.name }}</h1>
    <p class="pos">{{ POSITION[p.pos] }} · {{ line }}</p>
  </section>

  <section class="card">
    <div class="verdict" :class="decision.cls"><b>{{ decision.t }}</b></div>
    <p class="s">{{ decision.s }}</p>
    <ul v-if="reasons.length" class="marks">
      <li v-for="t in reasons" :key="t[2]"><i :class="t[1]">{{ t[0] }}</i><span>{{ t[2] }}</span></li>
    </ul>
    <p v-if="w.max != null" class="small muted">Höchstpreis <b>{{ fmt(w.max) }}</b><template v-if="w.mv"> · im Spiel {{ fmt(w.mv) }}</template> · gerechnet mit Ø {{ w.avg }}<template v-if="w.est"> (geschätzt, kann um rund 20 danebenliegen)</template>.</p>
  </section>

  <section class="card">
    <template v-if="!confirm">
      <button v-if="!owned" type="button" class="btn" @click="confirm = 'buy'">Ich habe ihn gekauft</button>
      <button v-else type="button" class="btn ghost" @click="confirm = 'sell'">Ich habe ihn verkauft</button>
      <p class="small muted">Das trägt es nur in dieser App ein. Im Topscorer-Spiel machst du es selbst.</p>
    </template>
    <template v-else-if="confirm === 'buy'">
      <div><label for="bp">Für wie viel hast du ihn gekauft?</label><input id="bp" type="number" min="0" step="1000" v-model="buyPrice" :placeholder="w.max ? String(w.max) : 'Preis im Spiel'" /></div>
      <div class="two"><button type="button" class="btn" @click="doBuy">Eintragen</button><button type="button" class="btn ghost" @click="confirm = ''">Abbrechen</button></div>
    </template>
    <template v-else>
      <p><b>{{ p.name }}</b> aus deinem Kader entfernen<template v-if="w.mv"> und {{ fmt(w.mv) }} gutschreiben</template>?</p>
      <div class="two"><button type="button" class="btn" @click="doSell">Ja</button><button type="button" class="btn ghost" @click="confirm = ''">Abbrechen</button></div>
    </template>
  </section>

  <section v-if="ersatz.length" class="card">
    <h2>Ersatz für {{ p.name.split(' ')[0] }}</h2>
    <p class="small muted">Gleiche Position, nicht im Kader, nicht verletzt. Kaufbar nur, wenn sie auf dem Transfermarkt stehen.</p>
    <div class="rlist"><PlayerRow v-for="y in ersatz" :key="y.p.id" :x="y" price /></div>
  </section>

  <section v-if="fc.games.length && !fc.inj" class="card">
    <h2>Nächste Spiele</h2>
    <ForecastGames :games="fc.games" :goalie="goalie" />
    <p v-if="!ctx.scheduleOk" class="small muted">Der Spielplan ist nur bis 29.11.2026 hinterlegt.</p>
  </section>

  <AskAI v-if="state.ai" :player="p.id" :name="p.name.split(' ')[0]" />

  <section class="card">
    <button type="button" class="link" @click="showOwn = !showOwn">{{ showOwn ? 'Eingabe ausblenden' : 'Eigene Werte aus dem Spiel eintragen (Ø Punkte, Marktwert)' }}</button>
    <div v-if="showOwn" class="own">
      <div><label for="u-avg">Ø Punkte</label><input id="u-avg" type="number" min="0" step="1" v-model="form2.avg" :placeholder="r.f.avg ?? ''" /></div>
      <div><label for="u-mv">Marktwert</label><input id="u-mv" type="number" min="0" step="1" v-model="form2.mv" :placeholder="r.f.mv ?? ''" /></div>
      <div><label for="u-trend">Trend</label><select id="u-trend" v-model="form2.trend"><option value="">{{ r.f.mine ? 'wie Screenshot' : 'unbekannt' }}</option><option value="up">steigt</option><option value="flat">gleich</option><option value="down">fällt</option></select></div>
      <button type="button" class="btn full" @click="save">Speichern und neu rechnen</button>
    </div>
  </section>
</template>

<style scoped>
.back { align-self: flex-start; padding: 6px 0; }
.hero { background: var(--tb); color: var(--tf); border-radius: 18px; padding: 20px 18px; display: flex; flex-direction: column; gap: 6px; }
.hero h1 { font-size: 2.1rem; overflow-wrap: anywhere; }
.tag { font-size: 0.85rem; font-weight: 700; opacity: 0.9; }
.pos { opacity: 0.9; font-size: 0.95rem; }
.verdict { border-radius: 14px; padding: 14px 16px; }
.verdict b { font-family: var(--head); font-size: 2rem; font-weight: 800; }
.s { font-size: 1.05rem; }
.marks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.marks li { display: grid; grid-template-columns: 26px 1fr; gap: 10px; align-items: start; }
.marks i { font-style: normal; font-weight: 800; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.rlist { display: flex; flex-direction: column; gap: 8px; }
.own { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.full { grid-column: 1 / -1; }
</style>
