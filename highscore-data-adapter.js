(function(){
  'use strict';
  const cache=new Map();
  async function readJson(path){
    if(cache.has(path)) return cache.get(path);
    const p=fetch(path,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(path+' konnte nicht geladen werden: '+r.status);return r.json();});
    cache.set(path,p); return p;
  }
  async function first(paths){
    let last;
    for(const path of paths){try{return {path,data:await readJson(path)}}catch(e){last=e}}
    throw last||new Error('Keine Datenquelle verfügbar.');
  }
  function firstArray(){
    for(const value of arguments){
      if(Array.isArray(value)&&value.length) return value;
    }
    for(const value of arguments){
      if(Array.isArray(value)) return value;
    }
    return [];
  }
  function legacyHighscore(input){
    const envelope=input||{};
    const root=(envelope.highscore&&typeof envelope.highscore==='object')?envelope.highscore:envelope;
    const gesamt=root.gesamt||{};
    const legacyOverall=root.overall||{};
    const teamSources=root.teams||envelope.teams||{};
    const normalized={...root};
    normalized.overall={
      individual:firstArray(legacyOverall.individual,gesamt.individual,root.individual?.overall,envelope.individual?.overall),
      team:firstArray(legacyOverall.team,gesamt.team,teamSources.overall,root.teamOverall,envelope.teamOverall),
      bonus:firstArray(legacyOverall.bonus,gesamt.bonus,root.individual?.bonus,envelope.individual?.bonus)
    };
    normalized.teams=teamSources;
    normalized.competitions=root.competitions||root.wettbewerbe||{};
    normalized.meta=root.meta||{
      season:envelope.saison||'',
      participantCount:normalized.overall.individual.length
    };
    normalized.adapterDiagnostics={
      overallTeams:normalized.overall.team.length,
      sourceHasGesamtTeam:Array.isArray(gesamt.team),
      sourceHasTeamsOverall:Array.isArray(teamSources.overall)
    };
    return normalized;
  }
  function legacyHall(d){
    if(!d||!d.aktuelleSaison) return d||{};
    const season=d.aktuelleSaison.saison||d.saison||'2026/2027';
    const comps=d.aktuelleSaison.wettbewerbe||{};
    const map=(id)=>{const x=comps[id]||{};return {saison:season,jahr:String(season).slice(0,4),name:x.sieger?.name||'Noch offen',offen:!x.sieger};};
    return {
      meta:{hinweis:d.pruefung?.gueltig===false?'Ehrenlogbuch mit Prüfhinweisen geladen.':'Ehrenlogbuch geladen.'},
      aktuellerChampion:d.aktuelleSaison.gesamtChampion?{name:d.aktuelleSaison.gesamtChampion.name,wettbewerb:'Gesamtwertung',titel:'Champion',jahr:String(season).slice(0,4),label:'Old Smugglers Champion'}:{name:'Noch offen',wettbewerb:'Saison '+season,titel:'Champion',jahr:'',label:'Old Smugglers Champion'},
      teamChampion:{saison:season,name:d.aktuelleSaison.gesamtTeamSieger?.name||'Noch offen',offen:!d.aktuelleSaison.gesamtTeamSieger},
      meister:map('bundesliga'),dfbPokal:map('dfb-pokal'),championsLeague:map('champions-league'),europaLeague:map('europa-league'),
      smugglerauftraege:map('smugglerauftraege'),bonuswettbewerb:{saison:season,name:'Noch offen',offen:true},weihnachtsregatta:map('weihnachtsregatta'),piratenkodex:map('piratenkodex'),
      meisterchronik:[],rekorde:{},ehrenmitglieder:{label:'Status',wert:'Noch keine Einträge'}
    };
  }
  window.OSCHighscoreDataAdapter={
    version:'4.7.0-a3-HF2',
    async loadHighscore(){const r=await first(['./website-view.json','./highscore.json']);return legacyHighscore(r.data)},
    async loadHallOfFame(){
      try{const v=await readJson('./website-view.json');if(v?.hallOfFame)return legacyHall(v.hallOfFame)}catch(e){}
      const r=await first(['./hall-of-fame.json']);return legacyHall(r.data);
    },
    clear(){cache.clear()}
  };
})();
