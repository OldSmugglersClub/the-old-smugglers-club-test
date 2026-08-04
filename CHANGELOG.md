# Website 4.7.0-a2-TEST – Neue Highscore-Struktur – 04.08.2026

- Eindeutige saisonweite Bezeichnungen.
- Nullstand ohne künstliches Podium.
- Acht Wettbewerbe mit einheitlichen Ansichten.
- Keine Grundlayoutänderung.

# Version 4.7.0-a1-TEST – Highscore-Datenadapter – 04.08.2026

- Zentralen Adapter `highscore-data-adapter.js` ergänzt.
- Neue Admin-6.2-Ausgabe `website-view.json` wird bevorzugt gelesen.
- Abwärtskompatibler Rückfall auf `highscore.json` und `hall-of-fame.json`.
- Highscore-Seite, Highscore-Teaser, Hall of Fame und Startseiten-Hall-of-Fame verwenden den Adapter.
- Keine Änderung an Grid, Navigation, Kachelgrößen, Design oder sichtbarer Highscore-Struktur.

# CHANGELOG

## Version 4.6.1

### Neu
- `KICKTIPP_EXPORTANALYSE.md`
- `KICKTIPP_IMPORTSPEZIFIKATION.md`
- `kicktipp-import-schema.json`

### Analysiert
- Tipper-Export
- Tipps-Export eines Spieltags
- Ranglisten verschiedener Wertungsspieltage
- Gesamtübersicht Einzelwertung
- Gesamtübersichten beider Teams

### Festgelegt
- Kicktipp-Wertungen werden als offizielle Quelle übernommen.
- Originalexporte bleiben lokal.
- E-Mail-Adressen dürfen nicht in öffentliche JSON-Dateien gelangen.
- Leere Tippfelder gelten als nicht abgegeben.
- `-:-` bleibt bis zur Verifikation ein ungeklärter Sonderwert.
- Parser muss dynamische Spieltags- und Wettbewerbsspalten unterstützen.

### Nicht geändert
- Keine Websitefunktion.
- Keine produktive Adminfunktion.
- Keine JSON-Nutzdaten.

## Version 4.6.0

### Neu
- `SPIELBETRIEB_WORKFLOW.md`
- `ADMIN_COCKPIT_KONZEPT.md`

### Geändert
- Roadmap um Admin-Cockpit und Spielbetriebs-Workflow erweitert.
- Adminhandbuch und Projektmanual ergänzt.
- Versionsangaben aktualisiert.

### Nicht geändert
- Keine Websitefunktion.
- Keine Adminfunktion.
- Keine JSON-Nutzdaten.
- Keine Berechnungslogik.

## Version 4.5.2

### Neu
- 5/3/2-Punktewertung projektweit dokumentiert.
- Remis ohne exaktes Ergebnis als 3-Punkte-Fall festgelegt.
- 90 Minuten einschließlich Nachspielzeit definiert.
- Verlängerung und Elfmeterschießen ausgeschlossen.

### Nicht geändert
- Keine Websitefunktion.
- Keine Adminlogik.
- Keine JSON-Nutzdaten.

## Version 4.5.1

### Neu
- `SPIELTAGSABSCHLUSS_KONZEPT.md` mit verbindlichem Zielworkflow für Kicktipp-Import, Ergebnisprüfung, automatische Berechnung und GitHub-Export erstellt.

### Festgelegt
- Kicktipp-Export ist die verbindliche Wahrheit.
- Fehlende Tipps sind zulässig und werden als nicht abgegeben mit 0 Punkten behandelt.
- Fehlende Tipps blockieren die Berechnung nicht.
- Echte Datenfehler blockieren die Berechnung.
- Tippfrist ist der jeweilige Anstoßzeitpunkt.
- Produktive Importlogik wird erst nach Analyse einer echten Kicktipp-Exportdatei entwickelt.

### Geändert
- `ADMIN_HANDBUCH.md` ergänzt.
- `ROADMAP.md` um den zentralen Spieltagsabschluss erweitert.
- `PromptManual/PROJECT_MANUAL.md` um verbindliche Importregeln ergänzt.
- Versionsangaben aktualisiert.

### Nicht geändert
- Keine öffentliche Websitefunktion.
- Kein Adminmodul.
- Keine JSON-Nutzdaten.
- Keine Berechnungslogik.

## Version 4.5.0

### Neu
- `DATENARCHITEKTUR.md` mit vollständiger Einordnung der bestehenden JSON-Daten.
- `MIGRATIONSMATRIX.md` mit Zielstatus, Abhängigkeiten, Feldmigrationen und Etappenplan.

### Geändert
- `ARCHITEKTUR.md` um Verweise auf die neuen Datenarchitektur-Dokumente ergänzt.
- `ROADMAP.md` an den abgeschlossenen Analyse- und Planungsstand angepasst.
- Versionsangaben aktualisiert.

### Nicht geändert
- Keine JSON-Nutzdaten.
- Keine HTML-, CSS- oder JavaScript-Funktion.
- Keine öffentliche Darstellung.
- Kein Adminmodul.

### Betroffene Dateien
- DATENARCHITEKTUR.md
- MIGRATIONSMATRIX.md
- ARCHITEKTUR.md
- ROADMAP.md
- VERSION.txt
- README.md
- CHANGELOG.md

## Version 4.4.15

### Neu
- Vollständiges `ADMIN_HANDBUCH.md` auf Basis des tatsächlich vorhandenen lokalen Adminsystems v4.0.5 erstellt.
- Bedienung, Datenpflege, Berechnungsreihenfolge, Saisonwechsel, GitHub-Workflow, Backups und bekannte Grenzen dokumentiert.

### Geändert
- Roadmap: Adminhandbuch als abgeschlossen markiert.
- Nächster Schritt auf die Feld-für-Feld-Migrationsmatrix der zentralen Datenhaltung gesetzt.
- Versionsangaben aktualisiert.

### Betroffene Dateien
- ADMIN_HANDBUCH.md
- ROADMAP.md
- VERSION.txt
- README.md
- CHANGELOG.md

## Version 4.4.14

### Behoben
- Lange Überschrift „Datenschutzerklärung“ läuft auf schmalen Mobilgeräten nicht mehr aus der Kachel.
- Gelber Trennstrich zwischen Hauptfooter und rechtlichem Footer auf Desktop entfernt.
- Zu große horizontale Abstände im Desktop-Footer reduziert.

### Geändert
- Rechtlicher Footer auf Desktop kompakter und mittig ausgerichtet.
- Sichtbare Versionsangaben in den rechtlichen Footern aktualisiert.
- Mobile Footer-Anordnung unverändert beibehalten.

### Betroffene Dateien
- legal.css
- index.html
- öffentliche HTML-Seiten mit rechtlichem Footer
- VERSION.txt
- README.md
- CHANGELOG.md

## Version 4.4.13

### Neu
- `DESIGN_GUIDE.md` als verbindliche Dokumentation des freigegebenen visuellen Ist-Zustands erstellt.

### Geändert
- Roadmap an den tatsächlichen Stand der Schmugglersiegel-Integration und Design-Dokumentation angepasst.
- Versionsangaben aktualisiert.

### Betroffene Dateien
- DESIGN_GUIDE.md
- ROADMAP.md
- VERSION.txt
- README.md
- CHANGELOG.md

## Version 4.4.12

### Neu
- Schmugglersiegel-Komponente auf DFB-Pokal, Champions League, Europa League, Relegation, Piratenkodex und Weihnachtsregatta eingebunden.

### Geändert
- Footer-Versionsanzeige auf den betroffenen Seiten aktualisiert.

### Betroffene Dateien
- dfb-pokal.html
- champions-league.html
- europa-league.html
- relegation.html
- piratenkodex.html
- weihnachtsregatta.html
- VERSION.txt
- README.md
- CHANGELOG.md

## Version 4.4.11

### Behoben

- Schmugglersiegel auf Wettbewerbsseiten wurden nur als Buchstabenkürzel angezeigt.
- Die Darstellung ist nicht mehr von einzeln geladenen SVG-Dateien abhängig.

### Geändert

- `team-badge.js` erzeugt das freigegebene Schmugglersiegel direkt als Inline-SVG aus Kürzel und Vereinsfarben des zentralen Registers.
- Bestehende Größen, Abstände und Layoutregeln bleiben unverändert.

### Betroffene Dateien

- `team-badge.js`
- `wettbewerb.css`
- `index.html`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`

## Version 4.4.10 – Schmugglersiegel in Bundesliga und Dynamo-Spielen

### Neu
- Schmugglersiegel in der Bundesliga-Tabelle und der Bundesliga-Formtabelle
- Schmugglersiegel bei Mannschaftspaarungen im Bundesliga-Spielplan
- Schmugglersiegel bei den Dynamo-Dresden-Smuggleraufträgen
- automatischer Kürzel-Fallback bei fehlendem oder nicht ladbarem SVG

### Geändert
- `wettbewerb.js` nutzt die vorhandene zentrale Komponente `team-badge.js`
- Team-IDs werden aus den zentralen Spieldaten bis zur Darstellung weitergegeben
- Mannschaftsnamen ohne direkte Team-ID werden anhand von `teams.json` aufgelöst
- responsive Abstände für Tabellen und Spielpaarungen ergänzt

### Unverändert
- keine Änderung an Grid, Kachelgrößen, Navigation oder Grundlayout
- keine offiziellen Vereinswappen und keine Bildgenerierung
- Vereinsnamen bleiben die führende Information; Siegel sind ergänzend und rückbaubar

### Betroffene Dateien
- `bundesliga.html`
- `dynamo-dresden.html`
- `wettbewerb.js`
- `wettbewerb.css`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`

## Version 4.4.9 – UEFA-Kandidatenpool und vorbereitete Schmugglersiegel

