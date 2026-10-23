const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

function setup(ev) {
  ev("ACT.start({});S.cash=1e8;for(const g of GOALS)S.done[g.id]=0");
}

test('big selective peers refuse in some cities, with a reason, and only for a while', () => {
  const { ev, errors } = load();
  setup(ev);
  const r = JSON.parse(ev(`(()=>{let tot=0,hit=0,small=0,ex=null;
    for(const n of NETS){for(const c of ALLC){const sn=snub(n.id,c);
      if(!bigPeer(n)){if(sn)small++;continue;}tot++;if(sn){hit++;ex=ex||{id:n.id,c,sn};}}}
    return JSON.stringify({tot,hit,small,ex});})()`));
  assert.equal(r.small, 0, 'small networks never snub');
  assert.ok(r.hit > 0 && r.hit < r.tot * 0.4, `some but not most pairs snub (${r.hit}/${r.tot})`);
  const { id, c, sn } = r.ex;
  assert.equal(ev(`JSON.stringify(snub('${id}','${c}'))`), JSON.stringify(sn), 'stable when asked again');
  const why = ev(`peerOk('${id}','ix','${c}').why`);
  assert.match(why, /reconsider in \d+ day/);
  assert.equal(ev(`peerOk('${id}','pni','${c}').snub===true`), sn.all, 'PNI is only refused for region-wide snubs');
  ev(`S.day=${sn.until}`);
  assert.equal(ev(`!!(snub('${id}','${c}')&&snub('${id}','${c}').until===${sn.until})`), false, 'the window ends');
  assert.deepEqual(errors, []);
});

test('a snubbing peer tears down an existing session and the Request button explains why', () => {
  const { ev, errors } = load();
  setup(ev);
  const k = ev(`(()=>{const ok=['fra','ams','lon','par','nyc','ash','sjc','sin','tok','hkg','mad','mrs','jnb'];
    for(let d=0;d<600;d++)for(const n of NETS)for(const c of ok){if(!ixMembers(c).includes(n.id))continue;
      S.day=d;const a=snub(n.id,c);S.day=d+1;const b=snub(n.id,c);S.day=0;if(!a&&b)return n.id+'@'+c+'@'+d;}})()`);
  assert.ok(k, 'found a snub starting at an IX');
  const [id, c, d] = k.split('@');
  ev(`S.day=${d}`);
  ev(`ACT.buildPop({city:'${c}'});ACT.buyIx({city:'${c}',tier:1});S.peers['${id}@${c}']=true;compute()`);
  assert.equal(ev(`ixSessions('${c}').has('${id}')`), true);
  ev('dayTick()');
  assert.equal(ev(`!!S.peers['${id}@${c}']`), false, 'session torn down');
  assert.ok(ev(`S.log.some(e=>/de-peered you/.test(e.t))`));
  ev(`selectCity('${c}');ACT.tab({t:'peer'})`);
  assert.match(ev("document.getElementById('panelBody').textContent"), /reconsider in/);
  assert.deepEqual(errors, []);
});

test('remote peering is offered but costs more, gives less and gets refused more', () => {
  const { ev, errors } = load();
  setup(ev);
  const fab = ev("(FABS.find(f=>f.cities.includes('fra')&&f.cities.includes('ams'))||{}).id");
  assert.ok(fab, 'a fabric covers fra and ams');
  ev(`ACT.buyNni?ACT.buyNni({city:'fra',prov:'${fab}',tier:1}):0`);
  ev(`if(!S.links.some(l=>l.kind==='vxc')){const km=kmBetween('fra','ams');S.links.push({id:uid(),a:'fra',b:'ams',kind:'vxc',prov:'${fab}',vt:1,km,sub:false,mo:vxcMo(km,false,1),cut:0,day:S.day})}`);
  assert.ok(ev("remoteCities().includes('ams')"));
  ev("selectCity('ams');ACT.tab({t:'peer'})");
  const txt = () => ev("document.getElementById('panelBody').textContent");
  ev("ACT.buyIx({city:'ams',tier:1});compute()");
  assert.equal(ev("isRemote('ams')"), true);
  assert.equal(ev("ixPortMo('ams',1)"), ev("Math.round(PORT[1].ix*1.5)"), 'reseller markup');
  assert.equal(ev("ixCap('ams')"), ev("PORT[1].g*0.8"), 'oversubscribed port');
  const refusers = JSON.parse(ev("JSON.stringify(ixMembers('ams').filter(noRemote))"));
  assert.ok(refusers.length > 0, 'some members refuse remote peers');
  const r = JSON.parse(ev(`JSON.stringify(peerOk('${refusers[0]}','ix','ams'))`));
  assert.equal(r.ok, false); assert.equal(r.remote, true);
  assert.equal(ev(`noRemote('drz')`), false, 'open networks still peer, also via the route server');
  ev("ACT.rs({city:'ams'});compute()");
  assert.ok(ev("ixSessions('ams').size") > 0);
  ev("selectCity('ams');ACT.tab({t:'peer'})");
  assert.match(txt(), /refuse remote peers/);
  ev("ACT.buildPop({city:'ams'});compute()");
  assert.equal(ev("isRemote('ams')"), false, 'a real POP makes it local again');
  assert.equal(ev(`peerOk('${refusers[0]}','ix','ams').remote`), undefined);
  assert.deepEqual(errors, []);
});

