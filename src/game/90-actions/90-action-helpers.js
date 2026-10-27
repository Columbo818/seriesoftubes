// Overland routes already dug between two cities, in the order they were built (#77). The first is the
// main route; every other one was a diverse route and keeps that price when you add waves to it.
function landTrenches(a,b){const out=[];for(const l of pairLinks(a,b)){if(l.kind==='vxc'||l.cable||l.sub)continue;const k=l.trench||l.id;let t=out.find(x=>x.k===k);if(!t)out.push(t={k,n:0,caps:[]});t.n++;t.caps.push(capName(l));}return out;}
// Which route a new wave joins: null = a new diverse route. 'same' is the old two-way choice (the main route).
function routeJoin(a,b){const ts=landTrenches(a,b),r=UI.route||'';if(r==='same')return ts[0]||null;if(r.startsWith('t:'))return ts.find(t=>t.k===r.slice(2))||null;return null;}
function pairLinks(a,b){return S.links.filter(l=>(l.a===a&&l.b===b)||(l.a===b&&l.b===a));}
// Short, busy subsea routes (London–Amsterdam, London–Paris) sell dark fiber pairs too.
function subDfCable(a,b){return cablesOk(a,b).filter(c=>CAB[c.cid].df).sort((x,y)=>x.km-y.km)[0]||null;}
function dfAllowed(a,b){if(isSub(a,b))return !!subDfCable(a,b);return cnCity(a)===cnCity(b)&&!uaePair(a,b)&&!landX(a,b);}
/* Optics you unplug go on a spares shelf instead of in the bin (#45): the next channel of that type uses a spare
   for free (only the regen sites' transponders are new), or you sell it on eBuy for part of the price. */
const SPARE_RESALE=0.4,spareN=o=>(S&&S.spares&&S.spares[o])|0,spareValue=o=>Math.round(optCost(o)*SPARE_RESALE);
function chCost(l,o){const r=REGEN_CH*(l.regen|0);return Math.round(optCost(o)*(spareN(o)>0?r:1+r));}
function optCost(o){return Math.round(OPT[o].cost*hwMul('opt')*(S&&S.ev&&S.ev.tariff>S.day?1.4:1));}
// Line systems upgrade in place: Rainbow → ROADMaster → C+L. Every lit pair gets the new gear.
const sysNext=l=>l.sys==='lite'?'roadm':l.sys==='roadm'?'cl':null,sysUpCost=l=>{const t=sysNext(l);return t?DF_SYS[t].cost*(t==='cl'&&l.own?Math.max(1,l.pairs|0):1):0;};
function pairBtn(l){if(!l.own||!isRdm(l.sys)||l.ready>S.day)return '';const n=Math.max(1,l.pairs|0);if(n>=pairsMax(l))return `<span class="meta" style="align-self:center">${tr('{n} fiber pairs lit, the trench is full',{n})}</span>`;
  const full=(l.ch||[]).length+soldSlots(l)>=chMax(l),c=pairCost(l);return btn(l.sub?tr('Light fiber pair {n} <small>{price}</small>',{n:n+1,price:fmt$(c)}):tr('Light fiber pair {n} <small>{price} + {mo}/mo</small>',{n:n+1,price:fmt$(c),mo:fmt$(ampCount(l.km)*AMP_MO)}),'addPair',{id:l.id},full?'pink sm':'ghost sm',!full||S.cash<c);}
function chWhy(l,o){const O=OPT[o];if(O.lvl>lvl())return tr('Unlocks at customer level {n}.',{n:O.lvl});if(O.sys==='roadm'&&!isRdm(l.sys))return tr('Needs a ROADMaster 9000 line system.');if(!optMode(o,l)){const mx=optModes(o,l).at(-1)[1];if(l.sub&&l.own)return tr('This channel reaches {max} km on this cable; the route is {span} km. Consider submarine terminals or optical engineering.',{max:mx.toLocaleString(),span:spanKm(l).toLocaleString()});return tr('Too far even at its slowest setting: an optical span here is {span} km and it reaches {max} km. Add a regen site (Line system).',{span:spanKm(l).toLocaleString(),max:mx.toLocaleString()});}
  if((l.ch||[]).length+soldSlots(l)>=chMax(l))return soldSlots(l)?tr('{sys} is full ({max} channels, {sold} sold to customers).',{sys:DF_SYS[l.sys].n,max:chMax(l),sold:soldSlots(l)}):tr('{sys} is full ({max} channels).',{sys:DF_SYS[l.sys].n,max:chMax(l)});
  for(const c of [l.a,l.b]){const p=S.pops[c];if(p&&RG[p.rgen||0].cls<O.rg)return tr('Needs routers with {pn} ports or bigger at both ends ({city}).',{pn:RG[mainRG(O.rg)].pn,city:CITY[c].name});}return '';}
function bbCost(c){return 15000+CITY[c].P*20;}
function after(){if(S)purgeInc();compute();checkGoals();renderAll();if(S&&!$('dash').hidden)renderDash();save();}
const isTablet=()=>innerWidth>760&&innerWidth<=1200;
function selectLink(id){UI.sel={type:'link',id};UI.confirm=null;if(isTablet()||isPhone())UI.leftOpen=false;$('panel').classList.remove('full');renderPanel();renderLeft();}
function selectCity(c){UI.sel={type:'city',id:c};UI.confirm=null;if(isTablet()||isPhone())UI.leftOpen=false;const P=$('panel');if(P)P.classList.remove('full');if(!S.pops[c])UI.tab='cust';renderPanel();}

