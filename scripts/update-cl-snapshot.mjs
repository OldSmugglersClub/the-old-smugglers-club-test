import fs from "node:fs";

const SNAPSHOT_PATH = "champions-league-sportdaten.json";
const API_URL = "https://api.openligadb.de/getmatchdata/ucl/2026";
const COMPETITION = "champions-league";
const SHORTCUT = "ucl";
const mode = process.env.OSC_TEST_MODE || "live";
const now = new Date().toISOString();

function emptySnapshot() {
  return {
    competition: COMPETITION, season: "2026/27", source: "OpenLigaDB",
    leagueShortcut: SHORTCUT, lastSuccessfulCheck: null, lastChange: null,
    status: "empty", matches: []
  };
}
function readSnapshot() {
  return fs.existsSync(SNAPSHOT_PATH)
    ? JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"))
    : emptySnapshot();
}
function resultOf(match) {
  const results = Array.isArray(match?.matchResults) ? match.matchResults : [];
  const final = results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2)
    || results.find(r => /end|final/i.test(String(r?.resultName ?? r?.resultTypeName ?? "")))
    || results.at(-1);
  if (!final) return null;
  const h = Number(final?.pointsTeam1 ?? final?.PointsTeam1);
  const a = Number(final?.pointsTeam2 ?? final?.PointsTeam2);
  return Number.isFinite(h) && Number.isFinite(a) ? `${h}:${a}` : null;
}
function matchKey(match) {
  return String(match?.matchID ?? match?.matchId ??
    `${match?.team1?.teamName ?? "?"}|${match?.team2?.teamName ?? "?"}|${match?.matchDateTime ?? ""}`);
}
function validate(current, candidate) {
  if (!Array.isArray(candidate) || candidate.length === 0)
    return {ok:false,type:"empty",reason:"Antwort leer – Snapshot bleibt unverändert."};

  const existing = Array.isArray(current?.matches) ? current.matches : [];
  if (existing.length && candidate.length < existing.length)
    return {ok:false,type:"regression",reason:`Weniger Spiele: ${candidate.length} statt ${existing.length}.`};

  const incoming = new Map(candidate.map(m => [matchKey(m), m]));
  for (const old of existing) {
    const oldResult = resultOf(old);
    if (!oldResult) continue;
    const fresh = incoming.get(matchKey(old));
    if (!fresh) return {ok:false,type:"conflict",reason:`Bestätigtes Spiel fehlt: ${matchKey(old)}`};
    const freshResult = resultOf(fresh);
    if (!freshResult) return {ok:false,type:"conflict",reason:`Bestätigtes Ergebnis verschwindet: ${matchKey(old)}`};
    if (freshResult !== oldResult)
      return {ok:false,type:"conflict",reason:`Ergebniskonflikt ${matchKey(old)}: ${oldResult} -> ${freshResult}`};
  }
  return {ok:true};
}
async function candidate(current) {
  if (mode === "empty") return [];
  if (mode === "conflict") {
    const copy = structuredClone(current.matches ?? []);
    const finished = copy.find(m => resultOf(m));
    if (!finished) throw new Error("Konflikttest benötigt mindestens ein gespeichertes Endergebnis.");
    const results = finished.matchResults || [];
    const final = results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) || results.at(-1);
    final.pointsTeam1 = Number(final.pointsTeam1 ?? 0) + 1;
    return copy;
  }
  const response = await fetch(API_URL, {headers:{Accept:"application/json"}});
  if (!response.ok) throw new Error(`OpenLigaDB HTTP ${response.status}`);
  return await response.json();
}

const current = readSnapshot();
let fresh;
try { fresh = await candidate(current); }
catch (e) { console.error(`ABBRUCH: ${e.message}`); process.exit(2); }

const verdict = validate(current, fresh);
if (!verdict.ok) {
  console.log(`KEINE ÄNDERUNG [${verdict.type}]: ${verdict.reason}`);
  process.exit(0);
}

const changed = JSON.stringify(current.matches ?? []) !== JSON.stringify(fresh);

if (!changed) {
  console.log("KEINE SPORTLICHE ÄNDERUNG – Snapshot bleibt unverändert.");
  process.exit(0);
}
const next = {...current, competition:COMPETITION, season:"2026/27", source:"OpenLigaDB",
  leagueShortcut:SHORTCUT, lastSuccessfulCheck:now,
  lastChange:changed ? now : current.lastChange, status:"valid", matches:fresh};
fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(next,null,2)+"\n");
console.log(changed ? `SNAPSHOT AKTUALISIERT: ${fresh.length} Spiele.` : `KEINE SPORTLICHE ÄNDERUNG: ${fresh.length} Spiele.`);
