const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');
function setup(t, level = 13) {
  const h = load();
  t.after(() => h.dom.window.close());
  h.ev(`ACT.start({});UI.speed=0;S.cash=1e8;S.lvl=${level};for(const g of GOALS)S.done[g.id]=0;compute()`);
  return h;
}
const json = (h, expr) => JSON.parse(h.ev(`JSON.stringify(${expr})`));

test('management progression, HUD entry and subscription enforce every tool boundary', t => {
  const h = setup(t, 1), { ev } = h;
  assert.deepEqual(json(h, 'NM_TOOLS.map(t=>t.lv)'), [2, 4, 6, 7, 8, 10, 12]);
  ev('ACT.nmSubscribe()');
  assert.equal(ev('S.nm'), null);
  ev('ACT.utilities()');
  assert.equal(ev('document.querySelector("[data-act=nmSubscribe]").disabled'), true);
  ev('S.lvl=2;S.cash=NM_MO-1;ACT.nmSubscribe()');
  assert.equal(ev('S.nm'), null);
  ev('S.cash=1e8;ACT.nmSubscribe()');
  assert.equal(ev('nmActive()'), true);
  assert.equal(ev('S.cash'), 1e8 - ev('NM_MO'));
  const cash = ev('S.cash');
  ev('ACT.nmSubscribe()');
  assert.equal(ev('S.cash'), cash, 'repeat subscription does not charge twice');
  for (const tool of json(h, 'NM_TOOLS')) {
    ev(`S.lvl=${tool.lv - 1}`);
    assert.equal(ev(`nmAllowed('${tool.id}')`), false, tool.id);
    ev(`S.lvl=${tool.lv}`);
    assert.equal(ev(`nmAllowed('${tool.id}')`), true, tool.id);
  }
  ev('ACT.menu()');
  assert.equal(ev('!!document.querySelector("#modalCard [data-act=utilities]")'), false);
  assert.equal(ev('!!document.querySelector("#hud [data-act=utilities]")'), true);
  assert.deepEqual(h.errors, []);
});

test('prepaid billing charges once per period, not again in daily cash flow', t => {
  const a = setup(t, 2), b = setup(t, 2);
  a.ev('ACT.nmSubscribe()');
  for (let day = 1; day <= 30; day++) {
    a.ev('dayTick()'); b.ev('dayTick()');
    assert.ok(Math.abs(b.ev('S.cash') - a.ev('S.cash') - a.ev('NM_MO') * (day < 30 ? 1 : 2)) < 1e-5, `day ${day}`);
  }
  assert.equal(a.ev('S.nm.until'), 60);
  assert.equal(a.ev('R.costMo') - b.ev('R.costMo'), a.ev('NM_MO'));
  a.ev('save();S=migrate(JSON.parse(localStorage.getItem("sot-save-v1")));compute()');
  assert.equal(a.ev('S.nm.until'), 60);
  assert.equal(a.ev('S.nm.renew'), true);
  assert.deepEqual(a.errors, []);
});

test('cancellation retains paid access and equipment; expiry and failed renewal close the gate', t => {
  const { ev, errors } = setup(t);
  ev("ACT.nmSubscribe();ACT.utilityKit({city:'fra',cost:utilityKit('fra').cost});ACT.nmCancel()");
  assert.equal(ev('nmActive()'), true);
  const equipment = ev('JSON.stringify(S.pops)');
  ev('S.day=29;nmDay()');
  assert.equal(ev('nmActive()'), true);
  const cash = ev('S.cash');
  ev('S.day=30;nmDay();compute()');
  assert.equal(ev('nmActive()'), false);
  assert.equal(ev('R.cost.management'), 0);
  assert.equal(ev('S.cash'), cash);
  assert.equal(ev('JSON.stringify(S.pops)'), equipment);
  ev('ACT.nmSubscribe();ACT.nmCancel();ACT.nmSubscribe()');
  assert.equal(ev('S.cash'), cash - ev('NM_MO'), 'resume within paid term is free');
  ev('S.day=S.nm.until;S.cash=NM_MO-1;nmDay();compute()');
  assert.equal(ev('nmActive()'), false);
  assert.equal(ev('S.nm.renew'), false);
  assert.equal(ev('S.cash'), ev('NM_MO-1'));
  assert.equal(ev('R.cost.management'), 0);
  assert.deepEqual(errors, []);
});

