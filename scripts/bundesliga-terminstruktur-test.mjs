import fs from "node:fs";

const SOURCE = "spieldaten.json";

function assert(condition, message) {
  if (!condition) throw new Error(`TERMINTEST FEHLGESCHLAGEN: ${message}`);
}

function bundesligaMatches(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(s => Array.isArray(s?.spiele) ? s.spiele : [])
    .filter(m => m?.wettbewerb === "bundesliga" && m?.saison === "2026/2027");
}

function candidateFields(match) {
  return Object.entries(match).filter(([key, value]) =>
    /datum|date|zeit|time|anstoß|anstoss|kickoff|beginn/i.test(key) &&
    value !== null && value !== ""
  );
}

if (!fs.existsSync(SOURCE)) throw new Error("spieldaten.json fehlt.");

const originalText = fs.readFileSync(SOURCE, "utf8");
const data = JSON.parse(originalText);
const matches = bundesligaMatches(data);

assert(matches.length === 306, `306 Bundesliga-Spiele erwartet, gefunden: ${matches.length}`);

const fieldUsage = new Map();
let withCandidates = 0;
const missing = [];
const samples = [];

for (const match of matches) {
  const candidates = candidateFields(match);

  if (candidates.length) {
    withCandidates++;
    for (const [key] of candidates) {
      fieldUsage.set(key, (fieldUsage.get(key) || 0) + 1);
    }
  } else {
    missing.push(match.id ?? "(ohne id)");
  }

  if (samples.length < 12) {
    samples.push({
      id: match.id ?? null,
      spieltagNummer: match.spieltagNummer ?? null,
      terminfelder: Object.fromEntries(candidates)
    });
  }
}

console.log(JSON.stringify({
  bundesligaMatches: matches.length,
  spieleMitTerminKandidaten: withCandidates,
  spieleOhneTerminKandidaten: missing.length,
  erkannteTerminfelder: Object.fromEntries([...fieldUsage.entries()].sort()),
  beispiele: samples
}, null, 2));

assert(
  fs.readFileSync(SOURCE, "utf8") === originalText,
  "spieldaten.json wurde verändert."
);

console.log("READ-ONLY-SCHUTZ BESTANDEN: spieldaten.json unverändert.");

if (missing.length) {
  console.log(`PRÜFHINWEIS: ${missing.length} Spiele besitzen aktuell kein erkennbares Datums-/Zeitfeld.`);
  console.log("Das ist kein Schreibfehler. Vor der Zeitautomatik muss geklärt werden, wie offene Termine repräsentiert werden.");
} else {
  console.log("TERMINFELD-CHECK: Alle 306 Spiele besitzen mindestens ein erkennbares Datums-/Zeitfeld.");
}
