# SIHF-Datenquelle: geprüfter Stand

## Was wir wissen

- Die offizielle SIHF-Webseite bietet National-League-Spielerstatistiken, Goaliestatistiken, Teamstatistiken und Exporte als CSV/PDF an: https://www.sihf.ch/de/game-center/liga/spielerstatistiken/1-1
- SIHF beschreibt seine Club-/XML-Schnittstellen als nicht öffentliche, vertraglich freizuschaltende APIs. Für diese Zugänge ist SIHF-Kontakt erforderlich: https://support.sihf.ch/de/support/solutions/articles/206000084522-sihf-go-schnittstellen-api-
- Zusätzlich dokumentiert das Community-Projekt fastRhockey einen keyless JSON-Endpunkt unter `https://data.sihf.ch/statistic/api/cms` für Tabellen- und Spielübersichtsabfragen. Es beschreibt Filter-Echos, Saison-Endjahr, mögliche fehlerhafte Antworten und eine Drosselung von mindestens einer Anfrage pro Sekunde: https://fastrhockey.sportsdataverse.org/reference/index.html

## Wichtige Unterscheidung

Der keyless JSON-Endpunkt ist durch Community-Code technisch dokumentiert, aber in den gefundenen SIHF-Support-Unterlagen nicht als allgemein freigegebene öffentliche Entwickler-API bestätigt. Wir behandeln ihn deshalb **nicht als offiziell zugesicherte Schnittstelle**.

Bevor ein automatischer Import produktiv aktiviert wird, müssen Nutzungsbedingungen, erlaubte Abfragefrequenz und Stabilität mit SIHF geklärt werden. Keine Umgehung von Login, Rate Limits oder Zugriffsbeschränkungen.

## Empfohlene Datenstrategie

1. **Jetzt:** CSV/PDF-Import weiter unterstützen und die Quelle sowie den Datenstand pro Import speichern.
2. **Technischer Prototyp:** Den Community-dokumentierten JSON-Endpunkt isoliert und nur in einer nicht produktiven Umgebung prüfen.
3. **Validierung:** Angefragte Saison, Liga und Phase immer mit dem Antwort-Filterecho vergleichen. Bei fehlendem Echo, falscher Saison oder unvollständiger Tabelle den Import abbrechen.
4. **Produktiv:** Nur mit bestätigter Erlaubnis automatisieren. Anfragen drosseln, Rohantworten protokollieren und Importläufe idempotent machen.
5. **Fallback:** Bei API-Ausfall nie stillschweigend alte Daten als aktuell markieren; den letzten erfolgreichen Datenstand sichtbar halten.

## Datenumfang, der für Topscorer AI relevant ist

- Saison-Skaterstatistik: Spiele, Tore, Assists, Punkte, Plus/Minus, Strafminuten.
- Saison-Goalie-Statistik: Einsätze, Gegentore, Fangquote, GAA.
- Spielplan und Resultate mit SIHF-Spiel-ID, Startzeit, Heim-/Auswärtsteam und Status.
- Pro-Spiel-Boxscore, wenn verfügbar: Eiszeit, Schüsse, geblockte Schüsse, Faceoffs und Goalie-Leistung.

## Nicht behaupten

- Ein keyless Endpunkt ist nicht automatisch eine offiziell unterstützte API.
- Eine geladene Statistik ist nicht automatisch vollständig oder aktuell.
- Community-Schemas sind nicht mit einem SIHF-Vertrag oder einer Garantie gleichzusetzen.