test('old and malformed saves do not acquire a subscription or unbounded access', t => {
  const { ev, errors } = setup(t);
  for (const nm of ['undefined', 'true', '[]', '"active"', '{until:"999"}', '{until:Infinity}']) {
    ev(`S.nm=${nm};S=sanitize(S);compute()`);
    assert.equal(ev('S.nm'), null, nm);
  }
  ev('S.nm={until:999999999,renew:"yes"};S=sanitize(S)');
  assert.equal(ev('S.nm.until'), ev('S.day+NM_DAYS'));
  assert.equal(ev('S.nm.renew'), false);
  assert.deepEqual(errors, []);
});

test('locked and expired direct actions cannot change the network or run audits', t => {
  const h = setup(t), { ev } = h;
  ev("ACT.buyIx({city:'fra',tier:0,signed:true});S.pops.fra.bb={d:5000};S.pops.fra.site2=true;S.transit=[{id:'t',city:'fra',net:'cog',tier:0,n:2,site:'a'}];compute()");
  const actions = ["ACT.utilityRouteServers()", "ACT.utilityPeers()", "ACT.utilityKit({city:'fra',cost:utilityKit('fra').cost})", "ACT.utilityCaches({city:'fra',quote:utilityCaches('fra').key})", "ACT.nmSplit({city:'fra'})", "ACT.nmAudit({city:'fra',kind:'capacity'})", "ACT.nmAudit({city:'fra',kind:'diversity'})"];
  for (const state of ['S.nm=null', 'S.nm={until:S.day,renew:true}', 'S.nm={until:S.day+30,renew:true};S.lvl=1']) {
    ev(state);
    const before = ev('JSON.stringify(S)');
    for (const action of actions) { ev(action); assert.equal(ev('JSON.stringify(S)'), before, action); }
    assert.equal(ev('!!document.querySelector(".nm-report")'), false);
  }
  assert.deepEqual(h.errors, []);
});

test('LAG distribution preserves quantities and prices, skips pending and single ports, and joins the kit at level 7', t => {
  const h = setup(t, 6), { ev } = h;
  ev("ACT.nmSubscribe();ACT.buyIx({city:'fra',tier:0,signed:true});S.ixn={fra:3};S.transit=[{id:'two',city:'fra',net:'cog',tier:0,n:2,site:'a'},{id:'one',city:'fra',net:'cog',tier:0,n:1,site:'b'}];S.pni=[{id:'live',city:'fra',net:'ggl',tier:0,n:4,site:'b',ready:0},{id:'pending',city:'fra',net:'cfl',tier:0,n:2,ready:100}];compute();ACT.utilityKit({city:'fra',cost:utilityKit('fra').cost})");
  assert.equal(ev('S.transit[0].site'), 'a', 'level 6 kit does not unlock LAG placement');
  ev('S.lvl=7;compute()');
  const cash = ev('S.cash'), mo = ev('R.costMo'), ports = ev("portsUsed('fra')");
  ev("ACT.utilityKit({city:'fra',cost:0})");
  assert.equal(ev('S.transit[0].site'), 'ab');
  assert.equal(ev('S.transit[1].site'), 'b');
  assert.equal(ev('S.pni[0].site'), 'ab');
  assert.notEqual(ev('S.pni[1].site'), 'ab');
  assert.equal(ev('S.ixSite.fra'), 'ab');
  assert.equal(ev('S.ixn.fra'), 3);
  assert.equal(ev('S.cash'), cash);
  assert.equal(ev('R.costMo'), mo);
  assert.equal(ev("portsUsed('fra')"), ports);
  const before = ev('JSON.stringify(S)');
  ev("ACT.nmSplit({city:'fra'})");
  assert.equal(ev('JSON.stringify(S)'), before);
  for (const site of ['a','b']) {
    ev(`S.inc=[{type:'site',ref:'fra',site:'${site}',until:S.day+2}];compute()`);
    assert.ok(ev("liveN('fra',S.transit[0].site,S.transit[0].n)") > 0);
  }
  assert.deepEqual(h.errors, []);
});

