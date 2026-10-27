/* ---------- The peering inbox ----------
   Every exchange port brings mail: peering requests from networks nobody has heard of, and sessions that drop
   because someone's PeeringDB says 50 prefixes and they now send 400 (or a full table). Answer it, or hire an AI. */
const AI_MO=Math.round(20e6/12),INBOX_MAX=80,IBX_LEAKS=['nfx','ggl','fbk','amz','msf'];
const TINY=['Basement Broadband','Uncle Dave’s WISP','Fibre Fiesta','Raspberry Pi Transit','Vanity ASN Ltd','Moonshot Crypto Hosting','Minecraft Collective','Bob’s Bits','Homelab Heroes','Hackerspace Uplink','Tiny Tower Networks','Pigeon Post IP','Retro BBS Revival','Overkill Home Network','Two Guys and a Rack','Big Dreams Small Prefix','Mesh-y Business','Garden Shed Datacenter','Carrier-Grade NAT Fan Club','LIR in a Box','Yet Another VPN','Grandma’s Fibre Co-op','Seedbox Society','The /24 That Could'];
const REQ_SAY=[N_('Hi! We would like to peer with you at {ix}. Our PeeringDB record is up to date.'),N_('Dear Sir or Madam, please peer. We have three prefixes and very big plans.'),N_('We noticed you are at {ix}. So are we. Shall we?'),N_('Hello, please find attached our peering request as a Word document, scanned from a printout.'),N_('Peering request, fifth attempt. Is anyone there?'),N_('Hey, quick one: can you peer with us at {ix}? We have a very important Minecraft server.'),N_('Greetings. We are a fast-growing network. Last year we had one customer; this year we have two.'),N_('Please configure sessions with us at {ix}. We will do ours next week, or the week after.')];
const IBX_AI=[N_('Replied to a peering request with a haiku about BGP. No answer yet.'),N_('Signed you up for a webinar on “Peering in the Age of AI”.'),N_('Opened a ticket with itself to review its own decisions. It approved them.'),N_('Wrote a thousand-word apology to a network you never peered with.'),N_('Updated your PeeringDB record. Your NOC phone number is now a pizza place.'),N_('Asked NetChill’s peering team to “please provide more Netchill”.')];
function ibx(){if(!S.inbox||typeof S.inbox!=='object')S.inbox={items:[],down:{},tiny:{},rep:0,bot:false,log:[],seq:0};return S.inbox;}
// Reputation nudges selective networks by up to 10% either way: worth caring about, never a wall.
const repMul=()=>1-clamp((S.inbox&&S.inbox.rep)||0,-10,5)*0.01;
const repName=r=>r>=1?tr('Responsive'):r>=-2?tr('Average'):r>=-6?tr('Mostly ignores email'):tr('Black hole');
const ibxOpen=()=>S.inbox?S.inbox.items.length:0,ibxUrgent=()=>S.inbox?S.inbox.items.filter(x=>x.k==='mp').length:0;
const mpDown=(id,c)=>{const t=S.inbox&&S.inbox.down[id+'@'+c];return !!t&&t>S.day;};
const ibxWho=x=>x.net?NET[x.net].name:x.nm,ibxAsn=x=>x.net?NET[x.net].asn:x.asn;
function ibxLog(m,a){const I=ibx();I.log.unshift({d:S.day,m,a:a||{}});I.log.length=Math.min(I.log.length,40);}
function inboxDay(d){const I=ibx(),ixs=Object.keys(S.ixp);
  // new peering requests: more exchange ports, more mail
  if(ixs.length&&Math.random()<Math.min(0.9,0.15*ixs.length)){const c=pick(ixs),set=ixSessions(c);
    const real=ixMembers(c).filter(id=>{const n=NET[id];return !set.has(id)&&n.type!=='t1'&&n.type!=='cdn'&&n.pol!=='paid'&&n.share<=0.006&&!I.items.some(x=>x.net===id&&x.ix===c);});
    const it={id:++I.seq,k:'req',ix:c,day:d,stale:Math.random()<0.6,yrs:1+Math.floor(Math.random()*9),say:Math.floor(Math.random()*REQ_SAY.length)};
    if(real.length&&Math.random()<0.4)it.net=pick(real);else{it.nm=pick(TINY);it.asn=Math.random()<0.05?64512+Math.floor(Math.random()*1000):200000+Math.floor(Math.random()*200000);}
    I.items.push(it);}
  // max-prefix: someone grew past what their PeeringDB says, or leaked a full table
  const ses=Object.keys(S.peers).filter(k=>{const n=NET[k.split('@')[0]];return n&&n.type!=='cdn'&&n.type!=='t1'&&!mpDown(...k.split('@'));}).map(k=>({key:k,net:k.split('@')[0],ix:k.split('@')[1]}))
    .concat(Object.keys(I.tiny).map(a=>({key:'t'+a,nm:I.tiny[a].nm,asn:+a,ix:I.tiny[a].ix,stale:I.tiny[a].stale})));
  if(ses.length&&Math.random()<Math.min(0.15,0.004*ses.length)){const x=pick(ses);if(!I.items.some(y=>y.k==='mp'&&y.key===x.key)){
    const lim=pick([10,20,50,100,200,500,1000]),leak=Math.random()<0.3,yrs=1+Math.floor(Math.random()*9);
    I.items.push({id:++I.seq,k:'mp',key:x.key,net:x.net,nm:x.nm,asn:x.asn,ix:x.ix,day:d,lim,got:leak?940000+Math.floor(Math.random()*90000):Math.ceil(lim*(1.15+Math.random()*1.6)),leak,yrs});
    // A session that blows its limit is down for at most a few weeks: the other side eventually notices too.
    if(x.net){I.down[x.key]=d+20+Math.floor(Math.random()*20);toast(tr('<b>Max-prefix limit hit: {who} at {ix}.</b><br>The session is down until you look at it.',{who:esc(ibxWho(x)),ix:esc(ixName(x.ix))}),'bad',[{l:tr('Inbox'),act:'inbox',args:{}}]);}}}
  // unanswered mail: requests go stale and people start asking around about you
  for(const x of I.items){if(x.k==='mp')I.rep-=0.05;else if(d-x.day===14)x.bump=1;}
  // A max-prefix alert nobody answers resolves itself in the end: the other side raises it, or gives up.
  I.items=I.items.filter(x=>x.k!=='mp'||(x.net?(I.down[x.key]||0)>d:d-x.day<=30));
  const old=I.items.filter(x=>x.k==='req'&&d-x.day>30);if(old.length){I.rep-=0.25*old.length;I.items=I.items.filter(x=>!old.includes(x));
    if(old.some(x=>x.net))toast(tr('<b>{who} asked a mailing list whether anyone has a working contact at {me}.</b><br>Their peering request sat in your inbox for a month.',{who:esc(ibxWho(old.find(x=>x.net))),me:esc(S.name)}),'bad',[{l:tr('Inbox'),act:'inbox',args:{}}]);}
  while(I.items.length>INBOX_MAX){const i=I.items.findIndex(x=>x.k==='req');if(i<0)break;I.items.splice(i,1);I.rep-=0.5;}
  I.rep=clamp(I.rep,-10,5);
  if(I.bot)inboxBot();}
