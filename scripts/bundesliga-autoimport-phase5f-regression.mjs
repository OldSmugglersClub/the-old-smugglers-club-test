import fs from "node:fs";
import { spawnSync } from "node:child_process";

const SOURCE = "spieldaten.json";
const AUTO = "scripts/bundesliga-ergebnisimport-auto.mjs";
const WORK_NOAPI = "spieldaten.phase5f-noapi.json";
const WORK_NOOP = "spieldaten.phase5f-noop.json";
const FIXTURE = "phase5f-api-fixture.json";
const REPORT = "phase5f-ergebnis.json";

function assert(c, m) {
  if (!c) throw new Error(`PHASE 5F FEHLGESCHLAGEN: ${m}`);
}

function games(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(s => Array.isArray(s?.spiele) ? s.spiele : [])
    .filter(m => m?.wettbewerb === "bundesliga" && m?.saison === "2026/2027");
}

function run(env) {
  return spawnSync("node", [AUTO], {
    encoding: "utf8",
    env: { ...process.env, ...env }
  });
}

const originalText = fs.readFileSync(SOURCE, "utf8");
const original = JSON.parse(originalText);
assert(games(original).length === 306, "306 Bundesliga-Spiele erwartet.");

/* A: außerhalb des Fensters => kein API-Abruf, keine Änderung */
fs.writeFileSync(WORK_NOAPI, originalText, "utf8");
const a = run({
  OSC_SPIELDATEN_PATH: WORK_NOAPI,
  OSC_CHECK_AT: "2026-08-13T13:56:22.636Z",
  OSC_API_FIXTURE_PATH: "ABSICHTLICH-NICHT-VORHANDEN.json"
});
assert(a.status === 0, `No-API-Test Exit ${a.status}: ${a.stderr}`);
assert(a.stdout.includes("KEIN API-ABRUF"), "No-API-Meldung fehlt.");
assert(fs.readFileSync(WORK_NOAPI, "utf8") === originalText, "No-API-Testdatei wurde verändert.");

/* B: identisches bereits vorhandenes Ergebnis => No-op */
const base = JSON.parse(originalText);
const target = games(base).find(m => m.id === "bl-2026-27-01-001");
assert(target, "Testspiel fehlt.");
target.heimtore = 2;
target.auswaertstore = 1;
target.status = "beendet";
target.quelleStand = "2026-08-28";
fs.writeFileSync(WORK_NOOP, JSON.stringify(base, null, 2) + "\n", "utf8");

const teamNames = {
  "augsburg":"FC Augsburg","bayern-muenchen":"FC Bayern München",
  "dortmund":"Borussia Dortmund","elversberg":"SV 07 Elversberg",
  "frankfurt":"Eintracht Frankfurt","freiburg":"SC Freiburg",
  "hamburger-sv":"Hamburger SV","hoffenheim":"TSG Hoffenheim",
  "koeln":"1. FC Köln","leverkusen":"Bayer 04 Leverkusen",
  "mainz-05":"1. FSV Mainz 05","moenchengladbach":"Borussia Mönchengladbach",
  "paderborn":"SC Paderborn 07","rb-leipzig":"RB Leipzig",
  "schalke-04":"FC Schalke 04","stuttgart":"VfB Stuttgart",
  "union-berlin":"1. FC Union Berlin","werder-bremen":"SV Werder Bremen"
};

const fixture = games(original).map((m, i) => ({
  matchID: 910000 + i,
  matchIsFinished: m.id === "bl-2026-27-01-001",
  group: { groupOrderID: m.spieltagNummer },
  team1: { teamName: teamNames[m.heimTeamId] },
  team2: { teamName: teamNames[m.auswaertsTeamId] },
  matchResults: m.id === "bl-2026-27-01-001" ? [{
    resultTypeID: 2, resultName: "Endergebnis",
    pointsTeam1: 2, pointsTeam2: 1
  }] : []
}));
assert(fixture.every(m => m.team1.teamName && m.team2.teamName), "Fixture-Teamzuordnung unvollständig.");
fs.writeFileSync(FIXTURE, JSON.stringify(fixture, null, 2) + "\n", "utf8");

const beforeNoop = fs.readFileSync(WORK_NOOP, "utf8");
const b = run({
  OSC_SPIELDATEN_PATH: WORK_NOOP,
  OSC_CHECK_AT: "2026-08-28T22:31:00+02:00",
  OSC_API_FIXTURE_PATH: FIXTURE
});
assert(b.status === 0, `No-op-Test Exit ${b.status}: ${b.stderr}`);
assert(b.stdout.includes("bereits identisch gespeichert"), "No-op-Meldung fehlt.");
assert(fs.readFileSync(WORK_NOOP, "utf8") === beforeNoop, "No-op-Testdatei wurde verändert.");

/* C: echte Datei bytegenau unangetastet */
assert(fs.readFileSync(SOURCE, "utf8") === originalText, "Echte spieldaten.json wurde verändert.");

const report = {
  phase: "5F",
  status: "BESTANDEN",
  regression: {
    ausserhalbZeitfensterKeinApiAbruf: true,
    ausserhalbZeitfensterKeineAenderung: true,
    identischesErgebnisNoOp: true,
    identischesErgebnisKeineVersionserhoehung: true,
    echteSpieldatenUnveraendert: true
  }
};

fs.writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log("=== REGRESSION A: NO-API ===");
console.log(a.stdout.trim());
console.log("=== REGRESSION B: NO-OP ===");
console.log(b.stdout.trim());
console.log(JSON.stringify(report, null, 2));
console.log("PHASE 5F BESTANDEN: finale Regression erfolgreich.");
