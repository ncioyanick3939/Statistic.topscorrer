<script setup>
import { computed, reactive, ref } from 'vue'
import { TEAMS, MY_SQUAD, POSITION } from './data.js'
import { state, closePlayer, saveOwnValues, ctx } from './store.js'
import ForecastGames from './ForecastGames.vue'

const props = defineProps({ x: Object })
const p = computed(() => props.x.p)
const r = computed(() => props.x.r)
const fc = computed(() => props.x.fc)
const team = computed(() => TEAMS[p.value.team])
const goalie = computed(() => p.value.pos === 'G')
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'")

const headline = computed(() => {
  if (fc.value.inj) return ['0', 'Fällt aus', fc.value.inj]
  if (goalie.value) return [fc.value.next.ga.toFixed(1), 'Gegentore pro Einsatz erwartet', 'Fangquote hochgerechnet ' + fc.value.next.sv.toFixed(1) + ' %, Einsatzchance ' + Math.round((fc.value.games[0]?.start ?? 0) * 100) + ' % pro Spiel.']
  return [fc.value.next.pts.toFixed(1), 'Skorerpunkte in den nächsten ' + fc.value.n + ' Spielen', 'Davon ca. ' + fc.value.next.g.toFixed(1) + ' Tore und ' + fc.value.next.a.toFixed(1) + ' Assists. Im Topscorer-Spiel rund ' + Math.round(fc.value.next.fp) + ' Punkte.']
})

// Läuft der Spieler über oder unter dem, was die Rechnung langfristig erwartet?
const form = computed(() => {
  const f = fc.value
  if (f.type !== 'S' || f.inj || p.value.gp < 5) return null
  const d = f.rawPg - f.expPg
  if (d > 0.18) return { cls: 'mid', t: 'Läuft über seinem Niveau (' + f.rawPg.toFixed(2) + ' statt ' + f.expPg.toFixed(2) + ' Punkte pro Spiel). Die Prognose rechnet mit einer Abkühlung.' }
  if (d < -0.18) return { cls: 'good', t: 'Liegt unter seinem Niveau (' + f.rawPg.toFixed(2) + ' statt ' + f.expPg.toFixed(2) + ' Punkte pro Spiel). Die Prognose rechnet mit einer Erholung.' }
  return { cls: 'good', t: 'Spielt so, wie es seine Werte erwarten lassen.' }
})

const season = computed(() => {
  const f = fc.value
  if (f.type !== 'S') return null
  const now = p.value.g + p.value.a
  const max = Math.max(f.season.hi, 1)
  return { now, nowW: (now / max) * 100, loW: (f.season.lo / max) * 100, hiW: (f.season.hi / max) * 100, mid: (f.season.pts / max) * 100 }
})

const facts = computed(() => {
  const q = p.value
  const a = goalie.value
    ? [[q.gp, 'Einsätze'], [q.sv.toFixed(1) + '%', 'Fangquote'], [q.gaa.toFixed(2), 'GA/Spiel']]
    : [[q.gp, 'Spiele'], [q.g, 'Tore'], [q.a, 'Assists'], [(q.pm > 0 ? '+' : '') + q.pm, '+/-']]
  const f = r.value.f
  if (f.avg != null) a.push([f.avg, 'Ø Topscorer'])
  if (f.mv) a.push([fmt(f.mv), 'Marktwert'])
  return a
})

