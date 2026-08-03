(()=>{"use strict";
const clone=value=>value&&typeof value==='object'?structuredClone(value):{};
const array=value=>Array.isArray(value)?value:[];
const norm=value=>String(value??'').trim().toLowerCase().replace(/[ä]/g,'ae').replace(/[ö]/g,'oe').replace(/[ü]/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const complete=row=>row?.abgeschlossen===true||String(row?.status||'').toLowerCase()==='abgeschlossen';
const winner=ranking=>array(ranking).find(row=>Number(row.platz??row.rank)===1)||array(ranking)[0]||null;
const seasonOf=(...docs)=>docs.map(d=>d?.saison||d?.meta?.season).find(Boolean)||'2026/2027';
const entry=(current,season,row)=>row?{...(current||{}),saison:season,name:String(row.teilnehmer||row.name||''),offen:false}:current;
const competitionKey=id=>({bundesliga:'bundesliga','dfb-pokal':'dfbPokal',dfb_pokal:'dfbPokal','champions-league':'championsLeague',champions_league:'championsLeague','europa-league':'europaLeague',europa_league:'europaLeague',relegation:'relegation',piratenkodex:'piratenkodex',weihnachtsregatta:'weihnachtsregatta',bonus:'bonuswettbewerb',bonuswettbewerb:'bonuswettbewerb'}[norm(id)]||null);
async function json(url,fallback={}){try{const r=await fetch(url,{cache:'no-store'});return r.ok?await r.json():fallback}catch{return fallback}}
async function load(){
 const [base,points,competitions,smuggler]=await Promise.all([json('./hall-of-fame.json'),json('./punkte.json'),json('./wettbewerbspunkte.json'),json('./smugglerpunkte.json')]);
 const result=clone(base), season=seasonOf(points,competitions,smuggler);
 // Overall champion is updated only after an explicit final season status.
 if(points?.saisonAbgeschlossen===true||String(points?.status||'').toLowerCase()==='abgeschlossen'){
   const row=winner(points.rangliste);
   if(row) result.aktuellerChampion={name:String(row.teilnehmer||row.name||''),wettbewerb:'Gesamtwertung',titel:'Gesamt-Champion',jahr:season,label:'Old Smugglers Champion'};
 }
 for(const comp of array(competitions.wettbewerbe)){
   if(!complete(comp)) continue;
   const key=competitionKey(comp.wettbewerb||comp.id||comp.label);
   const row=winner(comp.rangliste);
   if(!key||!row) continue;
   if(key==='weihnachtsregatta') result[key]={...(result[key]||{}),jahr:String(season).split('/')[0],name:String(row.teilnehmer||row.name||''),offen:false};
   else result[key]=entry(result[key],season,row);
 }
 if((Number(smuggler.auftraegeAbgeschlossen)===34||complete(smuggler))&&Number(smuggler.auftraegeGesamt||34)===34){
   const row=winner(smuggler.rangliste); if(row) result.smugglerauftraege=entry(result.smugglerauftraege,season,row);
 }
 result.meta=result.meta||{};
 result.meta.runtime='I-03: Titel werden nur bei explizitem Abschlussstatus aus offiziellen Ranglisten ergänzt.';
 return result;
}
window.OSCHallOfFame={load};
})();
