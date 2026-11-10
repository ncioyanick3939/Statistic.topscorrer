# Datenmodell für Topscorer AI 2.0

## Ziel

Rohdaten, offizielle SIHF-Saisonstände, Spiel-Boxscores, Kaderdaten und Prognosen sollen getrennt gespeichert werden. Dadurch lassen sich Datenquellen prüfen, alte Importe nachvollziehen und Prognosemodelle vergleichen.

## Tabellenübersicht

| Tabelle | Zweck |
|---|---|
| `seasons` | Saison mit Endjahr und Zeitraum |
| `teams` | SIHF-Team-ID, Kürzel und Name |
| `players` | stabile Spieleridentität über Namens-/Teamwechsel hinweg |
| `games` | Spielplan, Spiel-ID, Teams, Resultat und Status |
| `player_game_stats` | Skater-Boxscore pro Spiel |
| `goalie_game_stats` | Goalie-Boxscore pro Spiel |
| `player_season_snapshots` | versionierte SIHF-Saisonstatistik für Feldspieler |
| `goalie_season_snapshots` | versionierte SIHF-Saisonstatistik für Goalies |
| `data_import_runs` | Herkunft, Status, Prüfsumme und Ergebnis jedes Imports |
| `fantasy_rosters` / `fantasy_roster_entries` | Fantasy-Kader, Budget, Marktwerte und Importstatus |
| `forecast_snapshots` | Prognosen mit Modellversion und Unsicherheitsband |

## Identität und Datenqualität

- SIHF-Spieler- und Spiel-IDs sind Primärschlüssel für die Zuordnung, sobald SIHF sie liefert.
- Namen allein sind kein verlässlicher Identifikator.
- Ein Spiel wird über die SIHF-Spiel-ID eindeutig erkannt.
- Saison-Snapshots bleiben historisch erhalten; ein neuer Import überschreibt nicht den alten Nachweis.
- Importläufe speichern Quelle, Zeitpunkt, Status, Zeilenzahl und Fehler.
- Jede Prognose wird mit Modellversion und Erstellungszeit gespeichert.

## Migrationsstatus

Die SQL-Datei unter `db/migrations/001_initial_schema.sql` ist ein **Schemaentwurf**. Sie wurde noch nicht auf Render/PostgreSQL ausgeführt. Vor der Anwendung müssen PostgreSQL-Version, Backup, Authentifizierung und Migrationsablauf festgelegt werden.

## Noch nicht modelliert

- Benutzerkonten und Anmeldung: Die aktuelle App hat keine vollständige Benutzerverwaltung.
- Liga-spezifische Fantasy-Regeln: Punktewerte, Importlimits und Kadergrössen müssen als versionierte Regelkonfiguration modelliert werden.
- Vollständige Transaktionshistorie: Käufe/Verkäufe und Kontobewegungen folgen als nächster Schritt.
- Original-Rohpayloads: Speicherung nur, wenn Nutzungsbedingungen und Aufbewahrungsbedarf geklärt sind.

## Nächste technische Schritte

1. SIHF-IDs und Felder aus echten Exporten/Antworten verifizieren.
2. Schema gegen die bestehenden App-Funktionen und Fantasy-Regeln abgleichen.
3. PostgreSQL-Service auf Render vorbereiten, zunächst ohne Umschalten der Live-App.
4. Import in Staging testen und Dubletten-/Vollständigkeitsprüfungen ergänzen.
5. Erst danach den Store schrittweise von localStorage auf die API umstellen.
