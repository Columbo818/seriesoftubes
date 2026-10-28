const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

test('Glowball Sakura Lager is a Tier 2 that is everywhere on the map but China and Russia', () => {
  const { ev, errors } = load();
  assert.equal(ev("NET.gsl.name"), 'Glowball Sakura Lager');
  assert.equal(ev("NET.gsl.type"), 't2');
  assert.equal(ev("NET.gsl.pol"), 'open');
  assert.equal(ev("ALLC.filter(c=>c!=='pcn').every(c=>NET.gsl.pops.includes(c))"), true, 'a PoP in every city the big content networks reach');
  assert.equal(ev("NET.gsl.pops.includes('pcn')"), false, 'Pitcairn has no provider but you (#124)');
  assert.equal(ev("NET.gsl.pops.some(c=>CITY[c].cn||CITY[c].ru)"), false);
  assert.equal(ev("t1Need().some(n=>n.id==='gsl')"), false, 'not a Tier 1, so no Tier 1 club PNI is needed for it');
  assert.equal(ev("NET.gsl.up.every(u=>NET[u].type==='t1')"), true, 'it buys its own transit from Tier 1s');
  assert.equal(ev("PNI_NETS.lvl.includes('gsl')"), true, 'a PNI with an upstream reaches it');
  assert.equal(ev("NETS.filter(n=>n.asn===NET.gsl.asn).length"), 1);
  assert.equal(ev("initials(NET.gsl)"), 'GSL');
  assert.deepEqual(errors, []);
});

test('it sells transit in every city, Australia included, and sits on the exchanges', () => {
  const { ev, errors } = load();
  ev("ACT.start({})");
  assert.equal(ev("ALLC.filter(c=>c!=='pcn').every(c=>sellsAt(NET.gsl,c))"), true);
  assert.equal(ev("sellsAt(NET.gsl,'ivc')&&sellsAt(NET.gsl,'prr')"), true, 'the small towns nobody else sells transit in');
  assert.equal(ev("CITIES.filter(c=>c.au).every(c=>sellsAt(NET.gsl,c.id))"), true, 'every Australian city');
  assert.equal(ev("ixMembers('fra').includes('gsl')&&ixMembers('lon').includes('gsl')"), true);
  assert.equal(ev("ixMembers('syd').includes('gsl')"), true, 'Australian exchanges follow auIx');
  assert.equal(ev("ixMembers('adl').includes('gsl')"), false);
  assert.deepEqual(errors, []);
});

test('in Australia it is dear, like everything there, but cheaper than Telstraya', () => {
  const { ev, errors } = load();
  const per = (net, c) => ev(`NET.${net}.price*regionMult('${c}')`);
  assert.ok(per('gsl', 'syd') > per('gsl', 'fra'), 'dearer at home in Sydney than in Frankfurt');
  assert.ok(per('gsl', 'syd') < per('tsy', 'syd'), 'but cheaper than Telstraya');
  ev("ACT.start({});S.cash=1e8;ACT.buildPop({city:'syd'});ACT.buyTransit({city:'syd',net:'gsl',tier:1});compute()");
  assert.equal(ev("S.transit.filter(t=>t.net==='gsl'&&t.city==='syd').length"), 1, 'the order went through');
  assert.deepEqual(errors, []);
});

test('buying transit from it reaches the whole internet', () => {
  const { ev, errors } = load();
  ev("ACT.start({});S.cash=1e8;ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'gsl',tier:1});compute()");
  assert.equal(ev("S.transit.length"), 1);
  assert.ok(ev("R.reach") > 0.999, 'transit reaches every network');
  assert.ok(ev("R.served") > 0);
  assert.ok(ev("Object.values(R.useT).reduce((a,b)=>a+b,0)") > 0);
  assert.deepEqual(errors, []);
});

