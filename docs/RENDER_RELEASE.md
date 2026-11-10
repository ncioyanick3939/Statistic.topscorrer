# Render-Release und Healthcheck

## Produktionsreferenz

Die vom Projektinhaber bestätigte Live-Adresse ist:

`https://statistic-topscorrer-ki.onrender.com/`

Der Service ist **nicht** automatisch mit diesem Feature-Branch verbunden. Die erfolgreiche GitHub-CI bedeutet nicht, dass die Änderung bereits auf Render läuft.

## Read-only Smoke-Test

Nach einem autorisierten Deployment:

```bash
node scripts/smoke-render.mjs https://statistic-topscorrer-ki.onrender.com
```

Alternativ `TOPSCORER_BASE_URL` setzen. Das Skript prüft:

1. `GET /`: HTTP 2xx, HTML-Inhalt und HTML-Titel.
2. `GET /api/status`: HTTP 2xx, JSON mit booleschen Feldern `ai` und `needsCode`.

Das Skript schreibt keine Daten, fordert keine KI-Antwort an und zeigt keine Zugangsdaten. Es beweist **nicht**, dass die KI korrekt funktioniert, Daten aktuell sind oder PostgreSQL eingerichtet ist.

## Release-Checkliste

- [ ] Sicherstellen, welcher Render-Service die Live-Adresse bedient und auf welchen Git-Branch er zeigt.
- [ ] Aktuelle Render-Umgebungsvariablen **nur auf Vorhandensein** prüfen, Geheimnisse nicht in Logs oder GitHub übernehmen.
- [ ] Falls Persistenz vorhanden ist: Backup und Restore-Verfahren dokumentieren.
- [ ] Vor dem Deploy: grüner CI-Lauf für den exakten Commit.
- [ ] Deploy zuerst in Staging oder Preview testen, sofern vorhanden.
- [ ] `node scripts/smoke-render.mjs https://statistic-topscorrer-ki.onrender.com` nach Freigabe und Deploy ausführen.
- [ ] Browser-Smoketests: Team-Cockpit, Spieler, Transfermarkt, Import, mobile Navigation.
- [ ] Bei Problemen auf vorherigen stabilen Render-Deploy zurückgehen und Datenintegrität prüfen.

## Datenbankstatus

`db/migrations/001_initial_schema.sql` ist nur ein Entwurf. Die SQL-Datei wird durch den Smoke-Test nicht angewendet. Für eine echte PostgreSQL-Anbindung fehlen noch die Bestätigung des Datenbankdienstes, ein Backup, ein Rollback-Verfahren und ein getesteter Staging-Migrationslauf.

## Fehlersuche

- **HTTP 404 auf /api/status:** Möglicherweise falscher Dienst, alter Deploy oder Routing-Konfiguration.
- **HTTP 5xx:** Render-Logs und Startkommando prüfen; keine Geheimnisse veröffentlichen.
- **Timeout:** Dienst möglicherweise im Sleep-Modus, Startfehler oder Netzproblem; erneut prüfen und Logs konsultieren.
- **Ungültiges JSON:** Version oder API-Route stimmt nicht mit dem erwarteten Serververtrag überein.

Die beiden Endpunkte sind reine Leseprüfungen. Die Anwendung bleibt bis zu einer expliziten Release-Freigabe auf `main` unverändert.
