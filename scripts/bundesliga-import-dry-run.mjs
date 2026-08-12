import fs from "node:fs";

const SPIELDATEN_PATH = "spieldaten.json";
const API_URL = "https://api.openligadb.de/getmatchdata/bl1/2026";
const REPORT_PATH = "bundesliga-import-vorschau.json";

const TEAM_ALIASES = {
  "1. fc köln": "koeln",
  "1. fc union berlin": "union-berlin",
  "1. fsv mainz 05": "mainz-05",
  "mainz 05": "mainz-05",
  "bayer 04 leverkusen": "leverkusen",
  "bayer leverkusen": "leverkusen",
  "borussia dortmund": "dortmund",
  "borussia mönchengladbach": "moenchengladbach",
  "borussia monchengladbach": "moenchengladbach",
  "eintracht frankfurt": "frankfurt",
  "fc augsburg": "augsburg",
  "fc bayern münchen": "bayern-muenchen",
  "fc bayern munchen": "bayern-muenchen",
  "bayern münchen": "bayern-muenchen",
  "bayern munchen": "bayern-muenchen",
  "fc schalke 04": "schalke-04",
  "schalke 04": "schalke-04",
  "hamburger sv": "hamburger-sv",
  "rb leipzig": "rb-leipzig",
  "rasenballsport leipzig": "rb-leipzig",
  "sc paderborn 07": "paderborn",
  "sc paderborn": "paderborn",
  "sport-club freiburg": "freiburg",
  "sc freiburg": "freiburg",
  "sv elversberg": "elversberg",
  "sv 07 elversberg": "elversberg",
  "sv werder bremen": "werder-bremen",
  "werder bremen": "werder-bremen",
  "tsg hoffenheim": "hoffenheim",
  "tsg 1899 hoffenheim": "hoffenheim",
  "vfb stuttgart": "stuttgart"
};

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s+/g, " ");
}

