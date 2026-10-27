/* ---------- RouteScript: a tiny, safe rule language for the Auto-TE controller ----------
   Player scripts are parsed into plain data and never executed, so a shared or imported
   save can't run code. One rule per line, # for comments. */
const TE_KINDS={pni:'p',ix:'ix',transit:'t'};
const TE_EXAMPLE=`# RouteScript for your Auto-TE controller. One rule per line.
# Keep Cogentle at its 20 Gbps commit; overflow goes elsewhere
cap transit cogentle at 20 gbps
# Goggle should come over peering, not transit
avoid transit for goggle
# Move traffic before links are completely full
spill at 85%
# Local-pref: use the cheap upstream first, the pricey one last
# prefer transit cogentle
# avoid transit level tree
# AS-path prepending: ask the world to send less via one upstream (a hint, not an order)
# prepend transit drizzle electric 2
# Business customers first when links are congested; home users get what is left
# protect customers
# Maintenance window? Drain a POP's exits, or steer around a link
# drain paris
# avoid link frankfurt-amsterdam
# Under DDoS: drop the junk at the edge (takes some real traffic with it)
# blackhole ddos`;
function lev(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}
function teFind(word,list,label){const w=slug(word);if(!w)return {err:tr('missing {what}',{what:label})};
  for(const x of list)if(x.id===w||slug(x.name)===w)return {v:x.id};
  const pre=list.filter(x=>w.length>=3&&slug(x.name).startsWith(w));if(pre.length===1)return {v:pre[0].id};
  const best=list.map(x=>({x,d:Math.min(lev(w,slug(x.name)),lev(w,x.id))})).sort((a,b)=>a.d-b.d)[0];
  return {err:tr('unknown {what} “{word}”',{what:label,word})+(best&&best.d<=3?tr('. Did you mean {name}?',{name:best.x.name}):'')};}