### Neu
- offizieller Kandidatenpool 2026/27 für Champions League und Europa League in `uefa-kandidaten-2026-27.json`
- 107 zusätzliche eigene SVG-Schmugglersiegel für bislang nicht erfasste UEFA-Teams
- Statusangaben je Wettbewerb und Einstiegsrunde in `teams.json`

### Geändert
- `teams.json` umfasst jetzt 159 Teams: aktive Projektteams plus vorsorglichen UEFA-Kandidatenpool
- `schmugglersiegel-register.json` wurde auf 159 Einträge erweitert
- vorhandene Projektteams wurden, sofern zutreffend, um UEFA-Zuordnungen ergänzt

### Unverändert
- keine Änderung an HTML, CSS, JavaScript, Grid, Kachelgrößen oder Navigation
- Kandidatenteams erscheinen nur, wenn sie später in einer Wettbewerbs-JSON referenziert werden
- keine offiziellen Vereinswappen und keine Bildgenerierung

### Betroffene Dateien
- `teams.json`
- `uefa-kandidaten-2026-27.json`
- `assets/smugglers-design-system/schmugglersiegel/*.svg`
- `assets/smugglers-design-system/schmugglersiegel/schmugglersiegel-register.json`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`

## Version 4.4.8 – Vollständige Schmugglersiegel-Bibliothek und zentrale Komponente

### Neu
- 52 eigene SVG-Schmugglersiegel für alle aktuell aktiven Vereine aus `teams.json`
- zentrales Register `schmugglersiegel-register.json` mit Team-ID, Kürzel, Farben und Dateipfad
- zentrale JavaScript-Komponente `team-badge.js` für Auflösung, Darstellung und Fallback

### Geändert
- die Kachel „Aktueller Spieltag“ verwendet die zentrale Komponente statt lokaler Sonderlogik
- der freigegebene v2-Stil mit dominanten Kürzeln und kräftigen Vereinsfarben wurde auf die vollständige Bibliothek übertragen
- Projekt- und SDS-Dokumentation auf Version 4.4.8 aktualisiert

### Unverändert
- keine Änderung an Kachelgrößen, Grid, Navigation, Grundlayout oder Spieldaten
- keine offiziellen Vereinswappen und keine Bildgenerierung

### Betroffene Dateien
- `index.html`
- `team-badge.js`
- `assets/smugglers-design-system/schmugglersiegel/*.svg`
- `assets/smugglers-design-system/schmugglersiegel/schmugglersiegel-register.json`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
- `ROADMAP.md`
- `assets/smugglers-design-system/dokumentation/SMUGGLERS_DESIGN_SYSTEM.md`
- `RELEASE_NOTES_v4.4.8.md`
- `GITHUB-UPDATE-4.4.8.md`

---

## Version 4.4.6 – Farbige Schmugglersiegel in „Aktueller Spieltag“

### Neu
- erste zwei echte, vektorbasierte Schmugglersiegel für 1. FC Nürnberg und SG Dynamo Dresden
- farbliche Vereinszuordnung ohne Verwendung offizieller Vereinswappen
- technischer Kürzel-Fallback, falls ein Siegel fehlt oder nicht geladen werden kann

### Behoben
- Mannschaften in der Desktop-Paarung nicht mehr unnötig weit auseinandergezogen
- auf Mobil mehr Abstand zwischen Schmugglersiegel und Mannschaftsname
- klarere Ausrichtung von Heimteam, Trenner und Auswärtsteam

### Geändert
- ausschließlich die hervorgehobene Paarung in der Kachel „Aktueller Spieltag“ angepasst
- `README.md`, `ROADMAP.md` und `VERSION.txt` auf Version 4.4.6 aktualisiert

### Unverändert
- keine Änderung an Kachelgröße, Grid, Navigation, Grundlayout oder Spieldaten
- keine Bildgenerierung; die Siegel sind eigenständige SVG-Projektdateien

### Betroffene Dateien
- `index.html`
- `assets/smugglers-design-system/schmugglersiegel/nuernberg.svg`
- `assets/smugglers-design-system/schmugglersiegel/dynamo-dresden.svg`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
- `ROADMAP.md`
- `RELEASE_NOTES_v4.4.6.md`
- `GITHUB-UPDATE-4.4.6.md`

---

## Version 4.4.5 – Start des Smugglers Design System

### Neu
- verbindliche Spezifikation für eigene **Schmugglersiegel**
- zentrale Ordnerstruktur unter `assets/smugglers-design-system/`
- Regeln für Masterdesign, Farben, Kürzel, Größen, Dateinamen, Rückbau und Integration
- klare Entwicklungsphasen von Master über Pilotserie bis Vereinsbibliothek

### Geändert
- `PromptManual/PROJECT_MANUAL.md` um verbindliche SDS-Regeln ergänzt
- `ROADMAP.md` um das Smugglers Design System erweitert
- `README.md` und `VERSION.txt` auf Version 4.4.5 aktualisiert

### Unverändert
- keine Änderung an HTML, CSS, JavaScript oder JSON-Nutzdaten
- keine Änderung an Grid, Kachelgrößen, Navigation oder öffentlicher Darstellung
- keine Bilddateien erzeugt

### Betroffene Dateien
- `assets/smugglers-design-system/README.md`
- `assets/smugglers-design-system/dokumentation/SMUGGLERS_DESIGN_SYSTEM.md`
- `PromptManual/PROJECT_MANUAL.md`
- `ROADMAP.md`
- `README.md`
- `VERSION.txt`
- `CHANGELOG.md`
- `RELEASE_NOTES_v4.4.5.md`
- `GITHUB-UPDATE-4.4.5.md`

---

## Version 4.4.3 – Rechtliche Grundseiten und Footer

### Neu
- Impressumsseite mit Betreiber- und Kontaktdaten
- Datenschutzerklärung für den aktuell geprüften Betrieb über GitHub Pages und IONOS
- gemeinsames Stylesheet `legal.css` für rechtliche Seiten und Footer
- dezente Links zu Impressum und Datenschutz auf allen öffentlichen Seiten

### Geändert
- Versionsanzeige im öffentlichen Footer auf 4.4.3 gesetzt

### Betroffene Dateien
- zwölf öffentliche HTML-Seiten
- `impressum.html`
- `datenschutz.html`
- `legal.css`
- `VERSION.txt`
- `README.md`
- `ROADMAP.md`

## Version 4.4.2 – Analyse des lokalen Adminsystems – 31.07.2026

### Neu

- `ADMIN-SYSTEMANALYSE.md` mit vollständiger Bestandsaufnahme des lokalen Adminbereichs v4.0.5.
- Module, Datenflüsse, Exportdateien, Stärken, Risiken und empfohlene weitere Schritte dokumentiert.

### Geändert

- `ARCHITEKTUR.md` um die reale lokale Administration als eigenständige zweite Anwendung ergänzt.
- `ROADMAP.md` an den geprüften Adminstand und die nächste Dokumentationsphase angepasst.
- `README.md` und `VERSION.txt` auf Version 4.4.2 aktualisiert.

### Behoben

- keine funktionalen Fehler; reine Dokumentations- und Analyseversion.

### Betroffene Dateien

- `ADMIN-SYSTEMANALYSE.md`
- `ARCHITEKTUR.md`
- `ROADMAP.md`
- `README.md`
- `VERSION.txt`
- `CHANGELOG.md`
- `RELEASE_NOTES_v4.4.2.md`
- `GITHUB-UPDATE-4.4.2.md`

---

## Version 4.4.1 – Verbindliche Projektroadmap – 31.07.2026

### Neu

- `ROADMAP.md` mit der verbindlichen Entwicklungsreihenfolge von Version 4.4.x bis Version 5.0 LTS.
- Abgeschlossene öffentliche Bereiche, offene Architekturarbeiten, Adminpflege, Qualitätsprüfung und LTS-Freigabekriterien getrennt dokumentiert.
- Nächster verbindlicher Arbeitsschritt als Erstellung von `DESIGN_GUIDE.md` festgelegt.

### Geändert

- Versions- und Projektdokumentation auf Version 4.4.1 angehoben.

### Unverändert

- Keine Änderung an HTML, CSS, JavaScript, JSON-Daten, Kachelgrößen, Grid, Navigation oder öffentlicher Darstellung.

### Betroffene Dateien

- `ROADMAP.md`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
- `RELEASE_NOTES_v4.4.1.md`
- `GITHUB-UPDATE-4.4.1.md`

# Änderungsverlauf

## Version 4.4.0 – Architekturdokumentation – 31.07.2026

### Neu

- `ARCHITEKTUR.md` mit einer Bestandsaufnahme der öffentlichen Seiten, Wettbewerbslogik, zentralen Datenquellen, Adminwerkzeuge und bekannten Architektur-Risiken.
- Zielbild für die spätere zentrale Datenhaltung dokumentiert.
- Verbindlicher nächster Schritt als Feld-für-Feld-Migrationsmatrix festgelegt.

### Geändert

- `PromptManual/PROJECT_MANUAL.md` auf den zuletzt freigegebenen Stand mit dem Hinweis für KI-Assistenten aktualisiert.
- Versions- und Projektdokumentation auf Version 4.4.0 angehoben.

### Unverändert

- Keine Änderung an HTML, CSS, JavaScript, JSON-Daten, Kachelgrößen, Grid, Navigation oder öffentlicher Darstellung.

### Betroffene Dateien

- `ARCHITEKTUR.md`
- `PromptManual/PROJECT_MANUAL.md`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
- `RELEASE_NOTES_v4.4.0.md`
- `GITHUB-UPDATE-4.4.0.md`

# Änderungsverlauf

## Version 4.3.8 – Starttitel auf einer Zeile – 31.07.2026

### Behoben

- Die künstliche Breitenbegrenzung des Textbereichs in der Startzentrale wurde entfernt.
- „Der Hohe Schmugglerrat“ kann auf Desktop die verfügbare Kachelbreite nutzen und wird nicht mehr unnötig nach „Der Hohe“ umgebrochen.

### Geändert

- Ausschließlich `max-width` von `.welcome-command-copy` in `index.html` von `79%` auf `100%` gesetzt.
- Keine Änderung an Kachelgröße, Grid, Navigation, Grundlayout oder Datenlogik.

### Neu

- `RELEASE_NOTES_v4.3.8.md`
- `GITHUB-UPDATE-4.3.8.md`

### Betroffene Dateien

- `index.html`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
- `PromptManual/PROJECT_MANUAL.md`

# Änderungsverlauf

## Version 4.3.7 – Der Hohe Schmugglerrat – 31.07.2026

### Geändert
- Überschrift der Startzentrale von „Schmugglerrat“ in „Der Hohe Schmugglerrat“ geändert.
- Zwischen Saison-Badge und Überschrift wurde die dezente Zusatzzeile „Hauptquartier des Old Smugglers Club“ ergänzt.
- Typografie und mobile Schriftgröße innerhalb der bestehenden Startkachel angepasst.

### Unverändert
- Kachelgröße, Grid, Navigation, Grundlayout, Bilder und Datenlogik.

### Betroffene Dateien
- `index.html`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
- `RELEASE_NOTES_v4.3.7.md`
- `GITHUB-UPDATE-4.3.7.md`

# Changelog

## Version 4.3.6 – Schmugglerrat – 31.07.2026

### Geändert
- Überschrift der Startzentrale von „Zentrale der Crew“ in „Schmugglerrat“ geändert.
- Einleitungstext ersetzt durch: „Hier werden Kurse gesetzt, Missionen vorbereitet und alle Wettbewerbe des Old Smugglers Club koordiniert.“

### Unverändert
- Kachelgröße, Grundlayout, Grid, Navigation und Datenlogik bleiben unverändert.
- Keine Bilder erstellt oder verändert.

### Betroffene Dateien
- `index.html`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
- `RELEASE_NOTES_v4.3.6.md`
- `GITHUB-UPDATE-4.3.6.md`

## Version 4.3.5 – Trennerkorrektur Startzentrale – 31.07.2026

- CSS-Konflikt im Trenner unter „Zentrale der Crew“ behoben.
- Das mittlere Rautenelement besitzt nun eine feste Breite und kann nicht mehr durch eine ältere `flex: 1`-Regel diagonal aufgezogen werden.
- Geerbten Hintergrundverlauf des Rautenelements entfernt.
- Keine Änderungen an Kachelgröße, Inhalten, Datenlogik oder mobiler Struktur.
- Keine Bilder erstellt oder verändert.

## 4.3.3 – Bonuswettbewerb
- Tippspieltag Nr. 1 als saisonbegleitenden Bonuswettbewerb mit 25 Fragen ergänzt.
- Jede richtige Antwort bringt 5 Punkte; maximal sind 125 Bonuspunkte möglich.
- Bonuspunkte zählen zur Gesamtwertung.
- Eigener Highscore-Bereich „Bonuswettbewerb“ ergänzt.
- Hall of Fame um den Sieger des Bonuswettbewerbs erweitert.
- Mobile Darstellung der neuen Rangliste abgesichert.

## 4.3.0 – Startzentrale mit klarer Hierarchie

- störende Kompassscheibe und Siegelprägung entfernt
- eine dominante Hauptaktion „Zur Tipprunde“
- dezente Schnellzugriffe zu Highscore, Hall of Fame und Wettbewerben
- Einführungstext gekürzt und atmosphärische Leitzeile ergänzt
- mobile Darstellung stabilisiert
- keine Bildänderungen

## Version 4.1.9 – Saisonakte für Spieler

- Technische Begriffe auf der öffentlichen Saisonübersicht entfernt.
- „Zentral hinterlegt“ und der sichtbare Verweis auf `spieldaten.json` durch verständliche Saisoninformationen ersetzt.
- Hinweise zu noch nicht ausgelosten oder terminierten Begegnungen klarer formuliert.
- Fehlermeldung der Saisonübersicht spielerfreundlich überarbeitet.
- Europa League im Begrüßungstext der Startzentrale ergänzt.
- Keine Änderung an Bildern, Grundraster, Kachelgrößen, Navigation oder Datenlogik.

## Version 4.1.8 – Responsive Stabilisierung

- Globale Schutzregeln gegen horizontales Überlaufen in öffentlichen Kacheln ergänzt.
- Saubere Wortumbrüche ohne Trennung mitten im Wort vereinheitlicht.
- Mobile Wettbewerbs-, Highscore- und Hall-of-Fame-Karten auf eine stabile Einspaltenansicht abgesichert.
- Buttons und Beschriftungen gegen Überlagerungen und abgeschnittene Texte abgesichert.
- Keine Änderung an Bildern, Grundraster, Kachelgrößen, Navigation oder Datenlogik.

## 4.1.7 – Startzentrale bereinigt

- Die in Version 4.1.5 zusätzlich eingeblendeten Schnellzugriffs-Buttons entfernt.
- Die bereits im Kachelmotiv vorhandenen Schaltflächen bleiben alleinige Bedienflächen.
- Die unsichtbaren Klickbereiche für „Zum Kicktipp“ und „Wettbewerbe ansehen“ bleiben erhalten.
- Keine Änderung an Bilddateien, Kachelgröße, Grundraster oder Navigation.
- Desktop- und Mobile-Darstellung wieder überlagerungsfrei.

## 4.1.5 – Startzentrale

- Willkommen-Kachel um zwei sichtbare Schnellzugriffe ergänzt.
- Direkte Verknüpfung zur Tipprunde und Saisonübersicht.
- Mobile Bedienflächen stabilisiert.
- Keine Änderung an Kachelgröße, Raster oder Bilddateien.

## 4.1.3 – Hall-of-Fame Darstellungsfehler behoben

- Unsichtbarer Pokal-Fallback wird nun tatsächlich ausgeblendet.
- Das übergroße, senkrechte Wort „POKAL“ unter dem Championbild wurde entfernt.
- Die Hall-of-Fame-Kachel behält wieder ihre vorgesehene kompakte Höhe und Zweispaltenstruktur.
- Keine Änderung an Bildern, Kachelgrößen, Grundlayout, Daten oder Navigation.

# Version 4.1.2 – Highscore Ranglistenlogbuch

- Highscore-Kachel auf der Startseite sprachlich und gestalterisch als Ranglistenlogbuch geschärft.
- Generisches Kronensymbol durch das vorhandene hochwertige Pokal-SVG ersetzt.
- Detailseite um eine kompakte Orientierung für Einzelwertung, Teamduell und Clubchronik ergänzt.
- Bezeichnungen und Rücknavigation für normale Kicktipp-Spieler verständlicher formuliert.
- Mobile Wortumbrüche der neuen Orientierungselemente und Register stabilisiert.
- Ranglistenlogik, Teilnehmerdaten, Tabellen, Kachelgrößen, Grundraster und Navigation unverändert gelassen.
- Keine Bilderstellung und keine neuen Bilddateien.

# Version 4.1.1 – Hall of Fame Ehrenlogbuch

- Hall-of-Fame-Bereich auf der Startseite als öffentliches Ehrenlogbuch geschärft.
- Neue Detailseite `hall-of-fame.html` mit Titelkabinett, Meisterchronik, Rekordtafel und besonderen Leistungen.
- Bestehende bestätigte Titel und Rekorde unverändert übernommen.
- Offene Wettbewerbe weiterhin klar gekennzeichnet.
- Emoji-Pokal-Fallback durch eine neutrale Gestaltung im Piratendesign ersetzt.
- Mobile Wortumbrüche und Bedienflächen im Hall-of-Fame-Bereich stabilisiert.
- Keine Änderungen an Grundraster, Kachelgrößen oder Navigation.

# Changelog

## Version 4.1.0 – Smugglerauftrag Missionsakte

- Startseitenkachel „Smuggleraufträge“ zur aktuellen Mission „Operation Auftakt“ ausgebaut.
- Spielpaarung 1. FC Nürnberg – Dynamo Dresden, Termin, Status und Wertung direkt sichtbar.
- Neue Detailseite `smugglerauftrag-auftakt.html` angelegt.
- Mobile Darstellung der Missionskachel angepasst.
- Keine Änderung an Grundraster, Kachelgrößen oder Navigation.

## Version 4.0.6 – Mobile Spieltagskachel – 31.07.2026

- Darstellungsfehler der Spieltagskachel auf schmalen Smartphone-Displays korrigiert.
- Titel erhält auf Mobilgeräten wieder die volle Kachelbreite und wird nicht mehr mitten im Wort getrennt.
- Statusschild zeigt Angaben wie „1 SPIEL“ zusammenhängend statt buchstabenweise untereinander.
- Desktop-Darstellung, Datenlogik, Kachelmaße und übrige mobile Bereiche bleiben unverändert.

# Changelog

## 4.0.5 – Bereinigung des öffentlichen Spielerbereichs

- Technische Datenquellen-, Register- und Prüfhinweise aus dem öffentlichen Highscore entfernt.
- Teilnehmerzahl ersetzt die interne Exportanzeige in der Highscore-Kopfzeile.
- CSV- und technische Registerausgabe aus der öffentlichen Rangliste entfernt.
- Rekorde, Feldanalyse, Chronik und Saisonverlauf mit verständlichen Spielertexten versehen.
- Technische Ladefehler in neutrale Besucherhinweise umformuliert.
- Nicht benötigte interne Altdateien aus dem öffentlichen Paket entfernt.
- Lokaler Administrationsbereich bleibt unverändert.

## 4.0.4 – Öffentliche Website und lokale Administration getrennt

- Sämtliche Administrations-, Pflege-, Kontroll- und Exportseiten aus dem öffentlichen GitHub-Paket entfernt.
- Öffentliche Spielerwebsite enthält nur noch Teilnehmerinhalte.
- Separates lokales Admin-Paket mit Startskript und Bedienungsanleitung erstellt.
- Keine Änderung am freigegebenen Layout, den Kachelgrößen oder der mobilen Darstellung.

# Version 4.0.3 – Trennung Spielerbereich und Administration – 31.07.2026

- Öffentliche Wettbewerbsseiten konsequent auf Inhalte für Mitspieler reduziert.
- Administrationszentrum, Prüfprotokolle, Datenregister, Konsistenzprüfungen, Export- und Datenpflegeansichten aus allen Wettbewerbsseiten entfernt.
- Sichtbar bleiben Wettbewerbsnavigation, aktuelle Wettbewerbslage, Spiele, Ergebnisse, Tabellen und sportliche Statistiken.
- Sämtliche Verwaltungsseiten und Funktionen bleiben unverändert vorhanden, sind aber nicht mehr aus dem öffentlichen Wettbewerbsbereich verlinkt.
- Keine Änderung an Datenbeständen, Wertungslogik, Kachelgrößen oder mobiler Darstellung.

# Changelog

## Version 4.0.2 – Highscore-Teilnehmerabgleich

- Highscore-Rückfallquelle `highscore.json` mit der zentralen Teilnehmerliste synchronisiert.
- Fehlende Teilnehmer `Eckes2359` und `Stevie26` in Gesamt- und Spieltagswertung ergänzt.
- Highscore zeigt nun alle 100 aktiven Mitglieder.
- Punkte, Platzierung, Layout und mobile Darstellung bleiben unverändert.

## Version 4.0.1 – Desktop-Highscore-Kachel

- Highscore-Kachel der Desktop-Startseite optisch aufgewertet.
- Vorhandene dynamische Highscore-Daten und Verlinkung unverändert beibehalten.
- Piratenelemente ausschließlich mit HTML, CSS und bereits vorhandenen SVG-Symbolen umgesetzt.
- Außenmaße, Seitenraster, Abstände und übrige Kacheln unverändert.
- Mobile Highscore-Darstellung unverändert.

## 4.0 – Produktionsfreigabe und aktuelle Teilnehmerbasis

- aktuelle Kicktipp-Mitgliederliste mit 100 Teilnehmern übernommen
- bestehende stabile Teilnehmer-IDs erhalten
- zwei neue Teilnehmer ergänzt: Eckes2359 und Stevie26
- Smuggler-Teamzuordnungen aus dem Export aktualisiert
- Mitgliedsdatum und Sprache in die zentrale Teilnehmerstruktur aufgenommen
- E-Mail-Adressen bewusst nicht in öffentliche Dateien übernommen
- Teilnehmerpflege um Mitgliedsdatum und Sprache erweitert
- vorhandenen Syntaxfehler im Saisonarchiv-Export behoben
- Importbericht und Datenschutz-Hinweis ergänzt
- Versions-, Systemstatus-, Datenregister- und Releaseprüfungen auf 4.0 vereinheitlicht
- keine Änderung am freigegebenen öffentlichen Grundlayout oder an Kachelgrößen

## Version 3.26 – Zentrale Datenqualitätsprüfung

- Neue Verwaltungsseite `datenqualitaet.html`.
- Referenz-, Eindeutigkeits- und Plausibilitätsprüfung für zentrale Saison-, Teilnehmer-, Tipp- und Sonderdaten.
- Fehler, Warnungen und Hinweise werden getrennt ausgewiesen und können gefiltert werden.
- JSON- und CSV-Export des Prüfberichts ergänzt.
- Keine automatische Veränderung der Quelldateien oder des GitHub-Repositories.
- Öffentliches Grundlayout und bestehende Kachelgrößen bleiben unverändert.

## Version 3.23 – Abgabe-Erinnerungen

- Neue Verwaltungsseite `abgabe-erinnerungen.html`.
- Offene Tippabgaben werden nach Teilnehmer, Wettbewerb und Zeitraum gebündelt.
- Vorbereitete Erinnerungstexte können einzeln kopiert werden.
- Export als JSON, CSV und Textliste.
- Keine automatische Zustellung und keine Veränderung von Website-Daten.
- Neues Exportziel `abgabe-erinnerungen.json`.

# Version 3.22 – Tippfristen- und Abgabekontrolle

- Zentrale Fristenübersicht mit 24-Stunden-Warnung ergänzt.
- Aktive Teilnehmer und vorhandene Tippabgaben werden je Spiel abgeglichen.
- Unbestätigte Anstoßzeiten bleiben ausdrücklich als unsicher markiert.
- JSON- und CSV-Export ergänzt.
- Öffentliches Layout unverändert.

# Version 3.21 – Saisonarchiv und Hall of Fame

- Zentrale Archivseite für abgeschlossene Saisons, Wettbewerbe und Titelträger ergänzt.
- Bestehende Hall-of-Fame-Daten in ein strukturiertes Saisonarchiv überführt.
- Rekordtafel sowie JSON- und CSV-Export ergänzt.
- Administrationszentrum und Datenregister erweitert.
- Öffentliches Grundlayout und Kachelgrößen unverändert.

# Changelog

## Version 3.20 – Ranglistenverlauf und Formkurve

- Neue Auswertung der kumulierten Punkte- und Platzierungsentwicklung über alle zentral erfassten Spieltage.
- Wettbewerbsfilter, Teilnehmervergleich, Formwert der letzten fünf Abschnitte sowie JSON- und CSV-Export ergänzt.
- Öffentliches Grundlayout und bestehende Kachelgrößen unverändert belassen.


## 3.19 – Spieltag-Einzelwertungen

- Eigene Rangliste für jeden zentral erfassten Spieltag ergänzt.
- Zuordnung über stabile Spiel-IDs und die Spieltagsangaben aus `spieldaten.json`.
- Wettbewerb, Spieltag und Teilnehmer können gefiltert werden.
- Einzelprotokoll sowie JSON- und CSV-Export umgesetzt.
- Neue zentrale Exportdatei `spieltagpunkte.json` ergänzt.
- Gesamtwertung, Wettbewerbswertungen und öffentliches Grundlayout bleiben unverändert.

## 3.18 – Wettbewerbs-Einzelwertungen

- Zentrale Punkteauswertung nach einzelnen Wettbewerben getrennt.
- Eigene Rangliste für jeden Wettbewerb mit 2/3/5-, Bonus- und Gesamtpunkten.
- Wettbewerbsübersicht mit Teilnehmerzahl, Wertungen und vergebenen Punkten ergänzt.
- Suche, Wettbewerbswechsel sowie JSON- und CSV-Export umgesetzt.
- Neue zentrale Exportdatei `wettbewerbspunkte.json` ergänzt.
- Gesamtwertung und öffentliches Grundlayout bleiben unverändert.

## 3.16 – Smugglerauftrag-Auswertung

- Separate Rangliste ausschließlich für die 34 Dynamo-Smuggleraufträge ergänzt.
- Wertung nach den bestehenden 2/3/5-Regeln, ohne die Gesamtwertung zu verändern.
- Filter nach einzelnen abgeschlossenen Aufträgen und Teilnehmern ergänzt.
- Export von `smugglerpunkte.json` und einer CSV-Rangliste umgesetzt.
- Smugglerwertung im Administrationszentrum verlinkt.

## Version 3.12 – Vollständige Punkteberechnung

- Zentrale 2/3/5-Punkteberechnung umgesetzt.
- Neue Seite `punkteberechnung.html` mit Rangliste und Einzelwertungen.
- Exaktes Ergebnis: 5 Punkte, richtige Differenz: 3 Punkte, richtige Tendenz: 2 Punkte.
- Nur die höchste zutreffende Wertungsstufe zählt.
- Integrierte Regeltests für exakte Ergebnisse, Differenz, Tendenz, Remis und Fehlertipps.
- Export von `punkte.json` und Ranglisten-CSV.
- Zentrale Dateien `wertungsregeln.json` und `punkte.json` ergänzt.

# Version 3.11 – Zentrale Tippdaten

- Neue lokale Pflegeoberfläche `tipppflege.html`.
- Tipps werden über stabile Teilnehmer- und Spiel-IDs referenziert.
- Prüfung auf doppelte Tipps je Teilnehmer und Spiel, ungültige Torwerte und unbekannte Referenzen.
- Suche, Filter, Bearbeitung, Kopie, lokale Löschung und Export der vollständigen `tipps.json`.
- Direkter Zugang aus dem Administrationszentrum.
- Keine automatische Änderung des GitHub-Repositories.

# Version 3.9 – Zentrale Wettbewerbsverwaltung

- Neue lokale Pflegeoberfläche `wettbewerbspflege.html`.
- Wettbewerbe können gesucht, gefiltert, bearbeitet, ergänzt und lokal entfernt werden.
- Validierung für IDs, HTML-Seiten, Filter, Saisonziele und doppelte Zuordnungen.
- Export einer vollständigen `wettbewerbe.json` für den manuellen GitHub-Upload.
- Direkter Zugang aus dem Administrationszentrum.
- Keine Änderung am freigegebenen Layout oder an bestehenden Kachelgrößen.

# Änderungsprotokoll

## 3.8 – Zentrale Spielpflege
- Neue lokale Pflegeoberfläche für die zentrale Datei `spieldaten.json`.
- Spiele können gesucht, gefiltert, bearbeitet, neu angelegt und lokal gelöscht werden.
- Vor dem Export werden IDs, Teamzuordnung, Ergebnisse und Terminzeiträume geprüft.
- Export erfolgt als vollständige Datei für den manuellen GitHub-Upload.
- Keine automatische Änderung des Repositories.

# Version 3.7.3 – Mobile Highscore-Karten und Cache-Korrektur

- Mobile Highscore-Karten auf der Startseite verbindlich als einspaltige Karten dargestellt.
- Kartenrahmen, Hintergrund, Innenabstände und Textfluss mit spezifischen Startseitenregeln abgesichert.
- `highscore.css` in `index.html` mit Versionskennung `v=3.7.3` versehen, damit Browser und GitHub Pages die korrigierte Datei neu laden.
- Desktop- und Tablet-Layout unverändert.

# Version 3.7.2 – Mobile Highscore-Korrektur

- Mobile Highscore-Karten untereinander statt in drei zu schmalen Spalten.
- Unlesbare Worttrennungen entfernt.
- Desktop- und Tablet-Ansicht unverändert.

# Changelog

## 3.7 – Zentrales Daten-Cockpit
- Neue lesende Übersichtsseite `daten-cockpit.html`.
- Kennzahlen für Wettbewerbe, Spiele, offene und beendete Begegnungen.
- Integritätsstatus und Hinweise aus dem zentralen Datenmodell.
- Direkte Sprunglinks zu allen Wettbewerbsseiten.
- Zugang aus dem Administrationszentrum.
- Keine Änderungen an freigegebenem Grundlayout oder Kachelgrößen.

# Version 3.5 – Datenimport und Wiederherstellung

- Lokale Prüfung zuvor exportierter OSC-Datensicherungen im Administrationszentrum.
- Struktur-, Quellen- und Versionskontrolle vor einer manuellen Wiederherstellung.
- Export eines nachvollziehbaren Importplans mit Ersetzen-, Prüf- und Fehlstellenliste.
- Erneuter Download einer erfolgreich geprüften Sicherung.
- Keine automatische Änderung von GitHub-Dateien und keine Layoutänderungen.

# Version 3.4 – Zentrale Datenpflege und Update-Sicherheit

- Administrationszentrum um automatische Datenkonsistenzprüfung erweitert.
- Lokale Gesamtsicherung aller erreichbaren JSON-Datenquellen als eine Sicherungsdatei ergänzt.
- Systembericht enthält nun zusätzlich das Ergebnis der zentralen Modellvalidierung.
- Datenregister und Systemstatus auf Version 3.4 aktualisiert.
- Keine Änderung an Grundlayout, Kachelgrößen oder Navigation.

# Version 3.2 – Statistik- und Highscore-Erweiterung

- Feldanalyse mit Durchschnitt, Median, Punktespanne und Streuung ergänzt.
- Leistungszonen für den bestätigten Gesamtstand ergänzt.
- Transparenter Bereitschaftsmodus ohne simulierte Werte.
- Keine Änderungen an Grundlayout, Kachelgrößen oder Navigation.

# Version 3.0.1 – Repository Cleanup (31.07.2026)

- GitHub-Paket auf direkte Root-Struktur bereinigt.
- Alte Versions-READMEs, Upload-Anleitungen und Testdateien entfernt.
- Nicht referenzierte Zwischenstände von Bildern, CSS, JavaScript und JSON entfernt.
- Explizite Dateiänderungsliste für GitHub ergänzt.
- Keine Änderung an Layout, Kachelgrößen, Navigation oder produktiven Website-Funktionen.

# Changelog

## Version 2.43 – Zentrale Wettbewerbs- und Saisonmetadaten

- Wettbewerbsnavigation, Seitenfilter und Saisonmetadaten in `wettbewerbe.json` zusammengeführt.
- Saisonübersicht an das zentrale Wettbewerbsregister angebunden.
- Doppelte Pflege von Wettbewerbsnamen, Seitenzielen, Filtern, Zielwerten, Zeiträumen und Statusangaben entfernt.
- `saison-2026-2027.json` auf globale Saison- und Seitentexte reduziert.
- Startseiten-Spieltaganzeige lädt ihre vier Datenquellen nun vollständig über `datenregister.json`.
- Rückfallpfade bleiben erhalten; Grundlayout, Kachelgrößen und freigegebene Bereiche unverändert.


## Version 2.41 – Zentrale Wettbewerbsregistrierung

- Neue zentrale Datei `wettbewerbe.json` für Navigation, Seitenzuordnung und Spiel-Filter.
- Alle acht Wettbewerbsseiten lesen dieselben Wettbewerbsdefinitionen.
- Doppelt gepflegte Filter- und Navigationslisten in der Laufzeitlogik entfallen.
- Neuer Bereich „Zentrale Datenbasis“ zeigt die gemeinsam genutzten Quellen und den aktiven Seitenfilter.
- Seitenspezifische JSON-Dateien bleiben auf redaktionelle Texte beschränkt.
- Grundlayout, Raster, Kachelgrößen und freigegebene Bereiche unverändert.

# Version 2.40 – Wettbewerbs-Dashboard & Bereitschaftsmatrix

- Aufklappbare Gesamtlage aller acht Wettbewerbe auf jeder Wettbewerbsseite ergänzt.
- Erfassten Spielumfang, Terminierungsstand, beendete Spiele und nächsten offenen Eintrag zentral vergleichbar gemacht.
- Belastbare Statusstufen „Nicht vorbereitet“, „Struktur vorbereitet“, „Teilweise terminiert“, „Terminbereit“ und „Abgeschlossen“ eingeführt.
- Aktive Wettbewerbsseite in der Matrix markiert und alle Wettbewerbe direkt verlinkt.
- Alle Werte ausschließlich aus `spieldaten.json` abgeleitet; keine Termine oder Ergebnisse geschätzt.
- Kontrollansicht als Vorbereitung für die anschließende Vereinheitlichung der zentralen Datenpflege umgesetzt.
- Mobile Tabellenansicht innerhalb des Bereichs scrollbar gehalten.
- Grundlayout, Raster, Kachelgrößen und übrige Websitebereiche unverändert gelassen.

# Changelog

## Version 2.39 – Wettbewerbs-Lagebild

- Einheitliches aktuelles Lagebild auf allen acht Wettbewerbsseiten ergänzt.
- Letztes bestätigtes Ergebnis wird mit Termin und Resultat ausgewiesen.
- Nächste bestätigte Partie wird getrennt von noch offenen Einträgen angezeigt.
- Wettbewerbsfortschritt wird ausschließlich aus zentral erfassten Spielen und Endergebnissen berechnet.
- Anzahl der erfassten Runden beziehungsweise Abschnitte wird transparent dargestellt.
- Fehlende Termine, Paarungen und Ergebnisse bleiben ausdrücklich als offen markiert.
- Responsive Darstellung für Desktop, Tablet und Mobilgeräte ergänzt.
- Grundlayout, Raster, Kachelgrößen und bereits freigegebene Bereiche bleiben unverändert.

## Version 2.37 – Wettbewerbs-Navigator & Datenkompass

- Alle acht Wettbewerbsseiten besitzen jetzt einen gemeinsamen, responsiven Wettbewerbs-Navigator.
- Die aktuell geöffnete Wettbewerbsseite wird eindeutig markiert.
- Neuer Wettbewerbs-Kompass mit zentral erfassten Spielen, abgeschlossenen Partien, offenen Begegnungen und nächstem Termin.
- Der Datenstand wird direkt aus `spieldaten.json` übernommen.
- Fehlende Daten werden ausdrücklich ausgewiesen und nicht geschätzt.
- Keine Änderungen am freigegebenen Grundlayout, Raster oder an den Kachelgrößen der Startseite.

## Version 2.36 – Highscore Saisonarchiv & Clubchronik

- Zentrale `hall-of-fame.json` zusätzlich in die Highscore eingebunden.
- Neuer Bereich „Saisonarchiv & Bestmarken“ mit ausschließlich bestätigten Titeln und Rekorden.
- Offene oder unbestätigte Chronikeinträge werden automatisch ausgeblendet.
- Spielerprofile zeigen vorhandene historische Titel und Rekorde des jeweiligen Spielers.
- Ausfall der Hall-of-Fame-Datei beeinträchtigt die aktuelle Rangliste nicht.
- Desktop-, Tablet- und Mobilgestaltung im bestehenden Holz-, Leder- und Messingstil ergänzt.
- Grundlayout, Raster, Kachelgrößen und übrige Websitebereiche unverändert.

# Version 2.35 – Highscore Saisonverlauf & Trendprüfung

- Verlaufskompass für archivierte Highscore-Stände ergänzt.
- Führungswechsel und größte dokumentierte Rangverbesserung werden nur bei mindestens zwei vollständigen Archivständen berechnet.
- Spielerprofile um eine Verlaufsanalyse mit Rangbewegung, Punktezuwachs und bestem dokumentierten Rang erweitert.
- Fehlende Historiedaten werden transparent als nicht berechenbar ausgewiesen; es werden keine Trends simuliert.
- Flexible Unterstützung für archivierte Ranglisten unter `standings`, `overall` oder `players` ergänzt.
- Darstellung im bestehenden Holz-, Leder- und Messingdesign für Desktop, Tablet und Mobilgeräte ergänzt.
- Grundlayout, Raster, Kachelgrößen, zentrale JSON-Struktur und übrige Websitebereiche unverändert gelassen.

# Version 2.34 – Highscore Rangabstände & Positionsanalyse

- Spielerprofile um eine datenbasierte Positionsanalyse erweitert.
- Rangzone, Feldposition, Abstand zur Spitze, nächstes Angriffsziel und Absicherung werden aus dem aktuellen Gesamtstand berechnet.
- Punktgleiche Spieler werden transparent ausgewiesen; die offizielle Rangfolge des Exports bleibt maßgeblich.
- Bei noch fehlender sportlicher Wertung bleibt die Analyse bewusst inaktiv und simuliert keine Entwicklung.
- Darstellung im bestehenden Holz-, Leder- und Messingdesign für Desktop, Tablet und Mobilgeräte ergänzt.
- Grundlayout, Raster, Kachelgrößen, zentrale JSON-Struktur und übrige Websitebereiche unverändert gelassen.

# Version 2.33 – Highscore Spieler-Direktvergleich

- Spielerprofile um einen direkten Vergleich mit jedem anderen registrierten Spieler ergänzt.
- Vergleich von Gesamtrang, Gesamtpunkten, Bonuspunkten, Spieltagssiegen, aktuellem Spieltag und Spieltagsrang.
- Bessere Werte werden nachvollziehbar hervorgehoben; bei Rangwerten gilt der niedrigere Wert.
- Transparenter Nullstand-Hinweis, solange noch keine sportliche Wertung vorliegt.
- Vergleichsansicht vollständig im bestehenden Holz-, Leder- und Messingdesign umgesetzt.
- Desktop-, Tablet- und Mobilansicht ergänzt, ohne Grundlayout oder andere Websitebereiche zu verändern.

# Version 2.32 – Highscore Datenkompass & Spielerprofile

## Geändert
- Datenkompass für Quelle, Aktualität, Registerumfang und strukturelle Datenprüfung ergänzt.
- Exportalter wird automatisch bewertet; veraltete Datenstände werden sichtbar gekennzeichnet.
- Gesamt- und Spieltagslisten werden auf Dubletten, Namensabweichungen und ungültige Rangwerte geprüft.
- Spielernamen in Podium und Rangliste öffnen nun ein barrierearmes Detailprofil.
- Spielerprofile vergleichen bestätigte Gesamt-, Bonus- und Spieltagswerte, ohne fehlende Daten zu schätzen.
- Dialogdarstellung für Desktop, Tablet und Mobilgeräte im bestehenden Holz-, Leder- und Messingstil ergänzt.
- Grundlayout, Raster, Kachelgrößen und übrige Websitebereiche bleiben unverändert.

# Changelog

## Version 2.31 – Highscore Registerausgabe & Zustandsübernahme

- CSV-Export für die aktuell gewählte Gesamt- oder Spieltagswertung ergänzt.
- Export berücksichtigt aktive Suche und Sortierung, exportiert aber unabhängig von der sichtbaren Seitengröße alle Treffer.
- Druckansicht für eine reduzierte, klar lesbare Ranglistenausgabe ergänzt.
- Gewählte Ranglistenansicht, Sortierung und Seitengröße werden lokal im Browser gespeichert und beim nächsten Besuch wiederhergestellt.
- Exportdateien enthalten Saison, Ansicht und Datenstand aus der zentralen Highscore-Datendatei.
- Neue Bedienelemente vollständig im bestehenden Holz-, Leder- und Messingstil umgesetzt.
- Mobile Darstellung der Registerausgabe angepasst.
- Grundlayout, Raster, Kachelgrößen und alle übrigen Websitebereiche unverändert gelassen.

## Version 2.30 – Highscore Robustheit & Barrierefreiheit

- Sichtbaren Lade-, Erfolgs- und Fehlerstatus für die zentrale Highscore-Datendatei ergänzt.
- Direkte Wiederholungsfunktion eingebaut, falls `highscore.json` nicht geladen werden kann.
- Strukturprüfung für Gesamtwertung, Spieltagswertung, Teamwertung und Metadaten ergänzt.
- Fehlerzustände liefern jetzt eine verständliche Meldung statt einer leeren oder beschädigten Ansicht.
- Sprunglink zum Highscore-Inhalt und deutlichere Tastatur-Fokusmarkierungen ergänzt.
- Reiternavigation um Home-/Ende-Tasten erweitert.
- Sortierschalter mit präziseren zugänglichen Beschriftungen versehen.
- Unterstützung für reduzierte Bewegungen ergänzt.
- Mobile Darstellung der Systemmeldungen angepasst.
- Grundlayout, Raster, Kachelgrößen und alle übrigen Websitebereiche unverändert gelassen.

## Version 2.29 – Highscore Statistikregister & Detailhierarchie

- Kopfregister für Saison, Berechnungsgrundlage, Exportstand und aktive Statistikmodule ergänzt.
- Rekordkarten in einheitliche gravierte Registertafeln mit eindeutigen Zuständen „Aktiv“ und „Noch offen“ überführt.
- Piratenorden gestalterisch vereinheitlicht und ihre Zustände klarer in die Kartenhierarchie integriert.
- Lesbarkeit, Abstände und visuelle Gewichtung innerhalb der Rekord- und Ordenmodule verbessert.
- Historienzeilen um dezente, nicht aufdringliche Interaktionsrückmeldung ergänzt.
- Responsive Darstellung des neuen Statistikregisters für Tablet und Mobilgeräte ergänzt.
- Keine Bildassets, Cliparts, Emojis oder Standardicons hinzugefügt.
- Grundlayout, Raster, Kachelgrößen und alle übrigen Websitebereiche unverändert gelassen.

# Version 2.28 – Highscore Ranglisten-Kompass

- Kompakte Statusleiste für aktive Ansicht, Sortierung und Trefferzahl ergänzt.
- Zentrale Rücksetzfunktion für Suche, Sortierung, Seitengröße und Pagination eingebaut.
- Leerer Suchzustand als klar gestalteter Schiffsregister-Hinweis mit direkter Rücksetzung umgesetzt.
- Deaktivierte Seitennavigation visuell und funktional eindeutiger dargestellt.
- Fehlerhafte Statuslogik beim Orden „Aufholjäger“ korrigiert: Vorhandene Archivstände allein vergeben keinen Orden.
- Responsive Darstellung der neuen Bedienelemente für Tablet und Mobilgeräte ergänzt.
- Grundlayout, Raster, Kachelgrößen und alle übrigen Websitebereiche unverändert gelassen.

# Changelog

## Version 2.24 – Highscore-Podium im Piratendesign

- Highscore-Podium vollständig innerhalb der bestehenden Seitenstruktur überarbeitet.
- Freien Podiumsbereich mit einem dunklen Rangdeck aus Holz, Messingkanten, Seil-/Takelage-Details und gravierten Rangplaketten ausgestaltet.
- Keine neuen Bilddateien, Cliparts, Emojis oder Standardicons verwendet; alle Gestaltungselemente entstehen aus HTML und CSS.
- Karten der Plätze 1 bis 3 kontrastreicher und klarer hierarchisiert.
- Textbereich oberhalb der Sockel vergrößert; Platz 3 ist nun vollständig lesbar und wird nicht mehr vom Sockel überdeckt.
- Mobile Darstellung des Podiums auf eine einspaltige, vollständig lesbare Variante angepasst.
- Grundlayout, Raster, Seitenaufbau und übrige freigegebene Bereiche unverändert gelassen.

# Änderungsprotokoll

## Version 2.23 – Highscore 3.0

### Neu gestaltet
- Highscore-Seite vollständig an den bestehenden dunklen Piratenstil angeglichen.
- Top-3-Bereich als dreistufiges Holzpodium mit Messingkanten umgesetzt.
- Siegerpodest in der Mitte höher; Platz 2 links und Platz 3 rechts.
- Rekorde und Piratenorden als reine Messing-/Holztafeln gestaltet.

### Entfernt
- Sämtliche Clipart-, Emoji-, Medaillen- und generischen Symbol-Elemente auf der Highscore-Seite.
- Symbolmarken in den Hauptreitern.
- Bildhafte Orden-Icons.

### Unverändert
- Highscore-Datenstruktur und Kicktipp-Import.
- Einzelwertung, Spieltagswertung, Gruppierungen und Rekordlogik.
- Spielersuche sowie Seitennavigation mit 25, 50 oder 100 Einträgen.
- Bestehende Wettbewerbsseiten und das 3×3-Kachelraster.

### Geänderte Dateien
- `highscore.html`
- `highscore.css`
- `highscore.js`
- `VERSION.txt`
- `CHANGELOG.md`

## Version 2.25 – Highscore Professional

- Highscore-Navigation in dunkler Holz- und Messingoptik vereinheitlicht.
- Statistikfelder als eingelassene Schiffstafeln gestaltet.
- Rangliste optisch zu einem historischen Schiffsregister weiterentwickelt.
- Tabellenkopf, Tabellenzeilen, Rangdarstellung und Suchbereich hochwertiger gestaltet.
- Rekord-, Team- und Ordenkarten an die freigegebene Piratendesign-Sprache angepasst.
- Historienbereich und Seitennavigation gestalterisch vereinheitlicht.
- Vorhandenes Podium aus Version 2.24 vollständig beibehalten und in das Gesamtbild eingebunden.
- Keine Bildassets, Cliparts, Emojis oder Standardicons ergänzt.
- Grundlayout, Raster, Kachelgrößen und Seitenaufbau unverändert gelassen.
- Mobile Darstellung berücksichtigt.

## Version 2.26 – Highscore Datenlogik & Bedienung

- Vorläufige Saisonstände mit 0 Punkten werden nicht mehr irreführend als echte Plätze 1 bis 3 ausgegeben.
- Das Podium kennzeichnet eine noch unbesetzte Rangliste transparent als vorläufige alphabetische Reihenfolge.
- Geteilte Führungen werden im Podiumsbereich ausdrücklich ausgewiesen.
- Tabellenführer- und Rekordanzeigen zeigen vor Saisonbeginn korrekt „Noch offen“ statt eines zufälligen Spielernamens.
- Sortierbare Spalten für Rang, Spieler, Punkte, Bonuspunkte und Spieltagssiege ergänzt.
- Mobile Rangliste von einer horizontal scrollenden Tabelle auf vollständig lesbare Registerkarten umgestellt.
- Tastaturbedienung, Fokusdarstellung und ARIA-Zustände der Highscore-Reiter verbessert.
- Der gewählte Highscore-Bereich wird in der URL gespeichert und kann direkt verlinkt werden.
- Grundlayout, Kachelgrößen, Raster und alle übrigen Websitebereiche unverändert gelassen.

## Version 2.27 – Highscore Statistikmodule

- Teamseiten um ein datenbasiertes Mannschaftsduell mit Vorsprung/Rückstand und Vergleichsbalken ergänzt.
- Teamkennzahlen um klare Erläuterungen und belastbare Nullstand-Anzeigen erweitert.
- Neuer Statistikstatus zeigt transparent die Datenreife aller Highscore-Module.
- Rekordkarten unterscheiden nun sichtbar zwischen verfügbaren und noch offenen Bestwerten.
- Piratenorden besitzen eindeutige Zustände „Vergeben“ oder „Gesperrt“; fehlende Daten werden nicht geschätzt.
- Historie als Logbuch-Zeitleiste überarbeitet und um einen sachlichen Leerzustand ergänzt.
- Desktop- und Mobile-Darstellung der neuen Module angepasst.
- Grundlayout, Kachelraster und übrige Websitebereiche unverändert belassen.

## 2.38 – Wettbewerbs-Terminstatus und Datenqualität

- Einheitliche Statusplaketten für beendete, terminierte und noch nicht zeitgenau angesetzte Spiele ergänzt.
- Filter für alle, terminierte, offene und beendete Partien auf den zentralen Spielplänen ergänzt.
- Datenqualitätsprüfung für fehlende Teamreferenzen, Datumsangaben und Quellenstände ergänzt.
- Mobile Darstellung der neuen Filter und Statusinformationen angepasst.
- Grundlayout, Raster und Kachelgrößen unverändert gelassen.

## 2.42 – 2026-07-31

- Neues zentrales `datenregister.json` für gemeinsam genutzte Datenquellen.
- Neuer gemeinsamer Loader `datenregister.js` mit Rückfallpfaden.
- Wettbewerbsseiten, Saisonübersicht, Highscore und Startseiten-Highscore-Teaser an das Register angebunden.
- Dateipfade müssen künftig nicht mehr in mehreren JavaScript-Modulen parallel geändert werden.
- Grundlayout, Kachelgrößen, Abstände und freigegebene Inhalte unverändert belassen.

## 2.44 – 31.07.2026
- Gemeinsames Laufzeit-Datenmodell `datenmodell.js` eingeführt.
- Wettbewerbe, Spiele, Teams und Tippspieltage werden zentral geladen und normalisiert.
- Saisonübersicht und Wettbewerbsseiten verwenden dieselbe Wettbewerbsdefinition.
- Zentrale Statussummen je Wettbewerb vorbereitet.
- Sichere Rückfalllogik und bestehendes Layout beibehalten.

## 2.45 – 31.07.2026
- Zentrale Validierung in `datenmodell.js` ergänzt.
- Automatische Prüfung auf doppelte IDs, unbekannte Teamreferenzen, ungültige Datumsfelder, vertauschte Zeiträume und unvollständige Ergebnisse.
- Tippspieltag-Verweise auf nicht vorhandene Spiele werden erkannt.
- Wettbewerbsdefinitionen und leere Zuordnungen werden geprüft.
- Einheitlicher Konsistenzstatus auf allen Wettbewerbsseiten ergänzt.
- Detailanzeige begrenzt lange Fehlerlisten und bleibt mobil lesbar.
- Grundlayout, Raster, Kachelgrößen und freigegebene Bereiche unverändert belassen.

## Version 2.46 – 31.07.2026
- Zentralen Bereich „Datenpflege & Prüfprotokoll“ auf allen Wettbewerbsseiten ergänzt.
- Datenstände von `wettbewerbe.json`, `spieldaten.json`, `teams.json` und `tippspieltage.json` werden gemeinsam ausgewiesen.
- Strukturelles Prüfprotokoll kann als JSON-Datei heruntergeladen werden.
- Export enthält Datenmengen, Quellenstände sowie erkannte Fehler und Hinweise, verändert aber keine Website-Daten.
- Pflege- und Diagnosefunktionen verwenden das gemeinsame Datenmodell aus Version 2.44/2.45.
- Grundlayout, Raster, Kachelgrößen und freigegebene Inhalte unverändert belassen.

## Version 2.47 – Technischer Feinschliff

- Ressourcenhinweise für zentrale JavaScript- und JSON-Dateien ergänzt.
- Fokusdarstellung, Tastaturbedienung und Touch-Ziele weiter verbessert.
- Unterstützung reduzierter Bewegungen erweitert.
- Doppelte Initialisierung gemeinsamer Module defensiv verhindert.
- Keine Änderungen an Grundlayout, Kachelgrößen oder freigegebenen Inhalten.

## Version 2.48 – Gesamtprüfung & Release-Audit

- Reproduzierbares Prüfskript `scripts/release_audit.py` ergänzt.
- Lokale HTML- und JavaScript-Dateireferenzen werden auf fehlende Ziele geprüft.
- Sämtliche JSON-Dateien werden strukturell validiert.
- Pflichtdateien und Versionsstand werden kontrolliert.
- Maschinenlesbares Prüfergebnis `RELEASE-AUDIT.json` ergänzt.
- Grundlayout, Raster, Kachelgrößen und freigegebene Inhalte unverändert belassen.

## Version 2.49 – Finalisierung & Release-Vorbereitung

- Versionsstand und technische Release-Prüfung auf 2.49 aktualisiert.
- Reproduzierbares Release-Manifest `RELEASE-MANIFEST.json` ergänzt.
- SHA-256-Prüfsummen und Dateigrößen aller auslieferungsrelevanten Dateien dokumentiert.
- Audit kontrolliert zusätzlich das Vorhandensein des Release-Manifests.
- Grundlayout, Raster, Kachelgrößen, Navigation und freigegebene Inhalte unverändert belassen.

## Version 2.50 – Release Candidate – 31.07.2026

- Vollständigen Release Candidate auf Basis der geprüften Version 2.49 erstellt.
- Versionsstand in `VERSION.txt`, Audit und Release-Manifest auf 2.50 vereinheitlicht.
- Abschlussdokumentation `README-V50.md`, `RELEASE-CANDIDATE.md` und `FINAL-CHECKLIST.md` ergänzt.
- Pflichtdateien, lokale Referenzen und sämtliche JSON-Dateien erneut automatisiert geprüft.
- Release-Manifest mit SHA-256-Prüfsummen und Dateigrößen aller ausgelieferten Dateien neu erzeugt.
- Keine Änderungen an Grundlayout, Raster, Kachelgrößen, Navigation oder freigegebenen Inhalten vorgenommen.


## Version 3.0 FINAL
- Offizieller Final-Release auf Basis des Release Candidates 2.50.
## Version 3.0.2 – Daten- und Wartungsoptimierung – 31.07.2026

- Website-, Schema- und Datenversion im zentralen Datenregister vereinheitlicht.
- Diagnosezustand und Ladezeit zentraler Datenquellen im gemeinsamen Datenmodell ergänzt.
- Wartungspanel um Versionsanzeige, Registerstand und Rückfallstatus erweitert.
- Exportiertes Prüfprotokoll um Registry- und Quelldiagnosen erweitert.
- Loader gegen doppelte Initialisierung abgesichert und Reset-Funktion ergänzt.
- Layout, Raster, Kachelgrößen, Navigation und freigegebene Inhalte unverändert belassen.


## Version 3.1 – Administrations- und Wartungszentrum
- Neue lesende Kontrollseite `admin.html`.
- Live-Prüfung der registrierten Datenquellen mit Ladezeiten und Fehleranzeige.
- Systembericht als JSON exportierbar.
- Wartungspanel der Wettbewerbsseiten um direkten Administrationslink ergänzt.
- Datenregister auf Datenversion 4 aktualisiert.

## Version 3.3 – Benutzeroberfläche, Barrierefreiheit und Responsive Feinschliff – 31.07.2026

- Gemeinsame, tastaturfreundliche Fokusdarstellung für interaktive Elemente ergänzt.
- Fehlenden Seiten automatisch einen Sprunglink zum Hauptinhalt hinzugefügt.
- Breite Tabellen erhalten bei Bedarf einen fokussierbaren horizontalen Scrollbereich.
- Touch-Ziele und Formulare auf kleinen Bildschirmen verbessert.
- Unterstützung für reduzierte Bewegungen und erhöhten Kontrast erweitert.
- Externe Links mit neuem Tab werden defensiv mit `noopener` und `noreferrer` abgesichert.
- Grundlayout, Raster, Kachelgrößen, Navigation und freigegebene Inhalte unverändert belassen.

## Version 3.7.1 – Mobile Highscore-Korrektur
- Darstellungsfehler im Highscore-Teaser der Startseite auf Mobilgeräten behoben.
- Karteninhalte bleiben innerhalb ihrer Kacheln; Überschriften und Werte umbrechen kontrolliert.
- Abstände, Schriftgrößen und Innenränder für schmale Ansichten angepasst.
- Desktop-Layout und bestehende Kachelgrößen bleiben unverändert.

## Version 3.10 – Zentrale Teilnehmer- und Teamdaten – 31.07.2026
- Neue Pflegeoberfläche `team-teilnehmerpflege.html` für Mannschaften und Teilnehmer.
- Zentrale Teilnehmerdatei `teilnehmer.json` aus dem bestätigten Highscore-Bestand initialisiert.
- Eindeutige IDs, Aktivstatus, Teamzuordnung und lokale JSON-Exporte ergänzt.
- Doppelte IDs und Namen werden vor dem Export erkannt.
- Keine Änderungen an Grundlayout, Kachelgrößen oder öffentlicher Navigation.

## Version 3.14 – Bonusfragen und Sonderpunkte – 31.07.2026
- Neue zentrale Pflegeoberfläche `bonuspflege.html`.
- Neue Datenquellen `bonusfragen.json` und `bonusantworten.json`.
- Eindeutige Zuordnung über Bonusfrage- und Teilnehmer-IDs.
- Punkteberechnung berücksichtigt gewertete Bonusfragen zusätzlich zur 2/3/5-Spielwertung.
- Bonuspunkte werden getrennt in Rangliste und CSV ausgewiesen.
- Keine Änderung an öffentlichem Grundlayout, Raster oder Kachelgrößen.


## 3.15 – Zentrale Smugglerauftrag-Pflege
- 34 Dynamo-Spiele als stabile Smuggleraufträge zentral verknüpft.
- Pflege, Prüfung und Export von `smugglerauftraege.json` ergänzt.
- Automatische Fortschritts- und Statusfelder für die Startseitenkachel.

## Version 3.17 – Zentrale Teamwertung – 31.07.2026

- Neue Auswertungsseite `teamwertung.html`.
- Aggregiert die zentrale Einzelwertung anhand der Teamzuordnung in `teilnehmer.json`.
- Teamrangliste mit Punkten, Mitgliedern, Trefferstufen, gewerteten Tipps und Punkten je Mitglied.
- Mitgliederübersicht, Suche, Mindestteamgröße sowie JSON- und CSV-Export ergänzt.
- Neue zentrale Exportdatei `teampunkte.json`.
- Teilnehmer ohne Team bleiben vollständig in der Einzelwertung erhalten.
- Öffentliches Grundlayout, Raster und Kachelgrößen unverändert belassen.

## Version 3.24 – Erinnerungsprotokoll – 31.07.2026

- Neue Verwaltungsseite `erinnerungsprotokoll.html` ergänzt.
- Manuell versendete Abgabe-Erinnerungen können je Teilnehmer und Spiel dokumentiert werden.
- Bereits protokollierte und noch offene Erinnerungsfälle werden getrennt ausgewiesen.
- Versandkanal, Bearbeiter und Versandzeitpunkt werden nachvollziehbar gespeichert.
- Import einer bestehenden Protokolldatei sowie JSON- und CSV-Export ergänzt.
- Neue zentrale Datenquelle `erinnerungsprotokoll.json` registriert.
- Keine automatische Nachrichtenübermittlung und keine automatische Änderung des GitHub-Repositories.
- Öffentliches Grundlayout, Raster und bestehende Kachelgrößen unverändert belassen.


## Version 3.25 – Abgabezuverlässigkeit und Teilnehmerstatus – 31.07.2026

- Neue Verwaltungsseite `abgabezuverlaessigkeit.html` ergänzt.
- Abgelaufene und bestätigte Tippfristen werden je aktivem Teilnehmer mit vorhandenen Tipps abgeglichen.
- Abgabequote, fehlende Tipps, Erinnerungsanzahl und aktuelle vollständige Abgabeserie werden ausgewiesen.
- Organisatorische Statusstufen von „Sehr zuverlässig“ bis „Kritisch“ ergänzt.
- Spiele ohne bestätigte genaue Anstoßzeit bleiben von der Versäumnisbewertung ausgeschlossen.
- Detailansicht, Filter, Sortierung sowie JSON- und CSV-Export ergänzt.
- Neue zentrale Exportdatei `abgabezuverlaessigkeit.json` registriert.
- Keine Sanktionierung, kein automatischer Nachrichtenversand und keine automatische Änderung des GitHub-Repositories.
- Öffentliches Grundlayout, Raster und bestehende Kachelgrößen unverändert belassen.
## 4.0.7 – Repository-Bereinigung

- öffentliches GitHub-Paket auf tatsächlich benötigte Website-Dateien reduziert
- alte Update-Anleitungen, Release-Notizen, Löschlisten und lokale Python-Hilfsskripte entfernt
- keine Änderung an Layout, Datenlogik oder mobiler Darstellung
- ausführliche GitHub-Desktop-Anleitung ergänzt

## Version 4.1.4 – Bundesliga-Chronometer – 31.07.2026

- Countdown-Kachel ohne Änderung ihrer Abmessungen bereinigt.
- Sichtbare Emoji-Sanduhr durch ein CSS-basiertes Messingornament ersetzt.
- Missionshinweis mit neutralem Messingmarker statt Zeichen-Fallback umgesetzt.
- Statusplakette und Abschlusstext reagieren nach Erreichen des Saisonstarts automatisch.
- Countdown-Ziel bleibt der 28.08.2026 um 20:30 Uhr.
- Keine Bilderstellung, keine neuen Bilddateien und keine Änderungen am Grundraster.

## Version 4.1.6 – Hall of Fame: Europa League und Smuggleraufträge

- Europa League 2026/2027 als eigener Eintrag in der Hall of Fame ergänzt.
- Smuggleraufträge 2026/2027 als eigene Saisonwertung ergänzt.
- Beide Einträge werden aus `hall-of-fame.json` geladen und können dort später mit den bestätigten Siegern befüllt werden.
- Das Ehrenlogbuch `hall-of-fame.html` zeigt beide Kategorien ebenfalls an.
- Mobile Umbrüche und Kartenbreiten für die erweiterte Titelliste stabilisiert.
- Keine Bilddateien erstellt oder verändert.

## Version 4.2.0 – Startzentrale der Crew – 31.07.2026

- Startzentrale innerhalb der bestehenden Kachel vollständig neu aufgebaut.
- Bildbasierte Schaltflächen und unsichtbare Klickflächen durch echte, zugängliche HTML-Bedienelemente ersetzt.
- Angeschnittene Messingplakette am oberen linken Rand entfernt.
- Saisonstatus mit Saison, nächstem Smugglerauftrag und aktuellem Champion ergänzt.
- Zwei gleichwertig ausgerichtete Schaltflächen für Tipprunde und Wettbewerbe umgesetzt.
- Kompassrose und Clubsiegel ausschließlich mit CSS dezent in den Hintergrund integriert.
- Mobile Darstellung als stabile Einspaltenansicht umgesetzt.
- Kachelgröße, Grundraster und Navigation unverändert belassen.
- Keine Bilderstellung und keine neuen Bilddateien.

## Version 4.2.1 – Zentrale Saisoninformationen – 31.07.2026

- Saison und Bundesliga-Start der Startseite an `site-data.json` angebunden.
- Nächste Mission der Startzentrale an `smugglerauftraege.json` angebunden.
- Aktuellen Champion der Startzentrale an `hall-of-fame.json` angebunden.
- Mehrfach gepflegte sichtbare Angaben auf der Startseite reduziert.
- Fallback-Werte für den Fall eines Ladefehlers beibehalten.
- Keine sichtbare Layoutänderung, keine Bilderstellung und keine neuen Bilddateien.

## Version 4.3.1 – Zentrale Wettbewerbsübersicht – 31.07.2026

- Wettbewerbskacheln der Startseite an das zentrale Register `wettbewerbe.json` angebunden.
- Namen und Zielseiten der Wettbewerbe werden nicht mehr zusätzlich ausschließlich im HTML gepflegt.
- Statische HTML-Werte bleiben als sichere Rückfallanzeige erhalten, falls das Register nicht geladen werden kann.
- Reihenfolge, Symbole, Texte für Mitspieler, Kachelgrößen und mobile Darstellung unverändert belassen.
- Keine Bilderstellung und keine neuen Bilddateien.

## Version 4.3.2 – Bereinigung Startzentrale – 31.07.2026

- Verbliebenen Scheiben-/Kompassrest aus der Startzentrale vollständig entfernt.
- Pseudo-Elemente und Hintergrundgrafikreste der Willkommen-Kachel mit einer abschließenden, eindeutig priorisierten CSS-Regel deaktiviert.
- Inhalt, Statusfelder, Hauptbutton, Schnellzugriffe, Kachelgröße, Raster und mobile Darstellung unverändert belassen.
- Keine Bilderstellung und keine neuen Bilddateien.

## Version 4.3.4 – Deckende Startzentrale – 31.07.2026

- Tatsächliche Ursache des sichtbaren Diskus-/Linienmotivs behoben.
- Die Regel aus Version 4.3.2 hatte mit `background-image: none` versehentlich auch die eigenen deckenden Farbverläufe der Startzentrale entfernt.
- Dadurch wurde das großflächige Seitenhintergrundbild innerhalb der Kachel sichtbar; dessen Motiv wurde fälschlich für ein verbliebenes Kacheldekor gehalten.
- Startzentrale nun mit vollständig deckendem dunklem Holz-/Lederfarbverlauf versehen.
- Alte Pseudo-Elemente bleiben deaktiviert.
- Inhalt, Maße, Statusfelder, Hauptbutton sowie Desktop- und Mobilstruktur unverändert.
- Keine Bilderstellung und keine Bilddateien verändert.

## Version 4.4.7

### Geändert

- Pilot-Schmugglersiegel für 1. FC Nürnberg und SG Dynamo Dresden überarbeitet.
- Kürzel `FCN` und `SGD` deutlich vergrößert und in den Mittelpunkt gestellt.
- Vereinsfarben kontrastreicher als Emaille-Flächen umgesetzt.
- Kompass- und Ankermotive bewusst verkleinert, damit sie nicht mehr mit den Kürzeln konkurrieren.
- Bestehende Platzierung, Abstände sowie Desktop- und Mobil-Layout unverändert gelassen.

### Betroffene Dateien

- `assets/smugglers-design-system/schmugglersiegel/nuernberg.svg`
- `assets/smugglers-design-system/schmugglersiegel/dynamo-dresden.svg`
- `VERSION.txt`
- `CHANGELOG.md`
- `README.md`