function teamIdFromApi(team) {
  const name = normalize(team?.teamName ?? team?.TeamName);
  if (TEAM_ALIASES[name]) return TEAM_ALIASES[name];

  const compact = name
    .replace(/\b(1\.|fc|sc|sv|tsg|vfb|bayer|borussia|eintracht)\b/g, "")
    .replace(/[.\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const candidates = Object.entries(TEAM_ALIASES)
    .filter(([alias]) => {
      const aliasCompact = normalize(alias)
        .replace(/\b(1\.|fc|sc|sv|tsg|vfb|bayer|borussia|eintracht)\b/g, "")
        .replace(/[.\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return aliasCompact === compact;
    })
    .map(([, id]) => id);

  return [...new Set(candidates)].length === 1
    ? [...new Set(candidates)][0]
    : null;
}

function finalScore(match) {
  if (!match?.matchIsFinished) return null;

  const results = Array.isArray(match?.matchResults) ? match.matchResults : [];
  const final =
    results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) ||
    results.find(r => /end|final/i.test(String(r?.resultName ?? r?.resultTypeName ?? ""))) ||
    results.at(-1);

  if (!final) return null;

  const home = Number(final?.pointsTeam1 ?? final?.PointsTeam1);
  const away = Number(final?.pointsTeam2 ?? final?.PointsTeam2);

  return Number.isFinite(home) && Number.isFinite(away)
    ? { home, away }
    : null;
}

function localBundesligaMatches(data) {
  const seasons = Array.isArray(data?.saisons) ? data.saisons : [];
  return seasons
    .flatMap(season => Array.isArray(season?.spiele) ? season.spiele : [])
    .filter(match =>
      match?.wettbewerb === "bundesliga" &&
      match?.saison === "2026/2027"
    );
}

function fixtureKey(spieltag, homeId, awayId) {
  return `${Number(spieltag)}|${homeId}|${awayId}`;
}

if (!fs.existsSync(SPIELDATEN_PATH)) {
  throw new Error("spieldaten.json fehlt im Repository.");
}

const localData = JSON.parse(fs.readFileSync(SPIELDATEN_PATH, "utf8"));
const localMatches = localBundesligaMatches(localData);

const localIndex = new Map();
for (const match of localMatches) {
  const key = fixtureKey(
    match?.spieltagNummer,
    match?.heimTeamId,
    match?.auswaertsTeamId
  );
  if (localIndex.has(key)) {
    throw new Error(`Doppelter lokaler Bundesliga-Schlüssel: ${key}`);
  }
  localIndex.set(key, match);
}

const response = await fetch(API_URL, {
  headers: { Accept: "application/json" }
});

if (!response.ok) {
  throw new Error(`OpenLigaDB HTTP ${response.status}`);
}

const apiMatches = await response.json();

if (!Array.isArray(apiMatches) || apiMatches.length === 0) {
  throw new Error("OpenLigaDB lieferte keine Bundesliga-Spiele.");
}

const matchedLocalIds = new Set();
const unmatchedApi = [];
const proposedUpdates = [];
const conflicts = [];
const finishedApi = [];

for (const apiMatch of apiMatches) {
  const spieltag = Number(
    apiMatch?.group?.groupOrderID ??
    apiMatch?.group?.GroupOrderID
  );

  const homeId = teamIdFromApi(apiMatch?.team1);
  const awayId = teamIdFromApi(apiMatch?.team2);

  if (!spieltag || !homeId || !awayId) {
    unmatchedApi.push({
      matchID: apiMatch?.matchID ?? null,
      spieltag: spieltag || null,
      home: apiMatch?.team1?.teamName ?? null,
      away: apiMatch?.team2?.teamName ?? null,
      reason: !homeId || !awayId
        ? "Teamname nicht eindeutig zuordenbar"
        : "Spieltag fehlt"
    });
    continue;
  }

  const key = fixtureKey(spieltag, homeId, awayId);
  const local = localIndex.get(key);

  if (!local) {
    unmatchedApi.push({
      matchID: apiMatch?.matchID ?? null,
      spieltag,
      home: apiMatch?.team1?.teamName ?? null,
      away: apiMatch?.team2?.teamName ?? null,
      mappedHomeId: homeId,
      mappedAwayId: awayId,
      reason: "Keine passende lokale Paarung"
    });
    continue;
  }

  matchedLocalIds.add(local.id);

  const score = finalScore(apiMatch);
  if (!score) continue;

  finishedApi.push({
    matchID: apiMatch?.matchID ?? null,
    localId: local.id,
    spieltag,
    homeId,
    awayId,
    score: `${score.home}:${score.away}`
  });

  const localHasResult =
    Number.isFinite(local?.heimtore) &&
    Number.isFinite(local?.auswaertstore);

  if (!localHasResult) {
    proposedUpdates.push({
      localId: local.id,
      spieltag,
      homeId,
      awayId,
      heimtore: score.home,
      auswaertstore: score.away,
      neuerStatus: "beendet"
    });
    continue;
  }

  if (
    Number(local.heimtore) !== score.home ||
    Number(local.auswaertstore) !== score.away
  ) {
    conflicts.push({
      localId: local.id,
      spieltag,
      homeId,
      awayId,
      lokal: `${local.heimtore}:${local.auswaertstore}`,
      openLigaDB: `${score.home}:${score.away}`
    });
  }
}

const unmatchedLocal = localMatches
  .filter(match => !matchedLocalIds.has(match.id))
  .map(match => ({
    localId: match.id,
    spieltag: match.spieltagNummer,
    homeId: match.heimTeamId,
    awayId: match.auswaertsTeamId
  }));

const fixtureCoverageOk =
  apiMatches.length === 306 &&
  localMatches.length === 306 &&
  unmatchedApi.length === 0 &&
  unmatchedLocal.length === 0;

const report = {
  test: "Bundesliga Ergebnisimport – Dry Run",
  season: "2026/27",
  source: "OpenLigaDB bl1/2026",
  generatedAt: new Date().toISOString(),
  writesToSpieldaten: false,
  summary: {
    localBundesligaMatches: localMatches.length,
    apiMatches: apiMatches.length,
    matched: matchedLocalIds.size,
    unmatchedApi: unmatchedApi.length,
    unmatchedLocal: unmatchedLocal.length,
    finishedApi: finishedApi.length,
    proposedResultUpdates: proposedUpdates.length,
    resultConflicts: conflicts.length,
    fixtureCoverageOk
  },
  decision:
    conflicts.length > 0
      ? "KONFLIKT – keine automatische Übernahme zulässig"
      : fixtureCoverageOk
        ? "DRY-RUN BESTANDEN – Paarungen vollständig zugeordnet"
        : "PRÜFEN – Paarungszuordnung nicht vollständig",
  proposedUpdates,
  conflicts,
  unmatchedApi,
  unmatchedLocal,
  finishedApi
};

fs.writeFileSync(
  REPORT_PATH,
  JSON.stringify(report, null, 2) + "\n"
);

console.log(JSON.stringify(report.summary, null, 2));
console.log(report.decision);

if (conflicts.length > 0 || !fixtureCoverageOk) {
  process.exitCode = 1;
}