// Answer one item. a: accept | decline | raise | keep. Returns false when the item is gone.
function ibxAnswer(id,a,bot){const I=ibx(),i=I.items.findIndex(x=>x.id===id);if(i<0)return false;const x=I.items[i];I.items.splice(i,1);const who=ibxWho(x),ix=ixName(x.ix);
  if(x.k==='req'){if(a==='accept'){if(x.net){if(S.ixp[x.ix]!==undefined)S.peers[x.net+'@'+x.ix]=true;}else if(Object.keys(I.tiny).length<200)I.tiny[x.asn]={nm:x.nm,ix:x.ix,stale:!!x.stale};I.rep+=0.3;}else I.rep+=0.2;}
  else if(a==='raise'){delete I.down[x.key];if(x.leak){const n=pick(IBX_LEAKS);S.ev.leak={net:n,until:S.day+4};
      addInc({type:'leak',ref:n,until:S.day+4,msg:tr('{who} at {ix} was sending a full table, and the max-prefix limit was the only thing stopping it. With the limit raised, {net}’s prefixes point at their basement. Traffic to {net} over transit is black-holed for a few days.',{who,ix,net:NET[n].name}),cost:0});
      if(!bot)toast(tr('<b>That was a route leak.</b><br>{who} was announcing {n} prefixes: a full table. Next time, keep it down.',{who:esc(who),n:x.got.toLocaleString()}),'bad');I.rep-=1;}
    else{I.rep+=0.3;if(!bot)toast(tr('<b>Session with {who} is back up.</b><br>New limit: {n} prefixes. They promise to update PeeringDB.',{who:esc(who),n:Math.ceil(x.got*1.5).toLocaleString()}),'good');}}
  else{const back=S.day+(x.leak?3:10)+Math.floor(Math.random()*(x.leak?8:21));if(x.net)I.down[x.key]=back;I.rep+=x.leak?0.3:0.1;
    if(!bot)toast(x.leak?tr('<b>Good call: it was a route leak.</b><br>{who} found a fat-fingered route map. The session comes back on its own in a few days.',{who:esc(who)}):tr('<b>The session stays down.</b><br>{who} will update PeeringDB and ask again. Eventually.',{who:esc(who)}),x.leak?'good':'');}
  I.rep=clamp(I.rep,-10,5);return true;}
