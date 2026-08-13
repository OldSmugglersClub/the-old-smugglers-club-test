import fs from "node:fs";

const SPIELDATEN_PATH = "spieldaten.json";
const API_URL = "https://api.openligadb.de/getmatchdata/bl1/2026";
const MODE = process.env.OSC_IMPORT_MODE || "live";

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

function finalScore(match) {
  if (match?.matchIsFinished !== true) return null;

  const results = Array.isArray(match?.matchResults) ? match.matchResults : [];
  const final =
    results.find(r => Number(r?.resultTypeID ?? r?.resultTypeId) === 2) ||
    results.find(r => /end|final/i.test(String(r?.resultName ?? r?.resultTypeName ?? ""))) ||
    results.at(-1);

  if (!final) return null;

  const home = Number(final?.pointsTeam1 ?? final?.PointsTeam1);
  const away = Number(final?.pointsTeam2 ?? final?.PointsTeam2);

  return Number.isInteger(home) && home >= 0 &&
         Number.isInteger(away) && away >= 0
    ? { home, away }
    : null;
}

function localBundesligaMatches(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(season => Array.isArray(season?.spiele) ? season.spiele : [])
    .filter(match =>
      match?.wettbewerb === "bundesliga" &&
      match?.saison === "2026/2027"
    );
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
    if (index.has(key)) throw new Error(`Doppelter lokaler Schlüssel: ${key}`);
    index.set(key, match);
  }
  return index;
}

function validateAndPlan(data, apiMatches) {
  const localMatches = localBundesligaMatches(data);

  if (localMatches.length !== 306) {
    throw new Error(`Lokaler Bundesliga-Spielplan unvollständig: ${localMatches.length}/306.`);
  }

  if (!Array.isArray(apiMatches) || apiMatches.length !== 306) {
    throw new Error(
      `OpenLigaDB-Spielplan unvollständig/unerwartet: ${Array.isArray(apiMatches) ? apiMatches.length : "kein Array"}/306.`
    );
  }

  const localIndex = buildLocalIndex(localMatches);
  const matchedLocalIds = new Set();
  const updates = [];
  const conflicts = [];
  const mappingErrors = [];

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

    const local = localIndex.get(fixtureKey(spieltag, homeId, awayId));
    if (!local) {
      mappingErrors.push({
        matchID: apiMatch?.matchID ?? null,
        spieltag,
        homeId,
        awayId,
        reason: "Keine lokale Paarung"
      });
      continue;
    }

    matchedLocalIds.add(local.id);

    const score = finalScore(apiMatch);
    if (!score) continue;

    const localHasResult =
      Number.isInteger(local?.heimtore) &&
      Number.isInteger(local?.auswaertstore);

    if (localHasResult) {
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

  const unmatchedLocal = localMatches.filter(m => !matchedLocalIds.has(m.id));

  if (mappingErrors.length || unmatchedLocal.length) {
    throw new Error(
      `Paarungszuordnung unvollständig: API-Fehler ${mappingErrors.length}, lokal offen ${unmatchedLocal.length}.`
    );
  }

  if (conflicts.length) {
    const first = conflicts[0];
    throw new Error(
      `ERGEBNISKONFLIKT: ${first.localId} lokal ${first.lokal}, OpenLigaDB ${first.openLigaDB}. Keine Übernahme.`
    );
  }

  return {
    localMatches: localMatches.length,
    apiMatches: apiMatches.length,
    matched: matchedLocalIds.size,
    updates
  };
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

function runSelfTest() {
  const base = {
    datenVersion: 7,
    aktualisiert: "2026-08-01",
    saisons: [{
      spiele: Array.from({ length: 306 }, (_, i) => ({
        id: `test-${i + 1}`,
        wettbewerb: "bundesliga",
        saison: "2026/2027",
        spieltagNummer: Math.floor(i / 9) + 1,
        heimTeamId: `home-${i + 1}`,
        auswaertsTeamId: `away-${i + 1}`,
        heimtore: null,
        auswaertstore: null,
        status: "terminiert",
        quelleStand: "2026-08-01"
      }))
    }]
  };

  // Selftest prüft ausschließlich die Schreib-/Schutzlogik.
  const target = base.saisons[0].spiele[0];
  const plan = { updates: [{ local: target, home: 2, away: 1 }] };

  const changed = applyUpdates(base, plan, "2026-08-12");

  if (changed !== 1) throw new Error("SELFTEST: Updatezahl falsch.");
  if (target.heimtore !== 2 || target.auswaertstore !== 1) throw new Error("SELFTEST: Ergebnis nicht geschrieben.");
  if (target.status !== "beendet") throw new Error("SELFTEST: Status nicht beendet.");
  if (target.quelleStand !== "2026-08-12") throw new Error("SELFTEST: quelleStand nicht aktualisiert.");
  if (base.datenVersion !== 8) throw new Error("SELFTEST: datenVersion nicht genau einmal erhöht.");
  if (base.aktualisiert !== "2026-08-12") throw new Error("SELFTEST: aktualisiert nicht gesetzt.");

  // Kein Update -> keine Metadatenänderung.
  const before = JSON.stringify(base);
  const zero = applyUpdates(base, { updates: [] }, "2026-08-13");
  if (zero !== 0 || JSON.stringify(base) !== before) {
    throw new Error("SELFTEST: No-op hat Daten verändert.");
  }

  console.log("SELFTEST BESTANDEN: Schreiben + No-op-Schutz funktionieren.");
}

if (MODE === "selftest") {
  runSelfTest();
  process.exit(0);
}

if (!fs.existsSync(SPIELDATEN_PATH)) {
  throw new Error("spieldaten.json fehlt.");
}

const data = JSON.parse(fs.readFileSync(SPIELDATEN_PATH, "utf8"));

const response = await fetch(API_URL, {
  headers: { Accept: "application/json" }
});

if (!response.ok) {
  throw new Error(`OpenLigaDB HTTP ${response.status}. Keine Änderung.`);
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
  console.log("KEINE ÄNDERUNG: Keine neuen bestätigten Bundesliga-Endergebnisse.");
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const changed = applyUpdates(data, plan, today);

fs.writeFileSync(
  SPIELDATEN_PATH,
  JSON.stringify(data, null, 2) + "\n",
  "utf8"
);

console.log(`IMPORT ERFOLGREICH: ${changed} neue Bundesliga-Endergebnis(se) persistent übernommen.`);
