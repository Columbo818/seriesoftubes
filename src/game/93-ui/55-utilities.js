function nmLock(id){const t=NM_TOOLS.find(t=>t.id===id);return lvl()<t.lv?tr('management.unlocks',{lv:t.lv}):tr('management.subscription_required');}
function utilityKitHtml(city,modal=false){if(!S.pops[city])return '';if(!nmAllowed('kit'))return modal?'':`<section><h3>${tr('management.title')}</h3><p class="note">${nmLock('kit')}</p>${btn(tr('common.open'),'utilities',{city},'sm')}</section>`;
  const q=utilityKit(city),p=S.pops[city],row=(label,have)=>`<div class="kv"><span>${label}</span><b>${have?tr('common.installed'):tr('common.none_304f')}</b></div>`;
  return `<section><h3>${tr('utilities.redundancy_kit')}</h3>
    ${row(tr('common.backup_generator'),p.gen)}${row(tr('utilities.second_site'),p.site2)}${row(tr('utilities.two_routers'),(p.routers||1)>=2)}
    <p class="meta">${tr('utilities.cache_moves',{n:q.moves.length})}</p>
    ${nmAllowed('lags')?`<p class="meta">${tr('management.lag_quote',{n:q.lags.length})}</p>`:`<p class="note">${tr('management.lags_unlock',{lv:NM_TOOLS.find(t=>t.id==='lags').lv})}</p>`}
    ${q.cost||q.moves.length||q.lags.length?`<p class="meta">${tr('utilities.kit_cost',{cost:fmt$(q.cost),mo:fmt$(q.mo)})}</p><div class="btns">${btn(tr('utilities.apply_kit'),'utilityKit',{city,cost:q.cost,modal},'pink',q.cost>0&&S.cash<q.cost)}</div>`:`<p class="meta">${tr('utilities.kit_balanced')}</p>`}
    <p class="note">${tr('management.kit_note')}</p></section>${utilityCachesHtml(city,modal)}`;}
function utilityCachesHtml(city,modal=false){if(!nmAllowed('caches'))return '';const q=utilityCaches(city);if(!q)return '';
  return `<section><h3>${tr('common.embedded_caches')}</h3><p class="lead">${tr('utilities.cache_note')}</p>
    <p class="meta">${tr('utilities.cache_quote',{n:q.add.length,mo:fmt$(q.mo)})}</p>
    ${q.free<q.add.length?`<p class="why">${tr('utilities.cache_ports',{need:q.add.length,free:fmtPorts(q.free)})}</p>`:''}
    <div class="btns">${btn(tr('utilities.request_caches',{n:q.add.length}),'utilityCaches',{city,quote:q.key,modal},'pink',!q.add.length||q.free+1e-9<q.add.length)}</div></section>`;}
function nmCapacityHtml(city){const q=nmCapacity(city);if(!q)return '';const row=x=>`<div class="kv"><span>${esc(x.name)}</span><b class="${x.use>x.cap+1e-9||!x.cap?'down':'up'}">${tr('management.capacity_budget',{used:fmtG(x.use),cap:fmtG(x.cap)})}</b></div>`;
  return `<section class="nm-report" role="status"><h3>${tr('management.failover_capacity')}</h3><p class="note">${tr('management.capacity_note',{day:S.day})}</p>
    ${q.incident?`<p class="why">${tr('management.incident_note')}</p>`:''}${q.unused?`<p class="why">${tr('management.no_load')}</p>`:''}
    ${q.rows.map(row).join('')}<h4>${tr('management.surviving_services')}</h4>${q.services.map(row).join('')||`<p>${tr('common.nothing_yet')}</p>`}
    <p class="note">${tr('management.capacity_advice')}</p>${btn(tr('common.inspect'),'focusCity',{city},'sm')}</section>`;}
function nmDiversityHtml(city){const q=nmDiversity(city);if(!q)return '';const names=cs=>cs.map(c=>CITY[c].name).join(', '),links=ls=>ls.map(l=>`${CITY[l.a].name} ↔ ${CITY[l.b].name}${l.kind==='vxc'&&FAB[l.prov]?' ('+FAB[l.prov].name+')':l.cable&&CAB[l.cable]?' ('+CAB[l.cable].name+')':''}`).join(', ');
  return `<section class="nm-report" role="status"><h3>${tr('management.path_diversity')}</h3><p class="note">${tr('management.diversity_note',{day:S.day})}</p>
    ${!q.others?`<p class="why">${tr('management.no_other_pops')}</p>`:''}
    ${q.disconnected.length?`<p class="why">${tr('management.disconnected',{cities:esc(names(q.disconnected))})}</p>`:''}
    <p>${tr('management.risk_summary',{n:q.risks.length,shared:q.shared.length})}</p>
    ${q.risks.map(x=>`<details><summary>${tr('management.cut_risk',{n:x.links.length,lost:x.lost.length})}</summary><p>${esc(links(x.links))}</p><p>${tr('management.lost_pops',{cities:esc(names(x.lost))})}</p>${btn(tr('common.inspect'),'selLink',{id:x.links[0].id},'sm')}</details>`).join('')}
    ${q.shared.length?`<details><summary>${tr('management.shared_paths')}</summary>${q.shared.map(ls=>`<p>${esc(links(ls))} ${btn(tr('common.inspect'),'selLink',{id:ls[0].id},'sm')}</p>`).join('')}</details>`:''}
    <p class="note">${tr('management.diversity_advice')}</p></section>`;}
