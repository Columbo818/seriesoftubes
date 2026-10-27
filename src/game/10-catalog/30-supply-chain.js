/* ---------- Supply chain: hardware gets dearer over the years, with shortages that come and go ----------
   Transit keeps getting cheaper (it really does), but routers, optics and new builds drift the other way: free for
   the first six months, then +4% a year, capped at +30%. Only new purchases pay it; what you own costs what it cost.
   Now and then a shortage hits one kind of hardware for a month or two. Spares on the shelf and a yearly price lock
   with your vendor are the ways around it. */
const HW_YR=0.04,HW_CAP=1.3,HW_FREE=180,HW_LOCK_DAYS=365;
const HW_SHOCK={opt:{mul:1.5,n:N_('Optics'),msg:N_('<b>Laser shortage!</b><br>The factory that makes the lasers for half the world’s optics flooded. Optics cost 50% more for {n} days. Spares on your shelf just became the best investment you ever made.')},
 rt:{mul:1.4,n:N_('Routers'),msg:N_('<b>Chip shortage!</b><br>Every router vendor is waiting for the same chips. New routers and router upgrades cost 40% more for {n} days. Lead time: “yes”.')},
 build:{mul:1.3,n:N_('New fiber and cable builds'),msg:N_('<b>Every cable ship is booked.</b><br>Hyperscalers have hired every cable ship and trenching crew on the planet. New fiber and cable builds cost 30% more for {n} days.')}};
const hwTrend=d=>Math.min(HW_CAP,1+HW_YR*Math.max(0,(d-HW_FREE)/365));
const hwShock=()=>{const s=S&&S.hw&&S.hw.shock;return s&&s.until>S.day?s:null;},hwLock=()=>{const l=S&&S.hw&&S.hw.lock;return l&&l.until>S.day?l:null;};
function hwMul(k){if(!S)return 1;const l=hwLock();if(l)return l.mul;const s=hwShock();return hwTrend(S.day)*(s&&s.k===k?s.mul:1);}
// A lock costs a little more for a bigger network, and twice as much in the middle of a shortage.
const hwLockCost=()=>Math.round((80000+30000*Object.keys(S.pops).length)*(hwShock()?2:1)/1000)*1000;
function hwShockStart(){const k=pick(Object.keys(HW_SHOCK)),n=45+Math.floor(Math.random()*31);S.hw=S.hw||{};S.hw.shock={k,until:S.day+n,mul:HW_SHOCK[k].mul};
  toast(tr(HW_SHOCK[k].msg,{n})+(hwLock()?'<br>'+tr('Your price lock covers you until {date}.',{date:dateStr(hwLock().until)}):''),hwLock()?'':'bad');sfx('alert');}
function hwCard(){if(!S||(S.day<=HW_FREE&&!hwShock()&&!hwLock()))return '';const t=hwTrend(S.day),s=hwShock(),l=hwLock();
  return `<div class="ibx"><div class="nm">📦 ${tr('Supply chain')}</div>
  <div class="kv"><span>${tr('Hardware prices')}</span><b>${t>1.005?tr('+{p} since you started',{p:pct(t-1)}):tr('as when you started')}</b></div>
  ${s?`<div class="kv"><span>${tr('Shortage')}</span><b>${tr('{what} +{p} · {n} days left',{what:tr(HW_SHOCK[s.k].n),p:pct(s.mul-1),n:s.until-S.day})}</b></div>`:''}
  ${l?`<div class="kv"><span>${tr('Price lock')}</span><b>${tr('until {date}, at +{p}',{date:dateStr(l.until),p:pct(l.mul-1)})}</b></div>`
   :`<p class="meta">${tr('Routers, optics and new builds at today’s prices for a year, shortages included. Tariffs are the government’s, not your vendor’s.')}</p><div class="btns">${btn(tr('Lock prices for a year <small>{cost}</small>',{cost:fmt$(hwLockCost())}),'hwLock',{},'sm',S.cash<hwLockCost())}</div>`}</div>`;}
const routerCost=g=>Math.round((ROUTER_COST+RG[g].cost*0.8)*hwMul('rt'));
// Old routers go on eBuy when you swap models or remove one (#82), like spare optics (#45). Chassis age faster.
const ROUTER_RESALE=0.3,tradeIn=(g,n)=>Math.round(RG[g].cost*n*ROUTER_RESALE),swapCost=(c,g)=>{const p=S.pops[c],rt=p.routers||1;return Math.max(0,Math.round(RG[g].cost*rt*hwMul('rt'))-tradeIn(p.rgen||0,rt));};
const RMAX=6;
// The plain, badge-less model of each class is the default upgrade path; the others are side-grades.
const mainRG=k=>RG.findIndex(r=>r.cls===k&&!r.badge);
// Ports and waves beyond 1.6T / 6.4T only show once a router that takes them is unlocked.
const portShown=i=>i<=4||RG.some(r=>r.lvl<=lvl()&&r.maxP>=i),waveShown=i=>i<=5||RG.some(r=>r.lvl<=lvl()&&r.maxLT>=i);