test('Amsterdam has a second IX, FRIES-IX, with free ports up to 400G', () => {
  const { ev, errors } = load();
  setup(ev);
  assert.deepEqual(JSON.parse(ev("JSON.stringify(cityIxes('ams'))")), ['ams', 'ams:fries']);
  ev("ACT.buildPop({city:'ams'});S.pops.ams.rgen=RG.length-1;compute()");
  const cash = () => ev('S.cash');
  let c0 = cash();
  ev("ACT.buyIx({city:'ams:fries',tier:2})");
  assert.equal(ev("S.ixp['ams:fries']"), 2);
  assert.equal(cash(), c0, '400G port is free');
  assert.equal(ev("S.ixp.ams"), undefined, 'HAMS-IX is separate');
  c0 = cash();
  ev("ACT.lagIx({city:'ams:fries',d:1})");
  assert.equal(cash(), c0, 'LAG members are free too');
  assert.equal(ev("ixPortMo('ams:fries',3)"), ev('PORT[3].ix'), '800G costs the usual price');
  ev("ACT.buyIx({city:'ams',tier:1});ACT.rs({city:'ams:fries'});compute()");
  assert.ok(ev("ixSessions('ams:fries').has('drz')"));
  assert.equal(ev("ixSessions('ams:fries').has('ggl')"), false, 'Goggle is not a member');
  assert.equal(ev("R.useIx['ams:fries']!==undefined&&R.useIx.ams!==undefined"), true, 'both fabrics carry traffic');
  assert.equal(ev("R.cost.ix"), ev("PORT[1].ix"), "only the HAMS-IX port is billed");
  ev("selectCity('ams');ACT.tab({t:'peer'})");
  const txt = ev("document.getElementById('panelBody').textContent");
  assert.match(txt, /FRIES-IX/); assert.match(txt, /HAMS-IX/);
  ev("S.ev.ixdown={'ams:fries':S.day+2};compute()");
  assert.equal(ev("R.useIx['ams:fries']"), undefined, 'a FRIES-IX outage drops only that fabric');
  assert.notEqual(ev("R.useIx.ams"), undefined);
  ev("S.ev.ixdown={};compute()");
  ev("ACT.cancelIx({city:'ams:fries'});ACT.cancelIx({city:'ams:fries'})");
  assert.equal(ev("S.ixp['ams:fries']"), undefined);
  assert.equal(ev("S.ixp.ams"), 1, 'leaving FRIES-IX keeps the HAMS-IX port');
  assert.equal(ev("Object.keys(S.rs).filter(k=>S.rs[k]).length"), 0);
  assert.deepEqual(errors, []);
});

test('second exchanges are wired up in every city that has one, and Barcelona has Catnip-IX', () => {
  const { ev, errors } = load();
  setup(ev);
  const bad = ev("Object.keys(XIX).flatMap(k=>XIX[k].members.filter(id=>!NET[id]||!NET[id].pops.includes(XIX[k].city)).map(id=>k+':'+id)).join()");
  assert.equal(bad, '', 'every member has a POP in the city');
  assert.ok(ev("Object.keys(XIX).every(k=>CITY[XIX[k].city].ix&&cityIxes(XIX[k].city).includes(k))"), 'each sits beside a main IX');
  assert.equal(ev("ixPortMo('mad:paella',1)"), ev("Math.round(ixPortMo('mad',1)*0.6)"), 'Paella-NIX is cheaper than Siesta-IX');
  assert.equal(ev("ixName('bcn')"), 'Catnip-IX');
  for (const k of JSON.parse(ev('JSON.stringify(Object.keys(XIX))'))) {
    const c = k.split(':')[0];
    ev(`if(!S.pops.${c})ACT.buildPop({city:'${c}'});S.pops.${c}.rgen=RG.length-1;ACT.buyIx({city:'${k}',tier:1});ACT.rs({city:'${k}'})`);
    assert.equal(ev(`S.ixp['${k}']`), 1, `port at ${k}`);
  }
  ev('compute()');
  for (const k of JSON.parse(ev('JSON.stringify(Object.keys(XIX))')))
    assert.ok(ev(`ixSessions('${k}').size`) > 0, `route server sessions at ${k}`);
  for (const c of ['ams', 'mad', 'fra', 'lon', 'nyc', 'jnb', 'syd', 'tok', 'bcn']) {
    ev(`selectCity('${c}');ACT.tab({t:'peer'})`);
    const txt = ev("document.getElementById('panelBody').textContent");
    for (const k of JSON.parse(ev(`JSON.stringify(cityIxes('${c}'))`))) assert.ok(txt.includes(ev(`ixName('${k}')`)), `${k} shown in ${c}`);
  }
  assert.deepEqual(errors, []);
});
