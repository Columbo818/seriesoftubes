Object.assign(ACT,{
 utilities:({city}={})=>{if(S)utilitiesModal(city);},
 utilityPick:()=>{if(S&&$('utilityCity'))utilitiesModal($('utilityCity').value);},
 utilityRouteServers:({city}={})=>{if(!S)return;const ids=utilityRouteServers();for(const ix of ids)S.rs[ix]=true;
   if(ids.length){sfx('build');after();}utilitiesModal(city,tr('utilities.route_servers_joined',{n:ids.length}));},
 utilityKit:({city,cost,modal})=>{const q=utilityKit(city);if(!q||!q.cost)return;
   // Prices can change while a modal is open. Refresh the quote before spending more.
   if(q.cost!==+cost){if(modal)utilitiesModal(city,tr('utilities.quote_changed'));else{renderPanel();toast(tr('utilities.quote_changed'));}return;}
   if(!spend(q.cost))return;const p=S.pops[city];
   if(q.gen)p.gen=true;if(q.site){p.site2=true;p.site2Day=S.day;}if(q.router)p.routers=2;
   after();const msg=tr('utilities.kit_installed',{city:CITY[city].name});if(modal)utilitiesModal(city,msg);else toast(esc(msg),'good');},
 utilityPeers:({city}={})=>{if(!S)return;const rows=utilityPeers();let n=0;
   for(const row of rows)for(const id of row.requests){S.peers[id+'@'+row.ix]=true;n++;}
   if(n){sfx('build');after();}utilitiesModal(city,tr('utilities.peers_requested',{n}));},
});
