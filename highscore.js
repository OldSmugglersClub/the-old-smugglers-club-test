const fmt = n => Number(n || 0).toLocaleString('de-DE', { maximumFractionDigits: 2 });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let data = {};
let hallOfFame = {};
let pointsData = {};
let participantsData = {};
let highscoreSourceMode = "register";
const STORAGE_KEY = 'tosmc-highscore-state-v233';
const state = {
  view: 'overall',
  page: 1,
  pageSize: 25,
  query: '',
  sortKey: 'official',
  sortDir: 'asc'
};


function formatIsoDateGerman(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : '';
}

function mergeCalculatedRanking(base, pointsPayload, participantPayload) {
  const ranking = Array.isArray(pointsPayload?.rangliste) ? pointsPayload.rangliste : [];
  if (!ranking.length) return { payload: base, active: false, count: 0 };
  const participants = Array.isArray(participantPayload?.teilnehmer) ? participantPayload.teilnehmer : [];
  const byId = new Map(participants.map(row => [String(row.id), row]));
  const existing = new Map((base.individual?.overall || []).map(row => [String(row.name), row]));
  const calculated = ranking.map(row => {
    const participant = byId.get(String(row.teilnehmerId)) || {};
    const name = String(row.teilnehmer || participant.name || participant.profil?.anzeigename || row.teilnehmerId || 'Unbekannt');
    const previous = existing.get(name) || {};
    return {
      rank: Number(row.platz || 0),
      name,
      participantId: String(row.teilnehmerId || participant.id || ''),
      bonusPoints: Number(previous.bonusPoints || 0),
      matchdayWins: Number(previous.matchdayWins || 0),
      totalPoints: Number(row.punkte || 0),
      exactHits: Number(row.exakt || 0),
      differenceHits: Number(row.differenz || 0),
      tendencyHits: Number(row.tendenz || 0),
      evaluatedTips: Number(row.gewertet || 0),
      team: participant.team || previous.team || null
    };
  });
  const seen = new Set(calculated.map(row => row.name));
  participants.filter(row => row?.aktiv !== false).forEach(participant => {
    const name = String(participant.name || participant.profil?.anzeigename || '');
    if (!name || seen.has(name)) return;
    calculated.push({ rank: calculated.length ? calculated.length + 1 : 1, name, participantId: String(participant.id || ''), bonusPoints: 0, matchdayWins: 0, totalPoints: 0, exactHits: 0, differenceHits: 0, tendencyHits: 0, evaluatedTips: 0, team: participant.team || null });
  });
  calculated.sort((a,b) => b.totalPoints-a.totalPoints || b.exactHits-a.exactHits || b.differenceHits-a.differenceHits || a.name.localeCompare(b.name,'de'));
  let rank=0, last='';
  calculated.forEach((row,index) => {
    const key=`${row.totalPoints}:${row.exactHits}:${row.differenceHits}`;
    if (key !== last) rank=index+1;
    row.rank=rank; last=key;
  });
  const updated = structuredClone(base);
  updated.individual = updated.individual || {};
  updated.individual.overall = calculated;
  updated.meta = updated.meta || {};
  updated.meta.source = 'Zentrale Punkteberechnung';
  updated.meta.exportDate = formatIsoDateGerman(pointsPayload.berechnetAm || pointsPayload.aktualisiert) || updated.meta.exportDate;
  updated.meta.privacy = 'Punkte aus tipps.json, spieldaten.json und teilnehmer.json; keine E-Mail-Daten.';
  return { payload: updated, active: true, count: ranking.length };
}

function playerByName(name, view) {
  return (data.individual?.[view] || []).find(row => String(row.name) === String(name));
}

let activeProfileName = '';

function comparisonMetric(label, aValue, bValue, higherIsBetter = true, suffix = '') {
  const a = Number(aValue || 0);
  const b = Number(bValue || 0);
  const equal = a === b;
  const aWins = higherIsBetter ? a > b : a < b;
  const bWins = higherIsBetter ? b > a : b < a;
  return `<article class="hs-comparison-metric">
    <span>${esc(label)}</span>
    <div><strong class="${!equal && aWins ? 'is-leading' : ''}">${fmt(a)}${suffix}</strong><i aria-hidden="true">:</i><strong class="${!equal && bWins ? 'is-leading' : ''}">${fmt(b)}${suffix}</strong></div>
    <small>${equal ? 'Gleichstand' : aWins ? 'Vorteil Spieler A' : 'Vorteil Spieler B'}</small>
  </article>`;
}

function renderPlayerComparison(nameA, nameB) {
  const host = document.querySelector('#player-comparison');
  if (!host || !nameA || !nameB || nameA === nameB) { if (host) host.hidden = true; return; }
  const overallA = playerByName(nameA, 'overall') || {};
  const overallB = playerByName(nameB, 'overall') || {};
  const matchA = playerByName(nameA, 'matchday') || {};
  const matchB = playerByName(nameB, 'matchday') || {};
  document.querySelector('#comparison-name-a').textContent = nameA;
  document.querySelector('#comparison-name-b').textContent = nameB;
  document.querySelector('#comparison-grid').innerHTML = [
    comparisonMetric('Gesamtrang', overallA.rank, overallB.rank, false),
    comparisonMetric('Gesamtpunkte', overallA.totalPoints, overallB.totalPoints),
    comparisonMetric('Bonuspunkte', overallA.bonusPoints, overallB.bonusPoints),
    comparisonMetric('Spieltagsiege', overallA.matchdayWins, overallB.matchdayWins),
    comparisonMetric('Aktueller Spieltag', matchA.points, matchB.points),
    comparisonMetric('Spieltagsrang', matchA.matchdayRank ?? matchA.rank, matchB.matchdayRank ?? matchB.rank, false)
  ].join('');
  const allZero = [overallA.totalPoints, overallB.totalPoints, matchA.points, matchB.points].every(value => Number(value || 0) === 0);
  document.querySelector('#comparison-note').textContent = allZero
    ? 'Beide Spieler stehen noch ohne sportliche Wertung. Der Vergleich zeigt deshalb derzeit nur den bestätigten Datenstand.'
    : 'Grün markiert ist jeweils der bessere bestätigte Wert. Rangwerte werden niedriger, Punktwerte höher bewertet.';
  host.hidden = false;
}

function populateComparisonSelect(currentName) {
  const select = document.querySelector('#player-compare-select');
  const button = document.querySelector('#player-compare-start');
  const comparison = document.querySelector('#player-comparison');
  if (!select || !button) return;
  const names = (data.individual?.overall || []).map(row => String(row.name)).filter(name => name !== currentName).sort((a,b) => a.localeCompare(b,'de'));
  select.innerHTML = '<option value="">Spieler auswählen …</option>' + names.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
  select.value = '';
  button.disabled = true;
  if (comparison) comparison.hidden = true;
}

