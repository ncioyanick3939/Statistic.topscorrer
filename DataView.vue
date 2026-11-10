<script setup>
import { state, stand, importFiles } from './store.js'
function onFiles(e) { const f = [...e.target.files]; if (f.length) importFiles(f).then(() => { e.target.value = '' }) }
</script>

<template>
  <header>
    <h1>Daten</h1>
    <p class="muted small">Stand der Statistik: <b>{{ stand }}</b></p>
  </header>
  <section class="card">
    <h2>Aktualisieren</h2>
    <ol>
      <li>Auf sihf.ch die <a href="https://www.sihf.ch/de/game-center/liga/spielerstatistiken/1-1" target="_blank" rel="noopener">Spielerstatistiken</a> öffnen, «Export» antippen, CSV oder PDF wählen.</li>
      <li>Dasselbe bei den <a href="https://www.sihf.ch/de/game-center/liga/goaliestatistiken/1-1" target="_blank" rel="noopener">Goaliestatistiken</a>.</li>
      <li>Beide Dateien hier auswählen. Alle Prognosen werden neu gerechnet.</li>
    </ol>
    <div><label for="up">Export von sihf.ch (CSV oder PDF)</label><input id="up" type="file" accept=".csv,.pdf,text/csv,application/pdf" multiple @change="onFiles" /></div>
    <p v-if="state.message" class="msg" :class="state.messageKind">{{ state.message }}</p>
    <p class="small muted">{{ state.cloud ? 'Neue Daten werden in der App gespeichert und gelten auf allen deinen Geräten.' : 'Neue Daten werden nur auf diesem Gerät gespeichert.' }}</p>
  </section>
  <section class="card">
    <h2>So entsteht die Prognose</h2>
    <p><b>1. Eigene Stärke.</b> Tore und Assists pro Spiel des Spielers. Wer wenige Spiele hat, wird zum Ligaschnitt seiner Position gezogen, damit ein Zufallslauf nicht alles bestimmt.</p>
    <p><b>2. Gegner und Heimrecht.</b> Pro Spiel zählt, wie viele Tore der Gegner kassiert. Heimspiele geben etwas mehr, Auswärtsspiele etwas weniger.</p>
    <p><b>3. Einsatzquote.</b> Wie oft er bisher gespielt hat, bestimmt, wie viele der restlichen Spiele er mitmacht. Verletzte fallen aus.</p>
    <p><b>4. Saisonende.</b> Aus Stärke, Spielen und Zufall ergibt sich der erwartete Wert samt Bandbreite, in der rund vier von fünf Fällen liegen.</p>
    <p><b>5. Torhüter.</b> Die Fangquote wird mit den Schüssen auf seinem Konto gegen den Ligaschnitt gewichtet. Daraus folgen die erwarteten Gegentore.</p>
    <p class="small muted">Die Note (0 bis 100) fasst Statistik, Team, Spielplan und, falls bekannt, Topscorer-Schnitt und Preis-Leistung zusammen. Die Prognose zählt nur Tore und Assists (Stürmer 60 und 40, Verteidiger 70 und 50 Punkte). Schüsse, geblockte Schüsse, Eiszeit und Strafen fehlen im Export und sind nicht eingerechnet. Der Höchstpreis ist ein Vergleichswert aus deinem Kader, nicht die Formel des Spiels. Der Spielplan ist bis 29.11.2026 hinterlegt. Die Prognose ist eine Rechnung, keine Garantie.</p>
  </section>
</template>

<style scoped>
ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
.msg { font-weight: 700; }
.msg.ok { color: var(--good); }
.msg.err { color: var(--bad); }
</style>
