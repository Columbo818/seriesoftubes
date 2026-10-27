/* ---------- failures & events ---------- */
// A few badges read the incident text: callers whose message mentions a shark, anchor, crocodile or llama pass its English as en.
function addInc(o,en=o.msg||''){if(S.loans&&S.loans.some(l=>(l.covs||[]).includes('pizza'))){S.cash-=COVS.pizza.each;S.stats.pizza=(S.stats.pizza||0)+1;}o.id=uid();o.start=S.day;S.inc.push(o);S.stats.incidents++;S.stats.by=S.stats.by||{};S.stats.by[o.type]=(S.stats.by[o.type]||0)+1;if(/shark/i.test(en))S.stats.sharks=(S.stats.sharks||0)+1;const f=S.stats.f=S.stats.f||{};if(/anchor/i.test(en))f.anchor=1;if(/crocodile/i.test(en))f.croc=1;if(/beaver/i.test(en))f.beaver=1;if(/llama/i.test(en))f.llama=1;}
const HARMLESS=[
 [tr('Certificate expired'),tr('The TLS certificate on your NOC dashboard expired. Nobody can see any graphs, so technically there are no problems.')],
 [tr('It was DNS'),tr('Someone deleted the DNS record for the internal wiki. The runbook for fixing DNS was on the wiki.')],
 [tr('Leap second'),tr('A leap second convinced one of your routers it is 1970. Uptime now reads minus 56 years. Traffic is fine.')],
 [tr('Change freeze'),tr('Management declared a change freeze. Someone made a change to announce the change freeze.')],
 [tr('Ticket of the week'),tr('A customer opened a P1 ticket: “the internet is slow”. Attached was a photo of their router, unplugged.')],
 [tr('Monitoring'),tr('Your monitoring system went down. You found out because nothing alerted. Very peaceful week.')],
 [tr('Load-bearing typo'),tr('Someone named a VLAN “prodcution”. It is now load-bearing and can never be renamed.')],
 [tr('IPv6 milestone'),tr('Your IPv6 traffic grew 400%. From one packet to five.')],
 [tr('Mystery link'),tr('You found a 10G link in the inventory that nobody ordered, nobody pays for, and that carries 3 Gbps of something.')],
 [tr('Spreadsheet IPAM'),tr('Your IP address spreadsheet hit 1,048,576 rows. Excel has opinions.')],
  [tr('Goose incident'),tr('A goose attacked the technician on the way to your amp hut. The goose won. Repair rescheduled, nothing broke.')],
 [tr('Latency test'),tr('A carrier pigeon beat one of your links in an informal latency test. Morale is low. Throughput is fine.')],
 [tr('Zombie route'),tr('A route you withdrew in Year 1 is still visible somewhere in the internet. Nobody knows where. It is fine. Probably.')],
 [tr('Auditor visit'),tr('An auditor asked for a network diagram. You sent the game map. They approved it.')],
 [tr('Open to work'),tr('Your peering coordinator updated their profile to “open to work”. Three Tier 1s suddenly want to chat. Nothing happened, but it felt nice.')],
 [tr('Hold music'),tr('Your upstream support line plays the same 11 seconds of hold music. Your on-call engineer can now hum it in four keys.')],
 [tr('Naming committee'),tr('A two-hour meeting about router hostnames ended with a vote for “router-final-v2-NEW”.')],
 [tr('Vendor TAC'),tr('Vendor support asked you to “try turning it off and on again”. For the router you already rebooted. Ticket closed.')],
];
function lagsN(){const o=[];for(const t of S.transit)if((t.n||1)>=2&&!(t.down>S.day))o.push({k:'t',id:t.id,o:t,n:t.n,lab:tr('{name} transit LAG in {city}',{name:NET[t.net].name,city:CITY[t.city].name})});
  for(const p of S.pni)if((p.n||1)>=2)o.push({k:'p',id:p.id,o:p,n:p.n,lab:tr('PNI LAG with {name} in {city}',{name:NET[p.net].name,city:CITY[p.city].name})});
  for(const x in S.ixp){const n=(S.ixn||{})[x]||1;if(n>=2&&!S.myIx[x])o.push({k:'ix',id:x,n,lab:ixNamesCity(x)?tr('{ix} LAG',{ix:ixName(x)}):tr('{ix} LAG in {city}',{ix:ixName(x),city:CITY[ixCity(x)].name})});}return o;}