function playerPositionAnalysis(name) {
  const rows = officialRows('overall');
  const player = rows.find(row => String(row.name) === String(name));
  const scoredRows = rows.filter(row => Number(row.totalPoints || 0) > 0);
  const total = rows.length;
  const hasCompetition = scoredRows.length > 0;
  if (!player || !total) return null;

  const score = Number(player.totalPoints || 0);
  const leaderScore = hasCompetition ? Math.max(...scoredRows.map(row => Number(row.totalPoints || 0))) : 0;
  const distinctScores = [...new Set(scoredRows.map(row => Number(row.totalPoints || 0)))].sort((a, b) => b - a);
  const higherScore = distinctScores.filter(value => value > score).sort((a, b) => a - b)[0];
  const lowerScore = distinctScores.filter(value => value < score).sort((a, b) => b - a)[0];
  const tied = rows.filter(row => Number(row.totalPoints || 0) === score);
  const officialIndex = rows.findIndex(row => String(row.name) === String(name));
  const position = Math.max(1, Number(player.rank || officialIndex + 1));
  const fieldShare = total > 1 ? Math.round(((total - position) / (total - 1)) * 100) : 100;

  let zone = 'Noch ohne Wertung';
  if (hasCompetition && score > 0) {
    if (position === 1) zone = 'Spitzengruppe';
    else if (position <= 3) zone = 'Podiumszone';
    else if (position <= Math.max(10, Math.ceil(total * .2))) zone = 'Vorderes Feld';
    else if (position <= Math.ceil(total * .65)) zone = 'Mittelfeld';
    else zone = 'Verfolgerfeld';
  }

  return {
    player, total, score, hasCompetition, leaderScore, position, zone, fieldShare,
    gapToLeader: Math.max(0, leaderScore - score),
    pointsToOvertake: higherScore === undefined ? 0 : Math.max(0, higherScore - score + 1),
    cushion: lowerScore === undefined ? 0 : Math.max(0, score - lowerScore),
    tiedNames: tied.map(row => String(row.name)).filter(playerName => playerName !== String(name)),
    tiedCount: tied.length
  };
}

function renderPlayerPositionAnalysis(name) {
  const host = document.querySelector('#player-position-analysis');
  const grid = document.querySelector('#player-position-grid');
  const status = document.querySelector('#player-position-status');
  const note = document.querySelector('#player-position-note');
  const analysis = playerPositionAnalysis(name);
  if (!host || !grid || !status || !note || !analysis) { if (host) host.hidden = true; return; }

  host.hidden = false;
  if (!analysis.hasCompetition || analysis.score <= 0) {
    status.textContent = 'Noch keine belastbare Ranglage';
    grid.innerHTML = `
      <article><span>Lage im Feld</span><strong>Offen</strong><small>${analysis.total} registrierte Spieler</small></article>
      <article><span>Abstand zur Spitze</span><strong>–</strong><small>Noch keine Punkte vergeben</small></article>
      <article><span>Nächster Angriff</span><strong>–</strong><small>Erst nach einer Wertung berechenbar</small></article>
      <article><span>Absicherung</span><strong>–</strong><small>Keine Rangabstände vorhanden</small></article>`;
    note.textContent = 'Die Positionsanalyse wird automatisch aktiv, sobald der erste belastbare Punktestand vorliegt. Bis dahin wird keine Rangentwicklung simuliert.';
    return;
  }

  status.textContent = `${analysis.zone} · Platz ${analysis.position} von ${analysis.total}`;
  const leaderText = analysis.gapToLeader === 0 ? 'Führung' : `${fmt(analysis.gapToLeader)} Punkte`;
  const attackText = analysis.pointsToOvertake > 0 ? `${fmt(analysis.pointsToOvertake)} Punkte` : 'Kein Ziel davor';
  const cushionText = analysis.cushion > 0 ? `${fmt(analysis.cushion)} Punkte` : 'Kein Abstand';
  grid.innerHTML = `
    <article><span>Lage im Feld</span><strong>${esc(analysis.zone)}</strong><small>${analysis.fieldShare}% des Feldes hinter dieser Position</small></article>
    <article><span>Abstand zur Spitze</span><strong>${leaderText}</strong><small>${analysis.gapToLeader === 0 ? 'Aktuell an der Spitze' : `Spitzenwert ${fmt(analysis.leaderScore)} Punkte`}</small></article>
    <article><span>Nächster Angriff</span><strong>${attackText}</strong><small>${analysis.pointsToOvertake > 0 ? 'Zum Überholen der nächsten Punktestufe' : 'Keine höhere Punktestufe vorhanden'}</small></article>
    <article><span>Absicherung</span><strong>${cushionText}</strong><small>${analysis.cushion > 0 ? 'Vorsprung auf die nächste Punktestufe' : 'Direkter Gleichstand oder Tabellenende'}</small></article>`;

  if (analysis.tiedCount > 1) {
    const names = analysis.tiedNames.slice(0, 4).join(', ');
    const remaining = Math.max(0, analysis.tiedNames.length - 4);
    note.textContent = `Punktgleich mit ${names}${remaining ? ` und ${remaining} weiteren Spielern` : ''}. Die offizielle Rangfolge aus dem Export bleibt maßgeblich.`;
  } else {
    note.textContent = 'Alle Abstände werden ausschließlich aus dem aktuell geladenen Gesamtstand berechnet. Historische Form oder nicht vorhandene Zwischenstände werden nicht geschätzt.';
  }
}


function historySnapshots() {
  const rows = Array.isArray(data.history) ? data.history : [];
  return rows.map((entry, index) => {
    const rawStandings = Array.isArray(entry?.standings) ? entry.standings
      : Array.isArray(entry?.overall) ? entry.overall
      : Array.isArray(entry?.players) ? entry.players
      : entry?.standings && typeof entry.standings === 'object'
        ? Object.entries(entry.standings).map(([name, value]) => ({ name, ...(typeof value === 'object' ? value : { totalPoints: value }) }))
        : [];
    const standings = rawStandings.map((row, rowIndex) => ({
      name: String(row?.name ?? row?.player ?? ''),
      rank: Number(row?.rank ?? row?.position ?? rowIndex + 1),
      totalPoints: Number(row?.totalPoints ?? row?.points ?? row?.score ?? 0)
    })).filter(row => row.name);
    return {
      label: String(entry?.matchday ?? entry?.label ?? entry?.date ?? `Stand ${index + 1}`),
      leader: String(entry?.leader ?? standings[0]?.name ?? ''),
      points: Number(entry?.points ?? entry?.leaderPoints ?? standings[0]?.totalPoints ?? 0),
      standings
    };
  });
}

function playerTrendAnalysis(name) {
  const snapshots = historySnapshots().filter(snapshot => snapshot.standings.some(row => row.name === name));
  if (snapshots.length < 2) return { available: false, snapshots };
  const first = snapshots[0].standings.find(row => row.name === name);
  const last = snapshots.at(-1).standings.find(row => row.name === name);
  if (!first || !last) return { available: false, snapshots };
  const rankDelta = Number(first.rank) - Number(last.rank);
  const pointsDelta = Number(last.totalPoints) - Number(first.totalPoints);
  let bestRank = Infinity;
  let bestLabel = '';
  snapshots.forEach(snapshot => {
    const row = snapshot.standings.find(item => item.name === name);
    if (row && Number(row.rank) < bestRank) { bestRank = Number(row.rank); bestLabel = snapshot.label; }
  });
  return { available: true, snapshots, first, last, rankDelta, pointsDelta, bestRank, bestLabel };
}

