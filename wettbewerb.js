(() => {
  "use strict";

  const fileName = location.pathname.split("/").pop() || "bundesliga.html";
  const slug = fileName.replace(/\.html?$/i, "") || "bundesliga";
  const jsonUrl = `./${slug}.json`;
  let gameDataUrl = "./spieldaten.json";
  let teamDataUrl = "./teams.json";
  let bundesligaTableUrl = "./bundesliga-tabelle.json";

  let competitionConfigUrl = "./wettbewerbe.json";
  const DEFAULT_COMPETITIONS = [
    { id: "bundesliga", label: "Bundesliga", page: "bundesliga.html", filter: { type: "wettbewerb", value: "bundesliga" }, scheduleTitle: "Spiele der Bundesliga" },
    { id: "dfb-pokal", label: "DFB-Pokal", page: "dfb-pokal.html", filter: { type: "wettbewerb", value: "dfb-pokal" }, scheduleTitle: "Spiele des DFB-Pokals" },
    { id: "champions-league", label: "Champions League", page: "champions-league.html", filter: { type: "wettbewerb", value: "champions-league" }, scheduleTitle: "Spiele der Champions League" },
    { id: "europa-league", label: "Europa League", page: "europa-league.html", filter: { type: "wettbewerb", value: "europa-league" }, scheduleTitle: "Spiele der Europa League" },
    { id: "relegation", label: "Relegation", page: "relegation.html", filter: { type: "wettbewerb", value: "relegation" }, scheduleTitle: "Spiele der Relegation" },
    { id: "dynamo-dresden", label: "Dynamo Dresden", page: "dynamo-dresden.html", filter: { type: "sonderwertung", value: "smugglerauftrag" }, scheduleTitle: "Ausgewählte Smuggleraufträge" },
    { id: "piratenkodex", label: "Piratenkodex", page: "piratenkodex.html", filter: { type: "sonderwertung", value: "piratenkodex" }, scheduleTitle: "Ausgewählte Spiele des Piratenkodex" },
    { id: "weihnachtsregatta", label: "Weihnachtsregatta", page: "weihnachtsregatta.html", filter: { type: "sonderwertung", value: "weihnachtsregatta" }, scheduleTitle: "Spiele der Weihnachtsregatta" }
  ];
  let competitionDefinitions = DEFAULT_COMPETITIONS;
  let centralValidation = null;
  let centralModel = null;
  let currentTeamData = { teams: [] };

  function competitionDefinition(id) {
    return competitionDefinitions.find(item => item && item.id === id) || DEFAULT_COMPETITIONS.find(item => item.id === id) || null;
  }

  const $ = (id) => document.getElementById(id);
  const text = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.textContent = value || "";
    el.classList.toggle("is-hidden", !value);
  };

  const safeArray = (value) => Array.isArray(value) ? value : [];

  function formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return value || "";
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }

  function formatResult(match) {
    const hasHomeScore = Number.isFinite(match.heimtore);
    const hasAwayScore = Number.isFinite(match.auswaertstore);
    if (hasHomeScore && hasAwayScore) return `${match.heimtore}:${match.auswaertstore}`;
    return match.status || "";
  }


  function allCentralGames(data) {
    return Array.isArray(data && data.saisons)
      ? data.saisons.flatMap(season => safeArray(season && season.spiele))
      : safeArray(data && data.spiele);
  }

  function numericScore(value) {
    return Number.isFinite(value) ? value : null;
  }

  function calculateBundesligaTable(gameData, teamData, tableData) {
    const teamLookup = createTeamLookup(teamData);
    const games = allCentralGames(gameData).filter(match => match && match.wettbewerb === "bundesliga");
    const rows = new Map();

    const ensureTeam = (teamId, fallback) => {
      if (!teamId) return null;
      if (!rows.has(teamId)) {
        rows.set(teamId, {
          id: teamId,
          name: teamName(teamLookup, teamId, fallback),
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        });
      }
      return rows.get(teamId);
    };

    games.forEach(match => {
      ensureTeam(match.heimTeamId, match.heim);
      ensureTeam(match.auswaertsTeamId, match.auswaerts);

      const homeGoals = numericScore(match.heimtore);
      const awayGoals = numericScore(match.auswaertstore);
      if (homeGoals === null || awayGoals === null) return;

      const home = ensureTeam(match.heimTeamId, match.heim);
      const away = ensureTeam(match.auswaertsTeamId, match.auswaerts);
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;
      home.goalsFor += homeGoals;
      home.goalsAgainst += awayGoals;
      away.goalsFor += awayGoals;
      away.goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        home.wins += 1;
        away.losses += 1;
        home.points += 3;
      } else if (homeGoals < awayGoals) {
        away.wins += 1;
        home.losses += 1;
        away.points += 3;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

    const manualRows = safeArray(tableData && tableData.teams);
    if (manualRows.length) {
      manualRows.forEach(team => {
        if (!team || !team.id) return;
        rows.set(team.id, {
          id: team.id,
          name: teamName(teamLookup, team.id, team.name),
          played: Number(team.spiele || team.played || 0),
          wins: Number(team.siege || team.wins || 0),
          draws: Number(team.unentschieden || team.draws || 0),
          losses: Number(team.niederlagen || team.losses || 0),
          goalsFor: Number(team.tore || team.goalsFor || 0),
          goalsAgainst: Number(team.gegentore || team.goalsAgainst || 0),
          points: Number(team.punkte || team.points || 0)
        });
      });
    }

    const sorted = [...rows.values()].sort((a, b) => {
      const pointDiff = b.points - a.points;
      if (pointDiff) return pointDiff;
      const goalDiff = (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
      if (goalDiff) return goalDiff;
      const goalsDiff = b.goalsFor - a.goalsFor;
      if (goalsDiff) return goalsDiff;
      return a.name.localeCompare(b.name, "de");
    });

    return {
      rows: sorted,
      playedMatches: games.filter(match => numericScore(match.heimtore) !== null && numericScore(match.auswaertstore) !== null).length,
      status: tableData && tableData.status ? tableData.status : ""
    };
  }

  function renderBundesligaTable(gameData, teamData, tableData, root) {
    const standings = calculateBundesligaTable(gameData, teamData, tableData);
    const article = document.createElement("section");
    article.className = "dynamic-section standings-section";

    const headingRow = document.createElement("div");
    headingRow.className = "section-heading-row";
    const heading = document.createElement("h2");
    heading.textContent = "Bundesliga-Tabelle";
    const badge = document.createElement("span");
    badge.className = "data-status-badge";
    badge.textContent = standings.playedMatches
      ? `${standings.playedMatches} Spiele ausgewertet`
      : "Saison noch nicht gestartet";
    headingRow.append(heading, badge);
    article.appendChild(headingRow);

    if (!standings.rows.length) {
      const note = document.createElement("p");
      note.className = "data-note";
      note.textContent = standings.status || "Die Tabelle erscheint automatisch, sobald Mannschaften und Ergebnisse vorliegen.";
      article.appendChild(note);
      root.appendChild(article);
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    const table = document.createElement("table");
    table.className = "data-table standings-table";
    table.innerHTML = "<thead><tr><th>Pl.</th><th>Verein</th><th>Sp.</th><th>S</th><th>U</th><th>N</th><th>Tore</th><th>Diff.</th><th>Pkt.</th></tr></thead>";
    const tbody = document.createElement("tbody");

    standings.rows.forEach((team, index) => {
      const tr = document.createElement("tr");
      const goalDifference = team.goalsFor - team.goalsAgainst;
      const values = [
        index + 1,
        team.name,
        team.played,
        team.wins,
        team.draws,
        team.losses,
        `${team.goalsFor}:${team.goalsAgainst}`,
        goalDifference > 0 ? `+${goalDifference}` : String(goalDifference),
        team.points
      ];
      values.forEach((value, columnIndex) => {
        const cell = document.createElement(columnIndex === 0 ? "th" : "td");
        if (columnIndex === 0) cell.scope = "row";
        if (columnIndex === 1) {
          cell.appendChild(createTeamIdentity(team.id, team.name, "team-identity--table"));
        } else {
          cell.textContent = value;
        }
        tr.appendChild(cell);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    article.appendChild(wrapper);

    const note = document.createElement("p");
    note.className = "data-note";
    note.textContent = standings.playedMatches
      ? "Die Tabelle wird automatisch aus den in spieldaten.json hinterlegten Endergebnissen berechnet."
      : "Die Mannschaften sind vorbereitet. Ergebnisse und Tabelle werden nach Saisonstart automatisch aus spieldaten.json aufgebaut.";
    article.appendChild(note);
    root.appendChild(article);
  }


  function completedBundesligaGames(gameData) {
    return allCentralGames(gameData)
      .filter(match => match && match.wettbewerb === "bundesliga")
      .filter(match => numericScore(match.heimtore) !== null && numericScore(match.auswaertstore) !== null)
      .sort((a, b) => `${a.datum || ""}T${a.anstoss || ""}`.localeCompare(`${b.datum || ""}T${b.anstoss || ""}`));
  }

  function calculateBundesligaStatistics(gameData, teamData) {
    const games = completedBundesligaGames(gameData);
    const teamLookup = createTeamLookup(teamData);
    const teams = new Map();

    const ensure = (id, fallback) => {
      if (!id) return null;
      if (!teams.has(id)) {
        teams.set(id, {
          id,
          name: teamName(teamLookup, id, fallback),
          played: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          homePlayed: 0,
          homePoints: 0,
          awayPlayed: 0,
          awayPoints: 0,
          cleanSheets: 0,
          currentRunType: null,
          currentRun: 0,
          longestWinRun: 0,
          form: []
        });
      }
      return teams.get(id);
    };

    let totalGoals = 0;
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let biggestWin = null;
    let highestScoring = null;

    games.forEach(match => {
      const hg = numericScore(match.heimtore);
      const ag = numericScore(match.auswaertstore);
      const home = ensure(match.heimTeamId, match.heim);
      const away = ensure(match.auswaertsTeamId, match.auswaerts);
      if (!home || !away) return;

      totalGoals += hg + ag;
      home.played += 1;
      away.played += 1;
      home.homePlayed += 1;
      away.awayPlayed += 1;
      home.goalsFor += hg;
      home.goalsAgainst += ag;
      away.goalsFor += ag;
      away.goalsAgainst += hg;
      if (ag === 0) home.cleanSheets += 1;
      if (hg === 0) away.cleanSheets += 1;

      let homeResult = "U";
      let awayResult = "U";
      if (hg > ag) {
        homeWins += 1;
        home.points += 3;
        home.homePoints += 3;
        homeResult = "S";
        awayResult = "N";
      } else if (hg < ag) {
        awayWins += 1;
        away.points += 3;
        away.awayPoints += 3;
        homeResult = "N";
        awayResult = "S";
      } else {
        draws += 1;
        home.points += 1;
        away.points += 1;
        home.homePoints += 1;
        away.awayPoints += 1;
      }

      [[home, homeResult], [away, awayResult]].forEach(([team, result]) => {
        team.form.push(result);
        if (team.form.length > 5) team.form.shift();
        if (result === "S") {
          team.currentRun = team.currentRunType === "S" ? team.currentRun + 1 : 1;
          team.currentRunType = "S";
          team.longestWinRun = Math.max(team.longestWinRun, team.currentRun);
        } else {
          team.currentRunType = result;
          team.currentRun = 1;
        }
      });

      const difference = Math.abs(hg - ag);
      if (!biggestWin || difference > biggestWin.difference || (difference === biggestWin.difference && hg + ag > biggestWin.totalGoals)) {
        biggestWin = { match, difference, totalGoals: hg + ag };
      }
      if (!highestScoring || hg + ag > highestScoring.totalGoals) {
        highestScoring = { match, totalGoals: hg + ag };
      }
    });

    const teamRows = [...teams.values()];
    const bestBy = (selector) => teamRows.length
      ? [...teamRows].sort((a, b) => selector(b) - selector(a) || b.points - a.points || a.name.localeCompare(b.name, "de"))[0]
      : null;

    return {
      games,
      totalGoals,
      averageGoals: games.length ? totalGoals / games.length : 0,
      homeWins,
      draws,
      awayWins,
      biggestWin,
      highestScoring,
      bestAttack: bestBy(team => team.goalsFor),
      bestDefense: bestBy(team => -team.goalsAgainst),
      bestHome: bestBy(team => team.homePlayed ? team.homePoints / team.homePlayed : -1),
      bestAway: bestBy(team => team.awayPlayed ? team.awayPoints / team.awayPlayed : -1),
      mostCleanSheets: bestBy(team => team.cleanSheets),
      longestWinRun: bestBy(team => team.longestWinRun),
      formRows: [...teamRows].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || a.name.localeCompare(b.name, "de"))
    };
  }

  function pairingText(match, teamData) {
    if (!match) return "–";
    const lookup = createTeamLookup(teamData);
    const home = teamName(lookup, match.heimTeamId, match.heim);
    const away = teamName(lookup, match.auswaertsTeamId, match.auswaerts);
    return `${home} – ${away} ${match.heimtore}:${match.auswaertstore}`;
  }

  function createStatCard(label, value, detail = "") {
    const card = document.createElement("article");
    card.className = "season-stat-card";
    const labelEl = document.createElement("span");
    labelEl.className = "season-stat-label";
    labelEl.textContent = label;
    const valueEl = document.createElement("strong");
    valueEl.textContent = value;
    card.append(labelEl, valueEl);
    if (detail) {
      const detailEl = document.createElement("small");
      detailEl.textContent = detail;
      card.appendChild(detailEl);
    }
    return card;
  }

  function renderBundesligaStatistics(gameData, teamData, root) {
    const stats = calculateBundesligaStatistics(gameData, teamData);
    const section = document.createElement("section");
    section.className = "dynamic-section bundesliga-statistics";

    const heading = document.createElement("h2");
    heading.textContent = "Saisonstatistik und Rekorde";
    section.appendChild(heading);

    if (!stats.games.length) {
      const empty = document.createElement("div");
      empty.className = "statistics-empty";
      empty.innerHTML = "<strong>Bereit für den Saisonstart</strong><span>Sobald Endergebnisse in spieldaten.json eingetragen sind, erscheinen hier automatisch Torstatistik, Form, Heim-/Auswärtswerte und Saisonrekorde.</span>";
      section.appendChild(empty);
      root.appendChild(section);
      return;
    }

    const overview = document.createElement("div");
    overview.className = "season-stat-grid";
    overview.append(
      createStatCard("Ausgewertete Spiele", String(stats.games.length)),
      createStatCard("Tore", String(stats.totalGoals), `${stats.averageGoals.toFixed(2).replace(".", ",")} pro Spiel`),
      createStatCard("Heimsiege", String(stats.homeWins)),
      createStatCard("Unentschieden", String(stats.draws)),
      createStatCard("Auswärtssiege", String(stats.awayWins))
    );
    section.appendChild(overview);

    const records = document.createElement("div");
    records.className = "record-grid";
    const recordItems = [
      ["Beste Offensive", stats.bestAttack, stats.bestAttack ? `${stats.bestAttack.goalsFor} Tore` : ""],
      ["Beste Defensive", stats.bestDefense, stats.bestDefense ? `${stats.bestDefense.goalsAgainst} Gegentore` : ""],
      ["Heimstärkstes Team", stats.bestHome, stats.bestHome ? `${stats.bestHome.homePoints} Punkte aus ${stats.bestHome.homePlayed} Spielen` : ""],
      ["Auswärtsstärkstes Team", stats.bestAway, stats.bestAway ? `${stats.bestAway.awayPoints} Punkte aus ${stats.bestAway.awayPlayed} Spielen` : ""],
      ["Meiste Zu-null-Spiele", stats.mostCleanSheets, stats.mostCleanSheets ? `${stats.mostCleanSheets.cleanSheets}` : ""],
      ["Längste Siegesserie", stats.longestWinRun, stats.longestWinRun ? `${stats.longestWinRun.longestWinRun} Siege` : ""]
    ];
    recordItems.forEach(([label, team, detail]) => records.appendChild(createStatCard(label, team ? team.name : "–", detail)));
    section.appendChild(records);

    const matchRecords = document.createElement("div");
    matchRecords.className = "match-records";
    matchRecords.append(
      createStatCard("Höchster Sieg", stats.biggestWin ? pairingText(stats.biggestWin.match, teamData) : "–", stats.biggestWin ? `${stats.biggestWin.difference} Tore Unterschied` : ""),
      createStatCard("Torreichstes Spiel", stats.highestScoring ? pairingText(stats.highestScoring.match, teamData) : "–", stats.highestScoring ? `${stats.highestScoring.totalGoals} Tore` : "")
    );
    section.appendChild(matchRecords);

    const formHeading = document.createElement("h3");
    formHeading.textContent = "Form der letzten fünf Ligaspiele";
    section.appendChild(formHeading);
    const formWrapper = document.createElement("div");
    formWrapper.className = "table-scroll";
    const table = document.createElement("table");
    table.className = "data-table form-table";
    table.innerHTML = "<thead><tr><th>Verein</th><th>Form</th><th>Punkte</th><th>Tore</th></tr></thead>";
    const tbody = document.createElement("tbody");
    stats.formRows.forEach(team => {
      const row = document.createElement("tr");
      const teamCell = document.createElement("td");
      teamCell.appendChild(createTeamIdentity(team.id, team.name, "team-identity--table"));
      const formCell = document.createElement("td");
      const form = document.createElement("div");
      form.className = "form-badges";
      team.form.forEach(result => {
        const badge = document.createElement("span");
        badge.className = `form-badge form-${result.toLowerCase()}`;
        badge.textContent = result;
        form.appendChild(badge);
      });
      formCell.appendChild(form);
      const pointsCell = document.createElement("td");
      pointsCell.textContent = String(team.points);
      const goalsCell = document.createElement("td");
      goalsCell.textContent = `${team.goalsFor}:${team.goalsAgainst}`;
      row.append(teamCell, formCell, pointsCell, goalsCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    formWrapper.appendChild(table);
    section.appendChild(formWrapper);

    const note = document.createElement("p");
    note.className = "data-note";
    note.textContent = "Die Statistik wird nach jedem eingetragenen Bundesliga-Ergebnis automatisch aktualisiert. Torjäger- und Kartenstatistiken folgen, sobald entsprechende Saisonwerte vorliegen.";
    section.appendChild(note);
    root.appendChild(section);
  }

  function centralGamesForCompetition(data, competitionSlug) {
    const definition = competitionDefinition(competitionSlug);
    const filter = definition && definition.filter;
    if (!filter) return [];

    const allGames = allCentralGames(data);
    return allGames
      .filter(match => {
        if (!match || typeof match !== "object") return false;
        if (filter.type === "wettbewerb") return match.wettbewerb === filter.value;
        return safeArray(match.sonderwertungen).includes(filter.value);
      })
      .sort((a, b) => {
        const first = `${a.datum || a.datumVon || "9999-12-31"}T${a.anstoss || "23:59"}`;
        const second = `${b.datum || b.datumVon || "9999-12-31"}T${b.anstoss || "23:59"}`;
        return first.localeCompare(second);
      });
  }

  function centralGamesForPage(data) {
    return centralGamesForCompetition(data, slug);
  }

  function createTeamLookup(teamData) {
    return new Map(safeArray(teamData && teamData.teams).map(team => [team.id, team]));
  }

  function teamName(teamLookup, teamId, fallback) {
    return teamLookup.get(teamId)?.name || fallback || "Team offen";
  }

  function normalizeTeamLabel(value) {
    return String(value || "")
      .toLocaleLowerCase("de")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\bsg\b/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function resolveTeamId(teamId, teamNameValue) {
    if (teamId) return teamId;
    const wanted = normalizeTeamLabel(teamNameValue);
    if (!wanted) return "";
    const match = safeArray(currentTeamData && currentTeamData.teams).find(team => {
      const labels = [team && team.name, team && team.kurzname, team && team.id];
      return labels.some(label => {
        const normalized = normalizeTeamLabel(label);
        return normalized && (normalized === wanted || normalized.includes(wanted) || wanted.includes(normalized));
      });
    });
    return match && match.id ? match.id : "";
  }

  function createTeamIdentity(teamId, teamNameValue, modifier = "") {
    const wrap = document.createElement("span");
    wrap.className = `team-identity${modifier ? ` ${modifier}` : ""}`;

    const resolvedId = resolveTeamId(teamId, teamNameValue);
    if (resolvedId && window.OSCTeamBadge) {
      const badge = document.createElement("span");
      badge.className = "team-identity__badge";
      window.OSCTeamBadge.render(badge, resolvedId, teamNameValue, { loading: "lazy" });
      wrap.appendChild(badge);
    }

    const name = document.createElement("span");
    name.className = "team-identity__name";
    name.textContent = teamNameValue || "Team offen";
    wrap.appendChild(name);
    return wrap;
  }

  function centralGamesSection(data, teamData) {
    const games = centralGamesForPage(data);
    const teamLookup = createTeamLookup(teamData);
    if (!games.length) return null;

    return {
      typ: "spiele",
      titel: competitionDefinition(slug)?.scheduleTitle || "Spiele",
      anzeigen: true,
      spiele: games.map(match => ({
        datum: match.datumAnzeige || formatDate(match.datum || match.datumVon),
        datumSortierung: match.datum || match.datumVon || "9999-12-31",
        anstoss: match.anstoss || "Uhrzeit offen",
        heimTeamId: match.heimTeamId || "",
        heim: teamName(teamLookup, match.heimTeamId, match.heim || "Heimteam offen"),
        trenner: "–",
        auswaertsTeamId: match.auswaertsTeamId || "",
        auswaerts: teamName(teamLookup, match.auswaertsTeamId, match.auswaerts || "Auswärtsteam offen"),
        ergebnis: formatResult(match),
        status: match.status || "",
        runde: match.runde || "Spiele",
        spieltagNummer: Number.isFinite(match.spieltagNummer) ? match.spieltagNummer : null,
        terminBestaetigt: match.terminBestaetigt === true,
        abgeschlossen: numericScore(match.heimtore) !== null && numericScore(match.auswaertstore) !== null,
        datumIso: match.datum || match.datumVon || null,
        quelleStand: match.quelleStand || ""
      })),
      zentral: true
    };
  }



  function gameTimestamp(match) {
    const date = match && (match.datum || match.datumVon);
    const time = match && match.anstoss;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const normalizedTime = /^\d{2}:\d{2}$/.test(time || "") ? time : "23:59";
    const value = new Date(`${date}T${normalizedTime}:00`);
    return Number.isNaN(value.getTime()) ? null : value;
  }

  function renderCompetitionNavigator(root) {
    const section = document.createElement("nav");
    section.className = "competition-navigator dynamic-section";
    section.setAttribute("aria-label", "Wettbewerbe wechseln");
    const heading = document.createElement("h2");
    heading.textContent = "Wettbewerbs-Navigator";
    const links = document.createElement("div");
    links.className = "competition-links";
    competitionDefinitions.forEach(definition => {
      const { id, label } = definition;
      const link = document.createElement("a");
      link.href = `./${definition.page || `${id}.html`}`;
      link.textContent = label;
      link.className = `competition-link${id === slug ? " is-current" : ""}`;
      if (id === slug) link.setAttribute("aria-current", "page");
      links.appendChild(link);
    });
    section.append(heading, links);
    root.appendChild(section);
  }

  function renderCompetitionFleetDashboard(gameData, root) {
    const section = document.createElement("details");
    section.className = "dynamic-section competition-fleet";

    const summary = document.createElement("summary");
    summary.className = "fleet-summary";
    const summaryTitle = document.createElement("span");
    summaryTitle.className = "fleet-summary-title";
    summaryTitle.textContent = "Gesamtlage aller Wettbewerbe";
    const summaryHint = document.createElement("span");
    summaryHint.className = "fleet-summary-hint";
    summaryHint.textContent = "Zentraler Bereitschaftsstand";
    summary.append(summaryTitle, summaryHint);
    section.appendChild(summary);

    const body = document.createElement("div");
    body.className = "fleet-body";
    const tableWrap = document.createElement("div");
    tableWrap.className = "table-scroll fleet-table-wrap";
    const table = document.createElement("table");
    table.className = "data-table fleet-table";
    table.innerHTML = "<thead><tr><th>Wettbewerb</th><th>Spiele</th><th>Terminiert</th><th>Beendet</th><th>Nächster Eintrag</th><th>Status</th></tr></thead>";
    const tbody = document.createElement("tbody");
    const now = new Date();

    competitionDefinitions.forEach(definition => {
      const { id, label } = definition;
      const games = centralGamesForCompetition(gameData, id);
      const confirmed = games.filter(match => match.terminBestaetigt === true).length;
      const completed = games.filter(match => numericScore(match.heimtore) !== null && numericScore(match.auswaertstore) !== null).length;
      const next = games
        .map(match => ({ match, date: gameTimestamp(match) }))
        .filter(item => numericScore(item.match.heimtore) === null && (!item.date || item.date >= now))
        .sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return a.date - b.date;
        })[0];

      let statusText = "Nicht vorbereitet";
      let statusClass = "fleet-status-empty";
      if (games.length && confirmed === games.length) {
        statusText = completed === games.length && games.length ? "Abgeschlossen" : "Terminbereit";
        statusClass = completed === games.length && games.length ? "fleet-status-complete" : "fleet-status-ready";
      } else if (games.length && confirmed > 0) {
        statusText = "Teilweise terminiert";
        statusClass = "fleet-status-partial";
      } else if (games.length) {
        statusText = "Struktur vorbereitet";
        statusClass = "fleet-status-structure";
      }

      const row = document.createElement("tr");
      if (id === slug) row.classList.add("is-current-competition");

      const competitionCell = document.createElement("th");
      competitionCell.scope = "row";
      const competitionLink = document.createElement("a");
      competitionLink.href = `./${definition.page || `${id}.html`}`;
      competitionLink.textContent = label;
      competitionCell.appendChild(competitionLink);

      const values = [
        String(games.length),
        `${confirmed} von ${games.length}`,
        `${completed} von ${games.length}`,
        next ? formatDate(next.match.datum || next.match.datumVon) : "Noch offen"
      ];
      row.appendChild(competitionCell);
      values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      const statusCell = document.createElement("td");
      const status = document.createElement("span");
      status.className = `fleet-status ${statusClass}`;
      status.textContent = statusText;
      statusCell.appendChild(status);
      row.appendChild(statusCell);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    body.appendChild(tableWrap);
    const note = document.createElement("p");
    note.className = "data-note";
    note.textContent = "Die Gesamtlage wird ausschließlich aus spieldaten.json berechnet. Sie dient zugleich als Kontrollansicht für die spätere zentrale Datenpflege.";
    body.appendChild(note);
    section.appendChild(body);
    root.appendChild(section);
  }

  function renderCompetitionSituation(gameData, teamData, root) {
    const games = centralGamesForPage(gameData);
    const teams = createTeamLookup(teamData);
    const now = new Date();
    const enriched = games.map(match => ({ match, date: gameTimestamp(match) }));
    const completed = enriched
      .filter(item => numericScore(item.match.heimtore) !== null && numericScore(item.match.auswaertstore) !== null)
      .sort((a, b) => (b.date || 0) - (a.date || 0));
    const confirmedUpcoming = enriched
      .filter(item => item.date && item.date >= now && item.match.terminBestaetigt === true && numericScore(item.match.heimtore) === null)
      .sort((a, b) => a.date - b.date);
    const openUpcoming = enriched
      .filter(item => numericScore(item.match.heimtore) === null && item.match.terminBestaetigt !== true)
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date - b.date;
      });
    const rounds = [...new Set(games.map(match => match.runde).filter(Boolean))];

    const pairing = match => match
      ? `${teamName(teams, match.heimTeamId, match.heim)} – ${teamName(teams, match.auswaertsTeamId, match.auswaerts)}`
      : "Keine Partie hinterlegt";
    const dateLabel = match => match
      ? [formatDate(match.datum || match.datumVon), match.anstoss].filter(Boolean).join(" · ")
      : "Noch offen";

    const section = document.createElement("section");
    section.className = "dynamic-section competition-situation";
    const headingRow = document.createElement("div");
    headingRow.className = "section-heading-row";
    const heading = document.createElement("h2");
    heading.textContent = "Aktuelles Wettbewerbslagebild";
    const badge = document.createElement("span");
    badge.className = "data-status-badge";
    badge.textContent = games.length ? `${rounds.length || 1} Abschnitte erfasst` : "Noch ohne Spielplan";
    headingRow.append(heading, badge);
    section.appendChild(headingRow);

    const grid = document.createElement("div");
    grid.className = "situation-grid";
    const cards = [
      ["Letztes Ergebnis", completed[0] && pairing(completed[0].match), completed[0] ? `${dateLabel(completed[0].match)} · ${formatResult(completed[0].match)}` : "Noch kein Endergebnis vorhanden"],
      ["Nächste bestätigte Partie", confirmedUpcoming[0] && pairing(confirmedUpcoming[0].match), confirmedUpcoming[0] ? dateLabel(confirmedUpcoming[0].match) : "Noch kein bestätigter Termin"],
      ["Nächster offener Eintrag", openUpcoming[0] && pairing(openUpcoming[0].match), openUpcoming[0] ? `${openUpcoming[0].match.runde || "Runde offen"} · Termin noch nicht bestätigt` : "Keine offene Paarung vorhanden"],
      ["Wettbewerbsfortschritt", games.length ? `${completed.length} von ${games.length}` : "0 von 0", games.length ? `${Math.round((completed.length / games.length) * 100)} % der erfassten Spiele beendet` : "Fortschritt noch nicht berechenbar"]
    ];

    cards.forEach(([label, value, detail]) => {
      const card = document.createElement("article");
      card.className = "situation-card";
      const small = document.createElement("span");
      small.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value || "Noch offen";
      const note = document.createElement("small");
      note.textContent = detail;
      card.append(small, strong, note);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    const note = document.createElement("p");
    note.className = "data-note";
    note.textContent = "Das Lagebild verwendet ausschließlich bestätigte Termine und hinterlegte Endergebnisse. Offene Angaben werden sichtbar als offen geführt.";
    section.appendChild(note);
    root.appendChild(section);
  }

function renderCentralValidation(root) {
    const validation = centralValidation;
    if (!validation) return;

    const section = document.createElement("section");
    section.className = `dynamic-section model-validation validation-${validation.status}`;
    const headingRow = document.createElement("div");
    headingRow.className = "section-heading-row";
    const heading = document.createElement("h2");
    heading.textContent = "Zentrale Konsistenzprüfung";
    const badge = document.createElement("span");
    badge.className = `data-status-badge${validation.status === "error" ? " data-status-error" : validation.status === "warning" ? " data-status-warning" : ""}`;
    badge.textContent = validation.status === "error" ? `${validation.counts.errors} Fehler erkannt` : validation.status === "warning" ? `${validation.counts.warnings} Hinweis${validation.counts.warnings === 1 ? "" : "e"}` : "Datenmodell konsistent";
    headingRow.append(heading, badge);
    section.appendChild(headingRow);

    const grid = document.createElement("div");
    grid.className = "validation-summary-grid";
    [
      ["Wettbewerbe", validation.counts.competitions],
      ["Spiele", validation.counts.games],
      ["Teams", validation.counts.teams],
      ["Tippspieltage", validation.counts.matchdays]
    ].forEach(([label, value]) => {
      const card = document.createElement("div");
      card.className = "validation-summary-card";
      const small = document.createElement("span"); small.textContent = label;
      const strong = document.createElement("strong"); strong.textContent = String(value);
      card.append(small, strong); grid.appendChild(card);
    });
    section.appendChild(grid);

    const findings = [...validation.errors, ...validation.warnings];
    if (findings.length) {
      const details = document.createElement("details");
      details.className = "validation-details";
      const summary = document.createElement("summary");
      summary.textContent = `${findings.length} Prüfergebnis${findings.length === 1 ? "" : "se"} anzeigen`;
      details.appendChild(summary);
      const list = document.createElement("div");
      list.className = "validation-findings";
      findings.forEach(finding => {
        const item = document.createElement("article");
        item.className = `validation-finding finding-${finding.severity}`;
        const title = document.createElement("strong"); title.textContent = finding.message;
        const text = document.createElement("p");
        const shown = safeArray(finding.details).slice(0, 6);
        text.textContent = shown.length ? shown.join(" · ") + (finding.details.length > shown.length ? ` · +${finding.details.length - shown.length} weitere` : "") : "Prüfung ohne Detailangabe.";
        item.append(title, text); list.appendChild(item);
      });
      details.appendChild(list); section.appendChild(details);
    } else {
      const note = document.createElement("p");
      note.className = "data-note";
      note.textContent = "IDs, Teamreferenzen, Datumsfelder, Ergebnisse, Tippspieltag-Zuordnungen und Wettbewerbsfilter wurden ohne strukturellen Widerspruch geprüft.";
      section.appendChild(note);
    }
    root.appendChild(section);
  }

function renderCards(cards) {
    const root = $("info-cards");
    root.innerHTML = "";
    safeArray(cards).forEach(card => {
      const article = document.createElement("article");
      article.className = "info-card";
      const h2 = document.createElement("h2");
      h2.textContent = card.titel || "";
      const p = document.createElement("p");
      p.textContent = card.text || "";
      article.append(h2, p);
      root.appendChild(article);
    });
    root.classList.toggle("is-hidden", root.children.length === 0);
  }

  function renderTable(section, root) {
    const table = document.createElement("table");
    table.className = "data-table";
    const headers = safeArray(section.spalten);
    const rows = safeArray(section.zeilen);
    if (headers.length) {
      const thead = document.createElement("thead");
      const tr = document.createElement("tr");
      headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
    }
    const tbody = document.createElement("tbody");
    rows.forEach(row => {
      const tr = document.createElement("tr");
      safeArray(row).forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell ?? "";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Tabellen dürfen auf kleinen Displays nicht die gesamte Seite verbreitern.
    // Stattdessen bleiben sie innerhalb ihres Bereichs horizontal scrollbar.
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll generic-table-scroll";
    wrapper.appendChild(table);
    root.appendChild(wrapper);
  }

  function matchState(match) {
    if (match && match.abgeschlossen) return "completed";
    if (match && match.terminBestaetigt) return "scheduled";
    return "open";
  }

  function createMatchList(matches, options = {}) {
    const list = document.createElement("div");
    list.className = "match-list";
    safeArray(matches).forEach(match => {
      const state = matchState(match);
      const row = document.createElement("div");
      row.className = `match-row match-state-${state}`;
      row.dataset.matchState = state;

      const meta = document.createElement("span");
      meta.className = "match-meta";
      meta.textContent = [match.datum, match.anstoss].filter(Boolean).join(" · ");

      const pairing = document.createElement("strong");
      pairing.className = "match-pairing";
      pairing.append(
        createTeamIdentity(match.heimTeamId, match.heim, "team-identity--home"),
        Object.assign(document.createElement("span"), { className: "match-pairing__separator", textContent: match.trenner || "–" }),
        createTeamIdentity(match.auswaertsTeamId, match.auswaerts, "team-identity--away")
      );

      const resultWrap = document.createElement("span");
      resultWrap.className = "match-result-wrap";
      const stateBadge = document.createElement("span");
      stateBadge.className = `match-state-badge match-state-badge-${state}`;
      stateBadge.textContent = state === "completed" ? "Beendet" : state === "scheduled" ? "Terminiert" : "Termin offen";
      const result = document.createElement("span");
      result.className = "result";
      result.textContent = match.ergebnis || match.status || "";
      resultWrap.append(stateBadge, result);

      row.append(meta, pairing, resultWrap);
      list.appendChild(row);
    });
    if (options.className) list.classList.add(options.className);
    return list;
  }

  function renderScheduleFilter(section, root) {
    const matches = safeArray(section.spiele);
    const counts = matches.reduce((result, match) => {
      result[matchState(match)] += 1;
      return result;
    }, { completed: 0, scheduled: 0, open: 0 });

    const toolbar = document.createElement("div");
    toolbar.className = "schedule-toolbar";
    toolbar.setAttribute("aria-label", "Spielplan filtern");

    const controls = [
      ["all", "Alle", matches.length],
      ["scheduled", "Terminiert", counts.scheduled],
      ["open", "Termin offen", counts.open],
      ["completed", "Beendet", counts.completed]
    ];

    const list = createMatchList(matches, { className: "central-match-list" });
    controls.forEach(([filter, label, count], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `schedule-filter${index === 0 ? " is-active" : ""}`;
      button.dataset.filter = filter;
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.textContent = `${label} (${count})`;
      button.addEventListener("click", () => {
        toolbar.querySelectorAll(".schedule-filter").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });
        let visible = 0;
        list.querySelectorAll(".match-row").forEach(row => {
          const show = filter === "all" || row.dataset.matchState === filter;
          row.hidden = !show;
          if (show) visible += 1;
        });
        empty.hidden = visible !== 0;
      });
      toolbar.appendChild(button);
    });

    const empty = document.createElement("p");
    empty.className = "schedule-empty";
    empty.textContent = "Für diesen Status sind derzeit keine Spiele hinterlegt.";
    empty.hidden = true;

    root.append(toolbar, list, empty);
  }

  function renderBundesligaMatchdays(section, root) {
    const groups = new Map();
    safeArray(section.spiele).forEach(match => {
      const key = match.runde || "Spiele";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(match);
    });

    const orderedGroups = [...groups.entries()].sort((a, b) => {
      const aNumber = a[1][0] && a[1][0].spieltagNummer;
      const bNumber = b[1][0] && b[1][0].spieltagNummer;
      if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
      return a[0].localeCompare(b[0], "de");
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);
    let openIndex = orderedGroups.findIndex(([, matches]) =>
      matches.some(match => (match.datumSortierung || "9999-12-31") >= todayIso)
    );
    if (openIndex < 0) openIndex = Math.max(orderedGroups.length - 1, 0);

    const accordion = document.createElement("div");
    accordion.className = "matchday-accordion";

    orderedGroups.forEach(([round, matches], index) => {
      const details = document.createElement("details");
      details.className = "matchday-group";
      details.open = index === openIndex;

      const summary = document.createElement("summary");
      summary.className = "matchday-summary";

      const title = document.createElement("span");
      title.textContent = round;
      const count = document.createElement("span");
      count.className = "matchday-count";
      count.textContent = `${matches.length} Spiele`;

      summary.append(title, count);
      details.append(summary, createMatchList(matches));
      accordion.appendChild(details);
    });

    root.appendChild(accordion);
  }

  function renderMatches(section, root) {
    if (section.zentral && slug !== "bundesliga") {
      renderScheduleFilter(section, root);
      return;
    }
    if (slug === "bundesliga") {
      renderBundesligaMatchdays(section, root);
      return;
    }
    root.appendChild(createMatchList(section.spiele));
  }


  function renderQuickBackButton(buttons, root) {
    const backButton = safeArray(buttons).find(button =>
      button && button.anzeigen !== false && button.text && button.link &&
      (button.link.includes("#wettbewerbe") || /zurück.*wettbewerb/i.test(button.text))
    );
    if (!backButton) return;

    const quickActions = document.createElement("div");
    quickActions.className = "actions quick-actions";
    const link = document.createElement("a");
    link.className = "btn btn-secondary";
    link.href = backButton.link;
    link.textContent = backButton.text;
    quickActions.appendChild(link);
    root.appendChild(quickActions);
  }

  function renderSections(sections, buttons, gameData, teamData, tableData) {
    const root = $("dynamic-sections");
    root.innerHTML = "";
    document.body.classList.add(`page-${slug}`);
    renderCompetitionNavigator(root);
    renderCompetitionSituation(gameData, teamData, root);
    if (slug === "bundesliga" || slug === "dynamo-dresden") {
      renderQuickBackButton(buttons, root);
    }
    if (slug === "bundesliga") {
      renderBundesligaTable(gameData, teamData, tableData, root);
      renderBundesligaStatistics(gameData, teamData, root);
    }
    safeArray(sections).filter(s => s && s.anzeigen !== false).forEach(section => {
      const article = document.createElement("section");
      article.className = "dynamic-section";
      if (section.titel) {
        const h2 = document.createElement("h2");
        h2.textContent = section.titel;
        article.appendChild(h2);
      }

      switch (section.typ) {
        case "liste": {
          const ul = document.createElement("ul");
          safeArray(section.eintraege).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
          });
          article.appendChild(ul);
          break;
        }
        case "tabelle":
        case "rangliste":
          renderTable(section, article);
          break;
        case "spiele":
          renderMatches(section, article);
          break;
        default: {
          const p = document.createElement("p");
          p.textContent = section.text || "";
          article.appendChild(p);
        }
      }
      root.appendChild(article);
    });
    root.classList.toggle("is-hidden", root.children.length === 0);
  }

  function renderButtons(buttons) {
    const root = $("actions");
    root.innerHTML = "";
    safeArray(buttons).filter(b => b && b.anzeigen !== false && b.text && b.link).forEach((button, index) => {
      const a = document.createElement("a");
      a.className = `btn ${button.stil === "sekundaer" || index > 0 ? "btn-secondary" : "btn-primary"}`;
      a.href = button.link;
      a.textContent = button.text;
      if (button.neuesFenster) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      root.appendChild(a);
    });
    root.classList.toggle("is-hidden", root.children.length === 0);
  }

  async function fetchJson(url, required = true) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (required) throw error;
      console.warn(`Optionale Datei konnte nicht geladen werden: ${url}`, error);
      return { spiele: [] };
    }
  }

  async function load() {
    try {
      if (window.OSCDataRegistry) {
        [gameDataUrl, teamDataUrl, bundesligaTableUrl, competitionConfigUrl] = await Promise.all([
          window.OSCDataRegistry.url("spiele"),
          window.OSCDataRegistry.url("teams"),
          window.OSCDataRegistry.url("bundesligaTabelle"),
          window.OSCDataRegistry.url("wettbewerbe")
        ]);
      }
      const [data, centralGameData, teamData, bundesligaTableData, competitionConfig] = await Promise.all([
        fetchJson(jsonUrl, true),
        fetchJson(gameDataUrl, false),
        fetchJson(teamDataUrl, false),
        slug === "bundesliga" ? fetchJson(bundesligaTableUrl, false) : Promise.resolve({ teams: [] }),
        fetchJson(competitionConfigUrl, false)
      ]);

      currentTeamData = teamData && typeof teamData === "object" ? teamData : { teams: [] };
      if (window.OSCTeamBadge) await window.OSCTeamBadge.load();

      const sharedModel = window.OSCDataModel ? await window.OSCDataModel.load() : null;
      centralModel = sharedModel || null;
      centralValidation = sharedModel && sharedModel.validation ? sharedModel.validation : null;
      const configuredCompetitions = safeArray((sharedModel && sharedModel.competitions) || (competitionConfig && competitionConfig.wettbewerbe))
        .filter(item => item && item.id && item.label && item.filter && item.filter.type && item.filter.value);
      competitionDefinitions = configuredCompetitions.length ? configuredCompetitions : DEFAULT_COMPETITIONS;

      document.title = `${data.titel || "Wettbewerb"} | The Old Smugglers Club`;
      text("eyebrow", data.bereich);
      text("status-plaque", data.statusSchild);
      text("title", data.titel);
      text("description", data.beschreibung);

      renderCards(data.karten);

      const statusBox = $("status-box");
      const showStatus = Boolean(data.aktuellerStandTitel || data.aktuellerStand);
      statusBox.classList.toggle("is-hidden", !showStatus);
      text("status-title", data.aktuellerStandTitel);
      text("status-text", data.aktuellerStand);

      const centralSection = centralGamesSection(centralGameData, teamData);
      const sections = centralSection
        ? [centralSection, ...safeArray(data.bereiche)]
        : safeArray(data.bereiche);

      renderSections(sections, data.buttons, centralGameData, teamData, bundesligaTableData);
      renderButtons(data.buttons);
      text("footer-text", data.fusszeile);
    } catch (error) {
      console.error(error);
      const box = $("error");
      box.textContent = "Die Wettbewerbsdaten sind momentan nicht verfügbar. Bitte versuche es später erneut.";
      box.classList.remove("is-hidden");
    }
  }

  load();
})();