// The AI agent clears the inbox every day. It is fast, polite and wrong about a third of the time.
function inboxBot(){const I=ibx();let acc=0,dec=0;
  for(const x of I.items.slice()){const oops=Math.random()<0.3;
    if(x.k==='req'){const want=!x.stale||!!x.net;const a=(want!==oops)?'accept':'decline';ibxAnswer(x.id,a,true);a==='accept'?acc++:dec++;if(oops&&a==='decline'&&x.net)ibxLog(N_('Declined {who} at {ix}: “not a strategic fit”. They were.'),{who:ibxWho(x),ix:ixName(x.ix)});}
    else{const a=(x.leak!==oops)?'keep':'raise';ibxAnswer(x.id,a,true);
      if(a==='raise'&&x.leak)ibxLog(N_('Raised the max-prefix limit for {who} at {ix} to {n}. They seemed nice.'),{who:ibxWho(x),ix:ixName(x.ix),n:Math.ceil(x.got*1.5).toLocaleString()});
      else if(a==='keep'&&!x.leak)ibxLog(N_('Kept {who} down at {ix} for “suspicious growth”. They had grown by one customer.'),{who:ibxWho(x),ix:ixName(x.ix)});
      else ibxLog(a==='raise'?N_('Raised the max-prefix limit for {who} at {ix}. Correctly, this time.'):N_('Kept {who} down at {ix}: it was a route leak. Nailed it.'),{who:ibxWho(x),ix:ixName(x.ix)});}}
  if(acc||dec)ibxLog(N_('Answered your mail: {a} accepted, {d} declined.'),{a:acc,d:dec});
  if(Math.random()<0.01){const ks=Object.keys(S.peers);if(ks.length){const k=pick(ks),[id,c]=k.split('@');delete S.peers[k];ibxLog(N_('Tidied up a session it decided was unused: de-peered {who} at {ix}.'),{who:NET[id].name,ix:ixName(c)});}}
  if(Math.random()<0.08)ibxLog(pick(IBX_AI),{});}
