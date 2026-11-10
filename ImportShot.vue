<script setup>
import { ref } from 'vue'
import { readShot, applyShot } from './store.js'
const props = defineProps({ mode: String })
const busy = ref(false)
const msg = ref('')
const bad = ref(false)
async function onFile(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  busy.value = true; msg.value = ''; bad.value = false
  try {
    const rows = await readShot(f, props.mode)
    if (!rows.length) { msg.value = 'Ich konnte im Bild keine Spieler lesen. Probier einen schärferen Screenshot.'; bad.value = true }
    else {
      const r = applyShot(props.mode, rows)
      msg.value = r.done.length + ' Spieler übernommen' + (r.miss.length ? '. Nicht gefunden: ' + r.miss.join(', ') + '. Bitte prüfen.' : '.')
      bad.value = !r.done.length
    }
  } catch (err) {
    bad.value = true
    msg.value = err && err.code === 'no_images' ? 'Bilder lesen ist hier nicht freigegeben.' : err && err.code === 'rate_limited' ? 'Zu viele Anfragen, bitte kurz warten.' : 'Das Lesen hat nicht geklappt. Bitte nochmals versuchen.'
  }
  busy.value = false
  e.target.value = ''
}
</script>

<template>
  <div class="shot">
    <label :for="'shot-' + mode" class="btn ghost pick">{{ busy ? 'Lese …' : mode === 'market' ? 'Screenshot vom Transfermarkt hochladen' : 'Screenshot vom Kader hochladen' }}</label>
    <input :id="'shot-' + mode" type="file" accept="image/*" :disabled="busy" @change="onFile" hidden />
    <p v-if="msg" class="small" :class="bad ? 'bad err' : 'good err'">{{ msg }}</p>
  </div>
</template>

<style scoped>
.shot { display: flex; flex-direction: column; gap: 8px; }
.pick { text-align: center; margin: 0; font-size: 0.95rem; color: var(--ink); cursor: pointer; }
.err { padding: 8px 12px; border-radius: 10px; }
</style>
