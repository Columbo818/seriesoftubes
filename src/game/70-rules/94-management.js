/* Network Management is prepaid in 30-day periods. Completed changes remain yours. */
const NM_MO=2000,NM_DAYS=30;
const NM_TOOLS=[
  {id:'rs',lv:2,name:N_('management.route_servers')},
  {id:'peers',lv:4,name:N_('management.peer_requests')},
  {id:'kit',lv:6,name:N_('utilities.redundancy_kit')},
  {id:'lags',lv:7,name:N_('management.split_lags')},
  {id:'caches',lv:8,name:N_('management.cache_requests')},
  {id:'capacity',lv:10,name:N_('management.failover_capacity')},
  {id:'diversity',lv:12,name:N_('management.path_diversity')},
];
const nmActive=()=>!!(S&&S.nm&&S.nm.until>S.day&&lvl()>=2);
const nmAllowed=id=>nmActive()&&NM_TOOLS.some(t=>t.id===id&&lvl()>=t.lv);
function nmGate(id){if(nmAllowed(id))return true;if(S)utilitiesModal();return false;}
function nmDay(){const n=S.nm;if(!n||!n.renew||n.until>S.day)return;
  if(lvl()<2||S.cash<NM_MO){n.renew=false;toast(tr('management.payment_failed'),'bad');return;}
  S.cash-=NM_MO;n.until=S.day+NM_DAYS;
}
function nmServices(city){const rows=[];
  for(const t of S.transit)if(t.city===city)rows.push({k:'t',id:t.id,name:NET[t.net].name,n:t.n||1,site:t.site||'a',g:PORT[t.tier].g,f:lagF(t),use:R.useT[t.id]||0,ready:!(t.down>S.day)});
  for(const p of S.pni)if(p.city===city)rows.push({k:'p',id:p.id,name:NET[p.net].name,n:p.n||1,site:p.site||'a',g:pniG(p),f:lagF(p)*(p.sacrif?0.5:1),use:R.usePni[p.id]||0,ready:pniOn(p)});
  for(const ix of Object.keys(S.ixp))if(ixCity(ix)===city&&!S.myIx[ix])rows.push({k:'ix',id:ix,name:ixName(ix),n:S.ixn&&S.ixn[ix]||1,site:S.ixSite&&S.ixSite[ix]||'a',g:PORT[S.ixp[ix]].g,f:ixLagF(ix),use:R.useIx[ix]||0,ready:!(S.ev.ixdown&&S.ev.ixdown[ix]>S.day)});
  return rows;
}
function nmLags(city){return nmServices(city).filter(x=>x.n>=2&&x.ready&&x.site!=='ab');}
function nmSplit(city){if(!S.pops[city]||!S.pops[city].site2)return 0;const rows=nmLags(city);
  for(const x of rows)if(x.k==='ix'){S.ixSite=S.ixSite||{};S.ixSite[x.id]='ab';}else (x.k==='t'?S.transit:S.pni).find(o=>o.id===x.id).site='ab';
  return rows.length;
}
// A capacity budget for the current carried load, not a rerouting simulation or SLA promise.
function nmCapacity(city){const p=S.pops[city];if(!p)return null;const rt=p.routers||1,g=RG[p.rgen||0].cap,heat=p.hot>S.day?(p.site2?0.75:0.5):1;
  const load=R.nodeLoad[city]||0,rows=[{name:tr('management.one_router'),use:load,cap:rt>1?g*(rt-1)*heat:0}];
  for(const site of ['a','b'])rows.push({name:tr('management.site_lost',{site:site.toUpperCase()}),use:load,cap:p.site2?g*Math.max(1,rt-(p.rdown>S.day?1:0))*heat/2:0});
  const services=nmServices(city).map(x=>{const n=p.site2&&x.ready?x.site==='ab'?Math.floor(x.n/2):0:0;return {name:x.name,use:x.use,cap:n?lagCap(x.g,n)*x.f:0};});
  for(const ix of Object.keys(S.myIx))if(ixCity(ix)===city)services.push({name:ixName(ix),use:R.useIx[ix]||0,cap:p.site2&&S.ixSite&&S.ixSite[ix]==='ab'&&!(S.ev.ixdown&&S.ev.ixdown[ix]>S.day)?myFab(ix).g*ixLagF(ix):0});
  const groups=new Map();for(const c of S.caches)if(c.city===city){let v=groups.get(c.net);if(!v){v={name:NET[c.net].cache.name,a:0,b:0,use:0};groups.set(c.net,v);}v[c.site==='b'?'b':'a']++;v.use+=R.useCache[c.id]||0;}
  for(const v of groups.values())services.push({name:v.name,use:v.use,cap:p.site2?Math.min(v.a,v.b)*CACHE_CAP:0});
  return {rows,services,incident:!popUp(city)||p.rdown>S.day||p.hot>S.day||siteDown(city,'a')||siteDown(city,'b'),unused:load<=1e-9};
}
// Remove each shared-risk group in turn: this also catches bottlenecks beyond the first hop.
function nmDiversity(city){if(!S.pops[city])return null;const remote=new Set(remoteCities()),up=c=>popUp(c)||remote.has(c);
  const links=S.links.filter(l=>!linkDown(l)&&capOf(l)>0&&up(l.a)&&up(l.b)),groups=new Map(),adj=new Map();
  for(const l of links){const key=l.kind==='vxc'?'fab:'+l.prov:'path:'+(l.trench||l.id);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(l);
    for(const [a,b] of [[l.a,l.b],[l.b,l.a]]){if(!adj.has(a))adj.set(a,[]);adj.get(a).push({to:b,key});}}
  const reach=skip=>{const seen=new Set([city]),q=up(city)?[city]:[];for(let i=0;i<q.length;i++)for(const e of adj.get(q[i])||[])if(e.key!==skip&&!seen.has(e.to)){seen.add(e.to);q.push(e.to);}return seen;};
  const pops=Object.keys(S.pops).filter(c=>c!==city),base=reach(),risks=[];
  for(const [key,ls] of groups){const seen=reach(key),lost=pops.filter(c=>base.has(c)&&!seen.has(c));if(lost.length)risks.push({links:ls,lost});}
  return {risks:risks.sort((a,b)=>b.lost.length-a.lost.length),shared:[...groups.values()].filter(ls=>ls.length>1),disconnected:pops.filter(c=>!base.has(c)),others:pops.length};
}
