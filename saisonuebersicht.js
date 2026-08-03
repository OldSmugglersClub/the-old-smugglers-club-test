(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const safeArray = value => Array.isArray(value) ? value : [];

  function centralGames(data) {
    return safeArray(data && data.saisons).flatMap(season => safeArray(season && season.spiele));
  }

  function centralMatchdays(data) {
    return safeArray(data && data.saisons).flatMap(season => safeArray(season && season.tippspieltage));
  }

  function matchingGames(games, competition) {
    const filter = competition && competition.filter;
    if (!filter) return [];
    if (filter.type === "sonderwertung") {
      return games.filter(game => safeArray(game && game.sonderwertungen).includes(filter.value));
    }
    return games.filter(game => game && game[filter.type] === filter.value);
  }

  function matchingMatchdays(matchdays, competition) {
    const aliases = {
      "dynamo-dresden": "smugglerauftrag",
      "champions-league": "champions-league",
      "europa-league": "europa-league",
      "dfb-pokal": "dfb-pokal",
      bundesliga: "bundesliga",
      piratenkodex: "piratenkodex",
      weihnachtsregatta: "weihnachtsregatta",
      relegation: "relegation"
    };
    const type = aliases[competition.id];
    return matchdays.filter(day => day && (day.typ === type || day.wettbewerb === type));
  }

  function displayCount(target, actual, suffix) {
    if (Number.isFinite(target)) {
      const detail = actual > 0 && actual !== target ? `<small>${actual} aktuell hinterlegt</small>` : "";
      return `<span class="season-count">${target}${detail}</span>`;
    }
    if (actual > 0) return `<span class="season-count">${actual}<small>aktuell hinterlegt</small></span>`;
    return `<span class="season-count">automatisch<small>${suffix}</small></span>`;
  }

  async function init() {
    try {
      const registry = window.OSCDataRegistry;
      const [overviewUrl, competitionsUrl, gamesUrl, matchdaysUrl] = registry
        ? await Promise.all([
            registry.url("saisonuebersicht"), registry.url("wettbewerbe"),
            registry.url("spiele"), registry.url("tippspieltage")
          ])
        : ["./saison-2026-2027.json", "./wettbewerbe.json", "./spieldaten.json", "./tippspieltage.json"];
      const responses = await Promise.all([
        fetch(overviewUrl, { cache: "no-store" }),
        fetch(competitionsUrl, { cache: "no-store" }),
        fetch(gamesUrl, { cache: "no-store" }),
        fetch(matchdaysUrl, { cache: "no-store" })
      ]);
      if (responses.some(response => !response.ok)) throw new Error("Saisondaten konnten nicht vollständig geladen werden.");

      const [overview, competitionData, gameData, matchdayData] = await Promise.all(responses.map(response => response.json()));
      const sharedModel = window.OSCDataModel ? await window.OSCDataModel.load() : null;
      const competitions = safeArray((sharedModel && sharedModel.competitions) || competitionData.wettbewerbe).filter(item => item && item.saison);
      const games = sharedModel ? sharedModel.games : centralGames(gameData);
      const matchdays = sharedModel ? sharedModel.matchdays : centralMatchdays(matchdayData);

      $("season-title").textContent = overview.titel || "Saisonübersicht 2026/2027";
      $("season-subtitle").textContent = overview.untertitel || "";
      $("competition-count").textContent = competitions.length;
      $("stored-games").textContent = games.length;

      const knownMatchdays = competitions.reduce((sum, item) => sum + (Number.isFinite(item.saison.tippspieltageZiel) ? item.saison.tippspieltageZiel : 0), 0);
      const knownGames = competitions.reduce((sum, item) => sum + (Number.isFinite(item.saison.spieleZiel) ? item.saison.spieleZiel : 0), 0);
      const openMatchdayCompetitions = competitions.filter(item => !Number.isFinite(item.saison.tippspieltageZiel)).length;
      const openGameCompetitions = competitions.filter(item => !Number.isFinite(item.saison.spieleZiel)).length;

      $("matchday-total").textContent = `${knownMatchdays}+`;
      $("matchday-note").textContent = `${openMatchdayCompetitions} Wettbewerbe werden ergänzt`;
      $("game-total").textContent = `${knownGames}+`;
      $("game-note").textContent = `${openGameCompetitions} Wettbewerbe werden ergänzt`;

      const tbody = $("season-table-body");
      tbody.replaceChildren();
      competitions.forEach(competition => {
        const season = competition.saison;
        const actualGames = matchingGames(games, competition).length;
        const actualMatchdays = matchingMatchdays(matchdays, competition).length;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><a class="season-competition-link" href="./${competition.page}">${season.seasonLabel || competition.label}</a></td>
          <td>${displayCount(season.tippspieltageZiel, actualMatchdays, "nach Auslosung")}</td>
          <td>${displayCount(season.spieleZiel, actualGames, "nach Auslosung")}</td>
          <td>${season.zeitraum || "Noch offen"}</td>
          <td><span class="season-status-pill">${season.status || "geplant"}</span></td>`;
        tbody.appendChild(row);
      });

      const date = competitionData.aktualisiert || overview.aktualisiert;
      $("data-state").textContent = `Stand ${date ? date.split("-").reverse().join(".") : "aktuell"}`;
    } catch (error) {
      $("data-state").textContent = "Aktualisierung nicht verfügbar";
      const box = $("season-error");
      box.textContent = error.message;
      box.classList.remove("is-hidden");
    }
  }

  init();
})();
