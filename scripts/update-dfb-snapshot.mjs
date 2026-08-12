import fs from "node:fs";

const SNAPSHOT_PATH = "dfb-pokal-sportdaten.json";
const API_URL = "https://api.openligadb.de/getmatchdata/dfb/2026";
const mode = process.env.OSC_TEST_MODE || "live";
const now = new Date().toISOString();

function readSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    return {
      competition: "dfb-pokal",
      season: "2026/27",
      source: "OpenLigaDB",
      leagueShortcut: "dfb",
      lastSuccessfulCheck: null,
      lastChange: null,
      status: "empty",
      matches: []
    };
  }
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
}

function resultOf(match) {
  const results = Array.isArray(match?.matchResults) ? match.matchResults : [];
  const final =
    results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) ||
    results.find(r => {
      const name = String(r?.resultName ?? r?.resultTypeName ?? "").toLowerCase();
      return name.includes("end") || name.includes("final");
    }) ||
    results.at(-1);

  if (!final) return null;
  const home = Number(final?.pointsTeam1 ?? final?.PointsTeam1);
  const away = Number(final?.pointsTeam2 ?? final?.PointsTeam2);
  return Number.isFinite(home) && Number.isFinite(away) ? `${home}:${away}` : null;
}

function matchKey(match) {
  return String(
    match?.matchID ??
    match?.matchId ??
    `${match?.team1?.teamName ?? "?"}|${match?.team2?.teamName ?? "?"}|${match?.matchDateTime ?? ""}`
  );
}

function validateCandidate(current, candidate) {
  if (!Array.isArray(candidate) || candidate.length === 0) {
    return { ok: false, type: "empty", reason: "Antwort leer – vorhandener Snapshot bleibt unverändert." };
  }

  const existing = Array.isArray(current?.matches) ? current.matches : [];

  if (existing.length && candidate.length < existing.length) {
    return {
      ok: false,
      type: "regression",
      reason: `Kandidat enthält weniger Spiele (${candidate.length}) als der gespeicherte Stand (${existing.length}).`
    };
  }

  const candidateByKey = new Map(candidate.map(match => [matchKey(match), match]));

  for (const oldMatch of existing) {
    const key = matchKey(oldMatch);
    const oldResult = resultOf(oldMatch);
    if (!oldResult) continue;

    const newMatch = candidateByKey.get(key);
    if (!newMatch) {
      return { ok: false, type: "conflict", reason: `Bereits bestätigtes Spiel fehlt im Kandidaten: ${key}` };
    }

    const newResult = resultOf(newMatch);
    if (!newResult) {
      return { ok: false, type: "conflict", reason: `Bereits bestätigtes Ergebnis verschwindet: ${key}` };
    }

    if (newResult !== oldResult) {
      return {
        ok: false,
        type: "conflict",
        reason: `Ergebniskonflikt bei ${key}: gespeichert ${oldResult}, Kandidat ${newResult}.`
      };
    }
  }

  return { ok: true };
}

async function loadCandidate(current) {
  if (mode === "empty") return [];

  if (mode === "conflict") {
    const existing = Array.isArray(current?.matches) ? structuredClone(current.matches) : [];
    const finished = existing.find(match => resultOf(match));
    if (!finished) {
      throw new Error("Konflikttest benötigt mindestens ein bereits gespeichertes Endergebnis.");
    }

    const results = finished.matchResults || [];
    const final =
      results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) ||
      results.at(-1);

    final.pointsTeam1 = Number(final.pointsTeam1 ?? 0) + 1;
    return existing;
  }

  const response = await fetch(API_URL, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`OpenLigaDB HTTP ${response.status}`);
  }

  return await response.json();
}

const current = readSnapshot();

let candidate;
try {
  candidate = await loadCandidate(current);
} catch (error) {
  console.error(`ABBRUCH: ${error.message}`);
  process.exit(2);
}

const validation = validateCandidate(current, candidate);

if (!validation.ok) {
  console.log(`KEINE ÄNDERUNG [${validation.type}]: ${validation.reason}`);
  process.exit(0);
}

const currentJson = JSON.stringify(current.matches ?? []);
const candidateJson = JSON.stringify(candidate);
const changed = currentJson !== candidateJson;

if (!changed) {
  console.log("KEINE SPORTLICHE ÄNDERUNG – Snapshot bleibt unverändert.");
  process.exit(0);
}

const next = {
  ...current,
  competition: "dfb-pokal",
  season: "2026/27",
  source: "OpenLigaDB",
  leagueShortcut: "dfb",
  lastSuccessfulCheck: now,
  lastChange: changed ? now : current.lastChange,
  status: "valid",
  matches: candidate
};

fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(next, null, 2) + "\n");

console.log(
  changed
    ? `SNAPSHOT AKTUALISIERT: ${candidate.length} Spiele gespeichert.`
    : `KEINE SPORTLICHE ÄNDERUNG: ${candidate.length} Spiele weiterhin gültig.`
);
