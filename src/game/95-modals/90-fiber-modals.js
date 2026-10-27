function dfModalBody(a,b,km,pop){
  if(seaCab(a,b)&&UI.dfSrc==='cable')return ownCabBody(a,b,pop);
  const sea=!isSub(a,b)&&seaCab(a,b)?ownCabTeaser(a,b):'';
  if(isSub(a,b)&&!subDfCable(a,b))return `<p class="lead" style="margin-top:10px">${tr('Nobody sells dark fiber on a subsea cable here. Subsea capacity comes as leased waves.')}</p>`+ownCabTeaser(a,b);
  const sc=isSub(a,b)?subDfCable(a,b):null;if(sc)km=sc.km;
  if(uaePair(a,b))return `<p class="lead" style="margin-top:10px">${tr('No dark fiber inside the UAE. Only the two licensed operators may run fiber here, and they only sell waves.')}</p>`+sea;
  if(landX(a,b)&&cnCity(a)===cnCity(b))return `<p class="lead" style="margin-top:10px">${tr('Nobody sells one fiber pair across a dozen borders. Between continents, overland capacity only comes as leased waves.')}</p>`+sea;
  if(!dfAllowed(a,b))return `<p class="lead" style="margin-top:10px">${tr('Dark fiber across the Chinese border is not for sale. Buy a cross-border wave instead.')}</p>`+sea;
  if(lvl()<2)return `<p class="lead" style="margin-top:10px">${tr('Dark fiber unlocks at customer level 2. You need the scale to justify buying your own optical gear.')}</p>`+sea;
  const src=UI.dfSrc==='build'&&lvl()>=3&&!sc?'build':'lease',sys=DF_SYS[UI.dfSys]&&DF_SYS[UI.dfSys].lvl<=lvl()?UI.dfSys:'lite',amps=ampCount(km);
  const up=(src==='build'?dfBuildCost(km):0)+DF_SYS[sys].cost+amps*AMP_COST+pop,mo=(src==='build'?Math.round(km*0.15):dfLeaseMo(km))+amps*AMP_MO;
  const w=Math.round(waveMo(km,false,4));
  return `<p class="lead" style="margin-top:8px">${tr('A fiber pair of your own. The glass is cheap, the gear is not: you buy a line system with an amplifier every {km} km, then optics for each channel. Your gear can fail, and you fix it.',{km:AMP_EVERY})}</p>
  <h4 class="sub4">${tr('The glass')}</h4><div class="seg">${btn(tr('Lease an IRU <small>{price}/mo · ready in 30 days</small>',{price:fmt$(dfLeaseMo(km))}),'dfSrc',{v:'lease'},src==='lease'?'pink':'ghost')}${sc?btn(S.won?tr('Lay your own subsea cable…'):tr('Your own subsea cable <small>Tier 1 only</small>'),'ownCab',{},'ghost',!!ownCabWhy(a,b)):btn(lvl()>=3?tr('Build your own <small>{price} · ~{n} days</small>',{price:fmt$(dfBuildCost(km)),n:dfBuildDays(km)}):tr('Build your own <small>level 3</small>'),'dfSrc',{v:'build'},src==='build'?'pink':'ghost',lvl()<3)}${sea?btn(S.won?tr('Lay your own subsea cable…'):tr('Your own subsea cable <small>Tier 1 only</small>'),'ownCab',{},'ghost',!!ownCabWhy(a,b)):''}</div>${sc?`<p class="note">${tr("A fiber pair on {cable}, {km} km. It shares the cable with everyone else's waves, anchors included.",{cable:esc(CAB[sc.cid].name),km:sc.km.toLocaleString()})}</p>`:''}
  ${src==='build'?`<p class="note">${tr('Your own trench: almost no rent, but permits and digging take forever, and delays happen.')}</p>`:''}
  <h4 class="sub4">${tr('Line system')}</h4><div class="seg">${Object.keys(DF_SYS).map(k=>btn(`${DF_SYS[k].n} <small>${DF_SYS[k].lvl>lvl()?tr('level {n}',{n:DF_SYS[k].lvl}):fmt$(DF_SYS[k].cost)}</small>`,'dfSys',{v:k},sys===k?'pink':'ghost',DF_SYS[k].lvl>lvl())).join('')}</div>
  <p class="note">${esc(DF_SYS[sys].blurb)} ${trn('Plus {n} in-line amplifier ({price} each, {mo}/mo for hut rent and power).','Plus {n} in-line amplifiers ({price} each, {mo}/mo for hut rent and power).',amps,{price:fmt$(AMP_COST),mo:fmt$(AMP_MO)})}</p>${km>reachOn(OPT.tp16.reach,!!sc)?`<p class="note">${tr('<b>{km} km is longer than any optic reaches at full speed.</b> Transponders will run in long-haul mode (1.2T, 800G or 400G per channel), or add regen sites along the way to get full speed back.',{km:km.toLocaleString()})}</p>`:''}
  <div class="kv" style="margin-top:10px"><span>${tr('Due now')}</span><b>${fmt$(up)}</b></div><div class="kv"><span>${tr('Monthly')}</span><b>${tr('{price}/mo',{price:fmt$(mo)})}</b></div>
  <p class="note">${tr('For comparison, a leased 1.6T wave on this route is {price}/mo. Optics come next, from the link panel.',{price:fmt$(w)})}</p>
  <div class="btns" style="margin-top:10px">${btn(`${src==='build'?tr('Start construction'):tr('Sign the IRU')} <small>${fmt$(up)}</small>`,'orderDf',{},'pink big',S.cash<up)}</div>`;
}
function openVxcModal({from,to,prov}){
  let rows='';const row=(f,a,b)=>{const km=kmBetween(a,b),sub=isSub(a,b),pb=S.pops[b]?nniPort(b,f.id):null,remote=!S.pops[b];
    const label=remote?tr('Remote peering at {ix} · discouraged',{ix:esc(CITY[b].ix)}):pb?tr('Your POP'):tr('Your POP · needs a fabric port there');
    const freeA=nniPort(a,f.id)?NNI[nniPort(a,f.id).tier].g-nniUsed(a,f.id):0,freeB=remote?1e9:pb?NNI[pb.tier].g-nniUsed(b,f.id):0;
    return `<div class="row"><span class="logo" style="--c:${f.col}">${initials(f)}</span><div class="grow"><div class="nm">${CITY[a].name} → ${CITY[b].name}</div><div class="meta">${label} · ${km.toLocaleString()} km${sub?' '+tr('subsea'):''}</div>
    <div class="btns">${VXC.map((V,t)=>btn(`${V.n} <small>${tr('{price}/mo',{price:fmt$(vxcMo(km,sub,t))})}</small>`,'buyVxc',{a,b,prov:f.id,t},'sm',(!remote&&!pb)||V.g>freeA||V.g>freeB||S.cash<vxcMo(km,sub,t))).join('')}</div></div></div>`;};
  for(const f of FABS){if(prov&&f.id!==prov)continue;
    if(from){if(!nniPort(from,f.id))continue;for(const b of f.cities){if(b===from)continue;if(!S.pops[b]&&!CITY[b].ix)continue;rows+=row(f,from,b);}}
    else if(to&&f.cities.includes(to)){for(const a of Object.keys(S.pops))if(a!==to&&nniPort(a,f.id))rows+=row(f,a,to);}}
  if(!rows){const fs=FABS.filter(f=>!to||f.cities.includes(to));rows=`<p class="empty">${tr("You need a fabric port at one of your POPs first. Open a POP's Infra tab and buy a port on {list}.",{list:fs.map(f=>`<b>${esc(f.name)}</b> (${f.cities.filter(c=>S.pops[c]).map(c=>CITY[c].name).join(', ')||tr('no POP of yours on it yet')})`).join(', ')})}</p>`;}
  openModal(`<div style="display:flex;align-items:center"><div><div class="eyebrow">${tr('Virtual circuit over an NNI fabric')}</div><h2 style="font-size:26px">${from?tr('From {city}',{city:CITY[from].name}):tr('To {city}',{city:CITY[to].name})}</h2></div><button class="x" data-act="closeModal" aria-label="${tr('Close')}">×</button></div>
  <p class="lead" style="margin-top:8px">${tr("No install fee, live in minutes, billed monthly. Cheaper than a wave for small capacity, but it rides someone else's fabric, and that fabric can fail.")}</p>${rows}`);
}

