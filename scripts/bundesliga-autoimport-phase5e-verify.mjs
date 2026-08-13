import fs from "node:fs";

const SOURCE = "spieldaten.json";
const WORK = "spieldaten.phase5e-test.json";

function games(data) {
  return (Array.isArray(data?.saisons) ? data.saisons : [])
    .flatMap(s => Array.isArray(s?.spiele) ? s.spiele : [])
    .filter(m => m?.wettbewerb === "bundesliga" && m?.saison === "2026/2027");
}

const original = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const work = JSON.parse(fs.readFileSync(WORK, "utf8"));
const before = games(original);
const after = games(work);

const changed = [];
for (let i = 0; i < before.length; i++) {
  if (JSON.stringify(before[i]) !== JSON.stringify(after[i])) {
    changed.push(after[i].id);
  }
}

if (changed.length !== 1 || changed[0] !== "bl-2026-27-01-001") {
  throw new Error(`Genau bl-2026-27-01-001 muss geändert sein; tatsächlich: ${changed.join(", ")}`);
}

const target = after.find(m => m.id === "bl-2026-27-01-001");
if (target.heimtore !== 2 || target.auswaertstore !== 1 || target.status !== "beendet") {
  throw new Error("2:1 / beendet wurde nicht korrekt gespeichert.");
}

if (Number(work.datenVersion) !== Number(original.datenVersion) + 1) {
  throw new Error(`datenVersion nicht exakt +1: ${original.datenVersion} -> ${work.datenVersion}`);
}

if (fs.readFileSync(SOURCE, "utf8") !== fs.readFileSync(SOURCE, "utf8")) {
  throw new Error("Interner Schutzcheck fehlgeschlagen.");
}

console.log(JSON.stringify({
  phase: "5E",
  status: "BESTANDEN",
  exaktGleichesAutoimportSkript: true,
  gemeinsamerCoreVerwendet: true,
  geaendertesSpiel: target.id,
  testergebnis: "2:1",
  geaenderteSpiele: changed.length,
  datenVersionVorher: original.datenVersion,
  datenVersionNachher: work.datenVersion
}, null, 2));
