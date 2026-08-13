import fs from "node:fs";
import { spawnSync } from "node:child_process";

const SOURCE = "spieldaten.json";
const AUTO = "scripts/bundesliga-ergebnisimport-auto.mjs";
const WORK_NOAPI = "spieldaten.phase5f-hf1-noapi.json";
const WORK_CLOSED = "spieldaten.phase5f-hf1-geschlossen.json";
const REPORT = "phase5f-hf1-ergebnis.json";

function assert(c, m) {
  if (!c) throw new Error(`PHASE 5F-HF1 FEHLGESCHLAGEN: ${m}`);
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

/* A: außerhalb des Zeitfensters => kein API-Abruf, keine Änderung */
fs.writeFileSync(WORK_NOAPI, originalText, "utf8");

const a = run({
  OSC_SPIELDATEN_PATH: WORK_NOAPI,
  OSC_CHECK_AT: "2026-08-13T13:56:22.636Z",
  OSC_API_FIXTURE_PATH: "ABSICHTLICH-NICHT-VORHANDEN.json"
});

assert(a.status === 0, `No-API-Test Exit ${a.status}: ${a.stderr}`);
assert(a.stdout.includes("KEIN API-ABRUF"), "No-API-Meldung fehlt.");
assert(
  fs.readFileSync(WORK_NOAPI, "utf8") === originalText,
  "No-API-Testdatei wurde verändert."
);

/*
 * B: bereits vorhandenes Endergebnis:
 * Das Spiel darf nicht mehr als offen/relevant gelten.
 * Deshalb darf trotz simuliertem Zeitfenster KEIN API-Abruf erfolgen.
 */
const closed = JSON.parse(originalText);
const target = games(closed).find(m => m.id === "bl-2026-27-01-001");
assert(target, "Testspiel fehlt.");

target.heimtore = 2;
target.auswaertstore = 1;
target.status = "beendet";
target.quelleStand = "2026-08-28";

fs.writeFileSync(
  WORK_CLOSED,
  JSON.stringify(closed, null, 2) + "\n",
  "utf8"
);

const beforeClosed = fs.readFileSync(WORK_CLOSED, "utf8");

const b = run({
  OSC_SPIELDATEN_PATH: WORK_CLOSED,
  OSC_CHECK_AT: "2026-08-28T22:31:00+02:00",
  OSC_API_FIXTURE_PATH: "ABSICHTLICH-NICHT-VORHANDEN.json"
});

assert(
  b.status === 0,
  `Geschlossenes-Spiel-Test Exit ${b.status}: ${b.stderr}`
);

assert(
  b.stdout.includes("KEIN API-ABRUF"),
  "Bereits beendetes Spiel hat trotzdem einen API-Abruf ausgelöst."
);

assert(
  fs.readFileSync(WORK_CLOSED, "utf8") === beforeClosed,
  "Datei mit vorhandenem Endergebnis wurde verändert."
);

/* C: echte Datei bytegenau unangetastet */
assert(
  fs.readFileSync(SOURCE, "utf8") === originalText,
  "Echte spieldaten.json wurde verändert."
);

const report = {
  phase: "5F-HF1",
  status: "BESTANDEN",
  regression: {
    ausserhalbZeitfensterKeinApiAbruf: true,
    ausserhalbZeitfensterKeineAenderung: true,
    vorhandenesEndergebnisNichtErneutOffen: true,
    vorhandenesEndergebnisKeinApiAbruf: true,
    vorhandenesEndergebnisUnveraendert: true,
    echteSpieldatenUnveraendert: true
  }
};

fs.writeFileSync(
  REPORT,
  JSON.stringify(report, null, 2) + "\n",
  "utf8"
);

console.log("=== REGRESSION A: AUSSERHALB ZEITFENSTER ===");
console.log(a.stdout.trim());
console.log("=== REGRESSION B: BEREITS BEENDETES SPIEL ===");
console.log(b.stdout.trim());
console.log(JSON.stringify(report, null, 2));
console.log("PHASE 5F-HF1 BESTANDEN: korrigierte finale Regression erfolgreich.");