function inboxModal(){const I=ibx(),items=I.items.slice().sort((a,b)=>(b.k==='mp')-(a.k==='mp')||b.day-a.day),reqs=items.filter(x=>x.k==='req').length;
  const age=x=>{const n=S.day-x.day;return n?trn('{n} day ago','{n} days ago',n):tr('today');};
  const pdb=x=>x.stale?trn('PeeringDB last updated {n} year ago','PeeringDB last updated {n} years ago',x.yrs):tr('PeeringDB updated last month');
  const card=x=>x.k==='mp'?`<div class="ibx mp"><div class="nm">⚠️ ${tr('Max-prefix limit hit: {who} at {ix}',{who:esc(ibxWho(x)),ix:esc(ixName(x.ix))})}</div>
    <div class="meta">AS${ibxAsn(x)} · ${age(x)}</div><p class="note">${tr('Configured: {lim} prefixes. Received: {got}.',{lim:x.lim.toLocaleString(),got:x.got.toLocaleString()})} ${trn('Their PeeringDB says {lim}, last updated {n} year ago.','Their PeeringDB says {lim}, last updated {n} years ago.',x.yrs,{lim:x.lim.toLocaleString()})}</p>
    <div class="btns">${btn(tr('Raise the limit'),'inboxAct',{id:x.id,a:'raise'},'sm')}${btn(tr('Keep it down'),'inboxAct',{id:x.id,a:'keep'},'ghost sm')}</div></div>`
   :`<div class="ibx"><div class="nm">${esc(ibxWho(x))} <span class="meta">AS${ibxAsn(x)}</span>${x.bump?` <span class="tag">${tr('bumped')}</span>`:''}</div><div class="meta">${esc(ixName(x.ix))} · ${age(x)} · ${pdb(x)}</div>
    <p class="note">“${esc(tr(REQ_SAY[x.say]||REQ_SAY[0],{ix:ixName(x.ix)}))}”</p><div class="btns">${btn(tr('Accept'),'inboxAct',{id:x.id,a:'accept'},'sm')}${btn(tr('Decline'),'inboxAct',{id:x.id,a:'decline'},'ghost sm')}</div></div>`;
  openModal(`<div style="display:flex;align-items:center"><div><div class="eyebrow">${tr('Peering inbox')}</div><h2 style="font-size:26px">📬 ${trn('{n} unanswered','{n} unanswered',items.length)}</h2></div><button class="x" data-act="closeModal" aria-label="${tr('Close')}">×</button></div>
  <p class="tagline">${tr('Every exchange port brings mail. Answer peering requests, and look at sessions that hit their max-prefix limit: is it growth, or a route leak? Unanswered mail gets you a reputation, and selective networks hear about it.')}</p>
  <div class="kv"><span>${tr('Your reputation')}</span><b>${repName(I.rep)}</b></div>
  <div class="ibx ai">${I.bot?`<div class="nm">🤖 ${tr('Large Peering Model is answering your mail')}</div><div class="meta">${tr('{price}/year. It never sleeps, never complains and is often wrong.',{price:fmt$(20e6)})}</div>
    ${I.log.length?`<pre class="term">${I.log.slice(0,8).map(e=>esc(tr('Day {d}',{d:e.d})+': '+tr(e.m,e.a))).join('\n')}</pre>`:''}<div class="btns">${btn(tr('Fire the AI'),'inboxBot',{on:0},'ghost sm')}</div>`
    :`<div class="nm">🤖 ${tr('Large Peering Model')}</div><div class="meta">${tr('An AI agent that answers every peering request and max-prefix alert for you, every day. {price}/year. Trained on twenty years of peering mailing lists.',{price:fmt$(20e6)})}</div><div class="btns">${btn(tr('Hire it <small>{mo}/mo</small>',{mo:fmt$(AI_MO)}),'inboxBot',{on:1},'aibtn sm',S.cash<AI_MO)}</div>`}</div>
  ${reqs>1?`<div class="btns">${btn(tr('Accept all requests'),'inboxAll',{a:'accept'},'sm')}${btn(tr('Decline all requests'),'inboxAll',{a:'decline'},'ghost sm')}</div>`:''}
  ${items.length?items.slice(0,40).map(card).join(''):`<p class="empty">${Object.keys(S.ixp).length?tr('Inbox zero. Enjoy it while it lasts.'):tr('No mail yet. Buy an IX port and it will come.')}</p>`}`);}
