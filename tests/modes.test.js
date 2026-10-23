const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

test('sandbox: endless money, every unlock, nothing breaks, no badges', () => {
  const { ev, errors } = load();
  ev("ACT.modeSet({m:'sandbox'});ACT.start({})");
  assert.equal(ev("S.mode"), 'sandbox');
  assert.equal(ev("S.lvl"), 4);
  ev("S.cash=5;for(let i=0;i<120;i++)dayTick()");
  assert.ok(ev("S.cash") >= 1e8, 'money refills');
  assert.equal(ev("S.stats.incidents"), 0, 'no failures');
  assert.equal(ev("Object.keys(S.ach||{}).length"), 0, 'no badges in sandbox');
  assert.match(ev("document.getElementById('hAsn').textContent"), /Sandbox/);
  assert.deepEqual(errors, []);
});

test('scenarios: rules apply, goals complete, deadlines fail, seeds repeat', () => {
  const { ev, errors } = load();
  ev("ACT.scenarios()");
  assert.match(ev("document.getElementById('modalCard').textContent"), /Weekly challenge/);
  ev("ACT.startScn({id:'stg'})");
  assert.equal(ev("S.home"), 'stg');
  ev("ACT.buyTransit({city:'stg',net:'drz',tier:1})");
  assert.equal(ev("S.transit.length"), 0, 'no transit in the Spätzle-IX scenario');
  ev("ACT.startScn({id:'redsea'})");
  assert.equal(ev("cablesOk('mrs','sin').length"), 0, 'Red Sea routes are gone');
  assert.ok(ev("cablesFor('mrs','sin').length") > 0);
  ev("ACT.startScn({id:'carnaval'})");
  assert.ok(ev("S.biz.some(b=>b.type==='event'&&b.start===90)"), 'Carnaval is pre-booked');
  ev("S.day=99;S.scn.done=0;dayTick()");
  assert.ok(ev("!!S.scn.failed"), 'deadline passes');
  assert.match(ev("document.getElementById('modalCard').textContent"), /Time's up/);
  // weekly: same seed gives the same first random numbers
  ev("ACT.startWeekly()");const a = ev("[Math.random(),Math.random()].join()");
  ev("ACT.startWeekly()");const b = ev("[Math.random(),Math.random()].join()");
  assert.equal(a, b);
  ev("S.stats.peak=1234;S.day=364;dayTick()");
  assert.match(ev("document.getElementById('modalCard').textContent"), /score/i);
  assert.ok(ev("!!JSON.parse(localStorage.getItem('sot-scn')).weekly"));
  assert.deepEqual(errors, []);
});

test('completing a scenario records it and unlocks a badge', () => {
  const { ev, errors } = load();
  ev("localStorage.removeItem('sot-scn');ACT.startScn({id:'spat'});R.reach=1;R.served=200;scnTick(10)");
  assert.equal(ev("S.scn.done"), 10);
  assert.ok(ev("!!JSON.parse(localStorage.getItem('sot-scn')).spat"));
  ev("checkBadges()");
  assert.ok(ev("S.ach.scen1!==undefined"));
  assert.deepEqual(errors, []);
});

test('traceroute shows hops, the exit and the AS path', () => {
  const { ev, errors } = load();
  ev("ACT.start({});S.cash=1e9;S.lvl=4;for(const g of GOALS)S.done[g.id]=0;ACT.launchBB({city:'fra'})");
  ev("ACT.buildPop({city:'ams'});UI.via=null;openLinkModal('fra','ams');ACT.buildLink({tier:1});closeModal();ACT.buyTransit({city:'ams',net:'lvl',tier:1});ACT.buyIx({city:'fra',tier:1,signed:true});ACT.rs({city:'fra'});compute()");
  let r = JSON.parse(ev("JSON.stringify(traceroute('fra',{net:'nfx'}))"));
  assert.match(r.text, /traceroute to/);
  assert.match(r.text, /ams/, 'goes via Amsterdam to transit');
  assert.deepEqual(r.asPath.slice(0, 2), [ev('S.asn'), ev("NET.lvl.asn")]);
  r = JSON.parse(ev("JSON.stringify(traceroute('fra',{net:'akm'}))"));
  assert.match(r.why, /peering/i, 'open network over the IX route server');
  r = JSON.parse(ev("JSON.stringify(traceroute('ams',{city:'fra'}))"));
  assert.match(r.text, /fra/);
  ev("S.links[0].cut=S.day+3;compute()");
  r = JSON.parse(ev("JSON.stringify(traceroute('fra',{net:'nfx'}))"));
  assert.ok(/unreachable/.test(r.text) || /peering/i.test(r.why));
  ev("ACT.trace({city:'fra'})");
  assert.match(ev("document.getElementById('modalCard').textContent"), /Traceroute/);
  ev("ACT.share()");
  assert.deepEqual(errors, []);
});
