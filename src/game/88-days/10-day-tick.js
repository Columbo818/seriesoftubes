/* ---------- daily tick ---------- */
function dayTick(){
  if(!S||S.lost)return;
  S.day++;
  const d=S.day;
  dkTick(d);ixPriceWar(d);inboxDay(d);pniDay(d);
  if(!S.phpDone&&d>45&&Math.random()<1/400)elephant();
  if(R&&R.teMoved)S.stats.teMax=Math.max(S.stats.teMax||0,R.teMoved);
  {const t1=!!S.won&&isTier1();if(S.t1Now&&!t1)toast(tr('<b>You are no longer Tier 1.</b><br>Because {why}. Your Tier 1 badge stays; win the status back to show it again.',{why:t1Why()}),'bad');S.t1Now=t1;}
  if(S.grace&&S.grace.until===d){toast(tr('<b>The courtesy route has ended.</b><br>New networks you have not connected to are now only reachable through your own peering and transit.'),'bad',[{l:tr('Open NOC'),act:'leftTab',args:{t:'noc'}}]);}
  {const a=S.ev.ddos;if(a&&a.until>d&&R&&S.pops[a.city])a.worst=Math.min(a.worst===undefined?1:a.worst,sfOf(R,a.city));}
  if(scnRule('ddos')&&!(S.scn.done||S.scn.failed)&&d>=(+S.scn.nextDdos||3)&&!(S.ev.ddos&&S.ev.ddos.until>d)){ddosAttack();S.scn.nextDdos=d+3+Math.floor(Math.random()*5);}
  if(R&&R.demand>0)S.stats.clean=R.served/R.demand>=0.995?(S.stats.clean||0)+1:0;
  if(S.scn&&S.scn.id==='redsea')S.stats.asiaRun=asiaG()>=RS_G?(S.stats.asiaRun||0)+1:0;
  if(S.ev.php===d)toast(tr('<b>The internet is back.</b><br>Half of it, anyway. Everything was patched in a hurry and nobody learned anything.'),'good');
  for(const k in S.peers){const [id,c]=k.split('@'),sn=snub(id,c);if(!sn)continue;delete S.peers[k];S.stats.depeered=(S.stats.depeered||0)+1;
    {const v={net:esc(NET[id].name),ix:esc(ixName(c)),city:esc(CITY[ixCity(c)].name),why:esc(sn.why)};toast(ixNamesCity(c)?tr('<b>{net} de-peered you at {ix}.</b><br>{why} Traffic falls back to your next best path.',v):tr('<b>{net} de-peered you at {ix} in {city}.</b><br>{why} Traffic falls back to your next best path.',v),'bad');}}
  if(S.cnLic&&S.cnLic.state==='pending'&&d>=S.cnLic.ready){S.cnLic.state='ok';toast(tr('<b>License granted!</b><br>Your joint venture can now build POPs in mainland China.'),'goal');sfx('coin');}
  // resolve incidents
  for(const i of S.inc.slice())if(i.until<=d){const o=incOpen(i),l=o&&o.a==='link'&&S.links.find(x=>x.id===o.v),where=l?CITY[l.a].name+'–'+CITY[l.b].name:o&&o.a==='city'?CITY[o.v].name:'';clearInc(i);
    toast(where?tr('<b>Resolved: {what}</b><br>{where} is back to normal.',{what:incTitle(i.type),where:esc(where)}):tr('<b>Resolved: {what}</b>',{what:incTitle(i.type)}),'good',[],o);}
  // eyeball growth / churn uses last computed service
  for(const c in S.pops){const p=S.pops[c];if(!p.bb)continue;const sf=sfOf(R,c),P=eyeP(c);
    if(sf>=0.9){const g=(CITY[c].be&&!(p.boost>d)?0.35:1)*0.025*(scnRule('boom')?1.5:1)*(p.boost>d?2:1)*sf*(0.7+0.6*(R.peerShare||0))*(CITY[c].reg==='AS'&&!CITY[c].cn?1.6:1);p.bb.d+=g*p.bb.d*(1-p.bb.d/P);}
    else p.bb.d=Math.max(Math.min(3,P),p.bb.d*(1-(0.9-sf)*0.04));}
  compute();
  for(const t of S.transit){(t.hist=t.hist||[]).push(R.useT[t.id]||0);if(t.hist.length>30)t.hist.shift();}
  S.cash+=(R.revMo-R.costMo)/30;
  S.stats.peak=Math.max(S.stats.peak,R.served);
  S.hist=S.hist||[];S.hist.push({d,dem:+R.demand.toFixed(2),srv:+R.served.toFixed(2),c:+(R.egT.c||0).toFixed(2),p:+(R.egT.p||0).toFixed(2),ix:+(R.egT.ix||0).toFixed(2),t:+(R.egT.t||0).toFixed(2),l2:+(R.egT.l2||0).toFixed(2),rev:Math.round(R.revMo),cost:Math.round(R.costMo),cash:Math.round(S.cash),inc:S.inc.length});if(S.hist.length>180)S.hist.shift();
  {const top=custLevel();if(top>(S.lvl||1)){for(let lv=(S.lvl||1)+1;lv<=top;lv++){track('level_'+lv);toast(tr('<b>Customer level {lv}: {name}</b><br>New customers unlocked: {unlock}',{lv,name:LEVELS[lv-1].n,unlock:LEVELS[lv-1].unlock})+`<br><i>${esc(LEVELS[lv-1].q)}</i>`,'goal');}S.lvl=top;sfx('coin');}}
  for(const l of S.links){if(l.kind!=='df')continue;
    if(l.ready===d){toast(`<b>${l.own?tr('Your fiber is finished: {a}–{b}',{a:CITY[l.a].name,b:CITY[l.b].name}):tr('Dark fiber handed over: {a}–{b}',{a:CITY[l.a].name,b:CITY[l.b].name})}</b><br>${(l.ch||[]).length?tr('Channels are lighting up now.'):tr('It is dark. Add optics to light it up.')}`,'goal',[{l:tr('Open'),act:'selLink',args:{id:l.id}}]);sfx('coin');}
    if(l.own&&l.ready>d&&Math.random()<0.012){const extra=10+Math.floor(Math.random()*40);setCableReady(l,l.ready+extra);toast(tr('<b>Construction delay: +{n} days</b><br>{why} ({a}–{b})',{n:extra,why:pick(l.sub?SEA_DELAYS.map(x=>tr(x)):[tr('Archaeologists found a Roman bathhouse on your route.'),tr('A protected hamster species lives along the right-of-way.'),tr('The railway changed its mind about the easement.'),tr('The drilling crew hit a granite boulder the size of a bus.'),tr('A town council wants a public hearing. About the color of the manhole covers.'),tr('Somebody else’s gas main was exactly where the map said it was not.'),tr('The permit office lost your permit. And then the replacement.')]),a:CITY[l.a].name,b:CITY[l.b].name}),'bad');}}
  // DDoS protection SLA: if a protected customer's own city is hit and still goes down, you pay out (once per attack).
  if(S.ev.ddos&&S.ev.ddos.until>d){const a=S.ev.ddos;
    for(const b of S.biz)if(b.type==='scrub'&&b.city===a.city&&b.slaFor!==a.start&&sfOf(R,b.city)<0.85){
      b.slaFor=a.start;S.cash-=SLA_PEN;b.mood=Math.max(0,b.mood-18);S.stats.sla=(S.stats.sla||0)+1;
      toast(tr('<b>SLA breach: {name}.</b><br>The attack on {city} got through and your protected customer went down. You owe {pen} in SLA credits.',{name:esc(b.name),city:CITY[a.city].name,pen:fmt$(SLA_PEN)}),'bad');sfx('err');}}
  // businesses mood
  for(const b of S.biz.slice()){if(eventTick(b,d))continue;b.pm=b.mood;const sf=bizSf(b),reachOk=BIZ_T[b.type].l2||BIZ_T[b.type].fiber||R.reach>0.99||scnRule('local'),scrubOk=b.type!=='scrub'||(hasScrub()&&!scrubFar(b.city)),divOk=reqOk(b);
    if(sf>=0.95&&reachOk&&scrubOk&&divOk)b.mood=Math.min(100,b.mood+2);
    else if(S.day-(b.since||0)<15){}
    else{b.mood-=(Math.max(0,0.95-sf)*45+(!reachOk?3:0)+(!scrubOk?4:0)+(!divOk?3:0));
      if(b.mood<=0){S.biz=S.biz.filter(x=>x!==b);toast(tr('<b>{name} cancelled.</b><br>Too many outages and too little bandwidth in {city}.',{name:esc(b.name),city:CITY[b.city].name}),'bad');sfx('err');}
      else if(b.mood<30&&!b.warned){b.warned=b.warn60=true;const why=bizWhy(b)[0],paused=pref('pauseFurious')&&autoPause();
        toast(tr('<b>{name} is furious.</b><br>Fix service in {city} or they leave.',{name:esc(b.name),city:CITY[b.city].name})+(why?`<br><i>${esc(why)}</i>`:'')+(paused?`<br><b>${tr('Game paused.')}</b>`:''),'bad',[{l:tr('Show me'),act:'custGo',args:{id:b.id}}].concat(paused?[resumeAct()]:[]));sfx('err');}
      else if(b.mood<60&&!b.warn60&&pref('warnUnhappy')){b.warn60=true;const why=bizWhy(b)[0];toast(tr('<b>{name} is getting unhappy.</b><br>Happiness {p}% in {city}.',{name:esc(b.name),p:Math.round(b.mood),city:CITY[b.city].name})+(why?`<br><i>${esc(why)}</i>`:''),'',[{l:tr('Show me'),act:'custGo',args:{id:b.id}}]);}}
    if(b.mood>60)b.warned=false;if(b.mood>75)b.warn60=false;}
  // own IX members join
  for(const c in S.myIx){const m=S.myIx[c];if(d>=m.next&&m.members.length<myFab(c).max){
    const cands=NETS.filter(n=>n.type!=='t1'&&!m.members.includes(n.id)&&(n.pops.includes(c)||n.pops.some(p=>CITY[p].reg===CITY[c].reg)));
    if(cands.length){cands.sort((a,b)=>(a.pol==='open'?0:1)-(b.pol==='open'?0:1)||b.share-a.share);const n=Math.random()<.6?cands[0]:pick(cands);m.members.push(n.id);toast(tr('<b>{net} joined {ix}!</b><br>Another member paying {fee}/mo for a port.',{net:esc(n.name),ix:esc(m.name),fee:fmt$(MYIX_FEE)}),'good');sfx('coin');}
    m.next=d+8+Math.floor(Math.random()*10);}}
  loanTick(d);
  if(S.mode==='sandbox'&&S.cash<1e8)S.cash=1e9;
  // offers
  S.offers=S.offers.filter(o=>o.exp>d);
  if(S.offers.length<5&&Math.random()<0.05+0.01*(S.lvl||1))spawnOffer();
  // failures & events
  let dirty=false;
  if(d>=S.nextFail){dirty=true;fireFailure();const size=S.links.length+Object.keys(S.pops).length;S.nextFail=d+Math.round((Math.max(22,50-size*1.5)+Math.floor(Math.random()*25))*(scnRule('chaos')?0.5:1));}
  if(d>=S.nextEvent){dirty=true;fireEvent();S.nextEvent=d+45+Math.floor(Math.random()*45);}
  if(dirty)compute();
  // payday floaters
  if(d%30===0){for(const c in S.pops){let v=(R.cityEye[c]*sfOf(R,c)*EYE_RATE)+S.biz.filter(b=>b.city===c).reduce((a,b)=>a+b.bw*b.rate,0);v=v-R.cityEye[c]*sfOf(R,c)*EYE_RATE*(1-(CITY[c].arpu||1));if(v>500)floater(CITY[c].x,CITY[c].y-30,'+'+fmt$(v),'#16A866');}sfx('coin');}
  checkGoals();
  scnTick(d);
  confTick(d);
  // money trouble
  if(S.cash<0){S.neg++;if(S.neg===1)toast(tr('<b>You are in the red.</b><br>Cancel something expensive, wait for revenue, or check the bank for a loan. At −$100k the bank takes your routers.'),'bad');}
  else S.neg=0;
  if(S.cash<-100000){S.lost=true;track('bankrupt');showLose();return;}
  if(d%360===0&&[1,2,4].includes(d/360))track('game_year_'+(d/360+1),true);
  if(d%10===0)save();
}
function spawnOffer(){
  const mine=Object.keys(S.pops),lv=S.lvl||1;
  const types=['dia','dia','game','host'];if(mine.length>=2)types.push('l2vpn','l2vpn');if(S.day>60)types.push('scrub');
  if(lv>=2)types.push('isp','stream','edu','host','hft','bulk','event','event');if(mine.length>=3&&lv>=2)types.push('sdwan','sdwan');
  if(S.links.some(l=>l.kind==='df'&&l.ready<=S.day))types.push('wwave','wwave');if(S.links.some(l=>l.kind==='df'&&l.own&&l.ready<=S.day))types.push('dfpair');if(lv>=3)types.push('gpu','gpu','onramp','onramp');if(lv>=4)types.push('ai','ai','hyper','hyper');
  if(lv>=3&&MEGA.some(m=>mine.includes(m.c)))types.push('ingest');if(lv>=4&&MEGA.some(m=>mine.includes(m.c)))types.push('aiwan','aiwan','mtrain');if(lv>=4&&S.links.some(l=>l.kind==='df'&&l.own&&l.ready<=S.day))types.push('pairs');
  if(lv>=5)types.push('esport');if(lv>=6&&mine.length>=2)types.push('sov','sov');if(lv>=8)types.push('cgame','cgame');if(lv>=9)types.push('metav','metav');if(lv>=11&&MEGA.some(m=>mine.includes(m.c)))types.push('agi');if(lv>=13&&mine.length>=2)types.push('mars');
  const br=mine.filter(c=>CITY[c].br);if(br.length)types.push('provedor','provedor','provedor');
  const fabC=mine.filter(c=>FABS.some(f=>f.cities.includes(c)));if(lv>=2&&fabC.length){types.push('fabip','fabip');if(mine.length>=2)types.push('fabl2');}
  const t=pick(types),T=BIZ_T[t];
  if(T.event||T.sdwan||T.fiber||T.mega){spawnSpecial(t);return;}
  if(T.nni){const city=pick(fabC),prov=pick(FABS.filter(f=>f.cities.includes(city))).id,bw=pick(T.opts),others=mine.filter(c=>c!==city),city2=T.l2&&others.length?pick(others):null;if(T.l2&&!city2)return;
    const base=pick(BIZ_N.filter(n=>!S.usedNames.includes(n)).concat(BIZ_N)).replace(/ (Inc\.|Co\.|Ltd)$/,'');const name=tr('{name} via {fab}',{name:base,fab:FAB[prov].name});S.usedNames.push(base);
    const rate=T.l2?Math.round((150+kmBetween(city,city2)*0.08)*T.km):T.rate;
    S.offers.push({id:uid(),city,city2,prov,name,type:t,bw,rate,reqs:['nni'],exp:S.day+40});return;}
  let city=(Math.random()<0.65&&mine.length)?pick(mine):pick(OFFC.concat(cnOk()?['pek','sha']:[])),city2=null;
  if(T.l2){city=pick(mine);const pool=(Math.random()<(T.lv>=3?0.8:0.6)?mine:OFFC).filter(c=>c!==city);city2=pick(pool.length?pool:OFFC.filter(c=>c!==city));}
  let bw=T.lv>=2?pick(T.opts):pick(T.opts.slice(0,mine.length>=4?4:3));
  const list=(T.names||BIZ_N).filter(n=>!S.usedNames.includes(n));
  let name=list.length?pick(list):(T.names?pick(T.names):'Startup #'+Math.floor(Math.random()*999));
  S.usedNames.push(name);
  if(t==='provedor')city=pick(br);
  if(t==='hft'){const fin=['nyc','chi','lon','fra','tok','sin','hkg','ams','ash'],mf=mine.filter(c=>fin.includes(c));city=mf.length?pick(mf):pick(mine);city2=pick(fin.filter(c=>c!==city));}
  let rate=T.l2?Math.round((150+kmBetween(city,city2)*0.08)*T.km):T.rate;
  if(CITY[city].au&&!T.l2&&!T.fiber&&!T.event){rate=Math.round(rate*AU_ARPU);bw=Math.min(bw,pick(T.opts.slice(0,2)));}
  if(T.div&&!reqCan('diverse',{city,city2}))return;
  const reqs=T.div?['diverse']:T.lat?['lat']:[];if((t==='hyper'||t==='ai'||t==='gpu')&&Math.random()<0.4)reqs.push('metro');const pool=Object.keys(REQS).filter(k=>!reqs.includes(k)&&!REQS[k].only&&(!REQS[k].l2||T.l2)&&(!REQS[k].ip||!T.l2)&&reqCan(k,{city,city2}));
  if(Math.random()<(T.lv>=3?0.65:0.3))reqs.push(pick(pool));
  if(T.lv>=3&&Math.random()<0.35){const more=pool.filter(k=>!reqs.includes(k));if(more.length)reqs.push(pick(more));}
  const r2=Math.round(rate*(1+reqs.reduce((a,k)=>a+REQS[k].bonus,0)));
  S.offers.push({id:uid(),city,city2,name,type:t,bw,rate:r2,reqs,latMax:T.lat?+(kmBetween(city,city2)/200*1.35).toFixed(1):null,exp:S.day+40});
}
