import fs from "node:fs";

const SOURCE = "spieldaten.json";
const WORK = "spieldaten.phase5e-test.json";
const FIXTURE = "phase5e-api-fixture.json";

const TEAM_NAMES = {
  "augsburg": "FC Augsburg",
  "bayern-muenchen": "FC Bayern München",
  "dortmund": "Borussia Dortmund",
  "elversberg": "SV 07 Elversberg",
  "frankfurt": "Eintracht Frankfurt",
  "freiburg": "SC Freiburg",
  "hamburger-sv": "Hamburger SV",
  "hoffenheim": "TSG Hoffenheim",
  "koeln": "1. FC Köln",
  "leverkusen": "Bayer 04 Leverkusen",
  "mainz-05": "1. FSV Mainz 05",
  "moenchengladbach": "Borussia Mönchengladbach",
  "paderborn": "SC Paderborn 07",
  "rb-leipzig": "RB Leipzig",
  "schalke-04": "FC Schalke 04",
  "stuttgart": "VfB Stuttgart",
  "union-berlin": "1. FC Union Berlin",
  "werder-bremen": "SV Werder Bremen"
};

function games(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(s => Array.isArray(s?.spiele) ? s.spiele : [])
    .filter(m => m?.wettbewerb === "bundesliga" && m?.saison === "2026/2027");
}

const sourceText = fs.readFileSync(SOURCE, "utf8");
const data = JSON.parse(sourceText);
const list = games(data);

if (list.length !== 306) throw new Error(`306 Spiele erwartet, gefunden ${list.length}.`);

fs.writeFileSync(WORK, sourceText, "utf8");

const api = list.map((m, i) => {
  const finished = m.id === "bl-2026-27-01-001";
  return {
    matchID: 900000 + i,
    matchIsFinished: finished,
    group: { groupOrderID: m.spieltagNummer },
    team1: { teamName: TEAM_NAMES[m.heimTeamId] },
    team2: { teamName: TEAM_NAMES[m.auswaertsTeamId] },
    matchResults: finished ? [{
      resultTypeID: 2,
      resultName: "Endergebnis",
      pointsTeam1: 2,
      pointsTeam2: 1
    }] : []
  };
});

if (api.some(m => !m.team1.teamName || !m.team2.teamName)) {
  throw new Error("Mindestens ein Teamname konnte für das Fixture nicht erzeugt werden.");
}

fs.writeFileSync(FIXTURE, JSON.stringify(api, null, 2) + "\n", "utf8");
console.log("PHASE 5E VORBEREITUNG: Testkopie + vollständiges 306er API-Fixture erzeugt.");