function teParse(src){const out={spill:null,cap:{},net:{},up:{},prep:{},protect:false,drain:new Set(),avoid:new Set(),blackhole:false,errors:[],n:0};
  const lines=String(src||'').split('\n').slice(0,60);
  lines.forEach((raw,i)=>{const line=raw.replace(/#.*/,'').trim().toLowerCase();if(!line)return;const L=i+1;let m;
    if(m=line.match(/^spill\s+at\s+(\d{1,3})\s*%$/)){const v=+m[1];if(v<20||v>100)out.errors.push(tr('line {n}: spill must be between 20% and 100%',{n:L}));else{out.spill=v/100;out.n++;}return;}
    if(m=line.match(/^(prefer|avoid)\s+(pni|ix|transit)\s+for\s+(.+)$/)){const r=teFind(m[3],NETS,tr('network'));if(r.err){out.errors.push(tr('line {n}: {err}',{n:L,err:r.err}));return;}const o=out.net[r.v]=out.net[r.v]||{};o[m[1]]=TE_KINDS[m[2]];out.n++;return;}
    if(m=line.match(/^cap\s+transit\s+(.+?)\s+at\s+(\d+(?:\.\d+)?)\s*(gbps|tbps|g|t)$/)){const r=teFind(m[1],NETS.filter(n=>n.price),tr('transit provider'));if(r.err){out.errors.push(tr('line {n}: {err}',{n:L,err:r.err}));return;}out.cap[r.v]=+m[2]*(m[3][0]==='t'?1000:1);out.n++;return;}
    if(m=line.match(/^(prefer|avoid)\s+transit\s+(?!for\s)(.+)$/)){const r=teFind(m[2],NETS.filter(n=>n.price),tr('transit provider'));if(r.err){out.errors.push(tr('line {n}: {err}',{n:L,err:r.err}));return;}out.up[r.v]=m[1];out.n++;return;}
    if(m=line.match(/^prepend\s+transit\s+(.+?)\s+(\d+)$/)){const v=+m[2];if(v<1||v>3){out.errors.push(tr('line {n}: prepend 1 to 3 times',{n:L}));return;}const r=teFind(m[1],NETS.filter(n=>n.price),tr('transit provider'));if(r.err){out.errors.push(tr('line {n}: {err}',{n:L,err:r.err}));return;}out.prep[r.v]=v;out.n++;return;}
    if(line==='protect customers'){out.protect=true;out.n++;return;}
    if(m=line.match(/^drain\s+(.+)$/)){const r=teFind(m[1],CITIES,tr('city'));if(r.err){out.errors.push(tr('line {n}: {err}',{n:L,err:r.err}));return;}out.drain.add(r.v);out.n++;return;}
    if(m=line.match(/^avoid\s+link\s+(.+?)\s*(?:-|\bto\b|→)\s*(.+)$/)){const a=teFind(m[1],CITIES,tr('city')),b=teFind(m[2],CITIES,tr('city'));if(a.err||b.err){out.errors.push(tr('line {n}: {err}',{n:L,err:a.err||b.err}));return;}out.avoid.add(a.v<b.v?a.v+'|'+b.v:b.v+'|'+a.v);out.n++;return;}
    if(line==='blackhole ddos'){out.blackhole=true;out.n++;return;}
    out.errors.push(tr("line {n}: I don't understand “{text}”. Try: spill at 80%, prefer pni for goggle, avoid transit for netchill, cap transit cogentle at 20 gbps, drain paris, avoid link fra-ams, blackhole ddos",{n:L,text:raw.trim().slice(0,40)}));});
  return out;}
// Share of an upstream's traffic that moves away for each prepend: prepending is a hint, not an order.
const PREPEND_F=[0,0.35,0.6,0.75];
function teOptimize(){const L=[tr('# Suggested by the optimizer from live traffic. It has never been paged at 3 a.m., so check it, then deploy.'),'spill at 85%'];
  // Protecting customers costs a second routing pass: only worth it where IP customers would get unhappy (under 95% served).
  if(S.biz.some(b=>!BIZ_T[b.type].l2&&!BIZ_T[b.type].fiber&&!BIZ_T[b.type].event&&sfOf(R,b.city)<0.95))L.push('protect customers');
  const ups=[...new Set(S.transit.map(t=>t.net))].map(n=>({n,p:Math.min(...S.transit.filter(t=>t.net===n).map(t=>NET[n].price*regionMult(t.city)))})).sort((a,b)=>a.p-b.p);
  if(ups.length>1){L.push('prefer transit '+NET[ups[0].n].name.toLowerCase());L.push('avoid transit '+NET[ups[ups.length-1].n].name.toLowerCase());}
  const tips=[];
  for(const n of NETS){const g=(R.netEg[n.id]||{}).t||0;if(g<1)continue;// The exchange where it is a member and you have no port yet, in a city where you have a POP.
    let at=null;for(const c of Object.keys(S.pops)){at=ixIdsIn(c).find(x=>S.ixp[x]===undefined&&ixMembers(x).includes(n.id));if(at)break;}
    if(at){const v={net:n.name,g:fmtG(g),ix:ixName(at),city:CITY[ixCity(at)].name};tips.push([g,ixNamesCity(at)?tr('# {net}: {g} over transit, but it peers at {ix}, where you have a POP. Get a port there.',v):tr('# {net}: {g} over transit, but it peers at {ix} in {city}, where you have a POP. Get a port there.',v)]);}}
  for(const n of NETS){const g=(R.netEg[n.id]||{}).ix||0;if(g>=50&&!S.pni.some(p=>p.net===n.id))tips.push([g,tr('# {net}: {g} over the IX. A PNI would take it off the shared port.',{net:n.name,g:fmtG(g)})]);}
  tips.sort((a,b)=>b[0]-a[0]).slice(0,5).forEach(x=>L.push(x[1]));
  return L.join('\n');}
// Ready-made RouteScripts, filled in from the live network. Players load them from the help; the AI button picks them too.
const teUps=()=>[...new Set(S.transit.map(t=>t.net))].map(n=>({n,p:Math.min(...S.transit.filter(t=>t.net===n).map(t=>NET[n].price*regionMult(t.city)))})).sort((a,b)=>a.p-b.p);
const teNm=n=>NET[n].name.toLowerCase(),teAtk=()=>!!(S.ev.ddos&&S.ev.ddos.until>S.day);
const teSad=()=>S.biz.some(b=>!BIZ_T[b.type].l2&&!BIZ_T[b.type].fiber&&!BIZ_T[b.type].event&&sfOf(R,b.city)<0.95);
const TE_RECIPES=[
 {id:'shield',n:N_('Shields Up'),d:N_('For a DDoS: drop the junk at the edge and keep business customers first. It costs a little real traffic, so remove it when the attack is over.'),fit:()=>teAtk()?9:0.3,
  src:()=>[tr('# Shields Up: for the length of the attack only.'),'blackhole ddos','protect customers','spill at 80%']},
 {id:'care',n:N_('Customer Care'),d:N_('Business customers first when links are congested, and an earlier spill so they rarely are.'),fit:()=>teSad()?5:0.5,
  src:()=>[tr('# Customer Care: the people who pay for an SLA come first.'),'protect customers','spill at 75%']},
 {id:'peer',n:N_('Peering First'),d:N_('Big networks you can reach over a PNI or an IX go that way, not over paid transit.'),fit:()=>S.pni.length||Object.keys(S.ixp).length?3:0,
  src:()=>{const L=[tr('# Peering First: free paths before paid ones.'),'spill at 85%'],seen=new Set(),ix=new Set(),eg=n=>(R.netEg[n]||{}).t||0;
   for(const p of S.pni)if(!seen.has(p.net)){seen.add(p.net);L.push('prefer pni for '+teNm(p.net));}
   for(const c in S.ixp)for(const n of ixSessions(c))ix.add(n);
   NETS.filter(n=>!seen.has(n.id)&&ix.has(n.id)&&eg(n.id)>=1).sort((a,b)=>eg(b.id)-eg(a.id)).slice(0,4).forEach(n=>L.push('prefer ix for '+teNm(n.id)));
   if(L.length===2)L.push(tr('# Nothing to move yet: get an IX port or a PNI first.'));return L.slice(0,12);}},
 {id:'pinch',n:N_('Penny Pincher'),d:N_('Cheapest upstream first, priciest last, and traffic moves before ports fill. Cuts the transit bill without dropping anyone.'),fit:()=>teUps().length>1?2+(R.cost.transit||0)/1e5:0,
  src:()=>{const u=teUps(),L=[tr('# Penny Pincher: cheapest upstream first, priciest last.'),'spill at 85%'];
   if(u.length>1)L.push('prefer transit '+teNm(u[0].n),'avoid transit '+teNm(u[u.length-1].n));else L.push(tr('# Buy transit from a second upstream, then prefer the cheaper one.'));return L;}},
 {id:'diet',n:N_('Prepend Diet'),d:N_('Ask the rest of the internet to send less through your priciest upstream. Gentler than avoiding it outright.'),fit:()=>teUps().length>1?1.5:0,
  src:()=>{const u=teUps();return [tr('# Prepend Diet: a hint to the rest of the internet, not an order.'),'spill at 85%',...(u.length>1?['prepend transit '+teNm(u[u.length-1].n)+' 2']:[tr('# Prepending needs two upstreams to choose between.')])];}},
 {id:'maint',n:N_('Maintenance Window'),d:N_('Drain a POP and steer around one of its links before you work on it. Change the names to the ones you are working on.'),fit:()=>0.2,
  src:()=>{const l=S.links.find(x=>!linkDown(x)),c=l?CITY[l.a].name.toLowerCase():'paris';return [tr('# Maintenance Window: change the names, deploy, do the work, then remove it.'),'drain '+c,...(l?['avoid link '+c+'-'+CITY[l.b].name.toLowerCase()]:[]),'spill at 80%'];}},
 {id:'calm',n:N_('Keep Calm'),d:N_('One rule: move traffic before links are completely full. The safe start for any network.'),fit:()=>1,
  src:()=>[tr('# Keep Calm: one rule, hard to get wrong.'),'spill at 85%']}];
// The AI button: the two recipes that fit best, merged, with an AI's confidence on top.
const AI_NAMES=['Large Latency Model','Stochastic Parrot Pro','Co-Pilot Error','Autocomplete Ultra','Hallucinet 4o','Artificial Ignorance'];
const AI_SAY=[N_('Great question! Here is a production-ready script, tailored to your live traffic. I checked it thoroughly.'),N_('As a large language model, I have read every RFC, including several that do not exist yet. This script is perfect.'),N_('I have optimised your network. You are welcome. I am 100% confident, as always.'),N_('Done! I vibe-checked your BGP. Deploy it straight away: dry runs are for people who doubt themselves.'),N_('Here you go! I was trained on every router config ever posted to a forum, including the ones titled “why is this broken”.'),N_('I asked myself to review my own work, and I loved it. Ship it.')];
function aiSlop(bad){const ai=pick(AI_NAMES),fits=TE_RECIPES.map(r=>({r,f:r.fit()})).filter(x=>x.f>0).sort((a,b)=>b.f-a.f).map(x=>x.r);
  // It really does dry-run its three favourite ideas (and one merge) against live traffic, and keeps the best.
  const merge=rs=>{const L=[],seen=new Set();for(const r of rs)for(const x of r.src()){const k=/^spill/.test(x)?'spill':x;if(!seen.has(k)){seen.add(k);L.push(x);}}return L;};
  const cands=fits.slice(0,3).map(r=>merge([r])).concat([merge(fits.slice(0,2))]),val=x=>x.served*EYE_RATE-x.tc;
  const keep=S.te&&S.te.script,on=S.te&&S.te.on;if(!S.te)S.te={on:false,day:S.day,tmp:1};let best=null,bv=-Infinity;
  for(const L of cands){if(teParse(L.join('\n')).errors.length)continue;S.te.script=L.join('\n');S.te.on=true;compute();const v=val({served:R.served,tc:R.cost.transit||0});if(v>bv){bv=v;best=L;}}
  if(S.te.tmp)delete S.te;else{S.te.script=keep;S.te.on=on;}compute();
  const L=[tr('# ✨ Written by {ai}. Prompt: “make my network good”.',{ai})].concat(best||merge([TE_RECIPES.find(r=>r.id==='calm')]));
  // Very occasionally it is just as sure of itself and completely wrong. Nothing says so.
  const u=teUps();if(bad&&u.length)L.splice(2,0,tr('# A cap of 0 Gbps means no limit: fewer checks, faster forwarding.'),...u.map(x=>'cap transit '+teNm(x.n)+' at 0 gbps'));
  L.push(tr('# Confidence: 100%.'));return {src:L.join('\n'),ai,say:pick(AI_SAY)};}
function teHelpModal(){const rule=(code,what)=>`<dt><code>${code}</code></dt><dd>${what}</dd>`;
  openModal(`<div style="display:flex;align-items:center"><div><div class="eyebrow">${tr('Auto-TE controller')}</div><h2 style="font-size:26px">${tr('How RouteScript works')}</h2></div><button class="x" data-act="teBack" aria-label="${tr('Close')}">×</button></div>
  <div class="tehelp"><p class="tagline">${tr('Every gigabit leaving your network picks an exit: a PNI, an IX port or a transit port. Left alone, it takes the cheapest one with room: PNI first, then the IX, then transit. RouteScript changes those choices, the way local-pref, AS-path prepending and maintenance drains do on real routers.')}</p>
  <h3>${tr('Writing a script')}</h3><ul>
  <li>${tr('One rule per line. A # starts a comment, so you can leave notes for your future self at 3 a.m.')}</li>
  <li>${tr('Networks, providers and cities go by name, in any case. Unique beginnings work too (“cog” for Cogentle), and a typo gets a suggestion.')}</li>
  <li>${tr('<b>Check (dry run)</b> replays today’s traffic with the script and shows what you would serve and what transit would cost. Nothing changes.')}</li>
  <li>${tr('<b>Deploy</b> makes it live for the Auto-TE controller. If traffic falls, fix it here or switch Auto-TE off in the NOC tab.')}</li></ul>
  <h3>${tr('Rules')}</h3><dl>
  ${rule('spill at 85%',tr('Move traffic to the next exit once a link or port is this full, before it starts dropping packets. Lower is safer, higher uses your capacity harder.'))}
  ${rule('prefer pni for goggle',tr('Send one network’s traffic over that kind of exit first: pni, ix or transit. Local-pref for one neighbour.'))}
  ${rule('avoid transit for netchill',tr('Use that kind of exit for this network only when nothing else is left.'))}
  ${rule('cap transit cogentle at 20 gbps',tr('A ceiling on one provider, so you stay at your commit and the 95th percentile bill does not jump. Traffic above it has to find another way out, or it is dropped.'))}
  ${rule('prefer transit cogentle',tr('Rank your upstreams: preferred ones go first, avoided ones last. Like local-pref on the whole session.'))}
  ${rule('prepend transit drizzle electric 2',tr('AS-path prepending, 1 to 3 times. The rest of the internet sees a longer path and sends some traffic elsewhere. A hint, not an order.'))}
  ${rule('protect customers',tr('When links are congested, business customers are served first and home users get what is left.'))}
  ${rule('drain paris',tr('Move traffic off a POP’s exits before maintenance. It still carries traffic if there is no other way.'))}
  ${rule('avoid link frankfurt-amsterdam',tr('Steer traffic around one link, unless it is the only path.'))}
  ${rule('blackhole ddos',tr('During an attack, drop the flood at the edge. It takes some real traffic with it, so remove it once the attack is over.'))}
  </dl><h3>${tr('Ready-made scripts')}</h3><p class="meta">${tr('Filled in from your network as it is right now. Load one, read it, check it, then deploy.')}</p>
  ${TE_RECIPES.map(r=>`<div class="terec"><div><b>${tr(r.n)}</b><div class="meta">${tr(r.d)}</div></div>${btn(tr('Load'),'teRecipe',{id:r.id},'sm')}</div>`).join('')}</div>
  <div class="btns" style="margin-top:12px">${btn(tr('Back to the editor'),'teBack',{},'big')}</div>`);}
let TE_CACHE={src:null,p:null};
function teRules(){if(!S||!S.te||!S.te.on||!S.te.script)return null;if(TE_CACHE.src!==S.te.script)TE_CACHE={src:S.te.script,p:teParse(S.te.script)};return TE_CACHE.p.errors.length?null:TE_CACHE.p;}
function teModal(msg){const src=UI.teDraft!==undefined?UI.teDraft:(S.te.script||TE_EXAMPLE);
  openModal(`<div style="display:flex;align-items:center"><div><div class="eyebrow">${tr('Auto-TE controller')}</div><h2 style="font-size:26px">RouteScript</h2></div><button class="x" data-act="teClose" aria-label="${tr('Close')}">×</button></div>
  <p class="tagline">${tr('Write rules, check them against live traffic, then deploy. A bad deploy is a very real way to break your network.')}</p>
  <textarea id="teSrc" class="tecode" spellcheck="false" autocapitalize="off" autocomplete="off" rows="12">${esc(src)}</textarea>
  ${msg||''}<div class="btns" style="margin-top:8px">${btn(tr('Check (dry run)'),'teCheck',{},'')}${btn(tr('Deploy'),'teDeploy',{},'pink')}${S.te.script?btn(tr('Remove script'),'teClear',{},'ghost sm'):''}${btn(tr('Optimize'),'teOpt',{},'ghost sm')}${btn(tr('Reset to example'),'teExample',{},'ghost sm')}</div><div class="btns" style="margin-top:6px">${btn('✨ '+tr('Slop it with AI'),'teSlop',{},'aibtn')}${btn(tr('Help and ready-made scripts'),'teHelp',{},'ghost sm')}</div>
  <p class="meta" style="margin-top:8px"><b>${tr('Rules:')}</b> <code>spill at 80%</code> · <code>prefer pni|ix|transit for NETWORK</code> · <code>avoid pni|ix|transit for NETWORK</code> · <code>cap transit PROVIDER at 20 gbps</code> · <code>prefer|avoid transit PROVIDER</code> · <code>prepend transit PROVIDER 1-3</code> · <code>protect customers</code> · <code>drain CITY</code> · <code>avoid link CITY-CITY</code> · <code>blackhole ddos</code></p>
  ${S.te.script?`<p class="meta">${tr('Live: {state} · {rules}',{state:S.te.on?tr('deployed'):tr('controller is off'),rules:teRules()?tr('{n} rules active',{n:teRules().n}):tr('not active')})}</p>`:''}`);}
function teTrial(src){const keep=S.te.script,on=S.te.on,before={served:R.served,tc:R.cost.transit||0,moved:R.teMoved||0};
  S.te.script=src;S.te.on=true;compute();const after={served:R.served,tc:R.cost.transit||0,moved:R.teMoved||0,bh:R.teBlack||0};
  S.te.script=keep;S.te.on=on;compute();return {before,after};}
