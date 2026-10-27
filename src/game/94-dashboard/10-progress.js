/* ---------- scenario and level progress (#34) ---------- */
// Red Sea Crisis (#113): traffic your links carry into and out of Asia, and how long it has stayed above the goal.
const RS_G=80,RS_DAYS=30,asiaG=()=>S.links.reduce((a,l)=>a+((CITY[l.a].reg==='AS')!==(CITY[l.b].reg==='AS')?(R.load[l.id]||0):0),0);
const pSrv=g=>({l:tr('Traffic served'),v:R.served,max:g,txt:`${fmtG(R.served)} / ${fmtG(g)}`});
const pReach=()=>({l:tr('Reach'),v:R.reach,max:0.99,txt:`${pct(R.reach)} / 99%`});
const pChk=(l,ok)=>({l,v:ok?1:0,max:1,txt:ok?'✓':'—'});
const SCN_PROG={stg:()=>[{l:tr('Reach'),v:R.reach,max:0.45,txt:`${pct(R.reach)} / 45%`},pSrv(300)],redsea:()=>{const g=asiaG(),n=S.stats.asiaRun||0;return [pChk(tr('A path from Marseille to Singapore'),pathExists('mrs','sin')),{l:tr('Your traffic to and from Asia'),v:Math.min(g,RS_G),max:RS_G,txt:`${fmtG(g)} / ${fmtG(RS_G)}`},{l:tr('Days in a row at {g} or more',{g:fmtG(RS_G)}),v:n,max:RS_DAYS,txt:`${n} / ${RS_DAYS}`}];},spat:()=>[pReach(),pSrv(150)],
  carnaval:()=>[pChk(tr('Carnaval delivered in full'),(S.stats.evFull||0)>=1)],ixbr:()=>{const n=brIxN();return [{l:tr('IX.brrr ports'),v:n,max:20,txt:`${n} / 20`},pChk(tr('A port on IX.brrr Manaus'),S.ixp.mao!==undefined),pSrv(200)];},
  c2c:()=>[pChk(tr('A path from Cape Town to Cairo'),pathExists('cpt','cai')),...['lag','nbo'].map(c=>pChk(tr('POP in {city}',{city:CITY[c].name}),!!S.pops[c])),pSrv(150)],
  pac:()=>[pChk(tr('1.6T on every hop from Los Angeles to Sydney'),fastPath('lax','syd',1600)),pChk(tr('A path from Los Angeles to Tokyo'),pathExists('lax','tok')),pSrv(150)],
  atl:()=>[pChk(tr('1.6T on every hop from Miami to Madrid'),fastPath('mia','mad',1600)),pChk(tr('1.6T on every hop from Lisbon to Lagos'),fastPath('lis','lag',1600)),pSrv(100)],
  darien:()=>[...['bog','lim','scl','sao'].map(c=>pChk(tr('POP in {city}',{city:CITY[c].name}),!!S.pops[c])),pSrv(150)],
  gangnam:()=>[pReach(),pSrv(200)],
  fttb:()=>[...AU_BB.map(c=>pChk(tr('Broadband in {city}',{city:CITY[c].name}),!!(S.pops[c]&&S.pops[c].bb))),{l:tr('Cables overseas'),v:Math.min(2,auExits()),max:2,txt:`${auExits()} / 2`}],
  flood:()=>{const ok=S.stats.ddosOk||0,big=S.stats.ddosOkBig||0,a=S.ev.ddos&&S.ev.ddos.until>S.day?S.ev.ddos:null;
    return [{l:tr('Floods held'),v:ok,max:20,txt:`${ok} / 20`},{l:tr('Terabit floods held'),v:big,max:5,txt:`${big} / 5`},{l:tr('Floods that got through'),v:0,max:0,txt:String(S.stats.ddosLost||0)}].concat(a?[{l:tr('Under attack now'),v:0,max:0,txt:`${fmtG(a.gbps)} · ${CITY[a.city].name} · ${pct(a.worst===undefined?1:a.worst)}`}]:[]);},baltic:()=>[{l:tr('Days in a row with 99.5% served'),v:S.stats.clean||0,max:90,txt:tr('{n} of {m}',{n:S.stats.clean||0,m:90})}]};
