import fs from "node:fs";

const SOURCE = "spieldaten.json";
const CHECK_AT = process.env.OSC_CHECK_AT || new Date().toISOString();
const MIN_AFTER_KICKOFF = 120;
const MAX_AFTER_KICKOFF = 24 * 60;

function assert(c, m) {
  if (!c) throw new Error(`ZEITFENSTERTEST FEHLGESCHLAGEN: ${m}`);
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
  if (!m?.datum || !m?.anstoss) return null;
  const raw = `${m.datum}T${m.anstoss}:00`;
  // Bundesliga-Termine liegen in deutscher Ortszeit. Für den Test nutzen wir
  // Europe/Berlin über Intl, ohne externe Bibliothek.
  const naive = new Date(raw + "Z");
  if (Number.isNaN(naive.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(naive);
  const got = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const renderedAsUtc = Date.UTC(+got.year, +got.month - 1, +got.day, +got.hour, +got.minute, +got.second);
  const offset = renderedAsUtc - naive.getTime();
  return new Date(naive.getTime() - offset);
}

assert(fs.existsSync(SOURCE), "spieldaten.json fehlt.");
const original = fs.readFileSync(SOURCE, "utf8");
const data = JSON.parse(original);
const list = games(data);
assert(list.length === 306, `306 Spiele erwartet, gefunden ${list.length}.`);

const now = new Date(CHECK_AT);
assert(!Number.isNaN(now.getTime()), `Ungültiger Prüfzeitpunkt: ${CHECK_AT}`);

const stats = {
  bundesligaMatches: list.length,
  exaktTerminiert: 0,
  ohneExaktenTermin: 0,
  bereitsMitErgebnis: 0,
  vorPrueffenster: 0,
  imPrueffenster: 0,
  prueffensterAbgelaufen: 0
};
const eligible = [];

for (const m of list) {
  const ko = kickoffUtc(m);
  if (!ko) {
    stats.ohneExaktenTermin++;
    continue;
  }
  stats.exaktTerminiert++;

  if (hasResult(m)) {
    stats.bereitsMitErgebnis++;
    continue;
  }

  const minutes = (now.getTime() - ko.getTime()) / 60000;
  if (minutes < MIN_AFTER_KICKOFF) {
    stats.vorPrueffenster++;
  } else if (minutes <= MAX_AFTER_KICKOFF) {
    stats.imPrueffenster++;
    eligible.push({
      id: m.id,
      spieltagNummer: m.spieltagNummer,
      datum: m.datum,
      anstoss: m.anstoss,
      kickoffUtc: ko.toISOString(),
      minutenSeitAnstoss: Math.floor(minutes)
    });
  } else {
    stats.prueffensterAbgelaufen++;
  }
}

console.log(JSON.stringify({
  pruefzeitpunktUtc: now.toISOString(),
  regel: {
    fruehestensMinutenNachAnstoss: MIN_AFTER_KICKOFF,
    spaetestensMinutenNachAnstoss: MAX_AFTER_KICKOFF,
    nurDatumUndAnstoss: true,
    nurOhneLokalesEndergebnis: true
  },
  statistik: stats,
  openLigaDbAbrufNoetig: eligible.length > 0,
  ausloesendeSpiele: eligible
}, null, 2));

assert(fs.readFileSync(SOURCE, "utf8") === original, "spieldaten.json wurde verändert.");
console.log("READ-ONLY-SCHUTZ BESTANDEN: spieldaten.json unverändert.");
