const test = require('node:test');
const assert = require('node:assert/strict');
const { load, seed } = require('./harness');

test('page boots to the title screen without errors', () => {
  const { ev, errors } = load();
  assert.equal(ev("document.getElementById('modal').hidden"), false);
  assert.match(ev("document.getElementById('modalCard').textContent"), /Series\s*of\s*Tubes/);
  assert.deepEqual(errors, []);
});

test('every city sits on its landmass', () => {
  const { ev } = load();
  const off = ev("CITIES.filter(c=>!inPoly(c.x,c.y,LANDS.find(l=>l.id===c.land).pts)).map(c=>c.id).join()");
  assert.equal(off, '');
});

test('every cable lands at two known cities and has a length', () => {
  const { ev } = load();
  const bad = ev("CABLE_PAIRS.filter(c=>!CITY[c.a]||!CITY[c.b]||!(c.km>0)).map(c=>c.cid).join()");
  assert.equal(bad, '');
});

test('a year of scripted play stays healthy', () => {
  const { ev, errors } = load();
  seed(ev, 7);
  ev("ACT.start({})");
  ev("ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'cog',tier:1});ACT.buyIx({city:'fra',tier:1});ACT.rs({city:'fra'})");
  ev("UI.pending={a:'fra',b:'ams'};ACT.buildLink({tier:1});ACT.launchBB({city:'ams'})");
  for (let d = 0; d < 360; d++) {
    ev('dayTick()');
    if (d % 30 === 0) ev("for(const o of S.offers.slice())if(S.pops[o.city]&&(!o.city2||S.pops[o.city2]))ACT.accept({id:o.id})");
  }
  assert.ok(ev('S.day') >= 360);
  assert.ok(Number.isFinite(ev('S.cash')), 'cash is a number');
  assert.ok(ev('R.served') > 0, 'traffic is flowing');
  assert.equal(ev("JSON.stringify(R).includes('NaN')||JSON.stringify(S).includes('null,null')"), false);
  assert.deepEqual(errors, []);
});

test('every incident and event type fires and clears cleanly', () => {
  const { ev, errors } = load();
  seed(ev, 3);
  ev("ACT.start({});S.cash=1e8;S.lvl=4;S.day=100");
  ev("for(const c of ['ams','lon','nyc','mos','mnl'])ACT.buildPop({city:c})");
  ev("ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'cog',tier:1});ACT.buyIx({city:'fra',tier:1});ACT.rs({city:'fra'})");
  ev("UI.pending={a:'fra',b:'ams'};ACT.buildLink({tier:1});UI.via='grace';openLinkModal('nyc','lon');ACT.buildLink({tier:1});closeModal()");
  ev("UI.pending={a:'fra',b:'ams'};UI.lmode='df';UI.dfSys='roadm';ACT.orderDf();UI.lmode='wave';S.pops.fra.rgen=2;S.pops.ams.rgen=2");
  ev("const df=S.links.find(l=>l.kind==='df');ACT.addCh({id:df.id,o:'zr4'});df.ready=S.day");
  const failSrc = ev('fireFailure.toString()');
  const types = ['harmless','fatwave','label','mtu','oops','cleaner','maxpfx','prepend','rpki','amp','roadmff','optic','ac','cut','crash','power','transit','ixloop','leak','ddos'];
  for (const t of types) {
    const funny = ['harmless','fatwave','label','mtu','oops','cleaner','maxpfx','prepend','rpki','roadmff','ac'].includes(t);
    const patched = failSrc
      .replace(/^function fireFailure/, 'function')
      .replace('let tot=opts.reduce', `if(!opts.some(o=>o[0]==='${funny ? 'funny' : t}'))return;opts.splice(0,opts.length,['${funny ? 'funny' : t}',1]);let tot=opts.reduce`)
      .replace('type=pick(f);}', `type=f.includes('${t}')?'${t}':pick(f);}`);
    ev('window.__ff=' + patched);
    ev('S.links.forEach(l=>{l.cut=0;l.eqDown=0;l.chFail=null});S.transit.forEach(t=>t.down=0);for(const c in S.pops)S.pops[c].down=0;compute()');
    ev('__ff()');
    ev('dayTick()');
  }
  const evSrc = ev('fireEvent.toString()');
  for (const e of ['viral','price','grant','sanction','tariff','hijack','landban','shutdown','redsea','baltic','runet','typhoon','golden','gfw']) {
    ev('window.__fe=' + evSrc.replace(/^function fireEvent/, 'function').replace('const e=pick(opts);', `const e='${e}';`));
    ev('__fe()');
    ev('dayTick()');
  }
  for (let d = 0; d < 60; d++) ev('dayTick()');
  assert.equal(ev('S.inc.filter(i=>i.until<=S.day).length'), 0, 'expired incidents are cleared');
  assert.deepEqual(errors, []);
});

test('every panel, tab and the dashboard render', () => {
  const { ev, errors } = load();
  ev("ACT.start({});S.cash=1e7;ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'cog',tier:1})");
  for (let d = 0; d < 20; d++) ev('dayTick()');
  for (const t of ['cust', 'up', 'peer', 'links']) {
    ev(`selectCity('fra');ACT.tab({t:'${t}'})`);
    assert.ok(ev("document.getElementById('panelBody').textContent.length") > 50);
  }
  ev("selectCity('sha')");
  for (const t of ['goals', 'deals', 'noc', 'nets']) ev(`ACT.leftTab({t:'${t}'})`);
  ev('ACT.dash({})');
  assert.ok(ev("document.querySelectorAll('#dashCard svg').length") >= 1);
  ev('showHelp()');
  assert.deepEqual(errors, []);
});

test('saves never resurrect a bankrupt game', () => {
  const { ev } = load();
  ev("ACT.start({});S.day=9;S.cash=-2e5;dayTick()");
  assert.equal(ev('S.lost'), true);
  assert.equal(ev('loadSave()'), null);
});
