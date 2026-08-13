import fs from "node:fs";

const SPIELDATEN_PATH = "spieldaten.json";
const API_URL = "https://api.openligadb.de/getmatchdata/bl1/2026";

const MIN_AFTER_KICKOFF = 120;
const MAX_AFTER_KICKOFF = 24 * 60;

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
  return TEAM_ALIASES[name] ?? null;
}

function localBundesligaMatches(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(season => Array.isArray(season?.spiele) ? season.spiele : [])
    .filter(match =>
      match?.wettbewerb === "bundesliga" &&
      match?.saison === "2026/2027"
    );
}

function hasLocalResult(match) {
  return Number.isInteger(match?.heimtore) &&
         Number.isInteger(match?.auswaertstore);
}

function kickoffUtc(match) {
  if (!match?.datum || !match?.anstoss || match?.terminBestaetigt !== true) {
    return null;
  }

  const raw = `${match.datum}T${match.anstoss}:00`;
  const naive = new Date(raw + "Z");
  if (Number.isNaN(naive.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(naive);

  const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const renderedAsUtc = Date.UTC(
    +values.year,
    +values.month - 1,
    +values.day,
    +values.hour,
    +values.minute,
    +values.second
  );
  const offset = renderedAsUtc - naive.getTime();

  return new Date(naive.getTime() - offset);
}

function relevantOpenMatches(matches, now) {
  const eligible = [];

  for (const match of matches) {
    if (hasLocalResult(match)) continue;

    const kickoff = kickoffUtc(match);
    if (!kickoff) continue;

    const minutes = (now.getTime() - kickoff.getTime()) / 60000;

    if (
      minutes >= MIN_AFTER_KICKOFF &&
      minutes <= MAX_AFTER_KICKOFF
    ) {
      eligible.push({
        id: match.id,
        spieltagNummer: match.spieltagNummer,
        datum: match.datum,
        anstoss: match.anstoss,
        minutenSeitAnstoss: Math.floor(minutes)
      });
    }
  }

  return eligible;
}

function finalScore(match) {
  if (match?.matchIsFinished !== true) return null;

  const results = Array.isArray(match?.matchResults) ? match.matchResults : [];
  const final =
    results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) ||
    results.find(r =>
      /end|final/i.test(String(r?.resultName ?? r?.resultTypeName ?? ""))
    ) ||
    results.at(-1);

  if (!final) return null;

  const home = Number(final?.pointsTeam1 ?? final?.PointsTeam1);
  const away = Number(final?.pointsTeam2 ?? final?.PointsTeam2);

  return Number.isInteger(home) && home >= 0 &&
         Number.isInteger(away) && away >= 0
    ? { home, away }
    : null;
}

function fixtureKey(spieltag, homeId, awayId) {
  return `${Number(spieltag)}|${homeId}|${awayId}`;
}

function buildLocalIndex(localMatches) {
  const index = new Map();

  for (const match of localMatches) {
    const key = fixtureKey(
      match?.spieltagNummer,
      match?.heimTeamId,
      match?.auswaertsTeamId
    );

    if (index.has(key)) {
      throw new Error(`Doppelter lokaler Bundesliga-Schlüssel: ${key}`);
    }

    index.set(key, match);
  }

  return index;
}

function validateAndPlan(data, apiMatches) {
  const localMatches = localBundesligaMatches(data);

  if (localMatches.length !== 306) {
    throw new Error(
      `Lokaler Bundesliga-Spielplan unvollständig: ${localMatches.length}/306.`
    );
  }

  if (!Array.isArray(apiMatches) || apiMatches.length !== 306) {
    throw new Error(
      `OpenLigaDB-Spielplan unvollständig/unerwartet: ${
        Array.isArray(apiMatches) ? apiMatches.length : "kein Array"
      }/306.`
    );
  }

  const localIndex = buildLocalIndex(localMatches);
  const matchedLocalIds = new Set();
  const mappingErrors = [];
  const conflicts = [];
  const updates = [];

  for (const apiMatch of apiMatches) {
    const spieltag = Number(
      apiMatch?.group?.groupOrderID ??
      apiMatch?.group?.GroupOrderID
    );

    const homeId = teamIdFromApi(apiMatch?.team1);
    const awayId = teamIdFromApi(apiMatch?.team2);

    if (!spieltag || !homeId || !awayId) {
      mappingErrors.push({
        matchID: apiMatch?.matchID ?? null,
        spieltag: spieltag || null,
        home: apiMatch?.team1?.teamName ?? null,
        away: apiMatch?.team2?.teamName ?? null
      });
      continue;
    }

    const local = localIndex.get(
      fixtureKey(spieltag, homeId, awayId)
    );

    if (!local) {
      mappingErrors.push({
        matchID: apiMatch?.matchID ?? null,
        spieltag,
        homeId,
        awayId,
        reason: "Keine passende lokale Paarung"
      });
      continue;
    }

    matchedLocalIds.add(local.id);

    const score = finalScore(apiMatch);
    if (!score) continue;

    if (hasLocalResult(local)) {
      if (
        local.heimtore !== score.home ||
        local.auswaertstore !== score.away
      ) {
        conflicts.push({
          localId: local.id,
          lokal: `${local.heimtore}:${local.auswaertstore}`,
          openLigaDB: `${score.home}:${score.away}`
        });
      }
      continue;
    }

    updates.push({
      local,
      home: score.home,
      away: score.away
    });
  }

  const unmatchedLocal = localMatches.filter(
    match => !matchedLocalIds.has(match.id)
  );

  if (mappingErrors.length || unmatchedLocal.length) {
    throw new Error(
      `Paarungszuordnung unvollständig: API-Fehler ${mappingErrors.length}, lokal offen ${unmatchedLocal.length}. Keine Änderung.`
    );
  }

  if (conflicts.length) {
    const first = conflicts[0];
    throw new Error(
      `ERGEBNISKONFLIKT: ${first.localId} lokal ${first.lokal}, OpenLigaDB ${first.openLigaDB}. Keine Änderung.`
    );
  }

  return {
    localMatches: localMatches.length,
    apiMatches: apiMatches.length,
    matched: matchedLocalIds.size,
    updates
  };
}

function berlinDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function applyUpdates(data, plan, today) {
  if (!plan.updates.length) return 0;

  for (const item of plan.updates) {
    item.local.heimtore = item.home;
    item.local.auswaertstore = item.away;
    item.local.status = "beendet";
    item.local.quelleStand = today;
  }

  data.aktualisiert = today;
  data.datenVersion = Number(data.datenVersion || 0) + 1;

  return plan.updates.length;
}

if (!fs.existsSync(SPIELDATEN_PATH)) {
  throw new Error("spieldaten.json fehlt.");
}

const originalText = fs.readFileSync(SPIELDATEN_PATH, "utf8");
const data = JSON.parse(originalText);
const localMatches = localBundesligaMatches(data);

if (localMatches.length !== 306) {
  throw new Error(
    `Lokaler Bundesliga-Spielplan unvollständig: ${localMatches.length}/306.`
  );
}

const now = new Date();
const eligible = relevantOpenMatches(localMatches, now);

console.log(JSON.stringify({
  pruefzeitpunktUtc: now.toISOString(),
  exaktRelevanteOffeneSpiele: eligible.length,
  ausloesendeSpiele: eligible
}, null, 2));

if (!eligible.length) {
  console.log(
    "KEIN API-ABRUF: Kein exakt terminiertes offenes Bundesliga-Spiel befindet sich im Zeitfenster +120 Minuten bis +24 Stunden."
  );
  process.exit(0);
}

console.log(
  `OPENLIGADB-ABRUF: ${eligible.length} offene(s) Spiel(e) befinden sich im Prüffenster.`
);

let response;
try {
  response = await fetch(API_URL, {
    headers: { Accept: "application/json" }
  });
} catch (error) {
  throw new Error(
    `OpenLigaDB nicht erreichbar: ${error.message}. Keine Änderung.`
  );
}

if (!response.ok) {
  throw new Error(
    `OpenLigaDB HTTP ${response.status}. Keine Änderung.`
  );
}

const apiMatches = await response.json();
const plan = validateAndPlan(data, apiMatches);

console.log(JSON.stringify({
  localBundesligaMatches: plan.localMatches,
  apiMatches: plan.apiMatches,
  matched: plan.matched,
  proposedResultUpdates: plan.updates.length
}, null, 2));

if (!plan.updates.length) {
  console.log(
    "KEINE SPORTLICHE ÄNDERUNG: Noch keine neuen bestätigten Bundesliga-Endergebnisse."
  );
  process.exit(0);
}

/*
 * Erst nachdem die gesamte API-Antwort validiert und alle Konflikte ausgeschlossen
 * sind, wird die lokale Datenstruktur verändert. Dadurch entsteht kein Teilupdate.
 */
const today = berlinDate(now);
const changed = applyUpdates(data, plan, today);

fs.writeFileSync(
  SPIELDATEN_PATH,
  JSON.stringify(data, null, 2) + "\n",
  "utf8"
);

console.log(
  `IMPORT ERFOLGREICH: ${changed} neue Bundesliga-Endergebnis(se) übernommen; datenVersion exakt +1.`
);
