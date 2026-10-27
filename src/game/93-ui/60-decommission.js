/* Decommissioning POPs. Customers that touch a decommissioned city, or ride a removed link, are let go
   with an early-termination penalty of three months of their contract. */
const DECOM_MONTHS=3;
function decomImpact(cities){const set=new Set(cities),links=S.links.filter(l=>set.has(l.a)||set.has(l.b)),lids=new Set(links.map(l=>l.id));
  const biz=S.biz.filter(b=>bCities(b).some(c=>set.has(c))||(b.link&&lids.has(b.link)));
  const pen=b=>Math.max(2000,Math.round(b.fee?b.fee*0.5:b.bw*b.rate*DECOM_MONTHS));
  return {links,biz,pen,fee:biz.reduce((a,b)=>a+pen(b),0),eye:cities.reduce((a,c)=>a+(R.cityEye[c]||0),0)};}
function decomModal(){const sel=[...(UI.decom||[])],im=decomImpact(sel),all=Object.keys(S.pops),left=all.length-sel.length;
  const rows=all.map(c=>`<label class="row" style="cursor:pointer"><input type="checkbox" data-act="decomToggle" data-args='${esc(JSON.stringify({city:c}))}' ${sel.includes(c)?'checked':''}><div class="grow"><div class="nm">${esc(CITY[c].name)}${c===S.home?` <span class="tag st">${tr('home')}</span>`:''}</div><div class="meta">${trn('{n} link','{n} links',S.links.filter(l=>l.a===c||l.b===c).length)} · ${trn('{n} customer','{n} customers',S.biz.filter(b=>bCities(b).includes(c)).length)}</div></div></label>`).join('');
  openModal(`<div style="display:flex;align-items:center"><h2 style="font-size:24px">${tr('Decommission POPs')}</h2><button class="x" data-act="closeModal" aria-label="${tr('Close')}">×</button></div>
  <p class="lead" style="margin-top:6px">${tr('Pick the POPs to shut down. Everything in them goes: routers, ports, caches, exchange ports and every link that touches them.')}</p>${rows}
  ${sel.length?`<div class="kv"><span>${tr('Links removed')}</span><b>${im.links.length}</b></div><div class="kv"><span>${tr('Eyeballs you stop serving')}</span><b>${fmtG(im.eye)}</b></div><div class="kv"><span>${trn('{n} customer let go','{n} customers let go',im.biz.length)}</span><b style="color:var(--bad)">${fmt$(im.fee)}</b></div>${im.biz.length?`<p class="meta">${im.biz.map(b=>esc(b.name)+' '+fmt$(im.pen(b))).join(' · ')}</p>`:''}`:''}
  ${left<1?`<p class="why">${tr('Keep at least one POP.')}</p>`:''}
  <div class="btns" style="margin-top:10px">${btn(sel.length?trn('Decommission {n} POP · pay {fee}','Decommission {n} POPs · pay {fee}',sel.length,{fee:fmt$(im.fee)}):tr('Pick a POP'),'decomGo',{},'red',!sel.length||left<1)}${btn(tr('Keep them'),'closeModal',{},'ghost')}</div>`);}
function decommission(cities){const set=new Set(cities),im=decomImpact(cities),lids=new Set(im.links.map(l=>l.id)),bids=new Set(im.biz.map(b=>b.id));
  S.links=S.links.filter(l=>!lids.has(l.id));S.biz=S.biz.filter(b=>!bids.has(b.id));S.offers=S.offers.filter(o=>!bCities(o).some(c=>set.has(c)));
  S.transit=S.transit.filter(t=>!set.has(t.city));S.pni=S.pni.filter(x=>!set.has(x.city));S.caches=S.caches.filter(x=>!set.has(x.city));S.nni=(S.nni||[]).filter(x=>!set.has(x.city));
  for(const c of cities){for(const x of ixIdsIn(c)){delete S.ixp[x];delete S.rs[x];if(S.ixn)delete S.ixn[x];if(S.ixSite)delete S.ixSite[x];for(const k in S.peers)if(k.endsWith('@'+x))delete S.peers[k];}delete S.myIx[c];S.scrubs=S.scrubs.filter(x=>x.city!==c);delete S.pops[c];}
  const rem=remoteCities();for(const x in S.ixp){const c=ixCity(x);if(!S.pops[c]&&!rem.includes(c)){delete S.ixp[x];delete S.rs[x];for(const k in S.peers)if(k.endsWith('@'+x))delete S.peers[k];}}
  if(set.has(S.home))S.home=Object.keys(S.pops)[0];
  purgeInc();S.cash-=im.fee;S.stats.decom=(S.stats.decom||0)+cities.length;
  toast(trn('<b>{n} POP decommissioned.</b><br>{fee} in early-termination penalties to {m} customers.','<b>{n} POPs decommissioned.</b><br>{fee} in early-termination penalties to {m} customers.',cities.length,{fee:fmt$(im.fee),m:im.biz.length}),'bad');}
