/* Leased lines you could swap for your own glass: waves, fabric circuits and IRUs between two of your POPs,
   priced against digging (land) or laying a cable (subsea), with enough optics to match what you lease today. */
function swapOptics(km,cap,sub,sys){for(let r=0;r<=(sub?0:REGEN_MAX);r++){const l={km,regen:r,sub};let b=null;
  for(const o in OPT){if(OPT[o].lvl>lvl()||sys==='lite'&&OPT[o].sys==='roadm')continue;const g=optG(o,l),c=optCost(o);if(g&&(!b||c/g<b.c/b.g))b={g,c};}
  if(b){const n=Math.ceil(cap/b.g);return {n,r,up:Math.round(n*b.c*(1+REGEN_CH*r))+r*REGEN_COST,mo:r*REGEN_MO};}}return null;}
const leaseCap=ls=>ls.reduce((s,l)=>s+(l.kind==='vxc'?VXC[l.vt].g:l.kind==='df'?(l.ch||[]).reduce((t,o)=>t+optG(o,l),0):LT[l.tier].g),0);
const swapOpt=(k,up,omo,days,mo)=>{const save=mo-omo;return {k,up,omo,days,save,pay:save>0?Math.ceil(up/save):0};};
// Lighting leased capacity on a fiber you already have (#72 review): needs free channels, and optics cost money.
function litOn(L,cap){const free=chMax(L)-(L.ch||[]).length-soldSlots(L);let b=null;
  for(const o in OPT){const O=OPT[o];if(O.lvl>lvl()||(O.sys==='roadm'&&!isRdm(L.sys))||[L.a,L.b].some(c=>S.pops[c]&&RG[S.pops[c].rgen||0].cls<O.rg))continue;const g=optG(o,L),c=chCost(L,o);if(g&&(!b||c/g<b.c/b.g))b={o,g,c};}
  if(!b)return {free,n:0,fits:false};const n=Math.ceil(cap/b.g);return {free,n,up:n*b.c,fits:n<=free};}
function leaseSwaps(){const by={};
  for(const l of S.links){if(l.kind==='df'&&l.own||!S.pops[l.a]||!S.pops[l.b])continue;const k=[l.a,l.b].sort().join('|');(by[k]=by[k]||[]).push(l);}
  return Object.entries(by).map(([k,ls])=>{const [a,b]=k.split('|'),sub=isSub(a,b),mo=ls.reduce((s,l)=>s+(l.mo||0),0),cap=leaseCap(ls);
    const x={a,b,sub,ls,mo,cap,opts:[],own:pairLinks(a,b).find(l=>l.kind==='df'&&l.own&&l.ready<=S.day)};if(x.own){x.fit=litOn(x.own,cap);if(x.fit.fits)x.best=mo;return x;}
    // Waves and fabric circuits can also move onto a leased fiber pair: cheaper glass, but you buy the gear.
    const ws=ls.filter(l=>l.kind!=='df'),wmo=ws.reduce((s,l)=>s+(l.mo||0),0),sc=sub?subDfCable(a,b):null;x.iru=ls.find(l=>l.kind==='df');
    if(ws.length&&x.iru){x.fit=litOn(x.iru,leaseCap(ws));if(x.fit.fits)x.lit=wmo;}
    else if(ws.length&&lvl()>=2&&(sub?sc:dfAllowed(a,b))){const km=sc?sc.km:kmBetween(a,b),sys=lvl()>=3?'roadm':'lite',wc=leaseCap(ws),op=swapOptics(km,wc,sub,sys);
      if(op&&op.n<=DF_SYS[sys].max)x.opts.push(swapOpt('iru',DF_SYS[sys].cost+ampCount(km)*AMP_COST+op.up,dfLeaseMo(km)+ampCount(km)*AMP_MO+op.mo,30,wmo));}
    // Dig on land, lay a cable between landing stations (even ones that share a landmass), or both.
    const whys=[];for(const cab of [false,true]){if(cab?!seaCab(a,b):sub)continue;
      const why=cab?ownCabWhy(a,b):!dfAllowed(a,b)?tr('Nobody lets you dig on this route. Borders and licences are in the way, so keep leasing.'):lvl()<3?tr('Digging your own fiber unlocks at customer level 3.'):'';
      if(why){whys.push(why);continue;}const km=cab?ownCabKm(a,b):kmBetween(a,b),op=swapOptics(km,cap,cab,'roadm');
      if(!op){whys.push(tr('No optic you can buy reaches {km} km yet.',{km:km.toLocaleString()}));continue;}
      x.opts.push(swapOpt(cab?'cab':'own',(cab?ownCabCost(km):dfBuildCost(km)+DF_SYS.roadm.cost+ampCount(km)*AMP_COST)+op.up,(cab?ownCabMo(km):Math.round(km*0.15)+ampCount(km)*AMP_MO)+op.mo,cab?ownCabDays(km):dfBuildDays(km),mo));}
    x.why=x.opts.some(o=>o.k!=='iru')?'':whys.join(' ');
    const sv=[...x.opts.map(o=>o.save),x.lit].filter(v=>v!==undefined);if(sv.length)x.best=Math.max(...sv);return x;})
  .sort((p,q)=>((p.best===undefined)-(q.best===undefined))||(q.best||0)-(p.best||0)||q.mo-p.mo);}
