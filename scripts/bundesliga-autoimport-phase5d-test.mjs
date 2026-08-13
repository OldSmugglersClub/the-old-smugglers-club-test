import fs from "node:fs";
import {
  bundesligaMatches,
  applyConfirmedResult,
  finalizeBatch,
  readJson,
  writeJson
} from "./bundesliga-ergebnisimport-core.mjs";

const SOURCE = "spieldaten.json";
const WORK = "spieldaten.phase5d-test.json";
const REPORT = "phase5d-ergebnis.json";

function assert(c, m) {
  if (!c) throw new Error(`PHASE 5D FEHLGESCHLAGEN: ${m}`);
}

const originalText = fs.readFileSync(SOURCE, "utf8");
const original = JSON.parse(originalText);
const work = JSON.parse(originalText);

assert(bundesligaMatches(work).length === 306, "Bundesliga-Spielplan ist nicht 306 Spiele vollständig.");

const beforeVersion = Number(work.datenVersion || 0);
const sourceDate = "2026-08-28";

/*
 * Kontrollierte API-Testantwort für exakt den späteren Importpfad:
 * ein bestätigtes Endergebnis für das Freitagsspiel.
 */
const apiFixture = {
  localId: "bl-2026-27-01-001",
  matchIsFinished: true,
  home: 2,
  away: 1
};

assert(apiFixture.matchIsFinished === true, "API-Testfixture ist nicht beendet.");

let changed = 0;
changed += applyConfirmedResult(
  work,
  apiFixture.localId,
  apiFixture.home,
  apiFixture.away,
  sourceDate
);
finalizeBatch(work, changed, sourceDate);

assert(changed === 1, `Genau eine Änderung erwartet, erhalten ${changed}.`);
assert(Number(work.datenVersion) === beforeVersion + 1, "datenVersion wurde nicht exakt +1 erhöht.");
assert(work.aktualisiert === sourceDate, "aktualisiert wurde nicht korrekt gesetzt.");

writeJson(WORK, work);
const reread = readJson(WORK);
const saved = bundesligaMatches(reread).find(m => m.id === apiFixture.localId);

assert(saved?.heimtore === 2 && saved?.auswaertstore === 1, "2:1 wurde nicht gespeichert.");
assert(saved?.status === "beendet", "Status ist nicht beendet.");
assert(saved?.quelleStand === sourceDate, "quelleStand ist falsch.");

/* No-op: identisches bestätigtes Ergebnis darf keine zweite Versionserhöhung auslösen. */
const noop = applyConfirmedResult(reread, apiFixture.localId, 2, 1, sourceDate);
assert(noop === 0, "Identisches vorhandenes Ergebnis ist kein No-op.");

/* Konflikt: abweichendes Ergebnis muss hart scheitern und unverändert bleiben. */
const beforeConflict = JSON.stringify(saved);
let conflictCaught = false;
try {
  applyConfirmedResult(reread, apiFixture.localId, 3, 1, sourceDate);
} catch (e) {
  conflictCaught = /ERGEBNISKONFLIKT/.test(String(e.message));
}
assert(conflictCaught, "Abweichendes Ergebnis wurde nicht als Konflikt erkannt.");
assert(JSON.stringify(saved) === beforeConflict, "Konflikttest hat das Ergebnis verändert.");

assert(fs.readFileSync(SOURCE, "utf8") === originalText, "Echte spieldaten.json wurde verändert.");

const report = {
  phase: "5D",
  status: "BESTANDEN",
  codepfad: "gemeinsamer Import-Core",
  testdatei: WORK,
  geaendertesSpiel: apiFixture.localId,
  testergebnis: "2:1",
  datenVersionVorher: beforeVersion,
  datenVersionNachher: beforeVersion + 1,
  identischesErgebnisNoOp: true,
  konfliktTest: "BESTANDEN",
  echteSpieldatenUnveraendert: true
};

writeJson(REPORT, report);
console.log(JSON.stringify(report, null, 2));
console.log("PHASE 5D BESTANDEN: gemeinsamer Import-Codepfad erfolgreich.");