function renderPlayerTrend(name) {
  const box = document.querySelector('#player-trend');
  const grid = document.querySelector('#player-trend-grid');
  const stateEl = document.querySelector('#player-trend-state');
  const note = document.querySelector('#player-trend-note');
  if (!box || !grid || !stateEl || !note) return;
  const trend = playerTrendAnalysis(name);
  if (!trend.available) {
    box.classList.add('is-locked');
    stateEl.textContent = 'Nicht berechenbar';
    grid.innerHTML = '<article><span>Archivstände</span><strong>' + trend.snapshots.length + '</strong><small>Mindestens zwei vollständige Spielerstände erforderlich</small></article><article><span>Rangbewegung</span><strong>–</strong><small>Keine Bewegung wird simuliert</small></article><article><span>Punktezuwachs</span><strong>–</strong><small>Noch keine belastbare Zeitreihe</small></article>';
    note.textContent = 'Der Saisonverlauf erscheint, sobald mehrere Spieltage abgeschlossen sind.';
    return;
  }
  box.classList.remove('is-locked');
  const direction = trend.rankDelta > 0 ? `${trend.rankDelta} Plätze gestiegen` : trend.rankDelta < 0 ? `${Math.abs(trend.rankDelta)} Plätze gefallen` : 'Rang unverändert';
  stateEl.textContent = trend.rankDelta > 0 ? 'Auf Kurs' : trend.rankDelta < 0 ? 'Unter Druck' : 'Stabil';
  grid.innerHTML = `<article><span>Rangbewegung</span><strong>${esc(direction)}</strong><small>Von Rang ${fmt(trend.first.rank)} auf Rang ${fmt(trend.last.rank)}</small></article><article><span>Punktezuwachs</span><strong>+${fmt(trend.pointsDelta)}</strong><small>Zwischen erstem und letztem Archivstand</small></article><article><span>Bester Rang</span><strong>${fmt(trend.bestRank)}</strong><small>${esc(trend.bestLabel)}</small></article>`;
  note.textContent = `Berechnet aus ${trend.snapshots.length} bestätigten Archivständen. Der Verlauf beschreibt nur dokumentierte Veränderungen und ist keine Prognose.`;
}

function renderSeasonTrend(historyRows) {
  const target = document.querySelector('#season-trend');
  if (!target) return;
  const snapshots = historySnapshots();
  const complete = snapshots.filter(snapshot => snapshot.standings.length > 0);
  if (complete.length < 2) {
    target.className = 'hs-season-trend is-locked';
    target.innerHTML = `<article><span>Archivstände</span><strong>${historyRows.length}</strong><small>${complete.length} mit vollständiger Rangliste</small></article><article><span>Führungswechsel</span><strong>–</strong><small>Mindestens zwei vollständige Stände erforderlich</small></article><article><span>Größter Aufstieg</span><strong>–</strong><small>Keine Bewegung wird geschätzt</small></article><article><span>Verlaufsstatus</span><strong>Noch offen</strong><small>Historische Spielerdaten fehlen</small></article>`;
    return;
  }
  let leadChanges = 0;
  for (let i = 1; i < complete.length; i++) if (complete[i].leader && complete[i - 1].leader && complete[i].leader !== complete[i - 1].leader) leadChanges++;
  const first = complete[0];
  const last = complete.at(-1);
  let climber = null;
  last.standings.forEach(row => {
    const start = first.standings.find(item => item.name === row.name);
    if (!start) return;
    const gain = Number(start.rank) - Number(row.rank);
    if (!climber || gain > climber.gain) climber = { name: row.name, gain };
  });
  target.className = 'hs-season-trend is-active';
  target.innerHTML = `<article><span>Archivstände</span><strong>${complete.length}</strong><small>Vollständig auswertbare Ranglisten</small></article><article><span>Führungswechsel</span><strong>${leadChanges}</strong><small>Dokumentierte Wechsel an der Spitze</small></article><article><span>Größter Aufstieg</span><strong>${climber && climber.gain > 0 ? esc(climber.name) : 'Keiner'}</strong><small>${climber && climber.gain > 0 ? `${fmt(climber.gain)} Plätze verbessert` : 'Keine positive Rangbewegung'}</small></article><article><span>Verlaufsstatus</span><strong>Belastbar</strong><small>Nur bestätigte Archivdaten</small></article>`;
}

function openPlayerProfile(name) {
  const dialog = document.querySelector('#player-dialog');
  if (!dialog) return;
  activeProfileName = name;
  const overall = playerByName(name, 'overall');
  const matchday = playerByName(name, 'matchday');
  document.querySelector('#player-dialog-title').textContent = name;
  document.querySelector('#player-dialog-status').textContent = `${data.meta?.season || 'Saison'} · ${data.meta?.matchday || 'aktueller Spieltag'}`;
  document.querySelector('#player-profile-grid').innerHTML = `
    <article><span>Gesamtrang</span><strong>${esc(overall?.rank ?? '–')}</strong><small>${fmt(overall?.totalPoints)} Gesamtpunkte</small></article>
    <article><span>Bonuspunkte</span><strong>${fmt(overall?.bonusPoints)}</strong><small>Anteil an der Gesamtwertung</small></article>
    <article><span>Spieltagsiege</span><strong>${fmt(overall?.matchdayWins)}</strong><small>Gewonnene Einzelspieltage</small></article>
    <article><span>Aktueller Spieltag</span><strong>${fmt(matchday?.points)} Punkte</strong><small>Rang ${esc(matchday?.matchdayRank ?? matchday?.rank ?? '–')}</small></article>
    <article><span>Spieltag-Bonus</span><strong>${fmt(matchday?.bonusPoints)}</strong><small>Im aktuellen Export</small></article>
    <article><span>Datenstand</span><strong>${esc(data.meta?.exportDate || '–')}</strong><small>${esc(data.meta?.source || 'Zentrale Highscore-Datei')}</small></article>`;
  const noScore = Number(overall?.totalPoints || 0) <= 0 && Number(matchday?.points || 0) <= 0;
  populateComparisonSelect(name);
  renderPlayerPositionAnalysis(name);
  renderPlayerTrend(name);
  renderPlayerLegacy(name);
  document.querySelector('#player-profile-note').textContent = noScore
    ? 'Noch keine sportliche Wertung vorhanden. Das Profil füllt sich nach dem ersten Spieltag.'
    : 'Das Profil vergleicht Gesamtwertung und aktuellen Einzelspieltag. Es werden keine fehlenden Werte geschätzt.';
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function profileButton(name) {
  return `<button class="hs-player-link" type="button" data-player-profile="${esc(name)}" aria-label="Spielerprofil von ${esc(name)} öffnen">${esc(name)}</button>`;
}

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (['overall', 'matchday'].includes(saved.view)) state.view = saved.view;
    if ([25, 50, 100].includes(Number(saved.pageSize))) state.pageSize = Number(saved.pageSize);
    if (typeof saved.sortKey === 'string') state.sortKey = saved.sortKey;
    if (['asc', 'desc'].includes(saved.sortDir)) state.sortDir = saved.sortDir;
  } catch (error) {
    console.warn('Gespeicherter Highscore-Zustand konnte nicht gelesen werden.', error);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      view: state.view, pageSize: state.pageSize, sortKey: state.sortKey, sortDir: state.sortDir
    }));
  } catch (error) {
    console.warn('Highscore-Zustand konnte nicht gespeichert werden.', error);
  }
}

