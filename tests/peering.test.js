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
