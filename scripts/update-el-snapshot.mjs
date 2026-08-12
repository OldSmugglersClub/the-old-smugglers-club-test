import fs from "node:fs";

const SNAPSHOT_PATH = "europa-league-sportdaten.json";
const AVAILABLE_LEAGUES_URL = "https://api.openligadb.de/getavailableleagues";
const COMPETITION = "europa-league";
const TARGET_SEASON = "2026";
const mode = process.env.OSC_TEST_MODE || "live";
const now = new Date().toISOString();

function emptySnapshot() {
  return {
    competition: COMPETITION,
    season: "2026/27",
    source: "OpenLigaDB",
    leagueShortcut: null,
    leagueId: null,
    leagueName: null,
    lastSuccessfulCheck: null,
    lastChange: null,
    status: "empty",
    matches: []
  };
}

function readSnapshot() {
  return fs.existsSync(SNAPSHOT_PATH)
    ? JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"))
    : emptySnapshot();
}

function resultOf(match) {
  const results = Array.isArray(match?.matchResults) ? match.matchResults : [];
  const final =
    results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) ||
    results.find(r => /end|final/i.test(String(r?.resultName ?? r?.resultTypeName ?? ""))) ||
    results.at(-1);

  if (!final) return null;

  const home = Number(final?.pointsTeam1 ?? final?.PointsTeam1);
  const away = Number(final?.pointsTeam2 ?? final?.PointsTeam2);

  return Number.isFinite(home) && Number.isFinite(away)
    ? `${home}:${away}`
    : null;
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
    return {
      ok: false,
      type: "empty",
      reason: "Antwort leer – vorhandener Snapshot bleibt unverändert."
    };
  }

  const existing = Array.isArray(current?.matches) ? current.matches : [];

  if (existing.length && candidate.length < existing.length) {
    return {
      ok: false,
      type: "regression",
      reason: `Kandidat enthält weniger Spiele (${candidate.length}) als der gespeicherte Stand (${existing.length}).`
    };
  }

  const incoming = new Map(candidate.map(match => [matchKey(match), match]));

  for (const oldMatch of existing) {
    const oldResult = resultOf(oldMatch);
    if (!oldResult) continue;

    const freshMatch = incoming.get(matchKey(oldMatch));

    if (!freshMatch) {
      return {
        ok: false,
        type: "conflict",
        reason: `Bereits bestätigtes Spiel fehlt im Kandidaten: ${matchKey(oldMatch)}`
      };
    }

    const freshResult = resultOf(freshMatch);

    if (!freshResult) {
      return {
        ok: false,
        type: "conflict",
        reason: `Bereits bestätigtes Ergebnis verschwindet: ${matchKey(oldMatch)}`
      };
    }

    if (freshResult !== oldResult) {
      return {
        ok: false,
        type: "conflict",
        reason: `Ergebniskonflikt ${matchKey(oldMatch)}: gespeichert ${oldResult}, Kandidat ${freshResult}`
      };
    }
  }

  return { ok: true };
}

function isEuropaLeagueCandidate(league) {
  const season = String(league?.leagueSeason ?? "").trim();
  const name = String(league?.leagueName ?? "").trim().toLocaleLowerCase("de");
  const sport = String(league?.sport?.sportName ?? "").trim().toLocaleLowerCase("de");

  if (season !== TARGET_SEASON) return false;
  if (sport && sport !== "fußball" && sport !== "fussball") return false;
  if (!name.includes("europa league")) return false;
  if (name.includes("conference")) return false;

  return true;
}

async function discoverEuropaLeague() {
  const response = await fetch(AVAILABLE_LEAGUES_URL, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`OpenLigaDB Ligenliste HTTP ${response.status}`);
  }

  const leagues = await response.json();

  if (!Array.isArray(leagues)) {
    throw new Error("OpenLigaDB Ligenliste hat kein gültiges Array geliefert.");
  }

  const candidates = leagues.filter(isEuropaLeagueCandidate);

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length > 1) {
    const details = candidates
      .map(l => `${l.leagueName} [${l.leagueShortcut}/${l.leagueId}]`)
      .join(", ");
    throw new Error(`Mehrere Europa-League-Kandidaten für 2026 gefunden: ${details}`);
  }

  return candidates[0];
}

async function loadCandidate(current) {
  if (mode === "empty") {
    return { league: null, matches: [] };
  }

  if (mode === "conflict") {
    const copy = structuredClone(current.matches ?? []);
    const finished = copy.find(match => resultOf(match));

    if (!finished) {
      throw new Error("Konflikttest benötigt mindestens ein gespeichertes Endergebnis.");
    }

    const results = finished.matchResults || [];
    const final =
      results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) ||
      results.at(-1);

    final.pointsTeam1 = Number(final.pointsTeam1 ?? 0) + 1;

    return {
      league: {
        leagueId: current.leagueId,
        leagueShortcut: current.leagueShortcut,
        leagueName: current.leagueName,
        leagueSeason: TARGET_SEASON
      },
      matches: copy
    };
  }

  const league = await discoverEuropaLeague();

  if (!league) {
    console.log(
      "KEINE ÄNDERUNG [league-unavailable]: Für Saison 2026 ist aktuell keine eindeutig passende Europa-League-Liga in OpenLigaDB vorhanden."
    );
    return { league: null, matches: null };
  }

  const shortcut = encodeURIComponent(String(league.leagueShortcut));
  const apiUrl = `https://api.openligadb.de/getmatchdata/${shortcut}/${TARGET_SEASON}`;

  const response = await fetch(apiUrl, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`OpenLigaDB Europa League HTTP ${response.status}`);
  }

  return {
    league,
    matches: await response.json()
  };
}

const current = readSnapshot();

let loaded;
try {
  loaded = await loadCandidate(current);
} catch (error) {
  console.error(`ABBRUCH: ${error.message}`);
  process.exit(2);
}

/*
 * Keine passende Liga vorhanden:
 * Der bestehende Snapshot wird ausdrücklich nicht verändert.
 */
if (loaded.matches === null) {
  process.exit(0);
}

const validation = validateCandidate(current, loaded.matches);

if (!validation.ok) {
  console.log(`KEINE ÄNDERUNG [${validation.type}]: ${validation.reason}`);
  process.exit(0);
}

const changed =
  JSON.stringify(current.matches ?? []) !== JSON.stringify(loaded.matches);

if (!changed) {
  console.log("KEINE SPORTLICHE ÄNDERUNG – Snapshot bleibt unverändert.");
  process.exit(0);
}

const next = {
  ...current,
  competition: COMPETITION,
  season: "2026/27",
  source: "OpenLigaDB",
  leagueShortcut: loaded.league?.leagueShortcut ?? current.leagueShortcut ?? null,
  leagueId: loaded.league?.leagueId ?? current.leagueId ?? null,
  leagueName: loaded.league?.leagueName ?? current.leagueName ?? null,
  lastSuccessfulCheck: now,
  lastChange: changed ? now : current.lastChange,
  status: "valid",
  matches: loaded.matches
};

fs.writeFileSync(
  SNAPSHOT_PATH,
  JSON.stringify(next, null, 2) + "\n"
);

console.log(
  changed
    ? `SNAPSHOT AKTUALISIERT: ${loaded.matches.length} Spiele gespeichert.`
    : `KEINE SPORTLICHE ÄNDERUNG: ${loaded.matches.length} Spiele weiterhin gültig.`
);
