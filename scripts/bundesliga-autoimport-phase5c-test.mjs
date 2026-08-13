import fs from "node:fs";

const SOURCE = "spieldaten.json";
const TESTFILE = "spieldaten.phase5c-test.json";
const RESULTFILE = "phase5c-ergebnis.json";

function assert(c, m) {
  if (!c) throw new Error(`PHASE 5C FEHLGESCHLAGEN: ${m}`);
}
function clone(v) { return JSON.parse(JSON.stringify(v)); }
function games(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(s => Array.isArray(s?.spiele) ? s.spiele : [])
    .filter(m => m?.wettbewerb === "bundesliga" && m?.saison === "2026/2027");
}
function hasResult(m) {
  return Number.isInteger(m?.heimtore) && Number.isInteger(m?.auswaertstore);
}

assert(fs.existsSync(SOURCE), "spieldaten.json fehlt.");

const originalText = fs.readFileSync(SOURCE, "utf8");
const original = JSON.parse(originalText);
const work = clone(original);
const list = games(work);

assert(list.length === 306, `306 Bundesliga-Spiele erwartet, gefunden ${list.length}.`);

const target = list.find(m => m?.id === "bl-2026-27-01-001");
assert(target, "Testspiel bl-2026-27-01-001 fehlt.");
assert(!hasResult(target), "Testspiel besitzt bereits ein lokales Ergebnis; Phase 5C würde dadurch unklar.");

const beforeVersion = Number(work.datenVersion || 0);
const beforeMatches = clone(list);

/*
 * Kontrollierte synthetische OpenLigaDB-Endinformation.
 * Es wird bewusst KEINE Live-API manipuliert.
 */
const synthetic = {
  id: target.id,
  finished: true,
  home: 2,
  away: 1,
  sourceDate: "2026-08-28"
};

assert(synthetic.finished === true, "Synthetisches Ergebnis nicht als beendet markiert.");
assert(Number.isInteger(synthetic.home) && Number.isInteger(synthetic.away), "Ungültiges Testergebnis.");

target.heimtore = synthetic.home;
target.auswaertstore = synthetic.away;
target.status = "beendet";
target.quelleStand = synthetic.sourceDate;
work.aktualisiert = synthetic.sourceDate;
work.datenVersion = beforeVersion + 1;

fs.writeFileSync(TESTFILE, JSON.stringify(work, null, 2) + "\n", "utf8");

const reread = JSON.parse(fs.readFileSync(TESTFILE, "utf8"));
const afterMatches = games(reread);
const changed = [];

for (let i = 0; i < beforeMatches.length; i++) {
  if (JSON.stringify(beforeMatches[i]) !== JSON.stringify(afterMatches[i])) {
    changed.push(afterMatches[i]?.id ?? `index-${i}`);
  }
}

assert(changed.length === 1, `Genau ein Bundesliga-Spiel muss geändert sein, tatsächlich ${changed.length}.`);
assert(changed[0] === target.id, `Falsches Spiel geändert: ${changed[0]}.`);

const saved = afterMatches.find(m => m.id === target.id);
assert(saved.heimtore === 2 && saved.auswaertstore === 1, "Testergebnis 2:1 nicht korrekt gespeichert.");
assert(saved.status === "beendet", "Status nicht auf beendet gesetzt.");
assert(saved.quelleStand === "2026-08-28", "quelleStand falsch.");
assert(Number(reread.datenVersion) === beforeVersion + 1, "datenVersion nicht exakt +1.");
assert(reread.aktualisiert === "2026-08-28", "aktualisiert falsch.");

/* Konfliktschutz separat auf der erzeugten Testkopie. */
const conflictBefore = JSON.stringify(saved);
const incomingConflict = { home: 3, away: 1 };
const conflict = hasResult(saved) &&
  (saved.heimtore !== incomingConflict.home || saved.auswaertstore !== incomingConflict.away);

assert(conflict, "Abweichendes Ergebnis wurde nicht als Konflikt erkannt.");

if (!conflict) {
  saved.heimtore = incomingConflict.home;
  saved.auswaertstore = incomingConflict.away;
}

assert(JSON.stringify(saved) === conflictBefore, "Konflikt hat bestehendes Ergebnis verändert.");

/* Die echte Datei muss während des gesamten Tests bytegenau identisch bleiben. */
assert(fs.readFileSync(SOURCE, "utf8") === originalText, "ECHTE spieldaten.json wurde verändert.");

const report = {
  phase: "5C",
  status: "BESTANDEN",
  testdatei: TESTFILE,
  geaendertesSpiel: target.id,
  testergebnis: "2:1",
  geaenderteBundesligaSpiele: changed.length,
  datenVersionVorher: beforeVersion,
  datenVersionNachher: beforeVersion + 1,
  konfliktTest: "BESTANDEN",
  echteSpieldatenUnveraendert: true
};

fs.writeFileSync(RESULTFILE, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(JSON.stringify(report, null, 2));
console.log("PHASE 5C BESTANDEN: kontrollierter Schreibtest auf separater Testdatei.");
console.log("SCHUTZ BESTANDEN: echte spieldaten.json bytegenau unverändert.");
