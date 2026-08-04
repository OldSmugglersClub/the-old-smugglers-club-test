# Website 4.7.0-RC5-TEST – Spielzeilen-Siegel und Event-Countdown – 04.08.2026

- Alle Begegnungen der Spieltagsliste zeigen Heim- und Auswärtssiegel aus dem bestehenden Teamregister.
- Der bisherige Bundesliga-Start-Zähler zählt dauerhaft bis zum nächsten zentral bestätigten Event.
- Während eines laufenden Events zeigt der Chronometer „JETZT LIVE“; anschließend wechselt er zum nächsten Termin.
- Ohne weiteren Termin wird ein definierter Saison-/Leerzustand angezeigt.
- Countdown und Spieltagskachel nutzen dieselben zentralen Schedule-Daten aus `website-view.json`.
- Keine Änderungen an Grid, Kachelgrößen, Navigation, Highscore-Berechnung oder Grundlayout.

# Website 4.7.0-RC4-HF2-TEST – Spieltagslogbuch und Ausrichtung – 04.08.2026

- Der vorhandene Button „Spieltagslogbuch“ wird im zentralen Spielbetriebsmodus wieder angezeigt.
- Der zentrale `schedule`-Block enthält den Link und den Buttontext ausdrücklich.
- Der Adapter besitzt zusätzlich robuste Standardwerte, falls ein späterer Admin-Export diese optionalen Angaben nicht liefert.
- Die Paarung in den unteren Spielzeilen der Spieltagskachel wird innerhalb ihrer bestehenden Spalte weiter zentriert.
- Keine Änderungen an Grid, Kachelgröße, Navigation, Kalenderlogik, Siegeln oder Highscore.

# Website 4.7.0-RC4-HF1-TEST – offizieller Tippspielkalender und Statusplakette – 04.08.2026

- Die zentrale Spieltagskachel nutzt nun den vollständigen, aus 4.6.1 übernommenen offiziellen Tippspielkalender.
- Bonusfragen bleiben Tippspieltag Nr. 1; „Smugglerauftrag Auftakt“ ist Tippspieltag Nr. 2.
- Ein Tippspieltag enthält stets alle ihm zugeordneten Spiele; Bundesliga-Spieltage werden vollständig nach Kalendertagen gruppiert.
- Der falsche künstliche Kombinationsspieltag „Bundesliga + Smugglerauftrag“ wurde entfernt.
- Sichtbarer RC4-Testhinweis wurde entfernt.
- Die Statusplakette verhindert Umbrüche wie „LIV / E“.
- Keine Änderungen an Grid, Navigation, Kachelgrößen, Highscore-Berechnung oder Grundlayout.

# Website 4.7.0-RC4-TEST — Zentrale Spielbetriebsintegration

- Spieltagskachel liest primär den neuen `schedule`-Block aus `website-view.json`.
- Highscore und Spieltagskachel verwenden damit dieselbe Website-Momentaufnahme.
- Rückfall auf `spieltag.json`, `spieldaten.json`, `teams.json` und `tippspieltage.json` bleibt erhalten.
- RC4-Testdaten bilden Freitag bis Sonntag, parallelen Smugglerauftrag, mehrere Spiele und Schmugglersiegel ab.
- Keine Änderung an Grid, Kachelgröße, Navigation oder Grundlayout.

# Website 4.7.0 FINAL – freigegebener Referenzstand – 04.08.2026

- Highscore-Grundsystem mit Wettbewerbsauswahl und saisonweiten Gesamtwertungen freigegeben.
- Einzel-, Team- und Bonuswertungen über mehrere Wettbewerbe erfolgreich aggregiert.
- Teamwertung verwendet das arithmetische Mittel als Rangentscheidung und zeigt zusätzlich Punktesumme sowie Mitgliederzahl.
- Startseiten-Highscore, Podium, Suche und 25er-Pagination validiert.
- Hall of Fame bleibt bis zum endgültigen Wettbewerbsabschluss getrennt und ohne künstliche Einträge.
- Produktionsdaten auf den bestätigten Nullstand vor Saisonbeginn zurückgesetzt; RC-Simulationswerte sind nicht enthalten.
- Version 4.7.0 wird als verbindlicher Referenzstand eingefroren.
- Bewusst auf 4.8.0 verschoben: historische Spieltagsnavigation, Nachholspielverwaltung und dynamisches Podium bei Ranggleichstand.

# Website 4.7.0-RC3-HF1-TEST – Spieltagslabel und Team-Podium – 04.08.2026

- Spieltagsbezeichnungen schützen „N. Spieltag“ nun wettbewerbsübergreifend vor einer Trennung zwischen Nummer und Wort.
- Team-Podium zeigt Punktesumme, Durchschnitt und Mitgliederzahl eindeutig getrennt.
- Keine Änderungen an Datenmodell, Grid, Navigation, Kachelgrößen oder Aggregationslogik.

# Website 4.7.0-RC3-TEST – Mehrwettbewerbs-Aggregation – 04.08.2026

- Kontrollierte Nicht-Null-Simulation für Bundesliga und Champions League gleichzeitig.
- Beide Wettbewerbe behalten getrennte Spieltags-, Gesamt- und Teamwertungen.
- Saisonweite Einzel-, Team- und Bonuswertung bildet die Summe beider Wettbewerbe ab.
- Startseiten-Highscore zeigt den zuletzt befüllten Wettbewerb Champions League.
- Hall of Fame bleibt unverändert ohne Sieger.
- Keine Änderungen an Grid, Navigation, Kachelgrößen, Highscore-Code oder Grundlayout.

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

## 4.7.0 FINAL – Gold Master (04.08.2026)

- Freigegebenen FINAL-Stand als unveränderlichen Gold Master gekennzeichnet.
- Produktivsetzung ausdrücklich ausgenommen; separate Freigabe erforderlich.
- `GOLD-MASTER.md` und Integritätsmanifest ergänzt.
- Keine Änderungen an Anwendungslogik, Datenmodell, Layout oder Saison-Nullstand.