// Where the junk comes in: one of the city's live uplinks, or just "the edge" if it has none yet.
function ddosEntry(c){const o=[];
  for(const t of S.transit)if(t.city===c&&!(t.down>S.day))o.push({k:'t',id:t.id,lab:tr('{net} transit',{net:NET[t.net].name})});
  for(const x of ixIdsIn(c))if(S.ixp[x]!==undefined)o.push({k:'ix',id:x,lab:tr('{ix} peering',{ix:ixName(x)})});
  for(const p of S.pni)if(p.city===c)o.push({k:'p',id:p.id,lab:tr('PNI with {net}',{net:NET[p.net].name})});
  return o.length?pick(o):{k:'edge',lab:''};}
// Flowspec capability of the router in a city: 0 none, 1 basic, 2 full. The flood is filtered where the
// victim POP's own router has the TCAM for it.
const fsAt=c=>{const p=S.pops[c];return p?(RG[p.rgen||0].fs||0):0;};
// Scrubbing residual for an attack: clean up to the center's capacity (to 15%), overflow leaks. On-demand
// does nothing for the first couple of days while traffic is being diverted.
function scrubEngaged(atk){return hasScrub()&&(S.scrubMode==='always'||(S.day-(atk.start||S.day))>=SCRUB_DELAY);}
// Several centers (#117): the flood goes to the nearest working one, and what it cannot take spills to the next.
// A center in another city only helps if the backbone can carry the flood there; routing works that out.
const scrubFar=c=>{const a=S.ev&&S.ev.ddos;return a&&a.until>S.day&&a.city===c&&(R.haul||[]).find(q=>q.city===c&&q.ms!==null&&q.ms>=SCRUB_FAR_MS)||null;};
function scrubPlan(atk){if(!scrubEngaged(atk))return null;const c=atk.city;let g=atk.gbps||0;const parts=[];
  for(const x of S.scrubs.filter(x=>popUp(x.city)&&(x.city===c||pathExists(c,x.city))).sort((a,b)=>(a.city===c?0:kmBetween(c,a.city))-(b.city===c?0:kmBetween(c,b.city)))){if(g<=0)break;const a=Math.min(g,SCRUB_TIERS[x.tier||0].g);parts.push({city:x.city,tier:x.tier||0,a});g-=a;}
  return parts.length?{parts,leak:g}:null;}