test('it takes a PNI and open peering at an exchange, and carries its own traffic over them', () => {
  const { ev, errors } = load();
  ev("ACT.start({});S.cash=1e8;ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'cog',tier:1});S.pops.fra.bb.d=400");
  assert.equal(ev("peerOk('gsl','pni','fra').ok"), true);
  assert.equal(ev("peerOk('gsl','ix','fra').ok"), true);
  ev("ACT.pni({city:'fra',net:'gsl',tier:1});for(const p of S.pni)p.ready=0;compute()");
  assert.equal(ev("S.pni.length"), 1, 'the PNI order went through');
  assert.ok(ev("R.netEg.gsl.p") > 0, 'traffic for it goes over the PNI');
  ev("S.pni=[];ACT.buyIx({city:'fra',tier:1,signed:true});ACT.rs({city:'fra'});compute()");
  assert.equal(ev("ixSessions('fra').has('gsl')"), true, 'the route server session comes up by itself');
  assert.ok(ev("R.netEg.gsl.ix") > 0, 'traffic for it goes over the exchange');
  assert.deepEqual(errors, []);
});

test('networks on every continent buy their transit from it, so a PNI with it reaches them', () => {
  const { ev, errors } = load();
  // Each downstream's home continent is where most of its PoPs are.
  const home = JSON.parse(ev(`JSON.stringify(PNI_NETS.gsl.slice(1).map(id=>{const c={};for(const p of NET[id].pops){const r=CITY[p].reg;c[r]=(c[r]||0)+1;}return Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0];}))`));
  for (const r of ['AF', 'AM', 'AS', 'EU', 'OC', 'SA']) assert.ok(home.filter((x) => x === r).length >= 3, `${r} has at least three downstreams`);
  assert.equal(ev("PNI_NETS.gsl.slice(1).every(id=>NET[id].up.includes('gsl')&&new Set(NET[id].up).size===NET[id].up.length)"), true);
  assert.equal(ev("PNI_NETS.gsl.some(id=>NET[id].type==='t1'||NET[id].cn)"), false);
  assert.equal(ev("PNI_NETS.gsl.slice(1).some(id=>merged(id)||MERGERS.some(m=>m.id===id))"), false, 'none of them is about to be bought');
  // Their own upstreams still reach them: nothing was replaced, only added.
  assert.equal(ev("NET.pes.up.join()"), 'cog,lvl,gsl');
  // One PNI with it carries a downstream's traffic as well as its own (a 100G port: 25 networks share it).
  ev("ACT.start({});S.cash=1e8;ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'cog',tier:1});S.pops.fra.bb.d=400;ACT.pni({city:'fra',net:'gsl',tier:1});for(const p of S.pni)p.ready=0;compute()");
  assert.ok(ev("(R.netEg.pes||{}).p") > 0, 'Pessimum is reached over the PNI with its upstream');
  assert.ok(ev("(R.netEg.abb||{}).p") > 0, 'so is Aussie Boyband');
  ev("S.pni=[];compute()");
  assert.equal(ev("(R.netEg.pes||{}).p||0"), 0, 'and not without it');
  assert.deepEqual(errors, []);
});

test('a game saved before it existed gets the courtesy route to it', () => {
  const a = load();
  a.ev("ACT.start({});S.day=40;S.seen=S.seen.filter(x=>x!=='gsl');save(true)");
  const b = load({ storage: { 'sot-save-v1': a.ev("localStorage.getItem('sot-save-v1')") } });
  assert.equal(b.ev("S.grace.nets.includes('gsl')"), true);
  assert.equal(b.ev("S.seen.includes('gsl')"), true);
  assert.equal(b.ev("R.reachable.gsl"), true, 'reachable through the courtesy route until you find your own way');
  assert.deepEqual(a.errors, []);
  assert.deepEqual(b.errors, []);
});

test('the city panel offers it as a transit provider, on a desktop and a phone', () => {
  for (const w of [1280, 360]) {
    const { ev, dom, errors } = load();
    ev(`window.innerWidth=${w};ACT.start({});if(UI.pendGame)ACT.pitchSkip();S.cash=1e8;UI.sel={type:'city',id:'fra'};UI.tab='up';renderPanel()`);
    assert.match(dom.window.document.getElementById('panelBody').textContent, /Glowball Sakura Lager/, `${w}px`);
    assert.deepEqual(errors, []);
  }
});