function leaseTab(){const xs=leaseSwaps(),tot=xs.reduce((s,x)=>s+x.mo,0);
  const kind=l=>l.kind==='vxc'?tr('{cap} fabric circuit',{cap:capName(l)}):l.kind==='df'?tr('{cap} on a dark fiber IRU',{cap:capName(l)}):tr('{cap} wave',{cap:capName(l)});
  const line=(x,o)=>{const a={up:fmt$(o.up),mo:fmt$(o.omo),n:o.days};return `<div class="meta">${o.k==='iru'?tr('Lease dark fiber: {up} up front, {mo}/mo, ready in about {n} days.',a):o.k==='cab'?tr('Your own cable: {up} up front, {mo}/mo, about {n} days to build.',a):tr('Your own fiber: {up} up front, {mo}/mo, about {n} days to build.',a)} <b style="color:${o.save>0?'var(--eye)':'var(--bad)'}">${o.save>0?tr('Saves {price}/mo, pays for itself in about {n} months.',{price:fmt$(o.save),n:o.pay}):tr('Costs more than leasing at this size.')}</b></div>`;};
  const plan=(x,o)=>btn(o.k==='iru'?tr('Plan dark fiber'):o.k==='cab'?tr('Plan a cable'):tr('Plan your own fiber'),'leaseSwap',{a:x.a,b:x.b,src:o.k==='iru'?'lease':o.k==='cab'?'cable':'build'},o.save>0&&o.save===x.best?'pink sm':'ghost sm');
  return `<div class="panel2" style="margin-top:12px"><h3>${tr('Leased lines')}</h3><p class="note" style="margin-top:0">${tr('Every wave, fabric circuit and dark fiber IRU you rent between two of your POPs, next to what leased dark fiber or your own fiber would cost. Estimates include the line system, amplifiers and enough optics for today’s capacity. Build first, move the traffic, then cancel the lease.')}</p>
  ${xs.length?`<div class="kv"><span>${tr('You pay for leases')}</span><b>${tr('{price}/mo',{price:fmt$(tot)})}</b></div>`+xs.map(x=>`<div class="row"><div class="grow"><div class="nm">${CITY[x.a].name} ⇄ ${CITY[x.b].name} <span class="tag st">${x.sub?tr('subsea'):tr('land')}</span></div><div class="meta">${Object.entries(x.ls.reduce((m,l)=>(m[kind(l)]=(m[kind(l)]||0)+1,m),{})).map(([k,n])=>n>1?`${n} × ${k}`:k).join(', ')} · ${tr('{price}/mo',{price:fmt$(x.mo)})}</div>
    ${x.fit&&x.fit.fits?`<div class="meta">${x.own?tr('You already own fiber here. Light {n} more channels for {up}, then cancel the lease to save {price}/mo.',{n:x.fit.n,up:fmt$(x.fit.up),price:fmt$(x.best)}):tr('You already lease dark fiber here. Light {n} more channels for {up}, then cancel the waves to save {price}/mo.',{n:x.fit.n,up:fmt$(x.fit.up),price:fmt$(x.lit)})}</div>`:x.fit?`<div class="meta">${x.fit.n?tr('Your fiber here has room for {free} more channels, and moving these leases needs {n}. Light another fiber pair or upgrade the line system first.',{free:Math.max(0,x.fit.free),n:x.fit.n}):tr('No optic you can buy works on your fiber here yet.')}</div>`:''}${x.opts.map(o=>line(x,o)).join('')}${!x.own&&x.why?`<div class="meta">${esc(x.why)}</div>`:''}
    <div class="btns">${x.own?btn(tr('Open your fiber'),'dashLink',{id:x.own.id},'pink sm'):''}${x.iru&&x.fit?btn(tr('Open your dark fiber'),'dashLink',{id:x.iru.id},x.lit!==undefined?'pink sm':'ghost sm'):''}${x.opts.map(o=>plan(x,o)).join('')}${btn(tr('Open lease'),'dashLink',{id:(x.ls.find(l=>l.kind!=='df')||x.ls[0]).id},'ghost sm')}</div></div></div>`).join(''):`<p class="empty">${tr('You do not lease any lines between your POPs.')}</p>`}</div>`;}
