# The Old Smugglers Club – Website 4.7.0 FINAL

## Status

Freigegebener und eingefrorener Referenzstand vom 04.08.2026.

## Inhalt

- Startseite mit Highscore-Teaser
- Ranglistenlogbuch mit Wettbewerbs- und Wertungsnavigation
- Gesamt-Einzelwertung über alle Wettbewerbe
- Gesamt-Teamwertung über alle Wettbewerbe
- Gesamt-Bonuswertung
- Wettbewerbsspezifische Spieltags-, Gesamt- und Teamwertungen
- Suche und 25er-Pagination
- Hall of Fame als getrennte Abschlussanzeige

## Datenfluss

`Admin → website-view.json → highscore-data-adapter.js → Startseite / Ranglistenlogbuch`

Die Website zeigt ausschließlich den vom Admin bereitgestellten vollständigen Datenstand. Die in den Release-Candidates verwendeten Simulationspunkte sind in FINAL nicht enthalten. `website-view.json` enthält den bestätigten Saison-Nullstand mit 100 Teilnehmern sowie den beiden Teams.

## Installation

1. Vorhandenen Website-Ordner sichern.
2. Inhalt des Updatepakets in das Zielverzeichnis kopieren.
3. Vorhandene Dateien ersetzen.
4. Commit und Push durchführen.
5. Nach Veröffentlichung die Website mit `Strg + F5` neu laden.
6. `VERSION.txt` und die Footer müssen `4.7.0-FINAL` anzeigen.

## Verbindliche Grenzen

Nicht Bestandteil von 4.7.0 FINAL und für 4.8.0 vorgesehen:

- historische Auswahl mehrerer Spieltage
- Behandlung und Navigation offener Nachholspiele
- dynamisches Podium mit mehr als drei Karten bei Ranggleichstand

## Rollback

Bei Problemen den vor dem Update gesicherten Stand `4.7.0-RC3-HF1-TEST` wiederherstellen.