function scnProg(){const sc=S&&S.scn;if(!sc)return null;
  if(sc.id==='weekly')return {goal:tr('Serve as much traffic as you can in one year.'),items:[{l:tr('Your score: peak traffic'),v:0,max:0,txt:fmtG(S.stats.peak||0)}],f:Math.min(1,S.day/sc.days)};
  const def=SCN.find(x=>x.id===sc.id),fn=SCN_PROG[sc.id];if(!def)return null;let items=[];try{items=fn?fn():[];}catch(e){items=[];}
  const meas=items.filter(x=>x.max),f=sc.done?1:meas.length?meas.reduce((a,x)=>a+Math.min(1,x.v/x.max),0)/meas.length:0;return {goal:def.goal,items,f};}
const pRow=x=>`<div class="kv"><span>${esc(x.l)}</span><b>${esc(x.txt)}</b></div>${x.max?`<div class="bar ${x.v>=x.max?'':'warn'}"><i style="width:${Math.min(100,x.max?x.v/x.max*100:0)}%"></i></div>`:''}`;
function scnCard(){const sc=S.scn,P=scnProg();if(!sc||!P)return '';const left=Math.max(0,sc.days-S.day);
  const st=sc.done?`<b style="color:var(--eye)">${tr('Done in {d} days!',{d:sc.done})}</b>`:sc.failed?`<b style="color:var(--bad)">${tr("Time's up")}</b>`:tr('{n} days left',{n:left});
  return `<div class="pcard"><div class="eyebrow">${tr('Scenario')} · ${Math.round(P.f*100)}%</div><div class="pt">${esc(sc.name)}</div><div class="meta">🎯 ${esc(P.goal)}</div>${P.items.map(pRow).join('')}<div class="kv"><span>${tr('Time')}</span><b>${st}</b></div><div class="bar ${!sc.done&&left<sc.days*0.2?'bad':''}"><i style="width:${Math.min(100,S.day/sc.days*100)}%"></i></div></div>`;}
function lvlItems(){const lv=S.lvl||1,pk=S.stats.peak||0,pops=Object.keys(S.pops).length,G=(l,v,max,txt)=>({l,v,max,txt}),q=LV_REQ[lv];if(!q)return [];
  const out=[G(tr('Peak traffic'),pk,q.pk,`${fmtG(pk)} / ${fmtG(q.pk)}`),G(tr('POPs'),pops,q.pops,`${pops} / ${q.pops}`)],rg=lvReg(lv);if(rg)out.push(G(tr('Continents'),regionsCount(),rg,`${regionsCount()} / ${rg}`));return out;}
// Lost Tier 1 status explains itself where you look for it, not only in a toast you may have missed (#73).
const t1Note=()=>S.won&&!isTier1()?`<p class="why">${tr('Not Tier 1 right now: {why}.',{why:esc(t1Why())})}</p>`:'';
function lvlCard(){const lv=S.lvl||1,nx=LEVELS[lv];
  return `<div class="pcard lv"><div class="eyebrow">${tr('Customer level {lv} of {max}',{lv,max:LEVELS.length})}</div><div class="pt">${esc(LEVELS[lv-1].n)}</div><div class="meta"><i>${esc(LEVELS[lv-1].q)}</i></div>${t1Note()}${nx?`<div class="meta">${tr('Next: {name} unlocks {what}',{name:esc(nx.n),what:esc(lc1(nx.unlock))})}</div>${lvlItems().map(pRow).join('')}`:`<div class="meta">${tr('Every customer type is unlocked. Go get those terabits.')}</div>`}</div>`;}
