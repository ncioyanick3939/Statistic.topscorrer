<script setup>
import { ref, computed } from 'vue'
import { askAI } from './store.js'
const props = defineProps({ player: String, name: String })
const q = ref('')
const answer = ref('')
const busy = ref(false)
const error = ref('')
const chips = computed(() => props.player
  ? ['Lohnt sich ' + props.name + ' noch?', 'Wen würdest du als Ersatz nehmen?', 'Soll ich ihn verkaufen?']
  : ['Wen soll ich verkaufen?', 'Wie komme ich aus dem Minus?', 'Wer ist ein guter Ersatz für Weber?', 'Welchen Goalie soll ich holen?'])
async function ask(text) {
  const t = (text || q.value).trim()
  if (!t || busy.value) return
  q.value = t; busy.value = true; error.value = ''; answer.value = ''
  try { answer.value = await askAI(t, props.player, (x) => (answer.value = x)) }
  catch (e) { error.value = e && e.code === 'not_granted' ? 'Die KI ist nicht freigegeben.' : e && e.code === 'rate_limited' ? 'Zu viele Fragen, bitte kurz warten.' : 'Die KI hat gerade nicht geantwortet. Bitte nochmals versuchen.' }
  busy.value = false
}
</script>

<template>
  <section class="card">
    <h2>Frag die KI</h2>
    <p class="small muted">Sie kennt deinen Kader, den Kontostand und die Zahlen dieser App.</p>
    <div class="chips"><button v-for="c in chips" :key="c" type="button" @click="ask(c)">{{ c }}</button></div>
    <form class="ask" @submit.prevent="ask()">
      <input type="text" v-model="q" placeholder="Eigene Frage stellen" aria-label="Frage an die KI" />
      <button class="btn" type="submit" :disabled="busy">{{ busy ? '…' : 'Fragen' }}</button>
    </form>
    <p v-if="answer" class="answer">{{ answer }}</p>
    <p v-if="error" class="bad err">{{ error }}</p>
    <p v-if="answer && !busy" class="small muted">Das ist eine Einschätzung auf Basis der Statistik, keine Garantie.</p>
  </section>
</template>

<style scoped>
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chips button { border: 1.5px solid var(--line); background: var(--surface); border-radius: 999px; padding: 6px 12px; font-size: 0.88rem; }
.ask { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
.ask .btn { padding-inline: 16px; }
.answer { white-space: pre-wrap; background: var(--soft); border-radius: 12px; padding: 12px 14px; }
.err { padding: 8px 12px; border-radius: 10px; }
</style>