function currentFilteredRows() {
  const query = state.query.trim().toLocaleLowerCase('de');
  const rows = sortedRows(state.view);
  return query ? rows.filter(row => String(row.name).toLocaleLowerCase('de').includes(query)) : rows;
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function setSystemStatus(type, title, message, retry = false) {
  const el = document.querySelector('#hs-system-status');
  if (!el) return;
  el.className = `hs-system-status is-${type}`;
  el.hidden = false;
  el.innerHTML = `<strong>${esc(title)}</strong><span>${esc(message)}</span>${retry ? '<button type="button" id="hs-retry">Erneut laden</button>' : ''}`;
  if (retry) document.querySelector('#hs-retry')?.addEventListener('click', loadHighscoreData);
}

function validatePayload(payload) {
  const issues = [];
  if (!payload || typeof payload !== 'object') issues.push('Ungültiges Datenformat');
  if (!Array.isArray(payload?.individual?.overall)) issues.push('Gesamtwertung fehlt');
  if (!Array.isArray(payload?.individual?.matchday)) issues.push('Spieltagswertung fehlt');
  if (!Array.isArray(payload?.teams?.overall)) issues.push('Teamwertung fehlt');
  if (!payload?.meta || typeof payload.meta !== 'object') issues.push('Metadaten fehlen');
  return issues;
}

function setSection(name) {
  document.querySelectorAll('.hs-section').forEach(section => {
    const active = section.id === `section-${name}`;
    section.classList.toggle('is-active', active);
    section.hidden = !active;
  });
  document.querySelectorAll('.hs-main-tab').forEach(tab => {
    const active = tab.dataset.section === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  history.replaceState(null, '', `#${name}`);
}

function scoreOf(row, view) {
  return view === 'overall' ? Number(row.totalPoints || 0) : Number(row.points || 0);
}

function officialRows(view) {
  return [...(data.individual?.[view] || [])].sort((a, b) =>
    scoreOf(b, view) - scoreOf(a, view) ||
    Number(a.rank || 999) - Number(b.rank || 999) ||
    String(a.name).localeCompare(String(b.name), 'de')
  );
}

function sortedRows(view) {
  const rows = officialRows(view);
  if (state.sortKey === 'official') return rows;
  const direction = state.sortDir === 'asc' ? 1 : -1;
  return rows.sort((a, b) => {
    const av = state.sortKey === 'name' ? String(a.name || '') : Number(a[state.sortKey] || 0);
    const bv = state.sortKey === 'name' ? String(b.name || '') : Number(b[state.sortKey] || 0);
    const result = typeof av === 'string' ? av.localeCompare(bv, 'de') : av - bv;
    return result * direction || String(a.name).localeCompare(String(b.name), 'de');
  });
}

function competitionStatus(view) {
  const rows = officialRows(view);
  if (!rows.length) return { open: true, tied: false, max: 0, leaders: [] };
  const max = scoreOf(rows[0], view);
  const leaders = rows.filter(row => scoreOf(row, view) === max);
  return { open: max <= 0, tied: leaders.length > 1, max, leaders };
}

function renderPodium() {
  const rows = officialRows(state.view).slice(0, 3);
  const status = competitionStatus(state.view);
  const el = document.querySelector('#podium');
  const notice = document.querySelector('#ranking-notice');

  if (!rows.length) {
    notice.textContent = '';
    notice.hidden = true;
    el.innerHTML = '<div class="hs-podium-empty">Noch keine Ranglistendaten vorhanden.</div>';
    return;
  }

  notice.hidden = false;
  if (status.open) {
    notice.innerHTML = '<strong>Rangdeck noch unbesetzt.</strong> Alle Teilnehmer stehen derzeit bei 0 Punkten. Die angezeigte Reihenfolge ist vorläufig und alphabetisch.';
  } else if (status.tied) {
    notice.innerHTML = `<strong>Geteilte Führung.</strong> ${status.leaders.length} Spieler liegen mit ${fmt(status.max)} Punkten gleichauf.`;
  } else {
    notice.innerHTML = `<strong>Aktueller Stand.</strong> ${esc(status.leaders[0]?.name)} führt mit ${fmt(status.max)} Punkten.`;
  }

  el.innerHTML = `<div class="hs-podium-rigging" aria-hidden="true"><span></span><span></span></div>${rows.map((row, index) => {
    const place = index + 1;
    const tiedAtTop = status.tied && scoreOf(row, state.view) === status.max;
    const label = status.open ? 'Vorläufig' : tiedAtTop ? 'Geteilter Rang 1' : `Platz ${place}`;
    const motto = status.open ? 'Noch ohne Wertung' : index === 0 ? 'Kapitän der Rangliste' : index === 1 ? 'Erster Maat' : 'Steuermann';
    return `<article class="hs-podium-card place-${place}${status.open ? ' is-provisional' : ''}">
      <div class="hs-card-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="hs-rank-seal" aria-hidden="true"><span>${status.open ? '–' : place}</span></div>
      <div class="hs-place-label">${label}</div>
      <strong>${profileButton(row.name)}</strong>
      <div class="hs-podium-divider" aria-hidden="true"></div>
      <div class="hs-podium-points">${fmt(scoreOf(row, state.view))} Punkte</div>
      ${state.view === 'overall' ? `<small>${fmt(row.matchdayWins)} Spieltagssiege</small>` : ''}
      <div class="hs-podium-motto">${motto}</div>
      <div class="hs-pedestal-face" aria-hidden="true"><span>${status.open ? '–' : place}</span></div>
    </article>`;
  }).join('')}<div class="hs-podium-deck" aria-hidden="true"><span></span></div>`;
  el.querySelectorAll('[data-player-profile]').forEach(button => button.addEventListener('click', () => openPlayerProfile(button.dataset.playerProfile)));
}

function sortButton(label, key) {
  const active = state.sortKey === key;
  const direction = active ? state.sortDir : 'none';
  const symbol = active ? (state.sortDir === 'asc' ? '▲' : '▼') : '';
  const action = !active ? 'sortieren' : state.sortDir === 'asc' ? 'absteigend sortieren' : 'aufsteigend sortieren';
  return `<button class="hs-sort" type="button" data-sort="${key}" data-direction="${direction}" aria-label="${esc(label)}: ${action}">${label}<span aria-hidden="true">${symbol}</span></button>`;
}

function rowCell(label, value, className = '') {
  return `<td${className ? ` class="${className}"` : ''} data-label="${label}">${value}</td>`;
}

function sortDescription() {
  if (state.sortKey === 'official') return 'Offizielle Rangfolge';
  const labels = {
    name: 'Spielername', bonusPoints: 'Bonuspunkte', matchdayWins: 'Spieltagsiege',
    totalPoints: 'Gesamtpunkte', points: 'Spieltagespunkte', matchdayRank: 'Spieltagsplatz'
  };
  return `${labels[state.sortKey] || state.sortKey} · ${state.sortDir === 'asc' ? 'aufsteigend' : 'absteigend'}`;
}

function updateRankingToolbar(filteredCount) {
  const view = document.querySelector('#toolbar-view');
  const sort = document.querySelector('#toolbar-sort');
  const count = document.querySelector('#toolbar-count');
  const reset = document.querySelector('#ranking-reset');
  if (!view || !sort || !count || !reset) return;
  view.textContent = state.view === 'overall' ? 'Gesamtwertung' : (data.meta?.matchday || 'Einzelspieltag');
  sort.textContent = sortDescription();
  count.textContent = `${filteredCount} ${filteredCount === 1 ? 'Spieler' : 'Spieler'}`;
  reset.hidden = !state.query && state.sortKey === 'official' && state.pageSize === 25;
}

function renderIndividual() {
  const filtered = currentFilteredRows();
  updateRankingToolbar(filtered.length);
  const exportCaption = document.querySelector('#export-caption');
  if (exportCaption) exportCaption.textContent = state.view === 'overall' ? 'Aktuelle Gesamtwertung' : (data.meta?.matchday || 'Aktueller Einzelspieltag');
  saveState();
  const pages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * state.pageSize;
  const rows = filtered.slice(start, start + state.pageSize);
  const head = document.querySelector('#individual-head');
  const body = document.querySelector('#individual-body');

  if (state.view === 'overall') {
    head.innerHTML = `<tr><th>${sortButton('Rang', 'official')}</th><th>${sortButton('Spieler', 'name')}</th><th>${sortButton('Bonuspunkte', 'bonusPoints')}</th><th>${sortButton('Spieltagsiege', 'matchdayWins')}</th><th>${sortButton('Gesamtpunkte', 'totalPoints')}</th></tr>`;
    body.innerHTML = rows.map(row => `<tr>${rowCell('Rang', esc(row.rank), 'hs-rank')}${rowCell('Spieler', profileButton(row.name), 'hs-player')}${rowCell('Bonuspunkte', fmt(row.bonusPoints))}${rowCell('Spieltagsiege', fmt(row.matchdayWins))}${rowCell('Gesamtpunkte', fmt(row.totalPoints), 'hs-total')}</tr>`).join('');
    document.querySelector('#individual-title').textContent = 'Einzelwertung – Gesamt';
    document.querySelector('#individual-caption').textContent = 'Gesamtübersicht aller Einzelspieler. Spalten können sortiert werden.';
  } else {
    head.innerHTML = `<tr><th>${sortButton('Rang', 'official')}</th><th>${sortButton('Spieler', 'name')}</th><th>${sortButton('Punkte', 'points')}</th><th>${sortButton('Bonus', 'bonusPoints')}</th><th>${sortButton('Gesamtpunkte', 'totalPoints')}</th><th>${sortButton('Spieltagsplatz', 'matchdayRank')}</th></tr>`;
    body.innerHTML = rows.map(row => `<tr>${rowCell('Rang', esc(row.rank), 'hs-rank')}${rowCell('Spieler', profileButton(row.name), 'hs-player')}${rowCell('Punkte', fmt(row.points))}${rowCell('Bonus', fmt(row.bonusPoints))}${rowCell('Gesamtpunkte', fmt(row.totalPoints), 'hs-total')}${rowCell('Spieltagsplatz', esc(row.matchdayRank))}</tr>`).join('');
    document.querySelector('#individual-title').textContent = 'Einzelwertung – Spieltag';
    document.querySelector('#individual-caption').textContent = `${data.meta?.matchday || 'Ausgewählter Einzelspieltag'} · Spalten können sortiert werden.`;
  }

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="6" class="hs-empty"><strong>Kein Eintrag im Schiffsregister</strong><span>Für „${esc(state.query)}“ wurde kein Spieler gefunden.</span><button type="button" class="hs-empty-reset" id="empty-reset">Suche löschen</button></td></tr>`;
    document.querySelector('#empty-reset')?.addEventListener('click', resetRankingControls);
  }

  document.querySelectorAll('.hs-sort').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.sort;
    if (key === 'official') {
      state.sortKey = 'official';
      state.sortDir = 'asc';
    } else if (state.sortKey === key) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortKey = key;
      state.sortDir = key === 'name' ? 'asc' : 'desc';
    }
    state.page = 1;
    renderIndividual();
  }));

  document.querySelectorAll('[data-player-profile]').forEach(button => button.addEventListener('click', () => openPlayerProfile(button.dataset.playerProfile)));

  document.querySelector('#page-info').textContent = `Seite ${state.page} von ${pages} · ${filtered.length} Spieler`;
  document.querySelector('#page-prev').disabled = state.page <= 1;
  document.querySelector('#page-next').disabled = state.page >= pages;
  renderPodium();
}


function bonusRows() {
  const rows = [...(data.individual?.overall || [])].map(row => ({
    rank: Number(row.rank || 1),
    name: String(row.name || ''),
    bonusPoints: Number(row.bonusPoints || 0),
    correctAnswers: Math.floor(Number(row.bonusPoints || 0) / 5)
  }));
  rows.sort((a,b) => b.bonusPoints - a.bonusPoints || a.name.localeCompare(b.name, 'de'));
  let rank = 0, previous = null;
  rows.forEach((row,index) => { if (previous === null || row.bonusPoints !== previous) rank = index + 1; row.rank = rank; previous = row.bonusPoints; });
  return rows;
}

function renderBonusCompetition() {
  const rows = bonusRows();
  const body = document.querySelector('#bonus-body');
  const podium = document.querySelector('#bonus-podium');
  const notice = document.querySelector('#bonus-notice');
  if (!body || !podium || !notice) return;
  const hasPoints = rows.some(row => row.bonusPoints > 0);
  notice.innerHTML = hasPoints ? '<strong>Bonuswertung aktiv.</strong> Die Punkte werden der Gesamtwertung zugerechnet.' : '<strong>Noch keine Bonusfrage ausgewertet.</strong> Die Rangliste startet, sobald Kicktipp erste Saisonfragen auflöst.';
  podium.innerHTML = rows.slice(0,3).map((row,index) => `<article class="hs-podium-card place-${index+1}"><span>Platz ${row.rank}</span><strong>${esc(row.name)}</strong><small>${fmt(row.bonusPoints)} Bonuspunkte · ${row.correctAnswers} richtige Antworten</small></article>`).join('');
  body.innerHTML = rows.map(row => `<tr>${rowCell('Rang', esc(row.rank), 'hs-rank')}${rowCell('Spieler', profileButton(row.name), 'hs-player')}${rowCell('Richtige Antworten', fmt(row.correctAnswers))}${rowCell('Bonuspunkte', fmt(row.bonusPoints), 'hs-total')}</tr>`).join('');
}

function renderTeam(name) {
  const overallRows = [...(data.teams?.overall || [])].sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0));
  const overall = overallRows.find(row => row.name === name);
  const opponent = overallRows.find(row => row.name !== name);
  const matchday = (data.teams?.matchday || []).find(row => row.name === name);
  const opponentMatchday = (data.teams?.matchday || []).find(row => row.name !== name);
  const host = document.querySelector(`[data-team-name="${CSS.escape(name)}"]`);
  if (!host) return;

  const ownPoints = Number(overall?.totalPoints || 0);
  const opponentPoints = Number(opponent?.totalPoints || 0);
  const total = ownPoints + opponentPoints;
  const share = total > 0 ? Math.round((ownPoints / total) * 100) : 50;
  const delta = ownPoints - opponentPoints;
  const open = total <= 0;
  const duelState = open ? 'Mannschaftsduell noch ohne Wertung' : delta === 0 ? 'Punktgleiches Mannschaftsduell' : delta > 0 ? `${fmt(delta)} Punkte Vorsprung` : `${fmt(Math.abs(delta))} Punkte Rückstand`;
  const rankLabel = open ? '–' : overall?.rank ?? '–';

  host.innerHTML = `<div class="hs-team-hero"><div><div class="hs-eyebrow">Gruppierung</div><h2>${esc(name)}</h2><p class="hs-status">Gesamt- und Spieltagswertung dieser Gruppierung.</p></div><div class="hs-team-score">${fmt(ownPoints)}<small>Gesamtpunkte</small></div></div>
    <div class="hs-team-duel${open ? ' is-open' : ''}">
      <div class="hs-team-duel-head"><span>Mannschaftsduell</span><strong>${esc(duelState)}</strong></div>
      <div class="hs-team-duel-track" role="img" aria-label="${esc(name)}: ${share} Prozent der gemeinsamen Teampunkte"><span style="width:${share}%"></span></div>
      <div class="hs-team-duel-labels"><b>${esc(name)}</b><b>${esc(opponent?.name || 'Gegnerteam')}</b></div>
    </div>
    <div class="hs-team-stats"><article><span>Gesamtrang</span><strong>${esc(rankLabel)}</strong><small>${open ? 'Noch nicht gewertet' : 'Aktuelle Teamwertung'}</small></article><article><span>Spieltagsiege</span><strong>${fmt(overall?.matchdayWins)}</strong><small>Gewonnene Einzelspieltage</small></article><article><span>Bonuspunkte</span><strong>${fmt(overall?.bonusPoints)}</strong><small>Anteil an der Gesamtwertung</small></article><article><span>Aktueller Spieltag</span><strong>${fmt(matchday?.points)} Punkte</strong><small>${esc(data.meta?.matchday || 'Noch nicht festgelegt')}</small></article><article><span>Spieltagsrang</span><strong>${open ? '–' : esc(matchday?.matchdayRank ?? '–')}</strong><small>${Number(matchday?.points || 0) > Number(opponentMatchday?.points || 0) ? 'Aktuell vorn' : Number(matchday?.points || 0) < Number(opponentMatchday?.points || 0) ? 'Aktuell hinten' : 'Aktuell punktgleich'}</small></article><article><span>Abstand zum Gegner</span><strong>${open ? 'Noch offen' : `${fmt(Math.abs(delta))} Punkte`}</strong><small>${open || delta === 0 ? 'Kein Abstand' : delta > 0 ? 'Vorsprung' : 'Rückstand'}</small></article></div>`;
}

function recordCard(label, value, note, available) {
  return `<article class="hs-record-card ${available ? 'is-available' : 'is-pending'}">
    <div class="hs-record-head"><span>${esc(label)}</span><b>${available ? 'Aktiv' : 'Noch offen'}</b></div>
    <strong>${esc(value)}</strong><small>${esc(note)}</small><i aria-hidden="true"></i>
  </article>`;
}

function orderCard(title, holder, note, state) {
  return `<article class="hs-order-card is-${state}">
    <span>${esc(title)}</span><strong>${esc(holder)}</strong><small>${esc(note)}</small>
    <b class="hs-order-state">${state === 'awarded' ? 'Vergeben' : 'Gesperrt'}</b>
    <i class="hs-order-rivet" aria-hidden="true"></i>
  </article>`;
}


function confirmedHallEntries() {
  const entries = [];
  const add = (type, title, holder, detail) => {
    const name = String(holder || '').trim();
    if (!name || /noch offen|offen|keine einträge|sieger noch offen/i.test(name)) return;
    entries.push({ type, title, holder: name, detail: String(detail || '').trim() });
  };
  add('Titel', hallOfFame.aktuellerChampion?.titel || 'Champion', hallOfFame.aktuellerChampion?.name, `${hallOfFame.aktuellerChampion?.wettbewerb || 'Clubwettbewerb'} ${hallOfFame.aktuellerChampion?.jahr || ''}`.trim());
  add('Meisterschaft', 'Saisonmeister', hallOfFame.meister?.name, hallOfFame.meister?.saison || '');
  add('Pokal', 'DFB-Pokal', hallOfFame.dfbPokal?.offen ? '' : hallOfFame.dfbPokal?.name, hallOfFame.dfbPokal?.saison || '');
  add('Europapokal', 'Champions League', hallOfFame.championsLeague?.offen ? '' : hallOfFame.championsLeague?.name, hallOfFame.championsLeague?.saison || '');
  Object.values(hallOfFame.rekorde || {}).forEach(record => {
    if (!record || record.offen) return;
    add('Rekord', record.label || 'Bestmarke', record.name, record.wert ? `${record.wert}` : '');
  });
  return entries;
}

function renderLegacyArchive() {
  const host = document.querySelector('#legacy-grid');
  const note = document.querySelector('#legacy-note');
  if (!host) return;
  const entries = confirmedHallEntries();
  if (!entries.length) {
    host.innerHTML = '<div class="hs-legacy-empty"><strong>Chronik noch leer</strong><span>Die ersten Titel und Bestmarken werden hier nachgetragen.</span></div>';
    if (note) note.textContent = 'Die Clubchronik wächst mit den abgeschlossenen Wettbewerben.';
    return;
  }
  host.innerHTML = entries.map(entry => `<article class="hs-legacy-card"><span>${esc(entry.type)}</span><strong>${esc(entry.title)}</strong><b>${profileButton(entry.holder)}</b><small>${esc(entry.detail || 'Bestätigter Chronikeintrag')}</small></article>`).join('');
  if (note) note.textContent = `${entries.length} Titel und Bestmarken im Logbuch.`;
}

function renderPlayerLegacy(name) {
  const section = document.querySelector('#player-legacy');
  const grid = document.querySelector('#player-legacy-grid');
  const count = document.querySelector('#player-legacy-count');
  if (!section || !grid || !count) return;
  const entries = confirmedHallEntries().filter(entry => entry.holder.localeCompare(String(name), 'de', { sensitivity: 'base' }) === 0);
  section.hidden = entries.length === 0;
  count.textContent = `${entries.length} ${entries.length === 1 ? 'Eintrag' : 'Einträge'}`;
  grid.innerHTML = entries.map(entry => `<article><span>${esc(entry.type)}</span><strong>${esc(entry.title)}</strong><small>${esc(entry.detail || 'Bestätigter Chronikeintrag')}</small></article>`).join('');
}

function renderRecords() {
  const individuals = officialRows('overall');
  const matchday = officialRows('matchday');
  const teams = [...(data.teams?.overall || [])].sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0));
  const records = data.records || {};
  const historyRows = Array.isArray(data.history) ? data.history : [];
  const open = competitionStatus('overall').open;
  const hasMatchday = matchday.some(row => Number(row.points || 0) > 0);
  const teamsScored = teams.some(row => Number(row.totalPoints || 0) > 0);

  const readiness = [
    ['Gesamtwertung', !open, !open ? 'Aktiv' : 'Wartet auf erste Punkte'],
    ['Spieltagswertung', hasMatchday, hasMatchday ? 'Aktiv' : 'Wartet auf ersten Spieltag'],
    ['Teamwertung', teamsScored, teamsScored ? 'Aktiv' : 'Wartet auf Teampunkte'],
    ['Saisonhistorie', historyRows.length > 0, historyRows.length ? `${historyRows.length} archivierte Stände` : 'Noch kein Archivstand'],
    ['Detailorden', Boolean(data.orders || data.tipDetails), data.orders || data.tipDetails ? 'Detaildaten vorhanden' : 'Detaildaten fehlen'],
    ['Datenexport', Boolean(data.meta?.exportDate), data.meta?.exportDate ? `Stand ${data.meta.exportDate}` : 'Exportdatum fehlt']
  ];
  const readinessHost = document.querySelector('#readiness-grid');
  if (readinessHost) readinessHost.innerHTML = readiness.map(([label, ready, text]) => `<article class="hs-readiness-card ${ready ? 'is-ready' : 'is-waiting'}"><span>${esc(label)}</span><strong>${ready ? 'Bereit' : 'Wartet'}</strong><small>${esc(text)}</small><i aria-hidden="true"></i></article>`).join('');
  const activeModules = readiness.filter(([, ready]) => ready).length;
  const exportLabel = data.meta?.exportDate || 'Noch offen';
  const exportEl = document.querySelector('#records-export');
  const modulesEl = document.querySelector('#records-active-modules');
  if (exportEl) exportEl.textContent = exportLabel;
  if (modulesEl) modulesEl.textContent = `${activeModules} von ${readiness.length}`;

  const recordHtml = [
    recordCard('Tabellenführer', open ? 'Noch offen' : `${individuals[0].name} · ${fmt(individuals[0].totalPoints)}`, open ? 'Wird nach den ersten Punkten vergeben.' : 'Aktueller Spitzenreiter der Gesamtwertung.', !open),
    recordCard('Höchster Spieltag', records.highestMatchdayScore ? `${records.highestMatchdayScore.name} · ${fmt(records.highestMatchdayScore.points)}` : 'Noch offen', records.highestMatchdayScore ? 'Bester bisheriger Einzelspieltag.' : 'Benötigt einen abgeschlossenen Spieltag.', Boolean(records.highestMatchdayScore)),
    recordCard('Meiste Spieltagssiege', records.mostMatchdayWins ? `${records.mostMatchdayWins.name} · ${fmt(records.mostMatchdayWins.wins)}` : 'Noch offen', records.mostMatchdayWins ? 'Meiste gewonnene Einzelspieltage.' : 'Wird mit den Spieltagsergebnissen aufgebaut.', Boolean(records.mostMatchdayWins)),
    recordCard('Vorsprung an der Spitze', open ? 'Noch offen' : `${fmt(records.leadMargin)} Punkte`, open ? 'Noch keine belastbare Rangfolge.' : 'Abstand zwischen Platz 1 und Platz 2.', !open),
    recordCard('Bestes Team', records.bestTeam ? `${records.bestTeam.name} · ${fmt(records.bestTeam.points)}` : teamsScored ? 'Gleichstand' : 'Noch offen', records.bestTeam ? 'Führende Gruppierung.' : teamsScored ? 'Beide Teams sind punktgleich.' : 'Noch keine Teampunkte vorhanden.', Boolean(records.bestTeam) || teamsScored),
    recordCard('Teilnehmer', `${individuals.length} Spieler`, 'Aktuell im Highscore geführte Einzelspieler.', individuals.length > 0)
  ].join('');
  document.querySelector('#record-grid').innerHTML = recordHtml;

  const captain = matchday[0] && Number(matchday[0].points) > 0 ? `${matchday[0].name} · ${fmt(matchday[0].points)} Punkte` : 'Noch nicht vergeben';
  const orders = [
    orderCard('Kapitän der Woche', captain, hasMatchday ? 'Bester Spieler des aktuellen Einzelspieltags.' : 'Freischaltung nach dem ersten gewerteten Spieltag.', hasMatchday ? 'awarded' : 'locked'),
    orderCard('Volltrefferkönig', 'Noch nicht berechenbar', 'Benötigt Detaildaten zu exakten Ergebnistipps.', 'locked'),
    orderCard('Aufholjäger', 'Noch nicht berechenbar', historyRows.length >= 2 ? 'Archivstände vorhanden, aber Bewegungsdaten fehlen noch.' : 'Benötigt mindestens zwei archivierte Rangstände.', 'locked'),
    orderCard('Heißeste Serie', 'Noch nicht berechenbar', 'Benötigt mehrere abgeschlossene Einzelspieltage.', 'locked'),
    orderCard('Überraschung des Spieltags', 'Noch nicht berechenbar', 'Benötigt Tippdetails und belastbare Marktquoten.', 'locked'),
    orderCard('Admiral des Monats', 'Noch nicht vergeben', 'Freischaltung nach einem vollständigen Kalendermonat.', 'locked')
  ];
  document.querySelector('#order-grid').innerHTML = orders.join('');

  renderLegacyArchive();
  renderSeasonTrend(historyRows);

  document.querySelector('#history-grid').innerHTML = historyRows.length
    ? `<div class="hs-history-head"><span>Spieltag</span><span>Führender Spieler</span><span>Punktestand</span></div>${historyRows.map((row, index) => `<div class="hs-history-row"><span>${esc(row.matchday)}</span><strong>${esc(row.leader)}</strong><b>${fmt(row.points)} Punkte</b><i aria-hidden="true">${index + 1}</i></div>`).join('')}`
    : '<div class="hs-history-empty"><strong>Logbuch noch leer</strong><p>Die Saisonhistorie wird erst belastbar, wenn Spieltagsstände archiviert werden. Bis dahin wird bewusst kein Verlauf simuliert.</p><span>Benötigt: mindestens einen abgeschlossenen und gespeicherten Spieltag</span></div>';
}

function calculateFieldAnalysis() {
  const rows = officialRows('overall');
  const scored = rows.filter(row => Number(row.totalPoints || 0) > 0);
  const scores = scored.map(row => Number(row.totalPoints || 0)).sort((a, b) => a - b);
  const total = rows.length;
  if (!scored.length) return { ready: false, total, scored: 0, zones: [] };

  const sum = scores.reduce((acc, value) => acc + value, 0);
  const average = sum / scores.length;
  const middle = Math.floor(scores.length / 2);
  const median = scores.length % 2 ? scores[middle] : (scores[middle - 1] + scores[middle]) / 2;
  const leader = Math.max(...scores);
  const last = Math.min(...scores);
  const variance = scores.reduce((acc, value) => acc + ((value - average) ** 2), 0) / scores.length;
  const deviation = Math.sqrt(variance);
  const sorted = [...scored].sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0));
  const topLimit = Math.max(1, Math.ceil(sorted.length * .1));
  const frontLimit = Math.max(topLimit + 1, Math.ceil(sorted.length * .35));
  const middleLimit = Math.max(frontLimit + 1, Math.ceil(sorted.length * .7));
  const zones = [
    { label: 'Spitzengruppe', count: sorted.slice(0, topLimit).length },
    { label: 'Vorderes Feld', count: sorted.slice(topLimit, frontLimit).length },
    { label: 'Mittelfeld', count: sorted.slice(frontLimit, middleLimit).length },
    { label: 'Verfolgerfeld', count: sorted.slice(middleLimit).length }
  ].filter(zone => zone.count > 0);
  return { ready: true, total, scored: scored.length, average, median, leader, last, spread: leader - last, deviation, zones };
}

function renderFieldAnalysis() {
  const status = document.querySelector('#field-analysis-status');
  const metrics = document.querySelector('#field-analysis-metrics');
  const chart = document.querySelector('#field-zone-chart');
  const note = document.querySelector('#field-analysis-note');
  if (!status || !metrics || !chart || !note) return;
  const analysis = calculateFieldAnalysis();
  if (!analysis.ready) {
    status.className = 'hs-field-status is-waiting';
    status.innerHTML = `<strong>Bereit für den Saisonstart</strong><span>${analysis.total} registrierte Spieler, aber noch keine bestätigten Punkte.</span>`;
    metrics.innerHTML = [
      ['Gewertete Spieler', '0', `${analysis.total} im Register`],
      ['Durchschnitt', '–', 'Noch nicht berechenbar'],
      ['Median', '–', 'Noch nicht berechenbar'],
      ['Punktespanne', '–', 'Noch keine Rangabstände']
    ].map(([label,value,small]) => `<article><span>${label}</span><strong>${value}</strong><small>${small}</small></article>`).join('');
    chart.innerHTML = '<div class="hs-zone-empty"><strong>Noch keine Leistungsverteilung</strong><span>Das Diagramm wird nach der ersten Punktevergabe automatisch aktiviert.</span></div>';
    note.textContent = 'Die Feldanalyse startet automatisch nach der ersten Punktevergabe.';
    return;
  }
  status.className = 'hs-field-status is-ready';
  status.innerHTML = `<strong>${analysis.scored} von ${analysis.total} Spielern gewertet</strong><span>Die Kennzahlen basieren auf dem aktuellen bestätigten Gesamtstand.</span>`;
  metrics.innerHTML = [
    ['Durchschnitt', `${fmt(analysis.average)} Pkt.`, 'Arithmetisches Mittel'],
    ['Median', `${fmt(analysis.median)} Pkt.`, 'Mitte des Feldes'],
    ['Punktespanne', `${fmt(analysis.spread)} Pkt.`, `${fmt(analysis.last)} bis ${fmt(analysis.leader)}`],
    ['Streuung', `${fmt(analysis.deviation)} Pkt.`, 'Standardabweichung']
  ].map(([label,value,small]) => `<article><span>${label}</span><strong>${value}</strong><small>${small}</small></article>`).join('');
  const max = Math.max(...analysis.zones.map(zone => zone.count), 1);
  chart.innerHTML = analysis.zones.map(zone => `<div class="hs-zone-row"><span>${esc(zone.label)}</span><div><i style="--zone-width:${Math.max(8, Math.round(zone.count / max * 100))}%"></i></div><strong>${zone.count}</strong></div>`).join('');
  note.textContent = 'Die Leistungszonen teilen ausschließlich die aktuell gewerteten Spieler nach ihrer Position im Feld ein; sie sind keine Prognose.';
}

function resetRankingControls() {
  state.query = '';
  state.page = 1;
  state.pageSize = 25;
  state.sortKey = 'official';
  state.sortDir = 'asc';
  const search = document.querySelector('#player-search');
  const size = document.querySelector('#page-size');
  if (search) search.value = '';
  if (size) size.value = '25';
  renderIndividual();
  search?.focus();
}

function init() {
  loadSavedState();
  const individuals = officialRows('overall');
  const matchday = officialRows('matchday');
  const teams = [...(data.teams?.overall || [])].sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0));
  const individualStatus = competitionStatus('overall');

  document.querySelector('#summary-leader').textContent = individualStatus.open ? 'Noch offen' : individuals[0]?.name || '–';
  document.querySelector('#summary-leader-points').textContent = individualStatus.open ? 'Saison noch ohne Wertung' : `${fmt(individuals[0]?.totalPoints)} Punkte`;
  document.querySelector('#summary-matchday').textContent = data.meta?.matchday || '–';
  document.querySelector('#summary-matchday-winner').textContent = matchday[0] && Number(matchday[0].points) > 0 ? `${matchday[0].name} · ${fmt(matchday[0].points)} Punkte` : 'Noch ohne Wertung';
  const teamsTied = teams.length < 2 || Number(teams[0]?.totalPoints || 0) === Number(teams[1]?.totalPoints || 0);
  document.querySelector('#summary-team').textContent = teamsTied ? 'Gleichstand' : teams[0].name;
  document.querySelector('#summary-team-points').textContent = teamsTied && Number(teams[0]?.totalPoints || 0) === 0 ? 'Noch ohne Wertung' : `${fmt(teams[0]?.totalPoints)} Punkte`;
  document.querySelector('#summary-participants').textContent = `${individuals.length}`;

  document.querySelectorAll('[data-individual-view]').forEach(item => classListToggle(item, item.dataset.individualView === state.view));
  const pageSizeSelect = document.querySelector('#page-size');
  if (pageSizeSelect) pageSizeSelect.value = String(state.pageSize);
  renderIndividual();
  renderBonusCompetition();
  renderTeam('Old Smugglers Team');
  renderTeam('New Smugglers Team');
  renderRecords();
  renderFieldAnalysis();

  const profileDialog = document.querySelector('#player-dialog');
  const compareSelect = document.querySelector('#player-compare-select');
  const compareButton = document.querySelector('#player-compare-start');
  compareSelect?.addEventListener('change', () => { compareButton.disabled = !compareSelect.value; });
  compareButton?.addEventListener('click', () => renderPlayerComparison(activeProfileName, compareSelect?.value));
  document.querySelector('#player-dialog-close')?.addEventListener('click', () => profileDialog?.close());
  profileDialog?.addEventListener('click', event => { if (event.target === profileDialog) profileDialog.close(); });

  document.querySelectorAll('.hs-main-tab').forEach(tab => {
    tab.addEventListener('click', () => setSection(tab.dataset.section));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...document.querySelectorAll('.hs-main-tab')];
      const current = tabs.indexOf(tab);
      let next = current;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      setSection(tabs[next].dataset.section);
    });
  });

  document.querySelectorAll('[data-individual-view]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-individual-view]').forEach(item => classListToggle(item, item === button));
    state.view = button.dataset.individualView;
    state.page = 1;
    state.sortKey = 'official';
    state.sortDir = 'asc';
    renderIndividual();
  }));

  document.querySelector('#player-search').addEventListener('input', event => {
    state.query = event.target.value;
    state.page = 1;
    renderIndividual();
  });
  document.querySelector('#page-size').addEventListener('change', event => {
    state.pageSize = Number(event.target.value);
    state.page = 1;
    renderIndividual();
  });
  document.querySelector('#ranking-reset').addEventListener('click', resetRankingControls);
  document.querySelector('#page-prev').addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      renderIndividual();
    }
  });
  document.querySelector('#page-next').addEventListener('click', () => {
    state.page++;
    renderIndividual();
  });

  const requestedSection = location.hash.replace('#', '');
  if (['individual', 'bonus', 'old-team', 'new-team', 'records'].includes(requestedSection)) setSection(requestedSection);
}

function classListToggle(element, active) {
  element.classList.toggle('is-active', active);
  element.setAttribute('aria-pressed', String(active));
}

function loadHighscoreData() {
  setSystemStatus('loading', 'Highscore wird geladen', 'Die aktuellen Ranglisten werden vorbereitet.');
  Promise.all([
    (window.OSCDataRegistry ? window.OSCDataRegistry.url('highscore') : Promise.resolve('./highscore.json')).then(url => fetch(url, { cache: 'no-store' })).then(response => {
      if (!response.ok) throw Error(`highscore.json: HTTP ${response.status}`);
      return response.json();
    }),
    (window.OSCDataRegistry ? window.OSCDataRegistry.url('hallOfFame') : Promise.resolve('./hall-of-fame.json')).then(url => fetch(url, { cache: 'no-store' })).then(response => response.ok ? response.json() : {}),
    (window.OSCDataRegistry ? window.OSCDataRegistry.url('punkte') : Promise.resolve('./punkte.json')).then(url => fetch(url, { cache: 'no-store' })).then(response => response.ok ? response.json() : {}).catch(() => ({})),
    (window.OSCDataRegistry ? window.OSCDataRegistry.url('teilnehmer') : Promise.resolve('./teilnehmer.json')).then(url => fetch(url, { cache: 'no-store' })).then(response => response.ok ? response.json() : {}).catch(() => ({}))
  ])
    .then(([payload, hallPayload, pointsPayload, participantPayload]) => {
      const issues = validatePayload(payload);
      if (issues.length) throw Error(issues.join(' · '));
      pointsData = pointsPayload && typeof pointsPayload === 'object' ? pointsPayload : {};
      participantsData = participantPayload && typeof participantPayload === 'object' ? participantPayload : {};
      // I-03: highscore.json is the authoritative, fully prepared ranking source.
      // points.json is loaded only for supplemental analyses and must not replace,
      // re-sort or recalculate official Kicktipp ranks.
      data = structuredClone(payload);
      highscoreSourceMode = 'register';
      hallOfFame = hallPayload && typeof hallPayload === 'object' ? hallPayload : {};
      init();
      const count = data.individual?.overall?.length || 0;
      setSystemStatus('ready', 'Highscore geladen', `${count} Spieler und alle verfügbaren Statistikmodule wurden eingelesen.`);
      window.setTimeout(() => {
        const el = document.querySelector('#hs-system-status');
        if (el?.classList.contains('is-ready')) el.hidden = true;
      }, 3500);
    })
    .catch(error => {
      const body = document.querySelector('#individual-body');
      if (body) body.innerHTML = '<tr><td colspan="6" class="hs-empty"><strong>Highscore nicht verfügbar</strong><span>Die zentrale Datendatei konnte nicht gelesen werden.</span></td></tr>';
      const notice = document.querySelector('#ranking-notice');
      if (notice) notice.innerHTML = '<strong>Datenfehler.</strong> Die Rangliste ist momentan nicht verfügbar.';
      setSystemStatus('error', 'Highscore konnte nicht geladen werden', 'Die Rangliste ist momentan nicht verfügbar. Bitte versuche es später erneut.', true);
      console.error(error);
    });
}

window.addEventListener('hashchange', () => {
  const requested = location.hash.replace('#', '');
  if (['individual', 'bonus', 'old-team', 'new-team', 'records'].includes(requested)) setSection(requested);
});

loadHighscoreData();