const showWhy = ref(false)
const showOwn = ref(false)
const form2 = reactive({ avg: state.user[p.value.id]?.avg ?? '', mv: state.user[p.value.id]?.mv ?? '', trend: state.user[p.value.id]?.trend || '', toi: state.user[p.value.id]?.toi ?? '' })
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
    <div class="tag">{{ team[0] }}<template v-if="r.f.imp"> · Import</template><template v-if="r.f.mine"> · in deinem Kader</template></div>
    <h1>{{ p.name }}</h1>
    <p class="pos">{{ POSITION[p.pos] }}</p>
  </section>

  <section class="card">
    <div class="verdictline">
      <span class="chip" :class="r.cls">{{ r.verdict }}</span>
      <span class="muted small">Note {{ r.score }} von 100</span>
    </div>
    <div class="big">
      <b class="num">{{ headline[0] }}</b>
      <span>{{ headline[1] }}</span>
    </div>
    <p class="muted">{{ headline[2] }}</p>
    <p>{{ r.out }}</p>
  </section>

  <section v-if="fc.games.length && !fc.inj" class="card">
    <h2>Nächste Spiele</h2>
    <ForecastGames :games="fc.games" :goalie="goalie" />
    <p v-if="!ctx.scheduleOk" class="small muted">Der Spielplan ist nur bis 29.11.2026 hinterlegt.</p>
  </section>

  <section v-if="season" class="card">
    <h2>Bis Saisonende</h2>
    <p><b class="num big2">{{ fc.season.pts }}</b> Skorerpunkte erwartet <span class="muted">({{ fc.season.g }} Tore, {{ fc.season.a }} Assists)</span></p>
    <div class="range" role="img" :aria-label="'Aktuell ' + season.now + ', erwartet ' + fc.season.pts + ', Bandbreite ' + fc.season.lo + ' bis ' + fc.season.hi">
      <i class="band" :style="{ left: season.loW + '%', width: season.hiW - season.loW + '%' }"></i>
      <i class="now" :style="{ width: season.nowW + '%' }"></i>
      <i class="exp" :style="{ left: season.mid + '%' }"></i>
    </div>
    <div class="legend small muted"><span>jetzt {{ season.now }}</span><span>Bandbreite {{ fc.season.lo }} bis {{ fc.season.hi }}</span></div>
    <p class="small muted">Rund vier von fünf ähnlichen Spielern landen in dieser Bandbreite. Wenige Spiele ziehen den Wert zum Ligaschnitt.</p>
  </section>

  <section class="card">
    <div class="facts">
      <div v-for="f in facts" :key="f[1]"><b class="num">{{ f[0] }}</b><span>{{ f[1] }}</span></div>
    </div>
    <p v-if="form" class="note" :class="form.cls">{{ form.t }}</p>
    <ul v-if="r.plus.length || r.minus.length" class="marks">
      <li v-for="t in r.plus" :key="'p' + t"><i class="good">+</i><span>{{ t }}</span></li>
      <li v-for="t in r.minus" :key="'m' + t"><i class="bad">−</i><span>{{ t }}</span></li>
    </ul>
  </section>

  <section class="card">
    <button type="button" class="link" @click="showWhy = !showWhy">{{ showWhy ? 'Rechnung ausblenden' : 'Wie kommt die Note zustande?' }}</button>
    <div v-if="showWhy" class="why">
      <p class="small muted">Die Note ist der Anteil der erreichten Punkte an allen möglichen. Jede Zeile zeigt den Wert des Spielers und was er daraus holt.</p>
      <ul class="parts">
        <li v-for="x in r.parts" :key="x[0]">
          <div class="l"><b>{{ x[0] }}</b><span class="muted small">{{ x[3] }}</span></div>
          <span class="chip" :class="x[2] >= 0.65 ? 'good' : x[2] >= 0.35 ? 'mid' : 'bad'">{{ x[2] >= 0.65 ? 'stark' : x[2] >= 0.35 ? 'solide' : 'schwach' }}</span>
          <span class="pts num"><b>{{ Math.round(x[1] * x[2]) }}</b> von {{ x[1] }}</span>
        </li>
      </ul>
      <div class="sum"><span>Summe</span><b class="num">{{ Math.round(r.parts.reduce((s, x) => s + x[1] * x[2], 0)) }} von {{ r.parts.reduce((s, x) => s + x[1], 0) }} = Note {{ r.score }}</b></div>
    </div>
    <button type="button" class="link" @click="showOwn = !showOwn">{{ showOwn ? 'Eingabe ausblenden' : 'Marktwert und Punkteschnitt aus dem Spiel eintragen' }}</button>
    <div v-if="showOwn" class="own">
      <div><label for="u-avg">Ø Punkte</label><input id="u-avg" type="number" min="0" step="1" v-model="form2.avg" :placeholder="r.f.avg ?? ''" /></div>
      <div><label for="u-mv">Marktwert</label><input id="u-mv" type="number" min="0" step="1" v-model="form2.mv" :placeholder="r.f.mv ?? ''" /></div>
      <div><label for="u-trend">Trend</label><select id="u-trend" v-model="form2.trend"><option value="">{{ r.f.mine ? 'wie Screenshot' : 'unbekannt' }}</option><option value="up">steigt</option><option value="flat">gleich</option><option value="down">fällt</option></select></div>
      <div v-if="!goalie"><label for="u-toi">Eiszeit (Min.)</label><input id="u-toi" type="number" min="0" max="35" step="0.1" v-model="form2.toi" placeholder="z. B. 17.5" /></div>
      <button type="button" class="btn full" @click="save">Speichern und neu rechnen</button>
    </div>
  </section>
</template>

<style scoped>
.back { align-self: flex-start; padding: 6px 0; }
.hero { background: var(--tb); color: var(--tf); border-radius: 20px; padding: 20px 18px; display: flex; flex-direction: column; gap: 6px; }
.hero h1 { font-size: 2.1rem; overflow-wrap: anywhere; }
.tag { font-size: 0.82rem; font-weight: 700; opacity: 0.9; }
.pos { opacity: 0.85; }
.verdictline { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.big { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.big b { font-family: var(--head); font-size: 3.4rem; font-weight: 800; line-height: 0.9; }
.big span { font-weight: 700; flex: 1 1 140px; min-width: 0; }
.big2 { font-family: var(--head); font-size: 1.9rem; }
.range { position: relative; height: 14px; background: var(--soft); border-radius: 7px; overflow: hidden; }
.range i { position: absolute; top: 0; bottom: 0; }
.band { background: color-mix(in srgb, var(--accent) 30%, transparent); }
.now { left: 0; background: var(--ink); opacity: 0.85; }
.exp { width: 3px; background: var(--accent); }
.legend { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.facts div { background: var(--soft); border-radius: 12px; padding: 9px 10px; min-width: 0; display: flex; flex-direction: column; }
.facts b { font-family: var(--head); font-size: 1.25rem; }
.facts span { font-size: 0.72rem; color: var(--muted); font-weight: 700; }
.note { padding: 10px 12px; border-radius: 12px; font-size: 0.92rem; }
.marks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.marks li { display: grid; grid-template-columns: 24px 1fr; gap: 10px; align-items: start; }
.marks i { font-style: normal; font-weight: 800; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; }
.why { display: flex; flex-direction: column; gap: 10px; }
.parts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.parts li { display: grid; grid-template-columns: 1fr auto 88px; gap: 10px; align-items: center; padding: 10px 0; border-top: 1px solid var(--line); }
.parts .l { display: flex; flex-direction: column; min-width: 0; }
.parts .pts { text-align: right; font-size: 0.85rem; color: var(--muted); }
.parts .pts b { font-family: var(--head); font-size: 1.15rem; color: var(--ink); }
.sum { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; border-top: 2px solid var(--ink); padding-top: 10px; font-weight: 700; }
.own { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.full { grid-column: 1 / -1; }
@media (max-width: 440px) { .facts { grid-template-columns: 1fr 1fr; } .big b { font-size: 2.8rem; } }
</style>
