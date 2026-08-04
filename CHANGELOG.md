# Website 4.7.0-RC2-TEST – Wettbewerbstest – 04.08.2026

- Kontrollierte Nicht-Null-Simulation ausschließlich für Bundesliga.
- Spieltags-, Gesamt- und Teamwertung der Bundesliga befüllt.
- Alle übrigen Wettbewerbe bleiben ohne Wertung.
- Saisonweite Gesamtwertungen spiegeln nur die Bundesliga-Simulation.
- Hall of Fame bleibt unverändert ohne Sieger.
- Keine Änderungen an Grid, Navigation, Kachelgrößen oder Grundlayout.

# Website 4.7.0-RC1-HF1-TEST – Rangsortierung und Tabellenkopf – 04.08.2026

- Offizielle Ranglisten werden vor Zusammenfassung, Podium, Tabelle und Pagination stabil nach Rang sortiert.
- Bei gleichem Rang gilt: Punkte absteigend, danach Name alphabetisch.
- Gespeicherte Rangnummern aus dem Datenpaket werden nicht verändert oder neu berechnet.
- Vollständiger Nullstand bleibt alphabetisch sortiert und erzeugt weiterhin kein Podium.
- Die dekorative Registermarke „SCHIFFSREGISTER“ wird in allen Ranglistentabellen ausgeblendet.
- Keine Änderungen an Grid, Navigation, Kachelgrößen, Datenmodell oder Grundlayout.

# Version 4.7.0-a4-HF1-TEST – Startseiten-Highscore Textkorrektur – 04.08.2026

- Bezeichnung „Letzter Spieltag“ in der Highscore-Kachel zu „Aktueller Spieltag“ geändert.
- Smugglerauftrags-Bezeichnung kompakt als `Smuggleraufträge · 1. Spieltag` dargestellt.
- Geschütztes Leerzeichen hält `1. Spieltag` als zusammengehörige Einheit und verhindert einen isolierten Zeilenumbruch der Zahl.
- Keine Änderungen an Grid, Kachelgröße, Navigation, Datenlogik oder Grundlayout.

# Version 4.7.0-a4-TEST – Startseiten-Highscore – 04.08.2026

- Highscore-Kachel der Startseite liest die normalisierte Admin-6.2-Struktur.
- Saisonführender wird aus `overall.individual` übernommen; Nullstand bleibt als Saisonstart gekennzeichnet.
- Letzter verarbeiteter Spieltag und dessen Führender werden aus dem Wettbewerbsblock übernommen.
- Saison-Teamduell liest `overall.team` und zeigt Old gegen New als Durchschnitt `0,0 : 0,0 Punkte`.
- Keine Änderungen an Grid, Kachelgrößen, Navigation, HTML-Struktur oder Grundlayout.

# Version 4.7.0-a3-HF3-TEST – Datenbereitstellung korrigiert – 04.08.2026

- `website-view-test.json` aus Admin 6.2 als `website-view.json` in die Website-Testversion übernommen.
- Datenadapter meldet die tatsächlich verwendete Quelle.
- Rückfall auf `highscore.json` wird sichtbar als Warnung ausgewiesen.
- Gesamt-Teamwertung zeigt die zwei Admin-6.2-Teamzeilen auch bei Nullstand.
- Footer und Versionsdatei auf 4.7.0-a3-HF3-TEST korrigiert.

# Website 4.7.0-a3-HF2-TEST – 04.08.2026

- Saison-Teamwertung liest Teamzeilen robust aus `overall.team`, `gesamt.team` oder `teams.overall`.
- Old und New Smugglers bleiben auch beim Nullstand sichtbar.
- Dekorativer Schriftzug „SCHIFFSREGISTER“ wird in der Teamtabelle ausgeblendet, damit „Durchschnitt“ nicht überlagert wird.
- Keine Änderungen an Grid, Navigation, Kachelgrößen oder Grundlayout.

# Version 4.7.0-a3-HF1-TEST – Gesamt-Teamwertung korrigiert – 04.08.2026

- Admin-6.2-Struktur `highscore.gesamt.team` wird korrekt auf die Website-Struktur übernommen.
- Old Smugglers und New Smugglers bleiben auch bei einem Nullstand sichtbar.
- Trefferanzeige zeigt bei vollständigem Teamdatensatz `2 Teams`.
- Suchfeld heißt in der Teamansicht `Team suchen` und filtert Teamnamen.
- Keine Änderungen an Grid, Navigation, Kachelgrößen oder Grundlayout.

# Version 4.7.0-a3-TEST – Gesamtwertungen – 04.08.2026

- Gesamt-Einzelwertung, Gesamt-Teamwertung und Gesamt-Bonuswertung werden strikt getrennt aus Admin-6.2-Daten gelesen.
- Zusammenfassung passt Bezeichnungen an die jeweilige Wertung an.
- Teamansicht zeigt zwei Teams statt Teilnehmerzahl.
- 25er-Pagination aus a2-HF1 bleibt unverändert erhalten.
- Keine Änderung an Grid, Navigation, Kachelgrößen oder Grundlayout.

# Version 4.7.0-a2-HF1-TEST – Pagination der vollständigen Rangliste – 04.08.2026

- Vollständige Ranglisten werden wieder in 25er-Gruppen angezeigt.
- Seitennavigation oberhalb und unterhalb der Tabelle: Zurück, Seiten 1–4, Weiter.
- Suche setzt auf Seite 1 zurück.
- Wettbewerbs- und Ansichtswechsel setzen auf Seite 1 zurück.
- Keine Änderung an Rangdaten, Sortierung, Podium, Grid oder Grundlayout.

# CHANGELOG


## 4.7.0-RC1-TEST
- Kontrollierte Punktesimulation für Release-Validierung.
- Startseite, Highscore, Bonus- und Teamwertung mit Nicht-Null-Daten prüfbar.
- Hall of Fame bleibt absichtlich leer.
