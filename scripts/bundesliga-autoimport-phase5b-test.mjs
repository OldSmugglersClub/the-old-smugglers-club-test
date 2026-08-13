import fs from "node:fs";

const SOURCE = "spieldaten.json";
const API_URL = "https://api.openligadb.de/getmatchdata/bl1/2026";
const CHECK_AT = process.env.OSC_CHECK_AT || "2026-08-28T22:31:00+02:00";
const MIN_AFTER_KICKOFF = 120;
const MAX_AFTER_KICKOFF = 1440;

function assert(c, m) {
  if (!c) throw new Error(`PHASE 5B FEHLGESCHLAGEN: ${m}`);
}
function games(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(s => Array.isArray(s?.spiele) ? s.spiele : [])
    .filter(m => m?.wettbewerb === "bundesliga" && m?.saison === "2026/2027");
}
function hasResult(m) {
  return Number.isInteger(m?.heimtore) && Number.isInteger(m?.auswaertstore);
}
function kickoffUtc(m) {
  if (!m?.datum || !m?.anstoss || m?.terminBestaetigt !== true) return null;
  const naive = new Date(`${m.datum}T${m.anstoss}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", second:"2-digit",
    hourCycle:"h23"
  }).formatToParts(naive);
  const v = Object.fromEntries(parts.map(p => [p.type,p.value]));
  const rendered = Date.UTC(+v.year,+v.month-1,+v.day,+v.hour,+v.minute,+v.second);
  return new Date(naive.getTime() - (rendered - naive.getTime()));
}
function relevant(list, now) {
  return list.filter(m => {
    if (hasResult(m)) return false;
    const ko = kickoffUtc(m);
    if (!ko) return false;
    const mins = (now - ko) / 60000;
    return mins >= MIN_AFTER_KICKOFF && mins <= MAX_AFTER_KICKOFF;
  }).map(m => ({
    id:m.id, spieltagNummer:m.spieltagNummer, datum:m.datum, anstoss:m.anstoss
  }));
}

assert(fs.existsSync(SOURCE), "spieldaten.json fehlt.");
const original = fs.readFileSync(SOURCE,"utf8");
const data = JSON.parse(original);
const list = games(data);
assert(list.length === 306, `306 Bundesliga-Spiele erwartet, gefunden ${list.length}.`);

const now = new Date(CHECK_AT);
assert(!Number.isNaN(now.getTime()), `Ungültiger Prüfzeitpunkt: ${CHECK_AT}`);
const eligible = relevant(list, now);

console.log(JSON.stringify({
  pruefzeitpunktUtc: now.toISOString(),
  relevanteOffeneSpiele: eligible.length,
  ausloesendeSpiele: eligible
}, null, 2));

assert(eligible.length === 1, `Für diesen Test genau 1 relevantes Spiel erwartet, gefunden ${eligible.length}.`);
assert(eligible[0].id === "bl-2026-27-01-001",
  `Erwartet bl-2026-27-01-001, erkannt ${eligible[0].id}.`);

console.log("ZEITFENSTER BESTANDEN: Genau das Freitagsspiel löst den API-Test aus.");

let response;
try {
  response = await fetch(API_URL, {headers:{Accept:"application/json"}});
} catch (e) {
  throw new Error(`OpenLigaDB nicht erreichbar: ${e.message}`);
}
assert(response.ok, `OpenLigaDB HTTP ${response.status}.`);
const api = await response.json();
assert(Array.isArray(api), "OpenLigaDB-Antwort ist kein Array.");

const finished = api.filter(m => m?.matchIsFinished === true);
console.log(JSON.stringify({
  openLigaDbAntwortSpiele: api.length,
  davonAlsFinishedMarkiert: finished.length
}, null, 2));

/*
 * Phase 5B ist absichtlich READ-ONLY:
 * Die Live-Antwort wird geprüft, aber niemals in spieldaten.json geschrieben.
 */
assert(fs.readFileSync(SOURCE,"utf8") === original,
  "spieldaten.json wurde verändert.");

console.log("OPENLIGADB-ABRUF BESTANDEN: Live-Antwort empfangen.");
console.log("READ-ONLY-SCHUTZ BESTANDEN: echte spieldaten.json bytegenau unverändert.");