function utilitiesModal(city,message,audit){if(!S)return;const cities=Object.keys(S.pops).sort((a,b)=>CITY[a].name.localeCompare(CITY[b].name));
  city=S.pops[city]?city:UI.sel&&UI.sel.type==='city'&&S.pops[UI.sel.id]?UI.sel.id:S.pops[S.home]?S.home:cities[0];
  const active=nmActive(),rows=active?utilityPeers():[],n=rows.reduce((v,r)=>v+r.requests.length,0),rs=active?utilityRouteServers().length:0;
  openModal(`<div style="display:flex;align-items:center"><h2 style="font-size:26px">${tr('management.title')}</h2><button class="x" data-act="closeModal" aria-label="${tr('common.close')}">×</button></div>
    ${message?`<p role="status" class="note">${esc(message)}</p>`:''}
    <section><p class="lead">${tr('management.subscription_note',{price:fmt$(NM_MO),days:NM_DAYS})}</p>
    ${active?`<p>${tr(S.nm.renew?N_('management.renews'):N_('management.expires'),{date:dateStr(S.nm.until)})}</p><div class="btns">${S.nm.renew?btn(tr('management.cancel'),'nmCancel',{city},'ghost sm'):btn(tr('management.resume'),'nmSubscribe',{city},'sm')}</div>`:`<p class="note">${lvl()<2?tr('management.unlocks',{lv:2}):tr('management.subscription_required')}</p>${btn(tr('management.subscribe_price',{price:fmt$(NM_MO)}),'nmSubscribe',{city},'pink',lvl()<2||S.cash<NM_MO)}`}
    <details${active?'':' open'}><summary>${tr('management.unlock_order')}</summary><ol class="nm-roadmap">${NM_TOOLS.map(t=>`<li>${tr('management.tool_level',{lv:t.lv,name:tr(t.name)})} ${lvl()>=t.lv?'✓':'🔒'}</li>`).join('')}</ol></details></section>
    ${active?`<section><h3>${tr('utilities.ix_peering')}</h3><p class="lead">${tr('utilities.peering_note')}</p>
    <div class="btns">${btn(tr('utilities.join_route_servers',{n:rs}),'utilityRouteServers',{city},'pink',!rs||!nmAllowed('rs'))}${btn(tr('utilities.request_all',{n}),'utilityPeers',{city},'',!n||!nmAllowed('peers'))}</div>
    ${!nmAllowed('peers')?`<p class="note">${nmLock('peers')}</p>`:''}<p class="meta">${tr('utilities.route_server_note')}</p>
    ${ppol()!=='open'?`<p class="why">${tr('link_panels.off_while_your_peering_policy_is',{pol:tr(PPOL_N[ppol()])})}</p>${btn(tr('common.peering_policy'),'inbox',{},'ghost sm')}`:''}
    ${rows.map(r=>`<details><summary>${esc(ixName(r.ix))} · ${tr('utilities.peer_counts',{ready:r.requests.length,existing:r.existing,blocked:r.blocked.length})}</summary>${r.blocked.map(b=>`<p class="meta"><b>${esc(NET[b.id].name)}</b>: ${esc(b.why)}</p>`).join('')}</details>`).join('')}</section>
    ${cities.length?`<section><label for="utilityCity">${tr('common.your_pop')}</label><div class="btns"><select id="utilityCity" style="max-width:100%">${cities.map(c=>`<option value="${c}"${c===city?' selected':''}>${esc(CITY[c].name)}</option>`).join('')}</select>${btn(tr('utilities.view_pop'),'utilityPick',{},'sm')}</div></section>${utilityKitHtml(city,true)}
    <section><h3>${tr('management.pop_tools')}</h3>${['kit','caches'].filter(id=>!nmAllowed(id)).map(id=>`<p class="note">${tr(NM_TOOLS.find(t=>t.id===id).name)}: ${nmLock(id)}</p>`).join('')}
    <div class="btns">${btn(tr('management.split_lags'),'nmSplit',{city},'',!nmAllowed('lags')||!S.pops[city].site2||!nmLags(city).length)}${['capacity','diversity'].map(kind=>btn(tr(NM_TOOLS.find(t=>t.id===kind).name),'nmAudit',{city,kind},'sm',!nmAllowed(kind))).join('')}</div>
    <p class="note">${tr('management.lag_note')}</p>${['lags','capacity','diversity'].filter(id=>!nmAllowed(id)).map(id=>`<p class="note">${tr(NM_TOOLS.find(t=>t.id===id).name)}: ${nmLock(id)}</p>`).join('')}</section>
    ${audit&&nmAllowed(audit)?audit==='capacity'?nmCapacityHtml(city):audit==='diversity'?nmDiversityHtml(city):'':''}`:''}`:''}`);
}
