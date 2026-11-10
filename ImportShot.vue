<script setup>
import { ref } from 'vue'
import { readShot, applyShot } from './store.js'
const props = defineProps({ mode: String })
const busy = ref(false)
const msg = ref('')
const bad = ref(false)
const progress = ref('')
async function onFile(e) {
  const files = [...(e.target.files || [])]
  if (!files.length) return
  busy.value = true; msg.value = ''; bad.value = false
  const all = []
  let unread = 0
  try {
    for (let i = 0; i < files.length; i++) {
      progress.value = files.length > 1 ? ' (' + (i + 1) + ' von ' + files.length + ')' : ''
      try { all.push(...(await readShot(files[i], props.mode))) } catch (err) { if (err && (err.code === 'bad_code' || err.code === 'rate_limited' || err.code === 'no_images' || err.code === 'no_ai')) throw err; unread++ }
    }
    if (!all.length) { msg.value = 'Ich konnte in den Bildern keine Spieler lesen. Probier schärfere Screenshots.'; bad.value = true }
    else {
      const r = applyShot(props.mode, all)
      msg.value = r.done.length + ' Spieler übernommen' + (r.miss.length ? '. Nicht gefunden: ' + r.miss.join(', ') + '. Bitte prüfen.' : '.') + (unread ? ' ' + unread + ' Bild(er) konnte ich nicht lesen.' : '')
      bad.value = !r.done.length
    }
  } catch (err) {
    bad.value = true
    msg.value = err && err.code === 'bad_code' ? 'Der Zugangscode fehlt oder stimmt nicht. Gib ihn bei «Frag die KI» ein.' : err && err.code === 'no_images' ? 'Bilder lesen ist hier nicht freigegeben.' : err && err.code === 'rate_limited' ? 'Zu viele Anfragen, bitte kurz warten.' : 'Das Lesen hat nicht geklappt. Bitte nochmals versuchen.'
    if (all.length) { const r = applyShot(props.mode, all); msg.value += ' Bis dahin übernommen: ' + r.done.length + '.' }
  }
  busy.value = false; progress.value = ''
  e.target.value = ''
}
</script>

<template>
  <div class="shot">
    <label :for="'shot-' + mode" class="btn ghost pick">{{ busy ? 'Lese' + progress + ' …' : mode === 'market' ? 'Screenshots vom Transfermarkt hochladen' : 'Screenshots vom Kader hochladen' }}</label>
    <input :id="'shot-' + mode" type="file" accept="image/*" multiple :disabled="busy" @change="onFile" hidden />
    <p v-if="msg" class="small" :class="bad ? 'bad err' : 'good err'">{{ msg }}</p>
  </div>
</template>

<style scoped>
.shot { display: flex; flex-direction: column; gap: 8px; }
.pick { text-align: center; margin: 0; font-size: 0.95rem; color: var(--ink); cursor: pointer; }
.err { padding: 8px 12px; border-radius: 10px; }
</style>
