function fitHud(){const h=$('hud');if(!h)return;h.classList.remove('fit1','fit2','fit3');if(innerWidth<=760)return;
  const row=()=>{let m=0;for(const c of h.children)if(c.offsetParent)m=Math.max(m,c.offsetHeight);return m;};
  for(const c of ['fit1','fit2','fit3']){if(h.offsetHeight<=row()*1.5)break;h.classList.add(c);}}
function renderHUD(){
  for(const v of [0,0.5,1,2,4,8]){const b=$('sp'+v);if(b)b.classList.toggle('on',UI.speed===v);}
  $('muteBtn').style.opacity=UI.muted?.4:1;
  if(!S)return;
  $('hName').textContent=S.name;$('hAsn').textContent='AS'+S.asn+(S.mode==='sandbox'?' · '+tr('Sandbox'):S.scn?' · '+(scnName())+(S.scn.done||S.scn.failed?'':` · ${tr('{n}d left',{n:Math.max(0,S.scn.days-S.day)})}`):'');
  $('hCash').textContent=fmt$(S.cash);$('hCash').style.color=S.cash<0?'var(--bad)':'';
  const net=R.revMo-R.costMo;$('hRate').innerHTML=`<span class="${net>=0?'up':'down'}">${net>=0?'▲':'▼'} ${tr('{price}/mo',{price:fmt$(Math.abs(net))})}</span>`;
  $('hTraffic').textContent=`${fmtG(R.served)}`;
  $('hTrafBar').style.width=(R.demand?R.served/R.demand*100:0)+'%';
  $('hTrafBar').style.background=R.demand&&R.served/R.demand<0.9?'var(--bad)':'var(--ok)';
  $('hReach').textContent=reachPct(R.reach);$('hReach').style.color=R.reach<0.99?'var(--bad)':'var(--eye)';
  $('hTier').textContent=tierLabel()+' · '+tr('Lv {n}',{n:S.lvl||1});
  {const P=scnProg(),hs=$('hScn');hs.hidden=!P;if(P){const sc=S.scn;$('hScnVal').textContent=sc.done?tr('Done!'):sc.failed?tr("Time's up"):`${Math.round(P.f*100)}% · ${tr('{n}d left',{n:Math.max(0,sc.days-S.day)})}`;}}
  $('hDate').textContent=dateStr(S.day);
  {const bo=(S.loanOffers||[]).length,hb=$('hBank');hb.hidden=!bo;hb.textContent=bo;}
  {const st=custStats(),hc=$('hCust');hc.hidden=!st.n;if(st.n){$('hCustVal').innerHTML=`${st.avg>=80?'😀':st.avg>=60?'🙂':st.avg>=30?'😟':'😡'} ${Math.round(st.avg)}%${st.unhappy?` <span class="cnt red">${st.unhappy}</span>`:''}`;hc.classList.toggle('hot',st.furious>0);}}
  const n=S.inc.length;$('hNoc').classList.toggle('hot',n>0);{const u=UI.left==='noc'&&UI.leftOpen?0:logUnread(),b=$('hNocNew');if(b){b.hidden=!u;b.textContent=u>99?'99+':String(u);b.title=trn('{n} new notification','{n} new notifications',u);}}$('hNocVal').textContent=n?trn('{n} incident','{n} incidents',n):tr('All quiet');
  if(!window.__TUBES_TEST__)fitHud();
  renderTabbar();
}
function renderLeft(){checkLayer();
  // Tablets in landscape: both side panels don't fit next to the map, so the left one tucks away
  // while a city or link is open and comes back with the toggle button.
  const tab=isTablet(),L=$('left');L.classList.toggle('closed',tab?(!!UI.sel&&!UI.leftOpen):!UI.leftOpen);const tg=$('leftToggle');if(tg&&innerWidth>760)tg.hidden=!(tab&&L.classList.contains('closed'));
  renderTabbar();
  if(!S){L.hidden=true;return;}L.hidden=false;
  const ndone=GOALS.filter(g=>S.done[g.id]!==undefined).length;
  const tabs=[['goals',`${tr('Goals')}<span class="cnt">${ndone}/${GOALS.length}</span>`],['deals',`${tr('Deals')}${S.offers.length?`<span class="cnt">${S.offers.length}</span>`:''}`],['noc',`NOC${S.inc.length?`<span class="cnt red">${S.inc.length}</span>`:''}`],['nets',`${tr('Networks')}${ibxOpen()?`<span class="cnt${ibxUrgent()?' red':''}">${ibxOpen()}</span>`:''}`]];
  $('leftTabs').innerHTML=tabs.map(([k,l])=>`<button class="${UI.left===k?'on':''}" data-act="leftTab" data-args='{"t":"${k}"}'>${l}</button>`).join('')+(innerWidth<760?`<button data-act="toggleLeft" style="margin-left:auto" aria-label="${tr('Close')}">×</button>`:'');
  let h='';
  if(UI.left==='goals'){
    h+=scnCard()+lvlCard()+t1Card();
    const cur=GOALS.find(g=>S.done[g.id]===undefined);
    h+=GOALS.map(g=>{const d=S.done[g.id]!==undefined,c=g===cur;return `<div class="goal ${d?'done':''} ${c?'cur':''}"><div class="ck">${d?'✓':''}</div><div><div class="gt">${esc(g.t)}</div>${c||!d?`<div class="gd">${esc(g.d)}</div>`:''}${!d&&g.r?`<div class="gr">${tr('Reward {cash}',{cash:fmt$(g.r)})}</div>`:''}</div></div>`;}).join('');
    h+=badgeGrid();
  }else if(UI.left==='deals'){
    {const st=custStats();if(st.n)h+=`<div class="row" style="margin-bottom:8px"><div class="grow"><div class="nm">${tr('Your customers')} <span class="meta">${st.n} · ${tr('happiness {p}%',{p:Math.round(st.avg)})}</span></div><div class="bar ${moodCls(st.avg)}"><i style="width:${st.avg}%"></i></div>${st.unhappy?`<div class="why">${trn('{n} unhappy customer, {price}/mo at risk','{n} unhappy customers, {price}/mo at risk',st.unhappy,{price:fmt$(st.risk)})}</div>`:''}</div>${btn(st.unhappy?tr('See who'):tr('All customers'),'custOpen',{sad:st.unhappy?1:0},st.unhappy?'pink sm':'ghost sm')}</div>`;}
    h+=confSection();
    {const lv=S.lvl||1,nx=LEVELS[lv];h+=`<div class="inc" style="background:#FFF6CF"><div class="nm">${tr('Customer level {lv}: {name}',{lv,name:LEVELS[lv-1].n})}</div><div class="meta">${nx?tr('Next: {req} unlocks {what}',{req:nx.req,what:lc1(nx.unlock)}):tr('Every customer type is unlocked. Go get those terabits.')}</div></div>`;}
    if(!S.offers.length)h+=`<p class="empty">${tr('No open offers right now. Businesses look for networks with POPs in their city. New ones pop up every few weeks.')}</p>`;
    for(const o of S.offers.slice().sort((a,b)=>a.exp-b.exp)){const has=bHas(o);
      h+=`<div class="row"><div class="grow"><div class="nm">${esc(o.name)}</div><div class="meta">${esc(BIZ_T[o.type].l)} · ${CITY[o.city].name}${o.city2?' ⇄ '+CITY[o.city2].name:''} · <b>${bTerms(o)}</b> · ${tr('{n}d left',{n:o.exp-S.day})}${(o.reqs||[]).length?` · ${trn('{n} special requirement','{n} special requirements',o.reqs.length)}`:''}</div>${reqList(o)}
      <div class="btns">${has?btn(tr('Accept'),'accept',{id:o.id},'green sm'):btn(tr('Go there'),'focusCity',{city:bCities(o).find(c=>!S.pops[c])},'ghost sm')}${btn(tr('Decline'),'decline',{id:o.id},'ghost sm')}</div>${has?'':`<div class="why">${tr('Needs a POP in {cities}',{cities:bCities(o).filter(x=>!S.pops[x]).map(x=>CITY[x].name).join(', ')})}</div>`}</div></div>`;}
  }else if(UI.left==='noc'){
    h+=`<div class="btns" style="margin-bottom:8px">${btn(tr('Open NOC dashboard'),'dash',{},'pink')}${btn(tr('Connections'),'connOpen',{},'')}${btn(tr('Traceroute'),'trace',{},'')}</div>`;
    h+=`<p class="lead">${tr('Your Network Operations Center. Every notification also lands here. Things fail all the time on the internet. Redundant links and multiple upstreams let traffic reroute by itself.')}</p>`;
    // Incidents come first, the ones you can fix with one click at the top (#63): no scrolling past hot ports to replace an optic.
    for(const i of S.inc.filter(i=>i.type!=='ddos').sort((a,b)=>(b.cost?1:0)-(a.cost?1:0)||(b.impact||0)-(a.impact||0))){h+=`<div class="inc"><div class="nm">${incTitle(i.type)}</div><div class="meta">${esc(i.msg)}</div><div class="meta">${trn('Auto-fix in {n} day','Auto-fix in {n} days',i.until-S.day)}${i.impact?` · ${tr('{g} lost',{g:fmtG(i.impact)})}`:''}</div>${i.cost?`<div class="btns">${btn(`${esc(i.fix||tr('Rush repair'))} ${fmt$(i.cost)}`,'fixInc',{id:i.id},'red sm',S.cash<i.cost)}</div>`:''}</div>`;}
    h+=logSection();UI.logSeen=Date.now();
    h+=`<div class="kv"><span>${tr('DDoS scrubbing')}</span><b>${hasScrub()?tr('On · {city}',{city:S.scrubs.map(x=>CITY[x.city].name).join(', ')}):tr('None (build one from a POP\'s Infra tab)')}</b></div>`;
    {const pops=Object.keys(S.pops),nfs=pops.filter(c=>fsAt(c)).length;
     h+=`<div class="kv"><span>${tr('Flowspec-capable POPs')}</span><b>${nfs}/${pops.length}</b></div>`;
     if(nfs<pops.length)h+=`<p class="meta" style="margin:2px 0 6px">${tr('Flowspec drop rules live in router TCAM, so only capable routers filter known UDP floods (DNS, NTP, CLDAP, SYN) at the edge. The used Rusty has none, merchant-silicon and whitebox models do a little, the big chassis do it in full. Upgrade a POP’s router from its Infra tab.')}</p>`;}
    if(S.grace&&S.grace.until>S.day&&R.graceNets)h+=`<div class="kv"><span>${tr('Courtesy route')}</span><b>${tr('{n} networks · {d} days left',{n:R.graceNets,d:S.grace.until-S.day})}</b></div><p class="meta" style="margin:0 0 6px">${tr('Reaches networks from the last update that you have no other path to, for free. Connect to them before it ends.')}</p>`;
    h+=ddosPanel();
    h+=S.te?`<div class="kv"><span>Auto-TE</span><b>${S.te.on?tr('On · moving {g} onto alternate paths',{g:fmtG(R.teMoved||0)}):tr('Off')}</b></div><div class="btns">${btn(S.te.on?tr('Turn Auto-TE off'):tr('Turn Auto-TE on'),'teToggle',{},'ghost sm')}${btn(S.te.script?tr('Edit RouteScript'):tr('Write a RouteScript'),'teEdit',{},'pink sm')}</div>${S.te.script?`<p class="meta" style="margin:2px 0 6px">RouteScript: ${teRules()?tr('{n} rules live',{n:teRules().n}):S.te.on?tr('has errors, not running'):tr('controller off')}${R.teBlack?` · ${tr('blackholing {g}',{g:fmtG(R.teBlack)})}`:''}</p>`:''}`
      :`<div class="kv"><span>Auto-TE</span><b>${lvl()<3?tr('Unlocks at customer level 3'):tr('Not installed')}</b></div><p class="meta" style="margin:2px 0 6px">${tr('Traffic takes the shortest path, even when it is full. A traffic-engineering controller spills the overflow onto the next-best paths with room.')}</p><div class="btns">${btn(tr('Install Auto-TE <small>{cost} + {mo}/mo</small>',{cost:fmt$(TE_COST),mo:fmt$(TE_MO)}),'buyTE',{},'pink sm',lvl()<3||S.cash<TE_COST)}</div>`;
    const hot=S.links.filter(l=>!linkDown(l)&&capOf(l)>0&&(R.load[l.id]||0)/capOf(l)>=0.85).sort((a,b)=>(R.load[b.id]/capOf(b))-(R.load[a.id]/capOf(a)));
    if(hot.length){h+=`<h3 style="font-size:15px;margin:4px 0">${tr('Congested links')}</h3>${S.te&&S.te.on?'':'<p class="meta" style="margin:0 0 4px">'+tr('Raise a full link’s metric so traffic prefers another path, upgrade it, or install Auto-TE.')+'</p>'}`+hot.map(l=>`<div class="row"><div class="grow"><div class="nm">${CITY[l.a].name} ⇄ ${CITY[l.b].name}</div><div class="meta">${capName(l)} · ${tr('{p} full',{p:pct((R.load[l.id]||0)/capOf(l))})}</div></div>${btn(tr('Inspect'),'selLink',{id:l.id},'pink sm')}</div>`).join('');}
    h+=hwCard();
    const slow=Object.keys(S.pops).filter(latSlow).sort((a,b)=>R.latF[a]-R.latF[b]);
    if(slow.length)h+=`<h3 style="font-size:15px;margin:4px 0">🐢 ${tr('Slow cities')}</h3><p class="meta" style="margin:0 0 4px">${tr('Their users go out through transit far away. Past 50 ms round trip, broadband and internet services count as bad service.')}</p>`+slow.map(c=>{const f=R.latFar[c];return `<div class="row"><div class="grow"><div class="nm">${CITY[c].name} → ${CITY[f.to].name}</div><div class="meta">${tr('{p} of its traffic · {ms} ms round trip · service {sf}',{p:pct(Math.min(1,f.share)),ms:Math.round(f.ms),sf:pct(R.latF[c])})}</div></div>${btn(tr('Inspect'),'focusCity',{city:c},'ghost sm')}</div>`;}).join('');
    const hotR=hotPorts();
    if(hotR.length)h+=`<h3 style="font-size:15px;margin:4px 0">${tr('Ports, caches and routers running hot')}</h3>`+hotR.map(x=>`<div class="row"><span class="hotk hk-${x.k}">${HOTL[x.k]}</span><div class="grow"><div class="nm">${CITY[x.city].name} · ${esc(x.lab)}</div><div class="meta">${tr('{p} full',{p:pct(Math.min(1,x.u))})}${x.u>=0.995?' · '+tr('dropping or overflowing'):''} · ${esc(x.tip)}</div></div>${btn(tr('Inspect'),'focusCity',{city:x.city},'pink sm')}</div>`).join('');
    if(!S.inc.length&&!hot.length&&!hotR.length&&!slow.length)h+=`<p class="empty">${tr('All systems green. Enjoy it while it lasts.')}</p>`;
    h+=`<div class="kv" style="margin-top:8px"><span>${tr('Incidents so far')}</span><b>${S.stats.incidents}</b></div><div class="kv"><span>${tr('Survived with no impact')}</span><b>${S.stats.survived}</b></div>`;
  }else{
    if(Object.keys(S.ixp).length||ibxOpen()||(S.inbox&&S.inbox.bot)){const n=ibxOpen(),u=ibxUrgent();h+=`<div class="ibx ibxcard"><div class="nm">📬 ${tr('Peering inbox')} ${n?`<span class="cnt${u?' red':''}">${n}</span>`:''}</div><div class="meta">${S.inbox&&S.inbox.bot?tr('Large Peering Model is on it.'):u?trn('{n} session is down on its max-prefix limit.','{n} sessions are down on their max-prefix limit.',u):n?trn('{n} message waiting for an answer.','{n} messages waiting for an answer.',n):tr('Inbox zero.')}</div><div class="btns">${btn(tr('Open inbox'),'inbox',{},'sm')}</div></div>`;}
    h+=`<p class="lead">${tr("Every network on the map. Traffic share is how much of your users' traffic goes to them. Tap a connection to jump to its POP.")}</p>`;
    {const nc=conns().length;if(nc)h+=`<div class="btns" style="margin-bottom:8px">${btn(tr('All connections <small>{n}</small>',{n:nc}),'connOpen',{},'pink sm')}</div>`;}
    const where=netWhereIdx(),tl=NETS.filter(n=>n.tail),tlOn=tl.filter(n=>where(n.id).some(x=>x[2]==='ix')).length;
    const foc=UI.netFocus&&NET[UI.netFocus]?NET[UI.netFocus]:null,out=!foc&&UI.nf==='out',lostN=ntLost().length;
    h+=`<div class="btns" style="margin-bottom:8px">${btn(tr('All networks'),'netFilter',{f:'all'},!foc&&!out?'sm':'ghost sm')}${btn(tr('Out of reach without transit <small>{n}</small>',{n:lostN}),'netFilter',{f:'out'},out?'sm':'ghost sm')}</div>`;
    if(out&&!lostN)h+=`<p class="empty">${tr('Nothing: every network is reachable without transit.')}</p>`;
    for(const n of foc?[foc]:out?ntLost():NETS){if(n.tail&&!UI.tailOpen&&!foc&&!out)continue;
      h+=`<div class="row">${logo(n)}<div class="grow"><div class="nm">${esc(n.name)} <span class="meta">AS${n.asn}</span></div><div class="meta"><span class="tag ${n.type}">${TYPE_L[n.type]}</span> <span class="tag ${n.pol}">${n.pol}</span> · ${tr('{p}% of traffic',{p:(NSH[n.id]*100).toFixed(1)})}${n.price?` · ${tr('transit ${price}/Gbps',{price:(n.price*S.priceMul).toFixed(2)})}`:''}</div><div class="meta">${esc(n.blurb)}</div>${netWhere(n,where)}${(foc||out)&&!R.nt[n.id]?`<p class="why">${esc(offTransitHint(n.id))}</p>`:''}${foc||out&&!R.nt[n.id]?meetLine(n,foc?24:4):''}</div></div>`;}
    if(!foc&&!out)h+=`<div class="row"><div class="grow"><div class="nm">${tr('The long tail')} <span class="meta">${tr('{n} small networks',{n:tl.length})}</span></div><div class="meta">${tr('{p}% of traffic between them, scattered across exchanges. You peer with {n}.',{p:(tl.reduce((a,n)=>a+NSH[n.id],0)*100).toFixed(1),n:tlOn})}</div></div>${btn(UI.tailOpen?tr('Hide'):tr('Show'),'tailTog',{},'ghost sm')}</div>`;
  }
  if(h!==UI._lh){UI._lh=h;morph($('leftBody'),h);}
}
function renderPanel(){checkLayer();
  const P=$('panel');
  if(!S||!UI.sel){P.hidden=true;return;}
  P.hidden=false;
  const scrollEl=$('panelBody').querySelector('.scroll');const st=scrollEl?scrollEl.scrollTop:0;
  const html=UI.sel.type==='city'?cityPanel(UI.sel.id):linkPanel(UI.sel.id);if(html===UI._ph&&!P.hidden&&$('panelBody').firstChild)return;UI._ph=html;morph($('panelBody'),html);
  const ns=$('panelBody').querySelector('.scroll');if(ns)ns.scrollTop=st;
}
