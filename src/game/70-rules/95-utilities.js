/* Utilities: plan from live state, then apply a whole batch with one recompute. */
function utilityRouteServers(){return S?Object.keys(S.ixp).filter(ix=>isIx(ix)&&!S.myIx[ix]&&!S.rs[ix]):[];}
function utilityKit(city){const p=S&&S.pops[city];if(!p)return null;
  const gen=!p.gen,site=!p.site2,router=(p.routers||1)<2,g=p.rgen||0;
  return {gen,site,router,cost:(gen?GEN_COST:0)+(site?SITE2_COST:0)+(router?routerCost(g,1):0),
    mo:(gen?GEN_MO:0)+(site?SITE2_MO:0)+(router?routerMo(g):0)};}
function utilityPeers(){if(!S)return [];return Object.keys(S.ixp).filter(isIx).map(ix=>{
  const sessions=ixSessions(ix),requests=[],blocked=[];let existing=0;
  for(const id of ixMembers(ix)){
    // Existing but temporarily down sessions must not be repeatedly requested.
    if(sessions.has(id)||S.peers[id+'@'+ix]){existing++;continue;}
    const chk=peerOk(id,'ix',ix);if(chk.ok)requests.push(id);else blocked.push({id,why:chk.why});
  }
  return {ix,requests,blocked,existing};
});}
