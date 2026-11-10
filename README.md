# Topscorer AI

Fantasy-Hockey-Manager für die Schweizer National League. Die App unterstützt Kaderplanung, Aufstellungen, Transfers, Spielerbewertungen und Prognosen.

## Lokal starten

Voraussetzung: Node.js 22 oder neuer.

```bash
npm ci
npm run dev
```

Produktionsbuild und lokaler Server:

```bash
npm test
npm run build
npm start
```

Der Server liefert den Vite-Build aus dem Ordner `dist`.

## Render-Konfiguration

- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Runtime: Node.js 22
- Optionale Umgebungsvariablen siehe [`.env.example`](.env.example).

`ANTHROPIC_API_KEY` wird ausschliesslich serverseitig verwendet. Niemals einen API-Schlüssel in Vue-Dateien oder im Browser hinterlegen.

## Datenstand und Datenquellen

- Spielerstatistiken werden derzeit über CSV-/PDF-Exporte von SIHF importiert.
- Die Beispieldaten in `stats.json` sind mit ihrem Stand im JSON-Dokument gekennzeichnet.
- Der Spielplan in `data.js` ist aktuell manuell gepflegt und endet am 29.11.2026.
- Automatische Live-Daten, eine verifizierte externe Daten-API und PostgreSQL sind noch nicht implementiert.

Die App soll Datenquelle und Aktualitätsstand künftig deutlich sichtbar machen. Prognosen sind Schätzungen und dürfen nicht als garantierte Ergebnisse dargestellt werden.

## Architektur (Bestand)

- Vue 3 + Vite Frontend
- Node.js HTTP-Server für statische Auslieferung und KI-Proxy
- Bewertungs- und Prognoselogik in `model.js`
- Aufstellungs- und Verkaufslogik in `team.js`
- SIHF-Import in `importers.js`
- Browserseitige lokale Speicherung; Cloud-Speicherung ist derzeit an die optionale Claude-Umgebung gekoppelt

## Qualitätssicherung

`npm test` führt Regressionstests für Teamzuordnungen, Datenintegrität, Spielerbewertungen, Prognosen und Aufstellungsregeln aus. GitHub Actions führt Tests und Produktionsbuild bei Pushes auf dem Entwicklungsbranch sowie bei Pull Requests gegen `main` aus.

## Entwicklungsprinzipien

1. Bestehende Fantasy-Regeln nicht stillschweigend ändern.
2. Neue Datenquellen erst nach Verifikation von Verfügbarkeit, Nutzungsbedingungen und Datenqualität integrieren.
3. Prognosen und Empfehlungen nachvollziehbar begründen.
4. Datenbankmigration und Render-Änderungen mit Backup und Rollback planen.
5. Erst nach grünen Tests und Sichtprüfung in `main` übernehmen.
