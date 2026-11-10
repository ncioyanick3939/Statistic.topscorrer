# Topscorer AI 2.0 — Umsetzung

## Leitlinien
- Bestehende Funktionen erhalten, bevor sie ersetzt werden.
- Änderungen zuerst auf einem separaten Arbeits-Branch entwickeln.
- Keine Zugangsdaten oder API-Schlüssel ins Repository schreiben.
- Prognosen transparent machen: Datenquelle, Aktualisierungszeitpunkt und Unsicherheit anzeigen.
- Keine erfundenen oder ungeprüften Spielerdaten als Fakten darstellen.

## Phase 1 — Bestandsaufnahme
- [x] Projektstruktur und Build-/Startskripte erfassen
- [x] Vue-Komponenten, Store und Berechnungslogik dokumentieren
- [x] Datenquellen und Importabläufe prüfen (SIHF-Zugang noch nicht abschliessend freigegeben)
- [ ] Render-Dienst, Umgebungsvariablen und Logs prüfen
- [ ] Sicherheits- und Datenschutzprüfung durchführen

## Phase 2 — Produkt und UX
- [x] Navigation und Informationsarchitektur vereinfachen
- [x] Responsives Dashboard gestalten
- [ ] Spielerprofile und Vergleichsansicht verbessern
- [ ] Kader- und Transferansichten überarbeiten
- [ ] Lade-, Fehler-, Leer- und Aktualitätszustände ergänzen

## Phase 3 — Datenqualität
- [x] Datenmodell für Spieler, Teams, Spiele und Statistiken entwerfen (SQL-Entwurf, noch nicht migriert)
- [ ] Quellen, Zeitstempel und Importstatus speichern
- [ ] Dubletten und ungültige Werte erkennen
- [ ] Importjobs nachvollziehbar und wiederholbar machen
- [ ] PostgreSQL-Migration nur nach Prüfung der bestehenden Persistenz planen

## Phase 4 — Prognosen und Empfehlungen
- [x] Erste Regressionstests für Bewertungslogik und Aufstellung ergänzen
- [ ] Prognosen anhand historischer Daten evaluieren
- [ ] Unsicherheit und Datenlücken sichtbar machen
- [ ] Aufstellungs- und Transferempfehlungen begründen
- [ ] KI nur mit verifizierten App-Daten und klaren Grenzen einsetzen

## Phase 5 — Release
- [x] Build und automatisierte Tests über GitHub Actions erfolgreich ausgeführt (Node 22, npm ci, npm test, npm run build; Push- und Pull-Request-Lauf erfolgreich)
- [ ] Render-Deploy und Healthcheck prüfen
- [ ] Datenbank-Backup und Rollback testen
- [ ] Mobile und Desktop Smoke-Tests durchführen

## Noch zu klären
- Render-Service-URL und verwendeter Service-Typ
- Verfügbare und erlaubte Datenquellen für die Liga
- Welche Funktionen zwingend erhalten bleiben müssen

## Bereits umgesetzt
- [x] Ice-Blue-Design, Team-Cockpit, Seitenüberschriften und Mobile-Navigation
- [x] GitHub Actions Workflow für npm test und npm run build
- [x] SIHF-Datenzugriff und rechtliche/technische Einschränkungen dokumentiert
- [x] PostgreSQL-Schemaentwurf unter db/migrations (nicht auf Render angewendet)