// What still lands on the city if every haul gets through: 15% of what is scrubbed, plus whatever no center can take.
const scrubIdeal=p=>p?p.parts.reduce((s,x)=>s+x.a*0.15,0)+p.leak:Infinity;
// The NOC's live attack view: what is hitting you, what each tool would do about it right now, and the buttons.
function ddosPanel(){
  const a=S&&S.ev&&S.ev.ddos;if(!a||a.until<=S.day||!S.pops[a.city])return '';
  const V=DDOS_VEC[a.vec]||{n:'?',fs:false},cap=fsAt(a.city),model=RG[(S.pops[a.city].rgen||0)].n,en=a.entry||{};
  const cleanT=en.k==='t'?S.transit.find(x=>x.id===en.id):null, sacP=en.k==='p'?S.pni.find(x=>x.id===en.id):null;
  let mult=1;
  if(V.fs&&cap)mult=Math.min(mult,FS_RES[cap]);
  if(cleanT&&cleanT.clean)mult=Math.min(mult,0.1);
  if(a.ixbh&&hasIxAt(a.city))mult=Math.min(mult,0.5);
  const sp=scrubPlan(a),useS=!!sp&&scrubIdeal(sp)<a.gbps*mult,hl=x=>(R.haul||[]).find(q=>q.city===a.city&&q.to===x.city);
  let land=a.bh?0:useS?sp.parts.reduce((t,x)=>{const q=x.city===a.city?null:hl(x);return t+x.a*0.15+(q?(q.a-q.h)*0.85:0);},sp.leak):a.gbps*mult;
  if(sacP&&sacP.sacrif)land=Math.min(land,liveCap(PORT[sacP.tier].g,sacP.city,sacP.site,sacP.n)*0.9);
  land=Math.round(land);
  const fsLine=!V.fs?'— '+tr('Flowspec cannot catch an {vec} (application layer)',{vec:esc(V.n)})
    :cap>=2?'✓ '+tr('Flowspec on your {model} is dropping {vec} at the edge',{model:esc(model),vec:esc(V.n)})
    :cap===1?'~ '+tr('Flowspec on your {model} trims {vec}, but its TCAM is small',{model:esc(model),vec:esc(V.n)})
    :'— '+tr('Your {model} here has no Flowspec TCAM',{model:esc(model)});
  const scrOne=x=>{const T=SCRUB_TIERS[x.tier],q=x.city===a.city?null:hl(x);
      return q&&q.h<q.a-0.5?'~ '+tr('Your backbone can only haul {g} of it to {city}: the rest is not scrubbed',{g:fmtG(q.h),city:esc(CITY[x.city].name)})
        :q&&q.ms!==null?'✓ '+tr('{tier} scrubbing in {city} is cleaning it, hauled over your backbone (+{ms} ms)',{tier:T.n,city:esc(CITY[x.city].name),ms:Math.round(q.ms)})
        :'✓ '+tr('{tier} scrubbing in {city} is cleaning it',{tier:T.n,city:esc(CITY[x.city].name)});};
  const scrLine=!hasScrub()?'— '+tr('No scrubbing center')
    :!scrubEngaged(a)?'… '+tr('On-demand scrubbing diverting, live in {n}d',{n:Math.max(1,SCRUB_DELAY-(S.day-(a.start||S.day)))})
    :!sp?'— '+tr('No scrubbing center')
    :sp.parts.map(scrOne).join('<br>')+(sp.leak>0.5?'<br>~ '+tr('Your scrubbing centers are full: {g} leaks past',{g:fmtG(sp.leak)}):'');
  const entryLine=cleanT&&cleanT.clean?'✓ '+tr('{net} is scrubbing it upstream (clean-pipe)',{net:esc(NET[cleanT.net].name)})
    :sacP&&sacP.sacrif?'✓ '+tr('Contained on your sacrificial {net} PNI',{net:esc(NET[sacP.net].name)}):'';
  let h=`<div class="inc" style="background:#FFE2E6;border:1px solid #FF8A9A">
    <div class="nm">🚨 ${tr('Live attack: {city}',{city:esc(CITY[a.city].name)})}</div>
    <div class="meta">${tr('{size} · {vec}{entry} · {n}d left',{size:fmtG(a.gbps),vec:esc(V.n),entry:a.entry&&a.entry.lab?' · '+esc(a.entry.lab):'',n:a.until-S.day})}</div>
    <div class="meta"><b>${a.bh?tr('Blackholed: the junk is gone, and so is {city}. The attack got what it wanted.',{city:esc(CITY[a.city].name)}):tr('Reaching your network: {g}',{g:fmtG(land)})}</b></div>
    <div class="meta">${scrLine}</div>
    <div class="meta">${fsLine}</div>${entryLine?`\n    <div class="meta">${entryLine}</div>`:''}
    <div class="btns">${a.bh?btn(tr('Stop blackholing'),'unrtbh',{},'ghost sm'):btn(tr('Blackhole the target (RTBH)'),'rtbh',{},'red sm')}${hasIxAt(a.city)&&!a.bh?btn(a.ixbh?tr('IX blackhole on ✓'):tr('IX blackhole <small>~half honour it</small>'),'ixbh',{},a.ixbh?'green sm':'sm'):''}${btn(tr('HackBack 3000™ <small>$20k</small>'),'hackback',{},'sm',S.cash<20000)}</div>
    <p class="meta">${tr('RTBH is free and instant, but it drops everything to the victim, attack and customer alike. An IX blackhole keeps the customer up but only about half the members honour it. HackBack 3000™ by Skynot AI sometimes ends it, and sometimes flattens an innocent and earns you a fine.')}</p></div>`;
  return h;}