test('capacity audit flags overloaded survivor routers, odd LAGs and unbalanced caches without mutating state', t => {
  const h = setup(t), { ev } = h;
  ev("ACT.nmSubscribe();Object.assign(S.pops.fra,{routers:3,site2:true});S.transit=[{id:'t',city:'fra',net:'cog',tier:0,n:3,site:'ab'}];S.caches=[{id:'c1',city:'fra',net:'ggl',site:'a'},{id:'c2',city:'fra',net:'ggl',site:'a'}];compute();R.nodeLoad.fra=RG[0].cap*2;R.useT.t=15;R.useCache.c1=5");
  const before = ev('JSON.stringify(S)'), q = json(h, "nmCapacity('fra')");
  assert.equal(q.rows[0].use, q.rows[0].cap);
  assert.ok(q.rows[1].use > q.rows[1].cap);
  assert.equal(q.services[0].cap, 10, 'three-member LAG has one member after losing the larger half');
  assert.ok(q.services[0].use > q.services[0].cap);
  assert.equal(q.services[1].cap, 0);
  ev("ACT.nmAudit({city:'fra',kind:'capacity'})");
  assert.equal(ev('JSON.stringify(S)'), before);
  assert.match(ev('document.querySelector(".nm-report").textContent'), /no traffic rerouting is simulated/);
  ev("S.pops.fra.site2=false;S.pops.fra.routers=1;compute()");
  assert.equal(ev("nmCapacity('fra').rows.every(r=>r.cap===0)"), true);
  assert.deepEqual(h.errors, []);
});

test('physical audit finds shared cable and fabric failures beyond the first hop and handles disconnected PoPs', t => {
  const h = setup(t), { ev } = h;
  ev("ACT.nmSubscribe();for(const city of ['ams','lon','par'])S.pops[city]={day:0,routers:1};window.add=(id,a,b,trench)=>S.links.push({id,a,b,trench,kind:'wave',tier:0,km:kmBetween(a,b),mo:0,cut:0});add('one','fra','ams','shared');add('two','fra','ams','shared');add('three','ams','lon','downstream');compute()");
  let q = json(h, "nmDiversity('fra')");
  assert.deepEqual(q.disconnected, ['par']);
  assert.equal(q.shared.length, 1);
  assert.ok(q.risks.some(r => r.lost.includes('lon') && r.links[0].id === 'three'), 'downstream bridge matters');
  assert.ok(q.risks.some(r => r.links.length === 2 && r.lost.length === 2), 'parallel links in one trench fail together');
  ev("add('four','fra','lon','different');compute()");
  q = json(h, "nmDiversity('fra')");
  assert.equal(q.risks.length, 0, 'triangle survives each single risk failure');
  ev("S.links.forEach(l=>{l.kind='vxc';l.prov=FABS[0].id;l.vt=1;});compute()");
  q = json(h, "nmDiversity('fra')");
  assert.equal(q.risks.length, 1, 'one fabric is a shared failure despite different trenches');
  assert.equal(q.risks[0].lost.length, 2);
  const before = ev('JSON.stringify(S)');
  ev("ACT.nmAudit({city:'fra',kind:'diversity'})");
  assert.equal(ev('JSON.stringify(S)'), before);
  ev("S.links.forEach(l=>l.cut=S.day+3);compute()");
  assert.equal(ev("nmDiversity('fra').disconnected.length"), 3);
  assert.deepEqual(h.errors, []);
});
