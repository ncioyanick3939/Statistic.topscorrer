# Topscorer AI 2.0 — Umsetzung

## Leitlinien
- Bestehende Funktionen erhalten, bevor sie ersetzt werden.
- Änderungen zuerst auf einem separaten Arbeits-Branch entwickeln.
- Keine Zugangsdaten oder API-Schlüssel ins Repository schreiben.
- Prognosen transparent machen: Datenquelle, Aktualisierungszeitpunkt und Unsicherheit anzeigen.
- Keine erfundenen oder ungeprüften Spielerdaten als Fakten darstellen.

## Phase 1 — Bestandsaufnahme
- [ ] Projektstruktur und Build-/Startskripte erfassen
- [ ] Vue-Komponenten, Store und Berechnungslogik dokumentieren
- [ ] Datenquellen und Importabläufe prüfen
- [ ] Render-Dienst, Umgebungsvariablen und Logs prüfen
- [ ] Sicherheits- und Datenschutzprüfung durchführen

## Phase 2 — Produkt und UX
- [ ] Navigation und Informationsarchitektur vereinfachen
- [ ] Responsives Dashboard gestalten
- [ ] Spielerprofile und Vergleichsansicht verbessern
- [ ] Kader- und Transferansichten überarbeiten
- [ ] Lade-, Fehler-, Leer- und Aktualitätszustände ergänzen

## Phase 3 — Datenqualität
- [ ] Datenmodell für Spieler, Teams, Spiele und Statistiken definieren
- [ ] Quellen, Zeitstempel und Importstatus speichern
- [ ] Dubletten und ungültige Werte erkennen
- [ ] Importjobs nachvollziehbar und wiederholbar machen
- [ ] PostgreSQL-Migration nur nach Prüfung der bestehenden Persistenz planen

## Phase 4 — Prognosen und Empfehlungen
- [ ] Bestehende Bewertungslogik mit Tests absichern
- [ ] Prognosen anhand historischer Daten evaluieren
- [ ] Unsicherheit und Datenlücken sichtbar machen
- [ ] Aufstellungs- und Transferempfehlungen begründen
- [ ] KI nur mit verifizierten App-Daten und klaren Grenzen einsetzen

## Phase 5 — Release
- [ ] Build und automatisierte Tests ausführen
- [ ] Render-Deploy und Healthcheck prüfen
- [ ] Datenbank-Backup und Rollback testen
- [ ] Mobile und Desktop Smoke-Tests durchführen

## Noch zu klären
- Render-Service-URL und verwendeter Service-Typ
- Verfügbare und erlaubte Datenquellen für die Liga
- Welche Funktionen zwingend erhalten bleiben müssen
